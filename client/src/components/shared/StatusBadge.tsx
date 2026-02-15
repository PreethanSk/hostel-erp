import { Chip, Box } from '@mui/material';
import { success, warning, error as errorColor, info, gray, purple } from '../../theme';

type SemanticColor = {
  dot: string;
  bg: string;
  text: string;
  border: string;
};

const semanticColors: Record<string, SemanticColor> = {
  success: { dot: success[500], bg: success[50], text: success[700], border: success[100] },
  warning: { dot: warning[500], bg: warning[50], text: warning[700], border: warning[100] },
  error: { dot: errorColor[500], bg: errorColor[50], text: errorColor[700], border: errorColor[100] },
  info: { dot: info[500], bg: info[50], text: info[700], border: info[100] },
  neutral: { dot: gray[500], bg: gray[100], text: gray[700], border: gray[200] },
  purple: { dot: purple[500], bg: purple[50], text: purple[700], border: purple[100] },
};

const statusMap: Record<string, string> = {
  // success
  active: 'success',
  approved: 'success',
  closed: 'success',
  confirmed: 'success',
  paid: 'success',
  // warning
  pending: 'warning',
  hold: 'warning',
  partial: 'warning',
  // error
  open: 'error',
  rejected: 'error',
  reject: 'error',
  overdue: 'error',
  cancelled: 'error',
  // info
  inprogress: 'info',
  'in progress': 'info',
  booked: 'info',
  // neutral
  inactive: 'neutral',
  draft: 'neutral',
  // purple
  maintenance: 'purple',
};

function formatLabel(status: string): string {
  // "InProgress" -> "In Progress", "OPEN" -> "Open"
  const spaced = status.replace(/([a-z])([A-Z])/g, '$1 $2');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const key = status.toLowerCase().trim();
  const colorKey = statusMap[key] || 'neutral';
  const colors = semanticColors[colorKey];
  const label = formatLabel(status);

  return (
    <Chip
      size="small"
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: colors.dot,
              flexShrink: 0,
            }}
          />
          {label}
        </Box>
      }
      sx={{
        height: size === 'sm' ? 24 : 28,
        borderRadius: '16px',
        fontSize: '12px',
        fontWeight: 500,
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        '& .MuiChip-label': {
          padding: '0 8px',
        },
      }}
    />
  );
}
