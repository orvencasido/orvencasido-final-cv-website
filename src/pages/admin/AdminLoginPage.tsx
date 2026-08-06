import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Mail, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { loginSchema, LoginFormData } from '../../lib/schemas';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/orven/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setAuthError(null);

    const result = await login(data.email, data.password);

    if (result.success) {
      showToast('Welcome back, Administrator!', 'success');
      navigate('/orven/dashboard', { replace: true });
    } else {
      setAuthError(result.error || 'Authentication failed. Please check your credentials.');
      showToast('Login failed', 'error', result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-beige-100 text-matcha-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-matcha-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-matcha-100 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">

          <h1 className="text-2xl font-extrabold tracking-tight text-matcha-950">
            Admin CMS Authentication
          </h1>
          <p className="text-xs font-semibold text-matcha-700">
            Sign in to manage portfolio content
          </p>
        </div>

        {/* Login Form Box */}
        <div className="p-8 rounded-3xl border border-beige-300 bg-beige-50 shadow-xl space-y-6">
          {authError && (
            <div className="p-4 rounded-2xl bg-red-950/90 border border-red-800 text-red-100 text-xs flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-300 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">Administrator Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-matcha-600" />
                <input
                  type="email"
                  placeholder="Enter administrator email"
                  {...register('email')}
                  className="w-full pl-11 pr-4 py-3 text-sm bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 placeholder:text-matcha-700/60 focus:outline-none focus:ring-2 focus:ring-matcha-500 transition font-medium"
                />
              </div>
              {errors.email && <p className="text-xs text-red-600 font-medium">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">Master Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-matcha-600" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  {...register('password')}
                  className="w-full pl-11 pr-11 py-3 text-sm bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 placeholder:text-matcha-700/60 focus:outline-none focus:ring-2 focus:ring-matcha-500 transition font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-matcha-600 hover:text-matcha-950 p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-600 font-medium">{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 text-sm font-extrabold text-beige-50 bg-matcha-900 hover:bg-matcha-800 rounded-full shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              {loading ? (
                <span>Verifying credentials...</span>
              ) : (
                <>
                  Authenticate <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back to public site shortcut */}
        <div className="text-center">
          <a
            href="/"
            className="text-xs font-bold text-matcha-700 hover:text-matcha-950 transition inline-flex items-center gap-1.5"
          >
            ← Return to Public Portfolio
          </a>
        </div>
      </div>
    </div>
  );
};
