import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';

export const ProofOfWorkModal = ({ onCancel, onSubmit }) => {
    const [file, setFile] = useState(null);
    const [comment, setComment] = useState('');
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = () => {
        if (!file || comment.trim() === '') {
            alert('Please upload a proof of work file and add a comment.');
            return;
        }
        onSubmit(file, comment);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Submit Proof of Work</h2>
                <p>Please upload a file and add a comment to log your time.</p>
                
                <div className="input-group">
                    <label htmlFor="proofOfWorkFile">Proof of Work File</label>
                    <input id="proofOfWorkFile" type="file" ref={fileInputRef} onChange={handleFileChange} />
                </div>

                <div className="input-group">
                    <label htmlFor="proofOfWorkComment">Comment</label>
                    <textarea 
                        id="proofOfWorkComment"
                        value={comment} 
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Describe the work you completed..."
                        rows="4"
                    ></textarea>
                </div>

                <div className="modal-actions">
                    <button className="action-link" onClick={onCancel}>Cancel</button>
                    <button className="action-btn" onClick={handleSubmit}>Submit</button>
                </div>
            </div>
        </div>
    );
};

ProofOfWorkModal.propTypes = {
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
};
