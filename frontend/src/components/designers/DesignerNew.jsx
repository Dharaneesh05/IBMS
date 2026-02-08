import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/api';

const DesignerNew = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/designers', formData);
      navigate('/designers');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create designer');
    }
  };

  return (
    <div>
      <div className="flex-between mb-3">
        <h2>Add New Designer</h2>
        <Link to="/designers" className="btn btn-secondary">Back to Designers</Link>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex gap-1">
            <button type="submit" className="btn btn-success">Create Designer</button>
            <Link to="/designers" className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DesignerNew;
