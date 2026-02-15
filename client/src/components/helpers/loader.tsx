import { Box, CircularProgress } from '@mui/material';
import { gray } from '../../theme';

export default function Loader() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 12,
        gap: 2,
      }}
    >
      <CircularProgress size={28} thickness={4} sx={{ color: gray[400] }} />
      <Box sx={{ fontSize: '13px', color: gray[400], fontWeight: 500 }}>Loading...</Box>
    </Box>
  );
}
