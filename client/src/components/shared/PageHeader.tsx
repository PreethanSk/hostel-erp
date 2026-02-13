import React from 'react';
import { Box, Typography } from '@mui/material';
import { gray } from '../../theme';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export default function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        mb: 3,
        flexWrap: 'wrap',
        gap: 2,
      }}
    >
      <Box>
        <Typography
          sx={{
            fontSize: '30px',
            fontWeight: 600,
            lineHeight: '38px',
            letterSpacing: '-0.02em',
            color: gray[900],
          }}
        >
          {title}
        </Typography>
        {description && (
          <Typography
            sx={{
              fontSize: '13px',
              color: gray[500],
              mt: 0.5,
            }}
          >
            {description}
          </Typography>
        )}
      </Box>
      {children && (
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          {children}
        </Box>
      )}
    </Box>
  );
}
