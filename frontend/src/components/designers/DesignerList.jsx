import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';

const DesignerList = () => {
  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDesigners();
  }, []);

  const fetchDesigners = async () => {
    try {
      const response = await api.get('/designers');
      setDesigners(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load designers');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure? This will also delete all products by this designer.')) {
      try {
        await api.delete(`/designers/${id}`);
        fetchDesigners();
      } catch (err) {
        alert('Failed to delete designer');
      }
    }
  };

  if (loading) return <div className="loading">Loading designers...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <div className="flex-between mb-3">
        <h2>Designers</h2>
        <Link to="/designers/new" className="btn btn-primary">Add New Designer</Link>
      </div>

      <div className="card">
        {designers.length === 0 ? (
          <p>No designers found. <Link to="/designers/new">Add a designer</Link></p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {designers.map((designer) => (
                <tr key={designer._id}>
                  <td>
                    <Link to={`/designers/${designer._id}`}>{designer.name}</Link>
                  </td>
                  <td>{designer.email}</td>
                  <td>
                    <span className={`badge ${designer.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {designer.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <Link to={`/designers/${designer._id}/edit`} className="btn btn-primary">
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(designer._id)} 
                        className="btn btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DesignerList;
