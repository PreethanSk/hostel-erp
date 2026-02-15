import { Components, Theme } from '@mui/material/styles';
import { gray, primary, shadows, radius } from './tokens';

export const componentOverrides: Components<Omit<Theme, 'components'>> = {

  // ── Buttons ──────────────────────────────────────────────
  MuiButtonBase: {
    defaultProps: {
      disableRipple: true,
    },
  },

  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: radius.md,
        fontWeight: 600,
        fontSize: '14px',
        textTransform: 'none' as const,
        boxShadow: shadows.xs,
        '&:hover': {
          boxShadow: shadows.xs,
        },
      },
      sizeMedium: {
        padding: '10px 18px',
      },
      sizeSmall: {
        padding: '8px 14px',
        fontSize: '13px',
      },
      containedPrimary: {
        backgroundColor: primary[600],
        '&:hover': { backgroundColor: primary[700] },
        '&:active': { backgroundColor: primary[800] },
      },
      outlined: {
        borderColor: gray[300],
        color: gray[700],
        boxShadow: shadows.xs,
        '&:hover': {
          backgroundColor: gray[50],
          borderColor: gray[300],
          boxShadow: shadows.xs,
        },
      },
      text: {
        color: gray[600],
        boxShadow: 'none',
        '&:hover': {
          backgroundColor: gray[50],
          boxShadow: 'none',
        },
      },
    },
  },

  // ── Text Fields / Inputs ─────────────────────────────────
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: radius.md,
        fontSize: '14px',
        backgroundColor: '#fff',
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: gray[400],
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: primary[300],
          borderWidth: '1px',
          boxShadow: `0 0 0 4px ${primary[100]}`,
        },
      },
      notchedOutline: {
        borderColor: gray[300],
      },
      input: {
        padding: '10px 14px',
        '&::placeholder': {
          color: gray[400],
          opacity: 1,
        },
        // Date input specific styling
        '&[type="date"]': {
          color: gray[700],
          minHeight: '20px',
          '&::-webkit-date-and-time-value': {
            textAlign: 'left',
          },
        },
      },
    },
  },

  MuiInputLabel: {
    styleOverrides: {
      root: {
        fontSize: '14px',
        fontWeight: 500,
        color: gray[700],
      },
    },
  },

  MuiTextField: {
    defaultProps: {
      size: 'small',
      autoComplete: 'off',
    },
  },

  // ── Tables ───────────────────────────────────────────────
  MuiTableContainer: {
    styleOverrides: {
      root: {
        backgroundColor: '#fff',
        borderRadius: radius.lg,
        border: `1px solid ${gray[200]}`,
        boxShadow: shadows.sm,
        overflow: 'hidden',
      },
    },
  },

  MuiTableHead: {
    styleOverrides: {
      root: {
        backgroundColor: gray[50],
        '& .MuiTableRow-root': {
          borderBottom: `1px solid ${gray[200]}`,
        },
      },
    },
  },

  MuiTableCell: {
    styleOverrides: {
      head: {
        fontSize: '12px',
        fontWeight: 500,
        color: gray[500],
        padding: '12px 24px',
        textTransform: 'none' as const,
        letterSpacing: 0,
        whiteSpace: 'nowrap',
        backgroundColor: gray[50],
        borderBottom: `1px solid ${gray[200]}`,
      },
      body: {
        fontSize: '14px',
        fontWeight: 400,
        color: gray[600],
        padding: '16px 24px',
        borderBottom: `1px solid ${gray[200]}`,
        fontVariantNumeric: 'tabular-nums',
      },
    },
  },

  MuiTableRow: {
    styleOverrides: {
      root: {
        '&:hover': {
          backgroundColor: gray[25],
        },
        transition: 'background-color 150ms ease',
        '&:last-child td': {
          borderBottom: 0,
        },
      },
    },
  },

  // ── Cards ────────────────────────────────────────────────
  MuiCard: {
    styleOverrides: {
      root: {
        backgroundColor: '#fff',
        borderRadius: radius.lg,
        border: `1px solid ${gray[200]}`,
        boxShadow: 'none',
        padding: '24px',
      },
    },
  },

  // ── Chips (Status Badges) ────────────────────────────────
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        fontSize: '12px',
        fontWeight: 500,
        height: 24,
      },
      sizeSmall: {
        height: 24,
      },
      sizeMedium: {
        height: 28,
      },
    },
  },

  // ── Dialogs ──────────────────────────────────────────────
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: radius.lg,
        boxShadow: shadows.lg,
      },
    },
  },

  MuiDialogTitle: {
    styleOverrides: {
      root: {
        padding: '20px 24px',
        fontSize: '18px',
        fontWeight: 600,
      },
    },
  },

  MuiDialogContent: {
    styleOverrides: {
      root: {
        padding: '0 24px 20px',
      },
    },
  },

  MuiDialogActions: {
    styleOverrides: {
      root: {
        padding: '16px 24px',
        borderTop: `1px solid ${gray[200]}`,
      },
    },
  },

  MuiBackdrop: {
    styleOverrides: {
      root: {
        backdropFilter: 'blur(4px)',
      },
    },
  },

  // ── Tabs ─────────────────────────────────────────────────
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none' as const,
        fontWeight: 500,
        fontSize: '14px',
        color: gray[500],
        '&.Mui-selected': {
          color: gray[800],
          fontWeight: 600,
        },
      },
    },
  },

  MuiTabs: {
    styleOverrides: {
      indicator: {
        height: 2,
        backgroundColor: primary[600],
      },
    },
  },

  // ── Pagination ───────────────────────────────────────────
  MuiPaginationItem: {
    styleOverrides: {
      root: {
        borderRadius: radius.md,
        fontSize: '14px',
        '&.Mui-selected': {
          backgroundColor: primary[50],
          color: primary[700],
          fontWeight: 600,
          '&:hover': {
            backgroundColor: primary[100],
          },
        },
      },
    },
  },

  // ── Select ───────────────────────────────────────────────
  MuiSelect: {
    styleOverrides: {
      root: {
        borderRadius: radius.md,
        fontSize: '14px',
      },
    },
  },

  // ── Drawer (for sidebar) ─────────────────────────────────
  MuiDrawer: {
    styleOverrides: {
      paper: {
        backgroundColor: gray[900],
        color: '#fff',
      },
    },
  },

  // ── Skeleton ─────────────────────────────────────────────
  MuiSkeleton: {
    defaultProps: {
      animation: 'pulse',
    },
    styleOverrides: {
      root: {
        borderRadius: radius.md,
        backgroundColor: gray[100],
      },
    },
  },

  // ── CssBaseline ──────────────────────────────────────────
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        backgroundColor: gray[50],
      },
    },
  },
};
