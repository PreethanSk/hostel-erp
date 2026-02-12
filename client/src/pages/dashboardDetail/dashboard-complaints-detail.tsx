import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab } from "@mui/material";
import { KeyboardArrowRightRounded } from "@mui/icons-material";
import { getBranchGridList, getDashboardComplaintsDetail } from "../../models";
import CustomSelect from "../../components/helpers/CustomSelect";
import DateRangeSelector from "../../components/helpers/DateRangeSelector";
import CustomSearch from "../../components/helpers/CustomSearch";
import { CustomAlert, customTableHeader, customTableTemplate } from "../../services/HelperService";
import { SkeletonProviderTables } from "../../providers/SkeletonProvider";

type BranchItem = {
    id: number;
    branchName: string;
};

type ComplaintStatusTab = "Open" | "InProgress" | "Hold" | "Closed" | "Reject";

export default function DashboardComplaintsDetail() {
    const [_activeTab, _setActiveTab] = useState<ComplaintStatusTab>("Open");
    const [_tableItems, _setTableItems] = useState<any[]>([]);
    const [_tableLoading, _setTableLoading] = useState(true);
    const [_search, _setSearch] = useState("");
    const [_branchList, _setBranchList] = useState<BranchItem[]>([]);
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

    const loadComplaintsDetail = () => {
        _setTableLoading(true);
        const params = new URLSearchParams();
        if (_fromDate) params.append("from", _fromDate);
        if (_toDate) params.append("to", _toDate);
        if (_branchId) params.append("branchId", _branchId);
        const query = params.toString();
        const queryStr = query ? `?${query}` : "";

        getDashboardComplaintsDetail(queryStr)
            .then((resp: any) => {
                if (resp?.data?.status === "success") {
                    const grouped = resp?.data?.result || {};
                    _setTableItems(grouped[_activeTab] || []);
                } else {
                    CustomAlert("warning", resp?.data?.error || "Failed to fetch complaints detail");
                }
            })
            .catch((err: any) => {
                console.log(err);
                CustomAlert("warning", "Unable to load complaints detail");
            })
            .finally(() => _setTableLoading(false));
    };

    useEffect(() => {
        loadBranches();
    }, []);

    useEffect(() => {
        loadComplaintsDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [_activeTab, _branchId, _fromDate, _toDate]);

    const handleTabChange = (_e: any, value: ComplaintStatusTab) => {
        _setActiveTab(value);
    };

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
                    <div className="col-md-6 my-2">
                        <div className="d-flex align-items-center gap-2 mobJustify">
                            <span className="text-dark fw-bold">Dashboard </span>
                            <span className="text-dark">
                                <KeyboardArrowRightRounded />
                            </span>
                            <span className="text-muted">Complaints Detail</span>
                        </div>
                    </div>
                    <div className="my-2 col-md-6">
                        <div className="d-flex justify-content-end align-items-center gap-4 mobJustify">
                            <CustomSearch getSearchText={(value: string) => _setSearch(value)} />
                        </div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-lg-4 mb-2">
                        <Tabs
                            value={_activeTab}
                            onChange={handleTabChange}
                            variant="scrollable"
                            allowScrollButtonsMobile
                        >
                            <Tab value="Open" label="Open" />
                            <Tab value="InProgress" label="In Progress" />
                            <Tab value="Hold" label="Hold" />
                            <Tab value="Closed" label="Closed" />
                            <Tab value="Reject" label="Rejected" />
                        </Tabs>
                    </div>
                    <div className="col-lg-8 mb-2">
                        <div className="row align-items-center">
                            <div className="col-md-4 my-2 px-1">
                                <CustomSelect
                                    className="bg-white"
                                    placeholder="Select Branch"
                                    value={_branchId}
                                    onChange={(e: any) => _setBranchId(e?.target?.value || "")}
                                    padding={"0px 10px"}
                                    menuItem={[
                                        <option key="All" value="">
                                            All Branches
                                        </option>,
                                        ...(_branchList || [])?.map((item: BranchItem) => (
                                            <option key={item?.id} value={item?.id}>
                                                {item?.branchName}
                                            </option>
                                        )),
                                    ]}
                                />
                            </div>
                            <div className="col-md-8 my-2 px-1">
                                <DateRangeSelector
                                    className="bg-white"
                                    handleChangeDate={handleChangeDate}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <TableContainer className="tableBorder rounded">
                    <Table sx={{ ...customTableTemplate }}>
                        <TableHead>
                            <TableRow sx={{ ...customTableHeader }}>
                                <TableCell className="fw-bold">S.No</TableCell>
                                <TableCell className="fw-bold">Branch</TableCell>
                                <TableCell className="fw-bold">Room / Cot</TableCell>
                                <TableCell className="fw-bold">Issue Type</TableCell>
                                <TableCell className="fw-bold">Sub Category</TableCell>
                                <TableCell className="fw-bold">Created By</TableCell>
                                <TableCell className="fw-bold">Assigned To</TableCell>
                                <TableCell className="fw-bold">Status</TableCell>
                                <TableCell className="fw-bold">Created On</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredItems?.length > 0 ? (
                                filteredItems?.map((item: any, index: number) => (
                                    <TableRow key={item?.id || index}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell className="text-nowrap">
                                            {item?.branchName || "-"}
                                        </TableCell>
                                        <TableCell className="text-nowrap">
                                            Room {item?.roomNumber || "-"} / Cot {item?.cotNumber || "-"}
                                        </TableCell>
                                        <TableCell className="text-nowrap">
                                            {item?.issueTypeName || "-"}
                                        </TableCell>
                                        <TableCell className="text-nowrap">
                                            {item?.issueSubCategoryName || "-"}
                                        </TableCell>
                                        <TableCell className="text-nowrap">
                                            {item?.creator || "-"}
                                        </TableCell>
                                        <TableCell className="text-nowrap">
                                            {item?.assignedToName || "-"}
                                        </TableCell>
                                        <TableCell className="text-nowrap">
                                            <span className="fs12 statusBgActive text-success rounded--50 px-3 py-1">
                                                {item?.status || "-"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-nowrap">
                                            {item?.complaintDate || "-"}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : !_tableLoading ? (
                                <TableRow>
                                    <TableCell className="fs-3 text-muted" align="center" colSpan={9}>
                                        Data Not Found
                                    </TableCell>
                                </TableRow>
                            ) : null}
                            <SkeletonProviderTables columns={9} visible={_tableLoading} />
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        </div>
    );
}

