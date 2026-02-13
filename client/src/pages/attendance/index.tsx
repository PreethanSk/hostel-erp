import { useEffect, useState } from "react";
import { Button, TextField, Box, Typography, Divider } from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import { CustomAlert, getExportEXCEL } from '../../services/HelperService';
import { getCandidateAdmissionById, getCandidateAttendanceGridList } from '../../models';
import { useStateValue } from "../../providers/StateProvider";
import { ArrowLeft, Plus, Eye } from 'lucide-react';
import PageHeader from "../../components/shared/PageHeader";
import FilterBar from "../../components/shared/FilterBar";
import DataTable, { Column } from "../../components/shared/DataTable";
import SearchInput from "../../components/shared/SearchInput";
import ExportButton from "../../components/shared/ExportButton";
import FormField from "../../components/shared/FormField";
import { gray } from "../../theme/tokens";

export default function Index() {
  const [{ user }]: any = useStateValue();
  const [_tableItems, _setTableItems] = useState<any>([]);
  const [_tableTotalCount, _setTableTotalCount] = useState(0);
  const [_tableLoading, _setTableLoading] = useState(true);
  const [_loading, _setLoading] = useState(false);
  const [_search, _setSearch] = useState('');
  const [_view, _setView] = useState(false);
  const [_editForm, _setEditForm] = useState(false);
  const [_formData, _setFormData] = useState<any>({ id: 0 });
  const [_page, _setPage] = useState(1);
  const [_rowsPerPage, _setRowsPerPage] = useState(10);
  const [_notes, _setNotes] = useState('');

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
    _setLoading(false);
    _setEditForm(false);
    _setNotes('');
    _setFormData({ id: 0 });
  };

  const getPrintTableHeadBody = () => {
    const header = ["S. No", "Resident Name", "Status"];
    const body = _tableItems?.map((item: any, index: number) => [index + 1, item?.name, item?.isActive]);
    return { header, body };
  };

  const exportEXCEL = () => {
    const { header, body } = getPrintTableHeadBody();
    getExportEXCEL({ header, body, fileName: "Attendance" });
  };

  const handleViewCandidate = (item: any) => {
    _setEditForm(true);
    _setView(true);
    handleSelectCandidate(item);
  };

  const handleSelectCandidate = (item: any) => {
    getCandidateAdmissionById(item?.id)
      .then((resp) => {
        if (resp?.data?.status === "success") {
          const data = resp?.data?.result?.length ? resp?.data?.result[0] : { ...resp?.data?.result };
          _setFormData({
            ..._formData, ...item,
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
    getCandidateAttendanceGridList(_page, _rowsPerPage)
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
    { id: 'location', label: 'Location', render: (row: any) => row?.location || "-" },
    { id: 'candidateId', label: 'Resident ID', render: (row: any) => row?.candidateId || "-" },
    { id: 'name', label: 'Resident Name', render: (row: any) => row?.candidateName || "-" },
    { id: 'mobile', label: 'Mobile No', render: (row: any) => row?.mobileNumber || "-" },
    { id: 'outDate', label: 'Out Date', render: (row: any) => row?.date || "-" },
    { id: 'outTime', label: 'Out Time', render: (row: any) => row?.outTime || "-" },
    { id: 'inDate', label: 'In Date', render: (row: any) => row?.date || "-" },
    { id: 'inTime', label: 'In Time', render: (row: any) => row?.inTime || "-" },
  ];

  // List View
  if (!_editForm) {
    return (
      <Box sx={{ p: 3 }}>
        <PageHeader title="Attendance" description="Track resident check-in and check-out">
          <Button variant="contained" startIcon={<Plus size={16} />} onClick={handleAddNew}
            sx={{ textTransform: 'none' }}>Add New</Button>
        </PageHeader>

        <FilterBar>
          <SearchInput value={_search} onChange={(value: string) => _setSearch(value)} placeholder="Search attendance..." />
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
          emptyTitle="No attendance records found"
          emptyDescription="No attendance data available."
        />
      </Box>
    );
  }

  // Edit/View Form
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ backgroundColor: gray[50], border: `1px solid ${gray[200]}`, borderRadius: 2, px: 4, py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', py: 2, borderBottom: `1px solid ${gray[200]}`, cursor: 'pointer' }}
          onClick={handleGoBack}>
          <ArrowLeft size={20} />
          <Typography sx={{ fontWeight: 600, ml: 1 }}>Back</Typography>
        </Box>

        <Box sx={{ backgroundColor: 'white', my: 3, p: 2, borderRadius: 1 }}>
          {_formData?.id ? (
            <Grid2 container spacing={3}>
              <Grid2 size={{ xs: 12, md: 3 }}>
                <FormField label="Resident ID">
                  <TextField fullWidth size="small" value={_formData?.candidateId || ''}
                    slotProps={{ input: { readOnly: true } }} />
                </FormField>
              </Grid2>
              <Grid2 size={{ xs: 12, md: 3 }}>
                <FormField label="Name">
                  <TextField fullWidth size="small" value={_formData?.name || ''}
                    slotProps={{ input: { readOnly: true } }} />
                </FormField>
              </Grid2>
              <Grid2 size={{ xs: 12, md: 3 }}>
                <FormField label="Mobile Number">
                  <TextField fullWidth size="small" value={_formData?.mobileNumber || ''}
                    slotProps={{ input: { readOnly: true } }} />
                </FormField>
              </Grid2>
              <Grid2 size={{ xs: 12, md: 3 }}>
                <FormField label="Email">
                  <TextField fullWidth size="small" value={_formData?.email || ''}
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
            </Grid2>
          ) : null}
        </Box>

        {!_view && (
          <Box>
            <Typography variant="body2" sx={{ color: gray[500], mb: 1 }}>Branch</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid2 container spacing={3} sx={{ alignItems: 'center', mb: 2 }}>
              <Grid2 size={{ xs: 12, md: 8 }}>
                <TextField size="small" fullWidth placeholder="Add Notes"
                  value={_notes} onChange={(e) => _setNotes(e.target.value)} />
              </Grid2>
              <Grid2 size={{ xs: 12, md: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
                  <Button variant="contained" color="primary" disabled={_loading || !_formData?.id}
                    sx={{ textTransform: 'none', px: 4 }}>Save</Button>
                  <Button variant="outlined" onClick={handleClearForm}
                    sx={{ textTransform: 'none', px: 4, color: 'black', borderColor: gray[300] }}>Clear</Button>
                </Box>
              </Grid2>
            </Grid2>
          </Box>
        )}
      </Box>
    </Box>
  );
}
