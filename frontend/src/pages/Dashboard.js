import React, { useState, useEffect } from 'react';
import { dashboardService, customerService } from '../services/api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalCustomers: 0,
        activeLoans: 0,
        totalOutstanding: 0,
        todayCollection: 0,
        totalDisbursed: 0,
        totalCollected: 0,
        cashPayments: 0,
        onlinePayments: 0,
        numberOfPayments: 0,
    });
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        loanAmount: '',
        dailyInstallment: '',
        durationDays: '',
        startDate: new Date().toISOString().split('T')[0],
        startTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        detailsDate: new Date().toISOString().split('T')[0],
        detailsTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
    });

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const response = await dashboardService.getStats();
            setStats(response.data);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Combine date and time
            const combinedDate = new Date(`${formData.startDate}T${formData.startTime}:00`).toISOString();
            const createdAt = new Date(`${formData.detailsDate}T${formData.detailsTime}:00`).toISOString();

            await customerService.create({
                ...formData,
                startDate: combinedDate,
                createdAt
            });
            setShowModal(false);
            setFormData({
                name: '',
                phone: '',
                address: '',
                loanAmount: '',
                dailyInstallment: '',
                durationDays: '',
                startDate: new Date().toISOString().split('T')[0],
                startTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                detailsDate: new Date().toISOString().split('T')[0],
                detailsTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
            });
            loadStats(); // Refresh stats after adding customer
        } catch (error) {
            console.error('Error creating customer:', error);
            alert('Error creating customer. Please check the console for details.');
        }
    };

    const formatCurrency = (amount) => {
        return `₹${amount?.toLocaleString('en-IN') || 0}`;
    };

    return (
        <div className="main-content">
            <div className="page-header-actions">
                <div className="page-header">
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Overview of your loan management</p>
                </div>
                <button className="btn-primary" onClick={() => setShowModal(true)}>+ Add New Customer</button>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Total Customers</span>
                        <div className="stat-card-icon blue">👥</div>
                    </div>
                    <h2 className="stat-card-value">{stats.totalCustomers}</h2>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Active Loans</span>
                        <div className="stat-card-icon green">📄</div>
                    </div>
                    <h2 className="stat-card-value">{stats.activeLoans}</h2>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Total Outstanding</span>
                        <div className="stat-card-icon orange">📈</div>
                    </div>
                    <h2 className="stat-card-value">{formatCurrency(stats.totalOutstanding)}</h2>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Today's Collection</span>
                        <div className="stat-card-icon purple">💰</div>
                    </div>
                    <h2 className="stat-card-value">{formatCurrency(stats.todayCollection)}</h2>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="content-card">
                    <h3 className="content-card-title">Loan Summary</h3>
                    <div className="summary-row">
                        <span className="summary-label">Total Disbursed</span>
                        <span className="summary-value">{formatCurrency(stats.totalDisbursed)}</span>
                    </div>
                    <div className="summary-row">
                        <span className="summary-label">Total Collected</span>
                        <span className="summary-value green">{formatCurrency(stats.totalCollected)}</span>
                    </div>
                    <div className="summary-row">
                        <span className="summary-label">Total Outstanding</span>
                        <span className="summary-value orange">{formatCurrency(stats.totalOutstanding)}</span>
                    </div>
                </div>

                <div className="content-card">
                    <h3 className="content-card-title">Today's Collections</h3>
                    <div className="summary-row">
                        <span className="summary-label">Total Collected</span>
                        <span className="summary-value">{formatCurrency(stats.todayCollection)}</span>
                    </div>
                    <div className="summary-row">
                        <span className="summary-label">Cash Payments</span>
                        <span className="summary-value">{formatCurrency(stats.cashPayments)}</span>
                    </div>
                    <div className="summary-row">
                        <span className="summary-label">Online Payments</span>
                        <span className="summary-value blue">{formatCurrency(stats.onlinePayments)}</span>
                    </div>
                    <div className="summary-row">
                        <span className="summary-label">Number of Payments</span>
                        <span className="summary-value">{stats.numberOfPayments}</span>
                    </div>
                </div>
            </div>

            {/* Add Customer Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Add New Customer</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Name *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone *</label>
                                    <input
                                        type="tel"
                                        className="form-input"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Address</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Loan Amount (₹) *</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="Enter loan amount"
                                        value={formData.loanAmount}
                                        onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Daily Installment (₹) *</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="Enter daily installment"
                                        value={formData.dailyInstallment}
                                        onChange={(e) => setFormData({ ...formData, dailyInstallment: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Duration (Days) *</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="Enter duration in days"
                                        value={formData.durationDays}
                                        onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div>
                                            <label className="form-label">Registration Date</label>
                                            <input
                                                type="date"
                                                className="form-input"
                                                value={formData.detailsDate}
                                                onChange={(e) => setFormData({ ...formData, detailsDate: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Registration Time</label>
                                            <input
                                                type="time"
                                                className="form-input"
                                                value={formData.detailsTime}
                                                onChange={(e) => setFormData({ ...formData, detailsTime: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div>
                                            <label className="form-label">Start Date *</label>
                                            <input
                                                type="date"
                                                className="form-input"
                                                value={formData.startDate}
                                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Start Time *</label>
                                            <input
                                                type="time"
                                                className="form-input"
                                                value={formData.startTime}
                                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Add Customer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
