import { Box, CircularProgress, Typography } from '@mui/material';
import { gray } from '../../theme';

export default function LoadingPage() {
  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        zIndex: 99999,
        gap: 2,
      }}
    >
      <CircularProgress size={32} thickness={4} sx={{ color: gray[400] }} />
      <Typography sx={{ fontSize: '13px', color: gray[400], fontWeight: 500 }}>
        Loading...
      </Typography>
    </Box>
  );
}
