import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/api';

const DesignerShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [designer, setDesigner] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDesigner();
  }, [id]);

  const fetchDesigner = async () => {
    try {
      const response = await api.get(`/designers/${id}`);
      setDesigner(response.data.designer);
      setProducts(response.data.products);
      setLoading(false);
    } catch (err) {
      setError('Failed to load designer');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure? This will also delete all products by this designer.')) {
      try {
        await api.delete(`/designers/${id}`);
        navigate('/designers');
      } catch (err) {
        alert('Failed to delete designer');
      }
    }
  };

  if (loading) return <div className="loading">Loading designer...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!designer) return null;

  return (
    <div>
      <div className="flex-between mb-3">
        <h2>Designer Details</h2>
        <div className="flex gap-1">
          <Link to="/designers" className="btn btn-secondary">Back to Designers</Link>
          <Link to={`/designers/${id}/edit`} className="btn btn-primary">Edit</Link>
          <button onClick={handleDelete} className="btn btn-danger">Delete</button>
        </div>
      </div>

      <div className="card">
        <h3>{designer.name}</h3>
        
        <div style={{ marginTop: '1.5rem' }}>
          <p><strong>Email:</strong> {designer.email}</p>
          <p>
            <strong>Status:</strong>{' '}
            <span className={`badge ${designer.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
              {designer.status}
            </span>
          </p>
        </div>
      </div>

      <div className="card">
        <h3>Products by {designer.name}</h3>
        {products.length === 0 ? (
          <p>No products by this designer yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Cost</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>
                    <Link to={`/products/${product._id}`}>{product.name}</Link>
                  </td>
                  <td>{product.type}</td>
                  <td>{product.quantity}</td>
                  <td>${product.cost}</td>
                  <td>${product.price}</td>
                  <td>
                    <Link to={`/products/${product._id}/edit`} className="btn btn-primary">
                      Edit
                    </Link>
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

export default DesignerShow;
