// Design System Tokens
// Reference: Untitled UI / Shadcn gray scale + Stripe-style blue primary

export const gray = {
  25: '#FCFCFD',
  50: '#F9FAFB',
  100: '#F2F4F7',
  200: '#EAECF0',
  300: '#D0D5DD',
  400: '#98A2B3',
  500: '#667085',
  600: '#475467',
  700: '#344054',
  800: '#1D2939',
  900: '#101828',
} as const;

export const primary = {
  25: '#F5F8FF',
  50: '#EFF4FF',
  100: '#D1E0FF',
  200: '#B2CCFF',
  300: '#84ADFF',
  400: '#528BFF',
  500: '#2970FF',
  600: '#155EEF',
  700: '#004EEB',
  800: '#0040C1',
  900: '#00359E',
} as const;

export const success = {
  50: '#ECFDF3',
  100: '#ABEFC6',
  500: '#12B76A',
  700: '#027A48',
} as const;

export const warning = {
  50: '#FFFAEB',
  100: '#FEDF89',
  500: '#F79009',
  700: '#B54708',
} as const;

export const error = {
  50: '#FEF3F2',
  100: '#FECDCA',
  500: '#F04438',
  700: '#B42318',
} as const;

export const info = {
  50: '#EFF8FF',
  100: '#B2DDFF',
  500: '#2E90FA',
  700: '#175CD3',
} as const;

export const purple = {
  50: '#F4F3FF',
  100: '#D9D6FE',
  500: '#7A5AF8',
  700: '#5925DC',
} as const;

// Spacing (base unit: 4px)
export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

// Elevation
export const shadows = {
  xs: '0px 1px 2px rgba(16,24,40,0.05)',
  sm: '0px 1px 3px rgba(16,24,40,0.1), 0px 1px 2px rgba(16,24,40,0.06)',
  md: '0px 4px 8px -2px rgba(16,24,40,0.1), 0px 2px 4px -2px rgba(16,24,40,0.06)',
  lg: '0px 12px 16px -4px rgba(16,24,40,0.08), 0px 4px 6px -2px rgba(16,24,40,0.03)',
  xl: '0px 20px 24px -4px rgba(16,24,40,0.08), 0px 8px 8px -4px rgba(16,24,40,0.03)',
} as const;

// Border radius
export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// Borders
export const borders = {
  primary: `1px solid ${gray[200]}`,
  heavy: `1px solid ${gray[300]}`,
} as const;
