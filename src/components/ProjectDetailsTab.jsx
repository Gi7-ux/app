import React from 'react';
import PropTypes from 'prop-types';

const ProjectDetailsTab = ({ project, formData, handleInputChange, handleSubmit, loading, onClose, onSave }) => {
    return (
        <div className="tab-content-container">
            <form onSubmit={handleSubmit} className="project-details-form">
                <div className="form-content">
                    <div className="form-column">
                        <div className="form-group">
                            <label htmlFor="title">Project Title</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="skills-section tab-section">
                            <div className="tab-section-header">Skills Required:</div>
                            <div className="skills-container tab-section-content">
                                {Array.isArray(project.skills) && project.skills.length > 0 ? (
                                    project.skills.map(skill => <span key={skill} className="skill-tag">{skill}</span>)
                                ) : (
                                    <p>No skills specified.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="form-column">
                        <div className="details-grid">
                            <div className="form-group">
                                <label htmlFor="budget">Budget (R)</label>
                                <input
                                    type="number"
                                    id="budget"
                                    name="budget"
                                    value={formData.budget}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="deadline">Deadline</label>
                                <input
                                    type="date"
                                    id="deadline"
                                    name="deadline"
                                    value={formData.deadline}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="status">Status</label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                >
                                    <option value="Open">Open</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Pending Approval">Pending Approval</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Archived">Archived</option>
                                </select>
                            </div>
                        </div>

                        <div className="client-freelancer-section tab-section">
                            <div className="tab-section-header">Project Team</div>
                            <div className="tab-section-content">
                                <div><strong>Client:</strong> {project.clientName || 'Not assigned'}</div>
                                <div><strong>Freelancer:</strong> {project.freelancerName || 'Not assigned'}</div>
                                <div><strong>Created:</strong> {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'Unknown'}</div>
                            </div>
                        </div>

                        <div className="budget-section tab-section">
                            <div className="tab-section-header">Budget Information</div>
                            <div className="tab-section-content">
                                <div><strong>Budget:</strong> R {(project.budget || 0).toLocaleString()}</div>
                                <div><strong>Spent:</strong> R {(project.spend || 0).toLocaleString()}</div>
                                <div><strong>Remaining:</strong> R {((project.budget || 0) - (project.spend || 0)).toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button type="button" className="btn-secondary" onClick={onClose}>Close</button>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

ProjectDetailsTab.propTypes = {
    project: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    handleInputChange: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func
};

export default ProjectDetailsTab;
