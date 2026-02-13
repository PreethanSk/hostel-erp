import { useEffect, useState } from "react";
import { Button, Checkbox, FormControl, FormControlLabel, MenuItem, Select, TextField, ListItemText, Box, Typography, Divider } from "@mui/material";
import Grid2 from '@mui/material/Grid2';
import { CustomAlert, DisableKeyUpDown, getExportEXCEL } from "../../services/HelperService";
import { getServiceProvider, getServiceProviderCategory, insertUpdateServiceProvider } from "../../models";
import { ArrowLeft, Plus } from 'lucide-react';
import PageHeader from "../../components/shared/PageHeader";
import FilterBar from "../../components/shared/FilterBar";
import DataTable, { Column } from "../../components/shared/DataTable";
import SearchInput from "../../components/shared/SearchInput";
import ExportButton from "../../components/shared/ExportButton";
import StatusBadge from "../../components/shared/StatusBadge";
import FormField from "../../components/shared/FormField";
import { gray } from "../../theme/tokens";

export default function Index({ PageAccess }: any) {
  const [_categoryList, _setCategoryList] = useState<any>([]);
  const [_allData, _setAllData] = useState<any>([]);
  const [_tableItems, _setTableItems] = useState<any>([]);
  const [_tableLoading, _setTableLoading] = useState(true);
  const [_loading, _setLoading] = useState(false);
  const [_search, _setSearch] = useState('');
  const [_categoryId, _setCategoryId] = useState<any>('');
  const [_type, _setType] = useState<any>('');
  const [_page, _setPage] = useState(1);
  const [_rowsPerPage, _setRowsPerPage] = useState(10);
  const [_editForm, _setEditForm] = useState(false);
  const [_formData, _setFormData] = useState<any>({
    id: 0, name: '', mobile: '', email: '', categories: '', type: 'External',
    companyName: '', address: '', gstNumber: '', contactPerson: '', rating: '', isActive: true
  });

  const validate = { name: { error: false, message: "" }, mobile: { error: false, message: "" } };
  const [_validate, _setValidate] = useState(validate);

  const changeFormData = (key: string, value: any) => {
    _setFormData({ ..._formData, [key]: value });
  };

  const handleUpdateItem = (item: any) => {
    _setFormData({
      id: item?.id || 0, name: item?.name || '', mobile: item?.mobile || '', email: item?.email || '',
      categories: item?.categories || '', type: item?.type || 'External', companyName: item?.companyName || '',
      address: item?.address || '', gstNumber: item?.gstNumber || '', contactPerson: item?.contactPerson || '',
      rating: item?.rating || '', isActive: item?.isActive !== undefined ? item?.isActive : true
    });
    _setEditForm(true);
  };

  const handleGoBack = () => {
    _setEditForm(false);
    handleClearForm();
  };

  const handleClearForm = () => {
    _setLoading(false);
    _setValidate(validate);
    _setFormData({
      id: 0, name: '', mobile: '', email: '', categories: '', type: 'External',
      companyName: '', address: '', gstNumber: '', contactPerson: '', rating: '', isActive: true
    });
  };

  const checkValidation = () => {
    let valid = true;
    const validation = { ...validate };
    if (!_formData?.name?.trim()) { validation.name = { error: true, message: "Required Field" }; valid = false; }
    if (!_formData?.mobile?.trim()) {
      validation.mobile = { error: true, message: "Required Field" }; valid = false;
    } else {
      const mobileDigits = _formData.mobile.replace(/\D/g, '');
      if (mobileDigits.length < 10 || mobileDigits.length > 15) {
        validation.mobile = { error: true, message: "Mobile number must be between 10 and 15 digits" }; valid = false;
      }
    }
    _setValidate(validation);
    return valid;
  };

  const handleSubmitForm = () => {
    _setLoading(true);
    if (!checkValidation()) { _setLoading(false); return; }
    const body = {
      id: _formData?.id || 0, name: _formData?.name?.trim() || '',
      mobile: _formData?.mobile?.replace(/\D/g, '') || '', email: _formData?.email || '',
      categories: _formData?.categories || '', type: _formData?.type || "External",
      companyName: _formData?.companyName || '', address: _formData?.address || '',
      gstNumber: _formData?.gstNumber || '', contactPerson: _formData?.contactPerson || '',
      rating: _formData?.rating || '', isActive: _formData?.isActive ? 1 : 0,
    };
    insertUpdateServiceProvider(body)
      .then((resp) => {
        if (resp?.data?.status === "success") {
          getGridList();
          handleGoBack();
          CustomAlert("success", body.id === 0 ? "Successfully saved" : "Successfully Updated");
        } else { CustomAlert('warning', resp?.data?.error || 'Failed to save'); }
      })
      .catch(() => CustomAlert('error', 'Error saving service provider'))
      .finally(() => _setLoading(false));
  };

  const getPrintTableHeadBody = () => {
    const header = ["S. No", "Name", "Mobile", "Email", "Company Name", "Contact Person", "Categories", "Type", "Rating", "Status"];
    const body = _allData?.map((item: any, index: number) => [
      index + 1, item?.name || "-", item?.mobile || "-", item?.email || "-",
      item?.companyName || "-", item?.contactPerson || "-", item?.categoryNames || "-",
      item?.type || "-", item?.rating || "-", item?.isActive ? "Active" : "Inactive"
    ]);
    return { header, body };
  };

  const exportEXCEL = () => {
    const { header, body } = getPrintTableHeadBody();
    getExportEXCEL({ header, body, fileName: "Service Provider List" });
  };

  const getGridList = () => {
    _setTableLoading(true);
    const formData = { search: _search || '', categoryId: _categoryId || '', type: _type || '' };
    getServiceProvider(formData)
      .then((resp) => {
        if (resp?.data?.status === "success") _setAllData(resp?.data?.result?.data || []);
        else CustomAlert('warning', resp?.data?.error || 'Failed to load data');
      })
      .catch(() => CustomAlert('error', 'Error loading service providers'))
      .finally(() => _setTableLoading(false));
  };

  const getCategoryList = () => {
    getServiceProviderCategory()
      .then((resp) => { if (resp?.data?.status === "success") _setCategoryList([...resp?.data?.result]); })
      .catch(console.log);
  };

  // Client-side pagination
  useEffect(() => {
    const startIndex = (_page - 1) * _rowsPerPage;
    const endIndex = startIndex + _rowsPerPage;
    _setTableItems(_allData?.slice(startIndex, endIndex) || []);
  }, [_allData, _page, _rowsPerPage]);

  useEffect(() => { getGridList(); }, [_search, _categoryId, _type]);
  useEffect(() => { getCategoryList(); }, []);

  const columns: Column<any>[] = [
    { id: 'sno', label: 'S.No', width: 60, render: (_row: any, index: number) => (index + 1) + ((_page - 1) * _rowsPerPage) },
    { id: 'name', label: 'Name', render: (row: any) => row?.name || "-" },
    { id: 'mobile', label: 'Mobile', render: (row: any) => row?.mobile || "-" },
    { id: 'email', label: 'Email', render: (row: any) => row?.email || "-" },
    { id: 'company', label: 'Company', render: (row: any) => row?.companyName || "-" },
    { id: 'contact', label: 'Contact Person', render: (row: any) => row?.contactPerson || "-" },
    { id: 'categories', label: 'Categories', render: (row: any) => row?.categoryNames || "-" },
    { id: 'type', label: 'Type', render: (row: any) => row?.type || "-" },
    { id: 'rating', label: 'Rating', render: (row: any) => row?.rating || "-" },
    {
      id: 'status', label: 'Status', align: 'center', width: 100,
      render: (row: any) => <StatusBadge status={row?.isActive ? "Active" : "Inactive"} />
    },
    {
      id: 'action', label: 'Action', align: 'center', width: 80,
      render: (row: any) => (
        <Button size="small" onClick={() => handleUpdateItem(row)}
          sx={{ textTransform: 'none', fontSize: '13px', color: gray[600] }}>Edit</Button>
      )
    },
  ];

  // List View
  if (!_editForm) {
    return (
      <Box sx={{ p: 3 }}>
        <PageHeader title="Service Providers" description="Manage internal and external workers">
          {PageAccess === 'Write' && (
            <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => _setEditForm(true)}
              sx={{ textTransform: 'none' }}>Add New</Button>
          )}
        </PageHeader>

        <FilterBar>
          <TextField select size="small" value={_categoryId} onChange={(e: any) => { _setCategoryId(e.target.value); _setPage(1); }}
            sx={{ minWidth: 180 }} label="Category">
            <MenuItem value="">All Categories</MenuItem>
            {_categoryList?.map((item: any) =>
              item?.isActive && <MenuItem key={item?.id} value={item?.id}>{item?.name}</MenuItem>
            )}
          </TextField>
          <TextField select size="small" value={_type} onChange={(e: any) => { _setType(e.target.value); _setPage(1); }}
            sx={{ minWidth: 150 }} label="Type">
            <MenuItem value="">All Types</MenuItem>
            <MenuItem value="External">External</MenuItem>
            <MenuItem value="Internal">Internal</MenuItem>
          </TextField>
          <SearchInput value={_search} onChange={(value: string) => { _setSearch(value); _setPage(1); }} placeholder="Search providers..." />
          <Box sx={{ flex: 1 }} />
          <ExportButton onExport={exportEXCEL} />
        </FilterBar>

        <DataTable
          columns={columns}
          data={_tableItems || []}
          loading={_tableLoading}
          totalCount={_allData?.length || 0}
          page={_page}
          rowsPerPage={_rowsPerPage}
          onPageChange={(p) => _setPage(p)}
          onRowsPerPageChange={(s) => { _setRowsPerPage(s); _setPage(1); }}
          emptyTitle="No service providers found"
          emptyDescription="Add a new service provider to get started."
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

        <Box sx={{ my: 3 }}>
          <Grid2 container spacing={3}>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <FormField label="Name" required error={_validate?.name?.error ? _validate?.name?.message : undefined}>
                <TextField fullWidth size="small"
                  value={_formData?.name} onChange={(e: any) => changeFormData('name', e.target.value)}
                  error={_validate?.name?.error} />
              </FormField>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <FormField label="Mobile" required error={_validate?.mobile?.error ? _validate?.mobile?.message : undefined}>
                <TextField fullWidth size="small" type="text" onKeyDown={DisableKeyUpDown}
                  value={_formData?.mobile} onChange={(e: any) => changeFormData('mobile', e.target.value)}
                  error={_validate?.mobile?.error} />
              </FormField>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <FormField label="Email">
                <TextField fullWidth size="small"
                  value={_formData?.email || ""} onChange={(e: any) => changeFormData('email', e.target.value)} />
              </FormField>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <FormField label="Type">
                <Select fullWidth size="small" value={_formData?.type} onChange={(e: any) => changeFormData('type', e.target.value)}>
                  <MenuItem value="External">External</MenuItem>
                  <MenuItem value="Internal">Internal</MenuItem>
                </Select>
              </FormField>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <FormField label="Categories">
                <Select fullWidth size="small" multiple
                  value={_formData?.categories ? _formData.categories.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id)) : []}
                  onChange={(e: any) => {
                    const selectedIds = e.target.value;
                    changeFormData('categories', Array.isArray(selectedIds) ? selectedIds.join(',') : '');
                  }}
                  renderValue={(selected: any) => {
                    if (!selected || selected.length === 0) return 'Select Categories';
                    return selected.map((id: number) => {
                      const category = _categoryList.find((cat: any) => cat.id === id);
                      return category ? category.name : '';
                    }).filter(Boolean).join(', ');
                  }}
                  MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}>
                  {_categoryList?.map((item: any) =>
                    item?.isActive && (
                      <MenuItem key={item?.id} value={item?.id}>
                        <Checkbox checked={_formData?.categories ? _formData.categories.split(',').map((id: string) => parseInt(id.trim())).includes(item?.id) : false} />
                        <ListItemText primary={item?.name} />
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormField>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <FormField label="Company Name">
                <TextField fullWidth size="small"
                  value={_formData?.companyName || ""} onChange={(e: any) => changeFormData('companyName', e.target.value)} />
              </FormField>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <FormField label="Contact Person">
                <TextField fullWidth size="small"
                  value={_formData?.contactPerson || ""} onChange={(e: any) => changeFormData('contactPerson', e.target.value)} />
              </FormField>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <FormField label="GST Number">
                <TextField fullWidth size="small"
                  value={_formData?.gstNumber || ""} onChange={(e: any) => changeFormData('gstNumber', e.target.value)} />
              </FormField>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <FormField label="Rating">
                <TextField fullWidth size="small" type="number"
                  value={_formData?.rating || ""} onChange={(e: any) => changeFormData('rating', e.target.value)} />
              </FormField>
            </Grid2>
            <Grid2 size={12}>
              <FormField label="Address">
                <TextField fullWidth size="small" multiline rows={3}
                  value={_formData?.address || ""} onChange={(e: any) => changeFormData('address', e.target.value)} />
              </FormField>
            </Grid2>
          </Grid2>
        </Box>

        <Divider />

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2, py: 2 }}>
          <FormControlLabel label="Active"
            control={<Checkbox checked={_formData?.isActive} onChange={() => changeFormData('isActive', !_formData?.isActive)} />} />
          <Button variant="contained" color="primary" disabled={_loading} onClick={handleSubmitForm}
            sx={{ textTransform: 'none', px: 4 }}>Save</Button>
          <Button variant="outlined" onClick={handleGoBack}
            sx={{ textTransform: 'none', px: 4, color: 'black', borderColor: gray[300] }}>Back</Button>
        </Box>
      </Box>
    </Box>
  );
}
