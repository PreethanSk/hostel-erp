import { Button, CircularProgress } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { gray } from '../../theme';

interface ExportButtonProps {
  onExport: () => void;
  label?: string;
  loading?: boolean;
}

export default function ExportButton({
  onExport,
  label = 'Export',
  loading = false,
}: ExportButtonProps) {
  return (
    <Button
      variant="outlined"
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon sx={{ fontSize: 18 }} />}
      onClick={onExport}
      disabled={loading}
      sx={{
        color: gray[700],
        borderColor: gray[300],
        '&:hover': { backgroundColor: gray[50], borderColor: gray[300] },
      }}
    >
      {label}
    </Button>
  );
}
