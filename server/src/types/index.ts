export interface PollOption {
    text: string;
    votes: number;
    isCorrect: boolean;
}

export interface Voter {
    tabId: string;
    optionIndex: number;
}

export interface IPollData {
    question: string;
    options: PollOption[];
    timerDuration: number;
    startedAt: Date;
    isActive: boolean;
    voters: Voter[];
}

export interface IStudentData {
    name: string;
    tabId: string;
    socketId: string;
    isActive: boolean;
}

export interface ChatMessage {
    id: string;
    senderName: string;
    senderRole: 'student' | 'teacher';
    text: string;
    timestamp: Date;
}

// Socket event payloads
export interface CreatePollPayload {
    question: string;
    options: { text: string; isCorrect: boolean }[];
    timerDuration: number;
}

export interface VotePayload {
    tabId: string;
    optionIndex: number;
}

export interface JoinPayload {
    name?: string;
    tabId: string;
    role: 'student' | 'teacher';
}

export interface KickPayload {
    tabId: string;
}

export interface ChatMessagePayload {
    text: string;
    senderName: string;
    senderRole: 'student' | 'teacher';
}

export interface PollResultOption {
    text: string;
    votes: number;
    percentage: number;
    isCorrect: boolean;
}

export interface PollResults {
    question: string;
    options: PollResultOption[];
    totalVotes: number;
    isActive: boolean;
    remainingTime: number;
    startedAt: string;
    timerDuration: number;
}

export interface PollState {
    currentPoll: PollResults | null;
    students: { name: string; tabId: string }[];
    hasVoted?: boolean;
    chatMessages: ChatMessage[];
}

export interface PollHistoryItem {
    _id: string;
    question: string;
    options: PollResultOption[];
    totalVotes: number;
    timerDuration: number;
    createdAt: Date;
}
