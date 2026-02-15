import React from 'react';
import { Box, Typography } from '@mui/material';
import { gray } from '../../theme';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  icon,
  title = 'No records found',
  description,
  action,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
        px: 3,
      }}
    >
      {icon && (
        <Box sx={{ mb: 2, color: gray[400], fontSize: 48 }}>{icon}</Box>
      )}
      <Typography
        sx={{ fontSize: '14px', fontWeight: 500, color: gray[800], mb: 0.5 }}
      >
        {title}
      </Typography>
      {description && (
        <Typography sx={{ fontSize: '13px', color: gray[500], mb: 2, textAlign: 'center' }}>
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: 1 }}>{action}</Box>}
    </Box>
  );
}
