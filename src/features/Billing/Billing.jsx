import React, { useState, useEffect } from 'react';
import { Invoice } from './components/Invoice.jsx';

export const Billing = () => {
    const [filters, setFilters] = useState({
        freelancer: 'All',
        startDate: '',
        endDate: '',
    });
    const [invoiceData, setInvoiceData] = useState(null);
    const [freelancers, setFreelancers] = useState([]);
    const [error, setError] = useState('');

    const fetchFreelancers = async () => {
        // Using the users read endpoint to get a list of freelancers
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('/api/users/read.php', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setFreelancers(data.records.filter(u => u.role === 'freelancer'));
            }
        } catch {
            // Handle error silently as it's a supporting call
        }
    };

    useEffect(() => {
        fetchFreelancers();
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const generateInvoice = async () => {
        if (filters.freelancer === 'All' || !filters.startDate || !filters.endDate) {
            alert('Please select a freelancer and a date range to generate an invoice.');
            return;
        }

        setError('');
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`/api/billing/generate_invoice_data.php?freelancer_id=${filters.freelancer}&start_date=${filters.startDate}&end_date=${filters.endDate}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                if (data.logs.length === 0) {
                    alert('No time logs found for the selected criteria.');
                    return;
                }
                setInvoiceData({
                    ...data,
                    generatedDate: new Date().toLocaleDateString()
                });
            } else {
                setError(data.message || 'Failed to generate invoice data.');
            }
        } catch {
            setError('An error occurred while generating the invoice.');
        }
    };

    if (invoiceData) {
        return <Invoice data={invoiceData} onBack={() => setInvoiceData(null)} />;
    }

    return (
        <div className="management-page">
            <div className="management-header">
                <h1>Billing & Invoicing</h1>
            </div>
            <div className="management-controls">
                <div className="filters-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'flex-end' }}>
                    <div className="filter-group">
                        <label htmlFor="freelancer">Freelancer</label>
                        <select id="freelancer" name="freelancer" value={filters.freelancer} onChange={handleFilterChange}>
                            <option value="All">Select a Freelancer</option>
                            {freelancers.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label htmlFor="startDate">Start Date</label>
                        <input id="startDate" type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
                    </div>
                    <div className="filter-group">
                        <label htmlFor="endDate">End Date</label>
                        <input id="endDate" type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
                    </div>
                    <button className="create-btn" onClick={generateInvoice}>Generate Invoice</button>
                </div>
            </div>
            {error && <p style={{ color: 'red', padding: '1.5rem' }}>{error}</p>}
            <div className="table-container">
                <p style={{ padding: '1.5rem' }}>Select a freelancer and date range to generate an invoice.</p>
            </div>
        </div>
    );
};
