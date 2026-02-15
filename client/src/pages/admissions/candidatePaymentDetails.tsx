import { useEffect, useState, useMemo } from 'react';
import { Button, Box } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import moment from 'moment';
import { getPaymentScheduleGridList } from '../../models';
import { getExportEXCEL } from '../../services/HelperService';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/shared/PageHeader';
import ExportButton from '../../components/shared/ExportButton';
import DataTable, { Column } from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';

export default function CandidatePaymentDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [tableItems, setTableItems] = useState<any[]>([]);
  const [tableTotalCount, setTableTotalCount] = useState(0);
  const [tableLoading, setTableLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [candidateName, setCandidateName] = useState('');

  useEffect(() => {
    setTableLoading(true);
    getPaymentScheduleGridList(page, rowsPerPage, id)
      .then((resp) => {
        if (resp?.data?.status === 'success') {
          const results = resp.data.result.results || [];
          setTableItems(results);
          setTableTotalCount(resp.data.result.totalItems || 0);
          if (results.length > 0) setCandidateName(results[0].candidateName);
        }
      })
      .catch(console.log)
      .finally(() => setTableLoading(false));
  }, [id, page, rowsPerPage]);

  const exportEXCEL = () => {
    const header = ['#', 'Resident Name', 'Amount Due', 'Amount Paid', 'Scheduled Date', 'Status', 'Payment Date'];
    const body = tableItems.map((item, index) => [
      index + 1, item.candidateName, item.amountDue, item.amountPaid,
      item.scheduledDate ? moment(item.scheduledDate).format('DD-MM-YYYY') : '',
      item.status,
      item.paymentDate ? moment(item.paymentDate).format('DD-MM-YYYY') : '',
    ]);
    getExportEXCEL({ header, body, fileName: `Payment_Schedule_${candidateName}` });
  };

  const columns: Column<any>[] = useMemo(() => [
    { id: 'sno', label: '#', width: 50, render: (_, i) => i + 1 + (page - 1) * rowsPerPage },
    { id: 'name', label: 'Resident Name', render: (r) => r.candidateName || '-' },
    { id: 'amtDue', label: 'Amount Due', align: 'right' as const, render: (r) => r.amountDue ?? '-' },
    { id: 'amtPaid', label: 'Amount Paid', align: 'right' as const, render: (r) => r.amountPaid ?? '-' },
    { id: 'scheduled', label: 'Scheduled Date', render: (r) => r.scheduledDate ? moment(r.scheduledDate).format('DD-MM-YYYY') : '-' },
    { id: 'status', label: 'Status', render: (r) => r.status ? <StatusBadge status={r.status} /> : '-' },
    { id: 'payDate', label: 'Payment Date', render: (r) => r.paymentDate ? moment(r.paymentDate).format('DD-MM-YYYY') : '-' },
  ], [page, rowsPerPage]);

  return (
    <>
      <PageHeader
        title={`Payment Schedule${candidateName ? ` - ${candidateName}` : ''}`}
        description="View detailed payment schedule for this resident"
      >
        <Button variant="outlined" onClick={() => navigate(-1)} startIcon={<ArrowLeft size={16} />} sx={{ textTransform: 'none' }}>
          Back
        </Button>
        <ExportButton onExport={exportEXCEL} />
      </PageHeader>

      <DataTable
        columns={columns}
        data={tableItems}
        loading={tableLoading}
        totalCount={tableTotalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        emptyTitle="No schedule found"
        emptyDescription="No payment schedule records for this resident"
      />
    </>
  );
}
