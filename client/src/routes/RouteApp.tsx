import { Suspense, lazy } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { ROUTES } from '../configs/constants';
import AuthLayout from '../components/layouts/authLayout';
import DashboardLayout from '../components/layouts/dashboardLayout';
import LoadingPage from '../components/layouts/loadingPage';
import Loader from '../components/helpers/loader';
import NoAccess from '../components/helpers/NoAccess';
import { useStateValue } from '../providers/StateProvider';
import AxiosProvider from '../providers/AxiosProvider';

const Home = lazy(() => import('../pages/home'));
const PaymentStatus = lazy(() => import('../pages/home/paymentStatus'));
const NotFound = lazy(() => import('../pages/notFound'));
const Login = lazy(() => import('../pages/auth/login'));
const Complaint = lazy(() => import('../pages/complaint'));
const AdmissionList = lazy(() => import('../pages/admissions'));
const AdmissionConfirmation = lazy(() => import('../pages/admissions/admissionConfirm'));
const AdmissionTransfer = lazy(() => import('../pages/admissions/admissionTransfer'));
const CandidatePayments = lazy(() => import('../pages/admissions/candidatePayments'));
const CandidateEbCharges = lazy(() => import('../pages/admissions/ebCharges'));
const Branch = lazy(() => import('../pages/branch'));
const FeedBack = lazy(() => import('../pages/feedBack'));
const Vacate = lazy(() => import('../pages/vacate'));
const AmenitiesCategories = lazy(() => import('../pages/master/amenitiesCategory'));
const AmenitiesSubCategories = lazy(() => import('../pages/master/amenitiesSubCategory'));
const AmenitiesFacilities = lazy(() => import('../pages/master/amenitiesFacilities'));
const Roomtype = lazy(() => import('../pages/master/roomtype'));
const BathroomType = lazy(() => import('../pages/master/bathroomType'));
const CotType = lazy(() => import('../pages/master/cotType'));
const IssueCategory = lazy(() => import('../pages/master/IssueCategories'));
const IssueSubCategory = lazy(() => import('../pages/master/IssuesSubCategories'));
const PageList = lazy(() => import('../pages/master/PageList'));
const SharingType = lazy(() => import('../pages/master/SharingType'));
const MasterUserRole = lazy(() => import('../pages/master/MasterUserRole'));
const ServiceProviderCategory = lazy(() => import('../pages/master/serviceProviderCategory'));
const BulkUpload = lazy(() => import('../pages/master/bulkUpload'));
const BlackList = lazy(() => import('../pages/blackList'));
const UserRole = lazy(() => import('../pages/userRolePageAccess'));
const UserList = lazy(() => import('../pages/userList'));
const ServiceProvider = lazy(() => import('../pages/serviceProvider'));
const Announcements = lazy(() => import('../pages/announcements'));
const Attendance = lazy(() => import('../pages/attendance'));

