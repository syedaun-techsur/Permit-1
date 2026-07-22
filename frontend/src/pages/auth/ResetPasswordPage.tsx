import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useSearchParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { authApi } from '../../api/auth.api';

const passwordRules = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .regex(/[A-Z]/, 'Must contain an uppercase letter.')
  .regex(/[a-z]/, 'Must contain a lowercase letter.')
  .regex(/\d/, 'Must contain a digit.')
  .regex(/[^a-zA-Z\d]/, 'Must contain a special character.');

const schema = z.object({
  newPassword: passwordRules,
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});

type FormValues = z.infer<typeof schema>;

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [done, setDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const token = searchParams.get('token') ?? '';

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    setServerError(null);
    try {
      await authApi.resetPassword({ token, ...data });
      setDone(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        .response?.data?.message ?? 'Reset failed. The link may have expired.';
      setServerError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center p-4">
        <Card padding="lg" className="max-w-md w-full text-center">
          <p className="text-body-md text-feedback-error">Invalid reset link.</p>
          <Link to="/forgot-password" className="block mt-4 text-brand-primary text-body-sm">Request a new link</Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-heading-xl text-text-primary font-bold">PermitFlow</h1>
          <p className="text-body-sm text-text-secondary mt-1">Set a new password</p>
        </div>

        <Card padding="lg">
          {done ? (
            <div className="text-center space-y-4">
              <p className="text-body-md text-text-primary">Password updated successfully.</p>
              <Link
                to="/login"
                className="inline-block mt-2 text-brand-primary hover:text-blue-700 transition-colors duration-150 text-body-sm font-medium"
              >
                Sign in with new password
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              {serverError && (
                <div role="alert" className="p-3 rounded-md bg-red-50 border border-feedback-error">
                  <p className="text-body-sm text-feedback-error">{serverError}</p>
                </div>
              )}

              <Input
                label="New password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                helpText="8+ characters with uppercase, lowercase, digit, and special character."
                error={errors.newPassword?.message}
                {...register('newPassword')}
              />

              <Input
                label="Confirm new password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                className="w-full"
              >
                Set new password
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
