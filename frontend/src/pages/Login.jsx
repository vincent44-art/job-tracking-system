
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('Form submitted with:', { email, password: '***' });
      const result = await login(email, password);
      
      if (!result.success) {
      setError(result.error || 'Login failed');
      console.error('Login failed:', result.error);
    } else {
      console.log('Login successful, redirecting...');
      navigate('/');  // 👈 Redirect user to dashboard (or main page)
    }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-4">
      <div className="card card-custom" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <h1 className="h3 mb-3 text-gradient">🍊 FruitTrack</h1>
            <p className="text-muted">Fruit Business Management System</p>
          </div>
          
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-gradient w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          
          <div className="mt-4 p-3 bg-light rounded">
            <small className="text-muted">
              <strong>Demo Credentials:</strong><br />
              CEO: ceo@fruittrack.com<br />
              Password: password123<br />
              <br />
              <strong>Alternative:</strong><br />
              CEO: ceo@company.com<br />
              Password: password<br />
              <em>Note: New users must be added by CEO</em>
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
