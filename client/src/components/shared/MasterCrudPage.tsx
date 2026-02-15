import { useEffect, useState, useCallback } from 'react';
import {
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  Box,
  MenuItem,
  Select,
  FormControl,
  FormHelperText,
} from '@mui/material';
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import { CustomAlert, getExportEXCEL } from '../../services/HelperService';
import { gray } from '../../theme';
import DataTable, { Column } from './DataTable';
import PageHeader from './PageHeader';
import FilterBar from './FilterBar';
import SearchInput from './SearchInput';
import StatusBadge from './StatusBadge';
import ExportButton from './ExportButton';

export interface FormFieldConfig {
  name: string;
  label: string;
  required?: boolean;
  type: 'text' | 'select';
  menuItems?: { value: any; label: string }[];
  loadMenuItems?: () => Promise<{ value: any; label: string }[]>;
}

interface MasterCrudPageProps {
  title: string;
  description: string;
  pageAccess?: any;
  columns?: Column<any>[];
  formFields: FormFieldConfig[];
  apiGet: (query?: string) => Promise<any>;
  apiSave: (data: any) => Promise<any>;
  apiDelete?: (id: number) => Promise<any>;
  exportFileName?: string;
  exportHeaders?: string[];
  exportRowMapper?: (item: any, index: number) => any[];
  hideNotes?: boolean;
}

