'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Lock, 
  Mail, 
  User,
  ArrowRight, 
  Loader2, 
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from 'next/image';
import { auth } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    if (!formData.name.trim() || !formData.lastName.trim()) {
      setError("Please provide both first and last name");
      setIsLoading(false);
      return;
    }

    try {
      // Ensure we have clean data
      const firstName = formData.name.trim();
      const lastName = formData.lastName.trim();
      const email = formData.email.trim().toLowerCase();
      const password = formData.password;

      // Call backend API with exact format expected by backend
      const result = await auth.register({
        name: firstName,
        lastName: lastName,
        email: email,
        password: password
      });

      // Show success message
      setSuccess(true);
      setRegisteredEmail(result.email);
      // Redirect to login shortly since verification is no longer required
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err: any) {
      console.error('Registration error:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.status,
        response: err.response
      });
      
      // Handle specific error messages
      let errorMessage = 'Registration failed. Please try again.';
      
      // Extract error message from different error types
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      // Check if it's a connection error
      if (errorMessage.includes('Cannot connect to the server') || 
          errorMessage.includes('ERR_CONNECTION_REFUSED') ||
          errorMessage.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to the backend server. Please ensure the backend is running on http://localhost:3001 and try again.';
      } else if (errorMessage.includes('fetch') || errorMessage.includes('NetworkError')) {
        errorMessage = 'Network error. Please check your connection and ensure the backend server is running.';
      } else if (errorMessage.includes('Email already in use') || errorMessage.includes('already exists')) {
        errorMessage = 'This email is already registered. Please use a different email or try logging in.';
      } else if (err?.status === 500 || errorMessage.includes('Internal server error') || errorMessage.includes('Database schema error')) {
        // For 500 errors, try to get more details
        if (err?.response) {
          const backendError = err.response;
          
          // Try multiple ways to extract the error message
          if (Array.isArray(backendError.message)) {
            errorMessage = backendError.message.join(', ');
          } else if (backendError.message && typeof backendError.message === 'string') {
            errorMessage = backendError.message;
          } else if (backendError.error && typeof backendError.error === 'string') {
            errorMessage = backendError.error;
          } else if (backendError.statusCode === 500 && backendError.message) {
            errorMessage = backendError.message;
          } else if (typeof backendError === 'string') {
            errorMessage = backendError;
          } else {
            // Log full error for debugging
            console.error('Full backend error response:', backendError);
            errorMessage = 'Server error occurred. Please check the backend logs for details. Error code: 500';
          }
        } else if (errorMessage.includes('Database schema error')) {
          errorMessage = 'Database schema error. The database is missing required columns. Please contact the administrator to update the database schema.';
        } else {
          errorMessage = 'Server error occurred. Please try again later or contact support.';
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl overflow-hidden backdrop-blur-sm w-full max-w-[450px]">
      
      <div className="text-center border-b border-slate-800/50 bg-slate-900/50">
              
              {/* --- CHANGE: Replaced the icon div with the logo --- */}
              <div className="mx-auto w-50 h-26 relative ">
                 <Image 
                   src="/images/LOGO CQ-13.png"   
                   alt="cq Logo"
                   fill
                   className="object-contain" // Prevents the logo from stretching or warping
                   priority
                 />
              </div>
              {/* --------------------------------------------------------- */}
        </div>
      {/* Form Body */}
      <div className="p-8 pt-6">
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          
          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
              First Name
            </Label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              <Input 
                id="name" 
                type="text" 
                placeholder="John"
                className="pl-10 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/20 transition-all h-11"
                required
                autoComplete="off"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
              Last Name
            </Label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              <Input 
                id="lastName" 
                type="text" 
                placeholder="Doe"
                className="pl-10 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/20 transition-all h-11"
                required
                autoComplete="off"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
              Email
            </Label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              <Input 
                id="email" 
                type="email" 
                placeholder="Email address"
                className="pl-10 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/20 transition-all h-11"
                required
                autoComplete="off"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
              Password
            </Label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"}
                placeholder="••••••"
                className="pl-10 pr-10 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/20 transition-all h-11"
                required
                autoComplete="new-password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
            
          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirm" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
              Confirm Password
            </Label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              <Input 
                id="confirm" 
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••"
                className="pl-10 pr-10 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/20 transition-all h-11"
                required
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg space-y-2">
              <p className="text-sm text-red-400 text-center font-medium">{error}</p>
              {error.includes('backend') && (
                <div className="text-xs text-slate-400 text-center space-y-1 mt-2 pt-2 border-t border-slate-800">
                  <p>To start the backend server:</p>
                  <code className="block bg-slate-900/50 px-2 py-1 rounded text-slate-300 mt-1">
                    cd backend_directory && npm run start:dev
                  </code>
                </div>
              )}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg space-y-2">
              <div className="flex items-center gap-2 justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <p className="text-sm text-green-400 font-medium text-center">
                  Registration Successful!
                </p>
              </div>
              <p className="text-xs text-slate-300 text-center">
                Account created for <span className="font-semibold text-blue-400">{registeredEmail}</span>. You can sign in now.
              </p>
              <p className="text-xs text-slate-500 text-center mt-2">
                Redirecting you to login...
              </p>
            </div>
          )}

          {/* Submit Button */}
          {!success && (
            <Button 
              type="submit" 
              className="w-full h-11 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium shadow-lg shadow-blue-900/20 transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </form>

        {/* Link to Login */}
        {!success && (
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
