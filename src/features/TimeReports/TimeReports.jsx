import React, { useState, useMemo, useEffect } from 'react';
import { ICONS } from '../../assets/icons.jsx';

const convertToCSV = (data) => {
    const headers = Object.keys(data[0]);
    const rows = data.map(obj => headers.map(header => JSON.stringify(obj[header])).join(','));
    return [headers.join(','), ...rows].join('\n');
};

const downloadCSV = (csvData, filename) => {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

export const TimeReports = () => {
    const [timeLogs, setTimeLogs] = useState([]);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        freelancer: 'All',
        project: 'All',
    });
    const [error, setError] = useState('');

    const fetchTimeLogs = async () => {
        setError('');
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('/api/timelogs/read.php', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setTimeLogs(data.records);
            } else {
                setError(data.message || 'Failed to fetch time logs.');
            }
        } catch {
            setError('An error occurred while fetching time logs.');
        }
    };

    useEffect(() => {
        fetchTimeLogs();
    }, []);

    const freelancers = useMemo(() => [...new Set(timeLogs.map(log => log.freelancerName))], []);
    const projects = useMemo(() => [...new Set(timeLogs.map(log => log.projectName))], []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const filteredLogs = useMemo(() => {
        return timeLogs.filter(log => {
            const startDateMatch = !filters.startDate || new Date(log.date) >= new Date(filters.startDate);
            const endDateMatch = !filters.endDate || new Date(log.date) <= new Date(filters.endDate);
            const freelancerMatch = filters.freelancer === 'All' || log.freelancerName === filters.freelancer;
            const projectMatch = filters.project === 'All' || log.projectName === filters.project;
            return startDateMatch && endDateMatch && freelancerMatch && projectMatch;
        });
    }, [timeLogs, filters]);

    const totalHours = useMemo(() => {
        return filteredLogs.reduce((acc, log) => acc + parseFloat(log.hours), 0);
    }, [filteredLogs]);

    const handleDelete = () => {
        // This functionality is not yet implemented in the backend
        alert('Delete functionality is not yet available.');
    }

    const handleExport = () => {
        if (filteredLogs.length === 0) {
            alert('No data to export.');
            return;
        }
        const csvData = convertToCSV(filteredLogs);
        downloadCSV(csvData, 'time_reports.csv');
    };

    return (
        <div className="management-page">
            <div className="management-header">
                <h1>Time Reports</h1>
                <button className="action-btn" onClick={handleExport}>Export to CSV</button>
            </div>
            <div className="management-controls">
                <div className="filters-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr) auto', gap: '1rem', alignItems: 'flex-end' }}>
                    <div className="filter-group">
                        <label>Start Date</label>
                        <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
                    </div>
                    <div className="filter-group">
                        <label>End Date</label>
                        <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
                    </div>
                    <div className="filter-group">
                        <label>Freelancer</label>
                        <select name="freelancer" value={filters.freelancer} onChange={handleFilterChange}>
                            <option value="All">All Freelancers</option>
                            {freelancers.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Project</label>
                        <select name="project" value={filters.project} onChange={handleFilterChange}>
                            <option value="All">All Projects</option>
                            {projects.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <button className="action-link" onClick={() => setFilters({ startDate: '', endDate: '', freelancer: 'All', project: 'All' })}>Reset</button>
                </div>
            </div>
            {error && <p style={{ color: 'red', padding: '1.5rem' }}>{error}</p>}
            <div className="card" style={{ margin: '1.5rem' }}>
                <h3 className="card-header">Total Filtered Hours: {totalHours.toFixed(2)}</h3>
            </div>
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Freelancer</th>
                            <th>Project</th>
                            <th>Task</th>
                            <th>Hours</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.map(log => (
                            <tr key={log.id}>
                                <td>{new Date(log.date).toLocaleDateString()}</td>
                                <td>{log.freelancerName}</td>
                                <td>{log.projectName}</td>
                                <td>{log.taskDescription}</td>
                                <td>{parseFloat(log.hours).toFixed(2)}</td>
                                <td>
                                    <div className="action-icons">
                                        <span>{ICONS.edit}</span>
                                        <span className="delete-icon" onClick={() => handleDelete(log.id)}>{ICONS.delete}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
