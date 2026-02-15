import { useEffect, useState, useMemo } from 'react';
import { Box } from '@mui/material';
import { getDashboardCotsDetail } from '../../models';
import { getExportEXCEL } from '../../services/HelperService';
import DialogModal from '../../components/shared/DialogModal';
import DataTable, { Column } from '../../components/shared/DataTable';
import SearchInput from '../../components/shared/SearchInput';
import ExportButton from '../../components/shared/ExportButton';
import StatusBadge from '../../components/shared/StatusBadge';

interface Props {
  open: boolean;
  onClose: () => void;
  fromDate: string;
  toDate: string;
  branchId: string;
  type?: string;
  detailedData?: any;
}

interface CotDetailRow {
  candidateId?: number | string;
  candidateName?: string;
  mobileNumber?: string;
  email?: string;
  branchName?: string;
  roomNumber?: string;
  cotNumber?: string;
  cotTypeName?: string;
  roomRent?: string;
  rentAmount?: string;
  status?: string;
  admissionType?: string;
}

const TITLE_MAP: Record<string, string> = {
  totalCots: 'Total Beds',
  occupied: 'Occupied Beds',
  maintenance: 'Maintenance Beds',
  available: 'Available Beds',
  booked: 'Booked Beds',
};

export default function DashboardCotsDetailModal({
  open, onClose, fromDate, toDate, branchId, type = 'totalCots', detailedData,
}: Props) {
  const [data, setData] = useState<CotDetailRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const showCandidateColumns = type !== 'available' && type !== 'maintenance';

  useEffect(() => {
    if (!open) return;
    if (detailedData) {
      setData(detailedData?.[type] || []);
      return;
    }
    setLoading(true);
    const queryStr = `?branchId=${branchId}&from=${fromDate}&to=${toDate}`;
    getDashboardCotsDetail(queryStr)
      .then((resp: any) => {
        if (resp?.data?.status === 'success') {
          setData(resp.data.result?.[type] || []);
        } else {
          setData([]);
        }
      })
      .finally(() => setLoading(false));
  }, [open, fromDate, toDate, branchId, type, detailedData]);

  const filteredData = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return data;
    return data.filter((item) =>
      Object.values(item).some((v) => v?.toString().toLowerCase().includes(q))
    );
  }, [data, search]);

  const columns: Column<CotDetailRow>[] = useMemo(() => {
    const cols: Column<CotDetailRow>[] = [
      { id: 'sno', label: '#', width: 50, render: (_, i) => i + 1 },
    ];

    if (showCandidateColumns) {
      cols.push(
        { id: 'type', label: 'Type', render: (r) => r.admissionType ? <StatusBadge status={r.admissionType === 'Staff' ? 'error' : 'success'} /> : 'Normal' },
        { id: 'candidateId', label: 'ID', render: (r) => r.candidateId || '-' },
        { id: 'name', label: 'Resident', render: (r) => r.candidateName || '-' },
        { id: 'mobile', label: 'Mobile', render: (r) => r.mobileNumber || '-' },
        { id: 'email', label: 'Email', render: (r) => r.email || '-' },
      );
    }

    cols.push(
      { id: 'branch', label: 'Branch', render: (r) => r.branchName || '-' },
      { id: 'room', label: 'Room', render: (r) => r.roomNumber || '-' },
      { id: 'cot', label: 'Bed', render: (r) => r.cotNumber || '-' },
      { id: 'cotType', label: 'Bed Type', render: (r) => r.cotTypeName || '-' },
      { id: 'rent', label: 'Rent', align: 'right', render: (r) => r.roomRent || r.rentAmount || '-' },
    );

    if (showCandidateColumns) {
      cols.push({ id: 'status', label: 'Status', render: (r) => r.status ? <StatusBadge status={r.status} /> : '-' });
    }

    return cols;
  }, [showCandidateColumns]);

  const exportEXCEL = () => {
    const header = columns.map((c) => c.label);
    const body = filteredData.map((item, idx) => columns.map((c) => {
      const node = c.render(item, idx);
      return typeof node === 'string' || typeof node === 'number' ? node : '-';
    }));
    getExportEXCEL({ header, body, fileName: 'Beds Details' });
  };

  if (!open) return null;

  return (
    <DialogModal
      open={open}
      onClose={onClose}
      title={TITLE_MAP[type] || 'Bed Details'}
      maxWidth="lg"
      actions={
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', width: '100%' }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search beds..." />
          <ExportButton onExport={exportEXCEL} />
        </Box>
      }
    >
      <DataTable
        columns={columns}
        data={filteredData}
        loading={loading}
        skeletonRows={5}
        emptyTitle="No data found"
        emptyDescription="No bed records match your criteria"
      />
    </DialogModal>
  );
}
