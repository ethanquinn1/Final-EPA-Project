import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [qr, setQr] = useState(null);
  const [secret, setSecret] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      return setError('Passwords do not match');
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      const setupRes = await fetch('/api/auth/setup-totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: data.userId })
      });
      const setupData = await setupRes.json();
      if (!setupRes.ok) throw new Error(setupData.message || 'Failed to generate QR');

      setQr(setupData.qr);
      setSecret(setupData.secret);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
        {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

        {!qr ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full px-3 py-2 border rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-3 py-2 border rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full px-3 py-2 border rounded"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Register
            </button>
          </form>
        ) : (
          <div className="text-center">
            <p className="mb-4">Scan this QR code with your authenticator app:</p>
            <img src={qr} alt="Authenticator QR Code" className="mx-auto mb-4" />
            <p className="text-sm text-gray-600">Backup code (manual entry):</p>
            <code className="text-blue-700 font-mono break-all">{secret}</code>
            <p className="mt-6 text-sm">
              <a href="/login" className="text-blue-600 hover:underline">Go to Login</a>
            </p>
          </div>
        )}

        {!qr && (
          <p className="text-sm text-center mt-4">
            Already have an account? <a href="/login" className="text-blue-600 hover:underline">Login here</a>
          </p>
        )}
      </div>
    </div>
  );
};

export default Register;
