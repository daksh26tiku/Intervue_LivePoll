import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import type { CreatePollPayload } from '../../types';

const CreatePollPage: React.FC = () => {
    const { socket, tabId, currentPoll } = useAppContext();
    const navigate = useNavigate();

    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState([
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
    ]);
    const [timerDuration, setTimerDuration] = useState(60);

    // Join as teacher on mount
    useEffect(() => {
        socket?.emit('teacher:join', { tabId, role: 'teacher' });
    }, [socket, tabId]);

    // Redirect to dashboard when active poll exists
    useEffect(() => {
        if (currentPoll && currentPoll.isActive) {
            navigate('/teacher/dashboard');
        }
    }, [currentPoll, navigate]);

    const handleOptionChange = (index: number, text: string) => {
        const updated = [...options];
        updated[index] = { ...updated[index], text };
        setOptions(updated);
    };

    const handleCorrectChange = (index: number, isCorrect: boolean) => {
        const updated = [...options];
        updated[index] = { ...updated[index], isCorrect };
        setOptions(updated);
    };

    const addOption = () => {
        if (options.length < 6) {
            setOptions([...options, { text: '', isCorrect: false }]);
        }
    };

    const handleSubmit = () => {
        const filledOptions = options.filter((opt) => opt.text.trim());
        if (!question.trim() || filledOptions.length < 2) return;

        const payload: CreatePollPayload = {
            question: question.trim(),
            options: filledOptions,
            timerDuration,
        };

        socket?.emit('poll:create', payload);
    };

    const canSubmit = question.trim() && options.filter((opt) => opt.text.trim()).length >= 2;

    return (
        <div className="create-poll-page">
            {/* Header */}
            <div className="create-poll-header">
                <div className="nav-badge">✦ Intervue Poll</div>
                <h1 className="heading-lg" style={{ marginBottom: '4px' }}>
                    Let's <strong>Get Started</strong>
                </h1>
                <p className="subtitle">
                    you'll have the ability to create and manage polls, ask questions, and monitor
                    your students' responses in real-time.
                </p>
            </div>

            {/* Form Body */}
            <div className="create-poll-body">
                {/* Question + Timer row */}
                <div className="create-poll-question-row">
                    <div style={{ flex: 1 }}>
                        <label className="create-poll-label">Enter your question</label>
                        <textarea
                            className="input-field input-field--flat create-poll-textarea"
                            placeholder="Rahul Bajaj"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            maxLength={100}
                        />
                        <div className="char-counter">{question.length}/100</div>
                    </div>
                    <div className="create-poll-timer-group">
                        <select
                            className="create-poll-timer-select"
                            value={timerDuration}
                            onChange={(e) => setTimerDuration(Number(e.target.value))}
                        >
                            <option value={15}>15 seconds</option>
                            <option value={30}>30 seconds</option>
                            <option value={45}>45 seconds</option>
                            <option value={60}>60 seconds</option>
                        </select>
                    </div>
                </div>

                {/* Options */}
                <div>
                    <div className="create-poll-options-header">
                        <span className="create-poll-label" style={{ margin: 0 }}>Edit Options</span>
                        <span className="create-poll-label" style={{ margin: 0, marginRight: '72px' }}>Is it Correct?</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {options.map((opt, index) => (
                            <div key={index} className="create-poll-option-row">
                                <span className="option-number" style={{ width: '28px', height: '28px', fontSize: '12px', flexShrink: 0 }}>
                                    {index + 1}
                                </span>
                                <input
                                    type="text"
                                    className="input-field input-field--flat"
                                    placeholder={`Option ${index + 1}`}
                                    value={opt.text}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    style={{ flex: 1 }}
                                />
                                <div className="correct-toggle">
                                    <label>
                                        <input
                                            type="radio"
                                            name={`correct-${index}`}
                                            checked={opt.isCorrect === true}
                                            onChange={() => handleCorrectChange(index, true)}
                                        />
                                        Yes
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name={`correct-${index}`}
                                            checked={opt.isCorrect === false}
                                            onChange={() => handleCorrectChange(index, false)}
                                        />
                                        No
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>

                    {options.length < 6 && (
                        <button className="add-option-btn add-option-btn--outlined" onClick={addOption} style={{ marginTop: '12px' }}>
                            + Add More option
                        </button>
                    )}
                </div>
            </div>

            {/* Fixed bottom bar */}
            <div className="create-poll-footer">
                <button
                    className="btn btn--primary"
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                >
                    Ask Question
                </button>
            </div>
        </div>
    );
};

export default CreatePollPage;
