
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const UserManagementTab = () => {
  const { addUser, updateUser, deleteUser, getAllUsers } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    status: 'active'
  });

  const users = getAllUsers();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (addUser(formData)) {
      setFormData({
        name: '',
        email: '',
        role: '',
        status: 'active'
      });
      setShowAddForm(false);
    }
  };

  const handleStatusToggle = (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    updateUser(userId, { status: newStatus });
  };

  const handleDelete = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(userId);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>User Management</h2>
        <button
          className="btn btn-gradient"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Add User
        </button>
      </div>

      {showAddForm && (
        <div className="card card-custom mb-4">
          <div className="card-body">
            <h5 className="card-title text-gradient">Add New User</h5>
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Role</label>
                <select
                  className="form-control"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  required
                >
                  <option value="">Select Role</option>
                  <option value="purchaser">Purchaser</option>
                  <option value="seller">Seller</option>
                  <option value="driver">Driver</option>
                </select>
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-gradient">
                  Add User
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card card-custom">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${
                        user.role === 'ceo' ? 'bg-danger' :
                        user.role === 'purchaser' ? 'bg-primary' :
                        user.role === 'seller' ? 'bg-success' :
                        user.role === 'driver' ? 'bg-warning' : 'bg-secondary'
                      }`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${user.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      {user.role !== 'ceo' && (
                        <div className="btn-group">
                          <button
                            className={`btn btn-sm ${user.status === 'active' ? 'btn-warning' : 'btn-success'}`}
                            onClick={() => handleStatusToggle(user.id, user.status)}
                          >
                            <i className={`bi ${user.status === 'active' ? 'bi-lock' : 'bi-unlock'}`}></i>
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(user.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementTab;
