import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Breakpoint,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { gray, radius, shadows } from '../../theme';

interface DialogModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: Breakpoint | false;
  fullScreen?: boolean;
  dividers?: boolean;
}

export default function DialogModal({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'sm',
  fullScreen = false,
  dividers = false,
}: DialogModalProps) {
  return (
    <Dialog
      fullScreen={fullScreen}
      fullWidth
      maxWidth={maxWidth}
      open={open}
      onClose={onClose}
      disableEscapeKeyDown
      slotProps={{
        backdrop: {
          sx: { backdropFilter: 'blur(4px)' },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : `${radius.lg}px`,
          boxShadow: shadows.lg,
        },
      }}
    >
      {title && (
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
          }}
        >
          <Typography sx={{ fontSize: '18px', fontWeight: 600, color: gray[900] }}>
            {title}
          </Typography>
          <IconButton size="small" onClick={onClose} sx={{ color: gray[400] }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
      )}
      <DialogContent dividers={dividers} sx={{ padding: '0 24px 20px' }}>
        {!title && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
            <IconButton size="small" onClick={onClose} sx={{ color: gray[400] }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
        {children}
      </DialogContent>
      {actions && (
        <DialogActions
          sx={{
            padding: '16px 24px',
            borderTop: `1px solid ${gray[200]}`,
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
}
