import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { ChatPanel } from '../../components/ChatPanel';

const StudentWaitPage: React.FC = () => {
    const { currentPoll, kicked } = useAppContext();
    const navigate = useNavigate();

    // Redirect if kicked
    useEffect(() => {
        if (kicked) {
            navigate('/student/kicked');
        }
    }, [kicked, navigate]);

    // Redirect when poll becomes active
    useEffect(() => {
        if (currentPoll && currentPoll.isActive) {
            navigate('/student/poll');
        } else if (currentPoll && !currentPoll.isActive) {
            navigate('/student/results');
        }
    }, [currentPoll, navigate]);

    return (
        <div className="page-container">
            <div className="content-center">
                <div className="nav-badge">✦ Intervue Poll</div>
                <div className="spinner" style={{ marginBottom: '24px' }} />
                <p className="heading-md">
                    Wait for the teacher to ask questions..
                </p>
            </div>

            <ChatPanel />
        </div>
    );
};

export default StudentWaitPage;
