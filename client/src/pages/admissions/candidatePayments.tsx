import { useEffect, useState, useMemo } from 'react';
import { MenuItem, Box, Typography } from '@mui/material';
import { Eye } from 'lucide-react';
import CustomSelect from '../../components/helpers/CustomSelect';
import DateRangeSelector from '../../components/helpers/DateRangeSelector';
import { getBranchGridList, getPaymentGridList, getPaymentScheduleGridList } from '../../models';
import moment from 'moment';
import { getExportEXCEL } from '../../services/HelperService';
import PageHeader from '../../components/shared/PageHeader';
import FilterBar from '../../components/shared/FilterBar';
import SearchInput from '../../components/shared/SearchInput';
import ExportButton from '../../components/shared/ExportButton';
import DataTable, { Column } from '../../components/shared/DataTable';
import DialogModal from '../../components/shared/DialogModal';
import StatusBadge from '../../components/shared/StatusBadge';
import { gray } from '../../theme/tokens';

export default function CandidatePayments() {
  const [branchList, setBranchList] = useState<any[]>([]);
  const [filterData, setFilterData] = useState({
    branchId: '',
    fromDate: moment().clone().startOf('month').format('YYYY-MM-DD'),
    toDate: moment().format('YYYY-MM-DD'),
  });
  const [tableItems, setTableItems] = useState<any[]>([]);
  const [tableTotalCount, setTableTotalCount] = useState(0);
  const [tableLoading, setTableLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogRows, setDialogRows] = useState<any[]>([]);

  useEffect(() => {
    getBranchGridList().then((resp) => {
      if (resp?.data?.status === 'success') setBranchList(resp?.data?.result?.results || []);
    });
  }, []);

  const getGridList = () => {
    setTableLoading(true);
    getPaymentGridList(page, rowsPerPage, filterData.branchId, filterData.fromDate, filterData.toDate)
      .then((resp) => {
        if (resp?.data?.status === 'success') {
          setTableItems(resp?.data?.result?.results || []);
          setTableTotalCount(resp?.data?.result?.totalItems || 0);
        }
      })
      .catch(console.log)
      .finally(() => setTableLoading(false));
  };

  useEffect(() => { getGridList(); }, [page, rowsPerPage, filterData]);

  const changeFilterData = (key: string, value: any) => {
    setFilterData({ ...filterData, [key]: value });
    setPage(1);
  };

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return tableItems;
    return tableItems.filter((item: any) =>
      [item?.candidateName, item?.paidAmount, item?.dueToPaid, item?.dueDate, item?.branchName]
        .map((v) => (v ? v.toString().toLowerCase() : ''))
        .some((v) => v.includes(q))
    );
  }, [tableItems, search]);

  const exportEXCEL = () => {
    getPaymentGridList(1, 100000, filterData.branchId, filterData.fromDate, filterData.toDate)
      .then((resp) => {
        if (resp?.data?.status === 'success') {
          const allRows = resp?.data?.result?.results || [];
          const header = ['#', 'Resident ID', 'Resident Name', 'Paid Amount', 'Due To Be Paid', 'Due Date', 'Branch'];
          const body = allRows.map((item: any, index: number) => [
            index + 1, item?.candidateId || '-', item?.candidateName || '-',
            item?.paidAmount ?? '-', item?.dueToPaid ?? '-',
            item?.dueDate ? moment(item?.dueDate).format('DD-MMM-YYYY') : '-',
            item?.branchName || '-',
          ]);
          getExportEXCEL({ header, body, fileName: 'Resident Payments' });
        }
      });
  };

  const handleViewClick = (candidateId: string) => {
    setDialogOpen(true);
    setDialogLoading(true);
    getPaymentScheduleGridList(1, 100, candidateId, '', '')
      .then((resp) => {
        if (resp?.data?.status === 'success') setDialogRows(resp?.data?.result?.results || []);
      })
      .catch(console.log)
      .finally(() => setDialogLoading(false));
  };

  const columns: Column<any>[] = useMemo(() => [
    { id: 'sno', label: '#', width: 50, render: (_, i) => i + 1 + (page - 1) * rowsPerPage },
    {
      id: 'action', label: 'Action', width: 80, render: (r) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', color: gray[500] }}
          onClick={() => handleViewClick(r?.candidateRefId?.toString())}>
          <Typography variant="body2">View</Typography>
          <Eye size={16} />
        </Box>
      ),
    },
    { id: 'candidateId', label: 'Resident ID', render: (r) => r?.candidateId || '-' },
    { id: 'name', label: 'Resident Name', render: (r) => r?.candidateName || '-' },
    { id: 'paid', label: 'Paid Amount', align: 'right' as const, render: (r) => r?.paidAmount ?? '-' },
    { id: 'due', label: 'Due To Be Paid', align: 'right' as const, render: (r) => r?.dueToPaid ?? '-' },
    { id: 'dueDate', label: 'Due Date', render: (r) => r?.dueDate ? moment(r.dueDate).format('DD-MMM-YYYY') : '-' },
    { id: 'branch', label: 'Branch', render: (r) => r?.branchName || '-' },
  ], [page, rowsPerPage]);

  const scheduleColumns: Column<any>[] = [
    { id: 'name', label: 'Resident', render: (r) => r?.candidateName || '-' },
    { id: 'room', label: 'Room', render: (r) => r?.roomNumber || '-' },
    { id: 'branch', label: 'Branch', render: (r) => r?.branchName || '-' },
    { id: 'scheduled', label: 'Scheduled Date', render: (r) => r?.scheduledDate ? moment(r.scheduledDate).format('DD-MMM-YYYY') : '-' },
    { id: 'amtDue', label: 'Amount Due', align: 'right', render: (r) => r?.amountDue ?? '-' },
    { id: 'amtPaid', label: 'Amount Paid', align: 'right', render: (r) => r?.amountPaid ?? '-' },
    { id: 'payDate', label: 'Payment Date', render: (r) => r?.paymentDate ? moment(r.paymentDate).format('DD-MMM-YYYY') : '-' },
    { id: 'status', label: 'Status', render: (r) => r?.status ? <StatusBadge status={r.status} /> : '-' },
  ];

  return (
    <>
      <PageHeader title="Resident Payments" description="View and manage payment records">
        <ExportButton onExport={exportEXCEL} />
      </PageHeader>

      <FilterBar>
        <CustomSelect
          padding="0px 10px" value={filterData.branchId}
          onChange={(e: any) => changeFilterData('branchId', e.target.value)}
          placeholder="Branch"
          menuItem={[
            <MenuItem key={-1} value="">All</MenuItem>,
            ...branchList.map((item: any) => <MenuItem key={item.id} value={item.id}>{item.branchName}</MenuItem>),
          ]}
        />
        <DateRangeSelector handleChangeDate={(from: string, to: string) => setFilterData({ ...filterData, fromDate: from, toDate: to })} />
        <SearchInput value={search} onChange={setSearch} placeholder="Search payments..." />
      </FilterBar>

      <DataTable
        columns={columns}
        data={filteredItems}
        loading={tableLoading}
        totalCount={tableTotalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        emptyTitle="No payments found"
        emptyDescription="No payment records match your criteria"
      />

      <DialogModal
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setDialogRows([]); }}
        title="Payment Schedule"
        maxWidth="lg"
      >
        <DataTable
          columns={scheduleColumns}
          data={dialogRows}
          loading={dialogLoading}
          emptyTitle="No schedule found"
          emptyDescription="No payment schedule records for this resident"
        />
      </DialogModal>
    </>
  );
}
