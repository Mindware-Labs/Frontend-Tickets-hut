'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Loader2, 
  ShieldCheck 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulación de delay de red
    setTimeout(() => {
      console.log("Login attempted with:", formData);
      
      // IMPORTANTE: Establecer la cookie que el middleware verificará
      document.cookie = `auth-token=login-success-token; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
      
      setIsLoading(false);
      // Redireccionar al Dashboard tras éxito
      router.push('/dashboard'); 
    }, 1500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl overflow-hidden backdrop-blur-sm">
      
      {/* Header del Card */}
      <div className="text-center border-b border-slate-800/50 bg-slate-900/50">
        
        {/* --- CAMBIO: Reemplazamos el div del icono por el logo --- */}
        <div className="mx-auto w-50 h-26 relative ">
           <Image 
             src="/images/LOGO CQ-13.png"   
             alt="cq Logo"
             fill
             className="object-contain" // Esto evita que el logo se estire o deforme
             priority
           />
        </div>
        {/* --------------------------------------------------------- */}

        <h1 className="text-2xl font-bold text-white tracking-tight "></h1>
      </div>

      {/* Body del Card */}
      <div className="p-8 pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
              Work Email
            </Label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              <Input 
                id="email" 
                type="email" 
                placeholder="Email address"
                className="pl-10 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/20 transition-all h-11"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                Password
              </Label>
              <Link href="#" className="text-xs text-blue-500 hover:text-blue-400 font-medium hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                className="pl-10 pr-10 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/20 transition-all h-11"
                required
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

         

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium shadow-lg shadow-blue-900/20 transition-all duration-200"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

        </form>
      </div>

      {/* Footer */}
         <p className="text-sm text-slate-400 text-center p-3">
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition-colors">
              Sign Up
            </Link>
            </p>
      <div className="p-4 border-t border-slate-600 bg-slate-950/50 text-center">
        <p className="text-xs text-slate-400">
          System used by CCQUEST and RIG HUT personnel.
            Access is restricted to authorized users only. <br/>
          <span className="text-slate-600">Powered by Mindware Labs.</span>
        </p>
      </div>
    </div>
  );
}