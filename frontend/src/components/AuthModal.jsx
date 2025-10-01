import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthModal = ({ isOpen, onClose, defaultMode = 'signin' }) => {
  const [mode, setMode] = useState(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  // Reset to default mode when the modal is reopened
  useEffect(() => {
    if (isOpen) {
        setMode(defaultMode);
        setEmail('');
        setPassword('');
    }
  }, [isOpen, defaultMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const action = mode === 'signin' ? signIn : signUp;
    const result = await action(email, password);
    if (result.success) {
      onClose(); // Close the modal on successful login/signup
    }
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 animate-fade-in"
        onClick={onClose}
    >
      <div 
        className="bg-cream rounded-lg shadow-2xl p-8 w-full max-w-md relative animate-slide-up-fast"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        
        <div className="text-left mb-6">
            <h2 className="text-3xl font-serif font-bold text-navy">
                {mode === 'signin' ? 'Welcome Back' : 'Get Started'}
            </h2>
            <p className="text-gray-600 mt-1 font-sans">
                {mode === 'signin' ? 'Sign in to your NextRead account' : 'Create your NextRead account'}
            </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1 font-sans text-sm font-semibold" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-golden font-sans"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-1 font-sans text-sm font-semibold" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-golden font-sans"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-golden text-navy rounded-md font-semibold hover:bg-yellow-500 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : (mode === 'signin' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6 font-sans text-sm">
          {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} className="text-emerald font-semibold hover:underline">
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;