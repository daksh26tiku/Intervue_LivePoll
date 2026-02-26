import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { usePollTimer } from '../../hooks/usePollTimer';
import { ChatPanel } from '../../components/ChatPanel';
import { TimerIcon } from '../../components/TimerIcon';

const StudentPollPage: React.FC = () => {
    const { currentPoll, socket, tabId, hasVoted, kicked } = useAppContext();
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

    const { formatted, isExpired } = usePollTimer({
        remainingTime: currentPoll?.remainingTime ?? 0,
        isActive: currentPoll?.isActive ?? false,
    });

    // Redirect if kicked
    useEffect(() => {
        if (kicked) navigate('/student/kicked');
    }, [kicked, navigate]);

    // Redirect to results when poll ends (with delay so students see correct/incorrect)
    useEffect(() => {
        if (currentPoll && !currentPoll.isActive) {
            const timer = setTimeout(() => {
                navigate('/student/results');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [currentPoll, navigate]);

    // If timer expires before voting
    useEffect(() => {
        if (isExpired && currentPoll?.isActive && !hasVoted && !submitted) {
            navigate('/student/results');
        }
    }, [isExpired, currentPoll, hasVoted, submitted, navigate]);

    // No poll → go to waiting
    useEffect(() => {
        if (!currentPoll) {
            navigate('/student/wait');
        }
    }, [currentPoll, navigate]);

    const handleSubmit = () => {
        if (selectedOption === null || !currentPoll?.isActive) return;

        socket?.emit('poll:vote', {
            tabId,
            optionIndex: selectedOption,
        });

        setSubmitted(true);
    };

    if (!currentPoll) return null;

    return (
        <div className="page-container">
            <div className="poll-container">
                {/* Header row: Question label + Timer */}
                <div className="poll-header">
                    <span className="poll-question-label">Question 1</span>
                    <span className="poll-timer">
                        <TimerIcon size={18} />
                        <span className="poll-timer-value">{formatted}</span>
                    </span>
                </div>

                {/* Single card that wraps question + options/results */}
                <div className="poll-options-card">
                    {/* Question banner */}
                    <div className="question-banner">
                        {currentPoll.question}
                    </div>

                    {(hasVoted || submitted) ? (
                        /* ── Live results view after voting ──────── */
                        currentPoll.options.map((option, index) => (
                            <div key={index} className={`result-row ${!currentPoll.isActive ? (option.isCorrect ? 'result-row--correct' : 'result-row--incorrect') : ''}`}>
                                <div className="result-row-bar">
                                    <div
                                        className="result-row-fill"
                                        style={{ width: `${option.percentage}%` }}
                                    />
                                    <div className="result-row-content">
                                        <span className="result-row-label">
                                            <span className={`option-number option-number--small ${option.percentage > 0 ? '' : 'option-number--muted'}`}>
                                                {index + 1}
                                            </span>
                                            <span>{option.text}</span>
                                        </span>
                                        <span className="result-row-pct">{option.percentage}%</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        /* ── Options to vote ──────────────────────── */
                        currentPoll.options.map((option, index) => (
                            <div
                                key={index}
                                className={`option-item ${selectedOption === index ? 'option-item--selected' : ''}`}
                                onClick={() => setSelectedOption(index)}
                            >
                                <span className={`option-number ${selectedOption === index ? 'option-number--selected' : 'option-number--muted'}`}>
                                    {index + 1}
                                </span>
                                <span className="option-text">{option.text}</span>
                            </div>
                        ))
                    )}
                </div>

                {/* Submit button or waiting message */}
                {(hasVoted || submitted) ? (
                    <p className="subtitle" style={{ textAlign: 'center' }}>
                        Waiting for others to vote...
                    </p>
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button
                            className="btn btn--primary"
                            onClick={handleSubmit}
                            disabled={selectedOption === null}
                            style={{ minWidth: '200px' }}
                        >
                            Submit
                        </button>
                    </div>
                )}
            </div>

            <ChatPanel />
        </div>
    );
};

export default StudentPollPage;
