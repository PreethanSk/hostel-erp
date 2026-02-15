import { useEffect, useState, useMemo } from 'react';
import { TextField, MenuItem, Button, Box, Typography, Divider } from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import { ArrowLeft } from 'lucide-react';
import moment from 'moment';
import { CustomAlert, DisableKeyUpDown, getExportEXCEL } from '../../services/HelperService';
import {
  getAdmissionEbChargesGridList, getBranchGridList, getBranchRoomsList,
  getCandidatePaymentDetail, getMasterRoomType,
  insertUpdateCandidateAdmissionAnyDetail, insertUpdateCandidatePaymentAnyDetails,
} from '../../models';
import CustomSelect from '../../components/helpers/CustomSelect';
import { useStateValue } from '../../providers/StateProvider';
import DateRangeSelector from '../../components/helpers/DateRangeSelector';
import { Edit } from '@mui/icons-material';
import PageHeader from '../../components/shared/PageHeader';
import FilterBar from '../../components/shared/FilterBar';
import SearchInput from '../../components/shared/SearchInput';
import ExportButton from '../../components/shared/ExportButton';
import DataTable, { Column } from '../../components/shared/DataTable';
import FormField from '../../components/shared/FormField';
import { gray } from '../../theme/tokens';

export default function EbCharges({ PageAccess }: any) {
  const [{ }]: any = useStateValue();
  const [branchList, setBranchList] = useState<any>([]);
  const [roomTypeList, setRoomTypeList] = useState<any>([]);

  const [tableItems, setTableItems] = useState<any>([]);
  const [tableTotalCount, setTableTotalCount] = useState(0);
  const [tableLoading, setTableLoading] = useState(true);
  const [loading, setLoading] = useState(-1);
  const [search, setSearch] = useState('');
  const [filterData, setFilterData] = useState({
    branchId: '', fromDate: moment().clone().startOf('month').format('YYYY-MM-DD'),
    toDate: moment().format('YYYY-MM-DD'), roomType: '',
  });
  const [editForm, setEditForm] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [ebFlag, setEbFlag] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentDetails, setPaymentDetails] = useState<any>({});
  const [formData, setFormData] = useState<any>({
    id: 0, ebChargePaid: '', ebChargePending: '', miscellaneousPaid: '', miscellaneousPending: '',
    ebCharges: '', miscellaneousCharges: '', selectedIndex: -1,
  });

  const changeFilterData = (key: string, value: any) => {
    setFilterData({ ...filterData, [key]: value });
  };
  const changeFormData = (key: string, value: any) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    getTotalSum(updated);
  };
  const changeGridItem = (key: string, value: any, index: number) => {
    const tempArr = [...tableItems];
    tempArr[index][key] = value;
    setTableItems([...tempArr]);
  };
  const handleClearForm = () => {
    getGridList();
    setLoading(-1);
    setEditForm(false);
    setFormData({ id: 0, edit: false, isActive: true });
  };

  const getTotalSum = (obj: any) => {
    let total = [
      Number(obj?.admissionFeePending || '0'), Number(obj?.advancePending || '0'),
      Number(obj?.lateFeePending || '0'), Number(obj?.monthlyRentPending || '0'),
      Number(obj?.ebChargePending || '0'), Number(obj?.miscellaneousPending || '0'),
    ].reduce((acc, v) => acc + v, 0);
    total -= Number(obj?.tokenAmountPaid || '0');
    return total;
  };

  const exportEXCEL = () => {
    const header = ['#', 'Branch', 'Room', 'Room Type', 'Bed', 'Bed Type', 'Resident', 'Mobile', 'Admission Date', 'Utility Charges', 'Miscellaneous'];
    const body = tableItems?.map((item: any, index: number) => [
      index + 1, item?.branchName, item?.roomNumber, item?.roomTypeName, item?.cotNumber, item?.cotTypeName,
      item?.candidateName, item?.candidateMobileNumber,
      item?.dateOfAdmission ? moment(item.dateOfAdmission).format('DD-MMM-YYYY') : '',
      item?.ebCharges || '', item?.miscellaneousCharges || '',
    ]);
    getExportEXCEL({ header, body, fileName: 'Utility Charges' });
  };

  const getOtherList = () => {
    getBranchGridList()
      .then((resp) => { if (resp?.data?.status === 'success') setBranchList(resp?.data?.result?.results); })
      .catch(console.log);
    getMasterRoomType()
      .then((resp) => { if (resp?.data?.status === 'success') setRoomTypeList(resp?.data?.result); })
      .catch(console.log);
  };

  const getGridList = () => {
    setTableLoading(true);
    getAdmissionEbChargesGridList(page, rowsPerPage, filterData?.branchId?.toString(), filterData?.roomType?.toString(), filterData?.fromDate, filterData?.toDate)
      .then((resp) => {
        if (resp?.data?.status === 'success') {
          setTableItems(resp?.data?.result?.results);
          setTableTotalCount(resp?.data?.result?.totalItems);
        }
      })
      .catch(console.log)
      .finally(() => setTableLoading(false));
  };

  const handleSave = (item: any, index: number) => {
    const admissionBody = { id: item?.id, ebCharges: item?.ebCharges, miscellaneousCharges: item?.miscellaneousCharges };
    setLoading(index);
    insertUpdateCandidateAdmissionAnyDetail(admissionBody)
      .then((resp) => {
        if (resp?.data?.status === 'success') {
          getCandidatePaymentDetail(item?.candidateRefId)
            .then((resp) => {
              if (resp?.data?.status === 'success') {
                const pd = resp?.data?.result;
                const total = getTotalSum({ ...pd, ebChargePending: admissionBody?.ebCharges, miscellaneousPending: admissionBody?.miscellaneousCharges });
                let dueToPaid = Number(pd?.dueToPaid || '0');
                if (Number(pd?.ebChargePending || '0')) { dueToPaid -= Number(pd?.ebChargePending || '0'); dueToPaid += Number(admissionBody?.ebCharges || '0'); }
                else { dueToPaid += Number(admissionBody?.ebCharges || '0'); }
                if (Number(pd?.miscellaneousPending || '0')) { dueToPaid -= Number(pd?.miscellaneousPending || '0'); dueToPaid += Number(admissionBody?.miscellaneousCharges || '0'); }
                else { dueToPaid += Number(admissionBody?.miscellaneousCharges || '0'); }
                insertUpdateCandidatePaymentAnyDetails({
                  id: pd?.id, ebChargePending: admissionBody?.ebCharges, miscellaneousPending: admissionBody?.miscellaneousCharges,
                  dueToPaid, totalPendingAmount: Math.ceil(Number(total || '0') - Number(dueToPaid || '0')),
                })
                  .then((resp) => { if (resp?.data?.status === 'success') CustomAlert('success', 'Utility charges updated'); })
                  .catch(console.log)
                  .finally(() => setLoading(-1));
              }
            });
        }
      })
      .catch(console.log);
  };

  useEffect(() => { getGridList(); }, [page, rowsPerPage, filterData]);
  useEffect(() => { getOtherList(); }, []);

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return tableItems || [];
    return (tableItems || []).filter((item: any) =>
      Object.values(item).some((v: any) => v?.toString().toLowerCase().includes(q))
    );
  }, [tableItems, search]);

  const columns: Column<any>[] = useMemo(() => [
    { id: 'sno', label: '#', width: 50, render: (_, i) => i + 1 + (page - 1) * rowsPerPage },
    { id: 'branch', label: 'Branch', render: (r) => r?.branchName || '-' },
    { id: 'room', label: 'Room', render: (r) => r?.roomNumber || '-' },
    { id: 'roomType', label: 'Room Type', render: (r) => r?.roomTypeName || '-' },
    { id: 'bed', label: 'Bed', render: (r) => r?.cotNumber || '-' },
    { id: 'bedType', label: 'Bed Type', render: (r) => r?.cotTypeName || '-' },
    { id: 'name', label: 'Resident', render: (r) => r?.candidateName || '-' },
    { id: 'mobile', label: 'Mobile', render: (r) => r?.candidateMobileNumber || '-' },
    { id: 'admDate', label: 'Admission Date', render: (r) => r?.dateOfAdmission ? moment(r.dateOfAdmission).format('DD-MMM-YYYY') : '-' },
    { id: 'booking', label: 'Booking Type', render: (r) => r?.noDayStayType || '-' },
    {
      id: 'eb', label: 'Utility Charges', width: 120, render: (r, i) => (
        <TextField size="small" type="number" onKeyDown={DisableKeyUpDown}
          value={r?.ebCharges?.toString() || ''} sx={{ width: 100 }}
          onChange={(e) => changeGridItem('ebCharges', e.target.value, i)} />
      ),
    },
    {
      id: 'misc', label: 'Miscellaneous', width: 120, render: (r, i) => (
        <TextField size="small" type="number" onKeyDown={DisableKeyUpDown}
          value={r?.miscellaneousCharges?.toString() || ''} sx={{ width: 100 }}
          onChange={(e) => changeGridItem('miscellaneousCharges', e.target.value, i)} />
      ),
    },
    {
      id: 'action', label: 'Action', width: 80, render: (r, i) => (
        PageAccess === 'Write' ? (
          <Button size="small" variant="contained" onClick={() => handleSave(r, i)}
            disabled={i === loading} sx={{ textTransform: 'none' }}>
            Save
          </Button>
        ) : null
      ),
    },
  ], [page, rowsPerPage, tableItems, loading]);

  // ── Edit Form View ──
  if (editForm) {
    return (
      <Box>
        <Box onClick={handleClearForm} sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', mb: 2 }}>
          <ArrowLeft size={20} color={gray[600]} />
          <Typography sx={{ fontWeight: 600, color: gray[700] }}>Back</Typography>
        </Box>
        <Grid2 container spacing={3}>
          <Grid2 size={{ xs: 6, md: 3 }}><FormField label="Admission Fee"><Typography variant="body2">{paymentDetails?.admissionFee || '-'}</Typography></FormField></Grid2>
          <Grid2 size={{ xs: 6, md: 3 }}><FormField label="Advance Fee"><Typography variant="body2">{formData?.advancePending?.toString() || '-'}</Typography></FormField></Grid2>
          <Grid2 size={{ xs: 6, md: 3 }}><FormField label={`Rent (${formData?.noDayStayType === 'Month' ? 'Monthly' : 'Per Day'})`}><Typography variant="body2">{formData?.monthlyRentPending?.toString() || '-'}</Typography></FormField></Grid2>
          <Grid2 size={{ xs: 6, md: 3 }}><FormField label="Token Amount"><Typography variant="body2">{formData?.tokenAmountPaid?.toString() || '-'}</Typography></FormField></Grid2>
          <Grid2 size={{ xs: 6, md: 3 }}><FormField label="Late Fee"><Typography variant="body2">{formData?.lateFeePending?.toString() || '-'}</Typography></FormField></Grid2>
          <Grid2 size={{ xs: 6, md: 3 }}><FormField label="Due Date"><Typography variant="body2">{formData?.dueDate ? moment(formData?.dueDate).format('DD-MM-YYYY') : '-'}</Typography></FormField></Grid2>
        </Grid2>
        <Divider sx={{ my: 2 }} />
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>Total Amount for Resident Pay:</Typography>
        <Grid2 container spacing={3}>
          <Grid2 size={{ xs: 6, md: 3 }}><FormField label="Pay by Resident"><Typography variant="body2">{formData?.dueToPaid?.toString() || '-'}</Typography></FormField></Grid2>
          <Grid2 size={{ xs: 6, md: 3 }}><FormField label="Discount Offer"><Typography variant="body2">{formData?.discountOffer?.toString() || '-'}</Typography></FormField></Grid2>
          <Grid2 size={{ xs: 6, md: 3 }}><FormField label="Additional Charges"><Typography variant="body2">{formData?.additionalCharges?.toString() || '-'}</Typography></FormField></Grid2>
        </Grid2>
        <Divider sx={{ my: 2 }} />
        <Grid2 container spacing={3}>
          <Grid2 size={{ xs: 6, md: 3 }}>
            <FormField label="Utility Charges">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {ebFlag ? (
                  <TextField fullWidth size="small" type="number" onKeyDown={DisableKeyUpDown}
                    value={formData?.ebChargePending?.toString() || ''}
                    onChange={(e) => changeFormData('ebChargePending', e.target.value)} />
                ) : (
                  <Typography variant="body2">{formData?.ebChargePending?.toString() || '-'}</Typography>
                )}
                {!ebFlag && <Edit sx={{ fontSize: 16, cursor: 'pointer', color: 'primary.main' }} onClick={() => setEbFlag(true)} />}
              </Box>
            </FormField>
          </Grid2>
          <Grid2 size={{ xs: 6, md: 3 }}><FormField label="Paid Amount"><Typography variant="body2">{formData?.paidAmount || 0}</Typography></FormField></Grid2>
          <Grid2 size={{ xs: 6, md: 3 }}><FormField label="Due to be Paid"><Typography variant="body2">{Math.ceil(Number(totalAmount || '0'))}</Typography></FormField></Grid2>
          <Grid2 size={{ xs: 6, md: 3 }}><FormField label="Remaining Amount"><Typography variant="body2">{Math.ceil(Number(totalAmount || '0') - Number(formData?.dueToPaid || '0') - Number(formData?.discountOffer || '0'))}</Typography></FormField></Grid2>
        </Grid2>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
          <Button variant="outlined" color="error" onClick={handleClearForm} sx={{ textTransform: 'none' }}>Cancel</Button>
        </Box>
      </Box>
    );
  }

  // ── List View ──
  return (
    <>
      <PageHeader title="Utility Charges" description="Manage utility and miscellaneous charges per admission">
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
        <CustomSelect
          padding="0px 10px" value={filterData.roomType}
          onChange={(e: any) => changeFilterData('roomType', e.target.value)}
          placeholder="Room Type"
          menuItem={[
            <MenuItem key={-1} value="">All</MenuItem>,
            ...roomTypeList.map((item: any) => <MenuItem key={item.id} value={item.id}>{item.type}</MenuItem>),
          ]}
        />
        <DateRangeSelector handleChangeDate={(from: string, to: string) => setFilterData({ ...filterData, fromDate: from, toDate: to })} />
        <SearchInput value={search} onChange={setSearch} placeholder="Search charges..." />
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
        emptyTitle="No records found"
        emptyDescription="No utility charge records match your criteria"
      />
    </>
  );
}
