import { useMemo } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { gray, radius } from '../../theme';
import { ROUTES } from '../../configs/constants';
import DataTable, { Column } from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import moment from 'moment';

interface ComplaintsQuickTableProps {
  complaintsDetail: any;
  loading: boolean;
}

interface ComplaintRow {
  id: number;
  issueTypeName?: string;
  issueSubCategoryName?: string;
  branchName?: string;
  status?: string;
  raisedDateTime?: string;
  description?: string;
}

export default function ComplaintsQuickTable({ complaintsDetail, loading }: ComplaintsQuickTableProps) {
  const navigate = useNavigate();

  const rows: ComplaintRow[] = useMemo(() => {
    if (!complaintsDetail) return [];

    // Combine Open and InProgress complaints
    const openList: any[] = Array.isArray(complaintsDetail?.Open) ? complaintsDetail.Open : [];
    const inProgressList: any[] = Array.isArray(complaintsDetail?.InProgress) ? complaintsDetail.InProgress : [];
    const holdList: any[] = Array.isArray(complaintsDetail?.Hold) ? complaintsDetail.Hold : [];

    return [...openList, ...inProgressList, ...holdList]
      .slice(0, 5)
      .map((item: any, idx: number) => ({
        id: item?.id || idx,
        issueTypeName: item?.issueTypeName || item?.natureOfComplaint || '-',
        issueSubCategoryName: item?.issueSubCategoryName || '',
        branchName: item?.branchName || '-',
        status: item?.status || item?.complaintStatus || 'Open',
        raisedDateTime: item?.raisedDateTime || item?.complaintDate || item?.createdAt || '',
        description: item?.description || '',
      }));
  }, [complaintsDetail]);

  const columns: Column<ComplaintRow>[] = [
    {
      id: 'issue',
      label: 'Issue',
      render: (row) => (
        <Typography
          sx={{
            fontSize: '13px',
            color: gray[900],
            fontWeight: 500,
            maxWidth: 180,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {row.issueTypeName}
        </Typography>
      ),
    },
    {
      id: 'branch',
      label: 'Branch',
      render: (row) => row.branchName,
    },
    {
      id: 'date',
      label: 'Raised',
      render: (row) => row.raisedDateTime ? moment(row.raisedDateTime).format('DD/MM') : '-',
    },
    {
      id: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status || 'Open'} />,
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
          Active Complaints
        </Typography>
      </Box>

      <Box sx={{ '& .MuiTableContainer-root': { border: 'none', borderRadius: 0, boxShadow: 'none' } }}>
        <DataTable
          columns={columns}
          data={rows}
          loading={loading}
          skeletonRows={3}
          emptyTitle="No active complaints"
          emptyDescription="All issues are resolved"
        />
      </Box>

      <Box sx={{ px: 3, py: 1.5, borderTop: `1px solid ${gray[200]}` }}>
        <Button
          size="small"
          onClick={() => navigate(ROUTES.HOME.COMPLAINTS)}
          endIcon={<ArrowRight size={14} />}
          sx={{
            textTransform: 'none',
            fontSize: '13px',
            fontWeight: 600,
            color: gray[600],
            '&:hover': { backgroundColor: gray[50] },
          }}
        >
          View All Complaints
        </Button>
      </Box>
    </Box>
  );
}
