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
  Shield 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from 'next/image';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // --- AQUÍ CONECTARÍAS TU BACKEND PARA CREAR USUARIO ---
    // await api.post('/auth/register', formData)...

    setTimeout(() => {
      console.log("Registration data:", formData);
      setIsLoading(false);
      // Redirigir al dashboard o al login tras registro exitoso
      router.push('/login'); 
    }, 1500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl overflow-hidden backdrop-blur-sm w-full max-w-[450px]">
      
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
        </div>
      {/* Form Body */}
      <div className="p-8 pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
              Full Name
            </Label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              <Input 
                id="name" 
                type="text" 
                placeholder="John Doe"
                className="pl-10 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-blue-500 h-11"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
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
                className="pl-10 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-blue-500 h-11"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          {/* Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                Password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••"
                  className="pl-10 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-blue-500 h-11"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                Confirm
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                <Input 
                  id="confirm" 
                  type="password" 
                  placeholder="••••••"
                  className="pl-10 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-blue-500 h-11"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full h-11 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium shadow-lg shadow-blue-900/20 transition-all"
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
        </form>

        {/* Link to Login */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}