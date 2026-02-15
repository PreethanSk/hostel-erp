import { useState } from "react";
import { Button, Box } from "@mui/material";
import { Plus } from 'lucide-react';
import PageHeader from "../../components/shared/PageHeader";
import FilterBar from "../../components/shared/FilterBar";
import DataTable, { Column } from "../../components/shared/DataTable";
import SearchInput from "../../components/shared/SearchInput";
import ExportButton from "../../components/shared/ExportButton";

export default function Index() {
  const [_tableItems] = useState<any>([]);
  const [_search, _setSearch] = useState('');

  const columns: Column<any>[] = [
    { id: 'sno', label: 'S.No', width: 60, render: (_row: any, index: number) => index + 1 },
    { id: 'date', label: 'Date', render: (row: any) => row?.date || "-" },
    { id: 'branch', label: 'Branch', render: (row: any) => row?.branchName || "-" },
    { id: 'title', label: 'Title', render: (row: any) => row?.title || "-" },
    { id: 'message', label: 'Message', render: (row: any) => row?.message || "-" },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader title="Announcements" description="Create and manage hostel-wide announcements">
        <Button variant="contained" startIcon={<Plus size={16} />}
          sx={{ textTransform: 'none' }}>Add New</Button>
      </PageHeader>

      <FilterBar>
        <SearchInput value={_search} onChange={(value: string) => _setSearch(value)} placeholder="Search announcements..." />
        <Box sx={{ flex: 1 }} />
        <ExportButton onExport={() => {}} />
      </FilterBar>

      <DataTable
        columns={columns}
        data={_tableItems || []}
        loading={false}
        totalCount={0}
        page={1}
        rowsPerPage={10}
        onPageChange={() => {}}
        onRowsPerPageChange={() => {}}
        emptyTitle="No announcements found"
        emptyDescription="Create a new announcement to get started."
      />
    </Box>
  );
}
