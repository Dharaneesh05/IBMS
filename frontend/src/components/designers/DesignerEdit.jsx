import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/api';

const DesignerEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDesigner();
  }, [id]);

  const fetchDesigner = async () => {
    try {
      const response = await api.get(`/designers/${id}`);
      const designer = response.data.designer;
      setFormData({
        name: designer.name,
        email: designer.email,
        status: designer.status
      });
      setLoading(false);
    } catch (err) {
      setError('Failed to load designer');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' 
      ? (e.target.checked ? 'active' : 'inactive')
      : e.target.value;
    
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/designers/${id}`, formData);
      navigate(`/designers/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update designer');
    }
  };

  if (loading) return <div className="loading">Loading designer...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <div className="flex-between mb-3">
        <h2>Edit Designer</h2>
        <Link to={`/designers/${id}`} className="btn btn-secondary">Back to Designer</Link>
      </div>

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

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="status"
                checked={formData.status === 'active'}
                onChange={handleChange}
              />
              {' '}Active
            </label>
          </div>

          <div className="flex gap-1">
            <button type="submit" className="btn btn-success">Update Designer</button>
            <Link to={`/designers/${id}`} className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DesignerEdit;
