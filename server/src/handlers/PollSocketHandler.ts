import { Server, Socket } from 'socket.io';
import { pollService } from '../services/PollService';
import { studentService } from '../services/StudentService';
import { CreatePollPayload, JoinPayload, VotePayload, KickPayload, ChatMessagePayload } from '../types';

export const setupPollSocketHandler = (io: Server): void => {
    // Set up poll end callback to broadcast to all clients
    pollService.setOnPollEnd((results) => {
        io.emit('poll:ended', results);
    });

    io.on('connection', (socket: Socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);

        // ─── Teacher Join ────────────────────────────────────
        socket.on('teacher:join', async (payload: JoinPayload) => {
            socket.join('teachers');
            console.log(`👨‍🏫 Teacher joined: ${socket.id}`);

            const state = await pollService.getCurrentState();
            const students = studentService.getActiveStudents();

            socket.emit('poll:state', {
                currentPoll: state.currentPoll,
                students,
                hasVoted: false,
                chatMessages: state.chatMessages,
            });
        });

        // ─── Student Join ────────────────────────────────────
        socket.on('student:join', async (payload: JoinPayload) => {
            if (!payload.name || !payload.tabId) {
                socket.emit('error', { message: 'Name and tabId are required.' });
                return;
            }

            socket.join('students');
            await studentService.registerStudent(payload.name, payload.tabId, socket.id);
            console.log(`🎓 Student joined: ${payload.name} (${payload.tabId})`);

            // Send current poll state to the joining student
            const state = await pollService.getCurrentState(payload.tabId);
            socket.emit('poll:state', {
                currentPoll: state.currentPoll,
                students: studentService.getActiveStudents(),
                hasVoted: state.hasVoted,
                votedOption: state.votedOption,
                chatMessages: state.chatMessages,
            });

            // Notify ALL clients about new student
            io.emit('student:joined', {
                students: studentService.getActiveStudents(),
            });
        });

        // ─── Create Poll ─────────────────────────────────────
        socket.on('poll:create', async (payload: CreatePollPayload) => {
            console.log(`📊 Creating poll: ${payload.question}`);

            const result = await pollService.createPoll(payload);

            if (!result.success) {
                socket.emit('error', { message: result.error });
                return;
            }

            // Broadcast new poll to ALL connected clients
            io.emit('poll:new', result.poll);
        });

        // ─── Vote ────────────────────────────────────────────
        socket.on('poll:vote', async (payload: VotePayload) => {
            console.log(`🗳️  Vote from ${payload.tabId}: option ${payload.optionIndex}`);

            const result = await pollService.submitVote(payload.tabId, payload.optionIndex);

            if (!result.success) {
                socket.emit('error', { message: result.error });
                return;
            }

            // Broadcast updated results to ALL clients
            io.emit('poll:results', result.results);
        });

        // ─── Kick Student ────────────────────────────────────
        socket.on('poll:kick', async (payload: KickPayload) => {
            console.log(`🚫 Kicking student: ${payload.tabId}`);

            const kicked = await studentService.kickStudent(payload.tabId);
            if (kicked) {
                // Find the socket of the kicked student and notify them
                const kickedSocket = io.sockets.sockets.get(kicked.socketId);
                if (kickedSocket) {
                    kickedSocket.emit('student:kicked', { message: 'You have been kicked from the session.' });
                    kickedSocket.leave('students');
                }

                // Notify ALL clients about updated student list
                io.emit('student:joined', {
                    students: studentService.getActiveStudents(),
                });
            }
        });

        // ─── Chat Message ────────────────────────────────────
        socket.on('chat:message', (payload: ChatMessagePayload) => {
            console.log(`💬 Chat from ${payload.senderName}: ${payload.text}`);
            const message = pollService.addChatMessage(payload);
            io.emit('chat:message', message);
        });

        // ─── Reconnection / State Recovery ───────────────────
        socket.on('poll:getState', async (payload: { tabId?: string; role: string }) => {
            const state = await pollService.getCurrentState(payload.tabId);
            const students = studentService.getActiveStudents();

            // If student is reconnecting, update their socket ID
            if (payload.role === 'student' && payload.tabId) {
                await studentService.updateSocketId(payload.tabId, socket.id);
                socket.join('students');
            } else if (payload.role === 'teacher') {
                socket.join('teachers');
            }

            socket.emit('poll:state', {
                currentPoll: state.currentPoll,
                students,
                hasVoted: state.hasVoted,
                votedOption: state.votedOption,
                chatMessages: state.chatMessages,
            });
        });

        // ─── Disconnect ──────────────────────────────────────
        socket.on('disconnect', () => {
            console.log(`❌ Client disconnected: ${socket.id}`);
            const student = studentService.getStudentBySocketId(socket.id);
            if (student) {
                studentService.removeBySocketId(socket.id);
                // Notify ALL clients about updated participant list
                io.emit('student:joined', {
                    students: studentService.getActiveStudents(),
                });
            }
        });
    });
};
