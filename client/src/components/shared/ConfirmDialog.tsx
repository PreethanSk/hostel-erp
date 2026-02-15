import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';
import { gray, radius, shadows } from '../../theme';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  loading = false,
}: ConfirmDialogProps) {
  const isDanger = variant === 'danger';

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        backdrop: {
          sx: { backdropFilter: 'blur(4px)' },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: `${radius.lg}px`,
          boxShadow: shadows.lg,
        },
      }}
    >
      <DialogTitle sx={{ padding: '20px 24px', pb: 1 }}>
        <Typography sx={{ fontSize: '18px', fontWeight: 600, color: gray[900] }}>
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ padding: '0 24px 20px' }}>
        <Typography sx={{ fontSize: '14px', color: gray[600] }}>
          {description}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ padding: '16px 24px', borderTop: `1px solid ${gray[200]}`, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={loading}
          sx={{
            color: gray[700],
            borderColor: gray[300],
            '&:hover': { backgroundColor: gray[50], borderColor: gray[300] },
          }}
        >
          {cancelLabel}
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={loading}
          sx={
            isDanger
              ? {
                  backgroundColor: '#F04438',
                  '&:hover': { backgroundColor: '#D92D20' },
                }
              : undefined
          }
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
