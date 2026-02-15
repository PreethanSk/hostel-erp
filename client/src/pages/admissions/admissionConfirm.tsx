import { MenuItem, FormControl, Select, TextField, Stepper, Step, StepLabel } from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import { Box, Button, Typography } from '@mui/material';
import moment from 'moment';
import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Eye, MapPin, DoorOpen, BedDouble, Calendar, UserRound, Save } from 'lucide-react';
import CustomSelect from '../../components/helpers/CustomSelect';
import DateRangeSelector from '../../components/helpers/DateRangeSelector';
import { getApprovedAdmissionGridList, getBranchGridList, getBranchRoomsList, insertUpdateCandidateAdmission } from '../../models';
import { useStateValue } from '../../providers/StateProvider';
import { getExportEXCEL, CustomAlert, DisableKeyUpDown } from '../../services/HelperService';
import { gray, primary, radius } from '../../theme/tokens';
import PageHeader from '../../components/shared/PageHeader';
import DataTable, { Column } from '../../components/shared/DataTable';
import SearchInput from '../../components/shared/SearchInput';
import ExportButton from '../../components/shared/ExportButton';
import FilterBar from '../../components/shared/FilterBar';
import StatusBadge from '../../components/shared/StatusBadge';
import CandidateDetails from './components/candidateDetails';
import ContactPerson from './components/contactPerson';
import Documents from './components/documents';
import Others from './components/others';
import PurposeOfStay from './components/purposeOfStay';
import RoomAndFee from './components/roomAndFee';
import Payments from './components/payments';

const STEPS = ['Resident Details', 'Room & Pricing', 'Documents', 'Emergency Contact', 'Purpose of Stay', 'Additional Details', 'Payment Setup'];

