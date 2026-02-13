import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid2';
import moment from 'moment';
import { Bed, Percent, IndianRupee, AlertCircle } from 'lucide-react';
import {
  getBranchGridList,
  getDashboardBookings,
  getDashboardBookingsDetail,
  getDashboardComplaints,
  getDashboardComplaintsDetail,
  getDashboardCotsDetail,
  getDashboardPayments,
  getDashboardPaymentsDetail,
} from '../../models';
import { CustomFilterMultiSelect } from '../../components/helpers/CustomSelect';
import DateRangeSelector from '../../components/helpers/DateRangeSelector';
import DashboardPaymentsDetailModal from '../dashboardDetail/dashboard-payments-detail';
import DashboardBookingsDetailModal from '../dashboardDetail/dashboard-bookings-detail';
import DashboardCotsDetailModal from '../dashboardDetail/dashboard-cots-detail';
import DashboardComplaintsDetailModal from '../dashboardDetail/dashboard-complaints-detail';
import { PageHeader, StatsCard } from '../../components/shared';
import { primary, success, error as errorColor, info } from '../../theme';
import OccupancyDonut from './OccupancyDonut';
import RevenueBarChart from './RevenueBarChart';
import ComplaintsQuickTable from './ComplaintsQuickTable';
import AdmissionsQuickTable from './AdmissionsQuickTable';

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
  type: 'payments' | 'bookings' | 'cots' | 'complaints' | null;
  dataType: string;
  params: { fromDate: string; toDate: string; branchId: string };
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({});
  const [dashboardDataDetail, setDashboardDataDetail] = useState<any>({});
  const [branchList, setBranchList] = useState<Branch[]>([]);
  const [filterData, setFilterData] = useState<{ branchList: number[] }>({ branchList: [] });
  const [dateRange, setDateRange] = useState({
    fromDate: moment().startOf('month').format('YYYY-MM-DD'),
    toDate: moment().format('YYYY-MM-DD'),
  });
  const [detailModal, setDetailModal] = useState<ModalState>({
    type: null,
    dataType: '',
    params: { fromDate: '', toDate: '', branchId: '' },
  });
  const [loading, setLoading] = useState({ cots: true, complaints: true, payments: true, bookings: true });

  const loadData = async (key: string, fn: any, query: string): Promise<void> => {
    try {
      setLoading((prev) => ({ ...prev, [key]: true }));
      const response = await fn(query);
      setDashboardDataDetail((prev: any) => ({
        ...prev,
        [`${key}Detail`]: response?.data?.result || {},
      }));
    } catch (err) {
      console.error(`Error loading ${key}:`, err);
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const fetchDashboardData = async () => {
    const branchIdParam = filterData.branchList.length > 0 ? `branchId=${filterData.branchList.join(',')}&` : '';
    const query = `?${branchIdParam}from=${dateRange.fromDate}&to=${dateRange.toDate}`;

    const [complaints, payments, bookings] = await Promise.allSettled([
      getDashboardComplaints(query),
      getDashboardPayments(query),
      getDashboardBookings(query),
    ]);

    setDashboardData({
      complaints: complaints.status === 'fulfilled' ? complaints.value?.data?.result || {} : {},
      payments: payments.status === 'fulfilled' ? payments.value?.data?.result || {} : {},
      bookings: bookings.status === 'fulfilled' ? bookings.value?.data?.result || {} : {},
    });

    await Promise.all([
      loadData('cots', getDashboardCotsDetail, query),
      loadData('complaints', getDashboardComplaintsDetail, query),
      loadData('payments', getDashboardPaymentsDetail, query),
      loadData('bookings', getDashboardBookingsDetail, query),
    ]);

    try {
      const branchRes = await getBranchGridList();
      if (branchRes?.data?.status === 'success') {
        setBranchList(branchRes.data.result.results);
      }
    } catch (err) {
      console.error('Error fetching branches', err);
    }
  };

  const openDetailModal = (type: ModalState['type'], dataType: string) => {
    setDetailModal({
      type,
      dataType,
      params: {
        fromDate: dateRange.fromDate,
        toDate: dateRange.toDate,
        branchId: filterData.branchList.join(','),
      },
    });
  };

  const closeModal = () => {
    setDetailModal({ type: null, dataType: '', params: detailModal.params });
  };

  useEffect(() => {
    fetchDashboardData();
  }, [filterData, dateRange]);

  // KPI computations
  const cotsDetail = dashboardDataDetail?.cotsDetail || {};
  const totalBeds = cotsDetail?.totalCots?.length || 0;
  const occupied = cotsDetail?.occupied?.length || 0;
  const available = cotsDetail?.available?.length || 0;
  const occupancyRate = totalBeds > 0 ? Math.round((occupied / totalBeds) * 100) : 0;
  const totalPaid = dashboardData?.payments?.totalPaid || 0;
  const totalPending = dashboardData?.payments?.totalPending || 0;
  const openComplaints = (dashboardData?.complaints?.Open || 0) + (dashboardData?.complaints?.InProgress || 0);
  const newComplaints = dashboardData?.complaints?.Open || 0;

  return (
    <>
      {/* Page Header with Filters */}
      <PageHeader title="Dashboard" description="Today's overview of hostel operations">
        <CustomFilterMultiSelect
          value={filterData.branchList}
          onChange={(e: React.ChangeEvent<{ value: number[] }>) => {
            setFilterData({ ...filterData, branchList: e.target.value as number[] });
          }}
          placeholder="Branch"
          menuItem={branchList.map((item) => ({
            title: item.branchName,
            value: Number(item.id),
          }))}
        />
        <DateRangeSelector
          handleChangeDate={(fromDate: string, toDate: string) => {
            setDateRange({ fromDate, toDate });
          }}
        />
      </PageHeader>

      {/* KPI Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            label="Total Beds"
            value={totalBeds}
            icon={<Bed size={20} />}
            accentColor={info[500]}
            loading={loading.cots}
            trend={{ value: `${available} available`, direction: 'neutral' }}
            onClick={() => openDetailModal('cots', 'totalCots')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            label="Occupancy"
            value={`${occupancyRate}%`}
            icon={<Percent size={20} />}
            accentColor={success[500]}
            loading={loading.cots}
            trend={{ value: `${occupied} occupied`, direction: occupancyRate >= 50 ? 'up' : 'down' }}
            onClick={() => openDetailModal('cots', 'occupied')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            label="Revenue"
            value={`₹${totalPaid.toLocaleString('en-IN')}`}
            icon={<IndianRupee size={20} />}
            accentColor={success[500]}
            loading={loading.payments}
            trend={{ value: `₹${totalPending.toLocaleString('en-IN')} pending`, direction: totalPending > 0 ? 'down' : 'up' }}
            onClick={() => openDetailModal('payments', 'totalPayments')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            label="Open Issues"
            value={openComplaints}
            icon={<AlertCircle size={20} />}
            accentColor={openComplaints > 0 ? errorColor[500] : success[500]}
            loading={loading.complaints}
            trend={{ value: `${newComplaints} new`, direction: newComplaints > 0 ? 'up' : 'neutral' }}
            onClick={() => openDetailModal('complaints', 'Open')}
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <OccupancyDonut
            cotsDetail={cotsDetail}
            loading={loading.cots}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <RevenueBarChart
            paymentsDetail={dashboardDataDetail?.paymentsDetail}
            loading={loading.payments}
          />
        </Grid>
      </Grid>

      {/* Quick Tables Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ComplaintsQuickTable
            complaintsDetail={dashboardDataDetail?.complaintsDetail}
            loading={loading.complaints}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <AdmissionsQuickTable
            bookingsDetail={dashboardDataDetail?.bookingsDetail}
            loading={loading.bookings}
          />
        </Grid>
      </Grid>

      {/* Detail Modals */}
      {detailModal?.type === 'payments' && (
        <DashboardPaymentsDetailModal
          open={true}
          onClose={closeModal}
          {...detailModal.params}
          type={detailModal.dataType}
          detailedData={dashboardDataDetail?.paymentsDetail}
        />
      )}
      {detailModal?.type === 'bookings' && (
        <DashboardBookingsDetailModal
          open={true}
          onClose={closeModal}
          {...detailModal.params}
          type={detailModal.dataType}
          detailedData={dashboardDataDetail?.bookingsDetail}
        />
      )}
      {detailModal?.type === 'cots' && (
        <DashboardCotsDetailModal
          open={true}
          onClose={closeModal}
          {...detailModal.params}
          type={detailModal.dataType}
          detailedData={dashboardDataDetail?.cotsDetail}
        />
      )}
      {detailModal?.type === 'complaints' && (
        <DashboardComplaintsDetailModal
          open={true}
          onClose={closeModal}
          {...detailModal.params}
          type={detailModal.dataType}
          detailedData={dashboardDataDetail?.complaintsDetail}
        />
      )}
    </>
  );
}
