import { useEffect, useState } from "react";
import { Box, Button, Checkbox, FormControlLabel, MenuItem, TextField, Typography, Divider, Select, ListItemText } from "@mui/material";
import { CustomAlert, DisableKeyUpDown, getExportEXCEL } from "../../services/HelperService";
import { getBranchGridList, getCandidateFeedbackGridList, insertUpdateCandidateFeedback } from "../../models";
import moment from "moment";
import { Eye, Pencil, Smile, Meh, Frown, ThumbsUp, Award } from 'lucide-react';
import PageHeader from "../../components/shared/PageHeader";
import FilterBar from "../../components/shared/FilterBar";
import DataTable, { Column } from "../../components/shared/DataTable";
import SearchInput from "../../components/shared/SearchInput";
import ExportButton from "../../components/shared/ExportButton";
import DialogModal from "../../components/shared/DialogModal";
import { gray } from "../../theme/tokens";

const RATING_OPTIONS = ["Excellent", "Good", "Above Average", "Average", "Poor"];

const BEHAVIOR_OPTIONS = [
  { name: "Excellent", icon: Award },
  { name: "Good", icon: ThumbsUp },
  { name: "Above Average", icon: Smile },
  { name: "Average", icon: Meh },
  { name: "Bad", icon: Frown },
];

const DATE_RANGES = ["Today", "Last Week", "Last Month", "Current Month", "Custom"];

