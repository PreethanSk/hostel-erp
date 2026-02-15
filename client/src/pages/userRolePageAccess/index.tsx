import { useEffect, useState } from "react";
import { CustomAlert, getExportEXCEL } from '../../services/HelperService';
import { Button, RadioGroup, FormControlLabel, Radio, Checkbox, Box, Typography, Divider, Chip, TextField, MenuItem } from "@mui/material";
import Grid2 from '@mui/material/Grid2';
import { getMasterPageList, getMasterUserRole, getRolePageAccess, insertUpdateUserRolePageAccess, insertUpdateMasterUserRole } from "../../models";
import { ArrowLeft, Plus } from 'lucide-react';
import PageHeader from "../../components/shared/PageHeader";
import FilterBar from "../../components/shared/FilterBar";
import DataTable, { Column } from "../../components/shared/DataTable";
import SearchInput from "../../components/shared/SearchInput";
import ExportButton from "../../components/shared/ExportButton";
import StatusBadge from "../../components/shared/StatusBadge";
import { gray } from "../../theme/tokens";

export default function Index({ PageAccess }: any) {
  const [_tableItems, _setTableItems] = useState<any>([]);
  const [_pageList, _setPageList] = useState<any>([]);
  const [_tableLoading, _setTableLoading] = useState(true);
  const [_loading, _setLoading] = useState(false);
  const [_search, _setSearch] = useState('');
  const [_addScreen, _setAddScreen] = useState(false);
  const [_roleList, _setRoleList] = useState<any>([]);
  const [_updatePageList, _setUpdatePageList] = useState<any>([]);

  const changePageAccess = (index: number, key: string, value: string) => {
    const _tempArr = [..._updatePageList];
    _tempArr[index][key] = value;
    _setUpdatePageList([..._tempArr]);
  };

  const getPrintTableHeadBody = () => {
    const header = ["S. No", "User Role", 'Page Access', "Status"];
    const body = _tableItems?.map((item: any, index: number) => [
      index + 1, item?.roleName,
      item?.pages?.filter((mItem: any) => mItem?.accessLevel === 'Read' || mItem?.accessLevel === 'Write')
        .map((mItem: any) => mItem?.pageName)?.filter(Boolean)?.join(', '),
      item?.roleStatus ? "Active" : "Inactive"
    ]);
    return { header, body };
  };

  const exportEXCEL = () => {
    const { header, body } = getPrintTableHeadBody();
    getExportEXCEL({ header, body, fileName: "User Role" });
  };

  const handleUpdateItem = (item: any) => {
    const tempArr: any = [];
    _pageList?.forEach((page: any) => {
      const findItem = item?.pages?.find((fItem: any) => fItem?.pageId === page?.id);
      tempArr.push({
        id: findItem?.id || 0, roleId: item?.roleId, pageId: page?.id,
        pageName: page?.pageName, accessLevel: findItem?.accessLevel || "No",
        isActive: findItem?.isActive || page?.isActive,
        roleStatus: item?.roleStatus !== false
      });
    });
    _setUpdatePageList([...tempArr]);
    _setAddScreen(true);
  };

  const handleGoBack = () => {
    _setAddScreen(false);
    _setLoading(false);
  };

  const handleSubmitForm = async () => {
    _setLoading(true);
    if (!_updatePageList?.length) { _setLoading(false); return; }

    const roleId = _updatePageList[0]?.roleId;
    const roleStatus = _updatePageList[0]?.roleStatus !== false;
    let roleUpdateSuccess = true;

    try {
      if (roleId) {
        const roleObj = _roleList.find((r: any) => r.id === roleId);
        if (roleObj && roleObj.isActive !== roleStatus) {
          const resp = await insertUpdateMasterUserRole({
            id: roleId, roleName: roleObj.roleName, isActive: roleStatus, notes: roleObj.notes || ""
          });
          if (!(resp?.data?.status === "success")) {
            roleUpdateSuccess = false;
            CustomAlert("warning", "Failed to update role status");
          }
        }
      }
    } catch {
      roleUpdateSuccess = false;
      CustomAlert("warning", "Failed to update role status");
    }

    if (roleUpdateSuccess) {
      insertUpdateUserRolePageAccess({ pages: _updatePageList })
        .then((resp) => {
          if (resp?.data?.status === "success") {
            getGridList();
            handleGoBack();
            CustomAlert("success", _updatePageList?.[0]?.id === 0 ? "Successfully saved" : "Successfully Updated");
            setTimeout(() => { location.reload(); }, 1000);
          } else {
            CustomAlert('warning', resp?.data?.error);
          }
        })
        .catch((err: any) => {
          if (err?.response?.data?.error?.name === "SequelizeUniqueConstraintError") {
            CustomAlert("warning", "Duplicates not allowed");
          }
        })
        .finally(() => _setLoading(false));
    } else {
      _setLoading(false);
    }
  };

  const getOtherList = () => {
    getMasterPageList()
      .then((resp) => { if (resp?.data?.status === "success") _setPageList(resp?.data?.result); })
      .catch(console.log);
    getMasterUserRole()
      .then((resp) => { if (resp?.data?.status === "success") _setRoleList(resp?.data?.result); })
      .catch(console.log);
  };

  const getGridList = () => {
    _setTableLoading(true);
    getRolePageAccess()
      .then((resp) => { if (resp?.data?.status === "success") _setTableItems(resp?.data?.result); })
      .catch(console.log)
      .finally(() => _setTableLoading(false));
  };

  const handleAddNew = () => {
    if (!_roleList?.length || !_pageList?.length) return;
    const defaultRoleId = _roleList[0]?.id;
    const tempArr = _pageList.map((page: any) => ({
      id: 0, roleId: defaultRoleId, pageId: page.id, pageName: page.pageName,
      accessLevel: "No", isActive: page.isActive, roleStatus: true
    }));
    _setUpdatePageList([...tempArr]);
    _setAddScreen(true);
  };

  useEffect(() => { getOtherList(); getGridList(); }, []);

  const filteredItems = _tableItems?.filter((content: any) => {
    const lowerSearchInput = _search?.toLowerCase()?.trim();
    return lowerSearchInput === '' || Object?.values(content)?.some((value: any) =>
      value?.toString()?.toLowerCase()?.includes(lowerSearchInput)
    );
  });

  const columns: Column<any>[] = [
    { id: 'sno', label: 'S.No', width: 60, render: (_row: any, index: number) => index + 1 },
    { id: 'role', label: 'Role', render: (row: any) => row?.roleName },
    {
      id: 'access', label: 'Screen Access',
      render: (row: any) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {row?.pages?.filter((mItem: any) => mItem?.accessLevel === 'Read' || mItem?.accessLevel === 'Write')
            .map((mItem: any) => (
              <Chip key={mItem?.pageId} label={mItem?.pageName} size="small"
                sx={{ backgroundColor: gray[100], fontSize: '12px' }} />
            ))}
        </Box>
      )
    },
    {
      id: 'status', label: 'Status', align: 'center', width: 100,
      render: (row: any) => <StatusBadge status={row?.roleStatus ? "Active" : "Inactive"} />
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
  if (!_addScreen) {
    return (
      <Box sx={{ p: 3 }}>
        <PageHeader title="Role Permissions" description="Configure page access levels per role">
          <Button variant="contained" startIcon={<Plus size={16} />} onClick={handleAddNew}
            sx={{ textTransform: 'none' }}>Add New</Button>
        </PageHeader>

        <FilterBar>
          <SearchInput value={_search} onChange={(value: string) => _setSearch(value)} placeholder="Search roles..." />
          <Box sx={{ flex: 1 }} />
          <ExportButton onExport={exportEXCEL} />
        </FilterBar>

        <DataTable
          columns={columns}
          data={filteredItems || []}
          loading={_tableLoading}
          totalCount={_tableItems?.length || 0}
          page={1}
          rowsPerPage={_tableItems?.length || 10}
          onPageChange={() => {}}
          onRowsPerPageChange={() => {}}
          emptyTitle="No roles configured"
          emptyDescription="Add a new role permission to get started."
        />
      </Box>
    );
  }

  // Permission Editor View
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ backgroundColor: gray[50], border: `1px solid ${gray[200]}`, borderRadius: 2, px: 4, py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2, borderBottom: `1px solid ${gray[200]}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => !_loading && handleGoBack()}>
            <ArrowLeft size={20} />
            <Typography sx={{ fontWeight: 600, ml: 1 }}>Back to List</Typography>
          </Box>
          <Button variant="contained" color="primary" disabled={_loading} onClick={handleSubmitForm}
            sx={{ textTransform: 'none', px: 4 }}>Save</Button>
        </Box>

        <Box sx={{ my: 3 }}>
          <Grid2 container spacing={3} sx={{ mb: 3 }}>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>User Role</Typography>
              <TextField select fullWidth size="small"
                value={_updatePageList[0]?.roleId || ''}
                onChange={(e) => {
                  const newRoleId = Number(e.target.value);
                  const updated = _updatePageList.map((item: any) => ({ ...item, roleId: newRoleId }));
                  _setUpdatePageList(updated);
                }}>
                {_roleList.map((role: any) => (
                  <MenuItem key={role.id} value={role.id}>{role.roleName}</MenuItem>
                ))}
              </TextField>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }} sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <FormControlLabel
                control={
                  <Checkbox checked={_updatePageList[0]?.roleStatus !== false}
                    onChange={(e) => {
                      const newStatus = e.target.checked;
                      const updated = _updatePageList.map((item: any) => ({ ...item, roleStatus: newStatus }));
                      _setUpdatePageList(updated);
                    }} />
                }
                label={_updatePageList[0]?.roleStatus !== false ? 'Active' : 'Inactive'} />
            </Grid2>
          </Grid2>

          <Box sx={{ border: `1px solid ${gray[200]}`, borderRadius: 1, overflow: 'hidden' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', backgroundColor: gray[100], px: 2, py: 1.5, borderBottom: `1px solid ${gray[200]}` }}>
              <Typography sx={{ fontWeight: 600, width: 200, flexShrink: 0 }}>Page</Typography>
              <Typography sx={{ fontWeight: 600 }}>Screen Access</Typography>
            </Box>
            {/* Rows */}
            {_updatePageList?.map((mItem: any, mIndex: number) => (
              <Box key={mIndex} sx={{
                display: 'flex', alignItems: 'center', px: 2, py: 1,
                borderBottom: mIndex < _updatePageList.length - 1 ? `1px solid ${gray[200]}` : 'none',
                '&:hover': { backgroundColor: gray[50] }
              }}>
                <Typography sx={{ width: 200, flexShrink: 0, fontSize: '14px' }}>{mItem?.pageName}</Typography>
                <RadioGroup row value={mItem?.accessLevel} sx={{ gap: 3 }}
                  onChange={(e) => changePageAccess(mIndex, "accessLevel", e.target.value)}>
                  <FormControlLabel value="Write"
                    control={<Radio size="small" />}
                    label={<Typography variant="body2">Read & Write</Typography>}
                    sx={{ border: `1px solid ${gray[300]}`, borderRadius: 1, pr: 2, m: 0 }} />
                  <FormControlLabel value="Read"
                    control={<Radio size="small" />}
                    label={<Typography variant="body2">Read Only</Typography>}
                    sx={{ border: `1px solid ${gray[300]}`, borderRadius: 1, pr: 2, m: 0 }} />
                  <FormControlLabel value="No"
                    control={<Radio size="small" />}
                    label={<Typography variant="body2">No Access</Typography>}
                    sx={{ border: `1px solid ${gray[300]}`, borderRadius: 1, pr: 2, m: 0 }} />
                </RadioGroup>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
