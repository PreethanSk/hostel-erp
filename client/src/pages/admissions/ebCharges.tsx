import { useEffect, useState } from "react";
import { MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { KeyboardArrowRightRounded } from "@mui/icons-material";
import CustomSearch from "../../components/helpers/CustomSearch";
import DateRangeSelector from "../../components/helpers/DateRangeSelector";
import CustomSelect from "../../components/helpers/CustomSelect";
import { CustomAlert, customTableHeader, customTableTemplate } from "../../services/HelperService";
import { getAdmissionEbChargesGridList, getBranchGridList } from "../../models";
import { SkeletonProviderTables } from "../../providers/SkeletonProvider";

type Props = {
  PageAccess: string;
};

export default function CandidateEbCharges({ PageAccess }: Props) {
  const [_tableItems, _setTableItems] = useState<any[]>([]);
  const [_tableLoading, _setTableLoading] = useState(true);
  const [_search, _setSearch] = useState("");
  const [_branchList, _setBranchList] = useState<any[]>([]);
  const [_branchId, _setBranchId] = useState<string>("");
  const [_roomType, _setRoomType] = useState<string>("");
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

  const loadEbCharges = () => {
    _setTableLoading(true);
    getAdmissionEbChargesGridList(1, 0, _branchId, _roomType, _fromDate, _toDate)
      .then((resp: any) => {
        if (resp?.data?.status === "success") {
          const result = resp?.data?.result;
          _setTableItems((result && (result.results || result)) || []);
        } else {
          CustomAlert("warning", resp?.data?.error || "Failed to fetch EB charges");
        }
      })
      .catch((err: any) => {
        console.log(err);
        CustomAlert("warning", "Unable to load EB charges");
      })
      .finally(() => _setTableLoading(false));
  };

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    loadEbCharges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_branchId, _roomType, _fromDate, _toDate]);

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
              <span className="text-muted">EB Charges</span>
            </div>
          </div>
          <div className="my-2 col-md-7">
            <div className="d-flex justify-content-end align-items-center gap-4 mobJustify">
              <CustomSearch getSearchText={(value: string) => _setSearch(value)} />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-3 my-2">
            <CustomSelect
              className="bg-white"
              padding={"0px 10px"}
              value={_branchId}
              onChange={(e: any) => _setBranchId(e?.target?.value || "")}
              placeholder={"Select Branch"}
              menuItem={[
                <MenuItem key="all" value="">
                  All Branches
                </MenuItem>,
                ..._branchList?.map((item: any) => (
                  <MenuItem key={item?.id} value={item?.id}>
                    {item?.branchName}
                  </MenuItem>
                )),
              ]}
            />
          </div>
          <div className="col-md-3 my-2">
            <CustomSelect
              className="bg-white"
              padding={"0px 10px"}
              value={_roomType}
              onChange={(e: any) => _setRoomType(e?.target?.value || "")}
              placeholder={"Room Type"}
              menuItem={[
                <MenuItem key="all" value="">
                  All
                </MenuItem>,
                <MenuItem key="AC" value="AC">
                  AC
                </MenuItem>,
                <MenuItem key="Non-AC" value="Non-AC">
                  Non-AC
                </MenuItem>,
              ]}
            />
          </div>
          <div className="col-md-6 my-2">
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
                <TableCell className="fw-bold">Branch</TableCell>
                <TableCell className="fw-bold">Room Type</TableCell>
                <TableCell className="fw-bold">Room</TableCell>
                <TableCell className="fw-bold">Cot</TableCell>
                <TableCell className="fw-bold">EB Charges</TableCell>
                <TableCell className="fw-bold">From Date</TableCell>
                <TableCell className="fw-bold">To Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems?.length > 0 ? (
                filteredItems?.map((item: any, index: number) => (
                  <TableRow key={item?.id || index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item?.branchName || "-"}</TableCell>
                    <TableCell>{item?.roomTypeName || "-"}</TableCell>
                    <TableCell>{item?.roomNumber || "-"}</TableCell>
                    <TableCell>{item?.cotNumber || "-"}</TableCell>
                    <TableCell>{item?.ebCharges || 0}</TableCell>
                    <TableCell>{item?.fromDate || "-"}</TableCell>
                    <TableCell>{item?.toDate || "-"}</TableCell>
                  </TableRow>
                ))
              ) : !_tableLoading ? (
                <TableRow>
                  <TableCell className="fs-3 text-muted" align="center" colSpan={8}>
                    Data Not Found
                  </TableCell>
                </TableRow>
              ) : null}
              <SkeletonProviderTables columns={8} visible={_tableLoading} />
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
}

