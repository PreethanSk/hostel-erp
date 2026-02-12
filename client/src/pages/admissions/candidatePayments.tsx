import { useEffect, useState } from "react";
import CustomSelect from '../../components/helpers/CustomSelect';
import DateRangeSelector from "../../components/helpers/DateRangeSelector";
import { MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Pagination, PaginationItem } from '@mui/material';
import { getBranchGridList, getPaymentGridList, getPaymentScheduleGridList } from '../../models';
import { SkeletonProviderTables } from '../../providers/SkeletonProvider';
import moment from 'moment';
import { IMAGES_ICON } from '../../assets/images/exportImages';
import CustomSearch from '../../components/helpers/CustomSearch';
import { getExportEXCEL, CustomTableHover } from '../../services/HelperService';
import CustomDialogue from '../../components/helpers/CustomDialogue';

export default function CandidatePayments() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [_branchList, _setBranchList] = useState<any[]>([]);
  const [_filterData, _setFilterData] = useState({
    branchId: '',
    fromDate: moment().clone().startOf('month').format('YYYY-MM-DD'),
    toDate: moment().format('YYYY-MM-DD')
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [_tableItems, _setTableItems] = useState<any[]>([]);
  const [_tableTotalCount, _setTableTotalCount] = useState(0);
  const [_tableLoading, _setTableLoading] = useState(true);
  const [_page, _setPage] = useState(1);
  const [_rowsPerPage, _setRowsPerPage] = useState(10);
  const [_search, _setSearch] = useState('');
  const [_dialogOpen, _setDialogOpen] = useState(false);
  const [_dialogLoading, _setDialogLoading] = useState(false);
  const [_dialogRows, _setDialogRows] = useState<any[]>([]);
  const [_dialogCandidateId, _setDialogCandidateId] = useState<string | null>(null);

  useEffect(() => {
    getBranchGridList().then((resp) => {
      if (resp?.data?.status === "success") {
        _setBranchList(resp?.data?.result?.results || []);
      }
    });
  }, []);

  const getGridList = () => {
    _setTableLoading(true);
    getPaymentGridList(_page, _rowsPerPage, _filterData.branchId, _filterData.fromDate, _filterData.toDate)
      .then((resp) => {
        if (resp?.data?.status === "success") {
          _setTableItems(resp?.data?.result?.results || []);
          _setTableTotalCount(resp?.data?.result?.totalItems || 0);
        }
      })
      .catch(console.log)
      .finally(() => _setTableLoading(false));
  };

  useEffect(() => {
    getGridList();
  }, [_page, _rowsPerPage, _filterData]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const changeFilterData = (key: string, value: any) => {
    _setFilterData({ ..._filterData, [key]: value });
    _setPage(1); // Reset to first page on filter change
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSearch = (searchValue: string) => {
    _setSearch(searchValue);
    if (!searchValue) {
      // If search is cleared, reset to paginated data
      getGridList();
      return;
    }
    getPaymentGridList(1, 100000, _filterData.branchId, _filterData.fromDate, _filterData.toDate)
      .then((resp) => {
        if (resp?.data?.status === 'success') {
          const allRows = resp?.data?.result?.results || [];
          const lowerSearchInput = searchValue.toLowerCase().trim();
          const filtered = allRows.filter((item: any) =>
            [item?.candidateName, item?.paidAmount, item?.dueToPaid, item?.dueDate, item?.branchName]
              .map(val => (val ? val.toString().toLowerCase() : ''))
              .some(val => val.includes(lowerSearchInput))
          );
          _setTableItems(filtered);
          _setTableTotalCount(filtered.length);
          _setPage(1);
        }
      });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChangePage = (_event: React.ChangeEvent<unknown>, value: number) => {
    _setPage(value);
  };

  // const getPrintTableHeadBody = () => {
  //   const header = [
  //     'S.No',
  //     'Action',
  //     'Candidate Name',
  //     'Paid Amount',
  //     'Due To Be Paid',
  //     'Due Date',
  //     'Branch Name',
  //   ];
  //   const body = _tableItems?.map((item: any, index: number) => [
  //     index + 1 + ((_page - 1) * _rowsPerPage),
  //     item?.candidateName || '-',
  //     item?.paidAmount ?? '-',
  //     item?.dueToPaid ?? '-',
  //     item?.dueDate ? moment(item?.dueDate).format('DD-MMM-YYYY') : '-',
  //     item?.branchName || '-',
  //   ]);
  //   return { header, body };
  // };

  const exportEXCEL = () => {
    getPaymentGridList(1, 100000, _filterData.branchId, _filterData.fromDate, _filterData.toDate)
      .then((resp) => {
        if (resp?.data?.status === 'success') {
          const allRows = resp?.data?.result?.results || [];
          const header = [
            'S.No',
            'Candidate Id',
            'Candidate Name',
            'Paid Amount',
            'Due To Be Paid',
            'Due Date',
            'Branch Name',
          ];
          const body = allRows.map((item: any, index: number) => [
            index + 1,
            item?.candidateId || '-',
            item?.candidateName || '-',
            item?.paidAmount ?? '-',
            item?.dueToPaid ?? '-',
            item?.dueDate ? moment(item?.dueDate).format('DD-MMM-YYYY') : '-',
            item?.branchName || '-',
          ]);
          getExportEXCEL({ header, body, fileName: 'Candidate Payments' });
        }
      });
  };

  const handleViewClick = (candidateId: string) => {
    _setDialogCandidateId(candidateId);
    _setDialogOpen(true);
    _setDialogLoading(true);
    getPaymentScheduleGridList(1, 100, candidateId, '', '')
      .then((resp) => {
        if (resp?.data?.status === 'success') {
          _setDialogRows(resp?.data?.result?.results || []);
        }
      })
      .catch(console.log)
      .finally(() => _setDialogLoading(false));
  };

  const handleDialogClose = () => {
    _setDialogOpen(false);
    _setDialogRows([]);
    _setDialogCandidateId(null);
  };

  const getStatusClass = (status: string) => {
    if (!status) return 'statusInProgress';
    const s = status.toLowerCase();
    if (s === 'paid') return 'statusResolved';
    if (s === 'overdue') return 'statusRejected';
    if (s === 'pending' || s === 'partial' || s === 'partially paid') return 'statusInProgress';
    return 'statusInProgress';
  };

  return (
    <div className="container">
      <div className="row justify-content-between align-items-center py-3">
        <div className="col-md-4 my-2">
          <span className="text-dark fw-bold">Candidate Payments</span>
        </div>
        <div className="col-md-8">
          <div className="row align-items-center">
            <div className="col-md-3 my-2">
              <CustomSelect
                className=""
                padding={'0px 10px'}
                value={_filterData.branchId}
                onChange={(e: any) => changeFilterData('branchId', e.target.value)}
                placeholder={"Branch"}
                menuItem={[
                  <MenuItem className="px-2 fs14" value={''} key={-1}>All</MenuItem>,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ...(_branchList?.map((item: any) => (
                    <MenuItem className="px-2 fs14" key={item.id} value={item.id}>{item.branchName}</MenuItem>
                  )) || []),
                ]}
              />
            </div>
            <div className="col-md-6 my-2">
              <DateRangeSelector handleChangeDate={(from: string, to: string) => _setFilterData({ ..._filterData, fromDate: from, toDate: to })} />
            </div>
            <div className="col-md-3 my-2 d-flex align-items-center gap-4 justify-content-end">
              <CustomSearch getSearchText={handleSearch} />
              <img height={24} src={IMAGES_ICON.TableDownloadIcon} role="button" draggable="false" onClick={exportEXCEL} />
            </div>
          </div>
        </div>
      </div>
      <TableContainer className="tableBorder rounded">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell className="fw-bold text-nowrap">S.No</TableCell>
              <TableCell className="fw-bold text-nowrap">Action</TableCell>
              <TableCell className="fw-bold text-nowrap">Candidate Id</TableCell>
              <TableCell className="fw-bold text-nowrap">Candidate Name</TableCell>
              <TableCell className="fw-bold text-nowrap">Paid Amount</TableCell>
              <TableCell className="fw-bold text-nowrap">Due To Be Paid</TableCell>
              <TableCell className="fw-bold text-nowrap">Due Date</TableCell>
              <TableCell className="fw-bold text-nowrap">Branch Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {_tableItems && _tableItems.length > 0 ? (
              _tableItems?.map((item: any, index: number) => (
                <TableRow key={item.id || index} sx={{ ...CustomTableHover }}>
                  <TableCell>{(index + 1) + ((_page - 1) * _rowsPerPage)}</TableCell>
                  <TableCell align="center" style={{ minWidth: 80 }}>
                    <div className="d-flex align-items-center gap-2">
                      <div className="d-flex align-items-center gap-2" role="button" onClick={() => handleViewClick(item?.candidateRefId?.toString())}>
                        <span className="text-muted">View</span>
                        <img draggable="false" height={16} src={IMAGES_ICON.EyeIcon} alt="icon" />
                      </div>
                      {/* <Button variant="contained" size="small" disabled={_invoiceLoading > -1} onClick={() => getInvoice(item)}>Invoice</Button> */}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted text-nowrap">{item?.candidateId || '-'}</TableCell>
                  <TableCell className="text-muted text-nowrap">{item?.candidateName || '-'}</TableCell>
                  <TableCell className="text-muted text-nowrap">{item?.paidAmount ?? '-'}</TableCell>
                  <TableCell className="text-muted text-nowrap">{item?.dueToPaid ?? '-'}</TableCell>
                  <TableCell className="text-muted text-nowrap">{item?.dueDate ? moment(item?.dueDate)?.format('DD-MMM-YYYY') : '-'}</TableCell>
                  <TableCell className="text-muted text-nowrap">{item?.branchName || '-'}</TableCell>
                </TableRow>
              ))
            ) : !_tableLoading && (
              <TableRow>
                <TableCell className="fs-3 text-muted" align="center" colSpan={6}>Data Not Found</TableCell>
              </TableRow>
            )}
            <SkeletonProviderTables columns={8} visible={_tableLoading} />
          </TableBody>
        </Table>
      </TableContainer>
      <div className="mt-3 d-flex justify-content-between flex-wrap">
        <div className="d-flex align-items-center gap-2">
          <span className='textLightGray fs14 text-nowrap'>Items per page:</span>
          <CustomSelect padding={'6px'}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            value={Number(_rowsPerPage)} onChange={(e: any) => _setRowsPerPage(e.target.value)}
            placeholder={" "} menuItem={[
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ...[10, 20, 30].map((item: any) => <MenuItem key={item} value={item}>{item}</MenuItem>)
            ]} />
        </div>
        <Pagination count={Math.ceil(_tableTotalCount / _rowsPerPage) || 0} page={_page} onChange={handleChangePage}
          size={"small"} color={"primary"}
          renderItem={(item) => <PaginationItem sx={{ mx: '4px' }} {...item} />} />
      </div>
      {/* Popup for payment schedule */}
      <CustomDialogue
        displaySize="lg"
        title="Payment Schedule"
        dialogueFlag={_dialogOpen}
        onCloseClick={handleDialogClose}
        mainContent={
          _dialogLoading ? (
            <div className="py-4 text-center">Loading...</div>
          ) : (
            <TableContainer className="tableBorder rounded">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell className="fw-bold text-nowrap">Candidate Name</TableCell>
                    <TableCell className="fw-bold text-nowrap">Room Number</TableCell>
                    <TableCell className="fw-bold text-nowrap">Branch Name</TableCell>
                    <TableCell className="fw-bold text-nowrap">Scheduled Date</TableCell>
                    <TableCell className="fw-bold text-nowrap">Amount Due</TableCell>
                    <TableCell className="fw-bold text-nowrap">Amount Paid</TableCell>
                    <TableCell className="fw-bold text-nowrap">Payment Date</TableCell>
                    <TableCell className="fw-bold text-nowrap">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {_dialogRows.length > 0 ? _dialogRows.map((row, idx) => (
                    <TableRow key={row.id || idx}>
                      <TableCell className="text-muted text-nowrap">{row?.candidateName || '-'}</TableCell>
                      <TableCell className="text-muted text-nowrap">{row?.roomNumber || '-'}</TableCell>
                      <TableCell className="text-muted text-nowrap">{row?.branchName || '-'}</TableCell>
                      <TableCell className="text-muted text-nowrap">{row?.scheduledDate ? moment(row?.scheduledDate).format('DD-MMM-YYYY') : '-'}</TableCell>
                      <TableCell className="text-muted text-nowrap">{row?.amountDue ?? '-'}</TableCell>
                      <TableCell className="text-muted text-nowrap">{row?.amountPaid ?? '-'}</TableCell>
                      <TableCell className="text-muted text-nowrap">{row?.paymentDate ? moment(row?.paymentDate).format('DD-MMM-YYYY') : '-'}</TableCell>
                      <TableCell className="text-muted text-nowrap">
                        <div className={`fs14 text-uppercase text-center px-2 pt-1 ${getStatusClass(row?.status)}`}>{row?.status || '-'}</div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell className="fs-3 text-muted" align="center" colSpan={8}>Data Not Found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )
        }
        actionContent={null}
      />
    </div>
  );
} 