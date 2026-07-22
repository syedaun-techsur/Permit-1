import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { handleLogin, isLoading } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / wordmark */}
        <div className="text-center mb-8">
          <h1 className="text-heading-xl text-text-primary font-bold">PermitFlow</h1>
          <p className="text-body-sm text-text-secondary mt-1">Sign in to your account</p>
        </div>

        <Card padding="lg">
          <form onSubmit={handleSubmit(handleLogin)} noValidate className="space-y-5">
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="space-y-1">
              <Input
                label="Password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-body-sm text-brand-primary hover:text-blue-700 transition-colors duration-150"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              disabled={isLoading}
              className="w-full"
            >
              Sign in
            </Button>
          </form>

          <p className="text-center text-body-sm text-text-secondary mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-primary hover:text-blue-700 transition-colors duration-150 font-medium">
              Create one
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};
