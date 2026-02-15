import { useMemo } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { gray, radius } from '../../theme';
import { ROUTES } from '../../configs/constants';
import DataTable, { Column } from '../../components/shared/DataTable';
import moment from 'moment';

interface AdmissionsQuickTableProps {
  bookingsDetail: any;
  loading: boolean;
}

interface AdmissionRow {
  id: number;
  candidateName?: string;
  roomNumber?: string;
  cotNumber?: string;
  dateOfAdmission?: string;
  admissionStatus?: string;
}

export default function AdmissionsQuickTable({ bookingsDetail, loading }: AdmissionsQuickTableProps) {
  const navigate = useNavigate();

  const rows: AdmissionRow[] = useMemo(() => {
    if (!bookingsDetail) return [];

    // Use confirmed/pending bookings
    const confirmed: any[] = Array.isArray(bookingsDetail?.confirmBooking) ? bookingsDetail.confirmBooking : [];
    const pending: any[] = Array.isArray(bookingsDetail?.pendingBooking) ? bookingsDetail.pendingBooking : [];
    const allBookings: any[] = Array.isArray(bookingsDetail?.totalBooking) ? bookingsDetail.totalBooking : [];

    const source = allBookings.length > 0 ? allBookings : [...confirmed, ...pending];

    return source
      .slice(0, 5)
      .map((item: any, idx: number) => ({
        id: item?.id || idx,
        candidateName: item?.candidateName || item?.name || '-',
        roomNumber: item?.roomNumber || '-',
        cotNumber: item?.cotNumber || '-',
        dateOfAdmission: item?.dateOfAdmission || item?.createdAt || '',
        admissionStatus: item?.admissionStatus || '',
      }));
  }, [bookingsDetail]);

  const columns: Column<AdmissionRow>[] = [
    {
      id: 'name',
      label: 'Resident',
      render: (row) => (
        <Typography
          sx={{
            fontSize: '13px',
            color: gray[900],
            fontWeight: 500,
            maxWidth: 150,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {row.candidateName}
        </Typography>
      ),
    },
    {
      id: 'room',
      label: 'Room',
      render: (row) => `${row.roomNumber}${row.cotNumber !== '-' ? ` / ${row.cotNumber}` : ''}`,
    },
    {
      id: 'date',
      label: 'Date',
      render: (row) => row.dateOfAdmission ? moment(row.dateOfAdmission).format('DD/MM') : '-',
    },
  ];

  return (
    <Box
      sx={{
        backgroundColor: '#fff',
        borderRadius: `${radius.lg}px`,
        border: `1px solid ${gray[200]}`,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ px: 3, pt: 3, pb: 1 }}>
        <Typography sx={{ fontSize: '16px', fontWeight: 600, color: gray[900] }}>
          Upcoming Admissions
        </Typography>
      </Box>

      <Box sx={{ '& .MuiTableContainer-root': { border: 'none', borderRadius: 0, boxShadow: 'none' } }}>
        <DataTable
          columns={columns}
          data={rows}
          loading={loading}
          skeletonRows={3}
          emptyTitle="No upcoming admissions"
          emptyDescription="No new bookings in this period"
        />
      </Box>

      <Box sx={{ px: 3, py: 1.5, borderTop: `1px solid ${gray[200]}` }}>
        <Button
          size="small"
          onClick={() => navigate(ROUTES.HOME.ADMISSION.LIST)}
          endIcon={<ArrowRight size={14} />}
          sx={{
            textTransform: 'none',
            fontSize: '13px',
            fontWeight: 600,
            color: gray[600],
            '&:hover': { backgroundColor: gray[50] },
          }}
        >
          View All Admissions
        </Button>
      </Box>
    </Box>
  );
}
