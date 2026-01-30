import React, { useState, useEffect } from 'react';
import { customerService, paymentService } from '../services/api';

const Customers = ({ onCustomerClick }) => {
    const [customers, setCustomers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
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
    const [paymentData, setPaymentData] = useState({
        amount: '',
        paymentMethod: 'CASH',
        transactionId: '',
        notes: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
    });

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            const response = await customerService.getAll();
            setCustomers(response.data);
        } catch (error) {
            console.error('Error loading customers:', error);
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
            loadCustomers();
        } catch (error) {
            console.error('Error creating customer:', error);
        }
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        try {
            const combinedDate = new Date(`${paymentData.date}T${paymentData.time}:00`).toISOString();
            await paymentService.create({
                ...paymentData,
                paymentDate: combinedDate,
                customerId: selectedCustomer.id,
            });
            setShowPaymentModal(false);
            setPaymentData({
                amount: '',
                paymentMethod: 'CASH',
                transactionId: '',
                notes: '',
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
            });
            setSelectedCustomer(null);
            loadCustomers();
        } catch (error) {
            console.error('Error creating payment:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            try {
                await customerService.delete(id);
                loadCustomers();
            } catch (error) {
                console.error('Error deleting customer:', error);
            }
        }
    };

    const openPaymentModal = (customer) => {
        setSelectedCustomer(customer);
        setShowPaymentModal(true);
    };

    const formatCurrency = (amount) => {
        return `₹${amount?.toLocaleString('en-IN') || 0}`;
    };

    return (
        <div className="main-content">
            <div className="page-header-actions">
                <div className="page-header">
                    <h1 className="page-title">Customers</h1>
                    <p className="page-subtitle">Manage all your customers and their loans</p>
                </div>
                <button className="btn-primary" onClick={() => setShowModal(true)}>
                    + Add Customer
                </button>
            </div>

            <div className="content-card">
                <h3 className="content-card-title">All Customers</h3>

                {customers.length === 0 ? (
                    <div className="empty-state">
                        <p className="empty-state-text">No customers found</p>
                        <button className="btn-primary" onClick={() => setShowModal(true)}>
                            Add your First Customer
                        </button>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Phone</th>
                                    <th>Loan Amount</th>
                                    <th>Total Amount</th>
                                    <th>Paid</th>
                                    <th>Outstanding</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((customer) => (
                                    <tr key={customer.id}>
                                        <td
                                            onClick={() => onCustomerClick && onCustomerClick(customer.id)}
                                            style={{ cursor: 'pointer', color: 'var(--primary-blue)', fontWeight: 500 }}
                                        >
                                            {customer.name}
                                        </td>
                                        <td>{customer.phone}</td>
                                        <td>{formatCurrency(customer.loanAmount)}</td>
                                        <td>{formatCurrency(customer.totalAmount)}</td>
                                        <td>{formatCurrency(customer.amountPaid)}</td>
                                        <td>{formatCurrency(customer.outstandingAmount)}</td>
                                        <td>
                                            <span className={`badge ${customer.status === 'ACTIVE' ? 'success' : 'warning'}`}>
                                                {customer.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-icon"
                                                    onClick={() => openPaymentModal(customer)}
                                                    title="Add Payment"
                                                >
                                                    💰
                                                </button>
                                                <button
                                                    className="btn-icon"
                                                    onClick={() => handleDelete(customer.id)}
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

            {/* Add Payment Modal */}
            {showPaymentModal && selectedCustomer && (
                <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Add Payment - {selectedCustomer.name}</h2>
                            <button className="modal-close" onClick={() => setShowPaymentModal(false)}>×</button>
                        </div>
                        <form onSubmit={handlePaymentSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Outstanding: {formatCurrency(selectedCustomer.outstandingAmount)}</label>
                                </div>
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
                                <button type="button" className="btn-secondary" onClick={() => setShowPaymentModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Add Payment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;
