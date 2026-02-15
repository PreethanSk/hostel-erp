import { useEffect, useState } from "react";
import { Button, TextField, MenuItem, Checkbox, FormControlLabel, Box, Typography, Divider } from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import { CustomAlert, DisableKeyUpDown, getExportEXCEL } from '../../services/HelperService';
import Swal from "sweetalert2";
import moment from 'moment';
import { getBranchGridList, getCandidateAdmissionById, getCandidateDetail, getCandidateDetailSearch, getCandidateFeedbackById, getVacateListGridList, insertUpdateCandidateAnyDetail, insertUpdateCandidateFeedback, insertUpdateVacateDetails, deleteVacateDetails, getVacateByCandidateId } from '../../models';
import { useStateValue } from "../../providers/StateProvider";
import DateRangeSelector from "../../components/helpers/DateRangeSelector";
import { ArrowLeft, Plus, Smile, Meh, Frown, ThumbsUp } from 'lucide-react';
import PageHeader from "../../components/shared/PageHeader";
import FilterBar from "../../components/shared/FilterBar";
import DataTable, { Column } from "../../components/shared/DataTable";
import SearchInput from "../../components/shared/SearchInput";
import ExportButton from "../../components/shared/ExportButton";
import StatusBadge from "../../components/shared/StatusBadge";
import DialogModal from "../../components/shared/DialogModal";
import FormField from "../../components/shared/FormField";
import { gray } from "../../theme/tokens";

