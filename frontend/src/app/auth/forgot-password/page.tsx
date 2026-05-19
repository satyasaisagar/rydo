'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Car, ArrowLeft, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '@/services/api';
import { Button, Input } from '@/components/ui';

const schema = z.object({ email: z.string().email('Invalid email') });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ email }: FormData) => {
    try {
      await apiClient.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      toast.error('Failed to send reset email. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2.5 justify-center mb-10">
          <div className="w-9 h-9 bg-[#00C853] rounded-lg flex items-center justify-center">
            <Car className="w-5 h-5 text-black" />
          </div>
          <span className="text-white font-bold text-2xl">rydo</span>
        </Link>

        <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00C853]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-[#00C853]" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
              <p className="text-white/40 text-sm mb-8">
                If an account exists for that email, we've sent password reset instructions.
              </p>
              <Link href="/auth/login">
                <Button variant="secondary" className="w-full">Back to Login</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <Link href="/auth/login" className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back to login
                </Link>
                <h1 className="text-2xl font-bold text-white">Reset password</h1>
                <p className="text-white/40 text-sm mt-1">Enter your email to receive a reset link</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  icon={<Mail className="w-4 h-4" />}
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
                  Send Reset Link
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
