const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(express.json());

// Data storage structure
let data = {
    customers: [],
    payments: [],
    customerId: 1,
    paymentId: 1
};

// Load data from file
function loadData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const fileData = fs.readFileSync(DATA_FILE, 'utf8');
            data = JSON.parse(fileData);
            console.log('✅ Data loaded from data.json');
        } else {
            console.log('ℹ️ No data.json found, starting with empty data');
            saveData(); // Create the file
        }
    } catch (error) {
        console.error('❌ Error loading data:', error);
    }
}

// Save data to file
function saveData() {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        console.log('💾 Data saved to data.json');
    } catch (error) {
        console.error('❌ Error saving data:', error);
    }
}

// Initialize data
loadData();

// Helper function to calculate interest
function calculateTotalAmount(loanAmount, interestRate, loanTenure) {
    const principal = Number(loanAmount);
    const interest = (principal * Number(interestRate) * Number(loanTenure)) / (100 * 12);
    return principal + interest;
}

// Helper function to get today's start and end
function getTodayRange() {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    return { startOfDay, endOfDay };
}

// ==================== DASHBOARD ROUTES ====================

app.get('/api/dashboard/stats', (req, res) => {
    const totalCustomers = data.customers.length;
    const activeLoans = data.customers.filter(c => c.status === 'ACTIVE').length;
    const totalDisbursed = data.customers.reduce((sum, c) => Number(sum) + Number(c.loanAmount), 0);
    const totalCollected = data.customers.reduce((sum, c) => Number(sum) + Number(c.amountPaid), 0);
    const totalOutstanding = data.customers.reduce((sum, c) => Number(sum) + Number(c.outstandingAmount), 0);

    const { startOfDay, endOfDay } = getTodayRange();
    const todayPayments = data.payments.filter(p => {
        const paymentDate = new Date(p.paymentDate);
        return paymentDate >= startOfDay && paymentDate <= endOfDay;
    });

    const todayCollection = todayPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const cashPayments = todayPayments
        .filter(p => p.paymentMethod === 'CASH')
        .reduce((sum, p) => sum + Number(p.amount), 0);
    const onlinePayments = todayPayments
        .filter(p => p.paymentMethod === 'ONLINE')
        .reduce((sum, p) => sum + Number(p.amount), 0);
    const numberOfPayments = todayPayments.length;

    res.json({
        totalCustomers,
        activeLoans,
        totalOutstanding,
        todayCollection,
        totalDisbursed,
        totalCollected,
        cashPayments,
        onlinePayments,
        numberOfPayments
    });
});

// ==================== CUSTOMER ROUTES ====================

app.get('/api/customers', (req, res) => {
    res.json(data.customers);
});

app.get('/api/customers/active', (req, res) => {
    const activeCustomers = data.customers.filter(c => c.status === 'ACTIVE');
    res.json(activeCustomers);
});

app.get('/api/customers/:id', (req, res) => {
    const customer = data.customers.find(c => c.id === parseInt(req.params.id));
    if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
});

app.post('/api/customers', (req, res) => {
    const { name, phone, address, loanAmount, interestRate, loanTenure, dailyInstallment, durationDays, startDate, createdAt } = req.body;

    let totalAmount;
    let finalStartDate = startDate || new Date().toISOString();
    let finalCreatedAt = createdAt || new Date().toISOString();

    if (dailyInstallment && durationDays) {
        // New Daily Installment Model
        totalAmount = Number(dailyInstallment) * Number(durationDays);
    } else {
        // Old Interest Rate Model
        totalAmount = calculateTotalAmount(loanAmount, interestRate, loanTenure);
    }

    const newCustomer = {
        id: data.customerId++,
        name,
        phone,
        address: address || '',
        loanAmount: parseFloat(loanAmount),
        interestRate: interestRate ? parseFloat(interestRate) : 0,
        loanTenure: loanTenure ? parseInt(loanTenure) : 0,
        dailyInstallment: dailyInstallment ? parseFloat(dailyInstallment) : 0,
        durationDays: durationDays ? parseInt(durationDays) : 0,
        totalAmount,
        amountPaid: 0,
        outstandingAmount: totalAmount,
        loanDate: finalStartDate,
        status: 'ACTIVE',
        createdAt: finalCreatedAt,
        updatedAt: null
    };

    data.customers.push(newCustomer);
    saveData();
    res.status(201).json(newCustomer);
});

app.put('/api/customers/:id', (req, res) => {
    const customer = data.customers.find(c => c.id === parseInt(req.params.id));
    if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
    }

    const { name, phone, address } = req.body;
    customer.name = name || customer.name;
    customer.phone = phone || customer.phone;
    customer.address = address || customer.address;
    customer.updatedAt = new Date().toISOString();

    saveData();
    res.json(customer);
});

