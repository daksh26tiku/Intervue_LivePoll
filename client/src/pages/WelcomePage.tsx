import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import type { UserRole } from '../types';

const WelcomePage: React.FC = () => {
    const [selectedRole, setSelectedRole] = useState<UserRole>(null);
    const { setRole } = useAppContext();
    const navigate = useNavigate();

    const handleContinue = () => {
        if (!selectedRole) return;
        setRole(selectedRole);
        if (selectedRole === 'student') {
            navigate('/student/name');
        } else {
            navigate('/teacher/create');
        }
    };

    return (
        <div className="page-container">
            <div className="content-center">
                <div className="nav-badge">✦ Intervue Poll</div>
                <h1 className="heading-xl" style={{ marginBottom: '8px' }}>
                    Welcome to the <strong>Live Polling System</strong>
                </h1>
                <p
                    className="subtitle"
                    style={{ marginBottom: '32px', maxWidth: '500px' }}
                >
                    Please select the role that best describes you to begin using the
                    live polling system
                </p>

                <div className="role-cards">
                    <div
                        className={`role-card ${selectedRole === 'student' ? 'role-card--selected' : ''}`}
                        onClick={() => setSelectedRole('student')}
                    >
                        <h3>I'm a Student</h3>
                        <p>
                            Join the live poll and start answering questions!
                        </p>
                    </div>

                    <div
                        className={`role-card ${selectedRole === 'teacher' ? 'role-card--selected' : ''}`}
                        onClick={() => setSelectedRole('teacher')}
                    >
                        <h3>I'm a Teacher</h3>
                        <p>
                            Ask questions and view live poll results in real-time.
                        </p>
                    </div>
                </div>

                <button
                    className="btn btn--primary"
                    onClick={handleContinue}
                    disabled={!selectedRole}
                    style={{ minWidth: '200px' }}
                >
                    Continue
                </button>
            </div>
        </div>
    );
};

export default WelcomePage;
