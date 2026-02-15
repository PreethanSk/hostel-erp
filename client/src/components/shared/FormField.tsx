import React from 'react';
import { Box, Typography } from '@mui/material';
import { gray } from '../../theme';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: React.ReactNode;
}

export default function FormField({
  label,
  required = false,
  error,
  helperText,
  children,
}: FormFieldProps) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        component="label"
        sx={{
          display: 'block',
          fontSize: '12px',
          fontWeight: 500,
          color: gray[700],
          mb: 0.75,
        }}
      >
        {label}
        {required && (
          <Typography component="span" sx={{ color: '#F04438', ml: 0.25 }}>
            *
          </Typography>
        )}
      </Typography>
      {children}
      {error && (
        <Typography sx={{ fontSize: '12px', color: '#B42318', mt: 0.5 }}>
          {error}
        </Typography>
      )}
      {!error && helperText && (
        <Typography sx={{ fontSize: '12px', color: gray[500], mt: 0.5 }}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
}
