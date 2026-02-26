import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const StudentNamePage: React.FC = () => {
    const [name, setName] = useState('');
    const { setStudentName, socket, tabId } = useAppContext();
    const navigate = useNavigate();

    const handleContinue = () => {
        const trimmed = name.trim();
        if (!trimmed) return;

        setStudentName(trimmed);

        // Join as student via socket
        socket?.emit('student:join', {
            name: trimmed,
            tabId,
            role: 'student',
        });

        navigate('/student/wait');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleContinue();
    };

    return (
        <div className="page-container">
            <div className="content-center" style={{ maxWidth: '560px', width: '100%' }}>
                <div className="nav-badge">✦ Intervue Poll</div>

                <h1 className="heading-xl" style={{ marginBottom: '8px' }}>
                    Let's <strong>Get Started</strong>
                </h1>
                <p className="subtitle" style={{ marginBottom: '32px' }}>
                    If you're a student, you'll be able to <strong>submit your answers</strong>, participate
                    in live polls, and see how your responses compare with your classmates
                </p>

                <div style={{ width: '100%', textAlign: 'left', marginBottom: '24px' }}>
                    <label
                        htmlFor="studentName"
                        style={{
                            display: 'block',
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-weight-semibold)' as any,
                            marginBottom: '8px',
                        }}
                    >
                        Enter your Name
                    </label>
                    <input
                        id="studentName"
                        type="text"
                        className="input-field input-field--flat"
                        placeholder="Rahul Bajaj"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                </div>

                <button
                    className="btn btn--primary"
                    onClick={handleContinue}
                    disabled={!name.trim()}
                    style={{ minWidth: '200px' }}
                >
                    Continue
                </button>
            </div>
        </div>
    );
};

export default StudentNamePage;
