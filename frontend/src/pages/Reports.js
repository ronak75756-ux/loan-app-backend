import React, { useState, useEffect } from 'react';
import { paymentService } from '../services/api';

const Reports = () => {
    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [stats, setStats] = useState({
        totalCollected: 0,
        numberOfPayments: 0,
    });

    useEffect(() => {
        loadPayments();
    }, []);

    const loadPayments = async () => {
        try {
            const response = await paymentService.getAll();
            setPayments(response.data);
            setFilteredPayments(response.data);
            calculateStats(response.data);
        } catch (error) {
            console.error('Error loading payments:', error);
        }
    };

    const calculateStats = (paymentList) => {
        const total = paymentList.reduce((sum, payment) => sum + payment.amount, 0);
        setStats({
            totalCollected: total,
            numberOfPayments: paymentList.length,
        });
    };

    const handleFilter = async () => {
        try {
            if (!startDate || !endDate) {
                // No dates selected, show all payments
                const response = await paymentService.getAll();
                setFilteredPayments(response.data);
                calculateStats(response.data);
                return;
            }

            // Use the API endpoint for date filtering
            const response = await paymentService.getByDateRange(startDate, endDate);
            console.log('Filtered payments:', response.data);
            setFilteredPayments(response.data);
            calculateStats(response.data);
        } catch (error) {
            console.error('Error filtering payments:', error);
            // Fallback to client-side filtering
            const filtered = payments.filter((payment) => {
                const paymentDate = new Date(payment.paymentDate);
                const start = new Date(startDate);
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                return paymentDate >= start && paymentDate <= end;
            });
            setFilteredPayments(filtered);
            calculateStats(filtered);
        }
    };

    const formatCurrency = (amount) => {
        return `₹${amount?.toLocaleString('en-IN') || 0}`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="main-content">
            <div className="page-header">
                <h1 className="page-title">Reports</h1>
                <p className="page-subtitle">Filter and view payment collection reports</p>
            </div>

            <div className="content-card">
                <div className="filter-section">
                    <h3 className="filter-title">Filter Report</h3>
                    <div className="filter-row">
                        <div className="form-group">
                            <label className="form-label">Start Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">End Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <button className="btn-primary" onClick={handleFilter}>
                            🔍 Apply Filter
                        </button>
                        {(startDate || endDate) && (
                            <button
                                className="btn-secondary"
                                onClick={() => {
                                    setStartDate('');
                                    setEndDate('');
                                    loadPayments();
                                }}
                            >
                                ✕ Clear Filter
                            </button>
                        )}
                    </div>
                </div>

                <div className="summary-grid">
                    <div className="summary-card">
                        <div className="summary-card-label">Total Collected</div>
                        <div className="summary-card-value">{formatCurrency(stats.totalCollected)}</div>
                    </div>
                    <div className="summary-card">
                        <div className="summary-card-label">Number of Payments</div>
                        <div className="summary-card-value">{stats.numberOfPayments}</div>
                    </div>
                    <div className="summary-card">
                        <div className="summary-card-label">Date Range</div>
                        <div className="summary-card-value" style={{ fontSize: '16px' }}>
                            {startDate && endDate ? `${formatDate(startDate)} - ${formatDate(endDate)}` : 'All - All'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="content-card">
                <h3 className="content-card-title">Payment Details</h3>

                {filteredPayments.length === 0 ? (
                    <div className="payment-details-empty">
                        No payments found for the selected period
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date & Time</th>
                                    <th>Customer</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Transaction ID</th>
                                    <th>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPayments.map((payment) => (
                                    <tr key={payment.id}>
                                        <td>{formatDateTime(payment.paymentDate)}</td>
                                        <td>{payment.customerName}</td>
                                        <td>{formatCurrency(payment.amount)}</td>
                                        <td>
                                            <span className={`badge ${payment.paymentMethod === 'CASH' ? 'success' : 'warning'}`}>
                                                {payment.paymentMethod}
                                            </span>
                                        </td>
                                        <td>{payment.transactionId || '-'}</td>
                                        <td>{payment.notes || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;