export default function MasterCrudPage({
  title,
  description,
  pageAccess,
  columns: customColumns,
  formFields,
  apiGet,
  apiSave,
  apiDelete,
  exportFileName,
  exportHeaders,
  exportRowMapper,
  hideNotes,
}: MasterCrudPageProps) {
  const [tableItems, setTableItems] = useState<any[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [editForm, setEditForm] = useState(false);
  const [selectMenus, setSelectMenus] = useState<Record<string, { value: any; label: string }[]>>({});

  const canWrite = pageAccess === 'Write' || pageAccess === undefined;

  // Build initial form data from formFields
  const getInitialFormData = useCallback(() => {
    const data: Record<string, any> = { id: 0, isActive: true };
    if (!hideNotes) data.notes = '';
    formFields.forEach((f) => {
      if (!(f.name in data)) data[f.name] = '';
    });
    return data;
  }, [formFields, hideNotes]);

  const [formData, setFormData] = useState<Record<string, any>>(getInitialFormData);

  // Build initial validation from formFields
  const getInitialValidation = useCallback(() => {
    const v: Record<string, { error: boolean; message: string }> = {};
    formFields.forEach((f) => {
      if (f.required) v[f.name] = { error: false, message: '' };
    });
    return v;
  }, [formFields]);

  const [validation, setValidation] = useState(getInitialValidation);

  const changeFormData = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleEdit = (item: any) => {
    setFormData({ ...item });
    setEditForm(true);
  };

  const handleDelete = (item: any) => {
    if (!apiDelete) return;
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this item!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#388024',
      cancelButtonColor: '#bf1029',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        apiDelete(item?.id).then((resp) => {
          if (resp?.data?.status === 'success') {
            CustomAlert('warning', resp?.data?.result);
            getGridList();
          }
        });
      }
    });
  };

  const handleGoBack = () => {
    setEditForm(false);
    setSaving(false);
    setValidation(getInitialValidation());
    setFormData(getInitialFormData());
  };

  const checkValidation = () => {
    const v = getInitialValidation();
    let valid = true;
    formFields.forEach((f) => {
      if (f.required) {
        const val = formData[f.name];
        if (f.type === 'text' && !val?.toString().trim()) {
          v[f.name] = { error: true, message: 'Required Field' };
          valid = false;
        } else if (f.type === 'select' && !val) {
          v[f.name] = { error: true, message: 'Required Field' };
          valid = false;
        }
      }
    });
    setValidation(v);
    return valid;
  };

  const handleSubmit = () => {
    setSaving(true);
    if (!checkValidation()) {
      setSaving(false);
      return;
    }

    const body: Record<string, any> = { id: formData.id || 0, isActive: formData.isActive };
    if (!hideNotes) body.notes = formData.notes || '';
    formFields.forEach((f) => {
      body[f.name] = formData[f.name];
    });

    apiSave(body)
      .then((resp) => {
        if (resp?.data?.status === 'success') {
          getGridList();
          handleGoBack();
          CustomAlert('success', formData.id ? 'Successfully Updated' : 'Successfully Saved');
        } else {
          CustomAlert('warning', resp?.data?.error);
        }
      })
      .catch((err) => console.log(err))
      .finally(() => setSaving(false));
  };

  const handleExport = () => {
    if (!exportHeaders || !exportRowMapper) {
      const header = ['S. No', ...formFields.map((f) => f.label), 'Status'];
      const body = tableItems.map((item, i) => [
        i + 1,
        ...formFields.map((f) => item[f.name] ?? ''),
        item.isActive ? 'Active' : 'Inactive',
      ]);
      getExportEXCEL({ header, body, fileName: exportFileName || title });
    } else {
      getExportEXCEL({
        header: exportHeaders,
        body: tableItems.map(exportRowMapper),
        fileName: exportFileName || title,
      });
    }
  };

  const getGridList = () => {
    setTableLoading(true);
    apiGet()
      .then((resp) => {
        if (resp?.data?.status === 'success') {
          setTableItems([...resp.data.result]);
        }
      })
      .catch((err) => console.log(err))
      .finally(() => setTableLoading(false));
  };

  // Load select menu items for fields that have loadMenuItems
  useEffect(() => {
    formFields.forEach((f) => {
      if (f.type === 'select' && f.loadMenuItems) {
        f.loadMenuItems().then((items) => {
          setSelectMenus((prev) => ({ ...prev, [f.name]: items }));
        });
      }
    });
  }, []);

  useEffect(() => {
    getGridList();
  }, []);

  // Filter by search
  const filteredItems = tableItems.filter((item) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return Object.values(item).some((v) => v?.toString().toLowerCase().includes(q));
  });

  // Build default columns if not provided
  const defaultColumns: Column<any>[] = [
    { id: 'sno', label: '#', width: 60, render: (_, i) => i + 1 },
    ...formFields.map((f) => ({
      id: f.name,
      label: f.label,
      render: (row: any) => {
        if (f.type === 'select') {
          const menus = f.menuItems || selectMenus[f.name] || [];
          const found = menus.find((m) => m.value === row[f.name]);
          return found?.label || row[f.name] || '-';
        }
        return row[f.name] || '-';
      },
    })),
    {
      id: 'isActive',
      label: 'Status',
      align: 'center' as const,
      render: (row: any) => <StatusBadge status={row.isActive ? 'Active' : 'Inactive'} />,
    },
    ...(canWrite ? [{
      id: 'actions',
      label: 'Action',
      align: 'center' as const,
      render: (row: any) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <Button size="small" onClick={() => handleEdit(row)}
            sx={{ textTransform: 'none', fontSize: '13px', color: gray[600], minWidth: 'auto', gap: 0.5 }}>
            <Pencil size={14} /> Edit
          </Button>
          {apiDelete && (
            <Button size="small" onClick={() => handleDelete(row)}
              sx={{ textTransform: 'none', fontSize: '13px', color: '#F04438', minWidth: 'auto', gap: 0.5 }}>
              <Trash2 size={14} /> Delete
            </Button>
          )}
        </Box>
      ),
    }] : []),
  ];

  const tableColumns = customColumns || defaultColumns;

  // ---- FORM VIEW ----
  if (editForm) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ backgroundColor: gray[50], border: `1px solid ${gray[200]}`, borderRadius: 2, px: 4, py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', py: 2, borderBottom: `1px solid ${gray[200]}`, cursor: 'pointer' }}
            onClick={handleGoBack}>
            <ArrowLeft size={20} />
            <Box sx={{ fontWeight: 600, ml: 1 }}>Back</Box>
          </Box>

          <Box sx={{ my: 3 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              {formFields.map((f) => (
                <Box key={f.name} sx={{ flex: f.type === 'select' ? '0 0 250px' : '1 1 300px', minWidth: 200 }}>
                  <Box sx={{ fontSize: '12px', fontWeight: 500, color: gray[700], mb: 0.75 }}>
                    {f.label}
                    {f.required && <span style={{ color: '#F04438' }}> *</span>}
                  </Box>
                  {f.type === 'text' ? (
                    <TextField
                      fullWidth size="small"
                      value={formData[f.name] || ''}
                      onChange={(e) => changeFormData(f.name, e.target.value)}
                      error={validation[f.name]?.error}
                      helperText={validation[f.name]?.message}
                    />
                  ) : (
                    <FormControl fullWidth size="small" error={validation[f.name]?.error}>
                      <Select
                        value={formData[f.name] || ''}
                        onChange={(e) => changeFormData(f.name, e.target.value)}
                        displayEmpty
                      >
                        <MenuItem value="" disabled>Select</MenuItem>
                        {(f.menuItems || selectMenus[f.name] || []).map((mi) => (
                          <MenuItem key={mi.value} value={mi.value}>{mi.label}</MenuItem>
                        ))}
                      </Select>
                      {validation[f.name]?.message && (
                        <FormHelperText>{validation[f.name]?.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                </Box>
              ))}
            </Box>

            <Box sx={{ borderTop: `1px solid ${gray[200]}`, pt: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              {!hideNotes && (
                <TextField
                  size="small" fullWidth placeholder="Add Notes"
                  value={formData.notes || ''}
                  onChange={(e) => changeFormData('notes', e.target.value)}
                  sx={{ flex: '1 1 300px' }}
                />
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 'auto' }}>
                <FormControlLabel label="Active"
                  control={<Checkbox checked={formData.isActive} onChange={() => changeFormData('isActive', !formData.isActive)} />}
                />
                <Button variant="contained" disabled={saving} onClick={handleSubmit}
                  sx={{ textTransform: 'none', px: 4 }}>Save</Button>
                <Button variant="outlined" onClick={handleGoBack}
                  sx={{ textTransform: 'none', px: 4, color: gray[700], borderColor: gray[300] }}>Cancel</Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  // ---- LIST VIEW ----
  return (
    <Box sx={{ p: 3 }}>
      <PageHeader title={title} description={description}>
        {canWrite && (
          <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setEditForm(true)}
            sx={{ textTransform: 'none' }}>Add New</Button>
        )}
      </PageHeader>

      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder={`Search ${title.toLowerCase()}...`} />
        <Box sx={{ flex: 1 }} />
        <ExportButton onExport={handleExport} />
      </FilterBar>

      <DataTable
        columns={tableColumns}
        data={filteredItems}
        loading={tableLoading}
        skeletonRows={5}
        emptyTitle="No records found"
        emptyDescription={`No ${title.toLowerCase()} have been added yet.`}
      />
    </Box>
  );
}
