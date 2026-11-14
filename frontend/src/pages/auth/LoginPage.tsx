import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Navigation,
  ShieldAlert,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { success } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await login(email, password);
      success('Welcome back!', `Signed in as ${user.name}`);
      if (user.role === 'DRIVER') {
        navigate('/driver/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Invalid credentials. Please verify your email and password.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg(null);
  };

  const demoProfiles = [
    { label: 'Admin', email: 'admin@fleetops.com', password: 'Admin@123', icon: ShieldCheck },
    {
      label: 'Dispatcher',
      email: 'dispatcher@fleetops.com',
      password: 'Dispatch@123',
      icon: Navigation,
    },
    { label: 'Driver', email: 'driver@fleetops.com', password: 'Driver@123', icon: Truck },
  ];

  return (
    <div className="auth-login-content">
      <header className="auth-login-heading">
        <p className="auth-mobile-brand">FleetOps <span>•</span> SECURE ACCESS</p>
        <h2>Welcome to FleetOps</h2>
        <p>Sign in to your account to continue.</p>
      </header>

      {errorMsg && (
        <div
          className="auth-error-message"
          role="alert"
        >
          <ShieldAlert className="auth-error-icon" aria-hidden="true" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-login-form">
        <div className="auth-field">
          <label htmlFor="login-email" className="auth-field-label">
            Email address
          </label>
          <div className="auth-input-wrap">
            <Mail className="auth-input-icon" aria-hidden="true" />
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@fleetops.com"
              autoComplete="username"
              className="auth-input"
            />
          </div>
        </div>

        <div className="auth-field">
          <div className="auth-label-row">
            <label htmlFor="login-password" className="auth-field-label">
              Password
            </label>
            <Link to="/forgot-password" className="auth-forgot-link">
              Forgot password?
            </Link>
          </div>
          <div className="auth-input-wrap">
            <Lock className="auth-input-icon" aria-hidden="true" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="auth-input auth-password-input"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="auth-password-toggle"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
            </button>
          </div>
        </div>

        <label htmlFor="remember-me" className="auth-remember-row">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="auth-checkbox"
          />
          <span>Remember me on this device</span>
        </label>

        <button type="submit" disabled={isLoading} className="auth-submit-button">
          {isLoading ? (
            <>
              <span className="auth-spinner" aria-hidden="true" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <section className="auth-demo-section" aria-labelledby="demo-heading">
        <div className="auth-demo-heading">
          <span />
          <h3 id="demo-heading">Quick Demo Credentials</h3>
          <span />
        </div>
        <div className="auth-demo-grid">
          {demoProfiles.map((profile) => {
            const Icon = profile.icon;
            const isSelected = email === profile.email;
            return (
              <button
                key={profile.label}
                type="button"
                onClick={() => fillDemo(profile.email, profile.password)}
                className={`auth-demo-card${isSelected ? ' is-selected' : ''}`}
                aria-pressed={isSelected}
              >
                <span className="auth-demo-icon">
                  <Icon aria-hidden="true" />
                </span>
                <span className="auth-demo-label">{profile.label}</span>
                <span className="auth-demo-email">{profile.email}</span>
              </button>
            );
          })}
        </div>
        <p className="auth-demo-hint">Select a profile to fill in its demo credentials.</p>
      </section>
    </div>
  );
};
