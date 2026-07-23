import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { permitsApi } from '../../api/permits.api';
import { usePermitsStore } from '../../store/permits.store';
import { useUiStore } from '../../store/ui.store';
import { PermitFormFields } from '../../components/permit/PermitFormFields';
import { DocumentUploadZone } from '../../components/document/DocumentUploadZone';
import { Button } from '../../components/ui/Button';
import { AppShell } from '../../components/layout/AppShell';
import type { PermitApplication, PermitType } from '../../types/permit.types';

// ---------- Zod validation schema ----------
const permitSchema = z.object({
  permitType: z.enum(
    ['construction', 'zoning_variance', 'event_permit', 'demolition', 'renovation', 'signage'],
    { errorMap: () => ({ message: 'Please select a permit type' }) },
  ),
  projectDescription: z
    .string()
    .min(10, 'Project description must be at least 10 characters')
    .max(5000, 'Project description must be 5000 characters or fewer'),
  siteAddress: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z
      .string()
      .length(2, 'State must be exactly 2 characters')
      .toUpperCase(),
    zipCode: z
      .string()
      .regex(/^\d{5}(-\d{4})?$/, 'ZIP code must be in format 12345 or 12345-6789'),
  }),
  contactName: z.string().min(1, 'Contact name is required'),
  contactPhone: z.string().min(1, 'Contact phone is required'),
  contactEmail: z.string().email('Please enter a valid email address'),
  estimatedStartDate: z.string().optional(),
  estimatedValue: z
    .number()
    .positive('Estimated value must be positive')
    .max(999999999, 'Estimated value too large')
    .optional()
    .or(z.nan())
    .transform((val) => (typeof val === 'number' && isNaN(val) ? undefined : val)),
  additionalNotes: z
    .string()
    .max(2000, 'Additional notes must be 2000 characters or fewer')
    .optional(),
});

export type PermitFormValues = z.infer<typeof permitSchema>;

// ---------- Step indicator ----------
interface StepperProps {
  currentStep: number;
  steps: string[];
}