export default function Index({ PageAccess }: any) {
  const [{ user }]: any = useStateValue()
  const [_branchList, _setBranchList] = useState<any>([]);
  const [_tableItems, _setTableItems] = useState<any>([]);
  const [_tableTotalCount, _setTableTotalCount] = useState(0);
  const [_tableLoading, _setTableLoading] = useState(true);
  const [_loading, _setLoading] = useState(false);
  const [_candidateBehavior, _setCandidateBehavior] = useState('');
  const [_feedbackDetails, _setFeedbackDetails] = useState({
    id: 0, candidateRefId: 0, branchRefId: 0, admissionRefId: 0,
    rateStay: "", rateFoodService: "", rateCleanliness: "",
    rateSecuritySafety: "", rateSupportStaff: "",
    managerCandidateBehavior: "", managerComments: "", isActive: true
  });

  const [_filterData, _setFilterData] = useState({ branchId: '', status: '', fromDate: moment().clone().startOf('month').format('YYYY-MM-DD'), toDate: moment().format('YYYY-MM-DD') });
  const [_searchCandidate, _setSearchCandidate] = useState('');
  const [_search, _setSearch] = useState('');
  const [_view, _setView] = useState(false);
  const [_editForm, _setEditForm] = useState(false);
  const [_provideFromCandidate, _setProvideFromCandidate] = useState(false);
  const [_provideAboutCandidate, _setProvideAboutCandidate] = useState(false);
  const [_formData, _setFormData] = useState<any>({
    id: 0, isActive: true, admissionDetails: {}, candidateDetails: {}, isBlackListed: false,
    dateOfNoticeGiven: "", proposedVacatingDate: "", actualVacatingDate: ""
  });
  const [_candidateList, _setCandidateList] = useState<any>([]);
  const [_candidateDetails, _setCandidateDetails] = useState<any>({ blackListed: "no", blackListedReason: "" });

  const [_page, _setPage] = useState(1);
  const [_rowsPerPage, _setRowsPerPage] = useState(10);
  const payableList = ["payableAdvancePaid", "payableAdmissionFee", "payableMonthlyRent", "payablePenalty", "payableDuePending"];

  const changeFilterData = (key: string, value: any) => {
    _setFilterData({ ..._filterData, [key]: value });
  }

  const changeFeedbackData = (key: string, value: any) => {
    _setFeedbackDetails({ ..._feedbackDetails, [key]: value });
  }

  const changeFormData = (key: string, value: any) => {
    if (payableList?.includes(key)) {
      const newNetPayable = payableList?.reduce((sum: any, item: string) => {
        if (item === key) return Number(sum || '0') + Number(value || '0');
        else return Number(sum || '0') + Number(_formData[item] || '0');
      }, 0);
      _setFormData({ ..._formData, [key]: value, netAmountPayable: newNetPayable });
    } else {
      _setFormData({ ..._formData, [key]: value });
    }
  }

  const getCandidateData = (id: number) => {
    getCandidateDetail(id)
      .then((resp) => {
        if (resp?.data?.status === "success") _setCandidateDetails({ ...resp?.data?.result });
      })
      .catch(console.log)
  }

  const handleEditVacate = (item: any) => {
    _setEditForm(true);
    _setView(true);
    getCandidateData(item?.candidateRefId);
    getCandidateAdmissionById({ admissionId: item?.admissionRefId })
      .then((resp) => {
        if (resp?.data?.status === "success") {
          const data = resp?.data?.result?.length ? resp?.data?.result[0] : { ...resp?.data?.result };
          _setFormData({ ..._formData, ...item, admissionDetails: data });
        }
      })
      .catch(console.log)
  }

  const getCandidateFeedbackData = (item: any) => {
    getCandidateFeedbackById({ candidateId: item?.candidateRefId, admissionId: item?.id, branchId: item?.branchRefId })
      .then((resp) => {
        if (resp?.data?.status === "success") {
          const data = resp?.data?.result;
          if (data?.length > 0) {
            _setFeedbackDetails({ ...data[0] });
            _setProvideFromCandidate(true);
            if (data[0]?.managerCandidateBehavior) _setProvideAboutCandidate(true);
          }
        }
      })
      .catch(console.log)
  }

  const handleSelectCandidate = (item: any) => {
    getVacateByCandidateId(item?.id)
      .then((resp) => {
        if (resp?.data?.status === "success" && resp?.data?.result) {
          const status = resp?.data?.result?.vacateStatus || 'Pending';
          CustomAlert("warning", `${item?.name || 'Resident'} is already ${status.toLowerCase()}`);
          return;
        }
        proceedWithAdmissionCheck(item);
      })
      .catch(() => proceedWithAdmissionCheck(item));
  }

  const proceedWithAdmissionCheck = (item: any) => {
    getCandidateAdmissionById({ candidateId: item?.id })
      .then((resp) => {
        if (resp?.data?.status === "success") {
          const data = resp?.data?.result?.length ? resp?.data?.result[0] : { ...resp?.data?.result };
          if (!Object?.keys(data).length) {
            CustomAlert("warning", "Resident doesn't have any admission");
          } else {
            _setCandidateList([]);
            _setFormData({
              ..._formData, candidateDetails: item, admissionDetails: data,
              dateOfNoticeGiven: data?.dateOfNotice?.slice(0, 10)
            });
            getCandidateFeedbackData(data);
          }
        }
      })
      .catch(console.log)
  }

  const handleSearchCandidate = () => {
    if (!_searchCandidate?.trim()) return;
    _setLoading(true);
    getCandidateDetailSearch(_searchCandidate)
      .then((resp) => {
        if (resp?.data?.status === "success") {
          if (!resp?.data?.result?.length) CustomAlert("error", "Resident not found");
          else _setCandidateList([...resp?.data?.result]);
        }
      })
      .catch(console.log)
      .finally(() => _setLoading(false))
  }

  const handleAddNew = () => {
    handleClearForm();
    _setEditForm(true);
  }

  const handleClearForm = () => {
    getGridList();
    _setLoading(false);
    _setEditForm(false);
    _setView(false);
    _setCandidateDetails({ blackListed: "no", blackListedReason: "" });
    _setSearchCandidate('');
    _setFormData({
      id: 0, isActive: true, admissionDetails: {}, candidateDetails: {},
      dateOfNoticeGiven: "", proposedVacatingDate: "", actualVacatingDate: ""
    });
  }

  const getPrintTableHeadBody = () => {
    const header = ["S. No", "Status", "Branch Name", "Resident Name", "Room No", "Bed No", "Mobile Number", "Date of Admission", "Date of Notice", "Date of Notice Given", "Proposed Vacating Date", "Actual Vacating Date"];
    const body = _tableItems?.map((item: any, index: number) => [
      index + 1,
      item?.vacateStatus === "Approved" ? "Approved" : item?.vacateStatus === "Reject" ? "Reject" : "Pending",
      item?.branchName, item?.candidateName, item?.roomNumber, item?.cotNumber,
      item?.candidateMobileNumber,
      item?.dateOfAdmission ? moment(item?.dateOfAdmission)?.format('DD-MMM-YYYY') : '',
      item?.dateOfNotice ? moment(item?.dateOfNotice)?.format('DD-MMM-YYYY') : '',
      item?.dateOfNoticeGiven ? moment(item?.dateOfNoticeGiven)?.format('DD-MMM-YYYY') : '',
      item?.proposedVacatingDate ? moment(item?.proposedVacatingDate)?.format('DD-MMM-YYYY') : '',
      item?.actualVacatingDate ? moment(item?.actualVacatingDate)?.format('DD-MMM-YYYY') : ''
    ]);
    return { header, body }
  }

  const exportEXCEL = () => {
    const { header, body } = getPrintTableHeadBody();
    getExportEXCEL({ header, body, fileName: "Checkout" });
  }

  const checkValidation = () => {
    if (!_formData?.dateOfNoticeGiven) { CustomAlert('warning', "Date of notice given required"); return false; }
    if (!_formData?.proposedVacatingDate) { CustomAlert('warning', "Proposed vacating date required"); return false; }
    if (!_formData?.actualVacatingDate) { CustomAlert('warning', "Actual vacating date required"); return false; }
    return true;
  }

  const handleSubmitAboutCandidate = () => {
    if (!_feedbackDetails?.managerCandidateBehavior) { CustomAlert('warning', "Feedback behavior required"); return; }
    if (!_feedbackDetails?.managerComments) { CustomAlert('warning', "Feedback brief required"); return; }
    _setCandidateBehavior('');
    if (!_feedbackDetails?.id) {
      _setProvideAboutCandidate(true);
    } else {
      _setLoading(true);
      const body = {
        id: _feedbackDetails?.id || 0,
        candidateRefId: _formData?.admissionDetails?.candidateRefId,
        branchRefId: _formData?.admissionDetails?.branchRefId,
        admissionRefId: _formData?.admissionDetails?.id,
        rateStay: _feedbackDetails?.rateStay || "", rateFoodService: _feedbackDetails?.rateFoodService || "",
        rateCleanliness: _feedbackDetails?.rateCleanliness || "", rateSecuritySafety: _feedbackDetails?.rateSecuritySafety || "",
        rateSupportStaff: _feedbackDetails?.rateSupportStaff || "",
        managerCandidateBehavior: _feedbackDetails?.managerCandidateBehavior || "",
        managerComments: _feedbackDetails?.managerComments || "", isActive: true
      };
      insertUpdateCandidateFeedback(body)
        .then((resp) => {
          if (resp?.data?.status === 'success') {
            CustomAlert("success", 'Resident feedback updated');
            _setCandidateBehavior('');
            _setProvideAboutCandidate(true);
          }
        })
        .catch(console.log)
        .finally(() => _setLoading(false))
    }
  }

  const handleSubmitFromCandidate = () => {
    _setLoading(true);
    if (!_feedbackDetails?.rateStay || !_feedbackDetails?.rateFoodService || !_feedbackDetails?.rateCleanliness || !_feedbackDetails?.rateSecuritySafety || !_feedbackDetails?.rateSupportStaff) {
      CustomAlert("warning", 'Provide all feedbacks');
      _setLoading(false);
      return;
    }
    const body = {
      id: _feedbackDetails?.id || 0,
      candidateRefId: _formData?.admissionDetails?.candidateRefId,
      branchRefId: _formData?.admissionDetails?.branchRefId,
      admissionRefId: _formData?.admissionDetails?.id,
      rateStay: _feedbackDetails?.rateStay || "", rateFoodService: _feedbackDetails?.rateFoodService || "",
      rateCleanliness: _feedbackDetails?.rateCleanliness || "", rateSecuritySafety: _feedbackDetails?.rateSecuritySafety || "",
      rateSupportStaff: _feedbackDetails?.rateSupportStaff || "",
      managerCandidateBehavior: _feedbackDetails?.managerCandidateBehavior || "",
      managerComments: _feedbackDetails?.managerComments || "", isActive: true
    };
    insertUpdateCandidateFeedback(body)
      .then((resp) => {
        if (resp?.data?.status === 'success') {
          CustomAlert("success", 'Resident feedback inserted');
          _setCandidateBehavior('');
          changeFeedbackData('id', resp?.data?.result?.insertedId);
          _setProvideFromCandidate(true);
        }
      })
      .catch(console.log)
      .finally(() => _setLoading(false))
  }

  const getNetPayableAmount = () => {
    const totalPaid = Number(_formData?.admissionDetails?.advancePaid || '0') + Number(_formData?.admissionDetails?.admissionFee || '0') + Number(_formData?.admissionDetails?.monthlyRent || '0');
    return totalPaid + Number(_formData?.payablePenalty || 0) + Number(_formData?.payableDuePending || 0);
  }

  const handleDeleteVacate = () => {
    Swal.fire({
      title: "Are you sure?", text: "You want to delete this checkout entry!",
      icon: "warning", showCancelButton: true,
      confirmButtonColor: "#388024", cancelButtonColor: "#bf1029", confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        _setLoading(true);
        deleteVacateDetails(_formData?.id)
          .then((resp) => {
            if (resp?.data?.status === "success") { CustomAlert("success", "Checkout entry deleted"); handleClearForm(); }
          })
          .catch(console.log)
          .finally(() => _setLoading(false))
      }
    });
  }

  const handleSubmitForm = () => {
    if (!checkValidation()) return;
    _setLoading(true);

    let vacateStatus = 'Pending';
    if (_formData?.id) {
      vacateStatus = _formData?.vacateStatus === 'Pending' ? 'Approved' : (_formData?.vacateStatus || 'Pending');
    }

    const body = {
      id: _formData?.id || 0,
      candidateRefId: _formData?.admissionDetails?.candidateRefId,
      branchRefId: _formData?.admissionDetails?.branchRefId,
      admissionRefId: _formData?.admissionDetails?.id,
      vacateType: moment(_formData?.admissionDetails?.dateOfNotice).isAfter(moment(), 'day') ? 'Vacate Notice' : 'Immediate Vacate',
      vacateStatus,
      feedbackBehavior: _feedbackDetails?.managerCandidateBehavior || '',
      feedbackBrief: _feedbackDetails?.managerComments || '',
      damageRemarks: _formData?.damageRemarks || '',
      payableAdvancePaid: _formData?.admissionDetails?.advancePaid || null,
      payableAdmissionFee: _formData?.admissionDetails?.admissionFee || null,
      payableMonthlyRent: _formData?.admissionDetails?.monthlyRent || null,
      payableDuePending: _formData?.payableDuePending || null,
      payablePenalty: _formData?.payablePenalty || null,
      netAmountPayable: getNetPayableAmount() + '',
      dateOfNoticeGiven: _formData?.dateOfNoticeGiven || null,
      proposedVacatingDate: _formData?.proposedVacatingDate || null,
      actualVacatingDate: _formData?.actualVacatingDate || null,
      isActive: _formData?.isActive || false
    };

    insertUpdateVacateDetails(body)
      .then((resp) => {
        if (resp?.data?.status === "success") {
          CustomAlert("success", "Checkout details saved");
          if (_candidateDetails?.blackListed === "yes") {
            const candidateBody = {
              id: _candidateDetails?.id || 0,
              blackListed: _candidateDetails?.blackListed || "",
              blackListedBy: (user?.firstName + " " + user?.lastName),
              blackListedReason: _candidateDetails?.blackListedReason || "",
              blackListedDate: moment(),
            };
            insertUpdateCandidateAnyDetail(candidateBody).catch(console.log);
          }
          handleClearForm();
        }
      })
      .catch(console.log)
      .finally(() => _setLoading(false))
  }

  const getOtherList = () => {
    getBranchGridList()
      .then((resp) => {
        if (resp?.data?.status === "success") _setBranchList(resp?.data?.result?.results);
      })
      .catch(console.log)
  }

  const getGridList = () => {
    _setTableLoading(true);
    getVacateListGridList(_page, _rowsPerPage, _filterData?.branchId?.toString(), _filterData?.status?.toString(), _filterData?.fromDate, _filterData?.toDate)
      .then((resp) => {
        if (resp?.data?.status === "success") {
          _setTableItems(resp?.data?.result?.results);
          _setTableTotalCount(resp?.data?.result?.totalItems);
        }
      })
      .catch(console.log)
      .finally(() => _setTableLoading(false));
  }

  const handleUpdateSearch = (fromDate: string, toDate: string) => {
    _setFilterData({ ..._filterData, fromDate, toDate });
  }

  useEffect(() => { getOtherList(); }, []);
  useEffect(() => { getGridList(); }, [_page, _rowsPerPage, _filterData]);

  const filteredItems = _tableItems?.filter((content: any) => {
    const lowerSearchInput = _search?.toLowerCase()?.trim();
    return lowerSearchInput === '' || Object?.values(content)?.some((value: any) =>
      value?.toString()?.toLowerCase()?.includes(lowerSearchInput)
    );
  });

  const columns: Column<any>[] = [
    { id: 'sno', label: 'S.No', width: 60, render: (_row: any, index: number) => (index + 1) + ((_page - 1) * _rowsPerPage) },
    {
      id: 'action', label: 'Action', align: 'center', width: 80,
      render: (row: any) => PageAccess === 'Write' ? (
        <Button size="small" onClick={() => handleEditVacate(row)} sx={{ textTransform: 'none', fontSize: '13px', color: gray[600] }}>Edit</Button>
      ) : null
    },
    {
      id: 'status', label: 'Status', align: 'center', width: 100,
      render: (row: any) => <StatusBadge status={row?.vacateStatus === "Approved" ? "Approved" : row?.vacateStatus === "Reject" ? "Rejected" : "Pending"} />
    },
    { id: 'branch', label: 'Branch', render: (row: any) => row?.branchName },
    { id: 'resident', label: 'Resident Name', render: (row: any) => row?.candidateName },
    { id: 'room', label: 'Room No', render: (row: any) => row?.roomNumber },
    { id: 'bed', label: 'Bed No', render: (row: any) => row?.cotNumber },
    { id: 'mobile', label: 'Mobile Number', render: (row: any) => row?.candidateMobileNumber },
    { id: 'doa', label: 'Date of Admission', render: (row: any) => row?.dateOfAdmission ? moment(row?.dateOfAdmission)?.format('DD-MMM-YYYY') : '' },
    { id: 'don', label: 'Date of Notice', render: (row: any) => row?.dateOfNotice ? moment(row?.dateOfNotice)?.format('DD-MMM-YYYY') : '' },
    { id: 'dong', label: 'Notice Given', render: (row: any) => row?.dateOfNoticeGiven ? moment(row?.dateOfNoticeGiven)?.format('DD-MMM-YYYY') : '' },
    { id: 'pvd', label: 'Proposed Vacate', render: (row: any) => row?.proposedVacatingDate ? moment(row?.proposedVacatingDate)?.format('DD-MMM-YYYY') : '' },
    { id: 'avd', label: 'Actual Vacate', render: (row: any) => row?.actualVacatingDate ? moment(row?.actualVacatingDate)?.format('DD-MMM-YYYY') : '' },
  ];

  const candidateColumns: Column<any>[] = [
    {
      id: 'select', label: '', width: 80,
      render: (row: any) => <Button size="small" variant="outlined" color="secondary" onClick={() => handleSelectCandidate(row)}>Select</Button>
    },
    { id: 'candidateId', label: 'Resident ID', render: (row: any) => row?.candidateId },
    { id: 'name', label: 'Name', render: (row: any) => row?.name },
    { id: 'email', label: 'Email', render: (row: any) => row?.email },
  ];

  const feedbackRatingOptions = ["Excellent", "Good", "Above Average", "Average", "Poor"];
  const behaviorOptions = [
    { name: "Excellent", icon: <ThumbsUp size={24} /> },
    { name: "Good", icon: <Smile size={24} /> },
    { name: "Above Average", icon: <Smile size={24} /> },
    { name: "Average", icon: <Meh size={24} /> },
    { name: "Bad", icon: <Frown size={24} /> },
  ];

  // List View
  if (!_editForm) {
    return (
      <Box sx={{ p: 3 }}>
        <PageHeader title="Checkout">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {['', 'Pending', 'Approved'].map((status) => (
              <Typography key={status || 'all'} role="button" onClick={() => changeFilterData('status', status)}
                sx={{
                  fontWeight: _filterData?.status === status ? 700 : 400,
                  color: _filterData?.status === status ? 'primary.main' : gray[600],
                  borderBottom: _filterData?.status === status ? '2px solid' : 'none',
                  borderColor: 'primary.main', pb: 0.5, cursor: 'pointer', fontSize: '14px'
                }}>
                {status || 'All'}
              </Typography>
            ))}
          </Box>
          {PageAccess === 'Write' && (
            <Button variant="contained" startIcon={<Plus size={16} />} onClick={handleAddNew}
              sx={{ textTransform: 'none' }}>Add New</Button>
          )}
        </PageHeader>

        <FilterBar>
          <TextField select size="small" value={_filterData?.branchId} onChange={(e: any) => changeFilterData('branchId', e.target.value)}
            sx={{ minWidth: 150 }} label="Branch">
            <MenuItem value="">All</MenuItem>
            {_branchList?.map((item: any) => <MenuItem key={item?.id} value={item?.id}>{item?.branchName}</MenuItem>)}
          </TextField>
          <DateRangeSelector handleChangeDate={handleUpdateSearch} />
          <Box sx={{ flex: 1 }} />
          <SearchInput value={_search} onChange={(value: string) => _setSearch(value)} placeholder="Search..." />
          <ExportButton onExport={exportEXCEL} />
        </FilterBar>

        <DataTable
          columns={columns}
          data={filteredItems || []}
          loading={_tableLoading}
          totalCount={_tableTotalCount}
          page={_page}
          rowsPerPage={_rowsPerPage}
          onPageChange={(p) => _setPage(p)}
          onRowsPerPageChange={(s) => _setRowsPerPage(s)}
          emptyTitle="No checkout records found"
          emptyDescription="Add a new checkout to get started."
        />
      </Box>
    );
  }

  // Edit/Add Form View
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ backgroundColor: gray[50], border: `1px solid ${gray[200]}`, borderRadius: 2, px: 4, py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', py: 2, borderBottom: `1px solid ${gray[200]}`, cursor: 'pointer' }}
          onClick={handleClearForm}>
          <ArrowLeft size={20} />
          <Typography sx={{ fontWeight: 600, ml: 1 }}>Back</Typography>
        </Box>

        <Box sx={{ my: 3, px: 2 }}>
          {/* Search Resident */}
          {!_view && (
            <Grid2 container spacing={3} sx={{ alignItems: 'center', mb: 3 }}>
              <Grid2 size={{ xs: 12, md: 5 }}>
                <TextField fullWidth size="small" placeholder="Search resident by ID / Name / Email / Mobile" autoComplete="off"
                  value={_searchCandidate} onChange={(e: any) => _setSearchCandidate(e.target.value)} />
              </Grid2>
              <Grid2 size={{ xs: 12, md: 2 }}>
                <Button variant="contained" color="primary" disabled={_loading} onClick={handleSearchCandidate}
                  sx={{ textTransform: 'none' }}>Search</Button>
              </Grid2>
            </Grid2>
          )}

          {/* Admission Details Section */}
          {_formData?.admissionDetails?.id && (
            <>
              {!_view && <Divider sx={{ mb: 3 }} />}
              <Typography sx={{ fontWeight: 600, mb: 2 }}>Resident Details</Typography>
              <Grid2 container spacing={3}>
                <Grid2 size={{ xs: 12, md: 2 }}>
                  <FormField label="Branch">
                    <Typography>{_formData?.admissionDetails?.branchName}</Typography>
                  </FormField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 2 }}>
                  <FormField label="Name">
                    <Typography>{_formData?.admissionDetails?.candidateName}</Typography>
                  </FormField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 2 }}>
                  <FormField label="Room Number">
                    <Typography>{_formData?.admissionDetails?.roomNumber}</Typography>
                  </FormField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 2 }}>
                  <FormField label="Bed Number">
                    <Typography>{_formData?.admissionDetails?.cotNumber}</Typography>
                  </FormField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 2 }}>
                  <FormField label="Mobile Number">
                    <Typography>{_formData?.admissionDetails?.candidateMobileNumber}</Typography>
                  </FormField>
                </Grid2>
                <Grid2 size={12}><Box /></Grid2>
                <Grid2 size={{ xs: 12, md: 2 }}>
                  <FormField label="Date of Admission">
                    <Typography>{_formData?.admissionDetails?.dateOfAdmission && moment(_formData?.admissionDetails?.dateOfAdmission)?.format('DD-MMM-YYYY')}</Typography>
                  </FormField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 2 }}>
                  <FormField label="Date of Notice">
                    <Typography>{_formData?.admissionDetails?.dateOfNotice && moment(_formData?.admissionDetails?.dateOfNotice)?.format('DD-MMM-YYYY')}</Typography>
                  </FormField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 2 }}>
                  <FormField label="Duration Type">
                    <Typography>{_formData?.admissionDetails?.noDayStayType}</Typography>
                  </FormField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 2 }}>
                  <FormField label="Duration Count">
                    <Typography>{_formData?.admissionDetails?.noDayStay}</Typography>
                  </FormField>
                </Grid2>
              </Grid2>

              <Divider sx={{ my: 3 }} />
              <Typography sx={{ fontWeight: 600, mb: 2 }}>Notice Details</Typography>
              <Grid2 container spacing={3}>
                <Grid2 size={{ xs: 12, md: 2 }}>
                  <FormField label="Date of Notice Given" required>
                    <TextField fullWidth size="small" type="date" onKeyDown={DisableKeyUpDown}
                      value={_formData?.dateOfNoticeGiven} autoComplete="off"
                      onChange={(e) => changeFormData("dateOfNoticeGiven", e.target.value)} />
                  </FormField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 2 }}>
                  <FormField label="Proposed Vacating Date" required>
                    <TextField fullWidth size="small" type="date" onKeyDown={DisableKeyUpDown}
                      value={_formData?.proposedVacatingDate} autoComplete="off"
                      onChange={(e) => changeFormData("proposedVacatingDate", e.target.value)}
                      slotProps={{ htmlInput: { min: moment(_formData?.dateOfNoticeGiven).format('YYYY-MM-DD') } }} />
                  </FormField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 2 }}>
                  <FormField label="Actual Vacating Date" required>
                    <TextField fullWidth size="small" type="date" onKeyDown={DisableKeyUpDown}
                      value={_formData?.actualVacatingDate} autoComplete="off"
                      onChange={(e) => changeFormData("actualVacatingDate", e.target.value)}
                      slotProps={{ htmlInput: { min: moment(_formData?.dateOfNoticeGiven).format('YYYY-MM-DD') } }} />
                  </FormField>
                </Grid2>
              </Grid2>

              <Divider sx={{ my: 3 }} />
              <Typography sx={{ fontWeight: 600, mb: 2 }}>Payment Details</Typography>
              <Grid2 container spacing={3}>
                <Grid2 size={{ xs: 12, md: 2 }}>
                  <FormField label="Advance Paid">
                    <Typography>{_formData?.admissionDetails?.advancePaid}</Typography>
                  </FormField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 2 }}>
                  <FormField label="Admission Fee">
                    <Typography>{_formData?.admissionDetails?.admissionFee}</Typography>
                  </FormField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 2 }}>
                  <FormField label="Monthly Rent">
                    <Typography>{_formData?.admissionDetails?.monthlyRent}</Typography>
                  </FormField>
                </Grid2>
                <Grid2 size={12}><Box /></Grid2>
                <Grid2 size={{ xs: 12, md: 2 }}>
                  <FormField label="Penalty">
                    <TextField fullWidth type="number" size="small" onKeyDown={DisableKeyUpDown}
                      value={_formData?.payablePenalty} autoComplete="off"
                      onChange={(e) => changeFormData("payablePenalty", e.target.value)} />
                  </FormField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 2 }}>
                  <FormField label="Due Pending">
                    <TextField fullWidth type="number" size="small" onKeyDown={DisableKeyUpDown}
                      value={_formData?.payableDuePending} autoComplete="off"
                      onChange={(e) => changeFormData("payableDuePending", e.target.value)} />
                  </FormField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 4 }}>
                  <FormField label="Net Amount Payable">
                    <Typography sx={{ fontWeight: 600 }}>{getNetPayableAmount()}</Typography>
                  </FormField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <FormField label="Damage Remarks" required>
                    <TextField fullWidth size="small" value={_formData?.damageRemarks}
                      onChange={(e) => changeFormData("damageRemarks", e.target.value)} />
                  </FormField>
                </Grid2>
              </Grid2>

              <Divider sx={{ my: 3 }} />

              <FormControlLabel label="Mark this resident as Blacklist (if yes provide reason below)"
                control={<Checkbox size="small" checked={_candidateDetails?.blackListed === "yes"}
                  onChange={() => _setCandidateDetails({ ..._candidateDetails, blackListed: _candidateDetails?.blackListed === "yes" ? "no" : "yes" })} />} />

              {_candidateDetails?.blackListed === "yes" && (
                <Box sx={{ mt: 1, maxWidth: 400 }}>
                  <FormField label="Reason for Blacklist">
                    <TextField fullWidth size="small" value={_candidateDetails?.blackListedReason}
                      onChange={(e) => _setCandidateDetails({ ..._candidateDetails, blackListedReason: e.target.value })} />
                  </FormField>
                </Box>
              )}

              <Box sx={{ pt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  {!_formData?.id && (
                    <>
                      <FormControlLabel
                        control={<Checkbox checked={_provideAboutCandidate} size="small" />}
                        label="Provide Resident Behavior"
                        onClick={() => _setCandidateBehavior('About_Candidate')} />
                      <FormControlLabel
                        control={<Checkbox checked={_provideFromCandidate} size="small" />}
                        label="Provide feedback from Resident"
                        onClick={() => _setCandidateBehavior('From_Candidate')} />
                    </>
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {_formData?.id && (
                    <Button variant="contained" color="error" disabled={_loading} onClick={handleDeleteVacate}
                      sx={{ textTransform: 'none' }}>Delete</Button>
                  )}
                  <Button variant="contained" color="primary" disabled={_loading} onClick={handleSubmitForm}
                    sx={{ textTransform: 'none' }}>
                    {_formData?.vacateStatus === "Pending" ? "Approve" : _formData?.vacateStatus === "Approved" ? "Apply" : "Submit"}
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Box>

      {/* Select Resident Dialog */}
      <DialogModal open={_candidateList?.length > 0} onClose={() => _setCandidateList([])} title="Select Resident" maxWidth="md">
        <DataTable
          columns={candidateColumns}
          data={_candidateList || []}
          loading={false}
          totalCount={_candidateList?.length || 0}
          page={1}
          rowsPerPage={_candidateList?.length || 10}
          onPageChange={() => {}}
          onRowsPerPageChange={() => {}}
          emptyTitle="No residents found"
        />
      </DialogModal>

      {/* Feedback About Resident Behavior Dialog */}
      <DialogModal open={_candidateBehavior === 'About_Candidate'} onClose={() => _setCandidateBehavior('')}
        title="Feedback About Resident Behavior" maxWidth="sm"
        actions={
          <Box sx={{ px: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
            <Typography sx={{ fontWeight: 600 }}>1/2</Typography>
            <Button variant="contained" color="primary" onClick={handleSubmitAboutCandidate}
              sx={{ textTransform: 'none', px: 4 }}>Submit</Button>
          </Box>
        }>
        <Box sx={{ py: 1 }}>
          <Typography sx={{ mb: 2 }}>How was the behavior of the resident?</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '80%', my: 2 }}>
              {behaviorOptions.map(({ name, icon }) => (
                <Box key={name} sx={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => changeFeedbackData("managerCandidateBehavior", name)}>
                  <Box sx={{ color: _feedbackDetails?.managerCandidateBehavior === name ? '#F76D61' : gray[500] }}>
                    {icon}
                  </Box>
                  <Typography variant="body2" sx={{ mt: 0.5, color: _feedbackDetails?.managerCandidateBehavior === name ? '#F76D61' : gray[700] }}>
                    {name}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
          <Box sx={{ mt: 2 }}>
            <FormField label="Describe in brief">
              <TextField multiline fullWidth rows={3} size="small"
                value={_feedbackDetails?.managerComments} onChange={(e: any) => changeFeedbackData('managerComments', e.target.value)} />
            </FormField>
          </Box>
        </Box>
      </DialogModal>

      {/* Feedback From Resident Dialog */}
      <DialogModal open={_candidateBehavior === 'From_Candidate'} onClose={() => _setCandidateBehavior('')}
        title="Feedback From Resident" maxWidth="sm"
        actions={
          <Box sx={{ px: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
            <Typography sx={{ fontWeight: 600 }}>2/2</Typography>
            <Button variant="contained" color="primary" disabled={_loading} onClick={handleSubmitFromCandidate}
              sx={{ textTransform: 'none', px: 4 }}>Submit</Button>
          </Box>
        }>
        <Box sx={{ py: 1 }}>
          {[
            { label: "How do you rate your stay with us?", key: "rateStay" },
            { label: "How do you rate our food service?", key: "rateFoodService" },
            { label: "How do you rate our cleanliness and housekeeping?", key: "rateCleanliness" },
            { label: "How do you rate our security and safety measures?", key: "rateSecuritySafety" },
            { label: "How do you rate the support / cordiality of our staffs?", key: "rateSupportStaff" },
          ].map(({ label, key }) => (
            <Box key={key} sx={{ mb: 2 }}>
              <Typography sx={{ fontWeight: 600, mb: 0.5 }}>{label}</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
                {feedbackRatingOptions.map((option) => (
                  <FormControlLabel key={option}
                    control={
                      <Checkbox size="small"
                        sx={{ color: "#F76D61", "&.Mui-checked": { color: "#F76D61" } }}
                        checked={(_feedbackDetails as any)?.[key] === option}
                        onChange={() => changeFeedbackData(key, option)} />
                    }
                    label={<Typography variant="body2">{option}</Typography>} />
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </DialogModal>
    </Box>
  );
}
