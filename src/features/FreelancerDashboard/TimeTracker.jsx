import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ProofOfWorkModal } from './components/ProofOfWorkModal.jsx';
import { ICONS } from '../../assets/icons.jsx';

const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return [hours, minutes, secs].map(v => v.toString().padStart(2, '0')).join(':');
};

export const TimeTracker = ({ task, project }) => {
    const [timeRemaining, setTimeRemaining] = useState((project.projectHours - project.hoursSpent) * 3600);
    const [isActive, setIsActive] = useState(false);
    const [sessionTime, setSessionTime] = useState(0);
    const [showProofModal, setShowProofModal] = useState(false);

    useEffect(() => {
        let interval = null;
        if (isActive && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining(prev => prev - 1);
                setSessionTime(prev => prev + 1);
            }, 1000);
        } else if (!isActive && sessionTime !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, timeRemaining, sessionTime]);

    const handleStartPause = () => {
        if (timeRemaining <= 0) {
            alert("The project's allocated time has been used up.");
            return;
        }
        setIsActive(!isActive);
    };

    const handleStop = () => {
        setIsActive(false);
        if (sessionTime > 0) {
            setShowProofModal(true);
        }
    };

    const handleProofSubmit = async (file, comment) => {
        const hoursLogged = sessionTime / 3600;

        try {
            const token = localStorage.getItem('access_token');
            // First, create the time log to get an ID
            const timeLogResponse = await fetch('/api/timelogs/create.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    task_id: task.id,
                    project_id: project.id,
                    hours: hoursLogged.toFixed(2)
                })
            });
            const timeLogData = await timeLogResponse.json();

            if (!timeLogResponse.ok) {
                throw new Error(timeLogData.message || 'Failed to create time log.');
            }

            // Then, submit the proof of work with the new time log ID
            const formData = new FormData();
            formData.append('proof', file);
            formData.append('time_log_id', timeLogData.time_log_id); // Assuming the ID is returned
            formData.append('comment', comment);

            const proofResponse = await fetch('/api/projects/submit_work.php', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (proofResponse.ok) {
                alert('Time and proof of work submitted successfully!');
                setShowProofModal(false);
                setSessionTime(0);
                // You might want to refetch project data here to update hoursSpent
            } else {
                const proofData = await proofResponse.json();
                throw new Error(proofData.message || 'Failed to submit proof of work.');
            }
        } catch (err) {
            alert(`An error occurred: ${err.message}`);
        }
    };

    return (
        <>
            <div className="management-page">
                <div className="management-header">
                    <h1>Time Tracker</h1>
                </div>
                <div className="time-tracker-container" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', background: 'var(--white)', borderRadius: '0.75rem', border: '1px solid var(--gray-200)' }}>
                    <div className="tracker-info" style={{ textAlign: 'center' }}>
                        <h2 style={{ margin: 0 }}>{project.name}</h2>
                        <p style={{ margin: '0.25rem 0 0', color: 'var(--gray-500)' }}>Task: {task.name}</p>
                    </div>
                    <div className="timer-display" style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--gray-800)' }}>
                        {formatTime(sessionTime)}
                    </div>
                    <div className="timer-controls" style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={handleStartPause} className={`action-btn ${isActive ? 'pause-btn' : 'start-btn'}`} style={{ width: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                            {isActive ? ICONS.pause : ICONS.play}
                            <span>{isActive ? 'Pause' : 'Start'}</span>
                        </button>
                        <button onClick={handleStop} className="action-btn stop-btn" disabled={!isActive && sessionTime === 0} style={{ width: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                            {ICONS.stop}
                            <span>Stop & Submit</span>
                        </button>
                    </div>
                    <div className="time-remaining" style={{ textAlign: 'center' }}>
                        <p style={{ margin: 0, color: 'var(--gray-600)' }}>Total Time Remaining on Project:</p>
                        <p style={{ margin: '0.25rem 0 0', fontWeight: 'bold', fontSize: '1.25rem' }}>{formatTime(timeRemaining)}</p>
                    </div>
                </div>
            </div>
            {showProofModal && (
                <ProofOfWorkModal
                    onCancel={() => setShowProofModal(false)}
                    onSubmit={handleProofSubmit}
                />
            )}
        </>
    );
};

TimeTracker.propTypes = {
    task: PropTypes.object.isRequired,
    project: PropTypes.object.isRequired,
};
