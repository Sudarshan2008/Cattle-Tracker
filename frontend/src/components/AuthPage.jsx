import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ username: '', email: '', password: '' });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? 'login' : 'signup';
      const url = `http://localhost:5000/api/auth/${endpoint}`;

      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await axios.post(url, payload);

      if (isLogin) {
        const { token, username } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        navigate('/dashboard');
      } else {
        alert('Signup successful! You can now log in.');
        setIsLogin(true);
      }

    } catch (err) {
      const message = err?.response?.data?.message || 'Something went wrong';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-4">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8">
        
        {/* Toggle Header */}
        <div className="flex justify-around mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`text-lg font-semibold px-4 py-2 rounded ${
              isLogin ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`text-lg font-semibold px-4 py-2 rounded ${
              !isLogin ? 'bg-green-ce600 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Sign Up
          </button>
        </div>

        <h2 className="text-2xl font-bold text-center text-green-700 mb-4">
          {isLogin ? 'Welcome Back' : 'Create an Account'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="john_doe"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>
          )}

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (isLogin ? 'Logging in...' : 'Signing up...') : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;