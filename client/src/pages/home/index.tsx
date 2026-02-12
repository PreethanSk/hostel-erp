import { useEffect, useState } from "react";
import moment from "moment";
import { getBranchGridList, getDashboardBookings, getDashboardBookingsDetail, getDashboardComplaints, getDashboardComplaintsDetail, getDashboardCotsDetail, getDashboardPayments, getDashboardPaymentsDetail, } from "../../models";
import { CustomFilterMultiSelect, } from "../../components/helpers/CustomSelect";
import DateRangeSelector from "../../components/helpers/DateRangeSelector";
import DashboardPaymentsDetailModal from "../dashboardDetail/dashboard-payments-detail";
import DashboardBookingsDetailModal from "../dashboardDetail/dashboard-bookings-detail";
import DashboardCotsDetailModal from "../dashboardDetail/dashboard-cots-detail";
import DashboardComplaintsDetailModal from "../dashboardDetail/dashboard-complaints-detail";
import { Skeleton } from "@mui/material";

interface DataCardProps {
  title: string;
  value: string | number;
  colorClass: string;
  loading: boolean;
  onClick: () => void;
}

const DataCard: React.FC<DataCardProps> = ({ title, value, colorClass, onClick, loading }) => (
  <div className="col-md-3 my-2">
    <div className="bg-gray rounded shadow-sm p-2 cursor-pointer border" onClick={onClick} role="button">
      <div className={`mb-2 fs14 fw-bold ${colorClass}`}>{title}</div>
      {loading ? <Skeleton className="rounded" variant="rectangular" height={20} /> : <div className="fw-bold fs18">{value}</div>}
    </div>
  </div>
);

interface DashboardData {
  payments?: Record<string, number>;
  bookings?: Record<string, number>;
  cots?: Record<string, number>;
  complaints?: Record<string, number>;
}

interface Branch {
  id: string;
  branchName: string;
}

interface ModalState {
  type: "payments" | "bookings" | "cots" | "complaints" | null;
  dataType: string;
  params: {
    fromDate: string;
    toDate: string;
    branchId: string;
  };
}

