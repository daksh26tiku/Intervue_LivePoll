import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { socketService } from '../services/socket';
import type { AppState, UserRole, PollResults, StudentInfo, PollState } from '../types';
import type { Socket } from 'socket.io-client';

interface AppContextType extends AppState {
    setRole: (role: UserRole) => void;
    setStudentName: (name: string) => void;
    socket: Socket | null;
    resetState: () => void;
}

const initialState: AppState = {
    role: null,
    studentName: '',
    tabId: '',
    connected: false,
    currentPoll: null,
    students: [],
    hasVoted: false,
    votedOption: undefined,
    error: null,
    kicked: false,
    chatMessages: [],
};

const AppContext = createContext<AppContextType | null>(null);

// Generate or recover tab ID
const getTabId = (): string => {
    let tabId = sessionStorage.getItem('poll_tabId');
    if (!tabId) {
        tabId = `tab_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem('poll_tabId', tabId);
    }
    return tabId;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AppState>(() => {
        // Recover state from sessionStorage
        const saved = sessionStorage.getItem('poll_state');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return { ...initialState, ...parsed, tabId: getTabId(), connected: false, error: null };
            } catch {
                // ignore
            }
        }
        return { ...initialState, tabId: getTabId() };
    });

    const socketRef = useRef<Socket | null>(null);

    // Persist state to sessionStorage
    useEffect(() => {
        const { role, studentName, hasVoted, votedOption, kicked } = state;
        sessionStorage.setItem(
            'poll_state',
            JSON.stringify({ role, studentName, hasVoted, votedOption, kicked })
        );
    }, [state.role, state.studentName, state.hasVoted, state.votedOption, state.kicked]);

    // Socket lifecycle
    useEffect(() => {
        const socket = socketService.connect();
        socketRef.current = socket;

        socket.on('connect', () => {
            setState((prev) => ({ ...prev, connected: true }));

            // Request state recovery on reconnection
            if (state.role) {
                socket.emit('poll:getState', {
                    tabId: state.tabId,
                    role: state.role,
                });
            }
        });

        socket.on('disconnect', () => {
            setState((prev) => ({ ...prev, connected: false }));
        });

        // ─── Listen for socket events ────────────────────
        socket.on('poll:state', (data: PollState) => {
            setState((prev) => ({
                ...prev,
                currentPoll: data.currentPoll,
                students: data.students || [],
                hasVoted: data.hasVoted || false,
                votedOption: data.votedOption,
                chatMessages: data.chatMessages || [],
            }));
        });

        socket.on('chat:message', (message) => {
            setState((prev) => ({
                ...prev,
                chatMessages: [...prev.chatMessages, message],
            }));
        });

        socket.on('poll:new', (poll: PollResults) => {
            setState((prev) => ({
                ...prev,
                currentPoll: poll,
                hasVoted: false,
                votedOption: undefined,
            }));
        });

        socket.on('poll:results', (results: PollResults) => {
            setState((prev) => ({
                ...prev,
                currentPoll: results,
            }));
        });

        socket.on('poll:ended', (results: PollResults) => {
            setState((prev) => ({
                ...prev,
                currentPoll: { ...results, isActive: false },
            }));
        });

        socket.on('student:joined', (data: { students: StudentInfo[] }) => {
            setState((prev) => ({
                ...prev,
                students: data.students,
            }));
        });

        socket.on('student:kicked', () => {
            setState((prev) => ({
                ...prev,
                kicked: true,
                currentPoll: null,
            }));
        });

        socket.on('error', (data: { message: string }) => {
            setState((prev) => ({ ...prev, error: data.message }));
            setTimeout(() => {
                setState((prev) => ({ ...prev, error: null }));
            }, 4000);
        });

        return () => {
            socket.removeAllListeners();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const setRole = useCallback((role: UserRole) => {
        setState((prev) => ({ ...prev, role }));
    }, []);

    const setStudentName = useCallback((name: string) => {
        setState((prev) => ({ ...prev, studentName: name }));
    }, []);

    const resetState = useCallback(() => {
        sessionStorage.removeItem('poll_state');
        sessionStorage.removeItem('poll_tabId');
        setState({ ...initialState, tabId: getTabId() });
    }, []);

    return (
        <AppContext.Provider
            value={{
                ...state,
                setRole,
                setStudentName,
                socket: socketRef.current,
                resetState,
            }}
        >
            {children}
            {state.error && <div className="toast toast--error">{state.error}</div>}
        </AppContext.Provider>
    );
};

export const useAppContext = (): AppContextType => {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useAppContext must be used inside AppProvider');
    return ctx;
};
