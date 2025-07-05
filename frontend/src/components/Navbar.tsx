
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ceo': return 'bg-danger';
      case 'purchaser': return 'bg-primary';
      case 'seller': return 'bg-success';
      case 'driver': return 'bg-warning';
      default: return 'bg-secondary';
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-custom">
      <div className="container">
        <a className="navbar-brand" href="/">
          🍊 FruitTrack
        </a>
        
        <div className="navbar-nav ms-auto">
          <div className="nav-item dropdown">
            <a 
              className="nav-link dropdown-toggle d-flex align-items-center" 
              href="#" 
              role="button" 
              data-bs-toggle="dropdown"
            >
              <span className={`badge ${getRoleColor(user?.role || '')} me-2`}>
                {user?.role?.toUpperCase()}
              </span>
              {user?.name}
            </a>
            <ul className="dropdown-menu">
              <li>
                <span className="dropdown-item-text">
                  <small className="text-muted">{user?.email}</small>
                </span>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button className="dropdown-item" onClick={logout}>
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
