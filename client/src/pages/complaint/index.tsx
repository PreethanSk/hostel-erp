import { MutableRefObject, useEffect, useRef, useState } from "react";
import { CustomAlert, getExportEXCEL } from '../../services/HelperService';
import { Button, FormControl, IconButton, MenuItem, Radio, Select, styled, TextField, Typography, Box, Divider, CircularProgress } from "@mui/material";
import Grid2 from '@mui/material/Grid2';
import { commonUploadFile, getAdminUserList, getBranchGridList, getBranchRoomsList, getComplaintsDetailsById, getComplaintsGridList, getMasterIssueCategory, getMasterIssueSubCategory, getServiceProvider, getServiceProviderCategory, insertUpdateComplaints } from "../../models";
import moment from "moment";
import { CustomAutoSelect, CustomFilterMultiSelect } from "../../components/helpers/CustomSelect";
import { ROUTES } from "../../configs/constants";
import { useStateValue } from "../../providers/StateProvider";
import DateRangeSelector from "../../components/helpers/DateRangeSelector";
import { ArrowLeft, Upload, X, Eye, MapPin, Home, BedDouble, UserCog, User, Phone, Calendar, Plus } from 'lucide-react';
import PageHeader from "../../components/shared/PageHeader";
import FilterBar from "../../components/shared/FilterBar";
import DataTable, { Column } from "../../components/shared/DataTable";
import SearchInput from "../../components/shared/SearchInput";
import ExportButton from "../../components/shared/ExportButton";
import StatusBadge from "../../components/shared/StatusBadge";
import FormField from "../../components/shared/FormField";
import DialogModal from "../../components/shared/DialogModal";
import { gray } from "../../theme/tokens";

const Input = styled('input')({ display: 'none' });

