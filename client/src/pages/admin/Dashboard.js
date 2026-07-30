import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  return (
    <div className="admin-dashboard page">
      <div className="container">
        <h1 className="page-title">Admin Dashboard</h1>

        <div className="dashboard-grid fade-in">
          <Link to="/admin/games" className="dashboard-card glass">
            <span className="dashboard-icon">🎲</span>
            <h2 className="dashboard-card-title">Games</h2>
            <p className="dashboard-card-desc">Add, edit, and delete board games. Manage stock and categories.</p>
            <span className="dashboard-link">Manage Games →</span>
          </Link>

          <Link to="/admin/games/new" className="dashboard-card glass">
            <span className="dashboard-icon">➕</span>
            <h2 className="dashboard-card-title">Add New Game</h2>
            <p className="dashboard-card-desc">Create a new game listing with BGG auto-fill, image upload, and PDF rules.</p>
            <span className="dashboard-link">Add Game →</span>
          </Link>

          <Link to="/admin/orders" className="dashboard-card glass">
            <span className="dashboard-icon">📦</span>
            <h2 className="dashboard-card-title">Orders</h2>
            <p className="dashboard-card-desc">View all customer orders. Update statuses and track shipments.</p>
            <span className="dashboard-link">Manage Orders →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
