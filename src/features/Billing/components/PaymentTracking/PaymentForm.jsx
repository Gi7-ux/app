import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../../api/apiClient';
import './PaymentForm.css'; // We'll create this CSS file next

const PAYMENT_STATUS_OPTIONS = ['pending', 'completed', 'failed', 'refunded'];
const PAYMENT_METHOD_OPTIONS = ['credit_card', 'bank_transfer', 'paypal', 'stripe_charge_id', 'other'];

import PropTypes from 'prop-types';

export const PaymentForm = ({ paymentToEdit, onFormSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        invoice_id: '',
        project_id: '',
        paid_by_user_id: '',
        paid_to_user_id: '',
        amount: '',
        payment_date: new Date().toISOString().split('T')[0], // Default to today
        payment_method: '',
        transaction_id: '',
        status: 'completed',
        notes: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // TODO: Fetch lists of projects, users (clients/freelancers), invoices for dropdowns
    // For now, these will be input fields.

    useEffect(() => {
        if (paymentToEdit) {
            setFormData({
                invoice_id: paymentToEdit.invoice_id || '',
                project_id: paymentToEdit.project_id || '',
                paid_by_user_id: paymentToEdit.paid_by_user_id || '',
                paid_to_user_id: paymentToEdit.paid_to_user_id || '',
                amount: paymentToEdit.amount || '',
                payment_date: paymentToEdit.payment_date ? new Date(paymentToEdit.payment_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                payment_method: paymentToEdit.payment_method || '',
                transaction_id: paymentToEdit.transaction_id || '',
                status: paymentToEdit.status || 'completed',
                notes: paymentToEdit.notes || ''
            });
        }
    }, [paymentToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        if (!formData.amount || !formData.payment_date || !formData.paid_by_user_id) {
            setError("Amount, Payment Date, and Paid By User ID are required.");
            setIsLoading(false);
            return;
        }
        if (!formData.project_id && !formData.invoice_id) {
            setError("Either Project ID or Invoice ID must be provided.");
            setIsLoading(false);
            return;
        }

        try {
            let response;
            const payload = { ...formData };
            // Ensure numeric fields are numbers, nullify empty optional fields
            payload.amount = parseFloat(payload.amount);
            payload.invoice_id = payload.invoice_id ? parseInt(payload.invoice_id) : null;
            payload.project_id = payload.project_id ? parseInt(payload.project_id) : null;
            payload.paid_by_user_id = parseInt(payload.paid_by_user_id);
            payload.paid_to_user_id = payload.paid_to_user_id ? parseInt(payload.paid_to_user_id) : null;


            if (paymentToEdit && paymentToEdit.id) {
                // Update mode - not fully implemented in this step's plan, but structure is here
                // response = await apiClient.put(`/payments/update_payment.php`, { ...payload, id: paymentToEdit.id });
                setError("Update functionality is not fully implemented in this version.");
                setIsLoading(false);
                return; // Or proceed with update if API supports it well
            } else {
                // Create mode
                response = await apiClient.post('/payments/create_payment.php', payload);
            }

            setSuccessMessage(response.data.message || 'Payment processed successfully!');
            if (onFormSubmit) {
                onFormSubmit(response.data); // Pass back new/updated payment
            }
            // Reset form for new entry if not editing
            if (!(paymentToEdit && paymentToEdit.id)) {
                setFormData({
                    invoice_id: '', project_id: '', paid_by_user_id: '', paid_to_user_id: '',
                    amount: '', payment_date: new Date().toISOString().split('T')[0],
                    payment_method: '', transaction_id: '', status: 'completed', notes: ''
                });
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to process payment.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="payment-form-container">
            <h3>{paymentToEdit ? 'Edit Payment' : 'Record New Payment'}</h3>
            {error && <p className="form-error">Error: {error}</p>}
            {successMessage && <p className="form-success">{successMessage}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="amount">Amount *</label>
                        <input type="number" id="amount" name="amount" value={formData.amount} onChange={handleChange} required step="0.01" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="payment_date">Payment Date *</label>
                        <input type="date" id="payment_date" name="payment_date" value={formData.payment_date} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="paid_by_user_id">Paid By (User ID) *</label>
                        <input type="number" id="paid_by_user_id" name="paid_by_user_id" value={formData.paid_by_user_id} onChange={handleChange} required placeholder="Client's User ID" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="paid_to_user_id">Paid To (User ID)</label>
                        <input type="number" id="paid_to_user_id" name="paid_to_user_id" value={formData.paid_to_user_id} onChange={handleChange} placeholder="Freelancer/Platform User ID" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="project_id">Project ID</label>
                        <input type="number" id="project_id" name="project_id" value={formData.project_id} onChange={handleChange} placeholder="Associated Project ID" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="invoice_id">Invoice ID</label>
                        <input type="number" id="invoice_id" name="invoice_id" value={formData.invoice_id} onChange={handleChange} placeholder="Associated Invoice ID" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="payment_method">Payment Method</label>
                        <select id="payment_method" name="payment_method" value={formData.payment_method} onChange={handleChange}>
                            <option value="">Select Method</option>
                            {PAYMENT_METHOD_OPTIONS.map(m => <option key={m} value={m}>{m.replace('_', ' ').toUpperCase()}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="transaction_id">Transaction ID</label>
                        <input type="text" id="transaction_id" name="transaction_id" value={formData.transaction_id} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="status">Status *</label>
                        <select id="status" name="status" value={formData.status} onChange={handleChange} required>
                            {PAYMENT_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                    </div>
                    <div className="form-group full-width">
                        <label htmlFor="notes">Notes</label>
                        <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows="3"></textarea>
                    </div>
                </div>
                <div className="form-actions">
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? (paymentToEdit ? 'Updating...' : 'Recording...') : (paymentToEdit ? 'Update Payment' : 'Record Payment')}
                    </button>
                    {onCancel && <button type="button" onClick={onCancel} className="cancel-btn" disabled={isLoading}>Cancel</button>}
                </div>
            </form>
        </div>
    );
}

PaymentForm.propTypes = {
    paymentToEdit: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        invoice_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        project_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        paid_by_user_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        paid_to_user_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        payment_date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
        payment_method: PropTypes.string,
        transaction_id: PropTypes.string,
        status: PropTypes.string,
        notes: PropTypes.string,
    }),
    onFormSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};
