import { Poll, IPollDocument } from '../models/Poll';
import { CreatePollPayload, PollResults, PollResultOption, PollHistoryItem, ChatMessage, ChatMessagePayload } from '../types';
import crypto from 'crypto';

class PollService {
    // In-memory state for resilience when DB is down
    private activePoll: IPollDocument | null = null;
    private pollTimer: NodeJS.Timeout | null = null;
    private onPollEnd: ((results: PollResults) => void) | null = null;
    private chatMessages: ChatMessage[] = [];

    setOnPollEnd(callback: (results: PollResults) => void): void {
        this.onPollEnd = callback;
    }

    async createPoll(data: CreatePollPayload): Promise<{ success: boolean; poll?: PollResults; error?: string }> {
        // Check if there's already an active poll
        if (this.activePoll && this.activePoll.isActive) {
            return { success: false, error: 'A poll is already active. Wait for it to end or end it manually.' };
        }

        try {
            const poll = new Poll({
                question: data.question,
                options: data.options.map((opt) => ({
                    text: opt.text,
                    votes: 0,
                    isCorrect: opt.isCorrect,
                })),
                timerDuration: Math.min(data.timerDuration, 60),
                startedAt: new Date(),
                isActive: true,
                voters: [],
            });

            try {
                await poll.save();
            } catch (dbError) {
                console.warn('⚠️  Failed to save poll to DB, continuing in-memory:', dbError);
            }

            this.activePoll = poll;
            this.startTimer(poll);

            return { success: true, poll: this.formatResults(poll) };
        } catch (error) {
            return { success: false, error: 'Failed to create poll' };
        }
    }

    async submitVote(tabId: string, optionIndex: number): Promise<{ success: boolean; results?: PollResults; error?: string }> {
        if (!this.activePoll || !this.activePoll.isActive) {
            return { success: false, error: 'No active poll to vote on.' };
        }

        if (optionIndex < 0 || optionIndex >= this.activePoll.options.length) {
            return { success: false, error: 'Invalid option selected.' };
        }

        // Race condition guard: check if already voted
        const alreadyVoted = this.activePoll.voters.some((v) => v.tabId === tabId);
        if (alreadyVoted) {
            return { success: false, error: 'You have already voted on this question.' };
        }

        // Add voter and increment vote count
        this.activePoll.voters.push({ tabId, optionIndex });
        this.activePoll.options[optionIndex].votes += 1;

        // Try atomic DB update
        try {
            await Poll.findByIdAndUpdate(this.activePoll._id, {
                $push: { voters: { tabId, optionIndex } },
                $inc: { [`options.${optionIndex}.votes`]: 1 },
            });
        } catch (dbError) {
            console.warn('⚠️  Failed to save vote to DB:', dbError);
        }

        const results = this.formatResults(this.activePoll);
        return { success: true, results };
    }

    getResults(): PollResults | null {
        if (!this.activePoll) return null;
        return this.formatResults(this.activePoll);
    }

    async getCurrentState(tabId?: string): Promise<{
        currentPoll: PollResults | null;
        hasVoted: boolean;
        votedOption?: number;
        chatMessages: ChatMessage[];
    }> {
        if (!this.activePoll) {
            // Try to recover from DB
            try {
                const dbPoll = await Poll.findOne({ isActive: true }).sort({ createdAt: -1 });
                if (dbPoll) {
                    this.activePoll = dbPoll;
                    // Restart timer with remaining time
                    const elapsed = (Date.now() - dbPoll.startedAt.getTime()) / 1000;
                    const remaining = dbPoll.timerDuration - elapsed;
                    if (remaining > 0) {
                        this.startTimer(dbPoll, remaining);
                    } else {
                        await this.endPoll();
                    }
                }
            } catch (dbError) {
                console.warn('⚠️  Failed to recover poll from DB:', dbError);
            }
        }

        if (!this.activePoll) {
            return { currentPoll: null, hasVoted: false, chatMessages: this.chatMessages };
        }

        const hasVoted = tabId ? this.activePoll.voters.some((v) => v.tabId === tabId) : false;
        const votedOption = tabId
            ? this.activePoll.voters.find((v) => v.tabId === tabId)?.optionIndex
            : undefined;

        return {
            currentPoll: this.formatResults(this.activePoll),
            hasVoted,
            votedOption,
            chatMessages: this.chatMessages,
        };
    }

    addChatMessage(payload: ChatMessagePayload): ChatMessage {
        const message: ChatMessage = {
            id: crypto.randomUUID(),
            senderName: payload.senderName,
            senderRole: payload.senderRole,
            text: payload.text,
            timestamp: new Date(),
        };
        this.chatMessages.push(message);

        // Keep history bounded to last 200 messages to prevent memory leak
        if (this.chatMessages.length > 200) {
            this.chatMessages.shift();
        }

        return message;
    }

    getChatHistory(): ChatMessage[] {
        return this.chatMessages;
    }

    async getPollHistory(): Promise<PollHistoryItem[]> {
        try {
            const polls = await Poll.find({ isActive: false })
                .sort({ createdAt: -1 })
                .limit(50)
                .lean();

            return polls.map((poll) => {
                const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
                return {
                    _id: (poll._id as any).toString(),
                    question: poll.question,
                    options: poll.options.map((opt) => ({
                        text: opt.text,
                        votes: opt.votes,
                        percentage: totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0,
                        isCorrect: opt.isCorrect,
                    })),
                    totalVotes,
                    timerDuration: poll.timerDuration,
                    createdAt: poll.createdAt,
                };
            });
        } catch (error) {
            console.warn('⚠️  Failed to fetch poll history from DB:', error);
            return [];
        }
    }

    async endPoll(): Promise<PollResults | null> {
        if (!this.activePoll) return null;

        this.activePoll.isActive = false;

        if (this.pollTimer) {
            clearTimeout(this.pollTimer);
            this.pollTimer = null;
        }

        try {
            await Poll.findByIdAndUpdate(this.activePoll._id, { isActive: false });
        } catch (dbError) {
            console.warn('⚠️  Failed to update poll status in DB:', dbError);
        }

        const results = this.formatResults(this.activePoll);
        this.activePoll = null;
        return results;
    }

    hasActivePool(): boolean {
        return this.activePoll !== null && this.activePoll.isActive;
    }

    private startTimer(poll: IPollDocument, remainingSeconds?: number): void {
        if (this.pollTimer) {
            clearTimeout(this.pollTimer);
        }

        const duration = remainingSeconds ?? poll.timerDuration;
        const ms = duration * 1000;

        this.pollTimer = setTimeout(async () => {
            const results = await this.endPoll();
            if (results && this.onPollEnd) {
                this.onPollEnd(results);
            }
        }, ms);
    }

    private formatResults(poll: IPollDocument): PollResults {
        const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
        const elapsed = (Date.now() - poll.startedAt.getTime()) / 1000;
        const remainingTime = Math.max(0, poll.timerDuration - elapsed);

        return {
            question: poll.question,
            options: poll.options.map((opt) => ({
                text: opt.text,
                votes: opt.votes,
                percentage: totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0,
                isCorrect: opt.isCorrect,
            })),
            totalVotes,
            isActive: poll.isActive,
            remainingTime: Math.floor(remainingTime),
        };
    }
}

export const pollService = new PollService();
