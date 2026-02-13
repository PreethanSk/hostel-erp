import { Box, Skeleton } from '@mui/material';

export default function PageLoading() {
  return (
    <Box sx={{ p: 3 }}>
      <Skeleton variant="rounded" width={200} height={28} sx={{ mb: 1 }} />
      <Skeleton variant="rounded" width={300} height={16} sx={{ mb: 3 }} />
      <Skeleton variant="rounded" height={48} sx={{ mb: 2 }} />
      <Skeleton variant="rounded" height={400} />
    </Box>
  );
}
