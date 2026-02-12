import { useEffect, useState } from "react";
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { KeyboardArrowRightRounded } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import CustomSearch from "../../components/helpers/CustomSearch";
import DateRangeSelector from "../../components/helpers/DateRangeSelector";
import CustomSelect from "../../components/helpers/CustomSelect";
import { CustomAlert, customTableHeader, customTableTemplate } from "../../services/HelperService";
import { getBranchGridList, getPaymentGridList } from "../../models";
import { SkeletonProviderTables } from "../../providers/SkeletonProvider";
import { ROUTES } from "../../configs/constants";

type Props = {
  PageAccess: string;
};

export default function CandidatePayments({ PageAccess }: Props) {
  const navigate = useNavigate();

  const [_tableItems, _setTableItems] = useState<any[]>([]);
  const [_tableLoading, _setTableLoading] = useState(true);
  const [_search, _setSearch] = useState("");
  const [_branchList, _setBranchList] = useState<any[]>([]);
  const [_branchId, _setBranchId] = useState<string>("");
  const [_fromDate, _setFromDate] = useState<string>("");
  const [_toDate, _setToDate] = useState<string>("");

  const loadBranches = () => {
    getBranchGridList(1, 0)
      .then((resp: any) => {
        if (resp?.data?.status === "success") {
          _setBranchList(resp?.data?.result?.results || []);
        }
      })
      .catch(console.log);
  };

  const loadPayments = () => {
    _setTableLoading(true);
    getPaymentGridList(1, 0, _branchId, _fromDate, _toDate)
      .then((resp: any) => {
        if (resp?.data?.status === "success") {
          const result = resp?.data?.result;
          _setTableItems((result && (result.results || result)) || []);
        } else {
          CustomAlert("warning", resp?.data?.error || "Failed to fetch payments");
        }
      })
      .catch((err: any) => {
        console.log(err);
        CustomAlert("warning", "Unable to load payments");
      })
      .finally(() => _setTableLoading(false));
  };

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_branchId, _fromDate, _toDate]);

  const handleChangeDate = (from: string, to: string) => {
    _setFromDate(from);
    _setToDate(to);
  };

  const filteredItems = _tableItems?.filter((content: any) => {
    const lowerSearchInput = _search?.toLowerCase()?.trim();
    if (!lowerSearchInput) return true;
    return Object?.values(content || {})?.some((value: any) =>
      value?.toString()?.toLowerCase()?.includes(lowerSearchInput)
    );
  });

  const handleViewDetails = (item: any) => {
    if (!item?.candidateRefId) return;
    const params = new URLSearchParams({
      candidateId: item.candidateRefId,
    }).toString();
    navigate(`${ROUTES.HOME.ADMISSION.PAYMENTS}/details?${params}`);
  };

  return (
    <div className="container-fluid py-3">
      <div className="container">
        <div className="row justify-content-between align-items-center py-3">
          <div className="col-md-5 my-2">
            <div className="d-flex align-items-center gap-2 mobJustify">
              <span className="text-dark fw-bold">Admission </span>
              <span className="text-dark">
                <KeyboardArrowRightRounded />
              </span>
              <span className="text-muted">Candidate Payments</span>
            </div>
          </div>
          <div className="my-2 col-md-7">
            <div className="d-flex justify-content-end align-items-center gap-4 mobJustify">
              <CustomSearch getSearchText={(value: string) => _setSearch(value)} />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4 my-2">
            <CustomSelect
              className="bg-white"
              padding={"0px 10px"}
              value={_branchId}
              onChange={(e: any) => _setBranchId(e?.target?.value || "")}
              placeholder={"Select Branch"}
              menuItem={[
                <option key="all" value="">
                  All Branches
                </option>,
                ..._branchList?.map((item: any) => (
                  <option key={item?.id} value={item?.id}>
                    {item?.branchName}
                  </option>
                )),
              ]}
            />
          </div>
          <div className="col-md-8 my-2">
            <DateRangeSelector
              className="bg-white"
              handleChangeDate={handleChangeDate}
            />
          </div>
        </div>

        <TableContainer className="tableBorder rounded">
          <Table sx={{ ...customTableTemplate }}>
            <TableHead>
              <TableRow sx={{ ...customTableHeader }}>
                <TableCell className="fw-bold">S.No</TableCell>
                <TableCell className="fw-bold">Candidate</TableCell>
                <TableCell className="fw-bold">Branch</TableCell>
                <TableCell className="fw-bold">Total Paid</TableCell>
                <TableCell className="fw-bold">Pending Amount</TableCell>
                <TableCell className="fw-bold">Last Paid Date</TableCell>
                <TableCell className="fw-bold" align="center">
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems?.length > 0 ? (
                filteredItems?.map((item: any, index: number) => (
                  <TableRow key={item?.id || index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <div className="fw-bold text-nowrap">
                        {item?.candidateName || item?.name || "-"}
                      </div>
                      <div className="fs12 text-muted text-nowrap">
                        {item?.candidateMobileNumber || item?.mobileNumber || ""}
                      </div>
                    </TableCell>
                    <TableCell className="text-nowrap">
                      {item?.branchName || "-"}
                    </TableCell>
                    <TableCell className="text-nowrap">
                      {item?.paidAmount || 0}
                    </TableCell>
                    <TableCell className="text-nowrap">
                      {item?.totalPendingAmount || 0}
                    </TableCell>
                    <TableCell className="text-nowrap">
                      {item?.lastPaidDate || "-"}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        className="text-capitalize"
                        size="small"
                        onClick={() => handleViewDetails(item)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : !_tableLoading ? (
                <TableRow>
                  <TableCell className="fs-3 text-muted" align="center" colSpan={7}>
                    Data Not Found
                  </TableCell>
                </TableRow>
              ) : null}
              <SkeletonProviderTables columns={7} visible={_tableLoading} />
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
}

