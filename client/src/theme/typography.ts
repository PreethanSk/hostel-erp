import { TypographyOptions } from '@mui/material/styles/createTypography';
import { gray } from './tokens';

// Font: Inter (variable, 400-700 weights)
// Type Scale: Major Third ratio (1.25x)
// Tabular nums on all numeric displays

export const typographyOptions: TypographyOptions = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  button: {
    textTransform: 'none' as const,
  },

  // display.sm — Page titles (Dashboard, Complaints)
  h1: {
    fontSize: '30px',
    fontWeight: 600,
    lineHeight: '38px',
    letterSpacing: '-0.02em',
    color: gray[900],
  },

  // text.xl — Section headings, dialog titles
  h2: {
    fontSize: '20px',
    fontWeight: 600,
    lineHeight: '30px',
    letterSpacing: '-0.01em',
    color: gray[900],
  },

  // text.lg — Card titles, sub-headings
  h3: {
    fontSize: '18px',
    fontWeight: 600,
    lineHeight: '28px',
    letterSpacing: 0,
    color: gray[800],
  },

  // text.md — Body text, table cells, input values
  body1: {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '20px',
    letterSpacing: 0,
    color: gray[700],
  },

  // text.sm — Secondary text, descriptions
  body2: {
    fontSize: '13px',
    fontWeight: 400,
    lineHeight: '18px',
    letterSpacing: 0,
    color: gray[600],
  },

  // text.xs — Labels, table headers, captions, timestamps
  caption: {
    fontSize: '12px',
    fontWeight: 500,
    lineHeight: '18px',
    letterSpacing: 0,
    color: gray[500],
  },

  // text.xxs — Badge text, overline labels
  overline: {
    fontSize: '11px',
    fontWeight: 500,
    lineHeight: '16px',
    letterSpacing: '0.02em',
    color: gray[500],
    textTransform: 'none' as const,
  },
};
