import { useEffect, useState } from "react";
import { Button, Box, Tabs, Tab, LinearProgress } from '@mui/material';
import { getExportEXCEL } from '../../services/HelperService';
import BranchAmenities from './components/branchAmenities';
import BranchDetails from './components/branchDetails';
import BranchRoomsAndCots from './components/roomsAndCots';
import BranchPhotos from './components/branchPhotos';
import { getBranchGridList } from '../../models';
import { useStateValue } from "../../providers/StateProvider";
import { ArrowLeft, Plus } from 'lucide-react';
import PageHeader from "../../components/shared/PageHeader";
import FilterBar from "../../components/shared/FilterBar";
import DataTable, { Column } from "../../components/shared/DataTable";
import SearchInput from "../../components/shared/SearchInput";
import ExportButton from "../../components/shared/ExportButton";
import StatusBadge from "../../components/shared/StatusBadge";
import { gray } from "../../theme/tokens";
import { Typography } from "@mui/material";

export default function Index({ PageAccess }: any) {
  const [{ }, dispatch]: any = useStateValue();
  const [_tableItems, _setTableItems] = useState<any>([]);
  const [_tableTotalCount, _setTableTotalCount] = useState(0);
  const [_tableLoading, _setTableLoading] = useState(true);
  const [_loading, _setLoading] = useState(false);
  const [_search, _setSearch] = useState('');
  const [_editForm, _setEditForm] = useState(false);
  const [_selectedTab, _setSelectedTab] = useState(1);
  const [_page, _setPage] = useState(1);
  const [_rowsPerPage, _setRowsPerPage] = useState(10);

  const handleUpdateItem = (item: any) => {
    _setEditForm(true);
    dispatch({ type: "SET_BRANCH_DETAILS", data: { branchDetails: { ...item }, edit: true } });
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
    dispatch({ type: "SET_BRANCH_DETAILS", data: null });
    getGridList();
    _setSelectedTab(1);
    _setLoading(false);
    _setEditForm(false);
  };

  const getPrintTableHeadBody = () => {
    const header = ["S. No", "Branch Name", "Status", "Total Beds", "Beds Vacant", "Beds Occupied", "Contact Person Name", "Mobile Number"];
    const body = _tableItems?.map((item: any, index: number) => [
      index + 1, item?.branchName, item?.isActive ? "Active" : "Inactive",
      item?.totalCots?.split(',').filter(Boolean)?.length || 0,
      item?.cotVacant?.split(',').filter(Boolean)?.length || 0,
      item?.cotOccupied?.split(',').filter(Boolean)?.length || 0,
      item?.contactPerson, item?.mobileNumber
    ]);
    return { header, body };
  };

  const exportEXCEL = () => {
    const { header, body } = getPrintTableHeadBody();
    getExportEXCEL({ header, body, fileName: "Branch" });
  };

  const getGridList = () => {
    _setTableLoading(true);
    getBranchGridList(_page, _rowsPerPage)
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
      id: 'status', label: 'Status', align: 'center', width: 100,
      render: (row: any) => <StatusBadge status={row?.isActive ? "Active" : "Inactive"} />
    },
    {
      id: 'action', label: 'Action', align: 'center', width: 100,
      render: (row: any) => PageAccess === 'Write' ? (
        <Button size="small" onClick={() => handleUpdateItem(row)} sx={{ textTransform: 'none', fontSize: '13px', color: gray[600] }}>Edit</Button>
      ) : null
    },
    { id: 'branch', label: 'Branch', render: (row: any) => row?.branchName },
    { id: 'totalBeds', label: 'Total Beds', render: (row: any) => row?.totalCots?.split(',').filter(Boolean)?.length || 0 },
    { id: 'bedsVacant', label: 'Beds Vacant', render: (row: any) => row?.cotVacant?.split(',').filter(Boolean)?.length || 0 },
    { id: 'bedsOccupied', label: 'Beds Occupied', render: (row: any) => row?.cotOccupied?.split(',').filter(Boolean)?.length || 0 },
    { id: 'contact', label: 'Contact Person Name', render: (row: any) => row?.contactPerson },
    { id: 'mobile', label: 'Mobile Number', render: (row: any) => row?.mobileNumber },
  ];

  if (!_editForm) {
    return (
      <Box sx={{ p: 3 }}>
        <PageHeader title="Branch">
          {PageAccess === 'Write' && (
            <Button variant="contained" startIcon={<Plus size={16} />} onClick={handleAddNew}
              sx={{ textTransform: 'none' }}>Add New</Button>
          )}
        </PageHeader>

        <FilterBar>
          <SearchInput value={_search} onChange={(value: string) => _setSearch(value)} placeholder="Search branches..." />
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
          emptyTitle="No branches found"
          emptyDescription="Add a new branch to get started."
        />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ backgroundColor: gray[50], border: `1px solid ${gray[200]}`, borderRadius: 2, px: 4, py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', py: 2, borderBottom: `1px solid ${gray[200]}`, cursor: 'pointer' }}
          onClick={handleGoBack}>
          <ArrowLeft size={20} />
          <Typography sx={{ fontWeight: 600, ml: 1 }}>Back</Typography>
        </Box>
        <Box sx={{ backgroundColor: '#fff', my: 3 }}>
          <Tabs value={false} selectionFollowsFocus={false} variant="scrollable" scrollButtons allowScrollButtonsMobile={false}
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 3, width: '100%' }}>
            <Tab onClick={() => _setSelectedTab(1)} sx={{ flex: 1 }} label={
              <Typography sx={{ fontWeight: 600, color: _selectedTab === 1 ? gray[900] : _selectedTab > 1 ? 'primary.main' : gray[500] }}>Branch Details</Typography>
            } />
            <Tab onClick={() => _setSelectedTab(2)} sx={{ flex: 1 }} label={
              <Typography sx={{ fontWeight: 600, color: _selectedTab === 2 ? gray[900] : _selectedTab > 2 ? 'primary.main' : gray[500] }}>Photos</Typography>
            } />
            <Tab onClick={() => _setSelectedTab(3)} sx={{ flex: 1 }} label={
              <Typography sx={{ fontWeight: 600, color: _selectedTab === 3 ? gray[900] : _selectedTab > 3 ? 'primary.main' : gray[500] }}>Room & Beds</Typography>
            } />
            <Tab onClick={() => _setSelectedTab(4)} sx={{ flex: 1 }} label={
              <Typography sx={{ fontWeight: 600, color: _selectedTab === 4 ? gray[900] : _selectedTab > 4 ? 'primary.main' : gray[500] }}>Amenities</Typography>
            } />
          </Tabs>
          <Box sx={{ width: '100%' }}>
            <LinearProgress variant="determinate" value={25 * (_selectedTab - 1)} />
          </Box>
          <Box sx={{ p: 4 }}>
            {_selectedTab === 1 && <BranchDetails handleBack={handleGoBack} handleNext={() => _setSelectedTab(2)} />}
            {_selectedTab === 2 && <BranchPhotos handleBack={() => _setSelectedTab(1)} handleNext={() => _setSelectedTab(3)} />}
            {_selectedTab === 3 && <BranchRoomsAndCots handleBack={() => _setSelectedTab(2)} handleNext={() => _setSelectedTab(4)} />}
            {_selectedTab === 4 && <BranchAmenities handleBack={() => _setSelectedTab(3)} handleNext={handleGoBack} />}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
