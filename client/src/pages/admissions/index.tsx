import { useEffect, useState, useMemo } from 'react';
import {
  Button, MenuItem, FormControl, Select, TextField, Tooltip, IconButton,
  Stepper, Step, StepLabel, Box, Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Plus, ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import moment from 'moment';
import Swal from 'sweetalert2';
import {
  deleteCandidateAdmission, getAdmissionGridList, getBranchGridList,
  getBranchRoomsList, insertUpdateCandidateAdmission,
} from '../../models';
import { CustomAlert, DisableKeyUpDown, getExportEXCEL } from '../../services/HelperService';
import { useStateValue } from '../../providers/StateProvider';
import { gray, primary } from '../../theme';
import { PageHeader, FilterBar, SearchInput, ExportButton, StatusBadge } from '../../components/shared';
import DataTable, { Column } from '../../components/shared/DataTable';
import DateRangeSelector from '../../components/helpers/DateRangeSelector';
import CustomSelect from '../../components/helpers/CustomSelect';
import FormField from '../../components/shared/FormField';
import CandidateDetails from './components/candidateDetails';
import RoomAndFee from './components/roomAndFee';
import Documents from './components/documents';
import ContactPerson from './components/contactPerson';
import PurposeOfStay from './components/purposeOfStay';
import Others from './components/others';
import Payments from './components/payments';

const STEP_LABELS = [
  'Resident Details',
  'Room & Pricing',
  'Documents',
  'Emergency Contact',
  'Purpose of Stay',
  'Additional Details',
  'Payment Setup',
];

export default function Index({ PageAccess }: any) {
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
    branchId: '',
    fromDate: moment().clone().startOf('month').format('YYYY-MM-DD'),
    toDate: moment().format('YYYY-MM-DD'),
  });
  const [editForm, setEditForm] = useState(false);
  const [selectedTab, setSelectedTab] = useState(1);
  const [formData, setFormData] = useState<any>({ id: 0, edit: false, isActive: true, admissionType: 'Candidate' });
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const changeFilterData = (key: string, value: any) => {
    setFilterData({ ...filterData, [key]: value });
  };
  const changeFormData = (key: string, value: any) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleUpdateItem = (item: any) => {
    dispatch({
      type: 'SET_ADMISSION_DETAILS',
      data: { admissionDetails: { ...item }, edit: item?.admissionStatus === 'Inprogress' ? false : true },
    });
    setFormData({ ...item, edit: true });
    setEditForm(true);
  };

  const handleAddNew = () => {
    handleClearForm();
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
    setFormData({ id: 0, edit: false, isActive: true, admissionType: 'Candidate' });
  };

  const handleCotAndFeeUpdate = (item: any) => {
    setFormData({
      ...formData,
      cotRefId: item?.id,
      admissionFee: item?.advanceAmount,
      monthlyRent: admissionDetails?.admissionDetails?.noDayStayType === 'Month' ? item?.rentAmount : item?.perDayRent,
    });
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
      admittedBy: formData?.id ? formData?.admittedBy : `${user?.firstName} ${user?.lastName}`,
      admissionType: formData?.admissionType || 'Candidate',
      admissionStatus: 'Inprogress',
      isActive: formData?.isActive || false,
    };
    insertUpdateCandidateAdmission(body)
      .then((resp) => {
        if (resp?.data?.status === 'success') {
          CustomAlert('success', 'Admission details saved');
          const insertedId = resp?.data?.result?.insertedId;
          const candidateRefId = resp?.data?.result?.candidateRefId ?? body?.candidateRefId;
          if (body?.id === 0) body.id = insertedId;
          if (candidateRefId) body.candidateRefId = candidateRefId;
          setFormData({ ...formData, id: insertedId, candidateRefId, admittedBy: body?.admittedBy });
          dispatch({ type: 'SET_ADMISSION_DETAILS', data: { ...admissionDetails, admissionDetails: { ...body, candidateRefId } } });
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
    getAdmissionGridList(page, rowsPerPage, filterData?.branchId?.toString(), filterData?.fromDate, filterData?.toDate)
      .then((resp) => {
        if (resp?.data?.status === 'success') {
          setTableItems(resp?.data?.result?.results);
          setTableTotalCount(resp?.data?.result?.totalItems);
        }
      })
      .catch(console.log)
      .finally(() => setTableLoading(false));
  };

  const handleDeleteItem = (item: any) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this admission!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#388024',
      cancelButtonColor: '#bf1029',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        deleteCandidateAdmission(item?.id)
          .then((resp) => { if (resp?.data?.status === 'success') CustomAlert('success', 'Admission details removed'); })
          .catch((err) => { console.log(err); CustomAlert('warning', err?.response?.data?.error); })
          .finally(() => getGridList());
      }
    });
  };

  const exportEXCEL = () => {
    const header = ['#', 'Status', 'Branch', 'Room', 'Room Type', 'Bed', 'Bed Type', 'Resident', 'Mobile', 'Admission Date', 'Updated'];
    const body = tableItems?.map((item: any, index: number) => [
      index + 1, item?.admissionStatus || 'Inprogress', item?.branchName, item?.roomNumber,
      item?.roomTypeName, item?.cotNumber, item?.cotTypeName, item?.candidateName,
      item?.candidateMobileNumber, item?.dateOfAdmission ? moment(item?.dateOfAdmission).format('DD-MMM-YYYY') : '',
      item?.updatedAt ? moment(item?.updatedAt).format('DD-MMM-YYYY') : '',
    ]);
    getExportEXCEL({ header, body, fileName: 'Admissions' });
  };

  // Filter data client-side by search
  const filteredItems = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return tableItems || [];
    return (tableItems || []).filter((item: any) =>
      Object.values(item).some((v: any) => v?.toString().toLowerCase().includes(q))
    );
  }, [tableItems, search]);

  const columns: Column<any>[] = [
    { id: 'sno', label: '#', width: 50, render: (_, i) => i + 1 + (page - 1) * rowsPerPage },
    {
      id: 'actions', label: 'Actions', width: 80, render: (row) => PageAccess === 'Write' ? (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => handleUpdateItem(row)}><Edit2 size={16} /></IconButton>
          </Tooltip>
          {row?.admissionStatus === 'Rejected' && (
            <Tooltip title="Delete">
              <IconButton size="small" color="error" onClick={() => handleDeleteItem(row)}><Trash2 size={16} /></IconButton>
            </Tooltip>
          )}
        </Box>
      ) : null,
    },
    { id: 'status', label: 'Status', render: (row) => <StatusBadge status={row?.admissionStatus || 'Inprogress'} /> },
    { id: 'branch', label: 'Branch', render: (row) => row?.branchName || '-' },
    { id: 'room', label: 'Room', render: (row) => row?.roomNumber || '-' },
    { id: 'roomType', label: 'Room Type', render: (row) => row?.roomTypeName || '-' },
    { id: 'bed', label: 'Bed', render: (row) => row?.cotNumber || '-' },
    { id: 'bedType', label: 'Bed Type', render: (row) => row?.cotTypeName || '-' },
    { id: 'name', label: 'Resident', render: (row) => row?.candidateName || '-' },
    { id: 'mobile', label: 'Mobile', render: (row) => row?.candidateMobileNumber || '-' },
    { id: 'admDate', label: 'Admission Date', render: (row) => row?.dateOfAdmission ? moment(row.dateOfAdmission).format('DD-MMM-YYYY') : '-' },
    { id: 'updated', label: 'Updated', render: (row) => row?.updatedAt ? moment(row.updatedAt).format('DD-MMM-YYYY') : '-' },
  ];

  useEffect(() => {
    if (formData?.branchRefId) {
      getBranchRoomsList(formData.branchRefId)
        .then((resp) => {
          if (resp?.data?.status === 'success') {
            setRoomList(resp?.data?.result);
            if (formData?.cotRefId) {
              const tempArr = resp?.data?.result?.find((f: any) => f?.id === formData?.roomRefId)?.Cots;
              setCotList([...(tempArr || [])]);
            }
          }
        })
        .catch(console.log);
    }
  }, [formData?.branchRefId]);

  useEffect(() => { getGridList(); }, [page, rowsPerPage, filterData]);
  useEffect(() => { getOtherList(); }, []);

  // ─── LIST VIEW ───
  if (!editForm) {
    return (
      <>
        <PageHeader title="Admissions" description="Manage resident registrations and approvals">
          <ExportButton onExport={exportEXCEL} />
          {PageAccess === 'Write' && (
            <Button variant="contained" startIcon={<Plus size={18} />} onClick={handleAddNew} sx={{ textTransform: 'none' }}>
              Register Resident
            </Button>
          )}
        </PageHeader>

        <FilterBar>
          <CustomSelect
            padding="0px 10px"
            value={filterData.branchId}
            onChange={(e: any) => changeFilterData('branchId', e.target.value)}
            placeholder="Branch"
            menuItem={[
              <MenuItem key={-1} value="">All</MenuItem>,
              ...branchList.map((item: any) => <MenuItem key={item.id} value={item.id}>{item.branchName}</MenuItem>),
            ]}
          />
          <DateRangeSelector handleChangeDate={(from: string, to: string) => setFilterData({ ...filterData, fromDate: from, toDate: to })} />
          <SearchInput value={search} onChange={setSearch} placeholder="Search admissions..." />
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
          emptyTitle="No admissions found"
          emptyDescription="No admission records match your criteria"
        />
      </>
    );
  }

  // ─── EDIT / CREATE FORM ───
  return (
    <>
      {/* Back button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, cursor: 'pointer' }} onClick={handleGoBack}>
        <ArrowLeft size={20} color={gray[600]} />
        <Typography sx={{ fontWeight: 600, color: gray[700] }}>Back</Typography>
      </Box>

      {/* Header fields */}
      <Box sx={{ backgroundColor: '#fff', border: `1px solid ${gray[200]}`, borderRadius: '12px', p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormField label="Branch">
              {formData?.edit ? (
                <Typography sx={{ fontSize: '14px', color: gray[900] }}>{formData?.branchName}</Typography>
              ) : (
                <FormControl fullWidth size="small">
                  <Select value={formData?.branchRefId || ''} onChange={(e) => changeFormData('branchRefId', e.target.value)} displayEmpty>
                    <MenuItem value="" disabled>Select branch</MenuItem>
                    {branchList.map((m: any) => <MenuItem key={m.id} value={m.id}>{m.branchName}</MenuItem>)}
                  </Select>
                </FormControl>
              )}
            </FormField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormField label="Room">
              {formData?.edit ? (
                <Typography sx={{ fontSize: '14px', color: gray[900] }}>{formData?.roomNumber}</Typography>
              ) : (
                <FormControl fullWidth size="small">
                  <Select value={formData?.roomRefId || ''} displayEmpty>
                    <MenuItem value="" disabled>Select room</MenuItem>
                    {roomList.map((m: any) => (
                      <MenuItem key={m.id} value={m.id} onClick={() => {
                        setCotList([...m.Cots]);
                        setFormData({ ...formData, roomRefId: m.id, roomTypeName: m.roomTypeName });
                      }}>{m.roomNumber}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </FormField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormField label="Room Type">
              <Typography sx={{ fontSize: '14px', color: gray[900] }}>{formData?.roomTypeName || '-'}</Typography>
            </FormField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormField label="Bed">
              {formData?.edit ? (
                <Typography sx={{ fontSize: '14px', color: gray[900] }}>{formData?.cotNumber}</Typography>
              ) : (
                <FormControl fullWidth size="small">
                  <Select value={formData?.cotRefId || ''} displayEmpty>
                    <MenuItem value="" disabled>Select bed</MenuItem>
                    {cotList.map((m: any) => (
                      <MenuItem key={m.id} value={m.id} onClick={() => handleCotAndFeeUpdate(m)}>
                        {m.cotNumber} - {m?.CotType?.type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </FormField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormField label="Admission Date">
              <TextField
                fullWidth size="small" type="date" onKeyDown={DisableKeyUpDown}
                value={formData?.dateOfAdmission || ''}
                onChange={(e) => changeFormData('dateOfAdmission', e.target.value)}
                inputProps={{ min: new Date().toISOString().split('T')[0] }}
                slotProps={{ input: { readOnly: formData?.edit } }}
              />
            </FormField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }} sx={{ display: 'flex', alignItems: 'flex-end' }}>
            {formData?.id ? (
              <FormField label="Admitted By">
                <Typography sx={{ fontSize: '14px', color: gray[900] }}>{formData?.admittedBy || formData?.candidateName}</Typography>
              </FormField>
            ) : (
              <Button variant="contained" disabled={loading} onClick={handleSubmitForm} sx={{ textTransform: 'none', mb: 2 }}>
                Save
              </Button>
            )}
          </Grid>
        </Grid>

        {/* Stepper + Tab Content */}
        {formData?.id ? (
          <Box sx={{ mt: 3 }}>
            <Stepper
              activeStep={selectedTab - 1}
              alternativeLabel
              sx={{
                '& .MuiStepLabel-label': { fontSize: '12px' },
                '& .MuiStepIcon-root.Mui-active': { color: primary[600] },
                '& .MuiStepIcon-root.Mui-completed': { color: primary[600] },
              }}
            >
              {STEP_LABELS.map((label, idx) => (
                <Step key={label} onClick={() => setSelectedTab(idx + 1)} sx={{ cursor: 'pointer' }}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box sx={{ mt: 3 }}>
              {selectedTab === 1 && <CandidateDetails handleBack={handleGoBack} handleNext={() => setSelectedTab(2)} />}
              {selectedTab === 2 && <RoomAndFee handleBack={() => setSelectedTab(1)} handleNext={() => setSelectedTab(3)} />}
              {selectedTab === 3 && <Documents handleBack={() => setSelectedTab(2)} handleNext={() => setSelectedTab(4)} />}
              {selectedTab === 4 && <ContactPerson handleBack={() => setSelectedTab(3)} handleNext={() => setSelectedTab(5)} />}
              {selectedTab === 5 && <PurposeOfStay handleBack={() => setSelectedTab(4)} handleNext={() => setSelectedTab(6)} />}
              {selectedTab === 6 && <Others handleBack={() => setSelectedTab(5)} handleNext={() => setSelectedTab(7)} />}
              {selectedTab === 7 && <Payments handleClose={handleGoBack} PageAccess={PageAccess} handleBack={() => setSelectedTab(6)} handleNext={handleGoBack} />}
            </Box>
          </Box>
        ) : null}
      </Box>
    </>
  );
}
