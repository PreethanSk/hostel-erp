import { useEffect, useState } from "react";
import { Button, Checkbox, FormControl, FormControlLabel, FormHelperText, MenuItem, Select, TextField, Box, Typography, Divider } from "@mui/material";
import Grid2 from '@mui/material/Grid2';
import { CustomAlert, DisableKeyUpDown, getExportEXCEL } from "../../services/HelperService";
import { getAdminUserList, getBranchGridList, getMasterUserRole, insertUpdateUserRegister } from "../../models";
import { validateEmail } from "../../services/ValidationService";
import { ArrowLeft, Plus, Check, X } from 'lucide-react';
import PageHeader from "../../components/shared/PageHeader";
import FilterBar from "../../components/shared/FilterBar";
import DataTable, { Column } from "../../components/shared/DataTable";
import SearchInput from "../../components/shared/SearchInput";
import ExportButton from "../../components/shared/ExportButton";
import StatusBadge from "../../components/shared/StatusBadge";
import FormField from "../../components/shared/FormField";
import { gray } from "../../theme/tokens";

export default function Index({ PageAccess }: any) {
  const [_userRoleList, _setUserRoleList] = useState<any>([]);
  const [_branchList, _setBranchList] = useState<any>([]);
  const [_tableItems, _setTableItems] = useState<any>([]);
  const [_tableTotalCount, _setTableTotalCount] = useState<any>(0);
  const [_tableLoading, _setTableLoading] = useState(true);
  const [_loading, _setLoading] = useState(false);
  const [_search, _setSearch] = useState('');
  const [_editForm, _setEditForm] = useState(false);
  const [_formData, _setFormData] = useState<any>({
    id: 0, branchId: 0, userRoleId: 0, firstName: '', lastName: '',
    emailAddress: '', mobileNumber: '', isActive: true
  });

  const validate = {
    branchId: { error: false, message: "" }, userRoleId: { error: false, message: "" },
    firstName: { error: false, message: "" }, lastName: { error: false, message: "" },
    emailAddress: { error: false, message: "" }, mobileNumber: { error: false, message: "" },
  };
  const [_validate, _setValidate] = useState(validate);

  const [_mobileValidationStatus, _setMobileValidationStatus] = useState<{
    isValid: boolean; message: string; isChecking: boolean;
  }>({ isValid: true, message: '', isChecking: false });

  const [_emailValidationStatus, _setEmailValidationStatus] = useState<{
    isValid: boolean; message: string; isChecking: boolean;
  }>({ isValid: true, message: '', isChecking: false });

  const [_page, _setPage] = useState(1);
  const [_rowsPerPage, _setRowsPerPage] = useState(10);

  const changeFormData = (key: string, value: any) => {
    _setFormData({ ..._formData, [key]: value });
  };

  const handleUpdateItem = (item: any) => {
    _setFormData({ ...item });
    _setEditForm(true);
  };

  const handleGoBack = () => {
    _setEditForm(false);
    handleClearForm();
  };

  const handleClearForm = () => {
    _setLoading(false);
    _setValidate(validate);
    _setFormData({ id: 0, branchId: 0, userRoleId: 0, firstName: '', lastName: '', emailAddress: '', mobileNumber: '', isActive: true });
    _setMobileValidationStatus({ isValid: true, message: '', isChecking: false });
    _setEmailValidationStatus({ isValid: true, message: '', isChecking: false });
  };

  const handleMobileNumberChange = (value: string) => {
    changeFormData('mobileNumber', value);
    if (!value.trim()) {
      _setMobileValidationStatus({ isValid: true, message: '', isChecking: false });
      return;
    }
    const countryCodePattern = /^\+\d{1,2}\s?\d{10}$/;
    const tenDigitPattern = /^\d{10}$/;
    if (!countryCodePattern.test(value) && !tenDigitPattern.test(value)) {
      _setMobileValidationStatus({
        isValid: false,
        message: 'Mobile number must be 10 digits OR +country code + 10 digits (e.g., +91 9876543210)',
        isChecking: false
      });
      return;
    }
    _setMobileValidationStatus({ isValid: true, message: '', isChecking: false });
  };

  const handleEmailChange = (value: string) => {
    changeFormData('emailAddress', value);
    if (!value.trim()) {
      _setEmailValidationStatus({ isValid: true, message: '', isChecking: false });
      return;
    }
    if (!validateEmail(value)) {
      _setEmailValidationStatus({
        isValid: false,
        message: 'Please enter a valid email address (e.g., something@example.com)',
        isChecking: false
      });
      return;
    }
    _setEmailValidationStatus({ isValid: true, message: '', isChecking: false });
  };

  const checkValidation = () => {
    let valid = true;
    const validation = { ...validate };
    if (!_formData?.firstName?.trim()) { validation.firstName = { error: true, message: "Required Field" }; valid = false; }
    if (!_formData?.lastName?.trim()) { validation.lastName = { error: true, message: "Required Field" }; valid = false; }
    if (!_formData?.emailAddress?.trim()) { validation.emailAddress = { error: true, message: "Required Field" }; valid = false; }
    if (!_formData?.mobileNumber?.trim()) { validation.mobileNumber = { error: true, message: "Required Field" }; valid = false; }
    if (_formData?.emailAddress?.trim() && !_emailValidationStatus.isValid) {
      validation.emailAddress = { error: true, message: _emailValidationStatus.message || "Invalid Email" }; valid = false;
    }
    if (_formData?.mobileNumber?.trim() && !_mobileValidationStatus.isValid) {
      validation.mobileNumber = { error: true, message: _mobileValidationStatus.message || "Invalid Mobile Number" }; valid = false;
    }
    _setValidate(validation);
    return valid;
  };

  const handleSubmitForm = () => {
    _setLoading(true);
    if (!checkValidation()) { _setLoading(false); return; }
    const body = {
      id: _formData?.id || 0, branchId: _formData?.branchId || 0,
      userRoleId: _formData?.userRoleId || 0, firstName: _formData?.firstName || "",
      lastName: _formData?.lastName || "", emailAddress: _formData?.emailAddress || "",
      mobileNumber: _formData?.mobileNumber || "", isActive: _formData?.isActive || false,
    };
    insertUpdateUserRegister(body)
      .then((resp) => {
        if (resp?.data?.status === "success") {
          getGridList();
          handleGoBack();
          CustomAlert("success", "Successfully Updated");
        }
      })
      .catch(console.log)
      .finally(() => _setLoading(false));
  };

  const getPrintTableHeadBody = () => {
    const header = ["S. No", "User Name", "Branch Name", "Role Type", "Email", "Status"];
    const body = _tableItems?.map((item: any, index: number) => [
      index + 1, item?.fullName, item?.branchName, item?.roleName, item?.emailAddress,
      item?.isActive ? "Active" : "Inactive"
    ]);
    return { header, body };
  };

  const exportEXCEL = () => {
    const { header, body } = getPrintTableHeadBody();
    getExportEXCEL({ header, body, fileName: "User List" });
  };

  const getGridList = () => {
    _setTableLoading(true);
    getAdminUserList()
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
    getMasterUserRole()
      .then((resp) => { if (resp?.data?.status === "success") _setUserRoleList([...resp?.data?.result]); })
      .catch(console.log);
    getBranchGridList()
      .then((resp) => { if (resp?.data?.status === "success") _setBranchList([...resp?.data?.result?.results]); })
      .catch(console.log);
  };

  useEffect(() => { getGridList(); getOtherList(); }, []);

  const filteredItems = _tableItems?.filter((content: any) => {
    const lowerSearchInput = _search?.toLowerCase()?.trim();
    return lowerSearchInput === '' || Object?.values(content)?.some((value: any) =>
      value?.toString()?.toLowerCase()?.includes(lowerSearchInput)
    );
  });

  const columns: Column<any>[] = [
    { id: 'sno', label: 'S.No', width: 60, render: (_row: any, index: number) => (index + 1) + ((_page - 1) * _rowsPerPage) },
    { id: 'name', label: 'User Name', render: (row: any) => row?.fullName },
    { id: 'branch', label: 'Branch Name', render: (row: any) => row?.branchName },
    { id: 'role', label: 'Role Type', render: (row: any) => row?.roleName },
    { id: 'email', label: 'Email', render: (row: any) => row?.emailAddress },
    {
      id: 'status', label: 'Status', align: 'center', width: 100,
      render: (row: any) => <StatusBadge status={row?.isActive ? "Active" : "Inactive"} />
    },
    {
      id: 'action', label: 'Action', align: 'center', width: 80,
      render: (row: any) => PageAccess === 'Write' ? (
        <Button size="small" onClick={() => handleUpdateItem(row)} sx={{ textTransform: 'none', fontSize: '13px', color: gray[600] }}>Edit</Button>
      ) : null
    },
  ];

  // List View
  if (!_editForm) {
    return (
      <Box sx={{ p: 3 }}>
        <PageHeader title="User Directory" description="Manage admin and manager accounts">
          {PageAccess === 'Write' && (
            <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => _setEditForm(true)}
              sx={{ textTransform: 'none' }}>Add New</Button>
          )}
        </PageHeader>

        <FilterBar>
          <SearchInput value={_search} onChange={(value: string) => _setSearch(value)} placeholder="Search users..." />
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
          onRowsPerPageChange={(s) => _setRowsPerPage(s)}
          emptyTitle="No users found"
          emptyDescription="Add a new user to get started."
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
              <FormField label="First Name" required error={_validate?.firstName?.error ? _validate?.firstName?.message : undefined}>
                <TextField fullWidth size="small"
                  value={_formData?.firstName} onChange={(e: any) => changeFormData('firstName', e.target.value)}
                  error={_validate?.firstName?.error} />
              </FormField>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <FormField label="Last Name" required error={_validate?.lastName?.error ? _validate?.lastName?.message : undefined}>
                <TextField fullWidth size="small"
                  value={_formData?.lastName} onChange={(e: any) => changeFormData('lastName', e.target.value)}
                  error={_validate?.lastName?.error} />
              </FormField>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <FormField label="Role Type">
                <FormControl fullWidth error={_validate?.userRoleId?.error}>
                  <Select size="small" value={_formData?.userRoleId} onChange={(e: any) => changeFormData('userRoleId', e.target.value)}>
                    <MenuItem value={0} disabled>Select</MenuItem>
                    {_userRoleList?.map((mItem: any) =>
                      mItem?.isActive && <MenuItem key={mItem?.id} value={mItem?.id}>{mItem?.roleName}</MenuItem>
                    )}
                  </Select>
                  {_validate?.userRoleId?.message && <FormHelperText>{_validate?.userRoleId?.message}</FormHelperText>}
                </FormControl>
              </FormField>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <FormField label="Branch">
                <FormControl fullWidth>
                  <Select size="small" value={_formData?.branchId} onChange={(e: any) => changeFormData('branchId', e.target.value)}>
                    <MenuItem value={0} disabled>Select</MenuItem>
                    {_branchList?.map((mItem: any) =>
                      mItem?.isActive && <MenuItem key={mItem?.id} value={mItem?.id}>{mItem?.branchName}</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </FormField>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <FormField label="Mobile Number" required error={_validate?.mobileNumber?.error ? _validate?.mobileNumber?.message : undefined}>
                <TextField fullWidth size="small" type="text" onKeyDown={DisableKeyUpDown}
                  value={_formData?.mobileNumber} onChange={(e: any) => handleMobileNumberChange(e.target.value)}
                  slotProps={{
                    input: {
                      endAdornment: _formData?.mobileNumber ? (
                        _mobileValidationStatus.isValid
                          ? <Check size={16} color="#4caf50" />
                          : <X size={16} color="#f44336" />
                      ) : null
                    }
                  }}
                  error={_validate?.mobileNumber?.error} />
              </FormField>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <FormField label="Email Address" required error={_validate?.emailAddress?.error ? _validate?.emailAddress?.message : undefined}>
                <TextField fullWidth size="small"
                  value={_formData?.emailAddress} onChange={(e: any) => handleEmailChange(e.target.value)}
                  slotProps={{
                    input: {
                      endAdornment: _formData?.emailAddress ? (
                        _emailValidationStatus.isValid
                          ? <Check size={16} color="#4caf50" />
                          : <X size={16} color="#f44336" />
                      ) : null
                    }
                  }}
                  error={_validate?.emailAddress?.error} />
              </FormField>
            </Grid2>
          </Grid2>
        </Box>

        <Divider />

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2, py: 2 }}>
          <FormControlLabel label="Active"
            control={<Checkbox checked={_formData?.isActive} onChange={() => changeFormData('isActive', !_formData?.isActive)} />} />
          <Button variant="contained" color="primary" disabled={_loading} onClick={handleSubmitForm}
            sx={{ textTransform: 'none', px: 4 }}>{_formData?.id ? 'Update' : 'Save'}</Button>
          <Button variant="outlined" onClick={handleClearForm}
            sx={{ textTransform: 'none', px: 4, color: 'black', borderColor: gray[300] }}>Clear</Button>
        </Box>
      </Box>
    </Box>
  );
}
