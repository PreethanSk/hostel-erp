import { useEffect, useState } from "react";
import { Card, CardContent, Button, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../configs/constants";
import {
    getBranchGridList,
    getDashboardBookings,
    getDashboardComplaints,
    getDashboardCots,
    getDashboardPayments,
} from "../../models";
import CustomSelect from "../../components/helpers/CustomSelect";
import DateRangeSelector from "../../components/helpers/DateRangeSelector";
import { CustomAlert } from "../../services/HelperService";

type BranchItem = {
    id: number;
    branchName: string;
};

type CotsSummary = {
    total: number;
    occupied: number;
    available: number;
    booked: number;
};

type ComplaintsSummary = {
    Open: number;
    InProgress: number;
    Hold: number;
    Closed: number;
};

type PaymentsSummary = {
    totalCandidates: number;
    totalPaid: number;
    totalPayments: number;
    totalAdvance: number;
    totalPending: number;
    totalRefund: number;
};

type BookingsSummary = {
    totalBooking: number;
    cancelled: number;
    confirmBooking: number;
    pendingBooking: number;
    vacantCount: number;
};

const initialCots: CotsSummary = {
    total: 0,
    occupied: 0,
    available: 0,
    booked: 0,
};

const initialComplaints: ComplaintsSummary = {
    Open: 0,
    InProgress: 0,
    Hold: 0,
    Closed: 0,
};

const initialPayments: PaymentsSummary = {
    totalCandidates: 0,
    totalPaid: 0,
    totalPayments: 0,
    totalAdvance: 0,
    totalPending: 0,
    totalRefund: 0,
};

const initialBookings: BookingsSummary = {
    totalBooking: 0,
    cancelled: 0,
    confirmBooking: 0,
    pendingBooking: 0,
    vacantCount: 0,
};

export default function Home() {
    const navigate = useNavigate();

    const [_branchList, _setBranchList] = useState<BranchItem[]>([]);
    const [_branchId, _setBranchId] = useState<string>("");
    const [_fromDate, _setFromDate] = useState<string>("");
    const [_toDate, _setToDate] = useState<string>("");

    const [_loading, _setLoading] = useState<boolean>(false);
    const [_cots, _setCots] = useState<CotsSummary>(initialCots);
    const [_complaints, _setComplaints] = useState<ComplaintsSummary>(initialComplaints);
    const [_payments, _setPayments] = useState<PaymentsSummary>(initialPayments);
    const [_bookings, _setBookings] = useState<BookingsSummary>(initialBookings);

    const buildQueryString = () => {
        const params = new URLSearchParams();
        if (_fromDate) params.append("from", _fromDate);
        if (_toDate) params.append("to", _toDate);
        if (_branchId) params.append("branchId", _branchId);
        const query = params.toString();
        return query ? `?${query}` : "";
    };

    const loadBranches = () => {
        getBranchGridList(1, 0)
            .then((resp: any) => {
                if (resp?.data?.status === "success") {
                    _setBranchList(resp?.data?.result?.results || []);
                }
            })
            .catch(console.log);
    };

    const loadDashboard = () => {
        const queryStr = buildQueryString();
        _setLoading(true);
        Promise.all([
            getDashboardCots(queryStr),
            getDashboardComplaints(queryStr),
            getDashboardPayments(queryStr),
            getDashboardBookings(queryStr),
        ])
            .then(([cotsResp, complaintsResp, paymentsResp, bookingsResp]: any[]) => {
                if (cotsResp?.data?.status === "success") {
                    _setCots({
                        ...initialCots,
                        ...(cotsResp?.data?.result || {}),
                    });
                } else if (cotsResp) {
                    CustomAlert("warning", cotsResp?.data?.error || "Unable to load cots summary");
                }

                if (complaintsResp?.data?.status === "success") {
                    _setComplaints({
                        ...initialComplaints,
                        ...(complaintsResp?.data?.result || {}),
                    });
                } else if (complaintsResp) {
                    CustomAlert("warning", complaintsResp?.data?.error || "Unable to load complaints summary");
                }

                if (paymentsResp?.data?.status === "success") {
                    _setPayments({
                        ...initialPayments,
                        ...(paymentsResp?.data?.result || {}),
                    });
                } else if (paymentsResp) {
                    CustomAlert("warning", paymentsResp?.data?.error || "Unable to load payments summary");
                }

                if (bookingsResp?.data?.status === "success") {
                    _setBookings({
                        ...initialBookings,
                        ...(bookingsResp?.data?.result || {}),
                    });
                } else if (bookingsResp) {
                    CustomAlert("warning", bookingsResp?.data?.error || "Unable to load bookings summary");
                }
            })
            .catch((err: any) => {
                console.log(err);
                CustomAlert("warning", "Unable to load dashboard");
            })
            .finally(() => _setLoading(false));
    };

    const handleChangeDate = (from: string, to: string) => {
        _setFromDate(from);
        _setToDate(to);
    };

    const handleViewCotsDetail = () => navigate(ROUTES.HOME.DASHBOARD_DETAIL.COTS);
    const handleViewComplaintsDetail = () => navigate(ROUTES.HOME.DASHBOARD_DETAIL.COMPLAINTS);
    const handleViewPaymentsDetail = () => navigate(ROUTES.HOME.DASHBOARD_DETAIL.PAYMENTS);
    const handleViewBookingsDetail = () => navigate(ROUTES.HOME.DASHBOARD_DETAIL.BOOKINGS);

    useEffect(() => {
        loadBranches();
    }, []);

    useEffect(() => {
        loadDashboard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [_branchId, _fromDate, _toDate]);

    return (
        <div className="container-fluid py-3">
            <div className="container">
                <div className="row justify-content-between align-items-center py-3">
                    <div className="col-md-6 my-2">
                        <h5 className="fw-bold mb-1">Dashboard</h5>
                        <p className="text-muted mb-0 fs12">
                            Overall snapshot of cots, complaints, payments and bookings.
                        </p>
                    </div>
                    <div className="col-md-6 my-2">
                        <div className="row align-items-center">
                            <div className="col-sm-5 my-1 px-1">
                                <CustomSelect
                                    className="bg-white"
                                    placeholder="Select Branch"
                                    value={_branchId}
                                    onChange={(e: any) => _setBranchId(e?.target?.value || "")}
                                    padding={"0px 10px"}
                                    menuItem={[
                                        <MenuItem key="All" value="">
                                            All Branches
                                        </MenuItem>,
                                        ...(_branchList || [])?.map((item: BranchItem) => (
                                            <MenuItem key={item?.id} value={item?.id}>
                                                {item?.branchName}
                                            </MenuItem>
                                        )),
                                    ]}
                                />
                            </div>
                            <div className="col-sm-7 my-1 px-1">
                                <DateRangeSelector
                                    className="bg-white"
                                    handleChangeDate={handleChangeDate}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-3">
                    <div className="col-lg-3 col-md-6">
                        <Card className="h-100 shadow-sm">
                            <CardContent>
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div>
                                        <div className="text-muted text-uppercase fs12 mb-1">
                                            Cots
                                        </div>
                                        <div className="fw-bold fs-4">
                                            {_cots.total || 0}
                                        </div>
                                    </div>
                                    <span className="badge bg-primary text-white fs12">
                                        {_loading ? "Loading..." : "Summary"}
                                    </span>
                                </div>
                                <div className="fs12 text-muted mb-2">
                                    Occupied / Available / Booked
                                </div>
                                <div className="d-flex flex-wrap gap-3 mb-3 fs12">
                                    <div>
                                        <div className="text-muted">Occupied</div>
                                        <div className="fw-bold text-success">
                                            {_cots.occupied || 0}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-muted">Available</div>
                                        <div className="fw-bold text-primary">
                                            {_cots.available || 0}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-muted">Booked</div>
                                        <div className="fw-bold text-warning">
                                            {_cots.booked || 0}
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    size="small"
                                    className="text-capitalize px-0"
                                    onClick={handleViewCotsDetail}
                                >
                                    View details
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="col-lg-3 col-md-6">
                        <Card className="h-100 shadow-sm">
                            <CardContent>
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div>
                                        <div className="text-muted text-uppercase fs12 mb-1">
                                            Complaints
                                        </div>
                                        <div className="fw-bold fs-4">
                                            {(_complaints.Open || 0) +
                                                (_complaints.InProgress || 0) +
                                                (_complaints.Hold || 0) +
                                                (_complaints.Closed || 0)}
                                        </div>
                                    </div>
                                    <span className="badge bg-danger text-white fs12">
                                        {_loading ? "Loading..." : "By status"}
                                    </span>
                                </div>
                                <div className="d-flex flex-wrap gap-3 mb-3 fs12">
                                    <div>
                                        <div className="text-muted">Open</div>
                                        <div className="fw-bold text-danger">
                                            {_complaints.Open || 0}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-muted">In Progress</div>
                                        <div className="fw-bold text-warning">
                                            {_complaints.InProgress || 0}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-muted">Hold</div>
                                        <div className="fw-bold text-secondary">
                                            {_complaints.Hold || 0}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-muted">Closed</div>
                                        <div className="fw-bold text-success">
                                            {_complaints.Closed || 0}
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    size="small"
                                    className="text-capitalize px-0"
                                    onClick={handleViewComplaintsDetail}
                                >
                                    View details
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="col-lg-3 col-md-6">
                        <Card className="h-100 shadow-sm">
                            <CardContent>
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div>
                                        <div className="text-muted text-uppercase fs12 mb-1">
                                            Payments
                                        </div>
                                        <div className="fw-bold fs-4">
                                            ₹{_payments.totalPaid?.toFixed(2) || "0.00"}
                                        </div>
                                    </div>
                                    <span className="badge bg-success text-white fs12">
                                        {_loading ? "Loading..." : "Amount"}
                                    </span>
                                </div>
                                <div className="fs12 text-muted mb-2">
                                    Total paid / advance / pending / refund
                                </div>
                                <div className="d-flex flex-wrap gap-3 mb-3 fs12">
                                    <div>
                                        <div className="text-muted">Advance</div>
                                        <div className="fw-bold text-info">
                                            ₹{_payments.totalAdvance?.toFixed(2) || "0.00"}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-muted">Pending</div>
                                        <div className="fw-bold text-warning">
                                            ₹{_payments.totalPending?.toFixed(2) || "0.00"}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-muted">Refund</div>
                                        <div className="fw-bold text-secondary">
                                            ₹{_payments.totalRefund?.toFixed(2) || "0.00"}
                                        </div>
                                    </div>
                                </div>
                                <div className="fs12 text-muted mb-2">
                                    Candidates: {_payments.totalCandidates || 0}
                                </div>
                                <Button
                                    size="small"
                                    className="text-capitalize px-0"
                                    onClick={handleViewPaymentsDetail}
                                >
                                    View details
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="col-lg-3 col-md-6">
                        <Card className="h-100 shadow-sm">
                            <CardContent>
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div>
                                        <div className="text-muted text-uppercase fs12 mb-1">
                                            Bookings
                                        </div>
                                        <div className="fw-bold fs-4">
                                            {_bookings.totalBooking || 0}
                                        </div>
                                    </div>
                                    <span className="badge bg-info text-white fs12">
                                        {_loading ? "Loading..." : "Status"}
                                    </span>
                                </div>
                                <div className="d-flex flex-wrap gap-3 mb-3 fs12">
                                    <div>
                                        <div className="text-muted">Confirmed</div>
                                        <div className="fw-bold text-success">
                                            {_bookings.confirmBooking || 0}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-muted">Pending</div>
                                        <div className="fw-bold text-warning">
                                            {_bookings.pendingBooking || 0}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-muted">Cancelled / Rejected</div>
                                        <div className="fw-bold text-danger">
                                            {_bookings.cancelled || 0}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-muted">Vacant mismatch</div>
                                        <div className="fw-bold text-secondary">
                                            {_bookings.vacantCount || 0}
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    size="small"
                                    className="text-capitalize px-0"
                                    onClick={handleViewBookingsDetail}
                                >
                                    View details
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
