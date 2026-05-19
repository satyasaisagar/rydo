'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Car, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

const schema = z.object({
  name:        z.string().min(2, 'Name must be at least 2 characters'),
  email:       z.string().email('Invalid email'),
  phone:       z.string().min(10, 'Enter a valid phone number'),
  password:    z.string().min(8, 'Password must be at least 8 characters'),
  gender:      z.enum(['male', 'female', 'other']).optional(),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [userId, setUserId]             = useState<string | null>(null);
  const [otp, setOtp]                   = useState('');
  const { register: registerUser, verifyOtp, isLoading } = useAuthStore();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await registerUser(data);
      setUserId(res.userId);
      toast.success('OTP sent to your phone!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed');
    }
  };

  const handleVerifyOtp = async () => {
    if (!userId || otp.length !== 6) return;
    try {
      await verifyOtp(userId, otp);
      toast.success('Account verified! Welcome to Rydo 🚗');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid OTP');
    }
  };

  if (userId) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2.5 justify-center mb-10">
            <div className="w-9 h-9 bg-[#00C853] rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-black" />
            </div>
            <span className="text-white font-bold text-2xl">rydo</span>
          </Link>

          <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-[#00C853]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">📱</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Verify your phone</h2>
            <p className="text-white/40 text-sm mb-8">We've sent a 6-digit OTP to your phone number</p>

            <input
              type="text"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              className="rydo-input text-center text-2xl tracking-[1rem] font-mono mb-6"
            />

            <button onClick={handleVerifyOtp} disabled={isLoading || otp.length !== 6}
              className="rydo-btn-primary w-full">
              {isLoading ? 'Verifying...' : 'Verify & Continue'}
            </button>

            <button onClick={() => setUserId(null)} className="mt-4 text-sm text-white/30 hover:text-white/60 transition-colors">
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2.5 justify-center mb-10">
          <div className="w-9 h-9 bg-[#00C853] rounded-lg flex items-center justify-center">
            <Car className="w-5 h-5 text-black" />
          </div>
          <span className="text-white font-bold text-2xl">rydo</span>
        </Link>

        <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
          <p className="text-white/40 text-sm mb-8">Join thousands of smart commuters</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="rydo-label">Full Name</label>
              <input placeholder="John Doe" {...register('name')} className="rydo-input" />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="rydo-label">Email address</label>
              <input type="email" placeholder="you@example.com" {...register('email')} className="rydo-input" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="rydo-label">Phone number</label>
              <input type="tel" placeholder="+91 98765 43210" {...register('phone')} className="rydo-input" />
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="rydo-label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  {...register('password')}
                  className="rydo-input pr-11"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="rydo-label">Gender (optional)</label>
              <select {...register('gender')} className="rydo-input">
                <option value="" className="bg-[#111]">Select gender</option>
                <option value="male" className="bg-[#111]">Male</option>
                <option value="female" className="bg-[#111]">Female</option>
                <option value="other" className="bg-[#111]">Other</option>
              </select>
            </div>

            <button type="submit" disabled={isLoading} className="rydo-btn-primary w-full flex items-center justify-center gap-2">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-white/30 mt-6">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="text-white/50 hover:text-white">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-white/50 hover:text-white">Privacy Policy</Link>
          </p>
        </div>

        <p className="text-center text-sm text-white/40 mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-[#00C853] hover:text-[#00A846]">Log in</Link>
        </p>
      </div>
    </div>
  );
}
