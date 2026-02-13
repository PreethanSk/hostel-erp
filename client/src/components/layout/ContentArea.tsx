import React from 'react';
import { Box } from '@mui/material';
import { gray } from '../../theme';

interface ContentAreaProps {
  children: React.ReactNode;
}

export default function ContentArea({ children }: ContentAreaProps) {
  return (
    <Box
      sx={{
        flex: 1,
        padding: 3,
        backgroundColor: gray[50],
        overflowY: 'auto',
      }}
    >
      {children}
    </Box>
  );
}
