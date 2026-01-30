import React from 'react';

const Sidebar = ({ currentPage, onPageChange }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'customers', label: 'Customers', icon: '👥' },
        { id: 'reports', label: 'Reports', icon: '📄' },
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-logo">Loan Manager</div>
            <ul className="sidebar-menu">
                {menuItems.map((item) => (
                    <li
                        key={item.id}
                        className={`sidebar-menu-item ${currentPage === item.id ? 'active' : ''}`}
                        onClick={() => onPageChange(item.id)}
                    >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;
