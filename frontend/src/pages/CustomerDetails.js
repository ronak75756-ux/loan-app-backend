import React, { useState, useEffect } from 'react';
import { customerService, paymentService } from '../services/api';

const CustomerDetails = ({ customerId, onBack }) => {
    const [customer, setCustomer] = useState(null);
    const [payments, setPayments] = useState([]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [editingPayment, setEditingPayment] = useState(null);
    const [paymentData, setPaymentData] = useState({
        amount: '',
        paymentMethod: 'CASH',
        transactionId: '',
        notes: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
    });

    useEffect(() => {
        if (customerId) {
            loadData();
        }
    }, [customerId]);

    const loadData = async () => {
        try {
            const [customerRes, paymentsRes] = await Promise.all([
                customerService.getById(customerId),
                paymentService.getByCustomer(customerId)
            ]);
            setCustomer(customerRes.data);
            setPayments(paymentsRes.data);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        try {
            const combinedDate = new Date(`${paymentData.date}T${paymentData.time}:00`).toISOString();

            if (editingPayment) {
                await paymentService.update(editingPayment.id, {
                    ...paymentData,
                    paymentDate: combinedDate
                });
            } else {
                await paymentService.create({
                    ...paymentData,
                    paymentDate: combinedDate,
                    customerId: customerId,
                });
            }
            closeModal();
            loadData();
        } catch (error) {
            console.error('Error saving payment:', error);
        }
    };

    const handleDeletePayment = async (paymentId) => {
        if (window.confirm('Are you sure you want to delete this payment?')) {
            try {
                await paymentService.delete(paymentId);
                loadData();
            } catch (error) {
                console.error('Error deleting payment:', error);
            }
        }
    };

    const openAddModal = () => {
        setEditingPayment(null);
        setPaymentData({
            amount: '',
            paymentMethod: 'CASH',
            transactionId: '',
            notes: '',
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
        });
        setShowPaymentModal(true);
    };

    const openEditModal = (payment) => {
        const paymentDate = new Date(payment.paymentDate);
        setEditingPayment(payment);
        setPaymentData({
            amount: payment.amount,
            paymentMethod: payment.paymentMethod,
            transactionId: payment.transactionId || '',
            notes: payment.notes || '',
            date: paymentDate.toISOString().split('T')[0],
            time: paymentDate.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
        });
        setShowPaymentModal(true);
    };

    const closeModal = () => {
        setShowPaymentModal(false);
        setEditingPayment(null);
    };

    const formatCurrency = (amount) => {
        return `₹${amount?.toLocaleString('en-IN') || 0}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-GB');
    };

    const formatTime = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    if (!customer) return <div>Loading...</div>;

    return (
        <div className="main-content">
            <div className="page-header-actions">
                <div className="page-header" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>←</button>
                        <h1 className="page-title">Customer Details</h1>
                    </div>
                    <div style={{ marginLeft: '24px', marginTop: '4px' }}>
                        <p className="page-subtitle" style={{ fontSize: '16px', marginBottom: '4px' }}>
                            <strong style={{ color: 'var(--text-dark)' }}>{customer.name}</strong> • {customer.phone}
                        </p>
                        <p className="page-subtitle" style={{ fontSize: '14px', color: '#6b7280' }}>
                            Registered: {new Date(customer.createdAt).toLocaleDateString('en-GB')} at {new Date(customer.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Loan Details Card */}
            <div className="content-card" style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
                    <span className={`badge ${customer.status === 'ACTIVE' ? 'success' : 'warning'}`}>
                        {customer.status}
                    </span>
                </div>

                <h3 className="content-card-title">Loan Details</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                    <div>
                        <div style={{ marginBottom: '24px' }}>
                            <div className="summary-label">Loan Amount</div>
                            <div className="stat-card-value">{formatCurrency(customer.loanAmount)}</div>
                        </div>
                        <div style={{ marginBottom: '24px' }}>
                            <div className="summary-label">Amount Paid</div>
                            <div className="stat-card-value" style={{ color: 'var(--success-green)' }}>{formatCurrency(customer.amountPaid)}</div>
                        </div>
                        <div>
                            <div className="summary-label">Duration</div>
                            <div className="summary-value">{customer.durationDays || customer.loanTenure} days</div>
                        </div>
                    </div>
                    <div>
                        <div style={{ marginBottom: '24px' }}>
                            <div className="summary-label">Daily Installment</div>
                            <div className="stat-card-value">{formatCurrency(customer.dailyInstallment)}</div>
                        </div>
                        <div style={{ marginBottom: '24px' }}>
                            <div className="summary-label">Remaining Amount</div>
                            <div className="stat-card-value" style={{ color: 'var(--warning-orange)' }}>{formatCurrency(customer.outstandingAmount)}</div>
                        </div>
                        <div>
                            <div className="summary-label">Start Date</div>
                            <div className="summary-value">
                                {formatDate(customer.loanDate)}
                                <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '8px' }}>
                                    {new Date(customer.loanDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment History Section */}
            <div className="content-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 className="content-card-title" style={{ margin: 0 }}>Payment History</h3>
                    <button className="btn-primary" onClick={openAddModal}>
                        + Add Payment
                    </button>
                </div>

                {payments.length === 0 ? (
                    <div className="empty-state">
                        <p className="empty-state-text">No payments found</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Amount</th>
                                    <th>Payment Method</th>
                                    <th>Notes</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((payment) => (
                                    <tr key={payment.id}>
                                        <td>{formatDate(payment.paymentDate)}</td>
                                        <td>{formatTime(payment.paymentDate)}</td>
                                        <td style={{ fontWeight: 'bold' }}>{formatCurrency(payment.amount)}</td>
                                        <td>
                                            <span className="badge" style={{ backgroundColor: '#f3f4f6', color: '#374151' }}>
                                                {payment.paymentMethod === 'ONLINE' ? 'Online' : 'Cash'}
                                            </span>
                                        </td>
                                        <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={payment.notes}>
                                            {payment.notes || '-'}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-icon"
                                                    onClick={() => openEditModal(payment)}
                                                    title="Edit"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="btn-icon"
                                                    onClick={() => handleDeletePayment(payment.id)}
                                                    title="Delete"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {editingPayment ? 'Edit Payment' : 'Add Payment'}
                            </h2>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <form onSubmit={handlePaymentSubmit}>
                            <div className="modal-body">
                                {!editingPayment && (
                                    <div className="form-group" style={{ marginBottom: '16px' }}>
                                        <label className="form-label">
                                            Outstanding: {formatCurrency(customer.outstandingAmount)}
                                        </label>
                                    </div>
                                )}
                                <div className="form-group">
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div>
                                            <label className="form-label">Date *</label>
                                            <input
                                                type="date"
                                                className="form-input"
                                                value={paymentData.date}
                                                onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Time *</label>
                                            <input
                                                type="time"
                                                className="form-input"
                                                value={paymentData.time}
                                                onChange={(e) => setPaymentData({ ...paymentData, time: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Amount *</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={paymentData.amount}
                                        onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Payment Method *</label>
                                    <select
                                        className="form-input"
                                        value={paymentData.paymentMethod}
                                        onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                                    >
                                        <option value="CASH">Cash</option>
                                        <option value="ONLINE">Online</option>
                                    </select>
                                </div>
                                {paymentData.paymentMethod === 'ONLINE' && (
                                    <div className="form-group">
                                        <label className="form-label">Transaction ID</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={paymentData.transactionId}
                                            onChange={(e) => setPaymentData({ ...paymentData, transactionId: e.target.value })}
                                        />
                                    </div>
                                )}
                                <div className="form-group">
                                    <label className="form-label">Notes</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={paymentData.notes}
                                        onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editingPayment ? 'Save Changes' : 'Add Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerDetails;
