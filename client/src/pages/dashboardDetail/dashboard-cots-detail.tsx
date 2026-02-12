import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab } from "@mui/material";
import { KeyboardArrowRightRounded } from "@mui/icons-material";
import { getBranchGridList, getDashboardCotsDetail } from "../../models";
import CustomSelect from "../../components/helpers/CustomSelect";
import DateRangeSelector from "../../components/helpers/DateRangeSelector";
import CustomSearch from "../../components/helpers/CustomSearch";
import { CustomAlert, customTableHeader, customTableTemplate } from "../../services/HelperService";
import { SkeletonProviderTables } from "../../providers/SkeletonProvider";

type BranchItem = {
    id: number;
    branchName: string;
};

type CotTab = "total" | "occupied" | "available" | "maintenance" | "booked";

export default function DashboardCotsDetail() {
    const [_activeTab, _setActiveTab] = useState<CotTab>("total");
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

    const loadCotsDetail = () => {
        _setTableLoading(true);
        const params = new URLSearchParams();
        if (_fromDate) params.append("from", _fromDate);
        if (_toDate) params.append("to", _toDate);
        if (_branchId) params.append("branchId", _branchId);
        const query = params.toString();
        const queryStr = query ? `?${query}` : "";

        getDashboardCotsDetail(queryStr)
            .then((resp: any) => {
                if (resp?.data?.status === "success") {
                    const result = resp?.data?.result || {};
                    if (_activeTab === "occupied") {
                        _setTableItems(result?.occupied || []);
                    } else if (_activeTab === "available") {
                        _setTableItems(result?.available || []);
                    } else if (_activeTab === "maintenance") {
                        _setTableItems(result?.maintenance || []);
                    } else if (_activeTab === "booked") {
                        _setTableItems(result?.booked || []);
                    } else {
                        _setTableItems(result?.totalCots || []);
                    }
                } else {
                    CustomAlert("warning", resp?.data?.error || "Failed to fetch cots detail");
                }
            })
            .catch((err: any) => {
                console.log(err);
                CustomAlert("warning", "Unable to load cots detail");
            })
            .finally(() => _setTableLoading(false));
    };

    useEffect(() => {
        loadBranches();
    }, []);

    useEffect(() => {
        loadCotsDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [_activeTab, _branchId, _fromDate, _toDate]);

    const handleTabChange = (_e: any, value: CotTab) => {
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
                            <span className="text-muted">Cots Detail</span>
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
                            <Tab value="total" label="All Cots" />
                            <Tab value="occupied" label="Occupied" />
                            <Tab value="available" label="Available" />
                            <Tab value="maintenance" label="Maintenance" />
                            <Tab value="booked" label="Booked" />
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
                                <TableCell className="fw-bold">Room</TableCell>
                                <TableCell className="fw-bold">Cot</TableCell>
                                <TableCell className="fw-bold">Cot Type</TableCell>
                                <TableCell className="fw-bold">Candidate</TableCell>
                                <TableCell className="fw-bold">Contact</TableCell>
                                <TableCell className="fw-bold">Admission Type</TableCell>
                                <TableCell className="fw-bold">Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredItems?.length > 0 ? (
                                filteredItems?.map((item: any, index: number) => (
                                    <TableRow key={item?.cotId || index}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell className="text-nowrap">
                                            {item?.branchName || "-"}
                                        </TableCell>
                                        <TableCell className="text-nowrap">
                                            {item?.roomNumber || "-"}
                                        </TableCell>
                                        <TableCell className="text-nowrap">
                                            {item?.cotNumber || "-"}
                                        </TableCell>
                                        <TableCell className="text-nowrap">
                                            {item?.cotTypeName || "-"}
                                        </TableCell>
                                        <TableCell className="text-nowrap">
                                            <div className="fw-bold">
                                                {item?.candidateName || "-"}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-nowrap">
                                            <div>{item?.mobileNumber || "-"}</div>
                                        </TableCell>
                                        <TableCell className="text-nowrap">
                                            {item?.admissionType || "-"}
                                        </TableCell>
                                        <TableCell className="text-nowrap">
                                            <span className="fs12 statusBgActive text-success rounded--50 px-3 py-1">
                                                {item?.status || "-"}
                                            </span>
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