export default function Dashboard() {
  const [_dashboardData, _setDashboardData] = useState<DashboardData>({});
  const [_dashboardDataDetail, _setDashboardDataDetail] = useState<any>({});
  const [branchList, setBranchList] = useState<Branch[]>([]);
  const [filterData, setFilterData] = useState<{ branchList: number[] }>({
    branchList: [],
  });
  const [dateRange, setDateRange] = useState({
    fromDate: moment().startOf("month").format("YYYY-MM-DD"),
    toDate: moment().format("YYYY-MM-DD"),
  });

  const [detailModal, setDetailModal] = useState<ModalState>({
    type: null,
    dataType: "",
    params: { fromDate: "", toDate: "", branchId: "" },
  });

  const [_loading, _setLoading] = useState({ cots: true, complaints: true, payments: true, bookings: true });
  const loadData = async (key: string, fn: any, query: any): Promise<void> => {
    try {
      _setLoading((prev) => ({ ...prev, [key]: true }));

      const response = await fn(query);

      _setDashboardDataDetail((prev: any) => ({
        ...prev,
        [`${key}Detail`]: response?.data?.result || {},
      }));
    } catch (err) {
      console.error(`Error loading ${String(key)}:`, err);
    } finally {
      _setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const fetchDashboardData = async () => {
    const branchIdParam = filterData.branchList.length > 0 ? `branchId=${filterData.branchList.join(",")}&` : "";
    const query = `?${branchIdParam}from=${dateRange.fromDate}&to=${dateRange.toDate}`;
    const [complaints, payments, bookings] = await Promise.allSettled([
      // getDashboardCots(query),
      getDashboardComplaints(query),
      getDashboardPayments(query),
      getDashboardBookings(query),
    ]);

    _setDashboardData({
      // cots: cots.status === "fulfilled" ? cots.value?.data?.result || {} : {},
      complaints: complaints.status === "fulfilled" ? complaints.value?.data?.result || {} : {},
      payments: payments.status === "fulfilled" ? payments.value?.data?.result || {} : {},
      bookings: bookings.status === "fulfilled" ? bookings.value?.data?.result || {} : {},
    });

    await Promise.all([
      loadData('cots', getDashboardCotsDetail, query),
      loadData('complaints', getDashboardComplaintsDetail, query),
      loadData('payments', getDashboardPaymentsDetail, query),
      loadData('bookings', getDashboardBookingsDetail, query),
    ]);

    // try {
    //   const [cotsDetail, complaintsDetail, paymentsDetail, bookingsDetail] =
    //     await Promise.allSettled([
    //       getDashboardCotsDetail(query),
    //       getDashboardComplaintsDetail(query),
    //       getDashboardPaymentsDetail(query),
    //       getDashboardBookingsDetail(query),
    //     ]);
    //   _setDashboardDataDetail({
    //     cotsDetail: cotsDetail.status === "fulfilled" ? cotsDetail?.value?.data?.result || {} : {},
    //     complaintsDetail: complaintsDetail.status === "fulfilled" ? complaintsDetail?.value?.data?.result || {} : {},
    //     paymentsDetail: paymentsDetail.status === "fulfilled" ? paymentsDetail?.value?.data?.result || {} : {},
    //     bookingsDetail: bookingsDetail.status === "fulfilled" ? bookingsDetail?.value?.data?.result || {} : {},
    //   });
    // } catch (error) {
    // } finally {
    // }

    try {
      const branchRes = await getBranchGridList();
      if (branchRes?.data?.status === "success") {
        setBranchList(branchRes.data.result.results);
      }
    } catch (err) {
      console.error("Error fetching branches", err);
    }
  };

  const openDetailModal = (type: ModalState["type"], dataType: string) => {
    setDetailModal({
      type,
      dataType,
      params: {
        fromDate: dateRange.fromDate,
        toDate: dateRange.toDate,
        branchId: filterData.branchList.join(","),
      },
    });
  };

  const closeModal = () => {
    setDetailModal({ type: null, dataType: "", params: detailModal.params });
  };

  useEffect(() => {
    fetchDashboardData();
  }, [filterData, dateRange]);


  return (
    <>
      <div className="bg-white">
        <div className="container">
          <div className="fw-bold row align-items-center">
            <div className="col-md-6 fs18">Dashboard</div>
            <div className="col-md-6">
              <div className="row align-items-center">
                <div className="col-md-3 my-2">
                  <CustomFilterMultiSelect className="bg-white"
                    value={filterData.branchList}
                    onChange={(e: React.ChangeEvent<{ value: number[] }>) => {
                      const selected = e.target.value as number[];
                      setFilterData({ ...filterData, branchList: selected });
                      // const branchIdParam =
                      //   selected.length > 0
                      //     ? `branchId=${selected.join(",")}&`
                      //     : "";
                      // const query = `?${branchIdParam}from=${dateRange.fromDate}&to=${dateRange.toDate}`;

                      // Promise.allSettled([
                      //   getDashboardCots(query),
                      //   getDashboardComplaints(query),
                      //   getDashboardPayments(query),
                      //   getDashboardBookings(query),
                      //   getDashboardCotsDetail(query),
                      //   getDashboardComplaintsDetail(query),
                      //   getDashboardPaymentsDetail(query),
                      //   getDashboardBookingsDetail(query),
                      // ])
                      //   .then((
                      //     [cots, complaints, payments, bookings, cotsDetail, complaintsDetail, paymentsDetail, bookingsDetail,]
                      //   ) => {
                      //     _setDashboardData({
                      //       cots: cots.status === "fulfilled" ? cots.value?.data?.result || {} : {},
                      //       complaints: complaints.status === "fulfilled" ? complaints.value?.data?.result || {} : {},
                      //       payments: payments.status === "fulfilled" ? payments.value?.data?.result || {} : {},
                      //       bookings: bookings.status === "fulfilled" ? bookings.value?.data?.result || {} : {},
                      //     });
                      //     _setDashboardDataDetail({
                      //       cotsDetail: cotsDetail.status === "fulfilled" ? cotsDetail?.value?.data?.result || {} : {},
                      //       complaintsDetail: complaintsDetail.status === "fulfilled" ? complaintsDetail?.value?.data?.result || {} : {},
                      //       paymentsDetail: paymentsDetail.status === "fulfilled" ? paymentsDetail?.value?.data?.result || {} : {},
                      //       bookingsDetail: bookingsDetail.status === "fulfilled" ? bookingsDetail?.value?.data?.result || {} : {},
                      //     });
                      //   })
                    }}
                    placeholder={"Branch"}
                    menuItem={branchList.map((item) => ({
                      title: item.branchName,
                      value: Number(item.id),
                    }))}
                  />
                </div>
                <div className="col-md-9 my-2 d-flex align-items-center">
                  <DateRangeSelector
                    className="bg-white w-100"
                    handleChangeDate={(fromDate: string, toDate: string) => { setDateRange({ fromDate, toDate }); }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 my-2">
              {/* PAYMENTS */}
              <div className="row">
                <div className="fw-bold fs18 mt-4">PAYMENTS</div>
                <DataCard
                  title="Total Payments"
                  loading={_loading?.payments}
                  value={`₹ ${_dashboardData?.payments?.totalPayments || 0}`}
                  colorClass="fontGreen"
                  onClick={() => openDetailModal("payments", "totalPayments")}
                />
                <DataCard
                  title="Paid"
                  loading={_loading?.payments}
                  value={`₹ ${_dashboardData?.payments?.totalPaid || 0}`}
                  colorClass="fontBlue"
                  onClick={() => openDetailModal("payments", "paid")}
                />
                {/* <DataCard
              title="Token Advance"
              value={`₹ ${_dashboardData?.payments?.totalAdvance || 0}`}
              colorClass="fontBlue"
              onClick={() => openDetailModal("payments", "advance")}
            /> */}
                <DataCard
                  title="Pending"
                  loading={_loading?.payments}
                  value={`₹ ${_dashboardData?.payments?.totalPending || 0}`}
                  colorClass="fontRed"
                  onClick={() => openDetailModal("payments", "pending")}
                />
                <DataCard
                  title="Refund"
                  loading={_loading?.payments}
                  value={`₹ ${_dashboardData?.payments?.totalRefund || 0}`}
                  colorClass="fontRed"
                  onClick={() => openDetailModal("payments", "refund")}
                />
              </div>
            </div>
            {/* BOOKINGS */}
            <div className="col-md-6 my-2">
              <div className="row">
                <div className="fw-bold fs18 mt-4">BOOKINGS</div>
                <DataCard
                  title="Total Booking"
                  loading={_loading?.bookings}
                  value={_dashboardData?.bookings?.totalBooking || 0}
                  colorClass="fontRed"
                  onClick={() => openDetailModal("bookings", "totalBooking")}
                />
                <DataCard
                  title="Confirm Paid"
                  loading={_loading?.bookings}
                  value={_dashboardData?.bookings?.confirmBooking || 0}
                  colorClass="fontGreen"
                  onClick={() => openDetailModal("bookings", "confirmBooking")}
                />
                <DataCard
                  title="Pending"
                  loading={_loading?.bookings}
                  value={_dashboardData?.bookings?.pendingBooking || 0}
                  colorClass="fontBlue"
                  onClick={() => openDetailModal("bookings", "pendingBooking")}
                />
                <DataCard
                  title="Cancelled"
                  loading={_loading?.bookings}
                  value={_dashboardData?.bookings?.cancelled || 0}
                  colorClass="fontRed"
                  onClick={() => openDetailModal("bookings", "cancelled")}
                />
                <DataCard
                  title="Vacant"
                  loading={_loading?.bookings}
                  value={_dashboardData?.bookings?.vacantCount || 0}
                  colorClass="fontOrange"
                  onClick={() => openDetailModal("bookings", "vacant")}
                />
              </div>
            </div>
            
            {/* COTS */}
            <div className="col-md-6 my-2">
              <div className="row">
                <div className="fw-bold fs18 mt-4">COTS</div>
                <DataCard
                  title="Total Cots"
                  loading={_loading?.cots}
                  value={_dashboardDataDetail?.cotsDetail?.totalCots?.length || 0}
                  colorClass="fontBlue"
                  onClick={() => openDetailModal("cots", "totalCots")}
                />
                <DataCard
                  title="Occupied"
                  loading={_loading?.cots}
                  value={_dashboardDataDetail?.cotsDetail?.occupied?.length || 0}
                  colorClass="fontRed"
                  onClick={() => openDetailModal("cots", "occupied")}
                />
                <DataCard
                  title="Available"
                  loading={_loading?.cots}
                  value={_dashboardDataDetail?.cotsDetail?.available?.length || 0}
                  colorClass="fontGreen"
                  onClick={() => openDetailModal("cots", "available")}
                />
                <DataCard
                  title="Maintenance"
                  loading={_loading?.cots}
                  value={_dashboardDataDetail?.cotsDetail?.maintenance?.length || 0}
                  colorClass="fontGreen"
                  onClick={() => openDetailModal("cots", "maintenance")}
                />
                <DataCard
                  title="Booked Cots"
                  loading={_loading?.cots}
                  value={_dashboardDataDetail?.cotsDetail?.booked?.length || 0}
                  colorClass="fontOrange"
                  onClick={() => openDetailModal("cots", "booked")}
                />
              </div>
            </div>
            {/* COMPLAINTS */}
            <div className="col-md-6 my-2">
              <div className="row">
                <div className="fw-bold fs18 mt-4">COMPLAINTS</div>
                <DataCard
                  title="Open"
                  loading={_loading?.complaints}
                  value={_dashboardData?.complaints?.Open || 0}
                  colorClass="fontOrange"
                  onClick={() => openDetailModal("complaints", "Open")}
                />
                <DataCard
                  title="In-Progress"
                  loading={_loading?.complaints}
                  value={_dashboardData?.complaints?.InProgress || 0}
                  colorClass="fontBlue"
                  onClick={() => openDetailModal("complaints", "InProgress")}
                />
                <DataCard
                  title="On-Hold"
                  loading={_loading?.complaints}
                  value={_dashboardData?.complaints?.Hold || 0}
                  colorClass="fontRed"
                  onClick={() => openDetailModal("complaints", "Hold")}
                />
                <DataCard
                  title="Resolved"
                  loading={_loading?.complaints}
                  value={_dashboardData?.complaints?.Closed || 0}
                  colorClass="fontGreen"
                  onClick={() => openDetailModal("complaints", "Closed")}
                />
                <DataCard
                  title="Rejected"
                  loading={_loading?.complaints}
                  value={_dashboardData?.complaints?.Reject || 0}
                  colorClass="fontRed"
                  onClick={() => openDetailModal("complaints", "Reject")}
                />
              </div>
            </div>
          </div>




        </div>
      </div>

      {/* Modals */}
      {detailModal?.type === "payments" && (
        <DashboardPaymentsDetailModal
          open={true}
          onClose={closeModal}
          {...detailModal.params}
          type={detailModal?.dataType}
          detailedData={_dashboardDataDetail?.paymentsDetail}
        />
      )}
      {detailModal?.type === "bookings" && (
        <DashboardBookingsDetailModal
          open={true}
          onClose={closeModal}
          {...detailModal.params}
          type={detailModal?.dataType}
          detailedData={_dashboardDataDetail?.bookingsDetail}
        />
      )}
      {detailModal?.type === "cots" && (
        <DashboardCotsDetailModal
          open={true}
          onClose={closeModal}
          {...detailModal.params}
          type={detailModal?.dataType}
          detailedData={_dashboardDataDetail?.cotsDetail}
        />
      )}
      {detailModal?.type === "complaints" && (
        <DashboardComplaintsDetailModal
          open={true}
          onClose={closeModal}
          {...detailModal.params}
          type={detailModal?.dataType}
          detailedData={_dashboardDataDetail?.complaintsDetail}
        />
      )}
    </>
  );
}
