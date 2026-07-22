import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '../ui/Input';
import type { PermitFormValues } from '../../pages/permits/PermitFormPage';

export const PermitFormFields: React.FC = () => {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<PermitFormValues>();

  const projectDescription = watch('projectDescription') ?? '';
  const additionalNotes = watch('additionalNotes') ?? '';

  return (
    <div className="space-y-4">
      {/* Permit Type */}
      <div className="flex flex-col gap-1">
        <label htmlFor="permitType" className="text-label text-text-primary">
          Permit Type *
        </label>
        <select
          id="permitType"
          {...register('permitType')}
          className="w-full px-3 py-2 rounded-sm border bg-surface-card text-text-primary text-body-md border-border-default focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-border-focus transition-colors duration-150"
          aria-invalid={!!errors.permitType}
        >
          <option value="">Select a permit type</option>
          <option value="construction">Construction</option>
          <option value="zoning_variance">Zoning Variance</option>
          <option value="event_permit">Event Permit</option>
          <option value="demolition">Demolition</option>
          <option value="renovation">Renovation</option>
          <option value="signage">Signage</option>
        </select>
        {errors.permitType && (
          <p role="alert" className="text-caption text-feedback-error">
            {errors.permitType.message}
          </p>
        )}
      </div>

      {/* Project Description */}
      <div className="flex flex-col gap-1">
        <label htmlFor="projectDescription" className="text-label text-text-primary">
          Project Description *
        </label>
        <textarea
          id="projectDescription"
          {...register('projectDescription')}
          rows={4}
          className="w-full px-3 py-2 rounded-sm border bg-surface-card text-text-primary text-body-md border-border-default focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-border-focus transition-colors duration-150 resize-vertical"
          aria-invalid={!!errors.projectDescription}
          placeholder="Describe your project (10–5000 characters)"
        />
        <div className="flex justify-between">
          {errors.projectDescription ? (
            <p role="alert" className="text-caption text-feedback-error">
              {errors.projectDescription.message}
            </p>
          ) : (
            <span />
          )}
          <span className="text-caption text-text-secondary">
            {projectDescription.length}/5000
          </span>
        </div>
      </div>

      {/* Site Address */}
      <fieldset className="border border-border-default rounded-sm p-4 space-y-3">
        <legend className="text-label text-text-primary px-1">Site Address</legend>

        <Input
          label="Site Street Address *"
          {...register('siteAddress.street')}
          error={errors.siteAddress?.street?.message}
          placeholder="123 Main St"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <Input
              label="City *"
              {...register('siteAddress.city')}
              error={errors.siteAddress?.city?.message}
              placeholder="Springfield"
            />
          </div>
          <div>
            <Input
              label="State (2-letter) *"
              {...register('siteAddress.state')}
              error={errors.siteAddress?.state?.message}
              maxLength={2}
              placeholder="CA"
              className="uppercase"
            />
          </div>
          <div>
            <Input
              label="ZIP Code *"
              {...register('siteAddress.zipCode')}
              error={errors.siteAddress?.zipCode?.message}
              placeholder="90210"
            />
          </div>
        </div>
      </fieldset>

      {/* Contact Info */}
      <fieldset className="border border-border-default rounded-sm p-4 space-y-3">
        <legend className="text-label text-text-primary px-1">Contact Information</legend>

        <Input
          label="Contact Name *"
          {...register('contactName')}
          error={errors.contactName?.message}
          placeholder="Jane Smith"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Contact Phone *"
            {...register('contactPhone')}
            error={errors.contactPhone?.message}
            placeholder="(555) 555-5555"
            type="tel"
          />
          <Input
            label="Contact Email *"
            {...register('contactEmail')}
            error={errors.contactEmail?.message}
            placeholder="jane@example.com"
            type="email"
          />
        </div>
      </fieldset>

      {/* Optional Fields */}
      <div className="space-y-3">
        <Input
          label="Estimated Start Date (optional)"
          {...register('estimatedStartDate')}
          error={errors.estimatedStartDate?.message}
          type="date"
        />

        <Input
          label="Estimated Value $ (optional)"
          {...register('estimatedValue', { valueAsNumber: true })}
          error={errors.estimatedValue?.message}
          type="number"
          min={0}
          max={999999999}
          placeholder="50000"
        />

        <div className="flex flex-col gap-1">
          <label htmlFor="additionalNotes" className="text-label text-text-primary">
            Additional Notes (optional, max 2000 chars)
          </label>
          <textarea
            id="additionalNotes"
            {...register('additionalNotes')}
            rows={3}
            className="w-full px-3 py-2 rounded-sm border bg-surface-card text-text-primary text-body-md border-border-default focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-border-focus transition-colors duration-150 resize-vertical"
            aria-invalid={!!errors.additionalNotes}
            placeholder="Any additional information"
          />
          <div className="flex justify-between">
            {errors.additionalNotes ? (
              <p role="alert" className="text-caption text-feedback-error">
                {errors.additionalNotes.message}
              </p>
            ) : (
              <span />
            )}
            <span className="text-caption text-text-secondary">
              {additionalNotes.length}/2000
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
