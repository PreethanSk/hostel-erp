import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  Box,
  Pagination,
  Select,
  MenuItem,
  Typography,
} from '@mui/material';
import { gray, primary, shadows, radius } from '../../theme';
import EmptyState from './EmptyState';

export interface Column<T> {
  id: string;
  label: string;
  width?: number | string;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render: (row: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  skeletonRows?: number;
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
  rowKey?: (row: T) => string | number;
  totalCount?: number;
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (size: number) => void;
  stickyHeader?: boolean;
}

export default function DataTable<T>({
  columns,
  data,
  loading = false,
  skeletonRows = 5,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  onRowClick,
  rowKey,
  totalCount,
  page = 1,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  stickyHeader = false,
}: DataTableProps<T>) {
  const totalPages = totalCount ? Math.ceil(totalCount / rowsPerPage) : 0;
  const showPagination = totalCount !== undefined && totalCount > 0;

  return (
    <Box>
      <TableContainer
        sx={{
          backgroundColor: '#fff',
          borderRadius: `${radius.lg}px`,
          border: `1px solid ${gray[200]}`,
          boxShadow: shadows.sm,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ overflowX: 'auto' }}>
          <Table stickyHeader={stickyHeader} sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell
                    key={col.id}
                    align={col.align || 'left'}
                    sx={{
                      width: col.width,
                      minWidth: col.minWidth,
                      backgroundColor: gray[50],
                      borderBottom: `1px solid ${gray[200]}`,
                      fontSize: '12px',
                      fontWeight: 500,
                      color: gray[500],
                      padding: '12px 24px',
                      whiteSpace: 'nowrap',
                      letterSpacing: 0,
                    }}
                  >
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {/* Loading state */}
              {loading &&
                Array.from({ length: skeletonRows }).map((_, rowIdx) => (
                  <TableRow key={`skeleton-${rowIdx}`}>
                    {columns.map((col) => (
                      <TableCell
                        key={col.id}
                        sx={{
                          padding: '16px 24px',
                          borderBottom: `1px solid ${gray[200]}`,
                        }}
                      >
                        <Skeleton
                          variant="text"
                          sx={{ borderRadius: `${radius.md}px`, backgroundColor: gray[100] }}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

              {/* Data rows */}
              {!loading &&
                data.map((row, index) => (
                  <TableRow
                    key={rowKey ? rowKey(row) : index}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    sx={{
                      cursor: onRowClick ? 'pointer' : 'default',
                      '&:hover': { backgroundColor: gray[25] },
                      transition: 'background-color 150ms ease',
                      '&:last-child td': { borderBottom: 0 },
                    }}
                  >
                    {columns.map((col) => (
                      <TableCell
                        key={col.id}
                        align={col.align || 'left'}
                        sx={{
                          fontSize: '14px',
                          fontWeight: 400,
                          color: gray[600],
                          padding: '16px 24px',
                          borderBottom: `1px solid ${gray[200]}`,
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {col.render(row, index)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

              {/* Empty state */}
              {!loading && data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length} sx={{ border: 0 }}>
                    <EmptyState
                      icon={emptyIcon}
                      title={emptyTitle}
                      description={emptyDescription}
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </TableContainer>

      {/* Pagination */}
      {showPagination && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: 2,
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '13px', color: gray[500] }}>
              Rows per page:
            </Typography>
            <Select
              size="small"
              value={rowsPerPage}
              onChange={(e) => onRowsPerPageChange?.(Number(e.target.value))}
              sx={{
                fontSize: '13px',
                height: 32,
                '& .MuiSelect-select': { padding: '4px 8px' },
              }}
            >
              {[5, 10, 25, 50].map((size) => (
                <MenuItem key={size} value={size} sx={{ fontSize: '13px' }}>
                  {size}
                </MenuItem>
              ))}
            </Select>
            <Typography sx={{ fontSize: '13px', color: gray[500] }}>
              {Math.min((page - 1) * rowsPerPage + 1, totalCount || 0)}
              {' - '}
              {Math.min(page * rowsPerPage, totalCount || 0)}
              {' of '}
              {totalCount}
            </Typography>
          </Box>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => onPageChange?.(newPage)}
            shape="rounded"
            size="small"
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: `${radius.md}px`,
                fontSize: '14px',
              },
              '& .Mui-selected': {
                backgroundColor: `${primary[50]} !important`,
                color: primary[700],
                fontWeight: 600,
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
}
