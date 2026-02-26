import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const KickedPage: React.FC = () => {
    const { resetState } = useAppContext();
    const navigate = useNavigate();

    const handleGoHome = () => {
        resetState();
        navigate('/');
    };

    return (
        <div className="page-container">
            <div className="content-center">
                <div className="nav-badge">✦ Intervue Poll</div>
                <h1 className="heading-lg" style={{ marginBottom: '12px', marginTop: '16px' }}>
                    You've been Kicked out !
                </h1>
                <p className="subtitle" style={{ marginBottom: '32px', maxWidth: '400px', lineHeight: 1.6 }}>
                    Looks like the teacher had removed you from the poll system .Please Try again sometime.
                </p>
                <button className="btn btn--primary" onClick={handleGoHome}>
                    Return to Home
                </button>
            </div>
        </div>
    );
};

export default KickedPage;
