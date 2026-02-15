import { FormControl, Select, MenuItem, TextField, Button, Box, Typography, Divider, IconButton } from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import { ArrowLeft, Search, MapPin, DoorOpen, BedDouble, Calendar, UserRound, Minus, Plus } from 'lucide-react';
import { DisableKeyUpDown, CustomAlert } from '../../services/HelperService';
import { useStateValue } from '../../providers/StateProvider';
import { useEffect, useState } from 'react';
import {
  getBranchGridList, getCandidateAdmissionById, getBranchCandidateDetailSearch,
  getBranchRoomsList, getAdmissionBookingAvailability, insertUpdateCandidateAdmission,
  getCotsByCotId, insertUpdateVacateDetails,
} from '../../models';
import DialogModal from '../../components/shared/DialogModal';
import DataTable, { Column } from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import FormField from '../../components/shared/FormField';
import PageHeader from '../../components/shared/PageHeader';
import moment from 'moment';
import { CustomAutoSelect } from '../../components/helpers/CustomSelect';
import { gray, primary } from '../../theme/tokens';

export default function AdmissionTransfer({ PageAccess }: any) {
  const [{ user }]: any = useStateValue();
  const [branchList, setBranchList] = useState<any>([]);
  const [roomList, setRoomList] = useState<any>([]);
  const [cotList, setCotList] = useState<any>([]);
  const [searchCandidate, setSearchCandidate] = useState('');
  const [loading, setLoading] = useState(false);
  const [available, setAvailable] = useState(false);
  const [candidateList, setCandidateList] = useState<any>([]);
  const [candidateDetails, setCandidateDetails] = useState<any>({});
  const [formData, setFormData] = useState<any>({ id: 0, isActive: true, noDayStay: '1', noDayStayType: 'Month' });
  const [cotDetails, setCotDetails] = useState<any>({});

  const changeFormData = (key: string, value: any) => {
    if (key === 'noDayStay') {
      let monthlyRent = 0, dateOfNotice = '';
      if (formData?.noDayStayType === 'Days') {
        monthlyRent = Number(cotDetails?.perDayRent || '0') * Number(value);
        dateOfNotice = moment(formData?.dateOfAdmission).add(Number(value), 'days').format('YYYY-MM-DD');
      } else {
        monthlyRent = Number(cotDetails?.rentAmount || '0') * Number(value);
        dateOfNotice = moment(formData?.dateOfAdmission).add(Number(value), 'months').format('YYYY-MM-DD');
      }
      setFormData({ ...formData, [key]: value, monthlyRent, dateOfNotice });
    } else if (key === 'noDayStayType') {
      let monthlyRent = 0, dateOfNotice = '';
      if (value === 'Days') {
        monthlyRent = Number(cotDetails?.perDayRent || '0') * Number(formData?.noDayStay);
        dateOfNotice = moment(formData?.dateOfAdmission).add(Number(formData?.noDayStay), 'days').format('YYYY-MM-DD');
      } else {
        monthlyRent = Number(cotDetails?.rentAmount || '0') * Number(formData?.noDayStay);
        dateOfNotice = moment(formData?.dateOfAdmission).add(Number(formData?.noDayStay), 'months').format('YYYY-MM-DD');
      }
      setFormData({ ...formData, [key]: value, monthlyRent, dateOfNotice });
    } else {
      setFormData({ ...formData, [key]: value });
    }
  };

  const handleCotAndFeeUpdate = (item: any) => {
    setFormData({ ...formData, cotRefId: item?.id, admissionFee: item?.advanceAmount, monthlyRent: item?.rentAmount });
  };

  const handleSearchCandidate = () => {
    if (!searchCandidate?.trim()) return;
    setLoading(true);
    getBranchCandidateDetailSearch(searchCandidate)
      .then((resp) => {
        if (resp?.data?.status === 'success') {
          if (!resp?.data?.result?.length) {
            CustomAlert('error', 'Resident not found');
          } else {
            setCandidateList([...resp?.data?.result]);
          }
        }
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  };

  const handleSelectCandidate = (id: number) => {
    if (!id) { CustomAlert('warning', 'Resident not registered'); return; }
    setCandidateList([]);
    getCandidateAdmissionById({ candidateId: id })
      .then((resp) => {
        if (resp?.data?.status === 'success') {
          const data = resp?.data?.result?.length ? resp?.data?.result[0] : { ...resp?.data?.result };
          if (!Object?.keys(data)?.length) {
            CustomAlert('warning', "Resident doesn't have any admission");
          } else {
            setCandidateDetails({ ...data });
          }
        }
      })
      .catch((err) => console.log(err));
  };

  const handleClearForm = () => {
    setLoading(false);
    setCandidateDetails({});
    setSearchCandidate('');
    setAvailable(false);
    setFormData({ id: 0, isActive: true, noDayStay: '1', noDayStayType: 'Month' });
  };

  const handleCheckAvailable = () => {
    if (!formData?.branchRefId) { CustomAlert('warning', 'Please select a branch'); return; }
    if (!formData?.roomRefId) { CustomAlert('warning', 'Please select a room'); return; }
    if (!formData?.cotRefId) { CustomAlert('warning', 'Please select a bed'); return; }
    if (!formData?.dateOfAdmission) { CustomAlert('warning', 'Please select admission date'); return; }
    if (candidateDetails?.cotRefId === formData?.cotRefId &&
      candidateDetails?.roomRefId === formData?.roomRefId &&
      candidateDetails?.branchRefId === formData?.branchRefId) {
      CustomAlert('warning', 'Cannot transfer to the same bed. Please select a different bed.');
      return;
    }
    setLoading(true);
    getAdmissionBookingAvailability({
      roomId: formData?.roomRefId, branchId: formData?.branchRefId,
      dateOfAdmission: formData?.dateOfAdmission, cotId: formData?.cotRefId,
    })
      .then((resp: any) => {
        if (resp?.data?.status === 'success') {
          if (resp?.data?.result?.status === 'Available') {
            CustomAlert('success', resp?.data?.result?.message || 'Bed is available for transfer');
            setAvailable(true);
          } else {
            CustomAlert('warning', resp?.data?.result?.message || `Booking available from ${moment(resp?.data?.result?.availableDate)?.format('DD-MMM-YYYY')}`);
            setAvailable(false);
          }
        }
      })
      .catch((err: any) => {
        CustomAlert('warning', err?.response?.data?.error || 'Error checking availability');
        setAvailable(false);
      })
      .finally(() => setLoading(false));
  };

  const checkValidation = () => {
    if (!formData?.noDayStayType) { CustomAlert('warning', 'Duration type required'); return false; }
    if (!formData?.noDayStay) { CustomAlert('warning', 'Duration count required'); return false; }
    if (!available) { CustomAlert('warning', 'Please check availability before proceeding'); return false; }
    if (!formData?.branchRefId) { CustomAlert('warning', 'Branch selection required'); return false; }
    if (!formData?.roomRefId) { CustomAlert('warning', 'Room selection required'); return false; }
    if (!formData?.cotRefId) { CustomAlert('warning', 'Bed selection required'); return false; }
    if (!formData?.dateOfAdmission) { CustomAlert('warning', 'Admission date required'); return false; }
    return true;
  };

  const handleReset = () => {
    setAvailable(false);
    setFormData({ id: 0, isActive: true, noDayStay: '1', noDayStayType: 'Month' });
  };

  const handleSubmitForm = () => {
    setLoading(true);
    if (!checkValidation()) { setLoading(false); return; }
    let totalPaid = 0;
    if (candidateDetails?.paymentStatus === 'Paid') {
      if (candidateDetails?.noDayStayType === 'Month') {
        totalPaid = Number(candidateDetails?.monthlyRent || '0') * Number(candidateDetails?.noDayStay || '0') + Number(candidateDetails?.admissionFee || '0') + Number(candidateDetails?.advancePaid || '0');
      } else {
        totalPaid = Number(candidateDetails?.monthlyRent || '0') / 30 * Number(candidateDetails?.noDayStay || '0') + Number(candidateDetails?.admissionFee || '0') + Number(candidateDetails?.advancePaid || '0');
      }
    }
    const transferBody = {
      id: candidateDetails?.id || 0,
      candidateRefId: candidateDetails?.candidateRefId || 0,
      branchRefId: formData?.branchRefId || 0,
      roomRefId: formData?.roomRefId || 0,
      cotRefId: formData?.cotRefId || 0,
      dateOfAdmission: formData?.dateOfAdmission || '',
      admittedBy: user?.firstName + ' ' + user?.lastName || '',
      dateOfNotice: formData?.dateOfNotice || '',
      admissionFee: formData?.admissionFee || '',
      advancePaid: formData?.advancePaid || '',
      monthlyRent: (formData?.monthlyRent || '') || '',
      noDayStayType: (formData?.noDayStayType + '') || 'Month',
      noDayStay: (formData?.noDayStay + '') || '1',
      admissionStatus: 'Inprogress',
      dues: candidateDetails?.dues || '',
      isActive: true,
    };
    const vacateBody = {
      id: formData?.id || 0,
      candidateRefId: transferBody?.candidateRefId,
      branchRefId: transferBody?.branchRefId,
      admissionRefId: transferBody?.id,
      vacateType: 'Transfer Vacate',
      vacateStatus: 'Approved',
      feedbackBehavior: '', feedbackBrief: '', damageRemarks: '',
      payableAdvancePaid: candidateDetails?.paymentStatus === 'Paid' ? candidateDetails?.advancePaid : '0',
      payableAdmissionFee: candidateDetails?.paymentStatus === 'Paid' ? candidateDetails?.admissionFee : '0',
      payableMonthlyRent: candidateDetails?.paymentStatus === 'Paid' ? candidateDetails?.monthlyRent : '0',
      payablePenalty: '0', payableDuePending: '0',
      netAmountPayable: candidateDetails?.paymentStatus === 'Paid' ? (totalPaid + '') : '0',
      isActive: true,
    };
    insertUpdateVacateDetails(vacateBody)
      .then((resp) => {
        if (resp?.data?.status === 'success') {
          insertUpdateCandidateAdmission(transferBody)
            .then((resp) => {
              if (resp?.data?.status === 'success') {
                CustomAlert('success', 'Resident transfer successful');
                handleClearForm();
              }
            })
            .catch((err) => console.log(err))
            .finally(() => setLoading(false));
        }
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    if (formData?.cotRefId) {
      getCotsByCotId(formData?.cotRefId)
        .then((resp) => {
          if (resp?.data?.status === 'success') {
            const cd = resp?.data?.result;
            setCotDetails(cd);
            setFormData({
              ...formData, roomNumber: cd?.roomNumber, cotNumber: cd?.cotNumber, cotsType: cd?.cotsType,
              roomTypeName: cd?.roomTypeName, admissionFee: cd?.admissionFee, advancePaid: cd?.advanceAmount,
              oneDayStay: cd?.oneDayStay, monthlyRent: cd?.rentAmount || '0', noDayStay: cd?.noDayStay || '1',
              noDayStayType: cd?.noDayStayType || 'Month',
              dateOfNotice: cd?.dateOfNotice ? cd?.dateOfNotice : moment(cd?.dateOfAdmission).add(1, 'months').format('YYYY-MM-DD'),
            });
          } else {
            setFormData({ id: 0, isActive: true, noDayStay: '1', noDayStayType: 'Month' });
          }
        })
        .catch(() => setFormData({ id: 0, isActive: true, noDayStay: '1', noDayStayType: 'Month' }));
    }
  }, [formData?.cotRefId]);

  useEffect(() => {
    if (formData?.branchRefId) {
      getBranchRoomsList(formData?.branchRefId, 'admin')
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

  useEffect(() => {
    getBranchGridList()
      .then((resp) => { if (resp?.data?.status === 'success') setBranchList(resp?.data?.result?.results); })
      .catch(console.log);
  }, []);

  // Candidate search dialog columns
  const candidateColumns: Column<any>[] = [
    {
      id: 'action', label: '', width: 100, render: (r) => (
        r?.CandidateDetails?.blackListed === 'yes'
          ? <StatusBadge status="Blocked" />
          : <Button size="small" variant="outlined" onClick={() => handleSelectCandidate(r?.candidateRefId)}>Select</Button>
      ),
    },
    { id: 'name', label: 'Name', render: (r) => r?.CandidateDetails?.name || '-' },
    { id: 'email', label: 'Email', render: (r) => r?.CandidateDetails?.email || '-' },
    { id: 'branch', label: 'Branch', render: (r) => r?.BranchDetails?.branchName || '-' },
    { id: 'admission', label: 'Admission Date', render: (r) => r?.dateOfAdmission ? moment(r.dateOfAdmission).format('DD-MMM-YYYY') : '-' },
  ];

  const InfoField = ({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: gray[500], mb: 0.5 }}>
        {icon} <Typography variant="caption">{label}</Typography>
      </Box>
      <Typography variant="body2" sx={{ ml: icon ? 3 : 0 }}>{value || '-'}</Typography>
    </Box>
  );

  return (
    <>
      <PageHeader title="Room Transfer" description="Transfer residents between rooms and branches" />

      {/* Search Section */}
      {!candidateDetails?.id && (
        <Box sx={{ bgcolor: gray[50], border: `1px solid ${gray[200]}`, borderRadius: '12px', p: 3, mb: 3 }}>
          <form onSubmit={(e) => { e.preventDefault(); handleSearchCandidate(); }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                fullWidth placeholder="Search resident by name, mobile or branch..."
                value={searchCandidate} onChange={(e) => setSearchCandidate(e.target.value)}
                size="small" sx={{ maxWidth: 480 }}
              />
              <Button variant="contained" disabled={loading} type="submit" startIcon={<Search size={16} />} sx={{ textTransform: 'none' }}>
                Search
              </Button>
            </Box>
          </form>
        </Box>
      )}

      {/* Candidate details + transfer */}
      {candidateDetails?.id && (
        <Box sx={{ mb: 3 }}>
          {/* Back button */}
          <Box onClick={handleClearForm} sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', mb: 2 }}>
            <ArrowLeft size={20} color={gray[600]} />
            <Typography sx={{ fontWeight: 600, color: gray[700] }}>Back</Typography>
          </Box>

          {/* Candidate info */}
          <Box sx={{ bgcolor: gray[50], border: `1px solid ${gray[200]}`, borderRadius: '12px', p: 3, mb: 3 }}>
            <Grid2 container spacing={3}>
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <FormField label="Resident ID"><Typography variant="body2">{candidateDetails?.candidateId}</Typography></FormField>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <FormField label="Name"><Typography variant="body2">{candidateDetails?.candidateName}</Typography></FormField>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <FormField label="Mobile"><Typography variant="body2">{candidateDetails?.candidateMobileNumber}</Typography></FormField>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <FormField label="Email"><Typography variant="body2">{candidateDetails?.candidateEmail}</Typography></FormField>
              </Grid2>
            </Grid2>
          </Box>

          {/* Transfer From */}
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Transfer From</Typography>
          <Box sx={{ bgcolor: gray[50], border: `1px solid ${gray[200]}`, borderRadius: '12px', p: 3, mb: 3 }}>
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 4, md: 2 }}><InfoField label="Branch" value={candidateDetails?.branchName} icon={<MapPin size={14} />} /></Grid2>
              <Grid2 size={{ xs: 12, sm: 4, md: 2 }}><InfoField label="Room" value={candidateDetails?.roomNumber} icon={<DoorOpen size={14} />} /></Grid2>
              <Grid2 size={{ xs: 12, sm: 4, md: 2 }}><InfoField label="Room Type" value={candidateDetails?.roomTypeName} icon={<DoorOpen size={14} />} /></Grid2>
              <Grid2 size={{ xs: 12, sm: 4, md: 2 }}><InfoField label="Bed" value={candidateDetails?.cotNumber} icon={<BedDouble size={14} />} /></Grid2>
              <Grid2 size={{ xs: 12, sm: 4, md: 2 }}><InfoField label="Admission Date" value={moment(candidateDetails?.dateOfAdmission).format('DD-MM-YYYY')} icon={<Calendar size={14} />} /></Grid2>
              <Grid2 size={{ xs: 12, sm: 4, md: 2 }}><InfoField label="Admitted By" value={candidateDetails?.admittedBy} icon={<UserRound size={14} />} /></Grid2>
            </Grid2>
          </Box>

          {/* Transfer To */}
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Transfer To</Typography>
          <Box sx={{ bgcolor: '#fff', border: `1px solid ${gray[200]}`, borderRadius: '12px', p: 3, mb: 3 }}>
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 4, md: 2 }}>
                <FormField label="Branch">
                  <FormControl fullWidth size="small">
                    <Select value={formData?.branchRefId || ''} onChange={(e) => changeFormData('branchRefId', e.target.value)} disabled={available} displayEmpty>
                      <MenuItem value="" disabled>Select</MenuItem>
                      {branchList.map((m: any) => <MenuItem key={m.id} value={m.id}>{m.branchName}</MenuItem>)}
                    </Select>
                  </FormControl>
                </FormField>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 4, md: 2 }}>
                <FormField label="Room">
                  <FormControl fullWidth size="small">
                    <Select value={formData?.roomRefId || ''} disabled={available} displayEmpty>
                      <MenuItem value="" disabled>Select</MenuItem>
                      {roomList.map((m: any) => (
                        <MenuItem key={m.id} value={m.id} onClick={() => {
                          setCotList([...m.Cots]);
                          setFormData({ ...formData, roomRefId: m.id, roomTypeName: m.roomTypeName });
                        }}>{m.roomNumber}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </FormField>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 4, md: 2 }}>
                <FormField label="Room Type">
                  <Typography variant="body2">{formData?.roomTypeName || '-'}</Typography>
                </FormField>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 4, md: 2 }}>
                <FormField label="Bed">
                  <FormControl fullWidth size="small">
                    <Select value={formData?.cotRefId || ''} disabled={available} displayEmpty>
                      <MenuItem value="" disabled>Select</MenuItem>
                      {cotList.map((m: any) => (
                        <MenuItem key={m.id} value={m.id} onClick={() => handleCotAndFeeUpdate(m)}>
                          {m.cotNumber} - {m.CotType?.type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </FormField>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 4, md: 2 }}>
                <FormField label="Admission Date">
                  <TextField fullWidth size="small" type="date" onKeyDown={DisableKeyUpDown}
                    value={formData?.dateOfAdmission || ''} onChange={(e) => changeFormData('dateOfAdmission', e.target.value)}
                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
                    slotProps={{ input: { readOnly: available } }}
                  />
                </FormField>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 4, md: 2 }}>
                <FormField label="Transferred By">
                  <Typography variant="body2">{user?.firstName + ' ' + user?.lastName}</Typography>
                </FormField>
              </Grid2>
            </Grid2>
          </Box>

          {/* Stay Duration & Fee details (shown when available) */}
          {available && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Stay Duration</Typography>
              <Grid2 container spacing={3} sx={{ mb: 3 }}>
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormField label="Duration Type" required>
                    <CustomAutoSelect value={formData?.noDayStayType}
                      onChange={(value: any) => changeFormData('noDayStayType', value || '')}
                      placeholder="Select type"
                      menuItem={(formData?.oneDayStay ? ['Days', 'Month'] : ['Month']).map((item: any) => ({ title: item, value: item }))} />
                  </FormField>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormField label="Duration Count" required>
                    <TextField fullWidth size="small"
                      value={formData?.noDayStay}
                      inputProps={{ style: { textAlign: 'center' } }}
                      InputProps={{
                        readOnly: true,
                        startAdornment: <IconButton size="small" disabled={formData?.noDayStay <= 1}
                          onClick={() => formData?.noDayStay > 1 && changeFormData('noDayStay', Number(formData?.noDayStay) - 1)}>
                          <Minus size={16} />
                        </IconButton>,
                        endAdornment: <IconButton size="small"
                          onClick={() => changeFormData('noDayStay', Number(formData?.noDayStay) + 1)}>
                          <Plus size={16} />
                        </IconButton>,
                      }} />
                  </FormField>
                </Grid2>
              </Grid2>

              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Room Details</Typography>
              <Grid2 container spacing={3} sx={{ mb: 3 }}>
                <Grid2 size={{ xs: 6, md: 3 }}><FormField label="Room Number"><Typography variant="body2">{formData?.roomNumber}</Typography></FormField></Grid2>
                <Grid2 size={{ xs: 6, md: 3 }}><FormField label="Bed No"><Typography variant="body2">{formData?.cotNumber}</Typography></FormField></Grid2>
                <Grid2 size={{ xs: 6, md: 3 }}><FormField label="Bed Type"><Typography variant="body2">{formData?.cotsType}</Typography></FormField></Grid2>
                <Grid2 size={{ xs: 6, md: 3 }}><FormField label="Room Type"><Typography variant="body2">{formData?.roomTypeName}</Typography></FormField></Grid2>
                <Grid2 size={{ xs: 6, md: 3 }}><FormField label="Admission Date"><Typography variant="body2">{moment(formData?.dateOfAdmission).format('DD-MMM-YYYY')}</Typography></FormField></Grid2>
                <Grid2 size={{ xs: 6, md: 3 }}><FormField label="Notice Date"><Typography variant="body2">{formData?.dateOfNotice ? moment(formData?.dateOfNotice).format('DD-MMM-YYYY') : ''}</Typography></FormField></Grid2>
              </Grid2>

              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Fee Details</Typography>
              <Grid2 container spacing={3} sx={{ mb: 3 }}>
                <Grid2 size={{ xs: 6, md: 3 }}><FormField label="Admission Fee"><Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>&#8377; {formData?.admissionFee}</Typography></FormField></Grid2>
                <Grid2 size={{ xs: 6, md: 3 }}><FormField label="Advance Pay"><Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>&#8377; {formData?.advancePaid}</Typography></FormField></Grid2>
                <Grid2 size={{ xs: 6, md: 3 }}><FormField label="Monthly Rent"><Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>&#8377; {formData?.monthlyRent}</Typography></FormField></Grid2>
              </Grid2>
            </>
          )}

          {/* Actions */}
          {PageAccess === 'Write' && (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
              <Button variant="outlined" disabled={loading} onClick={handleReset} sx={{ textTransform: 'none' }}>Reset</Button>
              {available ? (
                <Button variant="contained" disabled={loading} onClick={handleSubmitForm} sx={{ textTransform: 'none' }}>Update</Button>
              ) : (
                <Button variant="contained" disabled={loading} onClick={handleCheckAvailable} sx={{ textTransform: 'none' }}>Check Availability</Button>
              )}
            </Box>
          )}
        </Box>
      )}

      {/* Candidate Selection Dialog */}
      <DialogModal
        open={candidateList?.length > 0}
        onClose={() => setCandidateList([])}
        title="Select Resident"
        maxWidth="md"
      >
        <DataTable columns={candidateColumns} data={candidateList} emptyTitle="No residents found" />
      </DialogModal>
    </>
  );
}
