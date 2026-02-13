import { Box, CircularProgress } from '@mui/material';
import { gray } from '../../theme';

interface LoadingOverlayProps {
  visible: boolean;
  fullPage?: boolean;
}

export default function LoadingOverlay({ visible, fullPage = false }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <Box
      sx={{
        position: fullPage ? 'fixed' : 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: `${gray[900]}40`,
        zIndex: fullPage ? 1300 : 10,
        borderRadius: 'inherit',
      }}
    >
      <CircularProgress size={36} sx={{ color: '#fff' }} />
    </Box>
  );
}
