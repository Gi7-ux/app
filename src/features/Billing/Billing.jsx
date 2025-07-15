import React, { useState, useEffect } from 'react';
import { Invoice } from './components/Invoice.jsx';
import { PaymentList } from './components/PaymentTracking/PaymentList.jsx';
import { PaymentForm } from './components/PaymentTracking/PaymentForm.jsx';
import { apiClient } from '../../api/apiClient.js'; // Adjusted path assuming apiClient is in src/api

// Helper to get user role - replace with actual auth context if available
const getUserRole = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.data.role;
    } catch (e) {
        console.error("Failed to parse token:", e);
        return null;
    }
};


export const Billing = () => {
    const [activeTab, setActiveTab] = useState('invoiceGeneration'); // 'invoiceGeneration' or 'paymentTracking'
    const [invoiceFilters, setInvoiceFilters] = useState({
        freelancer: 'All',
        startDate: '',
        endDate: '',
    });
    const [invoiceData, setInvoiceData] = useState(null);
    const [freelancers, setFreelancers] = useState([]);
    const [error, setError] = useState('');
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        setUserRole(getUserRole());
        fetchFreelancers();
    }, []);

    const fetchFreelancers = async () => {
        try {
            // Assuming apiClient is configured to handle auth
            const response = await apiClient.get('/users/read.php');
            if (response.status === 401) {
                setError('Unauthorized. Please log in again.');
                setFreelancers([]);
                return;
            }
            if (response.data && Array.isArray(response.data.records)) {
                setFreelancers(response.data.records.filter(u => u.role === 'freelancer'));
            } else {
                setFreelancers([]);
            }
        } catch (err) {
            setError('Failed to fetch freelancers.');
            setFreelancers([]);
            console.error("Failed to fetch freelancers:", err);
        }
    };

    const handleInvoiceFilterChange = (e) => {
        const { name, value } = e.target;
        setInvoiceFilters(prev => ({ ...prev, [name]: value }));
    };

    const generateInvoice = async () => {
        if (invoiceFilters.freelancer === 'All' || !invoiceFilters.startDate || !invoiceFilters.endDate) {
            setError('Please select a freelancer and a date range to generate an invoice.');
            return;
        }
        setError('');
        try {
            const response = await apiClient.get(`/billing/generate_invoice_data.php`, {
                params: {
                    freelancer_id: invoiceFilters.freelancer,
                    start_date: invoiceFilters.startDate,
                    end_date: invoiceFilters.endDate,
                }
            });
            if (response.data.logs.length === 0) {
                setError('No time logs found for the selected criteria.');
                setInvoiceData(null); // Clear previous invoice if any
                return;
            }
            setInvoiceData({
                ...response.data,
                generatedDate: new Date().toLocaleDateString()
            });
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'An error occurred while generating the invoice.');
            setInvoiceData(null);
        }
    };

    const handlePaymentFormSubmit = () => {
        setShowPaymentForm(false);
        // Potentially refresh payment list here if it's visible and needs update
        // For now, PaymentList handles its own refresh.
    };

    if (invoiceData && activeTab === 'invoiceGeneration') {
        return <Invoice data={invoiceData} onBack={() => setInvoiceData(null)} />;
    }

    const canViewPaymentTracking = userRole === 'admin' || userRole === 'client'; // Freelancers typically don't manage payments directly
    const canAddPayments = userRole === 'admin'; // Only admins can add payments through this form for now

    return (
        <div className="management-page">
            <div className="management-header">
                <h1>Billing & Payments</h1>
            </div>

            <div className="project-tabs"> {/* Using similar styling to Reporting.jsx for tabs */}
                <button
                    className={`tab-btn ${activeTab === 'invoiceGeneration' ? 'active' : ''}`}
                    onClick={() => setActiveTab('invoiceGeneration')}
                >
                    Invoice Generation
                </button>
                {canViewPaymentTracking && (
                    <button
                        className={`tab-btn ${activeTab === 'paymentTracking' ? 'active' : ''}`}
                        onClick={() => setActiveTab('paymentTracking')}
                    >
                        Payment Tracking
                    </button>
                )}
            </div>

            {activeTab === 'invoiceGeneration' && (
                <div className="tab-content" style={{ padding: '1.5rem' }}>
                    <div className="management-controls">
                        <div className="filters-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'flex-end' }}>
                            <div className="filter-group">
                                <label htmlFor="freelancer">Freelancer</label>
                                <select id="freelancer" name="freelancer" value={invoiceFilters.freelancer} onChange={handleInvoiceFilterChange}>
                                    <option value="All">Select a Freelancer</option>
                                    {freelancers.map(f => <option key={f.id} value={f.id}>{f.name} (ID: {f.id})</option>)}
                                </select>
                            </div>
                            <div className="filter-group">
                                <label htmlFor="startDate">Start Date</label>
                                <input id="startDate" type="date" name="startDate" value={invoiceFilters.startDate} onChange={handleInvoiceFilterChange} />
                            </div>
                            <div className="filter-group">
                                <label htmlFor="endDate">End Date</label>
                                <input id="endDate" type="date" name="endDate" value={invoiceFilters.endDate} onChange={handleInvoiceFilterChange} />
                            </div>
                            <button className="create-btn" onClick={generateInvoice}>Generate Invoice</button>
                        </div>
                    </div>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    {!invoiceData && (
                        <div className="table-container" style={{ marginTop: '20px' }}>
                            <p>Select a freelancer and date range to generate an invoice for their time logs.</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'paymentTracking' && canViewPaymentTracking && (
                <div className="tab-content" style={{ padding: '1.5rem' }}>
                    {canAddPayments && (
                        <div style={{ marginBottom: '20px', textAlign: 'right' }}>
                            <button className="create-btn" onClick={() => setShowPaymentForm(true)}>Record New Payment</button>
                        </div>
                    )}
                    {showPaymentForm && canAddPayments && (
                        <div className="modal-backdrop"> {/* Basic modal styling */}
                            <div className="modal-content">
                                <PaymentForm
                                    onFormSubmit={handlePaymentFormSubmit}
                                    onCancel={() => setShowPaymentForm(false)}
                                />
                            </div>
                        </div>
                    )}
                    <PaymentList showAdminControls={userRole === 'admin'} />
                </div>
            )}
            {activeTab === 'paymentTracking' && !canViewPaymentTracking && (
                <div className="tab-content" style={{ padding: '1.5rem' }}>
                    <p>You do not have permission to view payment tracking.</p>
                </div>
            )}
        </div>
    );
};

// Basic modal styling (can be moved to a global CSS or a specific CSS file)
const styles = `
.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}
.modal-content {
    background-color: white;
    padding: 0; /* PaymentForm has its own padding */
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    max-height: 90vh;
    overflow-y: auto;
}
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
