import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import { ArrowLeft, FileQuestion } from 'lucide-react';
import { gray } from '../../theme';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        p: 3,
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          backgroundColor: gray[100],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
        }}
      >
        <FileQuestion size={36} color={gray[400]} />
      </Box>

      <Typography
        sx={{ fontSize: '60px', fontWeight: 700, color: gray[200], lineHeight: 1, mb: 1 }}
      >
        404
      </Typography>

      <Typography sx={{ fontSize: '20px', fontWeight: 600, color: gray[800], mb: 1 }}>
        Page not found
      </Typography>

      <Typography sx={{ fontSize: '14px', color: gray[500], mb: 4, maxWidth: 400 }}>
        The page you are looking for doesn't exist or has been moved.
      </Typography>

      <Button
        variant="outlined"
        startIcon={<ArrowLeft size={16} />}
        onClick={() => navigate(-1)}
        sx={{ textTransform: 'none', borderColor: gray[300], color: gray[700] }}
      >
        Go back
      </Button>
    </Box>
  );
}