export default function AdmissionConfirm({ PageAccess }: any) {
  const [{ user, admissionDetails }, dispatch]: any = useStateValue();
  const [branchList, setBranchList] = useState<any>([]);
  const [roomList, setRoomList] = useState<any>([]);
  const [cotList, setCotList] = useState<any>([]);

  const [tableItems, setTableItems] = useState<any>([]);
  const [tableTotalCount, setTableTotalCount] = useState(0);
  const [tableLoading, setTableLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterData, setFilterData] = useState({
    branchId: '', paymentStatus: '',
    fromDate: moment().clone().startOf('month').format('YYYY-MM-DD'),
    toDate: moment().format('YYYY-MM-DD'),
  });
  const [editForm, setEditForm] = useState(false);
  const [selectedTab, setSelectedTab] = useState(1);
  const [formData, setFormData] = useState<any>({ id: 0, edit: false, isActive: true });
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const validate = {
    branchRefId: { error: false, message: '' },
    roomRefId: { error: false, message: '' },
    cotRefId: { error: false, message: '' },
    dateOfAdmission: { error: false, message: '' },
  };
  const [_validate, _setValidate] = useState(validate);

  const changeFilterData = (key: string, value: any) => {
    setFilterData({ ...filterData, [key]: value });
  };
  const changeFormData = (key: string, value: any) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleUpdateItem = (item: any) => {
    dispatch({
      type: 'SET_ADMISSION_DETAILS',
      data: { admissionDetails: { ...item }, edit: true, payment: true },
    });
    setFormData({ ...item, edit: true });
    setEditForm(true);
  };

  const handleGoBack = () => {
    setEditForm(false);
    handleClearForm();
  };

  const handleClearForm = () => {
    dispatch({ type: 'SET_ADMISSION_DETAILS', data: null });
    getGridList();
    setSelectedTab(1);
    setLoading(false);
    setEditForm(false);
    setFormData({ id: 0, edit: false, isActive: true });
  };

  const handleCotAndFeeUpdate = (item: any) => {
    setFormData({
      ...formData,
      cotRefId: item?.id,
      admissionFee: item?.advanceAmount,
      monthlyRent: admissionDetails?.admissionDetails?.noDayStayType === 'Month' ? item?.rentAmount : item?.perDayRent,
    });
  };

  const columns: Column<any>[] = useMemo(() => [
    { id: 'sno', label: '#', width: 50, render: (_, i) => i + 1 + (page - 1) * rowsPerPage },
    {
      id: 'action', label: 'Action', width: 80, render: (r) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', color: gray[500] }}
          onClick={() => handleUpdateItem(r)}>
          <Typography variant="body2">View</Typography>
          <Eye size={16} />
        </Box>
      ),
    },
    {
      id: 'status', label: 'Status', render: (r) => {
        const label = r.admissionType === 'Staff' ? 'Staff' : (r.paymentStatus || 'Unpaid');
        return <StatusBadge status={label} />;
      },
    },
    { id: 'branch', label: 'Branch', render: (r) => r.branchName || '-' },
    { id: 'room', label: 'Room', render: (r) => r.roomNumber || '-' },
    { id: 'roomType', label: 'Room Type', render: (r) => r.roomTypeName || '-' },
    { id: 'bed', label: 'Bed', render: (r) => r.cotNumber || '-' },
    { id: 'bedType', label: 'Bed Type', render: (r) => r.cotTypeName || '-' },
    { id: 'name', label: 'Resident', render: (r) => r.candidateName || '-' },
    { id: 'mobile', label: 'Mobile', render: (r) => r.candidateMobileNumber || '-' },
    { id: 'admission', label: 'Admission Date', render: (r) => r.dateOfAdmission ? moment(r.dateOfAdmission).format('DD-MMM-YYYY') : '-' },
    { id: 'updated', label: 'Updated', render: (r) => r.updatedAt ? moment(r.updatedAt).format('DD-MMM-YYYY') : '-' },
  ], [page, rowsPerPage]);

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return tableItems;
    return tableItems.filter((item: any) =>
      Object.values(item).some((v: any) => v?.toString().toLowerCase().includes(q))
    );
  }, [tableItems, search]);

  const exportEXCEL = () => {
    const header = columns.map((c) => c.label);
    const body = filteredItems.map((item: any, idx: number) => columns.map((c) => {
      const node = c.render(item, idx);
      return typeof node === 'string' || typeof node === 'number' ? node : '-';
    }));
    getExportEXCEL({ header, body, fileName: 'Admissions' });
  };

  const checkValidation = () => {
    if (!formData?.branchRefId) { CustomAlert('warning', 'Branch not selected'); return false; }
    if (!formData?.roomRefId) { CustomAlert('warning', 'Room not selected'); return false; }
    if (!formData?.cotRefId) { CustomAlert('warning', 'Bed not selected'); return false; }
    if (!formData?.dateOfAdmission) { CustomAlert('warning', 'Date of admission not selected'); return false; }
    return true;
  };

  const handleSubmitForm = () => {
    setLoading(true);
    if (!checkValidation()) { setLoading(false); return; }
    const body = {
      id: formData?.id || 0,
      candidateRefId: formData?.candidateRefId || 0,
      branchRefId: formData?.branchRefId || 0,
      roomRefId: formData?.roomRefId || 0,
      cotRefId: formData?.cotRefId || 0,
      dateOfAdmission: formData?.dateOfAdmission || '',
      dateOfNotice: formData?.dateOfNotice || formData?.dateOfAdmission || '',
      admissionFee: formData?.admissionFee || '',
      advancePaid: formData?.advancePaid || '',
      monthlyRent: formData?.monthlyRent || '',
      noDayStayType: formData?.noDayStayType || 'Month',
      noDayStay: formData?.noDayStay || '1',
      dues: formData?.dues || '',
      admittedBy: formData?.id ? formData?.admittedBy : (user?.firstName + ' ' + user?.lastName),
      admissionStatus: 'Approved',
      paymentStatus: 'Unpaid',
      isActive: formData?.isActive || false,
    };
    insertUpdateCandidateAdmission(body)
      .then((resp) => {
        if (resp?.data?.status === 'success') {
          CustomAlert('success', 'Admission details saved');
          if (body?.id === 0) body.id = resp?.data?.result?.insertedId;
          setFormData({ ...formData, id: resp?.data?.result?.insertedId, admittedBy: body?.admittedBy });
          dispatch({ type: 'SET_ADMISSION_DETAILS', data: { ...admissionDetails, admissionDetails: body } });
        }
      })
      .catch((err) => { console.log(err); CustomAlert('warning', err?.response?.data?.error); })
      .finally(() => setLoading(false));
  };

  const getOtherList = () => {
    getBranchGridList()
      .then((resp) => { if (resp?.data?.status === 'success') setBranchList(resp?.data?.result?.results); })
      .catch(console.log);
  };

  const getGridList = () => {
    setTableLoading(true);
    getApprovedAdmissionGridList(page, rowsPerPage, filterData?.branchId?.toString(), filterData?.fromDate, filterData?.toDate, filterData?.paymentStatus)
      .then((resp) => {
        if (resp?.data?.status === 'success') {
          setTableItems(resp?.data?.result?.results);
          setTableTotalCount(resp?.data?.result?.totalItems);
        }
      })
      .catch(console.log)
      .finally(() => setTableLoading(false));
  };

  const handleUpdateSearch = (fromDate: string, toDate: string) => {
    setFilterData({ ...filterData, fromDate, toDate });
  };

  useEffect(() => {
    if (formData?.branchRefId) {
      getBranchRoomsList(formData?.branchRefId, 'admin')
        .then((resp) => {
          if (resp?.data?.status === 'success') {
            setRoomList(resp?.data?.result);
            if (formData?.cotRefId) {
              const tempArr = resp?.data?.result?.find((fItem: any) => fItem?.id === formData?.roomRefId)?.Cots;
              setCotList([...tempArr]);
            }
          }
        })
        .catch(console.log);
    }
  }, [formData?.branchRefId]);

  useEffect(() => { getOtherList(); }, []);
  useEffect(() => { getGridList(); }, [page, rowsPerPage, filterData]);

  // ── List View ──
  if (!editForm) {
    return (
      <Box sx={{ px: 3, py: 2 }}>
        <PageHeader title="Admissions" description="Manage approved resident admissions">
          <ExportButton onExport={exportEXCEL} />
        </PageHeader>

        <FilterBar>
          <CustomSelect
            padding="0px 10px"
            value={filterData.branchId}
            onChange={(e: any) => changeFilterData('branchId', e.target.value)}
            placeholder="Branch"
            menuItem={[
              <MenuItem key={-1} value="" sx={{ fontSize: 14 }}>All</MenuItem>,
              ...branchList.map((item: any) => (
                <MenuItem key={item.id} value={item.id} sx={{ fontSize: 14 }}>{item.branchName}</MenuItem>
              )),
            ]}
          />
          <CustomSelect
            padding="0px 10px"
            value={filterData.paymentStatus}
            onChange={(e: any) => changeFilterData('paymentStatus', e.target.value)}
            placeholder="Status"
            menuItem={[
              <MenuItem key={-1} value="" sx={{ fontSize: 14 }}>All</MenuItem>,
              ...['Paid', 'Unpaid', 'Partially Paid'].map((item) => (
                <MenuItem key={item} value={item} sx={{ fontSize: 14 }}>{item}</MenuItem>
              )),
            ]}
          />
          <DateRangeSelector handleChangeDate={handleUpdateSearch} />
          <SearchInput value={search} onChange={setSearch} placeholder="Search admissions..." />
        </FilterBar>

        <DataTable
          columns={columns}
          data={filteredItems}
          loading={tableLoading}
          skeletonRows={5}
          emptyTitle="No admissions found"
          emptyDescription="No approved admission records match your criteria"
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={tableTotalCount}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
        />
      </Box>
    );
  }

  // ── Edit / Detail View ──
  return (
    <Box sx={{ px: 3, py: 2 }}>
      <Box
        sx={{
          bgcolor: gray[50],
          border: `1px solid ${gray[200]}`,
          borderRadius: radius.lg,
          p: 3,
        }}
      >
        {/* Back button */}
        <Box
          onClick={handleGoBack}
          sx={{
            display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer',
            pb: 2, borderBottom: `1px solid ${gray[200]}`, mb: 2,
          }}
        >
          <ArrowLeft size={20} />
          <Typography variant="subtitle1" fontWeight={600}>Back</Typography>
        </Box>

        {/* Header fields */}
        <Grid2 container spacing={2} sx={{ pt: 1 }}>
          <Grid2 size={{ xs: 12, md: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: gray[500], mb: 0.5 }}>
              <MapPin size={16} /> <Typography variant="caption">Branch Name</Typography>
            </Box>
            <FormControl variant="standard" fullWidth sx={{ ml: 3 }}>
              <Select
                readOnly={formData?.edit}
                value={formData?.branchRefId || ''}
                onChange={(e) => changeFormData('branchRefId', e.target.value)}
                disableUnderline
                sx={{ fontSize: 14 }}
              >
                {branchList.map((m: any, i: number) => (
                  <MenuItem key={i} value={m.id} sx={{ fontSize: 14 }}>{m.branchName}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: gray[500], mb: 0.5 }}>
              <DoorOpen size={16} /> <Typography variant="caption">Room</Typography>
            </Box>
            <FormControl variant="standard" fullWidth sx={{ ml: 3 }}>
              <Select
                readOnly={formData?.edit}
                value={formData?.roomRefId || ''}
                disableUnderline
                sx={{ fontSize: 14 }}
              >
                {roomList.map((m: any, i: number) => (
                  <MenuItem key={i} value={m.id} onClick={() => {
                    setCotList([...m.Cots]);
                    setFormData({ ...formData, roomRefId: m.id, roomTypeName: m.roomTypeName });
                  }} sx={{ fontSize: 14 }}>{m.roomNumber}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: gray[500], mb: 0.5 }}>
              <DoorOpen size={16} /> <Typography variant="caption">Room Type</Typography>
            </Box>
            <Typography variant="body2" sx={{ ml: 3 }}>{formData?.roomTypeName || '-'}</Typography>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: gray[500], mb: 0.5 }}>
              <BedDouble size={16} /> <Typography variant="caption">Bed</Typography>
            </Box>
            <FormControl variant="standard" fullWidth sx={{ ml: 3 }}>
              <Select
                readOnly={formData?.edit}
                value={formData?.cotRefId || ''}
                disableUnderline
                sx={{ fontSize: 14 }}
              >
                {cotList.map((m: any, i: number) => (
                  <MenuItem key={i} value={m.id} onClick={() => handleCotAndFeeUpdate(m)} sx={{ fontSize: 14 }}>
                    {m.cotNumber} - {m.CotType?.type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: gray[500], mb: 0.5 }}>
              <Calendar size={16} /> <Typography variant="caption">Admission Date</Typography>
            </Box>
            <TextField
              variant="standard"
              type="date"
              fullWidth
              onKeyDown={DisableKeyUpDown}
              value={formData?.dateOfAdmission || ''}
              onChange={(e: any) => changeFormData('dateOfAdmission', e.target.value)}
              inputProps={{ min: new Date().toISOString().split('T')[0] }}
              InputProps={{ readOnly: formData?.edit, disableUnderline: true }}
              sx={{ ml: 3, '& input': { fontSize: 14 } }}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 2 }}>
            {formData?.id ? (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: gray[500], mb: 0.5 }}>
                  <UserRound size={16} /> <Typography variant="caption">Admitted By</Typography>
                </Box>
                <Typography variant="body2" sx={{ ml: 3 }}>{formData?.admittedBy || '-'}</Typography>
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <Button variant="contained" color="primary" disabled={loading} onClick={handleSubmitForm}
                  startIcon={<Save size={16} />}>
                  Save
                </Button>
              </Box>
            )}
          </Grid2>
        </Grid2>

        {/* Tabs / Stepper */}
        <Box sx={{ mt: 3, display: formData?.id ? 'block' : 'none' }}>
          <Stepper
            activeStep={selectedTab - 1}
            alternativeLabel
            sx={{
              bgcolor: gray[800],
              borderRadius: radius.md,
              py: 1.5,
              px: 2,
              '& .MuiStepLabel-label': { color: gray[400], fontSize: 13, mt: 0.5 },
              '& .MuiStepLabel-label.Mui-active': { color: '#fff', fontWeight: 600 },
              '& .MuiStepLabel-label.Mui-completed': { color: gray[300] },
              '& .MuiStepIcon-root': { color: gray[600] },
              '& .MuiStepIcon-root.Mui-active': { color: primary[600] },
              '& .MuiStepIcon-root.Mui-completed': { color: primary[400] },
              '& .MuiStepConnector-line': { borderColor: gray[600] },
            }}
          >
            {STEPS.map((label, idx) => (
              <Step key={label} onClick={() => setSelectedTab(idx + 1)} sx={{ cursor: 'pointer' }}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ p: 3 }}>
            {selectedTab === 1 && <CandidateDetails handleBack={handleGoBack} handleNext={() => setSelectedTab(2)} />}
            {selectedTab === 2 && <RoomAndFee handleBack={() => setSelectedTab(1)} handleNext={() => setSelectedTab(3)} />}
            {selectedTab === 3 && <Documents handleBack={() => setSelectedTab(2)} handleNext={() => setSelectedTab(4)} />}
            {selectedTab === 4 && <ContactPerson handleBack={() => setSelectedTab(3)} handleNext={() => setSelectedTab(5)} />}
            {selectedTab === 5 && <PurposeOfStay handleBack={() => setSelectedTab(4)} handleNext={() => setSelectedTab(6)} />}
            {selectedTab === 6 && <Others handleBack={() => setSelectedTab(5)} handleNext={() => setSelectedTab(7)} />}
            {selectedTab === 7 && <Payments handleClose={handleGoBack} handleBack={() => setSelectedTab(6)} PageAccess={PageAccess} handleNext={handleGoBack} />}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
