// ─── Poll Types ──────────────────────────────────────

export interface PollOption {
    text: string;
    votes: number;
    percentage: number;
    isCorrect: boolean;
}

export interface PollResults {
    question: string;
    options: PollOption[];
    totalVotes: number;
    isActive: boolean;
    remainingTime: number;
}

export interface PollHistoryItem {
    _id: string;
    question: string;
    options: PollOption[];
    totalVotes: number;
    timerDuration: number;
    createdAt: string;
}

// ─── Chat Types ──────────────────────────────────────

export interface ChatMessage {
    id: string;
    senderName: string;
    senderRole: 'student' | 'teacher';
    text: string;
    timestamp: string;
}

// ─── Payloads ────────────────────────────────────────

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

// ─── State ───────────────────────────────────────────

export interface StudentInfo {
    name: string;
    tabId: string;
}

export interface PollState {
    currentPoll: PollResults | null;
    students: StudentInfo[];
    hasVoted: boolean;
    votedOption?: number;
    chatMessages: ChatMessage[];
}

export type UserRole = 'student' | 'teacher' | null;

export interface AppState {
    role: UserRole;
    studentName: string;
    tabId: string;
    connected: boolean;
    currentPoll: PollResults | null;
    students: StudentInfo[];
    hasVoted: boolean;
    votedOption?: number;
    error: string | null;
    kicked: boolean;
    chatMessages: ChatMessage[];
}
