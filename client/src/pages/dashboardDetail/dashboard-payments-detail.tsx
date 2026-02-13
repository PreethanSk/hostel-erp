import React, { useEffect, useState, useMemo } from 'react';
import { Box } from '@mui/material';
import { getDashboardPaymentsDetail } from '../../models/index';
import { getExportEXCEL } from '../../services/HelperService';
import DialogModal from '../../components/shared/DialogModal';
import DataTable, { Column } from '../../components/shared/DataTable';
import SearchInput from '../../components/shared/SearchInput';
import ExportButton from '../../components/shared/ExportButton';
import moment from 'moment';

interface DashboardPaymentsDetailModalProps {
  open: boolean;
  onClose: () => void;
  fromDate: string;
  toDate: string;
  branchId: string;
  type?: string;
  detailedData?: any;
}

interface PaymentDetail {
  candidateId: number;
  candidateName: string;
  mobileNumber?: string;
  branchName?: string;
  roomNumber?: string;
  cotNumber?: string;
  updatedAt?: string;
  totalPayment?: string;
  advance?: string;
  pendingPayment?: string;
  refund?: string;
  dueDate?: string;
  advancePending?: string;
  monthlyRentPending?: string;
  lateFeePending?: string;
  tokenAmountPending?: string;
  advancePaid?: string;
  monthlyRentPaid?: string;
  lateFeePaid?: string;
  tokenAmountPaid?: string;
}

const TITLE_MAP: Record<string, string> = {
  advance: 'Token Advance',
  pending: 'Pending Payments',
  refund: 'Refund Payments',
  totalPayments: 'Total Payments',
  paid: 'Total Paid',
};

const DashboardPaymentsDetailModal: React.FC<DashboardPaymentsDetailModalProps> = ({
  open, onClose, fromDate, toDate, branchId, type = 'paid', detailedData,
}) => {
  const [data, setData] = useState<PaymentDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!open) return;
    if (detailedData) {
      const groupKey = type === 'totalPayments' ? 'totalPayments' : type;
      setData(detailedData?.[groupKey] || []);
      return;
    }
    const queryStr = `?branchId=${branchId}&fromDate=${fromDate}&toDate=${toDate}`;
    setLoading(true);
    getDashboardPaymentsDetail(queryStr)
      .then((resp: any) => {
        if (resp?.data?.status === 'success') {
          const groupKey = type === 'totalPayments' ? 'totalPayments' : type;
          setData(resp.data.result?.[groupKey] || []);
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

  const columns: Column<PaymentDetail>[] = useMemo(() => {
    const base: Column<PaymentDetail>[] = [
      { id: 'sno', label: '#', width: 50, render: (_, i) => i + 1 },
      { id: 'name', label: 'Resident', render: (r) => r.candidateName || '-' },
      { id: 'mobile', label: 'Mobile', render: (r) => r.mobileNumber || '-' },
      { id: 'branch', label: 'Branch', render: (r) => r.branchName || '-' },
      { id: 'room', label: 'Room', render: (r) => r.roomNumber || '-' },
      { id: 'cot', label: 'Bed', render: (r) => r.cotNumber || '-' },
      { id: 'updated', label: 'Last Update', render: (r) => r.updatedAt ? moment(r.updatedAt).format('DD-MMM-YY') : '-' },
    ];

    if (type === 'advance') {
      base.push({ id: 'advance', label: 'Advance Paid', align: 'right', render: (r) => r.advance || '-' });
    } else if (type === 'pending') {
      base.push(
        { id: 'totalPaid', label: 'Total Paid', align: 'right', render: (r) => r.totalPayment || '-' },
        { id: 'totalPending', label: 'Total Pending', align: 'right', render: (r) => r.pendingPayment || '-' },
        { id: 'dueDate', label: 'Due Date', render: (r) => r.dueDate ? moment(r.dueDate).format('DD-MM-YYYY') : '-' },
        { id: 'advPending', label: 'Adv Pending', align: 'right', render: (r) => r.advancePending || '-' },
        { id: 'monthlyPending', label: 'Monthly Pending', align: 'right', render: (r) => r.monthlyRentPending || '-' },
        { id: 'latePending', label: 'Late Fee', align: 'right', render: (r) => r.lateFeePending || '-' },
        { id: 'tokenPending', label: 'Token Pending', align: 'right', render: (r) => r.tokenAmountPending || '-' },
      );
    } else if (type === 'paid') {
      base.push(
        { id: 'totalPaid', label: 'Total Paid', align: 'right', render: (r) => r.totalPayment || '-' },
        { id: 'advPaid', label: 'Advance Paid', align: 'right', render: (r) => r.advancePaid || '-' },
        { id: 'monthlyPaid', label: 'Monthly Paid', align: 'right', render: (r) => r.monthlyRentPaid || '-' },
        { id: 'latePaid', label: 'Late Fee', align: 'right', render: (r) => r.lateFeePaid || '-' },
        { id: 'tokenPaid', label: 'Token Paid', align: 'right', render: (r) => r.tokenAmountPaid || '-' },
      );
    } else {
      base.push(
        { id: 'totalPaid', label: 'Total Paid', align: 'right', render: (r) => r.totalPayment || '-' },
        { id: 'totalPending', label: 'Total Pending', align: 'right', render: (r) => r.pendingPayment || '-' },
        { id: 'refund', label: 'Refund', align: 'right', render: (r) => r.refund || '-' },
      );
    }

    return base;
  }, [type]);

  const exportEXCEL = () => {
    const header = columns.map((c) => c.label);
    const body = filteredData.map((item, idx) => columns.map((c) => {
      const node = c.render(item, idx);
      return typeof node === 'string' || typeof node === 'number' ? node : '-';
    }));
    getExportEXCEL({ header, body, fileName: 'Payment Details' });
  };

  if (!open) return null;

  return (
    <DialogModal
      open={open}
      onClose={onClose}
      title={TITLE_MAP[type] || 'Payment Details'}
      maxWidth="lg"
      actions={
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', width: '100%' }}>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search payments..."
          />
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
        emptyDescription="No payment records match your criteria"
      />
    </DialogModal>
  );
};

export default DashboardPaymentsDetailModal;
