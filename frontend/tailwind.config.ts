import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#2563EB',      // color.brand.primary — custom blue, not Tailwind default
          secondary: '#7C3AED',    // color.brand.secondary — purple accent
        },
        surface: {
          base: '#F8FAFC',         // color.surface.base — near-white page bg
          card: '#FFFFFF',         // color.surface.card — white cards
          sidebar: '#F1F5F9',      // color.surface.sidebar — slightly darker nav
        },
        text: {
          primary: '#0F172A',      // color.text.primary — near-black, 12.6:1 contrast on white
          secondary: '#475569',    // color.text.secondary — medium gray, 5.9:1 contrast
          disabled: '#94A3B8',     // color.text.disabled
        },
        border: {
          default: '#E2E8F0',      // color.border.default
          focus: '#2563EB',        // color.border.focus — matches brand.primary
        },
        status: {
          draft: '#94A3B8',        // color.status.draft — neutral gray
          submitted: '#2563EB',    // color.status.submitted — blue
          under_review: '#D97706', // color.status.under_review — amber
          additional_info: '#EA580C', // color.status.additional_info — orange-red
          approved: '#16A34A',     // color.status.approved — green
          rejected: '#DC2626',     // color.status.rejected — red
        },
        feedback: {
          error: '#DC2626',        // color.feedback.error — WCAG red
          warning: '#D97706',      // color.feedback.warning — WCAG amber
          success: '#16A34A',      // color.feedback.success — WCAG green
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        // Typography tokens from UX-05
        'heading-xl': ['30px', { lineHeight: '1.2', fontWeight: '700' }],   // text.heading.xl
        'heading-lg': ['24px', { lineHeight: '1.3', fontWeight: '600' }],   // text.heading.lg
        'heading-md': ['20px', { lineHeight: '1.4', fontWeight: '600' }],   // text.heading.md
        'body-md':    ['16px', { lineHeight: '1.6', fontWeight: '400' }],   // text.body.md
        'body-sm':    ['14px', { lineHeight: '1.5', fontWeight: '400' }],   // text.body.sm
        'label':      ['14px', { lineHeight: '1.4', fontWeight: '500' }],   // text.label
        'caption':    ['12px', { lineHeight: '1.4', fontWeight: '400' }],   // text.caption
        'code':       ['14px', { lineHeight: '1.6', fontWeight: '400' }],   // text.code
      },
      spacing: {
        // 4px base unit scale from UX-05
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
      },
      borderRadius: {
        'sm': '4px',      // radius.sm — inputs, badges
        'md': '8px',      // radius.md — cards, buttons
        'lg': '12px',     // radius.lg — modals, panels
        'full': '9999px', // radius.full — pills, avatars
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0,0,0,0.05), 0 1px 3px 0 rgba(0,0,0,0.08)',  // shadow.sm
        'md': '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)', // shadow.md
        'lg': '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)', // shadow.lg
      },
      transitionDuration: {
        '75': '75ms',
        '150': '150ms',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
