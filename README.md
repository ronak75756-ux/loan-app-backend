# 💼 Loan Manager - Full Stack Application

A complete loan management system with React frontend and Node.js backend.

## 🚀 Quick Start

### Prerequisites
- Node.js installed (you already have it!)

### Running the Application

**Terminal 1 - Backend:**
```powershell
cd d:\LoanApp2\backend-js
npm start
```

**Terminal 2 - Frontend:**
```powershell
cd d:\LoanApp2\frontend
npm start
```

**Or use the batch files:**
- Double-click `start-backend-js.bat`
- Double-click `start-frontend.bat`

**Then open:** http://localhost:3000

---

## ✨ Features

### Dashboard
- Total customers count
- Active loans count
- Total outstanding amount
- Today's collection
- Loan summary (disbursed, collected, outstanding)
- Today's collections breakdown (cash/online)

### Customer Management
- Add new customers with loan details
- View all customers in a table
- Automatic interest calculation
- Track loan status (ACTIVE/CLOSED)
- Delete customers

### Payment Management
- Record payments (Cash or Online)
- Automatic balance updates
- Transaction ID tracking for online payments
- Payment notes

### Reports
- Filter payments by date range
- View payment history
- Summary statistics

---

## 🛠️ Technology Stack

### Frontend
- **React** - UI framework
- **Axios** - HTTP client
- **CSS** - Styling

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **CORS** - Cross-origin support

### Database
- **In-Memory** - JavaScript arrays (data resets on restart)

---

## 📁 Project Structure

```
d:\LoanApp2\
├── frontend/                 # React application
│   ├── src/
│   │   ├── pages/           # Dashboard, Customers, Reports
│   │   ├── components/      # Sidebar
│   │   ├── services/        # API calls
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── backend-js/              # Node.js backend
│   ├── server.js           # Main server file
│   └── package.json
│
├── start-frontend.bat      # Windows: Start React
├── start-backend-js.bat    # Windows: Start Node.js
└── README.md              # This file
```

---

## 🎯 API Endpoints

### Dashboard
```
GET /api/dashboard/stats
```

### Customers
```
GET    /api/customers
GET    /api/customers/:id
POST   /api/customers
PUT    /api/customers/:id
DELETE /api/customers/:id
```

### Payments
```
GET    /api/payments
GET    /api/payments/customer/:customerId
GET    /api/payments/date-range?startDate=X&endDate=Y
POST   /api/payments
DELETE /api/payments/:id
```

---

## 💡 Usage Examples

### Add a Customer
1. Click "+ Add New Customer" on Dashboard or Customers page
2. Fill in:
   - Name (required)
   - Phone (required)
   - Address (optional)
   - Loan Amount (required)
   - Interest Rate % per annum (required)
   - Loan Tenure in months (required)
3. Click "Add Customer"
4. System automatically calculates total amount with interest

### Record a Payment
1. Go to Customers page
2. Click 💰 icon next to customer
3. Enter payment amount
4. Select payment method (Cash/Online)
5. Add transaction ID if online
6. Click "Add Payment"
7. Outstanding balance updates automatically
8. Loan status changes to CLOSED when fully paid

### View Reports
1. Click "Reports" in sidebar
2. Optionally select date range
3. Click "Apply Filter"
4. View filtered payment history

---

## 🔧 Development

### Install Dependencies

**Frontend:**
```powershell
cd frontend
npm install
```

**Backend:**
```powershell
cd backend-js
npm install
```

### Run in Development Mode

Both servers support hot-reload:
- Frontend: Changes auto-refresh
- Backend: Restart server to see changes

---

## 📝 Notes

- **Data Persistence**: Currently using in-memory storage. Data resets when backend restarts.
- **Port Configuration**: 
  - Frontend: 3000
  - Backend: 8080
- **CORS**: Enabled for localhost development

---

## 🎨 Design

- Clean, modern UI
- Blue color scheme (#4169E1)
- Responsive layout
- Smooth animations
- Professional tables and forms

---

## 📄 License

ISC

---

## 👨‍💻 Author

Created for loan management needs.

---

**Enjoy your Loan Manager application!** 🎉
