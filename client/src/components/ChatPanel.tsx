import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

export const ChatPanel: React.FC = () => {
    const { role, students, chatMessages, socket, studentName, tabId } = useAppContext();
    const [chatOpen, setChatOpen] = useState(false);
    const [chatTab, setChatTab] = useState<'chat' | 'participants'>(
        role === 'teacher' ? 'participants' : 'chat'
    );
    const [newMessage, setNewMessage] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll chat to bottom
    useEffect(() => {
        if (chatOpen && chatTab === 'chat') {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages, chatOpen, chatTab]);

    const handleKick = (targetTabId: string) => {
        if (socket && role === 'teacher') {
            socket.emit('poll:kick', { tabId: targetTabId });
        }
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        socket.emit('chat:message', {
            text: newMessage.trim(),
            senderName: role === 'teacher' ? 'Teacher' : studentName,
            senderRole: role,
        });
        setNewMessage('');
    };

    return (
        <>
            {/* ── Floating chat button ─────────────────────────── */}
            <button
                className="td-chat-fab"
                onClick={() => setChatOpen((o) => !o)}
                aria-label="Open chat"
            >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
            </button>

            {/* ── Chat / Participants panel ────────────────────── */}
            {chatOpen && (
                <div className="td-chat-panel">
                    {/* Panel tabs */}
                    <div className="td-panel-tabs">
                        <button
                            className={`td-panel-tab ${chatTab === 'chat' ? 'td-panel-tab--active' : ''}`}
                            onClick={() => setChatTab('chat')}
                        >
                            Chat
                        </button>
                        <button
                            className={`td-panel-tab ${chatTab === 'participants' ? 'td-panel-tab--active' : ''}`}
                            onClick={() => setChatTab('participants')}
                        >
                            Participants
                        </button>
                    </div>

                    {/* Panel body */}
                    {chatTab === 'chat' ? (
                        <div className="td-panel-body" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
                            <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {chatMessages.length === 0 ? (
                                    <p className="subtitle" style={{ textAlign: 'center', marginTop: 'auto', marginBottom: 'auto' }}>No messages yet.</p>
                                ) : (
                                    chatMessages.map((msg) => {
                                        const isMe = msg.senderName === (role === 'teacher' ? 'Teacher' : studentName);
                                        return (
                                            <div key={msg.id} className={`chat-message-wrapper ${isMe ? 'chat-message-wrapper--me' : ''}`}>
                                                {!isMe && <span className="chat-message-sender">{msg.senderName}</span>}
                                                <div className={`chat-bubble ${isMe ? 'chat-bubble--me' : 'chat-bubble--other'}`}>
                                                    {msg.text}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={chatEndRef} />
                            </div>
                            <form onSubmit={handleSendMessage} className="chat-input-form" style={{ padding: '12px', borderTop: '1px solid #EEE', display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    style={{ flex: 1, margin: 0, padding: '8px 12px' }}
                                />
                                <button type="submit" className="btn btn--primary" style={{ padding: '8px 16px', minWidth: 'unset' }} disabled={!newMessage.trim()}>
                                    Send
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="td-panel-body">
                            {/* Header row */}
                            <div className="td-participants-header">
                                <span>Name</span>
                                {role === 'teacher' && <span>Action</span>}
                            </div>
                            {students.length === 0 ? (
                                <p className="subtitle" style={{ padding: '24px 0', textAlign: 'center' }}>
                                    Waiting for students to join...
                                </p>
                            ) : (
                                <ul className="td-participants-list">
                                    {students.map((student) => (
                                        <li key={student.tabId} className="td-participant-row">
                                            <span className="td-participant-name">{student.name} {student.tabId === tabId ? '(You)' : ''}</span>
                                            {role === 'teacher' && (
                                                <button
                                                    className="td-kick-btn"
                                                    onClick={() => handleKick(student.tabId)}
                                                >
                                                    Kick out
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            )}
        </>
    );
};
