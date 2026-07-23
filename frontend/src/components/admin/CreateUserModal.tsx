import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useCreateUser } from '../../hooks/useAdmin';
import { useUiStore } from '../../store/ui.store';
import type { AdminUser } from '../../types/admin.types';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AdminUser) => void;
}

const schema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email required'),
  role: z.enum(['applicant', 'reviewer', 'admin']),
  temporaryPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .optional()
    .or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { create, loading } = useCreateUser();
  const addToast = useUiStore((s) => s.addToast);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'applicant', temporaryPassword: '' },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const user = await create({
        fullName: values.fullName,
        email: values.email,
        role: values.role,
        temporaryPassword: values.temporaryPassword || undefined,
      });
      addToast('success', 'User created');
      reset();
      onSuccess(user);
      onClose();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response?.status;
      const serverMsg = (err as { response?: { data?: { message?: string } } }).response?.data
        ?.message;
      if (status === 409) {
        setError('email', {
          type: 'manual',
          message: 'This email is already registered',
        });
      } else {
        addToast('error', serverMsg ?? 'Failed to create user');
      }
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title="Create User"
      size="md"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-user-title"
      >
        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Input
            label="Full Name"
            type="text"
            aria-required="true"
            error={errors.fullName?.message}
            {...register('fullName')}
          />

          <Input
            label="Email"
            type="email"
            aria-required="true"
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="flex flex-col gap-1">
            <label
              htmlFor="create-user-role"
              className="text-label text-text-primary"
            >
              Role
            </label>
            <select
              id="create-user-role"
              aria-required="true"
              aria-label="Role"
              className="w-full px-3 py-2 rounded-sm border border-border-default bg-surface-card text-text-primary text-body-md focus:outline-none focus:ring-2 focus:ring-border-focus"
              {...register('role')}
            >
              <option value="applicant">Applicant</option>
              <option value="reviewer">Reviewer</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && (
              <p role="alert" className="text-caption text-feedback-error">
                {errors.role.message}
              </p>
            )}
          </div>

          <Input
            label="Temporary Password (optional)"
            type="password"
            helpText="Leave blank to send password-reset email"
            error={errors.temporaryPassword?.message}
            {...register('temporaryPassword')}
          />

          <div className="flex justify-end gap-3 mt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              Create User
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
