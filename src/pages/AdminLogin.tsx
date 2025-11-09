import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'admin'
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        setSignupSuccess(true);
        setShowSignup(false);
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create admin account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">Admin Login</h1>
          <p className="text-secondary-600">Access the administrative dashboard</p>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-8">
          {signupSuccess && (
            <div className="mb-4 p-4 bg-success-50 border border-success-200 rounded-lg text-success-700 text-sm">
              Admin account created successfully! Logging in...
            </div>
          )}

          {!showSignup ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-error-50 border border-error-200 rounded-lg text-error-700 text-sm">
                  {error}
                </div>
              )}

              <Input
                id="email"
                type="email"
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="admin@example.com"
              />

              <Input
                id="password"
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
              />

              <Button type="submit" className="w-full" loading={loading}>
                Sign In
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowSignup(true)}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Create Admin Account
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-6">
              {error && (
                <div className="p-4 bg-error-50 border border-error-200 rounded-lg text-error-700 text-sm">
                  {error}
                </div>
              )}

              <div className="p-4 bg-info-50 border border-info-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-info-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-info-800">
                    <p className="font-semibold mb-1">Create Admin Account</p>
                    <p>This will create the first admin account for your platform. Choose a strong password.</p>
                  </div>
                </div>
              </div>

              <Input
                id="signup-email"
                type="email"
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="admin@example.com"
              />

              <Input
                id="signup-password"
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Choose a strong password"
              />

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowSignup(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" loading={loading}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Admin
                </Button>
              </div>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-secondary-500">
          This area is restricted to authorized administrators only
        </p>
      </div>
    </div>
  );
}
