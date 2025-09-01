import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SetupTotp = () => {
  const [userId, setUserId] = useState('');
  const [qr, setQr] = useState(null);
  const [secret, setSecret] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/auth/setup-totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to generate QR code');
      setQr(data.qr);
      setSecret(data.secret);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Set Up Authenticator App</h2>
        {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

        {!qr ? (
          <form onSubmit={handleGenerate} className="space-y-4">
            <input
              type="text"
              placeholder="Enter your user ID"
              className="w-full px-3 py-2 border rounded"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Generate QR
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
      </div>
    </div>
  );
};

export default SetupTotp;