function Stepper({ currentStep, steps }: StepperProps) {
  return (
    <nav aria-label="Form progress" className="flex items-center justify-center gap-0 mb-8">
      {steps.map((label, index) => {
        const stepNum = index + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-body-sm font-bold border-2 transition-colors ${
                  isActive
                    ? 'border-brand-primary bg-brand-primary text-white'
                    : isCompleted
                    ? 'border-brand-primary bg-brand-primary text-white'
                    : 'border-border-default bg-surface-card text-text-secondary'
                }`}
                aria-current={isActive ? 'step' : undefined}
                data-testid={`step-${stepNum}`}
              >
                {isCompleted ? '✓' : stepNum}
              </div>
              <span
                className={`text-caption mt-1 whitespace-nowrap ${
                  isActive ? 'text-brand-primary font-medium' : 'text-text-secondary'
                }`}
              >
                {label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 w-12 sm:w-20 mx-1 mb-5 transition-colors ${
                  isCompleted ? 'bg-brand-primary' : 'bg-border-default'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

// ---------- Save status indicator ----------
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null;
  return (
    <span
      className={`text-caption ml-2 transition-opacity ${
        status === 'saved'
          ? 'text-status-approved'
          : status === 'saving'
          ? 'text-text-secondary'
          : 'text-feedback-error'
      }`}
      aria-live="polite"
      data-testid="save-indicator"
    >
      {status === 'saved' && 'Saved ✓'}
      {status === 'saving' && 'Saving…'}
      {status === 'error' && 'Save failed'}
    </span>
  );
}

// ---------- Review summary ----------
function ReviewSummary({ values }: { values: PermitFormValues }) {
  const permitTypeLabels: Record<PermitType, string> = {
    construction: 'Construction',
    zoning_variance: 'Zoning Variance',
    event_permit: 'Event Permit',
    demolition: 'Demolition',
    renovation: 'Renovation',
    signage: 'Signage',
  };

  const rows: Array<[string, string]> = [
    ['Permit Type', permitTypeLabels[values.permitType] ?? values.permitType],
    ['Project Description', values.projectDescription],
    [
      'Site Address',
      `${values.siteAddress.street}, ${values.siteAddress.city}, ${values.siteAddress.state} ${values.siteAddress.zipCode}`,
    ],
    ['Contact Name', values.contactName],
    ['Contact Phone', values.contactPhone],
    ['Contact Email', values.contactEmail],
    ...(values.estimatedStartDate
      ? ([['Estimated Start Date', values.estimatedStartDate]] as Array<[string, string]>)
      : []),
    ...(values.estimatedValue
      ? ([['Estimated Value', `$${values.estimatedValue.toLocaleString()}`]] as Array<[string, string]>)
      : []),
    ...(values.additionalNotes
      ? ([['Additional Notes', values.additionalNotes]] as Array<[string, string]>)
      : []),
  ];

  return (
    <div className="space-y-3" data-testid="review-summary">
      <h2 className="text-heading-md text-text-primary font-semibold mb-4">Review Your Application</h2>
      <dl className="space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-1 sm:grid-cols-3 gap-1 border-b border-border-default pb-2">
            <dt className="text-label text-text-secondary">{label}</dt>
            <dd className="sm:col-span-2 text-body-sm text-text-primary break-words">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// ---------- Main component ----------
interface PermitFormPageProps {
  mode?: 'create' | 'edit';
}

const STEPS = ['Permit Details', 'Documents', 'Review & Submit'];
const AUTOSAVE_DELAY_MS = 2000;
const RETRY_DELAYS_MS = [1000, 2000, 4000];

export function PermitFormPage({ mode = 'create' }: PermitFormPageProps) {
  const { id: routeId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { upsertPermit } = usePermitsStore();
  const { addToast } = useUiStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [permitId, setPermitId] = useState<string | null>(routeId ?? null);
  const [permitStatus, setPermitStatus] = useState<import('../../types/permit.types').ApplicationStatus>('draft');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoadingExisting, setIsLoadingExisting] = useState(mode === 'edit' && !!routeId);

  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedIndicatorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingAutosaveRef = useRef(false);

  const methods = useForm<PermitFormValues>({
    resolver: zodResolver(permitSchema),
    mode: 'onBlur',
    defaultValues: {
      permitType: undefined,
      projectDescription: '',
      siteAddress: { street: '', city: '', state: '', zipCode: '' },
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      estimatedStartDate: '',
      additionalNotes: '',
    },
  });

  const { handleSubmit, getValues, reset } = methods;

  // Load existing permit for edit mode
  useEffect(() => {
    if (mode === 'edit' && routeId) {
      setIsLoadingExisting(true);
      permitsApi
        .getPermit(routeId)
        .then((permit: PermitApplication) => {
          setPermitStatus(permit.status);
          reset({
            permitType: permit.permit_type,
            projectDescription: permit.project_description,
            siteAddress: {
              street: permit.site_street,
              city: permit.site_city,
              state: permit.site_state,
              zipCode: permit.site_zip,
            },
            contactName: permit.contact_name,
            contactPhone: permit.contact_phone,
            contactEmail: permit.contact_email,
            estimatedStartDate: permit.estimated_start_date ?? '',
            // Coerce null → undefined: the schema's optional number rejects null,
            // which would silently block the final submit.
            estimatedValue: permit.estimated_value ?? undefined,
            additionalNotes: permit.additional_notes ?? '',
          });
        })
        .catch(() => {
          addToast('error', 'Failed to load permit. Please try again.');
        })
        .finally(() => {
          setIsLoadingExisting(false);
        });
    }
  }, [mode, routeId, reset, addToast]);

  // Auto-save logic
  const performAutosave = useCallback(
    async (id: string) => {
      const values = getValues();
      const payload = {
        permitType: values.permitType,
        projectDescription: values.projectDescription,
        siteAddress: values.siteAddress,
        contactName: values.contactName,
        contactPhone: values.contactPhone,
        contactEmail: values.contactEmail,
        estimatedStartDate: values.estimatedStartDate || undefined,
        estimatedValue: values.estimatedValue,
        additionalNotes: values.additionalNotes || undefined,
      };

      setSaveStatus('saving');
      let lastError: unknown = null;

      for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
        try {
          const updated = await permitsApi.updatePermit(id, payload);
          upsertPermit(updated);
          setSaveStatus('saved');
          // Clear 'saved' indicator after 3 seconds
          if (savedIndicatorTimerRef.current) clearTimeout(savedIndicatorTimerRef.current);
          savedIndicatorTimerRef.current = setTimeout(() => setSaveStatus('idle'), 3000);
          return;
        } catch (err) {
          lastError = err;
          if (attempt < RETRY_DELAYS_MS.length) {
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
          }
        }
      }

      // All retries exhausted
      setSaveStatus('error');
      addToast('warning', 'Auto-save failed. Check your connection.');
      console.error('Auto-save failed after retries:', lastError);
    },
    [getValues, upsertPermit, addToast],
  );

  // Watch form values to trigger debounced auto-save
  const watchedValues = useWatch({ control: methods.control });

  useEffect(() => {
    if (!permitId || isLoadingExisting) return;

    pendingAutosaveRef.current = true;

    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);

    autosaveTimerRef.current = setTimeout(() => {
      if (pendingAutosaveRef.current && permitId) {
        pendingAutosaveRef.current = false;
        void performAutosave(permitId);
      }
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedValues, permitId, isLoadingExisting]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
      if (savedIndicatorTimerRef.current) clearTimeout(savedIndicatorTimerRef.current);
    };
  }, []);

  // Create initial draft on first form interaction (create mode only)
  const ensurePermitCreated = useCallback(async (): Promise<string | null> => {
    if (permitId) return permitId;

    const values = getValues();
    if (!values.permitType) return null; // need at least a type

    try {
      const permit = await permitsApi.createPermit({
        permitType: values.permitType,
        projectDescription: values.projectDescription || 'Draft',
        siteAddress: values.siteAddress,
        contactName: values.contactName || 'Unknown',
        contactPhone: values.contactPhone || '0000000000',
        contactEmail: values.contactEmail || 'draft@example.com',
      });
      setPermitId(permit.id);
      setPermitStatus(permit.status);
      upsertPermit(permit);
      navigate(`/permits/${permit.id}/edit`, { replace: true });
      return permit.id;
    } catch {
      addToast('error', 'Failed to create application. Please try again.');
      return null;
    }
  }, [permitId, getValues, upsertPermit, navigate, addToast]);

  // Step navigation
  const handleNext = async () => {
    if (currentStep === 1) {
      // Validate step 1 fields
      const isValid = await methods.trigger([
        'permitType',
        'projectDescription',
        'siteAddress',
        'contactName',
        'contactPhone',
        'contactEmail',
      ]);
      if (!isValid) return;

      // Create draft if in create mode
      if (mode === 'create' && !permitId) {
        await ensurePermitCreated();
      }
    }
    setCurrentStep((s) => Math.min(s + 1, STEPS.length));
  };

  const handleBack = () => {
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  // Final form submit
  const onSubmit = async (values: PermitFormValues) => {
    if (!permitId) {
      addToast('error', 'Application not yet created. Please fill out the form first.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Save final state before submit
      await permitsApi.updatePermit(permitId, {
        permitType: values.permitType,
        projectDescription: values.projectDescription,
        siteAddress: values.siteAddress,
        contactName: values.contactName,
        contactPhone: values.contactPhone,
        contactEmail: values.contactEmail,
        estimatedStartDate: values.estimatedStartDate || undefined,
        estimatedValue: values.estimatedValue,
        additionalNotes: values.additionalNotes || undefined,
      });

      const submitted = await permitsApi.submitPermit(permitId);
      upsertPermit(submitted);
      navigate(`/permits/${permitId}`, { replace: true });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string }; status?: number } };
      if (axiosErr.response?.status === 422) {
        setSubmitError('At least one document is required before submitting.');
      } else {
        setSubmitError(
          axiosErr.response?.data?.message ?? 'Submission failed. Please try again.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Called when the final submit is blocked by client-side validation. Without
  // this, handleSubmit silently no-ops (the invalid fields live on Step 1, which
  // isn't mounted on Step 3), so the Submit button appears to "do nothing".
  const onInvalid = () => {
    addToast('error', 'Some required details are missing or invalid. Please review Step 1.');
    setSubmitError('Some required details are missing or invalid. Please go back and complete Step 1.');
    setCurrentStep(1);
  };

  const formTitle = mode === 'create' ? 'New Application' : 'Edit Application';

  if (isLoadingExisting) {
    return (
      <AppShell title={formTitle}>
        <div className="max-w-2xl mx-auto">
          <div className="h-8 bg-gray-100 animate-pulse rounded mb-4 w-1/3" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 animate-pulse rounded" />
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  const formValues = getValues();

  return (
    <AppShell title={formTitle}>
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <h1 className="text-heading-xl text-text-primary font-bold">
          {mode === 'create' ? 'New Application' : 'Edit Application'}
        </h1>
        <SaveIndicator status={saveStatus} />
      </div>

      {/* Step indicator */}
      <Stepper currentStep={currentStep} steps={STEPS} />

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
          {/* Step 1: Permit Details */}
          {currentStep === 1 && (
            <div data-testid="step-1-content">
              <PermitFormFields />
            </div>
          )}

          {/* Step 2: Documents */}
          {currentStep === 2 && (
            <div data-testid="step-2-content">
              {permitId ? (
                <DocumentUploadZone
                  applicationId={permitId}
                  applicationStatus={permitStatus}
                  onDocumentsChange={() => {/* trigger refetch if needed */}}
                />
              ) : (
                <div className="border-2 border-dashed border-border-default rounded-lg p-8 text-center text-text-secondary">
                  <p className="text-body-md">
                    Please complete Step 1 and click &quot;Next&quot; to save your application before uploading documents.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {currentStep === 3 && (
            <div data-testid="step-3-content">
              <ReviewSummary values={formValues} />

              {submitError && (
                <div
                  role="alert"
                  className="mt-4 bg-red-50 border border-red-200 rounded-md p-3 text-feedback-error text-body-sm"
                  data-testid="submit-error"
                >
                  {submitError}
                </div>
              )}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8 pt-4 border-t border-border-default">
            <div>
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleBack}
                  data-testid="back-button"
                >
                  Back
                </Button>
              )}
            </div>

            <div>
              {currentStep < STEPS.length ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleNext}
                  data-testid="next-button"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  loading={isSubmitting}
                  data-testid="submit-button"
                >
                  Submit Application
                </Button>
              )}
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
    </AppShell>
  );
}
