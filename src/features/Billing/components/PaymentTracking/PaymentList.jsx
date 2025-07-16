import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { apiClient } from '../../../../api/apiClient'; // Assuming apiClient is setup for API calls
import './PaymentList.css'; // We'll create this CSS file next

const PAYMENT_STATUS_OPTIONS = ['pending', 'completed', 'failed', 'refunded'];


export const PaymentList = ({ projectId, clientId, freelancerId, showAdminControls }) => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [limit] = useState(10); // Or make this configurable
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    // Filters - can be expanded with a UI later
    const [filters, setFilters] = useState({
        project_id: projectId,
        client_id: clientId,
        freelancer_id: freelancerId,
        status: '',
        start_date: '',
        end_date: '',
    });

    const fetchPayments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = { page, limit, ...filters };
            // Remove null/undefined/empty filters
            Object.keys(params).forEach(key => {
                if (params[key] === null || params[key] === undefined || params[key] === '') {
                    delete params[key];
                }
            });

            const response = await apiClient.get('/payments/get_payments.php', { params });
            setPayments(response.data.data || []);
            setTotalRecords(response.data.pagination.totalRecords || 0);
            setTotalPages(response.data.pagination.totalPages || 0);
        } catch (err) {
            setError(err.message || 'Failed to fetch payments.');
            setPayments([]);
        } finally {
            setLoading(false);
        }
    }, [page, limit, filters]);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1); // Reset to first page on filter change
    };

    const handleRefresh = () => {
        fetchPayments();
    };

    const handleDeletePayment = async (paymentId) => {
        if (!window.confirm('Are you sure you want to delete this payment? This action cannot be undone.')) {
            return;
        }
        try {
            await apiClient.delete(`/payments/delete_payment.php?id=${paymentId}`);
            setSnackbarMessage('Payment deleted successfully.');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            fetchPayments(); // Refresh list
        } catch (err) {
            setSnackbarMessage(`Failed to delete payment: ${err.response?.data?.message || err.message}`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };


    if (loading) {
        return <p>Loading payments...</p>;
    }
    if (error) {
        return <p style={{ color: 'red' }}>Error: {error}</p>;
    }

    return (
        <div className="payment-list-container">
            <h3>Payment Records</h3>
            {/* Basic Filter UI - can be expanded */}
            <div className="payment-filters">
                <input
                    type="date"
                    name="start_date"
                    value={filters.start_date || ''}
                    onChange={handleFilterChange}
                    placeholder="Start Date"
                />
                <input
                    type="date"
                    name="end_date"
                    value={filters.end_date || ''}
                    onChange={handleFilterChange}
                    placeholder="End Date"
                />
                <select name="status" value={filters.status || ''} onChange={handleFilterChange}>
                    <option value="">All Statuses</option>
                    {PAYMENT_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
                <button onClick={handleRefresh} style={{ marginLeft: '10px' }}>Refresh</button>
            </div>

            {payments.length === 0 ? (
                <p>No payments found.</p>
            ) : (
                <>
                    <table className="payment-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Project</th>
                                <th>Paid By</th>
                                <th>Paid To</th>
                                <th>Method</th>
                                <th>Status</th>
                                <th>Transaction ID</th>
                                {showAdminControls && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map(payment => (
                                <tr key={payment.id}>
                                    <td>{payment.id}</td>
                                    <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                                    <td>${parseFloat(payment.amount).toFixed(2)}</td>
                                    <td>{payment.project_title || (payment.project_id ? `ID: ${payment.project_id}` : 'N/A')}</td>
                                    <td>{payment.paid_by_user_name || (payment.paid_by_user_id ? `ID: ${payment.paid_by_user_id}` : 'N/A')}</td>
                                    <td>{payment.paid_to_user_name || (payment.paid_to_user_id ? `ID: ${payment.paid_to_user_id}` : 'N/A')}</td>
                                    <td>{payment.payment_method}</td>
                                    <td>{payment.status}</td>
                                    <td>{payment.transaction_id || 'N/A'}</td>
                                    {showAdminControls && (
                                        <td>
                                            {/* <button onClick={() => onEditPayment(payment)}>Edit</button> */}
                                            <button
                                                onClick={() => handleDeletePayment(payment.id)}
                                                className="delete-btn"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="pagination-controls">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
                        <span>Page {page} of {totalPages} (Total: {totalRecords})</span>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
                    </div>
                </>
            )}
            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

// Default props can be added if needed, e.g. for showAdminControls
PaymentList.propTypes = {
    projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    clientId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    freelancerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    showAdminControls: PropTypes.bool,
};

PaymentList.defaultProps = {
    showAdminControls: false,
};