app.delete('/api/customers/:id', (req, res) => {
    const index = data.customers.findIndex(c => c.id === parseInt(req.params.id));
    if (index === -1) {
        return res.status(404).json({ error: 'Customer not found' });
    }

    // Also delete associated payments
    data.payments = data.payments.filter(p => p.customerId !== parseInt(req.params.id));

    data.customers.splice(index, 1);
    saveData();
    res.status(204).send();
});

// ==================== PAYMENT ROUTES ====================

app.get('/api/payments', (req, res) => {
    const paymentsWithCustomer = data.payments.map(p => {
        const customer = data.customers.find(c => c.id === p.customerId);
        return {
            ...p,
            customerName: customer ? customer.name : 'Unknown'
        };
    });
    res.json(paymentsWithCustomer);
});

app.get('/api/payments/customer/:customerId', (req, res) => {
    const customerPayments = data.payments.filter(p => p.customerId === parseInt(req.params.customerId));
    res.json(customerPayments);
});

app.get('/api/payments/date-range', (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.json(data.payments.map(p => {
            const customer = data.customers.find(c => c.id === p.customerId);
            return {
                ...p,
                customerName: customer ? customer.name : 'Unknown'
            };
        }));
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const filteredPayments = data.payments.filter(p => {
        const paymentDate = new Date(p.paymentDate);
        return paymentDate >= start && paymentDate <= end;
    }).map(p => {
        const customer = data.customers.find(c => c.id === p.customerId);
        return {
            ...p,
            customerName: customer ? customer.name : 'Unknown'
        };
    });

    res.json(filteredPayments);
});

app.post('/api/payments', (req, res) => {
    const { customerId, amount, paymentMethod, transactionId, notes } = req.body;

    const customer = data.customers.find(c => c.id === parseInt(customerId));
    if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
    }

    const newPayment = {
        id: data.paymentId++,
        customerId: parseInt(customerId),
        amount: parseFloat(amount),
        paymentMethod,
        transactionId: transactionId || null,
        notes: notes || '',
        paymentDate: req.body.paymentDate || new Date().toISOString(),
        createdAt: new Date().toISOString()
    };

    data.payments.push(newPayment);

    // Update customer's payment status
    customer.amountPaid = Number(customer.amountPaid) + parseFloat(amount);
    customer.outstandingAmount = Number(customer.totalAmount) - customer.amountPaid;

    if (customer.outstandingAmount <= 0) {
        customer.status = 'CLOSED';
        customer.outstandingAmount = 0;
    }

    customer.updatedAt = new Date().toISOString();

    saveData();

    res.status(201).json({
        ...newPayment,
        customerName: customer.name
    });
});

app.put('/api/payments/:id', (req, res) => {
    const payment = data.payments.find(p => p.id === parseInt(req.params.id));
    if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
    }

    const { amount, paymentMethod, transactionId, notes, paymentDate } = req.body;
    const oldAmount = Number(payment.amount);
    const newAmount = parseFloat(amount);

    const customer = data.customers.find(c => c.id === payment.customerId);
    if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
    }

    // Update payment details
    payment.amount = newAmount;
    payment.paymentMethod = paymentMethod || payment.paymentMethod;
    payment.transactionId = transactionId || payment.transactionId;
    payment.notes = notes || payment.notes;
    if (paymentDate) {
        payment.paymentDate = paymentDate;
    }
    payment.updatedAt = new Date().toISOString();

    // Update customer totals
    // 1. Remove old amount
    customer.amountPaid = Number(customer.amountPaid) - oldAmount;
    // 2. Add new amount
    customer.amountPaid += newAmount;

    // Recalculate outstanding
    customer.outstandingAmount = Number(customer.totalAmount) - customer.amountPaid;

    // Update status
    if (customer.outstandingAmount <= 0) {
        customer.status = 'CLOSED';
        customer.outstandingAmount = 0;
    } else {
        customer.status = 'ACTIVE';
    }

    customer.updatedAt = new Date().toISOString();

    saveData();
    res.json(payment);
});

app.delete('/api/payments/:id', (req, res) => {
    const payment = data.payments.find(p => p.id === parseInt(req.params.id));
    if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
    }

    // Reverse the payment from customer
    const customer = data.customers.find(c => c.id === payment.customerId);
    if (customer) {
        customer.amountPaid = Number(customer.amountPaid) - Number(payment.amount);
        customer.outstandingAmount = Number(customer.totalAmount) - customer.amountPaid;
        customer.status = 'ACTIVE';
        customer.updatedAt = new Date().toISOString();
    }

    // Remove payment
    const index = data.payments.findIndex(p => p.id === parseInt(req.params.id));
    data.payments.splice(index, 1);

    saveData();
    res.status(204).send();
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   Loan Manager Backend (JavaScript)    ║
║                                        ║
║   Server running on port ${PORT}         ║
║   API: http://localhost:${PORT}/api      ║
║   Storage: Local File (data.json)      ║
║                                        ║
║   ✅ Data Persistence Enabled!         ║
╚════════════════════════════════════════╝
    `);
});
