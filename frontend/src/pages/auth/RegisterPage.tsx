import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';

const passwordRules = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(128)
  .regex(/[A-Z]/, 'Must contain an uppercase letter.')
  .regex(/[a-z]/, 'Must contain a lowercase letter.')
  .regex(/\d/, 'Must contain a digit.')
  .regex(/[^a-zA-Z\d]/, 'Must contain a special character.');

const registerSchema = z.object({
  fullName: z.string().min(1, 'Full name is required.').max(100).trim(),
  email: z.string().email('Please enter a valid email address.'),
  password: passwordRules,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { handleRegister, isLoading } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-heading-xl text-text-primary font-bold">PermitFlow</h1>
          <p className="text-body-sm text-text-secondary mt-1">Create your account</p>
        </div>

        <Card padding="lg">
          <form onSubmit={handleSubmit(handleRegister)} noValidate className="space-y-5">
            <Input
              label="Full name"
              type="text"
              autoComplete="name"
              placeholder="Jane Smith"
              error={errors.fullName?.message}
              {...register('fullName')}
            />

            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              helpText="8+ characters with uppercase, lowercase, digit, and special character."
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirm password"
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
              disabled={isLoading}
              className="w-full"
            >
              Create account
            </Button>
          </form>

          <p className="text-center text-body-sm text-text-secondary mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-primary hover:text-blue-700 transition-colors duration-150 font-medium">
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};
