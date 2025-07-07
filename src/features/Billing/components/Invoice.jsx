import React from 'react';
import PropTypes from 'prop-types';
import { ICONS } from '../../../assets/icons.jsx';

export const Invoice = ({ data, onBack }) => {
    const { freelancer, logs, generatedDate } = data;

    const totalHours = logs.reduce((acc, log) => acc + Number(log.hours), 0);
    const totalAmount = totalHours * freelancer.rate;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div>
            <div className="management-header" style={{ background: 'var(--gray-50)' }}>
                <button className="action-link" onClick={onBack} style={{ fontSize: '1rem' }}>{ICONS.back} Back to Billing</button>
                <button className="create-btn" onClick={handlePrint}>{ICONS.print} Print Invoice</button>
            </div>
            <div className="invoice-paper" style={{ background: 'white', padding: '2rem', margin: '1.5rem', border: '1px solid var(--gray-200)' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--gray-200)', paddingBottom: '1rem' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '2.5rem' }}>INVOICE</h1>
                        <p style={{ margin: '0.5rem 0 0 0' }}>Invoice #: {Date.now()}</p>
                        <p style={{ margin: '0.5rem 0 0 0' }}>Date: {generatedDate}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <h2 style={{ margin: 0 }}>Architex Axis</h2>
                        <p style={{ margin: '0.5rem 0 0 0' }}>123 Design Lane, Architect City, 1000</p>
                    </div>
                </header>
                <section style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                    <div>
                        <h3 style={{ color: 'var(--gray-500)' }}>BILL TO</h3>
                        <p>{freelancer.name}</p>
                        <p>{freelancer.company}</p>
                        <p>{freelancer.email}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <h3 style={{ color: 'var(--gray-500)' }}>Total Due</h3>
                        <p style={{ fontSize: '2rem', fontWeight: '700' }}>R {totalAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                </section>
                <section style={{ marginTop: '2rem' }}>
                    <table className="data-table">
                        <thead style={{ background: 'var(--gray-50)' }}>
                            <tr>
                                <th>Date</th>
                                <th>Project</th>
                                <th>Task</th>
                                <th style={{ textAlign: 'right' }}>Hours</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log.id}>
                                    <td>{new Date(log.date).toLocaleDateString()}</td>
                                    <td>{log.projectName}</td>
                                    <td>{log.taskDescription}</td>
                                    <td style={{ textAlign: 'right' }}>{Number(log.hours).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot style={{ fontWeight: '700' }}>
                            <tr>
                                <td colSpan="3" style={{ textAlign: 'right' }}>Total Hours</td>
                                <td style={{ textAlign: 'right' }}>{totalHours.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td colSpan="3" style={{ textAlign: 'right' }}>Rate</td>
                                <td style={{ textAlign: 'right' }}>R {freelancer.rate}/hr</td>
                            </tr>
                            <tr style={{ background: 'var(--gray-100)', fontSize: '1.25rem' }}>
                                <td colSpan="3" style={{ textAlign: 'right' }}>Total Amount</td>
                                <td style={{ textAlign: 'right' }}>R {totalAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            </tr>
                        </tfoot>
                    </table>
                </section>
                <footer style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-200)', fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                    <p>Please make payments to: Architex Group, Bank Name, Account # 123456789</p>
                    <p>Thank you for your work!</p>
                </footer>
            </div>
        </div>
    );
};

Invoice.propTypes = {
    data: PropTypes.object.isRequired,
    onBack: PropTypes.func.isRequired,
};