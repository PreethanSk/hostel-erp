import { useEffect, useState, useMemo } from 'react';
import { Box } from '@mui/material';
import { getExportEXCEL } from '../../services/HelperService';
import { getDashboardBookingsDetail } from '../../models';
import DialogModal from '../../components/shared/DialogModal';
import DataTable, { Column } from '../../components/shared/DataTable';
import SearchInput from '../../components/shared/SearchInput';
import ExportButton from '../../components/shared/ExportButton';
import StatusBadge from '../../components/shared/StatusBadge';
import moment from 'moment';

interface DashboardBookingsDetailModalProps {
  open: boolean;
  onClose: () => void;
  fromDate: string;
  toDate: string;
  branchId: string;
  type?: string;
  detailedData?: any;
}

interface BookingDetail {
  candidateId: number;
  candidateName: string;
  mobileNumber?: string;
  email?: string;
  branchName?: string;
  roomNumber?: string;
  cotNumber?: string;
  roomRent?: string;
  rejectedOrCancelledDate?: string;
  paymentStatus?: string;
  status?: string;
}

const TITLE_MAP: Record<string, string> = {
  totalBooking: 'Total Booking Details',
  cancelled: 'Cancelled Details',
  pendingBooking: 'Pending Details',
  confirmBooking: 'Confirmed Details',
  vacant: 'Vacant Details',
};

export default function DashboardBookingsDetailModal({
  open, onClose, fromDate, toDate, branchId, type = 'confirmBooking', detailedData,
}: DashboardBookingsDetailModalProps) {
  const [data, setData] = useState<BookingDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!open) return;
    if (detailedData) {
      setData(detailedData?.[type] || []);
      return;
    }
    setLoading(true);
    const queryStr = `?branchId=${branchId}&from=${fromDate}&to=${toDate}`;
    getDashboardBookingsDetail(queryStr)
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

  const columns: Column<BookingDetail>[] = useMemo(() => {
    const cols: Column<BookingDetail>[] = [
      { id: 'sno', label: '#', width: 50, render: (_, i) => i + 1 },
      { id: 'candidateId', label: 'ID', render: (r) => r.candidateId || '-' },
      { id: 'name', label: 'Resident', render: (r) => r.candidateName || '-' },
      { id: 'mobile', label: 'Mobile', render: (r) => r.mobileNumber || '-' },
      { id: 'email', label: 'Email', render: (r) => r.email || '-' },
      { id: 'branch', label: 'Branch', render: (r) => r.branchName || '-' },
      { id: 'room', label: 'Room', render: (r) => r.roomNumber || '-' },
      { id: 'cot', label: 'Bed', render: (r) => r.cotNumber || '-' },
      { id: 'rent', label: 'Rent', align: 'right', render: (r) => r.roomRent || '-' },
      { id: 'payment', label: 'Payment', render: (r) => r.paymentStatus ? <StatusBadge status={r.paymentStatus} /> : 'Unpaid' },
      { id: 'status', label: 'Status', render: (r) => r.status ? <StatusBadge status={r.status} /> : '-' },
    ];

    if (type === 'cancelled') {
      cols.push({
        id: 'cancelDate',
        label: 'Cancelled Date',
        render: (r) => r.rejectedOrCancelledDate && moment(r.rejectedOrCancelledDate).isValid()
          ? moment(r.rejectedOrCancelledDate).format('DD-MMM-YYYY')
          : '-',
      });
    }

    return cols;
  }, [type]);

  const exportEXCEL = () => {
    const header = columns.map((c) => c.label);
    const body = filteredData.map((item, idx) => columns.map((c) => {
      const node = c.render(item, idx);
      return typeof node === 'string' || typeof node === 'number' ? node : '-';
    }));
    getExportEXCEL({ header, body, fileName: 'Bookings Details' });
  };

  if (!open) return null;

  return (
    <DialogModal
      open={open}
      onClose={onClose}
      title={TITLE_MAP[type] || 'Booking Details'}
      maxWidth="lg"
      actions={
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', width: '100%' }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search bookings..." />
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
        emptyDescription="No booking records match your criteria"
      />
    </DialogModal>
  );
}