export default function Index({ PageAccess }: any) {
  const [_feedbackDetails, _setFeedbackDetails] = useState<any>({
    id: 0, candidateRefId: 0, branchRefId: 0, admissionRefId: 0,
    rateStay: "", rateFoodService: "", rateCleanliness: "",
    rateSecuritySafety: "", rateSupportStaff: "",
    managerCandidateBehavior: "", managerComments: "", candidateRemarks: "", isActive: true
  });
  const [_candidateBehavior, _setCandidateBehavior] = useState(false);
  const [_managerBehavior, _setManagerBehavior] = useState(false);
  const [_filterData, _setFilterData] = useState<any>({
    branchList: [],
    fromDate: moment().clone().startOf('month').format('YYYY-MM-DD'),
    toDate: moment().format('YYYY-MM-DD')
  });
  const [_dateRange, _setDateRange] = useState("Current Month");
  const [_view, _setView] = useState(false);
  const [_search, _setSearch] = useState('');
  const [_tableLoading, _setTableLoading] = useState(true);
  const [_tableItems, _setTableItems] = useState<any>([]);
  const [_tableTotalCount, _setTableTotalCount] = useState(0);
  const [_page, _setPage] = useState(1);
  const [_rowsPerPage, _setRowsPerPage] = useState(10);
  const [_loading, _setLoading] = useState(false);
  const [_branchList, _setBranchList] = useState<any>([]);

  const changeFilterData = (key: string, value: any) => {
    _setFilterData({ ..._filterData, [key]: value });
  };

  const changeFeedbackData = (key: string, value: any) => {
    _setFeedbackDetails({ ..._feedbackDetails, [key]: value });
  };

  const handleViewCandidateFeedback = (item: any) => {
    _setCandidateBehavior(true);
    _setFeedbackDetails(item);
    _setView(true);
  };

  const handleEditManagerFeedback = (item: any) => {
    _setManagerBehavior(true);
    _setFeedbackDetails(item);
  };

  const handleClearForm = () => {
    getGridList();
    _setLoading(false);
    _setView(false);
    _setCandidateBehavior(false);
    _setManagerBehavior(false);
    _setFeedbackDetails({
      id: 0, candidateRefId: 0, branchRefId: 0, admissionRefId: 0,
      rateStay: "", rateFoodService: "", rateCleanliness: "",
      rateSecuritySafety: "", rateSupportStaff: "",
      managerCandidateBehavior: "", managerComments: "", candidateRemarks: "", isActive: true
    });
  };

  const handleSubmitAboutCandidate = () => {
    _setLoading(true);
    if (!_feedbackDetails?.managerCandidateBehavior) {
      CustomAlert('warning', "Feedback Behavior Required");
      _setLoading(false);
      return false;
    }
    if (!_feedbackDetails?.managerComments) {
      CustomAlert('warning', "Feedback Brief Required");
      _setLoading(false);
      return false;
    }
    const body = {
      id: _feedbackDetails?.id,
      candidateRefId: _feedbackDetails?.candidateRefId,
      branchRefId: _feedbackDetails?.branchRefId,
      admissionRefId: _feedbackDetails?.admissionRefId,
      rateStay: _feedbackDetails?.rateStay || "",
      rateFoodService: _feedbackDetails?.rateFoodService || "",
      rateCleanliness: _feedbackDetails?.rateCleanliness || "",
      rateSecuritySafety: _feedbackDetails?.rateSecuritySafety || "",
      rateSupportStaff: _feedbackDetails?.rateSupportStaff || "",
      managerCandidateBehavior: _feedbackDetails?.managerCandidateBehavior || "",
      managerComments: _feedbackDetails?.managerComments || "",
      candidateRemarks: _feedbackDetails?.candidateRemarks || "",
      isActive: true
    };
    insertUpdateCandidateFeedback(body)
      .then((resp) => {
        if (resp?.data?.status === 'success') {
          CustomAlert("success", 'Manager Feedback Updated');
          handleClearForm();
        }
      })
      .catch((err) => console.log(err))
      .finally(() => _setLoading(false));
  };

  const handleDateRangeChange = (value: string) => {
    _setDateRange(value);
    const today = moment();
    let fromDate = today.format('YYYY-MM-DD');
    let toDate = today.format('YYYY-MM-DD');
    switch (value) {
      case "Today":
        fromDate = today.format('YYYY-MM-DD');
        toDate = today.format('YYYY-MM-DD');
        break;
      case "Last Week":
        fromDate = today.clone().subtract(7, 'days').format('YYYY-MM-DD');
        toDate = today.format('YYYY-MM-DD');
        break;
      case "Last Month":
        fromDate = today.clone().subtract(1, 'months').startOf('month').format('YYYY-MM-DD');
        toDate = today.clone().subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
        break;
      case "Current Month":
        fromDate = today.clone().startOf('month').format('YYYY-MM-DD');
        toDate = today.format('YYYY-MM-DD');
        break;
      case "Custom":
        return;
    }
    _setFilterData({ ..._filterData, fromDate, toDate });
  };

  const getGridList = () => {
    _setTableLoading(true);
    getCandidateFeedbackGridList(_page, _rowsPerPage, _filterData?.branchList?.join(','), _filterData?.fromDate, _filterData?.toDate)
      .then((resp) => {
        if (resp?.data?.status === "success") {
          _setTableItems(resp?.data?.result?.results);
          _setTableTotalCount(resp?.data?.result?.totalItems);
        }
      })
      .catch(console.log)
      .finally(() => _setTableLoading(false));
  };

  const getOtherList = () => {
    getBranchGridList()
      .then((resp) => {
        if (resp?.data?.status === "success") _setBranchList(resp?.data?.result?.results);
      })
      .catch(console.log);
  };

  const getPrintTableHeadBody = () => {
    const header = ["S. No", "Branch Name", "Resident Name", "Room No", "Cleanliness", "Food Service", "Security Safety", "Stay", "Support Staff"];
    const body = _tableItems?.map((item: any, index: number) => [
      index + 1, item?.branchName, item?.candidateName, item?.roomNumber,
      item?.rateCleanliness, item?.rateFoodService, item?.rateSecuritySafety, item?.rateStay, item?.rateSupportStaff
    ]);
    return { header, body };
  };

  const exportEXCEL = () => {
    const { header, body } = getPrintTableHeadBody();
    getExportEXCEL({ header, body, fileName: "Feedback" });
  };

  useEffect(() => { getGridList(); }, [_page, _rowsPerPage, _filterData]);
  useEffect(() => { getOtherList(); }, []);

  const filteredItems = _tableItems?.filter((content: any) => {
    const lowerSearchInput = _search?.toLowerCase()?.trim();
    return lowerSearchInput === '' || Object?.values(content)?.some((value: any) =>
      value?.toString()?.toLowerCase()?.includes(lowerSearchInput)
    );
  });

  const columns: Column<any>[] = [
    { id: 'sno', label: 'S.No', width: 60, render: (_row: any, index: number) => (index + 1) + ((_page - 1) * _rowsPerPage) },
    {
      id: 'action', label: 'Action', align: 'center', width: 100,
      render: (row: any) => (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Button size="small" onClick={() => handleViewCandidateFeedback(row)}
            sx={{ minWidth: 'auto', p: 0.5, color: gray[500] }}>
            <Eye size={16} />
          </Button>
          {PageAccess === 'Write' && (
            <Button size="small" onClick={() => handleEditManagerFeedback(row)}
              sx={{ minWidth: 'auto', p: 0.5, color: gray[500] }}>
              <Pencil size={16} />
            </Button>
          )}
        </Box>
      )
    },
    { id: 'name', label: 'Name', render: (row: any) => row?.candidateName || "-" },
    { id: 'mobile', label: 'Mobile Number', render: (row: any) => row?.candidateMobileNumber || "-" },
    { id: 'email', label: 'Email', render: (row: any) => row?.candidateEmail || "-" },
    { id: 'branch', label: 'Branch', render: (row: any) => row?.branchName || "-" },
    { id: 'room', label: 'Room Number', render: (row: any) => row?.roomNumber || "-" },
    {
      id: 'admission', label: 'Admission Date',
      render: (row: any) => row?.dateOfAdmission ? moment(row?.dateOfAdmission)?.format('DD-MMM-YYYY') : '-'
    },
    {
      id: 'vacate', label: 'Vacate Date',
      render: (row: any) => row?.dateOfNotice ? moment(row?.dateOfNotice)?.format('DD-MMM-YYYY') : '-'
    },
  ];

  // Rating row component
  const RatingRow = ({ label, field }: { label: string; field: string }) => (
    <Box sx={{ mb: 2 }}>
      <Typography sx={{ fontWeight: 600, mb: 0.5, fontSize: '14px' }}>{label}</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
        {RATING_OPTIONS.map((option) => (
          <FormControlLabel key={option}
            control={
              <Checkbox size="small"
                sx={{ color: "#F76D61", "&.Mui-checked": { color: "#F76D61" } }}
                checked={(_feedbackDetails as any)?.[field] === option}
                onChange={() => !_view && changeFeedbackData(field, option)} />
            }
            label={<Typography variant="body2">{option}</Typography>} />
        ))}
      </Box>
    </Box>
  );

  // Behavior selector component
  const BehaviorSelector = () => (
    <Box>
      <Typography sx={{ mb: 1, fontSize: '14px' }}>How was the Behavior of the Resident</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '80%', my: 2 }}>
          {BEHAVIOR_OPTIONS.map(({ name, icon: Icon }) => (
            <Box key={name} sx={{ textAlign: 'center', cursor: 'pointer' }}
              onClick={() => changeFeedbackData("managerCandidateBehavior", name)}>
              <Icon size={28}
                color={_feedbackDetails?.managerCandidateBehavior === name ? "#F76D61" : gray[500]}
                strokeWidth={_feedbackDetails?.managerCandidateBehavior === name ? 2.5 : 1.5} />
              <Typography variant="body2" sx={{
                mt: 0.5, fontSize: '12px',
                color: _feedbackDetails?.managerCandidateBehavior === name ? "#F76D61" : gray[600],
                fontWeight: _feedbackDetails?.managerCandidateBehavior === name ? 600 : 400
              }}>{name}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader title="Feedback" description="Review resident satisfaction ratings" />

      <FilterBar>
        <Select
          size="small" multiple displayEmpty
          value={_filterData?.branchList || []}
          onChange={(e: any) => changeFilterData('branchList', e.target.value || [])}
          renderValue={(selected: any) => {
            if (!selected || selected.length === 0) return <Typography variant="body2" sx={{ color: gray[400] }}>Branch</Typography>;
            return selected.map((id: number) => {
              const branch = _branchList?.find((b: any) => b.id === id);
              return branch?.branchName || '';
            }).filter(Boolean).join(', ');
          }}
          sx={{ minWidth: 180 }}>
          {_branchList?.map((item: any) =>
            item?.isActive && (
              <MenuItem key={item?.id} value={item?.id}>
                <Checkbox checked={_filterData?.branchList?.includes(item?.id)} size="small" />
                <ListItemText primary={item?.branchName} />
              </MenuItem>
            )
          )}
        </Select>
        <TextField select size="small" value={_dateRange}
          onChange={(e) => handleDateRangeChange(e.target.value)}
          sx={{ minWidth: 150 }}>
          {DATE_RANGES.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
        </TextField>
        <TextField size="small" type="date" value={_filterData?.fromDate}
          onKeyDown={DisableKeyUpDown}
          slotProps={{ input: { readOnly: _dateRange !== "Custom" } }}
          onChange={(e) => _setFilterData({ ..._filterData, fromDate: e.target.value })}
          sx={{ minWidth: 150 }} />
        <TextField size="small" type="date" value={_filterData?.toDate}
          onKeyDown={DisableKeyUpDown}
          slotProps={{ input: { readOnly: _dateRange !== "Custom" } }}
          onChange={(e) => _setFilterData({ ..._filterData, toDate: e.target.value })}
          sx={{ minWidth: 150 }} />
        <SearchInput value={_search} onChange={(value: string) => _setSearch(value)} placeholder="Search feedback..." />
        <Box sx={{ flex: 1 }} />
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
        onRowsPerPageChange={(s) => { _setRowsPerPage(s); _setPage(1); }}
        emptyTitle="No feedback found"
        emptyDescription="No feedback records available for the selected filters."
      />

      {/* Manager Feedback Dialog */}
      <DialogModal open={_managerBehavior} onClose={() => _setManagerBehavior(false)}
        title="Feedback About Resident Behavior" maxWidth="sm"
        actions={
          <Box sx={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
            <Button variant="contained" color="primary" disabled={_loading} onClick={handleSubmitAboutCandidate}
              sx={{ textTransform: 'none', px: 4 }}>Submit</Button>
          </Box>
        }>
        <Box sx={{ py: 1 }}>
          <BehaviorSelector />
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ color: gray[500], mb: 1 }}>Describe in brief</Typography>
            <TextField multiline fullWidth rows={3} size="small"
              value={_feedbackDetails?.managerComments || ''}
              onChange={(e: any) => changeFeedbackData('managerComments', e.target.value)} />
          </Box>
        </Box>
      </DialogModal>

      {/* Candidate Feedback Dialog */}
      <DialogModal open={_candidateBehavior} onClose={() => _setCandidateBehavior(false)}
        title="Feedback From Resident" maxWidth="sm"
        actions={
          !_view ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', flex: 1, my: 1 }}>
              <Button variant="contained" color="primary" disabled={_loading} onClick={handleSubmitAboutCandidate}
                sx={{ textTransform: 'none', px: 4 }}>Submit</Button>
            </Box>
          ) : undefined
        }>
        <Box sx={{ py: 1 }}>
          <RatingRow label="How do you rate your stay with us?" field="rateStay" />
          <RatingRow label="How do you rate our food service?" field="rateFoodService" />
          <RatingRow label="How do you rate our cleanliness and housekeeping?" field="rateCleanliness" />
          <RatingRow label="How do you rate our security and safety measures?" field="rateSecuritySafety" />
          <RatingRow label="How do you rate the support / cordiality of our staff?" field="rateSupportStaff" />

          <Box sx={{ mt: 2 }}>
            <Typography sx={{ fontWeight: 600, mb: 0.5, fontSize: '14px' }}>Remarks</Typography>
            <TextField multiline fullWidth rows={3} size="small"
              value={_feedbackDetails?.candidateRemarks || ''}
              onChange={(e: any) => !_view && changeFeedbackData('candidateRemarks', e.target.value)} />
          </Box>

          {!_view && (
            <Box>
              <Divider sx={{ my: 2 }} />
              <Typography sx={{ fontWeight: 600, mb: 2 }}>Manager Feedback</Typography>
              <BehaviorSelector />
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ color: gray[500], mb: 1 }}>Describe in brief</Typography>
                <TextField multiline fullWidth rows={3} size="small"
                  value={_feedbackDetails?.managerComments || ''}
                  onChange={(e: any) => changeFeedbackData('managerComments', e.target.value)} />
              </Box>
            </Box>
          )}
        </Box>
      </DialogModal>
    </Box>
  );
}
