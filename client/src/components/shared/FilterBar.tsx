import React from 'react';
import { Box } from '@mui/material';
import { gray, radius } from '../../theme';

interface FilterBarProps {
  children: React.ReactNode;
}

export default function FilterBar({ children }: FilterBarProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 1.5,
        backgroundColor: '#fff',
        padding: 2,
        borderRadius: `${radius.md}px`,
        border: `1px solid ${gray[200]}`,
        mb: 2,
      }}
    >
      {children}
    </Box>
  );
}
