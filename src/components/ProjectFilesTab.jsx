import React from 'react';
import PropTypes from 'prop-types';
import { ICONS } from '../assets/icons';

const ProjectFilesTab = ({ onClose }) => {
    return (
        <div className="tab-content-container">
            <div className="form-content">
                <div className="form-column">
                    <div className="tab-section">
                        <div className="tab-section-header">
                            <span>Project Files</span>
                            <button className="btn-primary file-upload-btn">
                                {ICONS.upload} Upload
                            </button>
                        </div>
                        <div className="files-list tab-section-content">
                            <div>No files uploaded yet.</div>
                        </div>
                    </div>
                </div>

                <div className="form-column">
                    <div className="tab-section">
                        <div className="tab-section-header">Upload New File</div>
                        <div className="tab-section-content">
                            <div className="form-group">
                                <label>File Type</label>
                                <select>
                                    <option value="document">Document</option>
                                    <option value="image">Image</option>
                                    <option value="drawing">Drawing</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <input type="text" placeholder="Brief description of the file" />
                            </div>
                            <div className="form-group">
                                <label>File</label>
                                <input type="file" />
                            </div>
                            <button className="btn-primary">{ICONS.upload} Upload File</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

ProjectFilesTab.propTypes = {
    onClose: PropTypes.func.isRequired,
};

export default ProjectFilesTab;