export default function Index({ PageAccess }: any) {
    const [{ user }]: any = useStateValue();
    const refDocument = useRef() as MutableRefObject<HTMLInputElement>;
    const [_branchList, _setBranchList] = useState<any>([]);
    const [_roomList, _setRoomList] = useState<any>([]);
    const [_cotList, _setCotList] = useState<any>([]);
    const [_issueList, _setIssueList] = useState<any>([]);
    const [_issueSubList, _setIssueSubList] = useState<any>([]);
    const [_adminList, _setAdminList] = useState<any>([]);

    const [_tableItems, _setTableItems] = useState<any>([]);
    const [_tableTotalCount, _setTableTotalCount] = useState(0);
    const [_tableLoading, _setTableLoading] = useState(true);
    const [_loading, _setLoading] = useState(false);
    const [_search, _setSearch] = useState('');
    const [_filterData, _setFilterData] = useState({ branchList: [], fromDate: moment().clone().startOf('month').format('YYYY-MM-DD'), toDate: moment().format('YYYY-MM-DD'), status: '' });
    const [_serviceCategory, _setServiceCategory] = useState([]);
    const [_serviceProvider, _setServiceProvider] = useState([]);
    const [_editForm, _setEditForm] = useState(false);
    const [_statusUpdate, _setStatusUpdate] = useState(false);
    const [_submitSave, _setSubmitSave] = useState({ clicked: false });
    const formObj = {
        edit: false, isActive: true,
        id: 0, branchRefId: 0, roomRefId: 0, cotRefId: 0,
        createdBy: "Admin", reportedBy: "",
        issueTypeRefId: 0, issueSubCategoryRefId: 0,
        complaintDescription: "", photosUrl: "",
        raisedByCandidateId: null, raisedByManagerId: null,
        raisedDateTime: moment(), lastUpdatedDateTime: moment(),
        lastUpdatedBy: (user?.firstName + " " + user?.lastName),
        complaintStatus: "Open",
        assignedTo: '', serviceCategoryId: '', serviceProviderId: '',
    };
    const [_formData, _setFormData] = useState<any>(formObj);
    const [_page, _setPage] = useState(1);
    const [_rowsPerPage, _setRowsPerPage] = useState(10);
    const [_descriptionModal, _setDescriptionModal] = useState({ open: false, description: "" });
    const [_viewModal, _setViewModal] = useState({ open: false, loading: false, data: null as any });

    const changeFilterData = (key: string, value: any) => {
        _setFilterData({ ..._filterData, [key]: value });
    };

    const changeFormData = (key: string, value: any) => {
        if (key === "raisedByManagerId") {
            const findItem = _adminList?.find((fItem: any) => fItem?.id === value);
            _setFormData({ ..._formData, [key]: value, reportedBy: findItem?.fullName });
        } else if (key === "assignedTo") {
            getProviderList(value);
            _setFormData({ ..._formData, [key]: value, serviceCategoryId: "", serviceProviderId: "" });
        } else if (key === "serviceCategoryId") {
            getProviderList(_formData?.assignedTo, value);
            _setFormData({ ..._formData, [key]: value, serviceProviderId: "" });
        } else {
            _setFormData({ ..._formData, [key]: value });
        }
    };

    const handleAddNew = () => {
        handleClearForm();
        _setEditForm(true);
    };

    const handleGoBack = () => {
        _setEditForm(false);
        _setSubmitSave({ clicked: false });
        handleClearForm();
    };

    const handleClearForm = () => {
        getGridList();
        _setLoading(false);
        _setEditForm(false);
        _setFormData(formObj);
        _setStatusUpdate(false);
    };

    const handleUpdateItem = (item: any) => {
        _setEditForm(true);
        getComplaintsDetailsById('', item?.id?.toString())
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    const data = resp?.data?.result?.length > 0 ? resp?.data?.result[0] : {};
                    _setFormData({ ...formObj, ...item, complaintDescription: item?.complaintDescription || data?.complaintDescription || "", assignedTo: data?.serviceProviderType, edit: true, moreDetails: { ...data }, update: data?.complaintStatus === "InProgress" ? true : false });
                }
            })
            .catch((err) => console.log(err));
    };

    const handleViewItem = (item: any) => {
        _setViewModal({ open: true, loading: true, data: null });
        getComplaintsDetailsById('', item?.id?.toString())
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    const data = resp?.data?.result?.length > 0 ? resp?.data?.result[0] : {};
                    _setViewModal({ open: true, loading: false, data: { ...item, ...data } });
                } else {
                    _setViewModal({ open: true, loading: false, data: item });
                }
            })
            .catch((err) => {
                console.log(err);
                _setViewModal({ open: true, loading: false, data: item });
            });
    };

    const removePhotosItem = (cIndex: number) => {
        let photosList = [..._formData?.photosUrl?.split(',').filter(Boolean)];
        photosList.splice(cIndex, 1);
        changeFormData('photosUrl', photosList?.join(','));
    };

    const onUpload = async (files: any) => {
        _setLoading(true);
        const _tempArr = [..._formData?.photosUrl?.split(',').filter(Boolean)];
        let imageList: any = [];
        for (let i = 0; i < files?.length; i++) {
            if (i === 50) break;
            const formData = new FormData();
            formData.append('file', files[i]);
            await commonUploadFile(formData)
                .then((response) => {
                    if (response.status === 200) imageList.push(response?.data?.file);
                })
                .catch(error => {
                    console.log(error.response);
                    CustomAlert("warning", error?.response?.data?.message);
                });
        }
        _tempArr.push(...imageList);
        changeFormData('photosUrl', _tempArr?.join(','));
        setTimeout(() => { refDocument.current.value = ''; }, 1000);
        await _setLoading(false);
    };

    const checkUpdateValidation = () => {
        if (!_formData?.id) { CustomAlert('warning', "Complaint not selected"); return false; }
        if (!_formData?.doYouWantTo) { CustomAlert('warning', "Do you want to?"); return false; }
        if (!_formData?.remarks) { CustomAlert('warning', "Remarks required"); return false; }
        if (_formData?.doYouWantTo === "Assign" && !_formData?.escortedBy) { CustomAlert('warning', "Escorted by required"); return false; }
        if (_formData?.doYouWantTo === "Assign" && !_formData?.assignedTo) { CustomAlert('warning', "Assign To required"); return false; }
        if (_formData?.doYouWantTo === "Assign" && !_formData?.serviceCategoryId) { CustomAlert('warning', "Service Category required"); return false; }
        if (_formData?.doYouWantTo === "Assign" && !_formData?.serviceProviderId) { CustomAlert('warning', "Service Provider required"); return false; }
        return true;
    };

    const checkValidation = () => {
        if (!_formData?.branchRefId) { CustomAlert('warning', "Branch not selected"); return false; }
        if (!_formData?.roomRefId) { CustomAlert('warning', "Room not selected"); return false; }
        if (!_formData?.cotRefId) { CustomAlert('warning', "Bed not selected"); return false; }
        if (!_formData?.createdBy) { CustomAlert('warning', "Created by not selected"); return false; }
        if (!_formData?.reportedBy) { CustomAlert('warning', "Reported by not selected"); return false; }
        if (!_formData?.issueTypeRefId) { CustomAlert('warning', "Category not selected"); return false; }
        if (!_formData?.issueSubCategoryRefId) { CustomAlert('warning', "Complaint type not selected"); return false; }
        if (!_formData?.complaintDescription) { CustomAlert('warning', "Description required"); return false; }
        return true;
    };

    const handleSubmitForm = () => {
        _setLoading(true);
        if (!checkValidation()) { _setLoading(false); return; }
        const body = {
            id: 0,
            branchRefId: _formData?.branchRefId || 0,
            roomRefId: _formData?.roomRefId || 0,
            cotRefId: _formData?.cotRefId || 0,
            createdBy: _formData?.createdBy || "",
            reportedBy: _formData?.reportedBy || "",
            issueTypeRefId: _formData?.issueTypeRefId || 0,
            issueSubCategoryRefId: _formData?.issueSubCategoryRefId || 0,
            complaintDescription: _formData?.complaintDescription || "",
            photosUrl: _formData?.photosUrl || "",
            raisedByCandidateId: null,
            raisedByManagerId: _formData?.createdBy === "Admin" ? (_formData?.raisedByManagerId || null) : null,
            raisedDateTime: moment(),
            lastUpdatedDateTime: moment(),
            lastUpdatedBy: (user?.firstName + " " + user?.lastName),
            complaintStatus: "Open",
        };
        insertUpdateComplaints(body)
            .then((resp) => {
                if (resp?.data?.status === "success") { CustomAlert("success", "Complaint registered"); handleClearForm(); }
            })
            .catch((err) => { console.log(err); CustomAlert("warning", err?.response?.data?.error); })
            .finally(() => _setLoading(false));
    };

    const handleSubmitUpdateForm = () => {
        _setLoading(true);
        if (!checkUpdateValidation()) { _setLoading(false); return; }
        const body = {
            id: _formData?.id,
            lastUpdatedDateTime: moment(),
            lastUpdatedBy: (user?.firstName + " " + user?.lastName),
            complaintStatus: (["Assign", "Re-Open"]?.includes(_formData?.doYouWantTo)) ? "Open" : _formData?.doYouWantTo,
            doYouWantTo: _formData?.doYouWantTo,
            assignedTo: _formData?.assignedTo || "",
            assignedName: _formData?.doYouWantTo === "Assign" ? (user?.firstName + " " + user?.lastName) : "",
            assignedBy: _formData?.doYouWantTo === "Assign" ? (user?.id + "") : "",
            assignedDateTime: _formData?.assignedDateTime || "",
            escortedBy: _formData?.escortedBy || "",
            remarks: _formData?.remarks || "",
            serviceProviderId: _formData?.serviceProviderId || "",
            serviceCategoryId: _formData?.serviceCategoryId || "",
            complaintDescription: _formData?.complaintDescription || "",
        };
        insertUpdateComplaints(body)
            .then((resp) => {
                if (resp?.data?.status === "success") { CustomAlert("success", `Complaint ${_formData?.doYouWantTo}`); handleClearForm(); }
            })
            .catch((err) => { console.log(err); CustomAlert("warning", err?.response?.data?.error); })
            .finally(() => _setLoading(false));
    };

    const getOtherList = () => {
        getMasterIssueCategory()
            .then((resp) => { if (resp?.data?.status === "success") _setIssueList(resp?.data?.result); })
            .catch(console.log);
        getMasterIssueSubCategory()
            .then((resp) => { if (resp?.data?.status === "success") _setIssueSubList([...resp?.data?.result]); })
            .catch(console.log);
        getAdminUserList()
            .then((resp) => { if (resp?.data?.status === "success") _setAdminList(resp?.data?.result?.results); })
            .catch(console.log);
        getBranchGridList()
            .then((resp) => { if (resp?.data?.status === "success") _setBranchList(resp?.data?.result?.results); })
            .catch(console.log);
        getServiceProviderCategory()
            .then((resp) => { if (resp?.data?.status === "success") _setServiceCategory(resp?.data?.result); })
            .catch(console.log);
    };

    const getGridList = () => {
        _setTableLoading(true);
        getComplaintsGridList(_page, _rowsPerPage, _filterData?.branchList?.join(','), _filterData?.status?.toString(), _filterData?.fromDate, _filterData?.toDate)
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    _setTableItems(resp?.data?.result?.results);
                    _setTableTotalCount(resp?.data?.result?.totalItems);
                }
            })
            .catch(console.log)
            .finally(() => _setTableLoading(false));
    };

    const getPrintTableHeadBody = () => {
        const header = ["S. No", "Complaint Id", "Branch", "Type", "Description", "Raised by", "Room No", "Raised Date & Time", "Last Update Date & Time", "Status"];
        const body = _tableItems?.map((item: any, index: number) => [
            index + 1, `#${item?.id}`, item?.branchName, item?.issueType,
            item?.complaintDescription || "-", item?.reportedBy, item?.roomNumber,
            item?.raisedDateTime ? moment(item?.raisedDateTime)?.format('DD-MMM-YYYY hh:mm A') : "",
            item?.lastUpdatedDateTime ? moment(item?.lastUpdatedDateTime)?.format('DD-MMM-YYYY hh:mm A') : "",
            item?.complaintStatus || "Open"
        ]);
        return { header, body };
    };

    const exportEXCEL = () => {
        const { header, body } = getPrintTableHeadBody();
        getExportEXCEL({ header, body, fileName: "Complaints" });
    };

    const handleUpdateSearch = (fromDate: string, toDate: string) => {
        _setFilterData({ ..._filterData, fromDate, toDate });
    };

    const getProviderList = (assignedTo = '', serviceCategoryId = '') => {
        getServiceProvider({ type: assignedTo || '', categoryId: serviceCategoryId || "" })
            .then((resp) => { if (resp?.data?.status === "success") _setServiceProvider(resp?.data?.result?.data); })
            .catch(console.log);
    };

    useEffect(() => {
        if (_formData?.branchRefId) {
            getBranchRoomsList(_formData?.branchRefId, 'admin')
                .then((resp) => {
                    if (resp?.data?.status === "success") {
                        _setRoomList(resp?.data?.result);
                        if (_formData?.cotRefId) {
                            const tempArr = resp?.data?.result?.find((fItem: any) => fItem?.id === _formData?.roomRefId)?.Cots;
                            _setCotList([...tempArr]);
                        }
                    }
                })
                .catch(console.log);
        }
    }, [_formData?.branchRefId]);

    useEffect(() => { getOtherList(); getProviderList(); }, []);
    useEffect(() => { getGridList(); }, [_page, _rowsPerPage, _filterData]);

    const filteredItems = _tableItems?.filter((content: any) => {
        const lowerSearchInput = _search?.toLowerCase()?.trim();
        return lowerSearchInput === '' || Object?.values(content)?.some((value: any) =>
            value?.toString()?.toLowerCase()?.includes(lowerSearchInput)
        );
    });

    const columns: Column<any>[] = [
        {
            id: 'sno', label: 'S.No', width: 60,
            render: (_row: any, index: number) => (index + 1) + ((_page - 1) * _rowsPerPage)
        },
        {
            id: 'action', label: 'Action', width: 140, align: 'center',
            render: (row: any) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }} onClick={(e) => e.stopPropagation()}>
                    <Button size="small" startIcon={<Eye size={14} />} onClick={() => handleViewItem(row)}
                        sx={{ textTransform: 'none', fontSize: '13px', color: gray[600] }}>View</Button>
                    {PageAccess === 'Write' && (
                        <Button size="small" onClick={() => handleUpdateItem(row)}
                            sx={{ textTransform: 'none', fontSize: '13px', color: gray[600] }}>Edit</Button>
                    )}
                </Box>
            )
        },
        {
            id: 'status', label: 'Status', align: 'center', width: 130,
            render: (row: any) => (
                <Box onClick={(e) => e.stopPropagation()}>
                    <StatusBadge status={row?.complaintStatus || "Open"} />
                </Box>
            )
        },
        { id: 'id', label: 'Complaint Id', render: (row: any) => `#${row?.id}` },
        { id: 'branch', label: 'Branch', render: (row: any) => row?.branchName },
        { id: 'type', label: 'Type', render: (row: any) => row?.issueType },
        {
            id: 'description', label: 'Description', width: 200,
            render: (row: any) => (
                <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row?.complaintDescription || "-"}
                </Typography>
            )
        },
        { id: 'raisedBy', label: 'Raised by', render: (row: any) => row?.reportedBy },
        { id: 'room', label: 'Room No', render: (row: any) => row?.roomNumber },
        { id: 'raisedDate', label: 'Raised Date & Time', render: (row: any) => row?.raisedDateTime ? moment(row?.raisedDateTime)?.format('DD-MMM-YYYY hh:mm A') : '' },
        { id: 'lastUpdate', label: 'Last Update Date & Time', render: (row: any) => row?.lastUpdatedDateTime ? moment(row?.lastUpdatedDateTime)?.format('DD-MMM-YYYY hh:mm A') : '' },
    ];

    // --- LIST VIEW ---
    if (!_editForm) {
        return (
            <Box sx={{ p: 3 }}>
                <PageHeader title="Complaints">
                    {PageAccess === 'Write' && (
                        <Button variant="contained" startIcon={<Plus size={16} />} onClick={handleAddNew}
                            sx={{ textTransform: 'none' }}>Add New</Button>
                    )}
                </PageHeader>

                <FilterBar>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                        {['', 'Open', 'InProgress', 'Hold', 'Closed', 'Reject'].map((status, index) => (
                            <Button key={index} size="small" variant={_filterData?.status === status ? 'contained' : 'text'}
                                onClick={() => changeFilterData('status', status)}
                                sx={{
                                    textTransform: 'none', fontSize: '13px', minWidth: 'auto', px: 1.5,
                                    ..._filterData?.status !== status && { color: gray[600] },
                                }}>
                                {status || 'All'}
                            </Button>
                        ))}
                    </Box>
                    <Box sx={{ flex: 1 }} />
                    <CustomFilterMultiSelect value={_filterData?.branchList?.map((mItem: any) => Number(mItem))}
                        onChange={(e: any) => changeFilterData('branchList', e.target.value || '')}
                        placeholder={"Branch"}
                        menuItem={_branchList?.map((item: any) => item?.isActive ? { title: (item?.branchName || ''), value: item?.id } : null).filter(Boolean)} />
                    <DateRangeSelector handleChangeDate={handleUpdateSearch} />
                    <SearchInput value={_search} onChange={(value: string) => _setSearch(value)} placeholder="Search complaints..." />
                    <ExportButton onExport={exportEXCEL} />
                </FilterBar>

                <DataTable
                    columns={columns}
                    data={filteredItems || []}
                    loading={_tableLoading}
                    totalCount={_tableTotalCount}
                    page={_page}
                    rowsPerPage={_rowsPerPage}
                    onPageChange={(p) => _setPage(p)}
                    onRowsPerPageChange={(s) => _setRowsPerPage(s)}
                    onRowClick={(row) => {
                        if (row?.complaintDescription) _setDescriptionModal({ open: true, description: row.complaintDescription });
                    }}
                    emptyTitle="No complaints found"
                    emptyDescription="Try adjusting your filters or add a new complaint."
                />

                {/* Description Modal */}
                <DialogModal open={_descriptionModal.open} onClose={() => _setDescriptionModal({ open: false, description: "" })}
                    title="Complaint Description" maxWidth="md">
                    <Box sx={{ p: 2, backgroundColor: gray[50], borderRadius: 1, minHeight: 100, maxHeight: 400, overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {_descriptionModal.description || "No description available"}
                    </Box>
                </DialogModal>

                {/* View Modal */}
                <DialogModal open={_viewModal.open} onClose={() => _setViewModal({ open: false, loading: false, data: null })}
                    title={`Complaint Details - #${_viewModal.data?.id || ""}`} maxWidth="lg">
                    {_viewModal.loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                            <CircularProgress />
                        </Box>
                    ) : _viewModal.data ? (
                        <Grid2 container spacing={3}>
                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <FormField label="Complaint ID">
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>#{_viewModal.data?.id}</Typography>
                                </FormField>
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <FormField label="Status">
                                    <StatusBadge status={_viewModal.data?.complaintStatus || "Open"} />
                                </FormField>
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <FormField label="Branch Name">
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{_viewModal.data?.branchName || "-"}</Typography>
                                </FormField>
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <FormField label="Room Number">
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{_viewModal.data?.roomNumber || "-"}</Typography>
                                </FormField>
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <FormField label="Bed Number">
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{_viewModal.data?.cotNumber || "-"}</Typography>
                                </FormField>
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <FormField label="Category">
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{_viewModal.data?.issueType || _viewModal.data?.moreDetails?.issueType || "-"}</Typography>
                                </FormField>
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <FormField label="Sub Category">
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{_viewModal.data?.subCategoryName || _viewModal.data?.moreDetails?.subCategoryName || "-"}</Typography>
                                </FormField>
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <FormField label="Created By">
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{_viewModal.data?.createdBy || _viewModal.data?.moreDetails?.createdBy || "-"}</Typography>
                                </FormField>
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <FormField label="Reported By">
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{_viewModal.data?.reportedBy || _viewModal.data?.moreDetails?.reportedBy || "-"}</Typography>
                                </FormField>
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <FormField label="Resident Name">
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{_viewModal.data?.candidateName || "-"}</Typography>
                                </FormField>
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <FormField label="Mobile Number">
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{_viewModal.data?.candidateMobileNumber || _viewModal.data?.managerMobileNumber || "-"}</Typography>
                                </FormField>
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <FormField label="Raised Date & Time">
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{_viewModal.data?.raisedDateTime ? moment(_viewModal.data.raisedDateTime).format('DD-MMM-YYYY hh:mm A') : "-"}</Typography>
                                </FormField>
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <FormField label="Last Updated Date & Time">
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{_viewModal.data?.lastUpdatedDateTime ? moment(_viewModal.data.lastUpdatedDateTime).format('DD-MMM-YYYY hh:mm A') : "-"}</Typography>
                                </FormField>
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <FormField label="Assigned Date & Time">
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{_viewModal.data?.assignedDateTime ? moment(_viewModal.data.assignedDateTime).format('DD-MMM-YYYY hh:mm A') : "-"}</Typography>
                                </FormField>
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <FormField label="Closed Date & Time">
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{_viewModal.data?.closedDateTime ? moment(_viewModal.data.closedDateTime).format('DD-MMM-YYYY hh:mm A') : "-"}</Typography>
                                </FormField>
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <FormField label="Assigned To">
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{_viewModal.data?.assignedToName || _viewModal.data?.managerName || "-"}</Typography>
                                </FormField>
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <FormField label="Assigned By">
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{_viewModal.data?.assignedBy || "-"}</Typography>
                                </FormField>
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <FormField label="Service Provider Type">
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{_viewModal.data?.serviceProviderType || "-"}</Typography>
                                </FormField>
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <FormField label="Service Provider">
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{_viewModal.data?.serviceProviderName || "-"}</Typography>
                                </FormField>
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <FormField label="Service Category">
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{_viewModal.data?.serviceCategoryName || "-"}</Typography>
                                </FormField>
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <FormField label="Escorted By">
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{_viewModal.data?.escortedBy || "-"}</Typography>
                                </FormField>
                            </Grid2>
                            <Grid2 size={12}>
                                <FormField label="Complaint Description">
                                    <Box sx={{ p: 2, backgroundColor: gray[50], borderRadius: 1, minHeight: 80, maxHeight: 200, overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                        {_viewModal.data?.complaintDescription || "-"}
                                    </Box>
                                </FormField>
                            </Grid2>
                            <Grid2 size={12}>
                                <FormField label="Remarks">
                                    <Box sx={{ p: 2, backgroundColor: gray[50], borderRadius: 1, minHeight: 80, maxHeight: 200, overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                        {_viewModal.data?.remarks || "-"}
                                    </Box>
                                </FormField>
                            </Grid2>
                            <Grid2 size={12}>
                                <FormField label="Submitted Photos">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                                        {_viewModal.data?.photosUrl?.split(',')?.filter(Boolean)?.map((photo: string, index: number) => (
                                            <Box key={index} component="img" draggable={false}
                                                src={ROUTES.API.DOWNLOAD_FILE + `${photo}`} alt={`Photo ${index + 1}`}
                                                sx={{ height: 120, width: 120, objectFit: 'cover', borderRadius: 1, border: `1px solid ${gray[200]}`, cursor: 'pointer' }}
                                                onClick={() => window.open(ROUTES.API.DOWNLOAD_FILE + `${photo}`, '_blank')} />
                                        ))}
                                        {(!_viewModal.data?.photosUrl || _viewModal.data?.photosUrl?.split(',')?.filter(Boolean)?.length === 0) && (
                                            <Typography variant="body2" color="text.secondary">No photos available</Typography>
                                        )}
                                    </Box>
                                </FormField>
                            </Grid2>
                            {_viewModal.data?.resolvedPhotoUrl && (
                                <Grid2 size={12}>
                                    <FormField label="Resolved Photos">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                                            {_viewModal.data?.resolvedPhotoUrl?.split(',')?.filter(Boolean)?.map((photo: string, index: number) => (
                                                <Box key={index} component="img" draggable={false}
                                                    src={ROUTES.API.DOWNLOAD_FILE + `${photo}`} alt={`Resolved Photo ${index + 1}`}
                                                    sx={{ height: 120, width: 120, objectFit: 'cover', borderRadius: 1, border: `1px solid ${gray[200]}`, cursor: 'pointer' }}
                                                    onClick={() => window.open(ROUTES.API.DOWNLOAD_FILE + `${photo}`, '_blank')} />
                                            ))}
                                        </Box>
                                    </FormField>
                                </Grid2>
                            )}
                        </Grid2>
                    ) : (
                        <Typography variant="body2" sx={{ textAlign: 'center', py: 5, color: gray[500] }}>No data available</Typography>
                    )}
                </DialogModal>
            </Box>
        );
    }

    // --- EDIT / ADD FORM ---
    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ backgroundColor: gray[50], border: `1px solid ${gray[200]}`, borderRadius: 2, px: 4, py: 1 }}>
                {/* Back header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2, borderBottom: `1px solid ${gray[200]}`, cursor: 'pointer' }}
                    onClick={handleGoBack}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ArrowLeft size={20} />
                        <Typography sx={{ fontWeight: 600 }}>Back</Typography>
                    </Box>
                    {_formData?.id ? <Typography variant="body2">Complaint Id: <strong>#{_formData?.id}</strong></Typography> : null}
                </Box>

                {/* NEW COMPLAINT FORM */}
                {_formData?.id === 0 && (
                    <>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 3 }}>
                            <Typography sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Complaint Details</Typography>
                            <Divider sx={{ flex: 1 }} />
                        </Box>

                        <Grid2 container spacing={3}>
                            <Grid2 size={{ xs: 12, md: 3 }}>
                                <FormField label="Branch" required>
                                    <FormControl fullWidth>
                                        <Select size="small" value={_formData?.branchRefId} onChange={(e) => changeFormData("branchRefId", e.target.value)}>
                                            {_branchList?.map((mItem: any, mIndex: number) =>
                                                <MenuItem key={mIndex} value={mItem?.id}>{mItem?.branchName}</MenuItem>
                                            )}
                                        </Select>
                                    </FormControl>
                                </FormField>
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 2 }}>
                                <FormField label="Room" required>
                                    <FormControl fullWidth>
                                        <Select size="small" value={_formData?.roomRefId}>
                                            {_roomList?.map((mItem: any, mIndex: number) =>
                                                <MenuItem key={mIndex} value={mItem?.id} onClick={() => {
                                                    _setCotList([...mItem?.Cots]);
                                                    _setFormData({ ..._formData, roomRefId: mItem?.id, roomTypeName: mItem?.roomTypeName });
                                                }}>{mItem?.roomNumber}</MenuItem>
                                            )}
                                        </Select>
                                    </FormControl>
                                </FormField>
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 2 }}>
                                <FormField label="Bed" required>
                                    <FormControl fullWidth>
                                        <Select size="small" value={_formData?.cotRefId}>
                                            {_cotList?.map((mItem: any, mIndex: number) =>
                                                <MenuItem key={mIndex} value={mItem?.id} onClick={() => changeFormData('cotRefId', mItem?.id)}>{mItem?.cotNumber} - {mItem?.CotType?.type}</MenuItem>
                                            )}
                                        </Select>
                                    </FormControl>
                                </FormField>
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 2 }}>
                                <FormField label="Created By" required>
                                    <CustomAutoSelect value={_formData?.createdBy}
                                        onChange={(value: any) => changeFormData("createdBy", value)}
                                        menuItem={['Admin']?.map((item: any) => ({ title: item, value: item }))} />
                                </FormField>
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 3 }}>
                                <FormField label="Reported By" required>
                                    <CustomAutoSelect value={_formData?.raisedByManagerId}
                                        onChange={(value: any) => changeFormData("raisedByManagerId", value)}
                                        menuItem={_adminList?.map((item: any) => ({ title: item?.fullName + `(${item?.roleName})`, value: item?.id }))} />
                                </FormField>
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 3 }}>
                                <FormField label="Category" required>
                                    <CustomAutoSelect value={_formData?.issueTypeRefId}
                                        onChange={(value: any) => changeFormData("issueTypeRefId", value)}
                                        menuItem={_issueList?.map((item: any) => item?.isActive ? { title: item?.issueType, value: item?.id } : null)?.filter(Boolean)} />
                                </FormField>
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 3 }}>
                                <FormField label="Complaint Type" required>
                                    <CustomAutoSelect value={_formData?.issueSubCategoryRefId}
                                        onChange={(value: any) => changeFormData("issueSubCategoryRefId", value)}
                                        menuItem={_issueSubList?.map((item: any) => item?.isActive ? { title: item?.subCategoryName, value: item?.id } : null)?.filter(Boolean)} />
                                </FormField>
                            </Grid2>
                            <Grid2 size={12}>
                                <FormField label="Complaint Description" required>
                                    <TextField fullWidth size="small" multiline minRows={2}
                                        value={_formData?.complaintDescription} onChange={(e: any) => changeFormData('complaintDescription', e.target.value)} />
                                </FormField>
                            </Grid2>
                            <Grid2 size={12}>
                                <FormField label="Submitted Photos">
                                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                                        {_formData?.photosUrl?.split(',')?.filter(Boolean)?.map((cItem: any, cIndex: number) => (
                                            <Box key={cIndex} sx={{ position: 'relative' }}>
                                                {cItem ? (
                                                    <Box component="img" draggable={false} src={ROUTES.API.DOWNLOAD_FILE + `${cItem}`} alt="photo"
                                                        sx={{ height: 90, width: 90, objectFit: 'cover', borderRadius: 1, border: `1px solid ${gray[200]}` }} />
                                                ) : (
                                                    <Box sx={{ height: 90, width: 90, borderRadius: 1, border: `1px solid ${gray[200]}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Typography variant="caption">None</Typography>
                                                    </Box>
                                                )}
                                                <IconButton size="small" onClick={() => removePhotosItem(cIndex)}
                                                    sx={{ position: 'absolute', right: -8, top: -8, backgroundColor: '#fff', border: `1px solid ${gray[300]}`, '&:hover': { backgroundColor: gray[100] } }}>
                                                    <X size={12} />
                                                </IconButton>
                                            </Box>
                                        ))}
                                        <Button component="label" variant="outlined" startIcon={<Upload size={16} />}
                                            sx={{ textTransform: 'none', color: gray[700], borderColor: gray[300] }}>
                                            Upload Photos
                                            <Input style={{ visibility: 'hidden', position: 'absolute' }} accept={'image/*'} type="file" ref={refDocument} multiple onChange={(e: any) => onUpload(e.target.files)} />
                                        </Button>
                                    </Box>
                                </FormField>
                            </Grid2>
                        </Grid2>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, py: 3 }}>
                            <Button variant="outlined" onClick={handleClearForm}
                                sx={{ textTransform: 'none', px: 4, color: 'black', borderColor: gray[300] }}>Cancel</Button>
                            <Button variant="contained" color="primary" onClick={handleSubmitForm} disabled={_loading}
                                sx={{ textTransform: 'none', px: 4 }}>Submit</Button>
                        </Box>
                    </>
                )}

                {/* EDIT EXISTING COMPLAINT */}
                {_formData?.edit && (
                    <>
                        {/* Summary card */}
                        <Box sx={{ my: 3, backgroundColor: '#fff', borderRadius: 2, boxShadow: 1, p: 3 }}>
                            <Grid2 container spacing={3}>
                                <Grid2 size={{ xs: 12, md: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                        <MapPin size={16} color={gray[500]} />
                                        <Typography variant="caption" color="text.secondary">Branch Name</Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600, ml: 3 }}>{_formData?.moreDetails?.branchName}</Typography>
                                </Grid2>
                                <Grid2 size={{ xs: 12, md: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                        <Home size={16} color={gray[500]} />
                                        <Typography variant="caption" color="text.secondary">Room</Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600, ml: 3 }}>{_formData?.moreDetails?.roomNumber}</Typography>
                                </Grid2>
                                <Grid2 size={{ xs: 12, md: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                        <BedDouble size={16} color={gray[500]} />
                                        <Typography variant="caption" color="text.secondary">Bed</Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600, ml: 3 }}>{_formData?.moreDetails?.cotNumber}</Typography>
                                </Grid2>
                                <Grid2 size={{ xs: 12, md: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                        <UserCog size={16} color={gray[500]} />
                                        <Typography variant="caption" color="text.secondary">Created By</Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600, ml: 3 }}>{_formData?.moreDetails?.createdBy}</Typography>
                                </Grid2>
                                <Grid2 size={{ xs: 12, md: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                        <User size={16} color={gray[500]} />
                                        <Typography variant="caption" color="text.secondary">Reported By</Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600, ml: 3 }}>{_formData?.moreDetails?.reportedBy}</Typography>
                                </Grid2>
                                <Grid2 size={{ xs: 12, md: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                        <Phone size={16} color={gray[500]} />
                                        <Typography variant="caption" color="text.secondary">Mobile Number</Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600, ml: 3 }}>{_formData?.moreDetails?.raisedByManagerId ? _formData?.moreDetails?.managerMobileNumber : _formData?.moreDetails?.candidateMobileNumber}</Typography>
                                </Grid2>
                            </Grid2>
                        </Box>

                        {/* Two-column layout: Complaint Details | Status Update */}
                        <Grid2 container spacing={3} sx={{ my: 2 }}>
                            {/* Left: Complaint Details */}
                            <Grid2 size={{ xs: 12, md: 6 }} sx={{ borderRight: { md: `1px solid ${gray[200]}` }, pr: { md: 3 } }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Typography sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Complaint Details</Typography>
                                    <Divider sx={{ flex: 1 }} />
                                </Box>
                                <Grid2 container spacing={3}>
                                    <Grid2 size={{ xs: 12, md: 6 }}>
                                        <FormField label="Category">
                                            <TextField fullWidth size="small" value={_formData?.moreDetails?.issueType}
                                                slotProps={{ input: { readOnly: true } }} />
                                        </FormField>
                                    </Grid2>
                                    <Grid2 size={{ xs: 12, md: 6 }}>
                                        <FormField label="Complaint Type">
                                            <TextField fullWidth size="small" value={_formData?.moreDetails?.subCategoryName}
                                                slotProps={{ input: { readOnly: true } }} />
                                        </FormField>
                                    </Grid2>
                                    <Grid2 size={12}>
                                        <FormField label="Complaint Description">
                                            <TextField fullWidth size="small" multiline minRows={2}
                                                value={_formData?.complaintDescription || _formData?.moreDetails?.complaintDescription || ""}
                                                onChange={(e: any) => changeFormData('complaintDescription', e.target.value)} />
                                        </FormField>
                                    </Grid2>
                                    <Grid2 size={12}>
                                        <FormField label="Submitted Photos">
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                                                {_formData?.moreDetails?.photosUrl?.split(',')?.filter(Boolean)?.map((cItem: any, cIndex: number) => (
                                                    <Box key={cIndex}>
                                                        {cItem ? (
                                                            <Box component="img" draggable={false} src={ROUTES.API.DOWNLOAD_FILE + `${cItem}`} alt="photo"
                                                                sx={{ height: 90, width: 90, objectFit: 'cover', borderRadius: 1, border: `1px solid ${gray[200]}` }} />
                                                        ) : (
                                                            <Box sx={{ height: 90, width: 90, borderRadius: 1, border: `1px solid ${gray[200]}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <Typography variant="caption">None</Typography>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                ))}
                                            </Box>
                                        </FormField>
                                    </Grid2>
                                </Grid2>
                            </Grid2>

                            {/* Right: Status Update */}
                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Typography sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Complaint Status Update</Typography>
                                    <Divider sx={{ flex: 1 }} />
                                </Box>
                                <Grid2 container spacing={3}>
                                    <Grid2 size={{ xs: 12, md: 6 }}>
                                        <FormField label="Do you want to?" required>
                                            <FormControl fullWidth>
                                                <Select size="small" value={_formData?.doYouWantTo || ''} onChange={(e) => changeFormData("doYouWantTo", e.target.value)}>
                                                    {['Assign', 'Reject', 'Closed', 'Hold', 'Re-Open']?.map((mItem: any, mIndex: number) =>
                                                        <MenuItem key={mIndex} value={mItem}>{mItem}</MenuItem>
                                                    )}
                                                </Select>
                                            </FormControl>
                                        </FormField>
                                    </Grid2>
                                    {_formData?.doYouWantTo === "Assign" && (
                                        <>
                                            <Grid2 size={{ xs: 12, md: 6 }}>
                                                <FormField label="Assign To" required>
                                                    <FormControl fullWidth>
                                                        <Select size="small" value={_formData?.assignedTo || ''} onChange={(e) => changeFormData("assignedTo", e.target.value)}>
                                                            {['Internal', 'External']?.map((mItem: any, mIndex: number) =>
                                                                <MenuItem key={mIndex} value={mItem}>{mItem}</MenuItem>
                                                            )}
                                                        </Select>
                                                    </FormControl>
                                                </FormField>
                                            </Grid2>
                                            <Grid2 size={{ xs: 12, md: 6 }}>
                                                <FormField label="Service Category" required>
                                                    <FormControl fullWidth>
                                                        <Select size="small" value={_formData?.serviceCategoryId || ''} onChange={(e) => changeFormData("serviceCategoryId", e.target.value)}>
                                                            {_serviceCategory?.map((mItem: any, mIndex: number) =>
                                                                <MenuItem key={mIndex} value={mItem?.id}>{mItem?.name}</MenuItem>
                                                            )}
                                                        </Select>
                                                    </FormControl>
                                                </FormField>
                                            </Grid2>
                                            <Grid2 size={{ xs: 12, md: 6 }}>
                                                <FormField label="Service Provider" required>
                                                    <CustomAutoSelect placeholder=" " value={_formData?.serviceProviderId}
                                                        onChange={(value: any) => changeFormData('serviceProviderId', value || '')}
                                                        menuItem={_serviceProvider?.map((item: any) => ({ title: item?.contactPerson, value: item?.id }))} />
                                                </FormField>
                                            </Grid2>
                                        </>
                                    )}
                                    <Grid2 size={12}>
                                        <FormField label="Remarks" required>
                                            <TextField fullWidth size="small" multiline minRows={2}
                                                value={_formData?.remarks || ''} onChange={(e) => changeFormData("remarks", e.target.value)} />
                                        </FormField>
                                    </Grid2>
                                    {_formData?.doYouWantTo === "Assign" && (
                                        <Grid2 size={{ xs: 12, md: 6 }}>
                                            <FormField label="Supervised by" required>
                                                <TextField fullWidth size="small"
                                                    value={_formData?.escortedBy || ''} onChange={(e) => changeFormData("escortedBy", e.target.value)} />
                                            </FormField>
                                        </Grid2>
                                    )}
                                    {_formData?.update && (
                                        <Grid2 size={{ xs: 12, md: 8 }}>
                                            <FormField label="Complaint Status">
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <StatusBadge status={_formData?.complaintStatus} />
                                                    <Typography variant="body2" sx={{ color: 'primary.main', textDecoration: 'underline', cursor: 'pointer' }}
                                                        onClick={() => _setStatusUpdate(true)}>Update Status</Typography>
                                                </Box>
                                            </FormField>
                                        </Grid2>
                                    )}
                                </Grid2>

                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, py: 3 }}>
                                    <Button variant="outlined" onClick={handleClearForm}
                                        sx={{ textTransform: 'none', px: 4, color: 'black', borderColor: gray[300] }}>Cancel</Button>
                                    <Button variant="contained" color="primary" onClick={handleSubmitUpdateForm} disabled={_loading}
                                        sx={{ textTransform: 'none', px: 4 }}>Submit</Button>
                                </Box>
                            </Grid2>
                        </Grid2>
                    </>
                )}
            </Box>

            {/* Status Update Dialog */}
            <DialogModal open={_statusUpdate} onClose={() => _setStatusUpdate(false)} title="Complaint Status" maxWidth="xs">
                <Box sx={{ py: 1 }}>
                    {[
                        { value: 'InProgress', label: 'In Progress' },
                        { value: 'Hold', label: 'Hold' },
                        { value: 'Reject', label: 'Rejected' },
                        { value: 'Closed', label: 'Resolved' },
                        { value: 'Open', label: 'Re-Assign' },
                    ].map((item) => (
                        <Box key={item.value} sx={{ py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <StatusBadge status={item.value} />
                            <Radio value={item.value} checked={_formData?.doYouWantTo === item.value}
                                onChange={(e) => changeFormData("doYouWantTo", e.target.value)} size="small" />
                        </Box>
                    ))}
                    <FormField label="Remarks" required>
                        <TextField fullWidth size="small" multiline minRows={2}
                            value={_formData?.remarks || ''} onChange={(e) => changeFormData("remarks", e.target.value)} />
                    </FormField>
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                        <Button variant="contained" color="primary" onClick={handleSubmitUpdateForm} disabled={_loading}
                            sx={{ textTransform: 'none', px: 4 }}>Update</Button>
                    </Box>
                </Box>
            </DialogModal>
        </Box>
    );
}
