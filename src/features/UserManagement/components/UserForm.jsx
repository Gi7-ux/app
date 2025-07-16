import React, { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import './UserForm.css';

export const UserForm = ({ user, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        company: user?.company || '',
        bio: user?.bio || '',
        role: user?.role || 'freelancer',
        skills: user?.skills || [],
        password: '', // Only used for new user
        avatar: user?.avatar || null,
    });
    const [feedback, setFeedback] = useState({ type: '', message: '' });

    // Use a separate state for the skills tag input
    const [skillsInput, setSkillsInput] = useState('');
    const [skillsList, setSkillsList] = useState(user?.skills || []);

    // Image editing states
    const [showImageEditor, setShowImageEditor] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [crop, setCrop] = useState({
        unit: '%',
        width: 90,
        height: 90,
        x: 5,
        y: 5
    });
    const [completedCrop, setCompletedCrop] = useState(null);
    const imgRef = useRef(null);
    const previewCanvasRef = useRef(null);
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        switch (name) {
            case 'name':
            case 'email':
            case 'phone':
            case 'company':
            case 'password':
            case 'bio':
                setFormData(prev => ({ ...prev, [name]: value }));
                break;
            case 'role':
                setFormData(prev => ({ ...prev, role: value }));
                break;
        }
    };


    const handleSkillsChange = (e) => {
        setSkillsInput(e.target.value);
    };

    const handleAddSkill = (e) => {
        e.preventDefault();
        const skill = skillsInput.trim();
        if (skill && !skillsList.includes(skill)) {
            setSkillsList(prev => [...prev, skill]);
            setSkillsInput('');
        }
    };

    const handleRemoveSkill = (skill) => {
        setSkillsList(prev => prev.filter(s => s !== skill));
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setSelectedImage(reader.result);
                setShowImageEditor(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const onImageLoad = useCallback((img) => {
        imgRef.current = img;
        const { naturalWidth, naturalHeight } = img;
        const cropSize = Math.min(naturalWidth, naturalHeight);
        const x = (naturalWidth - cropSize) / 2 / naturalWidth * 100;
        const y = (naturalHeight - cropSize) / 2 / naturalHeight * 100;
        const size = (cropSize / naturalWidth) * 100;

        setCrop({
            unit: '%',
            width: size,
            height: size,
            x: x,
            y: y
        });
    }, []);

    const generatePreview = useCallback((crop) => {
        const canvas = previewCanvasRef.current;
        const ctx = canvas.getContext('2d');

        const imageEl = imgRef.current;
        const scaleX = imageEl.naturalWidth / imageEl.width;
        const scaleY = imageEl.naturalHeight / imageEl.height;

        const pixelRatio = window.devicePixelRatio;
        const cropX = crop.x * scaleX / 100 * imageEl.naturalWidth;
        const cropY = crop.y * scaleY / 100 * imageEl.naturalHeight;
        const cropWidth = crop.width * scaleX / 100 * imageEl.naturalWidth;
        const cropHeight = crop.height * scaleY / 100 * imageEl.naturalHeight;

        canvas.width = 150 * pixelRatio;
        canvas.height = 150 * pixelRatio;
        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
            imageEl,
            cropX,
            cropY,
            cropWidth,
            cropHeight,
            0,
            0,
            150,
            150
        );
    }, []);

    const handleCropComplete = (crop) => {
        setCompletedCrop(crop);
        generatePreview(crop);
    };

    const handleSaveImage = () => {
        if (previewCanvasRef.current && completedCrop?.width && completedCrop?.height) {
            previewCanvasRef.current.toBlob((blob) => {
                const reader = new FileReader();
                reader.onload = () => {
                    setFormData(prev => ({ ...prev, avatar: reader.result }));
                    setShowImageEditor(false);
                    setSelectedImage(null);
                };
                reader.readAsDataURL(blob);
            }, 'image/jpeg', 0.9);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Only include password if creating a new user
        const submitData = user
            ? { ...formData, skills: skillsList }
            : { ...formData, skills: skillsList, password: formData.password };
        if (!user && !formData.password) {
            alert('Password is required for new users.');
            return;
        }
        onSave(submitData);
        setFeedback({ type: 'success', message: user ? 'User updated successfully!' : 'User created successfully!' });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content user-form-modal">
                <form onSubmit={handleSubmit}>
                    {/* Hidden username field for better accessibility */}
                    <input type="text" name="username" value={formData.email} autoComplete="username" style={{ display: 'none' }} readOnly />

                    <div className="modal-header">
                        <h2>{user ? 'Edit User' : 'Create User'}</h2>
                        <button type="button" className="close-btn" onClick={onCancel}>&times;</button>
                    </div>

                    {feedback.message && (
                        <div
                            style={{
                                margin: '0 0 1rem 0',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '8px',
                                background: feedback.type === 'success' ? 'linear-gradient(90deg, #d1fae5, #a7f3d0)' : 'linear-gradient(90deg, #fee2e2, #fecaca)',
                                color: feedback.type === 'success' ? '#065f46' : '#b91c1c',
                                fontWeight: 500,
                                fontSize: '1rem',
                                textAlign: 'center',
                                border: feedback.type === 'success' ? '1px solid #a7f3d0' : '1px solid #fecaca',
                            }}
                            role="alert"
                        >
                            {feedback.message}
                        </div>
                    )}
                    <div className="modal-body">
                        {/* Profile Picture Section */}
                        <div className="profile-section">
                            <div className="profile-avatar-container">
                                <div className="avatar-wrapper">
                                    {formData.avatar ? (
                                        <img src={formData.avatar} alt="Profile" className="profile-avatar" />
                                    ) : (
                                        <div className="profile-avatar-placeholder">
                                            <span>{formData.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        className="avatar-edit-btn"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                            <circle cx="12" cy="13" r="4" />
                                        </svg>
                                    </button>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    style={{ display: 'none' }}
                                />
                            </div>
                        </div>
                        {feedback.message && (
                            <div
                                style={{
                                    margin: '0 0 1rem 0',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '8px',
                                    background: feedback.type === 'success' ? 'linear-gradient(90deg, #d1fae5, #a7f3d0)' : 'linear-gradient(90deg, #fee2e2, #fecaca)',
                                    color: feedback.type === 'success' ? '#065f46' : '#b91c1c',
                                    fontWeight: 500,
                                    fontSize: '1rem',
                                    textAlign: 'center',
                                    border: feedback.type === 'success' ? '1px solid #a7f3d0' : '1px solid #fecaca',
                                }}
                                role="alert"
                            >
                                {feedback.message}
                            </div>
                        )}

                        {/* User Information Section */}
                        <div className="user-info-section">
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="name">Name</label>
                                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required disabled={!!user} />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="phone">Phone Number</label>
                                    <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="company">Company</label>
                                    <input type="text" id="company" name="company" value={formData.company} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="form-row full-width">
                                <div className="form-group">
                                    <label htmlFor="bio">Experience / Bio</label>
                                    <textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} rows={3} placeholder="Enter experience or bio..." />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="role">Role</label>
                                    <select id="role" name="role" value={formData.role} onChange={handleChange}>
                                        <option value="admin">Admin</option>
                                        <option value="freelancer">Freelancer</option>
                                        <option value="client">Client</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="skills">Skills</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="text"
                                            id="skills"
                                            name="skills"
                                            value={skillsInput}
                                            onChange={handleSkillsChange}
                                            placeholder="Type skill and press Enter"
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') {
                                                    handleAddSkill(e);
                                                }
                                            }}
                                        />
                                        <button onClick={handleAddSkill} style={{ minWidth: 50 }} type="button">Add</button>
                                    </div>
                                    <div className="skills-tag-list" style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {skillsList.map(skill => (
                                            <span key={skill} className="skill-tag" style={{ background: '#e5e7eb', borderRadius: 12, padding: '2px 10px', display: 'flex', alignItems: 'center', marginRight: 4 }}>
                                                {skill}
                                                <button type="button" onClick={() => handleRemoveSkill(skill)} style={{ marginLeft: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#b91c1c', fontWeight: 'bold' }}>×</button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="modal-btn btn-cancel" onClick={onCancel}>Cancel</button>
                        <button type="submit" className="modal-btn btn-save">
                            {user ? 'Save User' : 'Save User'}
                        </button>
                    </div>
                </form>

                {/* Image Editor Modal */}
                {showImageEditor && (
                    <div className="image-editor-overlay">
                        <div className="image-editor-modal">
                            <div className="image-editor-header">
                                <h3>Edit Profile Picture</h3>
                                <button type="button" className="close-btn" onClick={() => setShowImageEditor(false)}>&times;</button>
                            </div>
                            <div className="image-editor-body">
                                <div className="crop-container">
                                    {selectedImage && (
                                        <ReactCrop
                                            crop={crop}
                                            onChange={(c) => setCrop(c)}
                                            onComplete={handleCropComplete}
                                            aspect={1}
                                            circularCrop
                                        >
                                            <img
                                                ref={imgRef}
                                                src={selectedImage}
                                                alt="Crop preview"
                                                onLoad={onImageLoad}
                                                style={{ maxWidth: '100%', maxHeight: '400px' }}
                                            />
                                        </ReactCrop>
                                    )}
                                </div>
                                <div className="preview-container">
                                    <h4>Preview:</h4>
                                    <canvas
                                        ref={previewCanvasRef}
                                        width={150}
                                        height={150}
                                        style={{
                                            width: '150px',
                                            height: '150px',
                                            borderRadius: '50%',
                                            border: '2px solid #e1e5e9'
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="image-editor-footer">
                                <button type="button" className="modal-btn btn-cancel" onClick={() => setShowImageEditor(false)}>Cancel</button>
                                <button type="button" className="modal-btn btn-save" onClick={handleSaveImage}>Save Image</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

UserForm.propTypes = {
    user: PropTypes.object,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};