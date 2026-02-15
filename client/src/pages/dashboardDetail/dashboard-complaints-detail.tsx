import { useEffect, useState, useMemo } from 'react';
import { Box, Link } from '@mui/material';
import { getExportEXCEL } from '../../services/HelperService';
import { getDashboardComplaintsDetail } from '../../models';
import DialogModal from '../../components/shared/DialogModal';
import DataTable, { Column } from '../../components/shared/DataTable';
import SearchInput from '../../components/shared/SearchInput';
import ExportButton from '../../components/shared/ExportButton';
import StatusBadge from '../../components/shared/StatusBadge';

interface Props {
  open: boolean;
  onClose: () => void;
  fromDate: string;
  toDate: string;
  branchId: string;
  type?: string;
  detailedData?: any;
  serviceProviderId?: string;
}

interface ComplaintDetail {
  creator?: string;
  branchName?: string;
  roomNumber?: string;
  cotNumber?: string;
  complaintDate?: string;
  mobileNumber?: string;
  natureOfComplaint?: string;
  assignTo?: string;
  closedBy?: string;
  status?: string;
  issueTypeName?: string;
  issueSubCategoryName?: string;
  assignedToName?: string;
  closedByName?: string;
  description?: string;
  imageUrl?: string;
  createdBy?: string;
  assignedBy?: string;
  pickedOn?: string;
  closedOn?: string;
}

const TITLE_MAP: Record<string, string> = {
  Open: 'Open Complaints',
  InProgress: 'In Progress Complaints',
  Hold: 'On Hold Complaints',
  Closed: 'Resolved Complaints',
  Reject: 'Rejected Complaints',
};

export default function DashboardComplaintsDetailModal({
  open, onClose, fromDate, toDate, branchId, type = 'Open', detailedData, serviceProviderId,
}: Props) {
  const [data, setData] = useState<ComplaintDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!open) return;
    if (detailedData) {
      const group = detailedData?.[type] || [];
      setData(mapRows(group));
      return;
    }
    setLoading(true);
    let queryStr = `?from=${fromDate}&to=${toDate}`;
    if (branchId) queryStr += `&branchId=${branchId}`;
    if (serviceProviderId) queryStr += `&serviceProviderId=${serviceProviderId}`;
    getDashboardComplaintsDetail(queryStr)
      .then((resp: any) => {
        if (resp?.data?.status === 'success') {
          setData(mapRows(resp.data.result?.[type] || []));
        } else {
          setData([]);
        }
      })
      .finally(() => setLoading(false));
  }, [open, fromDate, toDate, branchId, type, detailedData, serviceProviderId]);

  function mapRows(group: any[]): ComplaintDetail[] {
    return group.map((item: any) => ({
      creator: item.creator,
      branchName: item.branchName,
      roomNumber: item.roomNumber,
      cotNumber: item.cotNumber,
      complaintDate: item.complaintDate,
      mobileNumber: item.mobileNumber || '-',
      natureOfComplaint: item.issueTypeName,
      issueSubCategoryName: item.issueSubCategoryName,
      assignTo: item.assignedToName,
      closedBy: item.closedByName || '-',
      status: item.status,
      description: item.description,
      imageUrl: item.imageUrl,
      createdBy: item.createdBy,
      assignedBy: item.assignedBy,
      pickedOn: item.pickedOn,
      closedOn: item.closedOn,
    }));
  }

  const filteredData = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return data;
    return data.filter((item) =>
      Object.values(item).some((v) => v?.toString().toLowerCase().includes(q))
    );
  }, [data, search]);

  const columns: Column<ComplaintDetail>[] = [
    { id: 'sno', label: '#', width: 50, render: (_, i) => i + 1 },
    { id: 'creator', label: 'Creator', render: (r) => r.creator || '-' },
    { id: 'branch', label: 'Branch', render: (r) => r.branchName || '-' },
    { id: 'room', label: 'Room', render: (r) => r.roomNumber || '-' },
    { id: 'cot', label: 'Bed', render: (r) => r.cotNumber || '-' },
    { id: 'date', label: 'Date', render: (r) => r.complaintDate || '-' },
    { id: 'mobile', label: 'Mobile', render: (r) => r.mobileNumber || '-' },
    { id: 'issue', label: 'Issue', render: (r) => r.natureOfComplaint || '-' },
    { id: 'subCategory', label: 'Sub Category', render: (r) => r.issueSubCategoryName || '-' },
    { id: 'description', label: 'Description', minWidth: 160, render: (r) => r.description || '-' },
    {
      id: 'images', label: 'Images', render: (r) => {
        if (!r.imageUrl) return '-';
        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {r.imageUrl.split(',').map((url: string, idx: number) => (
              <Link key={idx} href={url.trim()} target="_blank" rel="noopener noreferrer" sx={{ fontSize: '12px' }}>
                Img {idx + 1}
              </Link>
            ))}
          </Box>
        );
      },
    },
    { id: 'createdBy', label: 'Created By', render: (r) => r.createdBy || '-' },
    { id: 'assignTo', label: 'Assigned To', render: (r) => r.assignTo || '-' },
    { id: 'assignedBy', label: 'Assigned By', render: (r) => r.assignedBy || '-' },
    { id: 'pickedOn', label: 'Picked On', render: (r) => r.pickedOn || '-' },
    { id: 'closedOn', label: 'Closed On', render: (r) => r.closedOn || '-' },
    { id: 'closedBy', label: 'Closed By', render: (r) => r.closedBy || '-' },
    { id: 'status', label: 'Status', render: (r) => r.status ? <StatusBadge status={r.status} /> : '-' },
  ];

  const exportEXCEL = () => {
    const header = columns.map((c) => c.label);
    const body = filteredData.map((item, idx) => columns.map((c) => {
      const node = c.render(item, idx);
      return typeof node === 'string' || typeof node === 'number' ? node : '-';
    }));
    getExportEXCEL({ header, body, fileName: 'Complaints Details' });
  };

  if (!open) return null;

  return (
    <DialogModal
      open={open}
      onClose={onClose}
      title={TITLE_MAP[type] || 'Complaint Details'}
      maxWidth="lg"
      actions={
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', width: '100%' }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search complaints..." />
          <ExportButton onExport={exportEXCEL} />
        </Box>
      }
    >
      <DataTable
        columns={columns}
        data={filteredData}
        loading={loading}
        skeletonRows={5}
        emptyTitle="No data found"
        emptyDescription="No complaint records match your criteria"
      />
    </DialogModal>
  );
}
