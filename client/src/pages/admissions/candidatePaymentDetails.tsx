import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer, MenuItem, Pagination, PaginationItem, Button } from '@mui/material';
import { customTableHeader, CustomTableHover, customTableTemplate, getExportEXCEL } from '../../services/HelperService';
import { IMAGES_ICON } from '../../assets/images/exportImages';
import { SkeletonProviderTables } from '../../providers/SkeletonProvider';
import moment from 'moment';
import { getPaymentScheduleGridList } from '../../models';
import { useNavigate, useParams } from "react-router-dom";
import CustomSelect from "../../components/helpers/CustomSelect";

function getStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case 'paid': return { color: 'green', fontWeight: 'bold' };
    case 'partial':
    case 'pending': return { color: '#e6b800', fontWeight: 'bold' };
    case 'overdue': return { color: 'red', fontWeight: 'bold' };
    default: return { color: 'gray' };
  }
}

export default function CandidatePaymentDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [_tableItems, _setTableItems] = useState<any[]>([]);
  const [_tableTotalCount, _setTableTotalCount] = useState(0);
  const [_tableLoading, _setTableLoading] = useState(true);
  const [_page, _setPage] = useState(1);
  const [_rowsPerPage, _setRowsPerPage] = useState(10);
  const [_candidateName, _setCandidateName] = useState('');

  useEffect(() => {
    fetchGrid();
    // eslint-disable-next-line
  }, [id, _page, _rowsPerPage]);

  const fetchGrid = () => {
    _setTableLoading(true);
    getPaymentScheduleGridList(_page, _rowsPerPage, id)
      .then((resp) => {
        if (resp?.data?.status === "success") {
          const results = resp.data.result.results || [];
          _setTableItems(results);
          _setTableTotalCount(resp.data.result.totalItems || 0);
          if (results.length > 0) _setCandidateName(results[0].candidateName);
        }
      })
      .catch(console.log)
      .finally(() => _setTableLoading(false));
  };

  const handleChangePage = (_event: React.ChangeEvent<unknown>, value: number) => {
    _setPage(value);
  };

  const exportEXCEL = () => {
    const header = ["S.No", "Candidate Name", "Amount Due", "Amount Paid", "Scheduled Date", "Status", "Payment Date"];
    const body = _tableItems.map((item, index) => [
      index + 1,
      item.candidateName,
      item.amountDue,
      item.amountPaid,
      item.scheduledDate ? moment(item.scheduledDate).format('DD-MM-YYYY') : '',
      item.status,
      item.paymentDate ? moment(item.paymentDate).format('DD-MM-YYYY') : ''
    ]);
    getExportEXCEL({ header, body, fileName: `Payment_Schedule_${_candidateName}` });
  };

  return (
    <div className="container">
      <div className="row justify-content-between align-items-center py-3">
        <div className="col-md-6 my-2 d-flex align-items-center">
          <Button variant="text" onClick={() => navigate(-1)} startIcon={<img height={18} src={IMAGES_ICON.BackIcon} alt="Back" />}>Back</Button>
          <span className="text-dark fw-bold ms-2">Payment Schedule for {_candidateName}</span>
        </div>
        <div className="col-md-6 my-2">
          <div className="d-flex align-items-center gap-4 justify-content-end">
            <Button variant="contained" color="primary" onClick={exportEXCEL} startIcon={<img height={18} src={IMAGES_ICON.TableDownloadIcon} />}>Export</Button>
          </div>
        </div>
      </div>
      <TableContainer className="tableBorder rounded">
        <Table sx={{ ...customTableTemplate }}>
          <TableHead>
            <TableRow className="px-2" sx={{ ...customTableHeader }}>
              <TableCell className="fw-bold text-nowrap">S.No</TableCell>
              <TableCell className="fw-bold text-nowrap">Candidate Name</TableCell>
              <TableCell className="fw-bold text-nowrap">Amount Due</TableCell>
              <TableCell className="fw-bold text-nowrap">Amount Paid</TableCell>
              <TableCell className="fw-bold text-nowrap">Scheduled Date</TableCell>
              <TableCell className="fw-bold text-nowrap">Status</TableCell>
              <TableCell className="fw-bold text-nowrap">Payment Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {_tableItems.length > 0 ? (
              _tableItems.map((item, index) => (
                <TableRow key={index} sx={{ ...CustomTableHover }}>
                  <TableCell>{(index + 1) + ((_page - 1) * _rowsPerPage)}</TableCell>
                  <TableCell>{item.candidateName}</TableCell>
                  <TableCell>{item.amountDue}</TableCell>
                  <TableCell>{item.amountPaid}</TableCell>
                  <TableCell>{item.scheduledDate ? moment(item.scheduledDate).format('DD-MM-YYYY') : ''}</TableCell>
                  <TableCell style={getStatusColor(item.status)}>{item.status}</TableCell>
                  <TableCell>{item.paymentDate ? moment(item.paymentDate).format('DD-MM-YYYY') : ''}</TableCell>
                </TableRow>
              ))
            ) : !_tableLoading && (
              <TableRow>
                <TableCell className="fs-3 text-muted" align="center" colSpan={7}>Data Not Found</TableCell>
              </TableRow>
            )}
            <SkeletonProviderTables columns={7} visible={_tableLoading} />
          </TableBody>
        </Table>
      </TableContainer>
      <div className="mt-3 d-flex justify-content-between flex-wrap">
        <div className="d-flex align-items-center gap-2">
          <span className='textLightGray fs14 text-nowrap'>Items per page:</span>
          <CustomSelect padding={'6px'} value={Number(_rowsPerPage)} onChange={(e: any) => _setRowsPerPage(e.target.value)}
            placeholder={" " } menuItem={[10, 20, 30].map((item) =>
              <MenuItem key={item} value={item}>{item}</MenuItem>)} />
        </div>
        <Pagination count={Math.ceil(_tableTotalCount / _rowsPerPage) || 0} page={_page} onChange={handleChangePage}
          size={"small"} color={"primary"}
          renderItem={(item) => <PaginationItem sx={{ mx: '4px' }} {...item} />} />
      </div>
    </div>
  );
} 