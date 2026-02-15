import { useEffect, useState } from "react";
import { Button, TextField, Box, Typography, Divider, Table, TableBody, TableCell, TableHead, TableRow, TableContainer } from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import { CustomAlert, getExportEXCEL } from '../../services/HelperService';
import moment from 'moment';
import { getBlacklistGridList, getBranchCandidateDetailSearch, getCandidateAdmissionById, insertUpdateCandidateBlackList } from '../../models';
import { useStateValue } from "../../providers/StateProvider";
import { ArrowLeft, Plus, Eye } from 'lucide-react';
import PageHeader from "../../components/shared/PageHeader";
import FilterBar from "../../components/shared/FilterBar";
import DataTable, { Column } from "../../components/shared/DataTable";
import SearchInput from "../../components/shared/SearchInput";
import ExportButton from "../../components/shared/ExportButton";
import DialogModal from "../../components/shared/DialogModal";
import FormField from "../../components/shared/FormField";
import { gray } from "../../theme/tokens";

export default function Index({ PageAccess }: any) {
  const [{ user }]: any = useStateValue();
  const [_tableItems, _setTableItems] = useState<any>([]);
  const [_tableTotalCount, _setTableTotalCount] = useState(0);
  const [_tableLoading, _setTableLoading] = useState(true);
  const [_loading, _setLoading] = useState(false);
  const [_search, _setSearch] = useState('');
  const [_searchCandidate, _setSearchCandidate] = useState('');
  const [_view, _setView] = useState(false);
  const [_editForm, _setEditForm] = useState(false);
  const [_candidateList, _setCandidateList] = useState<any>([]);
  const [_formData, _setFormData] = useState<any>({
    id: 0, blackListed: "", blackListedReason: "", informToParents: false, informToLocalGuardian: false, isActive: true
  });
  const [_page, _setPage] = useState(1);
  const [_rowsPerPage, _setRowsPerPage] = useState(10);

  const changeFormData = (key: string, value: any) => {
    _setFormData({ ..._formData, [key]: value });
  };

  const handleSearchCandidate = () => {
    if (!_searchCandidate?.trim()) return;
    _setLoading(true);
    getBranchCandidateDetailSearch(_searchCandidate)
      .then((resp) => {
        if (resp?.data?.status === "success") {
          if (!resp?.data?.result?.length) {
            CustomAlert("error", "Resident not found");
          } else {
            _setCandidateList([...resp?.data?.result]);
          }
        }
      })
      .catch((err) => console.log(err))
      .finally(() => _setLoading(false));
  };

  const handleAddNew = () => {
    handleClearForm();
    _setEditForm(true);
  };

  const handleGoBack = () => {
    _setEditForm(false);
    handleClearForm();
  };

  const handleClearForm = () => {
    getGridList();
    _setView(false);
    _setSearchCandidate('');
    _setLoading(false);
    _setEditForm(false);
    _setFormData({ id: 0, blackListed: "", blackListedReason: "", informToParents: false, informToLocalGuardian: false, isActive: true });
  };

  const getPrintTableHeadBody = () => {
    const header = ["S. No", "Resident Name", "Status"];
    const body = _tableItems?.map((item: any, index: number) => [index + 1, item?.name, item?.isActive]);
    return { header, body };
  };

  const exportEXCEL = () => {
    const { header, body } = getPrintTableHeadBody();
    getExportEXCEL({ header, body, fileName: "Restricted Residents" });
  };

  const handleViewCandidate = (item: any) => {
    _setEditForm(true);
    _setView(true);
    handleSelectCandidate(item?.id);
  };

  const handleSubmitForm = (flag: string) => {
    _setLoading(true);
    const body = {
      id: _formData?.candidateRefId || 0,
      blackListed: flag,
      blackListedBy: flag === "yes" ? (user?.firstName + " " + user?.lastName) : "",
      blackListedReason: flag === "yes" ? (_formData?.blackListedReason || "") : "",
      blackListedDate: flag === "yes" ? moment() : "",
    };
    insertUpdateCandidateBlackList(body)
      .then((resp) => {
        if (resp?.data?.status === "success") {
          CustomAlert("success", flag === "yes" ? "Resident added to restricted list" : "Resident removed from restricted list");
          handleClearForm();
        }
      })
      .catch((err) => console.log(err))
      .finally(() => _setLoading(false));
  };

  const handleSelectCandidate = (id: number) => {
    if (!id) {
      CustomAlert('warning', 'Resident not registered');
      return;
    }
    _setCandidateList([]);
    getCandidateAdmissionById({ candidateId: id })
      .then((resp) => {
        if (resp?.data?.status === "success") {
          const data = resp?.data?.result?.length ? resp?.data?.result[0] : { ...resp?.data?.result };
          _setFormData({
            ..._formData, ...data,
            dateOfAdmission: data?.dateOfAdmission,
            cotNumber: data?.cotNumber,
            roomNumber: data?.roomNumber,
            branchName: data?.branchName,
          });
        }
      })
      .catch((err) => console.log(err));
  };

  const getGridList = () => {
    _setTableLoading(true);
    getBlacklistGridList(_page, _rowsPerPage)
      .then((resp) => {
        if (resp?.data?.status === "success") {
          _setTableItems(resp?.data?.result?.results);
          _setTableTotalCount(resp?.data?.result?.totalItems);
        }
      })
      .catch(console.log)
      .finally(() => _setTableLoading(false));
  };

  useEffect(() => { getGridList(); }, [_page, _rowsPerPage]);

  const filteredItems = _tableItems?.filter((content: any) => {
    const lowerSearchInput = _search?.toLowerCase()?.trim();
    return lowerSearchInput === '' || Object?.values(content)?.some((value: any) =>
      value?.toString()?.toLowerCase()?.includes(lowerSearchInput)
    );
  });

  const columns: Column<any>[] = [
    { id: 'sno', label: 'S.No', width: 60, render: (_row: any, index: number) => (index + 1) + ((_page - 1) * _rowsPerPage) },
    {
      id: 'view', label: 'View', align: 'center', width: 60,
      render: (row: any) => (
        <Button size="small" onClick={() => handleViewCandidate(row)}
          sx={{ minWidth: 'auto', p: 0.5, color: gray[500] }}>
          <Eye size={16} />
        </Button>
      )
    },
    { id: 'candidateId', label: 'Resident ID', render: (row: any) => row?.candidateId || "-" },
    { id: 'name', label: 'Name', render: (row: any) => row?.name || "-" },
    { id: 'mobile', label: 'Mobile No', render: (row: any) => row?.mobileNumber || "-" },
    { id: 'email', label: 'Email', render: (row: any) => row?.email || "-" },
    { id: 'reason', label: 'Reason', render: (row: any) => row?.blackListedReason || "-" },
    { id: 'updatedBy', label: 'Updated By', render: (row: any) => row?.blackListedBy || "-" },
    {
      id: 'date', label: 'Last Update Date & Time',
      render: (row: any) => row?.blackListedDate ? moment(row?.blackListedDate)?.format('DD-MM-YYYY & hh:mm A') : "-"
    },
  ];

  // List View
  if (!_editForm) {
    return (
      <Box sx={{ p: 3 }}>
        <PageHeader title="Restricted Residents" description="Manage restricted resident records">
          {PageAccess === 'Write' && (
            <Button variant="contained" startIcon={<Plus size={16} />} onClick={handleAddNew}
              sx={{ textTransform: 'none' }}>Add New</Button>
          )}
        </PageHeader>

        <FilterBar>
          <SearchInput value={_search} onChange={(value: string) => _setSearch(value)} placeholder="Search residents..." />
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
          emptyTitle="No restricted residents found"
          emptyDescription="No residents have been restricted."
        />
      </Box>
    );
  }

  // Edit/Add Form View
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ backgroundColor: gray[50], border: `1px solid ${gray[200]}`, borderRadius: 2, px: 4, py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', py: 2, borderBottom: `1px solid ${gray[200]}`, cursor: 'pointer' }}
          onClick={handleGoBack}>
          <ArrowLeft size={20} />
          <Typography sx={{ fontWeight: 600, ml: 1 }}>Back</Typography>
        </Box>

        <Box sx={{ backgroundColor: 'white', my: 3, p: 2, borderRadius: 1 }}>
          {/* Search bar (only in add mode) */}
          {!_view && (
            <form onSubmit={(e) => { e.preventDefault(); handleSearchCandidate(); }}>
              <Grid2 container spacing={3} sx={{ alignItems: 'center' }}>
                <Grid2 size={{ xs: 12, md: 5 }}>
                  <TextField fullWidth size="small" placeholder="Search Resident / Branch"
                    value={_searchCandidate} onChange={(e: any) => _setSearchCandidate(e.target.value)} />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 2 }}>
                  <Button variant="contained" color="primary" disabled={_loading} type="submit"
                    sx={{ textTransform: 'none' }}>Search</Button>
                </Grid2>
              </Grid2>
            </form>
          )}

          {/* Candidate details (after selection) */}
          {_formData?.id ? (
            <Box>
              {!_view && <Divider sx={{ my: 2 }} />}
              <Grid2 container spacing={3}>
                <Grid2 size={{ xs: 12, md: 3 }}>
                  <FormField label="Resident ID">
                    <TextField fullWidth size="small" value={_formData?.candidateId || ''}
                      slotProps={{ input: { readOnly: true } }} />
                  </FormField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 3 }}>
                  <FormField label="Name">
                    <TextField fullWidth size="small" value={_formData?.candidateName || ''}
                      slotProps={{ input: { readOnly: true } }} />
                  </FormField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 3 }}>
                  <FormField label="Mobile Number">
                    <TextField fullWidth size="small" value={_formData?.candidateMobileNumber || ''}
                      slotProps={{ input: { readOnly: true } }} />
                  </FormField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 3 }}>
                  <FormField label="Email">
                    <TextField fullWidth size="small" value={_formData?.candidateEmail || ''}
                      slotProps={{ input: { readOnly: true } }} />
                  </FormField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 3 }}>
                  <FormField label="Branch">
                    <TextField fullWidth size="small" value={_formData?.branchName || ''}
                      slotProps={{ input: { readOnly: true } }} />
                  </FormField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 3 }}>
                  <FormField label="Room Number">
                    <TextField fullWidth size="small" value={_formData?.roomNumber || ''}
                      slotProps={{ input: { readOnly: true } }} />
                  </FormField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 3 }}>
                  <FormField label="Bed Number">
                    <TextField fullWidth size="small" value={_formData?.cotNumber || ''}
                      slotProps={{ input: { readOnly: true } }} />
                  </FormField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 3 }}>
                  <FormField label="Date of Admission">
                    <TextField fullWidth size="small" value={_formData?.dateOfAdmission || ''}
                      slotProps={{ input: { readOnly: true } }} />
                  </FormField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 3 }}>
                  <FormField label="Date of Vacate">
                    <TextField fullWidth size="small" value={_formData?.dateOfVacate || ''}
                      slotProps={{ input: { readOnly: true } }} />
                  </FormField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <FormField label="Reason">
                    <TextField fullWidth size="small" value={_formData?.blackListedReason || ''}
                      slotProps={{ input: { readOnly: _view } }}
                      onChange={(e) => changeFormData("blackListedReason", e.target.value)} />
                  </FormField>
                </Grid2>
              </Grid2>
            </Box>
          ) : null}
        </Box>

        {/* Action buttons */}
        {!_view ? (
          <Box>
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, py: 2 }}>
              <Button variant="contained" color="primary" disabled={_loading || !_formData?.id}
                onClick={() => handleSubmitForm("yes")} sx={{ textTransform: 'none', px: 4 }}>Save</Button>
              <Button variant="outlined" onClick={handleClearForm}
                sx={{ textTransform: 'none', px: 4, color: 'black', borderColor: gray[300] }}>Clear</Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', py: 2 }}>
            <Button variant="contained" color="success" disabled={_loading || !_formData?.id}
              onClick={() => handleSubmitForm("no")} sx={{ textTransform: 'none', px: 4 }}>Unblock</Button>
          </Box>
        )}
      </Box>

      {/* Select Candidate Dialog */}
      <DialogModal open={_candidateList?.length > 0} onClose={() => _setCandidateList([])}
        title="Select Resident" maxWidth="md">
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: gray[100] }}>
                <TableCell sx={{ fontWeight: 600 }}></TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Branch Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date of Admission</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {_candidateList?.map((item: any, index: number) => (
                <TableRow key={index} sx={{ '&:hover': { backgroundColor: gray[50] } }}>
                  <TableCell>
                    {item?.CandidateDetails?.blackListed === "yes" ? (
                      <Button size="small" variant="contained" color="error" sx={{ textTransform: 'none' }}>Blocked</Button>
                    ) : (
                      <Button size="small" variant="outlined" color="secondary"
                        onClick={() => handleSelectCandidate(item?.candidateRefId)}
                        sx={{ textTransform: 'none' }}>Select</Button>
                    )}
                  </TableCell>
                  <TableCell>{item?.CandidateDetails?.name || "-"}</TableCell>
                  <TableCell>{item?.CandidateDetails?.email || "-"}</TableCell>
                  <TableCell>{item?.BranchDetails?.branchName || "-"}</TableCell>
                  <TableCell>{item?.dateOfAdmission ? moment(item?.dateOfAdmission)?.format('DD-MMM-YYYY') : "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogModal>
    </Box>
  );
}