function RouteApp() {
    const [{ pageAccess }]: any = useStateValue();
    const checkPageAccess = (path: string) => {
        return pageAccess?.find((fItem: any) => fItem?.pageUrl === path)?.accessLevel || '';
    }
    const Loading = <div className="text-center"><Loader /></div>
    return (
        <Suspense fallback={<LoadingPage />}>
            <AxiosProvider />
            <Routes>
                <Route path={ROUTES.AUTH.LOGIN} element={<AuthLayout />}>
                    <Route path={ROUTES.AUTH.LOGIN} element={<Login />} />
                </Route>

                <Route path={ROUTES.HOME.HOME} element={<DashboardLayout />}>
                    <Route index element={<Navigate to={ROUTES.HOME.DASHBOARD} replace />} />
                    <Route path={ROUTES.HOME.DASHBOARD} element={<Suspense fallback={Loading}>{checkPageAccess(ROUTES.HOME.DASHBOARD) === 'No' ? <NoAccess /> : <Home />}</Suspense>} />
                    <Route path={ROUTES.HOME.PAYMENT_STATUS} element={<Suspense fallback={Loading}>{checkPageAccess(ROUTES.HOME.PAYMENT_STATUS) === 'No' ? <NoAccess /> : <PaymentStatus />}</Suspense>} />
                    <Route path={ROUTES.HOME.COMPLAINTS} element={<Suspense fallback={Loading}>{checkPageAccess(ROUTES.HOME.COMPLAINTS) === 'No' ? <NoAccess /> : <Complaint PageAccess={checkPageAccess(ROUTES.HOME.COMPLAINTS)} />}</Suspense>} />
                    <Route path={ROUTES.HOME.ADMISSION.LIST} element={<Suspense fallback={Loading}>{checkPageAccess(ROUTES.HOME.ADMISSION.LIST) === 'No' ? <NoAccess /> : <AdmissionList PageAccess={checkPageAccess(ROUTES.HOME.ADMISSION.LIST)} />}</Suspense>} />
                    <Route path={ROUTES.HOME.ADMISSION.CONFIRMATION} element={<Suspense fallback={Loading}>{checkPageAccess(ROUTES.HOME.ADMISSION.CONFIRMATION) === 'No' ? <NoAccess /> : <AdmissionConfirmation PageAccess={checkPageAccess(ROUTES.HOME.ADMISSION.LIST)} />}</Suspense>} />
                    <Route path={ROUTES.HOME.ADMISSION.TRANSFER} element={<Suspense fallback={Loading}>{checkPageAccess(ROUTES.HOME.ADMISSION.TRANSFER) === 'No' ? <NoAccess /> : <AdmissionTransfer PageAccess={checkPageAccess(ROUTES.HOME.ADMISSION.TRANSFER)} />}</Suspense>} />
                    <Route path={ROUTES.HOME.ADMISSION.PAYMENTS} element={<Suspense fallback={Loading}>{checkPageAccess(ROUTES.HOME.ADMISSION.PAYMENTS) === 'No' ? <NoAccess /> : <CandidatePayments />}</Suspense>} />
                    <Route path={ROUTES.HOME.ADMISSION.EB_CHARGES} element={<Suspense fallback={Loading}>{checkPageAccess(ROUTES.HOME.ADMISSION.EB_CHARGES) === 'No' ? <NoAccess /> : <CandidateEbCharges PageAccess={checkPageAccess(ROUTES.HOME.ADMISSION.EB_CHARGES)} />}</Suspense>} />
                    <Route path={ROUTES.HOME.BRANCH} element={<Suspense fallback={Loading}>{checkPageAccess(ROUTES.HOME.BRANCH) === 'No' ? <NoAccess /> : <Branch PageAccess={checkPageAccess(ROUTES.HOME.BRANCH)} />}</Suspense>} />
                    <Route path={ROUTES.HOME.FEEDBACK} element={<Suspense fallback={Loading}>{checkPageAccess(ROUTES.HOME.FEEDBACK) === 'No' ? <NoAccess /> : <FeedBack PageAccess={checkPageAccess(ROUTES.HOME.FEEDBACK)} />}</Suspense>} />
                    <Route path={ROUTES.HOME.VACATE} element={<Suspense fallback={Loading}>{checkPageAccess(ROUTES.HOME.VACATE) === 'No' ? <NoAccess /> : <Vacate PageAccess={checkPageAccess(ROUTES.HOME.VACATE)} />}</Suspense>} />
                    <Route path={ROUTES.HOME.BLACKLIST} element={<Suspense fallback={Loading}>{checkPageAccess(ROUTES.HOME.BLACKLIST) === 'No' ? <NoAccess /> : <BlackList PageAccess={checkPageAccess(ROUTES.HOME.BLACKLIST)} />}</Suspense>} />
                    <Route path={ROUTES.HOME.ANNOUNCEMENTS} element={<Suspense fallback={Loading}>{checkPageAccess(ROUTES.HOME.ANNOUNCEMENTS) === 'No' ? <NoAccess /> : <Announcements />}</Suspense>} />
                    <Route path={ROUTES.HOME.ATTENDANCE} element={<Suspense fallback={Loading}>{checkPageAccess(ROUTES.HOME.ATTENDANCE) === 'No' ? <NoAccess /> : <Attendance />}</Suspense>} />
                    <Route path={ROUTES.HOME.MASTER.AMENITIES_CATEGORIES} element={<Suspense fallback={Loading}>{checkPageAccess(ROUTES.HOME.MASTER.AMENITIES_CATEGORIES) === 'No' ? <NoAccess /> : <AmenitiesCategories PageAccess={checkPageAccess(ROUTES.HOME.MASTER.AMENITIES_CATEGORIES)} />}</Suspense>} />
                    <Route path={ROUTES.HOME.MASTER.AMENITIES_SUB_CATEGORIES} element={<Suspense fallback={Loading}>{checkPageAccess(ROUTES.HOME.MASTER.AMENITIES_SUB_CATEGORIES) === 'No' ? <NoAccess /> : <AmenitiesSubCategories PageAccess={checkPageAccess(ROUTES.HOME.MASTER.AMENITIES_SUB_CATEGORIES)} />}</Suspense>} />
                    <Route path={ROUTES.HOME.MASTER.AMENITIES_FACILITIES} element={<Suspense fallback={Loading}>{checkPageAccess(ROUTES.HOME.MASTER.AMENITIES_FACILITIES) === 'No' ? <NoAccess /> : <AmenitiesFacilities PageAccess={checkPageAccess(ROUTES.HOME.MASTER.AMENITIES_FACILITIES)} />}</Suspense>} />
                    <Route path={ROUTES.HOME.MASTER.ROOM_TYPE} element={<Suspense fallback={Loading}>{checkPageAccess(ROUTES.HOME.MASTER.ROOM_TYPE) === 'No' ? <NoAccess /> : <Roomtype PageAccess={checkPageAccess(ROUTES.HOME.MASTER.ROOM_TYPE)} />}</Suspense>} />
                    <Route path={ROUTES.HOME.MASTER.BATHROOM_TYPE} element={<Suspense fallback={Loading}>{checkPageAccess(ROUTES.HOME.MASTER.BATHROOM_TYPE) === 'No' ? <NoAccess /> : <BathroomType PageAccess={checkPageAccess(ROUTES.HOME.MASTER.BATHROOM_TYPE)} />}</Suspense>} />
                    <Route path={ROUTES.HOME.MASTER.COT_TYPE} element={<Suspense fallback={Loading}>{checkPageAccess(ROUTES.HOME.MASTER.COT_TYPE) === 'No' ? <NoAccess /> : <CotType PageAccess={checkPageAccess(ROUTES.HOME.MASTER.COT_TYPE)} />}</Suspense>} />
                    <Route path={ROUTES.HOME.MASTER.ISSUE_CATEGORIES} element={<Suspense fallback={Loading}>{checkPageAccess(ROUTES.HOME.MASTER.ISSUE_CATEGORIES) === 'No' ? <NoAccess /> : <IssueCategory PageAccess={checkPageAccess(ROUTES.HOME.MASTER.ISSUE_CATEGORIES)} />}</Suspense>} />
                    <Route path={ROUTES.HOME.MASTER.ISSUE_SUB_CATEGORIES} element={<Suspense fallback={Loading}>{checkPageAccess(ROUTES.HOME.MASTER.ISSUE_SUB_CATEGORIES) === 'No' ? <NoAccess /> : <IssueSubCategory PageAccess={checkPageAccess(ROUTES.HOME.MASTER.ISSUE_SUB_CATEGORIES)} />}</Suspense>} />
                    <Route path={ROUTES.HOME.MASTER.PAGE_LIST} element={<Suspense fallback={Loading}>{checkPageAccess(ROUTES.HOME.MASTER.PAGE_LIST) === 'No' ? <NoAccess /> : <PageList PageAccess={checkPageAccess(ROUTES.HOME.MASTER.PAGE_LIST)} />}</Suspense>} />
                    <Route path={ROUTES.HOME.MASTER.SHARING_TYPE} element={<Suspense fallback={Loading}>{checkPageAccess(ROUTES.HOME.MASTER.SHARING_TYPE) === 'No' ? <NoAccess /> : <SharingType PageAccess={checkPageAccess(ROUTES.HOME.MASTER.SHARING_TYPE)} />}</Suspense>} />
                    <Route path={ROUTES.HOME.MASTER.MASTER_USER_ROLE} element={<Suspense fallback={Loading}>{checkPageAccess(ROUTES.HOME.MASTER.MASTER_USER_ROLE) === 'No' ? <NoAccess /> : <MasterUserRole PageAccess={checkPageAccess(ROUTES.HOME.MASTER.MASTER_USER_ROLE)} />}</Suspense>} />
                    <Route path={ROUTES.HOME.MASTER.SERVICE_PROVIDER_CATEGORY} element={<Suspense fallback={Loading}>{checkPageAccess(ROUTES.HOME.MASTER.SERVICE_PROVIDER_CATEGORY) === 'No' ? <NoAccess /> : <ServiceProviderCategory PageAccess={checkPageAccess(ROUTES.HOME.MASTER.SERVICE_PROVIDER_CATEGORY)} />}</Suspense>} />
                    <Route path={ROUTES.HOME.MASTER.BULK_UPLOAD} element={<Suspense fallback={Loading}>{checkPageAccess(ROUTES.HOME.MASTER.BULK_UPLOAD) === 'No' ? <NoAccess /> : <BulkUpload PageAccess={checkPageAccess(ROUTES.HOME.MASTER.BULK_UPLOAD)} />}</Suspense>} />
                    <Route path={ROUTES.HOME.USER.ROLE} element={<Suspense fallback={Loading}>{checkPageAccess(ROUTES.HOME.USER.ROLE) === 'No' ? <NoAccess /> : <UserRole PageAccess={checkPageAccess(ROUTES.HOME.USER.ROLE)} />}</Suspense>} />
                    <Route path={ROUTES.HOME.USER.LIST} element={<Suspense fallback={Loading}>{checkPageAccess(ROUTES.HOME.USER.LIST) === 'No' ? <NoAccess /> : <UserList />}</Suspense>} />
                    <Route path={ROUTES.HOME.USER.SERVICE_PROVIDER} element={<Suspense fallback={Loading}>{checkPageAccess(ROUTES.HOME.USER.SERVICE_PROVIDER) === 'No' ? <NoAccess /> : <ServiceProvider PageAccess={checkPageAccess(ROUTES.HOME.USER.SERVICE_PROVIDER)} />}</Suspense>} />
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </Suspense>
    );
}

export default RouteApp;
