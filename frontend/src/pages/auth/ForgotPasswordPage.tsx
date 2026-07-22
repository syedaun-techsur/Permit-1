import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { authApi } from '../../api/auth.api';

const schema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

type FormValues = z.infer<typeof schema>;

export const ForgotPasswordPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    try {
      await authApi.forgotPassword(data);
    } finally {
      // Always show success — backend returns 200 regardless to prevent enumeration
      setSubmitted(true);
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-heading-xl text-text-primary font-bold">PermitFlow</h1>
          <p className="text-body-sm text-text-secondary mt-1">Reset your password</p>
        </div>

        <Card padding="lg">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <span className="text-status-approved text-heading-lg">✓</span>
              </div>
              <p className="text-body-md text-text-primary">
                If that email is registered, a reset link has been sent.
              </p>
              <p className="text-body-sm text-text-secondary">
                Check your inbox and follow the link within 1 hour.
              </p>
              <Link to="/login" className="block text-brand-primary text-body-sm hover:text-blue-700 transition-colors duration-150">
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <p className="text-body-sm text-text-secondary mb-5">
                Enter your email and we'll send you a link to reset your password.
              </p>
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                <Input
                  label="Email address"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isLoading}
                  className="w-full"
                >
                  Send reset link
                </Button>
              </form>
              <p className="text-center text-body-sm text-text-secondary mt-6">
                <Link to="/login" className="text-brand-primary hover:text-blue-700 transition-colors duration-150">
                  Back to sign in
                </Link>
              </p>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};
