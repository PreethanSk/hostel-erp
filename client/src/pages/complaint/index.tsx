import { MutableRefObject, useEffect, useRef, useState } from "react";
import { CustomAlert, customRadio, customTableHeader, CustomTableHover, customTableTemplate, getExportEXCEL, textFieldStyle } from '../../services/HelperService';
import { Button, FormControl, MenuItem, Pagination, PaginationItem, Radio, Select, styled, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material";
import { commonUploadFile, getAdminUserList, getBranchGridList, getBranchRoomsList, getComplaintsDetailsById, getComplaintsGridList, getMasterIssueCategory, getMasterIssueSubCategory, getServiceProvider, getServiceProviderCategory, insertUpdateComplaints } from "../../models";
import moment from "moment";
import { IMAGES_ICON } from "../../assets/images/exportImages";
import CustomSelect, { CustomAutoSelect, CustomFilterMultiSelect } from "../../components/helpers/CustomSelect";
import { SkeletonProviderTables } from "../../providers/SkeletonProvider";
import { ROUTES } from "../../configs/constants";
import { useStateValue } from "../../providers/StateProvider";
import CustomDialogue from "../../components/helpers/CustomDialogue";
import DateRangeSelector from "../../components/helpers/DateRangeSelector";
import CustomSearch from "../../components/helpers/CustomSearch";

const Input = styled('input')({
    display: 'none',
});
export default function Index({ PageAccess }: any) {
    const [{ user }]: any = useStateValue()
    const refDocument = useRef() as MutableRefObject<HTMLInputElement>;
    const [_branchList, _setBranchList] = useState<any>([]);
    const [_roomList, _setRoomList] = useState<any>([]);
    const [_cotList, _setCotList] = useState<any>([]);
    const [_issueList, _setIssueList] = useState<any>([]);
    const [_issueSubList, _setIssueSubList] = useState<any>([]);
    const [_adminList, _setAdminList] = useState<any>([]);

    const [_tableItems, _setTableItems] = useState<any>([]);
    const [_tableTotalCount, _setTableTotalCount] = useState(0);
    const [_pageList, _setPageList] = useState<any>([]);
    const [_tableLoading, _setTableLoading] = useState(true);
    const [_loading, _setLoading] = useState(false);
    const [_search, _setSearch] = useState('');
    const [_filterData, _setFilterData] = useState({ branchList: [], fromDate: moment().clone().startOf('month').format('YYYY-MM-DD'), toDate: moment().format('YYYY-MM-DD'), status: '' });
    const [_serviceCategory, _setServiceCategory] = useState([]);
    const [_serviceProvider, _setServiceProvider] = useState([]);
    const [_editForm, _setEditForm] = useState(false);
    const [_addScreen, _setAddScreen] = useState(false);
    const [_statusUpdate, _setStatusUpdate] = useState(false);
    const [_selectedTab, _setSelectedTab] = useState(1);
    const [_submitSave, _setSubmitSave] = useState({ clicked: false });
    const formObj = {
        edit: false, isActive: true,
        id: 0,
        branchRefId: 0,
        roomRefId: 0,
        cotRefId: 0,
        createdBy: "Admin",
        reportedBy: "",
        issueTypeRefId: 0,
        issueSubCategoryRefId: 0,
        complaintDescription: "",
        photosUrl: "",
        raisedByCandidateId: null,
        raisedByManagerId: null,
        raisedDateTime: moment(),
        lastUpdatedDateTime: moment(),
        lastUpdatedBy: (user?.firstName + " " + user?.lastName),
        complaintStatus: "Open",
        assignedTo: '',
        serviceCategoryId: '',
        serviceProviderId: '',
    }
    const [_formData, _setFormData] = useState<any>(formObj)
    const [_page, _setPage] = useState(1);
    const [_rowPopup, _setRowPopup] = useState(false);
    const [_rowsPerPage, _setRowsPerPage] = useState(10);
    const [_descriptionModal, _setDescriptionModal] = useState({ open: false, description: "" });
    const [_viewModal, _setViewModal] = useState({ open: false, loading: false, data: null as any });

    const handleChangePage = (_event: React.ChangeEvent<unknown>, value: number) => {
        _setPage(value);
    }

    const changeFilterData = (key: string, value: any) => {
        _setFilterData({ ..._filterData, [key]: value });
    }
    const changeFormData = (key: string, value: any) => {
        if (key === "raisedByManagerId") {
            const findItem = _adminList?.find((fItem: any) => fItem?.id === value)
            _setFormData({ ..._formData, [key]: value, reportedBy: findItem?.fullName });
        } else if (key === "assignedTo") {
            getProviderList(value)
            _setFormData({ ..._formData, [key]: value, serviceCategoryId: "", serviceProviderId: "" });
        } else if (key === "serviceCategoryId") {
            getProviderList(_formData?.assignedTo, value)
            _setFormData({ ..._formData, [key]: value, serviceProviderId: "" });
        } else {
            _setFormData({ ..._formData, [key]: value });
        }
    }

    const handleAddNew = () => {
        handleClearForm()
        _setEditForm(true);
    }

    const handleGoBack = () => {
        _setEditForm(false);
        _setSubmitSave({ clicked: false })
        handleClearForm();
    }

    const handleClearForm = () => {
        getGridList()
        _setSelectedTab(1)
        _setLoading(false);
        _setEditForm(false);
        _setFormData(formObj);
        _setStatusUpdate(false)
    }

    const handleUpdateItem = (item: any) => {
        console.log("3##", item)
        _setEditForm(true);
        getComplaintsDetailsById('', item?.id?.toString())
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    const data = resp?.data?.result?.length > 0 ? resp?.data?.result[0] : {}
                    _setFormData({ ...formObj, ...item, complaintDescription: item?.complaintDescription || data?.complaintDescription || "", assignedTo: data?.serviceProviderType, edit: true, moreDetails: { ...data }, update: data?.complaintStatus === "InProgress" ? true : false });
                }
            })
            .catch((err) => console.log(err))
    }

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
    }
    console.log("###", _formData)

    const removePhotosItem = (cIndex: number) => {
        let photosList = [..._formData?.photosUrl?.split(',').filter(Boolean)]
        photosList.splice(cIndex, 1)
        changeFormData('photosUrl', photosList?.join(','))
    }

    const onUpload = async (files: any) => {
        _setLoading(true)
        const _tempArr = [..._formData?.photosUrl?.split(',').filter(Boolean)]
        let imageList: any = []
        for (let i = 0; i < files?.length; i++) {
            if (i === 50) {
                break;
            }
            const formData = new FormData();
            formData.append('file', files[i]);
            await commonUploadFile(formData)
                .then((response) => {
                    if (response.status === 200) {
                        imageList.push(response?.data?.file)
                    }
                })
                .catch(error => {
                    console.log(error.response);
                    CustomAlert("warning", error?.response?.data?.message)
                })
        }
        _tempArr.push(...imageList)
        changeFormData('photosUrl', _tempArr?.join(','))
        setTimeout(() => {
            refDocument.current.value = '';
        }, 1000)
        await _setLoading(false)
    }

    const checkUpdateValidation = () => {
        if (!_formData?.id) {
            CustomAlert('warning', "Complaint not selected")
            return false;
        }
        if (!_formData?.doYouWantTo) {
            CustomAlert('warning', "Do you want to?")
            return false;
        }
        if (!_formData?.remarks) {
            CustomAlert('warning', "Remarks required")
            return false;
        }
        if (_formData?.doYouWantTo === "Assign" && !_formData?.escortedBy) {
            CustomAlert('warning', "Escorted by required")
            return false;
        }
        if (_formData?.doYouWantTo === "Assign" && !_formData?.assignedTo) {
            CustomAlert('warning', "Assign To required")
            return false;
        }
        if (_formData?.doYouWantTo === "Assign" && !_formData?.serviceCategoryId) {
            CustomAlert('warning', "Service Category required")
            return false;
        }
        if (_formData?.doYouWantTo === "Assign" && !_formData?.serviceProviderId) {
            CustomAlert('warning', "Service Provider required")
            return false;
        }
        // if (_formData?.doYouWantTo === "Assign" && _formData?.assignedTo === "External" && !_formData?.assignedName) {
        //     CustomAlert('warning', "")
        //     return false;
        // }
        return true
    }

    const checkValidation = () => {
        if (!_formData?.branchRefId) {
            CustomAlert('warning', "Branch not selected")
            return false;
        }
        if (!_formData?.roomRefId) {
            CustomAlert('warning', "Room not selected")
            return false;
        }
        if (!_formData?.cotRefId) {
            CustomAlert('warning', "Cot not selected")
            return false;
        }
        if (!_formData?.createdBy) {
            CustomAlert('warning', "Created by not selected")
            return false;
        }
        if (!_formData?.reportedBy) {
            CustomAlert('warning', "Reported by not selected")
            return false;
        }
        if (!_formData?.issueTypeRefId) {
            CustomAlert('warning', "Category not selected")
            return false;
        }
        if (!_formData?.issueSubCategoryRefId) {
            CustomAlert('warning', "Complaint type not selected")
            return false;
        }
        if (!_formData?.complaintDescription) {
            CustomAlert('warning', "Description required")
            return false;
        }


        return true
    }

    const handleSubmitForm = () => {
        _setLoading(true)
        if (!checkValidation()) {
            _setLoading(false);
            return;
        }
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
            raisedByCandidateId: null,//_formData?.createdBy === "Admin" ? null : (_formData?.raisedByCandidateId || null),
            raisedByManagerId: _formData?.createdBy === "Admin" ? (_formData?.raisedByManagerId || null) : null,
            raisedDateTime: moment(),
            lastUpdatedDateTime: moment(),
            lastUpdatedBy: (user?.firstName + " " + user?.lastName),
            complaintStatus: "Open",
        }

        console.log(body)
        // return ;

        insertUpdateComplaints(body)
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    CustomAlert("success", "Complaint registered");
                    handleClearForm()
                }
            })
            .catch((err) => {
                console.log(err)
                CustomAlert("warning", err?.response?.data?.error)
            })
            .finally(() => _setLoading(false))
    }

    const handleSubmitUpdateForm = () => {
        _setLoading(true)
        if (!checkUpdateValidation()) {
            _setLoading(false);
            return;
        }
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
        }

        console.log(body)
        // _setLoading(false);
        // return;

        insertUpdateComplaints(body)
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    CustomAlert("success", `Complaint ${_formData?.doYouWantTo}`);
                    handleClearForm()
                }
            })
            .catch((err) => {
                console.log(err)
                CustomAlert("warning", err?.response?.data?.error)
            })
            .finally(() => _setLoading(false))
    }

    const getOtherList = () => {
        getMasterIssueCategory()
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    _setIssueList(resp?.data?.result);
                }
            })
            .catch(console.log)
        getMasterIssueSubCategory()
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    _setIssueSubList([...resp?.data?.result])
                }
            })
            .catch((err) => console.log(err))
        getAdminUserList()
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    _setAdminList(resp?.data?.result?.results);
                }
            })
            .catch(console.log)
        getBranchGridList()
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    _setBranchList(resp?.data?.result?.results);
                }
            })
            .catch(console.log)
        getServiceProviderCategory()
            .then((resp) => {
                console.log(resp)
                if (resp?.data?.status === "success") {
                    _setServiceCategory(resp?.data?.result);
                }
            })
            .catch(console.log)
    }

    const getGridList = () => {
        _setTableLoading(true);
        getComplaintsGridList(_page, _rowsPerPage, _filterData?.branchList?.join(','), _filterData?.status?.toString(), _filterData?.fromDate, _filterData?.toDate)
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    _setTableItems(resp?.data?.result?.results);
                    _setTableTotalCount(resp?.data?.result?.totalItems)
                }
            })
            .catch(console.log)
            .finally(() => _setTableLoading(false));
    }

    const getPrintTableHeadBody = () => {
        const header = ["S. No", "Complaint Id", "Branch", "Type", "Description", "Raised by", "Room No", "Raised Date & Time", "Last Update Date & Time", "Status"];
        const body = _tableItems?.map((item: any, index: number) => [
            index + 1,
            `#${item?.id}`,
            item?.branchName,
            item?.issueType,
            item?.complaintDescription || "-",
            item?.reportedBy,
            item?.roomNumber,
            item?.raisedDateTime ? moment(item?.raisedDateTime)?.format('DD-MMM-YYYY hh:mm A') : "",
            item?.lastUpdatedDateTime ? moment(item?.lastUpdatedDateTime)?.format('DD-MMM-YYYY hh:mm A') : "",
            item?.complaintStatus || "Open"
        ]);
        return { header, body }
    }

    const exportEXCEL = () => {
        const { header, body } = getPrintTableHeadBody();
        getExportEXCEL({ header, body, fileName: "Complaints" })
    }

    const handleUpdateSearch = (fromDate: string, toDate: string) => {
        _setFilterData({ ..._filterData, fromDate: fromDate, toDate: toDate })
    }

    const getProviderList = (assignedTo = '', serviceCategoryId = '') => {
        const body = {
            type: assignedTo || '',
            categoryId: serviceCategoryId || "",
        }
        getServiceProvider(body)
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    _setServiceProvider(resp?.data?.result?.data);
                }
            })
            .catch(console.log)
    }

    useEffect(() => {
        if (_formData?.branchRefId) {
            getBranchRoomsList(_formData?.branchRefId, 'admin')
                .then((resp) => {
                    if (resp?.data?.status === "success") {
                        _setRoomList(resp?.data?.result);
                        if (_formData?.cotRefId) {
                            const tempArr = resp?.data?.result?.find((fItem: any) => fItem?.id === _formData?.roomRefId)?.Cots
                            _setCotList([...tempArr])
                        }
                    }
                })
                .catch(console.log)
        }
    }, [_formData?.branchRefId])

    useEffect(() => {
        getOtherList()
        getProviderList()
    }, [])

    useEffect(() => {
        getGridList();
    }, [_page, _rowsPerPage, _filterData])

    return <>
        {!_editForm && <div className="container">
            <div className="row justify-content-between align-items-center py-3">
                <div className="col-md-5 my-2 d-flex align-items-center gap-4">
                    <span className="text-dark fw-bold">Complaints </span>
                    <div className="d-flex align-items-center gap-3 flex-wrap">
                        {['', 'Open', 'InProgress', 'Hold', 'Closed', 'Reject'].map((status, index) => (
                            <span key={index} className={`fs15 ${_filterData?.status === status ? 'borderBottomPrimary text-primary' : ''}`}
                                role="button" onClick={() => changeFilterData('status', status)}>{status || 'All'}</span>
                        ))}
                    </div>
                </div>
                <div className="col-md-7">
                    <div className="row align-items-center">
                        <div className="col-md-2 my-2">
                            {PageAccess === 'Write' && <Button className="text-capitalize text-nowrap" sx={{ color: "black" }} startIcon={<img height={18} src={IMAGES_ICON.TableNewItemIcon} />} onClick={handleAddNew}>Add New</Button>}
                        </div>
                        <div className="col-md-2 my-2">
                            <CustomFilterMultiSelect value={_filterData?.branchList?.map((mItem: any) => Number(mItem))}
                                onChange={(e: any) => { changeFilterData('branchList', e.target.value || '') }}
                                placeholder={"Branch"}
                                menuItem={_branchList?.map((item: any) => {
                                    return item?.isActive ? { title: (item?.branchName || ''), value: item?.id } : null
                                }).filter(Boolean)} />
                            {/* <CustomSelect className="" padding={'0px 10px'} value={_filterData?.branchId} onChange={(e: any) => changeFilterData('branchId', e.target.value)}
                                placeholder={"Branch"} menuItem={[<MenuItem className="px-2 fs14" value={''} key={-1}>All</MenuItem>,
                                ..._branchList?.map((item: any) => <MenuItem className="px-2 fs14" key={item?.id} value={item?.id}>{item?.branchName}</MenuItem>)]} /> */}
                        </div>
                        <div className="col-md-6 my-2">
                            <DateRangeSelector handleChangeDate={handleUpdateSearch} />
                        </div>
                        <div className="col-md-2 my-2">
                            <div className="d-flex align-items-center gap-4 justify-content-around mobJustify">
                                <CustomSearch getSearchText={(value: string) => _setSearch(value)} />
                                <img height={24} src={IMAGES_ICON.TableDownloadIcon} role="button" draggable="false" onClick={exportEXCEL} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <TableContainer className="tableBorder rounded">
                <Table sx={{ ...customTableTemplate }} >
                    <TableHead>
                        <TableRow className="px-2" sx={{ ...customTableHeader }}>
                            <TableCell className="fw-bold text-nowrap">S.No</TableCell>
                            <TableCell className="fw-bold text-nowrap">Action</TableCell>
                            <TableCell className="fw-bold text-nowrap" align="center">Status</TableCell>
                            <TableCell className="fw-bold text-nowrap">Complaint Id</TableCell>
                            <TableCell className="fw-bold text-nowrap">Branch</TableCell>
                            <TableCell className="fw-bold text-nowrap">Type</TableCell>
                            <TableCell className="fw-bold text-nowrap">Description</TableCell>
                            <TableCell className="fw-bold text-nowrap">Raised by</TableCell>
                            <TableCell className="fw-bold text-nowrap">Room No</TableCell>
                            <TableCell className="fw-bold text-nowrap">Raised Date & Time</TableCell>
                            <TableCell className="fw-bold text-nowrap">Last Update Date & Time</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {_tableItems?.length > 0 ? (
                            _tableItems?.filter((content: any) => {
                                const lowerSearchInput = _search?.toLowerCase()?.trim();
                                return lowerSearchInput === '' || Object?.values(content)?.some((value) =>
                                    value?.toString()?.toLowerCase()?.includes(lowerSearchInput)
                                );
                            })?.map((item: any, index: number) => (
                                <TableRow 
                                    key={index} 
                                    sx={{ ...CustomTableHover, cursor: 'pointer' }}
                                    onClick={() => {
                                        if (item?.complaintDescription) {
                                            _setDescriptionModal({ open: true, description: item.complaintDescription });
                                        }
                                    }}
                                >
                                    <TableCell>{(index + 1) + ((_page - 1) * _rowsPerPage)}</TableCell>
                                    <TableCell className="text-muted" align="center" onClick={(e) => e.stopPropagation()}>
                                        <div className="d-flex align-items-center gap-3 justify-content-center">
                                            <div className="d-flex align-items-center gap-2" role="button" onClick={() => handleViewItem(item)}>
                                                <span>View</span>
                                                <img draggable="false" height={16} src={IMAGES_ICON.EyeIcon} alt="icon" />
                                            </div>
                                            {PageAccess === 'Write' && <div className="d-flex align-items-center gap-2" role="button" onClick={() => handleUpdateItem(item)}>
                                                <span>Edit</span>
                                                <img draggable="false" height={16} src={IMAGES_ICON.EditIcon} alt="icon" />
                                            </div>}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted text-nowrap" onClick={(e) => e.stopPropagation()}>
                                        <div className={`fs14 text-uppercase text-center px-2 pt-1 ${item?.complaintStatus === "InProgress" ? 'statusInProgress' :
                                            item?.complaintStatus === "Hold" ? 'statusHold' :
                                                item?.complaintStatus === "Reject" ? 'statusRejected' :
                                                    item?.complaintStatus === "Closed" ? 'statusResolved' :
                                                        'statusInProgress'}`}>{item?.complaintStatus || "Open"}</div>
                                    </TableCell>
                                    <TableCell className="text-muted text-nowrap">#{item?.id}</TableCell>
                                    <TableCell className="text-muted text-nowrap">{item?.branchName}</TableCell>
                                    <TableCell className="text-muted text-nowrap">{item?.issueType}</TableCell>
                                    <TableCell className="text-muted" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {item?.complaintDescription || "-"}
                                    </TableCell>
                                    <TableCell className="text-muted text-nowrap">{item?.reportedBy}</TableCell>
                                    <TableCell className="text-muted text-nowrap">{item?.roomNumber}</TableCell>
                                    <TableCell className="text-muted text-nowrap">{item?.raisedDateTime && moment(item?.raisedDateTime)?.format('DD-MMM-YYYY hh:mm A')}</TableCell>
                                    <TableCell className="text-muted text-nowrap">{item?.lastUpdatedDateTime && moment(item?.lastUpdatedDateTime)?.format('DD-MMM-YYYY hh:mm A')}</TableCell>
                                </TableRow>
                            ))
                        ) : !_tableLoading && (
                            <TableRow>
                                <TableCell className="fs-3 text-muted" align="center" colSpan={11}>Data Not Found</TableCell>
                            </TableRow>
                        )}
                        <SkeletonProviderTables columns={11} visible={_tableLoading} />
                    </TableBody>
                </Table>
            </TableContainer>
            <div className="mt-3 d-flex justify-content-between flex-wrap">
                <div className="d-flex align-items-center gap-2">
                    <span className='textLightGray fs14 text-nowrap'>Items per page:</span>
                    <CustomSelect padding={'6px'} value={Number(_rowsPerPage)} onChange={(e: any) => _setRowsPerPage(e.target.value)}
                        placeholder={" "} menuItem={[10, 20, 30]?.map((item: any) =>
                            <MenuItem key={item} value={item}>{item}</MenuItem>)} />
                </div>
                <Pagination count={Math.ceil(_tableTotalCount / _rowsPerPage) || 0} page={_page} onChange={handleChangePage}
                    size={"small"} color={"primary"}
                    renderItem={(item) => <PaginationItem sx={{ mx: '4px' }} {...item} />} />
            </div>
        </div>}

        {_editForm && <>
            <div className="container py-3">
                <div className="bg-field-gray  border rounded px-4 py-1">
                    <div className="d-flex align-items-center justify-content-between py-2 borderBottomLight" role="button" onClick={handleGoBack}>
                        <div className="d-flex align-items-center">
                            <img height={24} draggable={false} src={IMAGES_ICON.BackIcon} />
                            <div className="fw-bold">Back</div>
                        </div>
                        {_formData?.id ? <div className="">Complaint Id: <span className="fw-bold">#{_formData?.id}</span> </div> : <></>}
                    </div>
                    {_formData?.id === 0 && <>
                        <div className="my-3 d-flex align-items-center gap-3">
                            <span className="fw-bold text-nowrap">Complaint Details</span>
                            <div className="w-100"><hr /></div>
                        </div>
                        <div className="row">
                            <div className="col-md-3 my-2">
                                <div className="text-muted fs14 mb-1 required">Branch</div>
                                <FormControl className="" fullWidth>
                                    <Select size="small" readOnly={_formData?.edit} value={_formData?.branchRefId} onChange={(e) => changeFormData("branchRefId", e.target.value)}
                                        style={{ backgroundColor: "#F3F3F3", }}>
                                        {_branchList?.map((mItem: any, mIndex: number) =>
                                            <MenuItem className="fs14" key={mIndex} value={mItem?.id}>{mItem?.branchName}</MenuItem>
                                        )}
                                    </Select>
                                </FormControl>
                            </div>
                            <div className="col-md-2 my-2">
                                <div className="text-muted fs14 mb-1 required">Room</div>
                                <FormControl className="" fullWidth>
                                    <Select size="small" readOnly={_formData?.edit} value={_formData?.roomRefId}
                                        style={{ backgroundColor: "#F3F3F3", }}>
                                        {_roomList?.map((mItem: any, mIndex: number) =>
                                            <MenuItem className="fs14" key={mIndex} value={mItem?.id} onClick={() => {
                                                _setCotList([...mItem?.Cots]);
                                                _setFormData({ ..._formData, roomRefId: mItem?.id, roomTypeName: mItem?.roomTypeName })
                                            }}>{mItem?.roomNumber}</MenuItem>
                                        )}
                                    </Select>
                                </FormControl>
                            </div>
                            <div className="col-md-2 my-2">
                                <div className="text-muted fs14 mb-1 required">Cot</div>
                                <FormControl className="" fullWidth>
                                    <Select size="small" readOnly={_formData?.edit} value={_formData?.cotRefId}
                                        style={{ backgroundColor: "#F3F3F3", }}>
                                        {_cotList?.map((mItem: any, mIndex: number) =>
                                            <MenuItem className="fs14" key={mIndex} value={mItem?.id} onClick={() => changeFormData('cotRefId', mItem?.id)}>{mItem?.cotNumber} - {mItem?.CotType?.type}</MenuItem>
                                        )}
                                    </Select>
                                </FormControl>
                            </div>
                            <div className="col-md-2 my-2">
                                <div className="text-muted fs14 mb-1 required">Created By</div>
                                <CustomAutoSelect value={_formData?.createdBy}
                                    onChange={(value: any) => changeFormData("createdBy", value)}
                                    menuItem={['Admin']?.map((item: any) => {
                                        return { title: item, value: item }
                                    })?.filter(Boolean)} />
                            </div>
                            <div className="col-md-3 my-2">
                                <div className="text-muted fs14 mb-1 required">Reported By</div>
                                <CustomAutoSelect value={_formData?.raisedByManagerId}
                                    onChange={(value: any) => changeFormData("raisedByManagerId", value)}
                                    menuItem={_adminList?.map((item: any) => {
                                        return { title: item?.fullName + `(${item?.roleName})`, value: item?.id }
                                    })} />
                            </div>
                            <div className=""></div>
                            <div className="col-md-3 my-2">
                                <div className="text-muted fs14 mb-1 required">Category</div>
                                <CustomAutoSelect value={_formData?.issueTypeRefId}
                                    onChange={(value: any) => changeFormData("issueTypeRefId", value)}
                                    menuItem={_issueList?.map((item: any) => {
                                        return item?.isActive ? { title: item?.issueType, value: item?.id } : null
                                    })?.filter(Boolean)} />
                            </div>
                            <div className="col-md-3 my-2">
                                <div className="text-muted fs14 mb-1 required">Complaint Type</div>
                                <CustomAutoSelect value={_formData?.issueSubCategoryRefId}
                                    onChange={(value: any) => changeFormData("issueSubCategoryRefId", value)}
                                    menuItem={_issueSubList?.map((item: any) => {
                                        return item?.isActive ? { title: item?.subCategoryName, value: item?.id } : null
                                    })?.filter(Boolean)} />
                            </div>
                            <div className="my-2">
                                <div className="text-muted fs14 mb-1 required">Complaint Description</div>
                                <TextField fullWidth sx={{ ...textFieldStyle }} multiline minRows={2}
                                    value={_formData?.complaintDescription} onChange={(e: any) => changeFormData('complaintDescription', e.target.value)}
                                    InputProps={{ readOnly: _formData?.edit }} />
                            </div>
                            <div className="my-2">
                                <div className="text-muted fs14 mb-1">Submitted Photos</div>
                                <div className="d-flex align-items-center flex-wrap gap-3">
                                    <div className="d-flex align-items-center gap-3 my-1">
                                        {_formData?.photosUrl?.split(',')?.filter(Boolean)?.map((cItem: any, cIndex: number) =>
                                            <div key={cIndex} className="position-relative">
                                                {cItem ?
                                                    <img draggable={false} src={ROUTES.API.DOWNLOAD_FILE + `${cItem}`} alt="icons" className='rounded fieldBorderPrimary' height={90} width={90} style={{ objectFit: 'cover' }} />
                                                    : <div className="rounded fieldBorderPrimary fs14 alignCenter" style={{ height: "90px", width: "90px" }}>None</div>}
                                                <img className="position-absolute rounded-circle" style={{ right: "-6px", top: "-6px" }} src={IMAGES_ICON.CloseOutlineIcon} alt="Close" height="18" role="button" onClick={() => removePhotosItem(cIndex)} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="">
                                        <Button className="transformNone" component="label" >
                                            <div className=''><span className='fw-bold fieldBorderDark rounded text-dark px-3 py-1'>+ Upload More Photos</span></div>
                                            <Input style={{ visibility: 'hidden' }} accept={'image/*'} type="file" ref={refDocument} multiple onChange={(e: any) => onUpload(e.target.files)} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="py-4 d-flex justify-content-end align-items-center mobJustify gap-3">
                            <Button variant="outlined" color="primary" className="px-4 py-1 text-dark" onClick={handleClearForm}>Cancel</Button>
                            <Button variant="contained" color="primary" className="px-4 py-1" onClick={handleSubmitForm} disabled={_loading} >Submit</Button>
                        </div>
                    </>}

                    {_formData?.edit && <>

                        <div className="my-3">
                            <div className="bg-white rounded shadow">
                                <div className="row justify-content-between px-3">
                                    <div className="col-md-2 my-2">
                                        <div className="text-muted fs14 mb-1 d-flex align-items-center gap-1"><img draggable="false" height={18} src={IMAGES_ICON.LocationPinIcon} /> Branch Name</div>
                                        <div className="fw-bold ms-4 w-75">{_formData?.moreDetails?.branchName}</div>
                                    </div>
                                    <div className="col-md-2 my-2">
                                        <div className="text-muted fs14 mb-1 d-flex align-items-center gap-1"><img draggable="false" height={18} src={IMAGES_ICON.RoomsIcon} /> Room</div>
                                        <div className="fw-bold ms-4 w-75">{_formData?.moreDetails?.roomNumber}</div>
                                    </div>
                                    <div className="col-md-2 my-2">
                                        <div className="text-muted fs14 mb-1 d-flex align-items-center gap-1"><img draggable="false" height={18} src={IMAGES_ICON.CotsIcon} /> Cot</div>
                                        <div className="fw-bold ms-4 w-75">{_formData?.moreDetails?.cotNumber}</div>
                                    </div>
                                    <div className="col-md-2 my-2">
                                        <div className="text-muted fs14 mb-1 d-flex align-items-center gap-1"><img draggable="false" height={18} src={IMAGES_ICON.CreatorIcon} /> Created By</div>
                                        <div className="fw-bold ms-4 w-75">{_formData?.moreDetails?.createdBy}</div>
                                    </div>
                                    <div className="col-md-2 my-2">
                                        <div className="text-muted fs14 mb-1 d-flex align-items-center gap-1"><img draggable="false" height={18} src={IMAGES_ICON.GirlUserIcon} /> Reported By</div>
                                        <div className="fw-bold ms-4 w-75">{_formData?.moreDetails?.reportedBy}</div>
                                    </div>
                                    <div className="col-md-2 my-2">
                                        <div className="text-muted fs14 mb-1 d-flex align-items-center gap-1"><img draggable="false" height={18} src={IMAGES_ICON.CalenderIcon} /> Mobile Number</div>
                                        <div className="fw-bold ms-4 w-75">{_formData?.moreDetails?.raisedByManagerId ? _formData?.moreDetails?.managerMobileNumber : _formData?.moreDetails?.candidateMobileNumber}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="row my-2 p-3">
                                <div className="col-md-6 borderRight">
                                    <div className="my-3 d-flex align-items-center gap-3">
                                        <span className="fw-bold text-nowrap">Complaint Details</span>
                                        <div className="w-100"><hr /></div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 my-2">
                                            <div className="text-muted fs14 mb-1">Category</div>
                                            <TextField fullWidth sx={{ ...textFieldStyle }} value={_formData?.moreDetails?.issueType}
                                                InputProps={{ readOnly: true }} />
                                        </div>
                                        <div className="col-md-6 my-2">
                                            <div className="text-muted fs14 mb-1">Complaint Type</div>
                                            <TextField fullWidth sx={{ ...textFieldStyle }} value={_formData?.moreDetails?.subCategoryName}
                                                InputProps={{ readOnly: true }} />
                                        </div>
                                        <div className="my-2">
                                            <div className="text-muted fs14 mb-1">Complaint Description</div>
                                            <TextField fullWidth sx={{ ...textFieldStyle }} multiline minRows={2}
                                                value={_formData?.complaintDescription || _formData?.moreDetails?.complaintDescription || ""} 
                                                onChange={(e: any) => changeFormData('complaintDescription', e.target.value)} />
                                        </div>
                                        <div className="col-md-6 my-2">
                                            <div className="text-muted fs14 mb-1">Submitted Photos</div>
                                            <div className="d-flex align-items-center gap-3 my-1">
                                                {_formData?.moreDetails?.photosUrl?.split(',')?.filter(Boolean)?.map((cItem: any, cIndex: number) =>
                                                    <div key={cIndex} className="position-relative">
                                                        {cItem ?
                                                            <img draggable={false} src={ROUTES.API.DOWNLOAD_FILE + `${cItem}`} alt="icons" className='rounded fieldBorderPrimary' height={90} width={90} style={{ objectFit: 'cover' }} />
                                                            : <div className="rounded fieldBorderPrimary fs14 alignCenter" style={{ height: "90px", width: "90px" }}>None</div>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="my-3 d-flex align-items-center gap-3">
                                        <span className="fw-bold text-nowrap">Complaint Status Update</span>
                                        <div className="w-100"><hr /></div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 my-2">
                                            <div className="text-muted fs14 mb-1 required">Do you want to?</div>
                                            <FormControl className="" fullWidth>
                                                <Select size="small" value={_formData?.doYouWantTo} onChange={(e) => changeFormData("doYouWantTo", e.target.value)}
                                                    style={{ backgroundColor: "#F3F3F3", }}>
                                                    {['Assign', 'Reject', 'Closed', 'Hold', 'Re-Open']?.map((mItem: any, mIndex: number) =>
                                                        <MenuItem className="fs14" key={mIndex} value={mItem}>{mItem}</MenuItem>
                                                    )}
                                                </Select>
                                            </FormControl>
                                        </div>
                                        {_formData?.doYouWantTo === "Assign" && <>
                                            <div className="col-md-6 my-2">
                                                <div className="text-muted fs14 mb-1 required">Assign To</div>
                                                <FormControl className="" fullWidth>
                                                    <Select size="small" value={_formData?.assignedTo} onChange={(e) => changeFormData("assignedTo", e.target.value)}
                                                        style={{ backgroundColor: "#F3F3F3", }}>
                                                        {['Internal', 'External']?.map((mItem: any, mIndex: number) =>
                                                            <MenuItem className="fs14" key={mIndex} value={mItem}>{mItem}</MenuItem>
                                                        )}
                                                    </Select>
                                                </FormControl>
                                            </div>
                                            <div className="col-md-6 my-2">
                                                <div className="text-muted fs14 mb-1 required">Service Category</div>
                                                <FormControl className="" fullWidth>
                                                    <Select size="small" value={_formData?.serviceCategoryId} onChange={(e) => changeFormData("serviceCategoryId", e.target.value)}
                                                        style={{ backgroundColor: "#F3F3F3", }}>
                                                        {_serviceCategory?.map((mItem: any, mIndex: number) =>
                                                            <MenuItem className="fs14" key={mIndex} value={mItem?.id}>{mItem?.name}</MenuItem>
                                                        )}
                                                    </Select>
                                                </FormControl>
                                            </div>
                                            <div className="col-md-6 my-2">
                                                <div className="text-muted fs14 mb-1 required">Service Provider</div>
                                                <CustomAutoSelect placeholder={" "} value={_formData?.serviceProviderId}
                                                    onChange={(value: any) => { changeFormData('serviceProviderId', value || '') }}
                                                    menuItem={_serviceProvider?.map((item: any) => {
                                                        return { title: item?.contactPerson, value: item?.id }
                                                    })} />

                                            </div>
                                        </>}
                                        <div className="my-2">
                                            <div className="text-muted fs14 mb-1 required">Remarks</div>
                                            <TextField fullWidth sx={{ ...textFieldStyle }} multiline minRows={2}
                                                value={_formData?.remarks} onChange={(e) => changeFormData("remarks", e.target.value)} />
                                        </div>
                                        {_formData?.doYouWantTo === "Assign" &&
                                            <div className="col-md-6 my-2">
                                                <div className="text-muted fs14 mb-1 required">Supervised by</div>
                                                <TextField fullWidth sx={{ ...textFieldStyle }}
                                                    value={_formData?.escortedBy} onChange={(e) => changeFormData("escortedBy", e.target.value)} />
                                            </div>}
                                        <div className=""></div>
                                        {_formData?.update && <>
                                            <div className="col-md-8 my-2">
                                                <div className="text-muted fs14 mb-1">Complaint Status</div>
                                                <div className="d-flex align-items-center gap-4">
                                                    <span className={`fs14 px-2 text-uppercase ${_formData?.complaintStatus === "InProgress" ? 'statusInProgress' :
                                                        _formData?.complaintStatus === "Hold" ? 'statusHold' :
                                                            _formData?.complaintStatus === "Reject" ? 'statusRejected' :
                                                                _formData?.complaintStatus === "Closed" ? 'statusResolved' :
                                                                    'statusInProgress'}`}>{_formData?.complaintStatus}</span>
                                                    <span className="text-primary text-decoration-underline" role="button" onClick={() => _setStatusUpdate(true)}>Update Status</span>
                                                </div>
                                            </div>
                                        </>}
                                        <div className="py-4 d-flex justify-content-end align-items-center mobJustify gap-3">
                                            <Button variant="outlined" color="primary" className="px-4 py-1 text-dark" onClick={handleClearForm}>Cancel</Button>
                                            <Button variant="contained" color="primary" className="px-4 py-1" onClick={handleSubmitUpdateForm} disabled={_loading} >Submit</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>}
                </div>
            </div>
            <CustomDialogue displaySize={"xs"} title={'Complaint Status'} dialogueFlag={_statusUpdate} onCloseClick={() => _setStatusUpdate(false)}
                mainContent={<div className="my-2">
                    <div className="py-2 d-flex align-items-center justify-content-between">
                        <span className="fs14 text-uppercase text-center px-3 pt-1 statusInProgress">InProgress</span>
                        <Radio value={"InProgress"} checked={_formData?.doYouWantTo === "InProgress"} onChange={(e) => changeFormData("doYouWantTo", e.target.value)} size="small" sx={{ ...customRadio }} />
                    </div>
                    <div className="py-2 d-flex align-items-center justify-content-between">
                        <span className="fs14 text-uppercase text-center px-3 pt-1 statusHold">Hold</span>
                        <Radio value={"Hold"} checked={_formData?.doYouWantTo === "Hold"} onChange={(e) => changeFormData("doYouWantTo", e.target.value)} size="small" sx={{ ...customRadio }} />
                    </div>
                    <div className="py-2 d-flex align-items-center justify-content-between">
                        <span className="fs14 text-uppercase text-center px-3 pt-1 statusRejected">Rejected</span>
                        <Radio value={"Reject"} checked={_formData?.doYouWantTo === "Reject"} onChange={(e) => changeFormData("doYouWantTo", e.target.value)} size="small" sx={{ ...customRadio }} />
                    </div>
                    <div className="py-2 d-flex align-items-center justify-content-between">
                        <span className="fs14 text-uppercase text-center px-3 pt-1 statusResolved">Resolved</span>
                        <Radio value={"Closed"} checked={_formData?.doYouWantTo === "Closed"} onChange={(e) => changeFormData("doYouWantTo", e.target.value)} size="small" sx={{ ...customRadio }} />
                    </div>
                    <div className="py-2 d-flex align-items-center justify-content-between">
                        <span className="fs14 text-uppercase text-center px-3 pt-1 statusInProgress">Re-Assign</span>
                        <Radio value={"Open"} checked={_formData?.doYouWantTo === "Open"} onChange={(e) => changeFormData("doYouWantTo", e.target.value)} size="small" sx={{ ...customRadio }} />
                    </div>
                    <div className="my-2">
                        <div className="text-muted fs14 mb-1 required">Remarks</div>
                        <TextField fullWidth sx={{ ...textFieldStyle }} multiline minRows={2}
                            value={_formData?.remarks} onChange={(e) => changeFormData("remarks", e.target.value)} />
                    </div>
                    <div className="text-center py-3">
                        <Button variant="contained" color="primary" className="px-4 py-1" onClick={handleSubmitUpdateForm} disabled={_loading} >Update</Button>
                    </div>
                </div>} />
        </>
        }
        <CustomDialogue 
            displaySize={"md"} 
            title="Complaint Description" 
            dialogueFlag={_descriptionModal.open} 
            onCloseClick={() => _setDescriptionModal({ open: false, description: "" })}
            mainContent={
                <div className="my-3">
                    <div className="text-muted fs14 mb-2">Description:</div>
                    <div className="p-3 bg-light rounded" style={{ minHeight: '100px', maxHeight: '400px', overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {_descriptionModal.description || "No description available"}
                    </div>
                </div>
            }
        />
        <CustomDialogue 
            displaySize={"lg"} 
            title={`Complaint Details - #${_viewModal.data?.id || ""}`} 
            dialogueFlag={_viewModal.open} 
            onCloseClick={() => _setViewModal({ open: false, loading: false, data: null })}
            mainContent={
                <div className="my-3">
                    {_viewModal.loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : _viewModal.data ? (
                        <div className="row">
                            <div className="col-md-6 my-2">
                                <div className="text-muted fs14 mb-1">Complaint ID</div>
                                <div className="fw-bold">#{_viewModal.data?.id}</div>
                            </div>
                            <div className="col-md-6 my-2">
                                <div className="text-muted fs14 mb-1">Status</div>
                                <div className={`fs14 text-uppercase px-2 pt-1 d-inline-block ${_viewModal.data?.complaintStatus === "InProgress" ? 'statusInProgress' :
                                    _viewModal.data?.complaintStatus === "Hold" ? 'statusHold' :
                                        _viewModal.data?.complaintStatus === "Reject" ? 'statusRejected' :
                                            _viewModal.data?.complaintStatus === "Closed" ? 'statusResolved' :
                                                'statusInProgress'}`}>
                                    {_viewModal.data?.complaintStatus || "Open"}
                                </div>
                            </div>
                            <div className="col-md-6 my-2">
                                <div className="text-muted fs14 mb-1">Branch Name</div>
                                <div className="fw-bold">{_viewModal.data?.branchName || "-"}</div>
                            </div>
                            <div className="col-md-6 my-2">
                                <div className="text-muted fs14 mb-1">Room Number</div>
                                <div className="fw-bold">{_viewModal.data?.roomNumber || "-"}</div>
                            </div>
                            <div className="col-md-6 my-2">
                                <div className="text-muted fs14 mb-1">Cot Number</div>
                                <div className="fw-bold">{_viewModal.data?.cotNumber || "-"}</div>
                            </div>
                            <div className="col-md-6 my-2">
                                <div className="text-muted fs14 mb-1">Category</div>
                                <div className="fw-bold">{_viewModal.data?.issueType || _viewModal.data?.moreDetails?.issueType || "-"}</div>
                            </div>
                            <div className="col-md-6 my-2">
                                <div className="text-muted fs14 mb-1">Sub Category</div>
                                <div className="fw-bold">{_viewModal.data?.subCategoryName || _viewModal.data?.moreDetails?.subCategoryName || "-"}</div>
                            </div>
                            <div className="col-md-6 my-2">
                                <div className="text-muted fs14 mb-1">Created By</div>
                                <div className="fw-bold">{_viewModal.data?.createdBy || _viewModal.data?.moreDetails?.createdBy || "-"}</div>
                            </div>
                            <div className="col-md-6 my-2">
                                <div className="text-muted fs14 mb-1">Reported By</div>
                                <div className="fw-bold">{_viewModal.data?.reportedBy || _viewModal.data?.moreDetails?.reportedBy || "-"}</div>
                            </div>
                            <div className="col-md-6 my-2">
                                <div className="text-muted fs14 mb-1">Candidate Name</div>
                                <div className="fw-bold">{_viewModal.data?.candidateName || "-"}</div>
                            </div>
                            <div className="col-md-6 my-2">
                                <div className="text-muted fs14 mb-1">Mobile Number</div>
                                <div className="fw-bold">{_viewModal.data?.candidateMobileNumber || _viewModal.data?.managerMobileNumber || "-"}</div>
                            </div>
                            <div className="col-md-6 my-2">
                                <div className="text-muted fs14 mb-1">Raised Date & Time</div>
                                <div className="fw-bold">{_viewModal.data?.raisedDateTime ? moment(_viewModal.data.raisedDateTime).format('DD-MMM-YYYY hh:mm A') : "-"}</div>
                            </div>
                            <div className="col-md-6 my-2">
                                <div className="text-muted fs14 mb-1">Last Updated Date & Time</div>
                                <div className="fw-bold">{_viewModal.data?.lastUpdatedDateTime ? moment(_viewModal.data.lastUpdatedDateTime).format('DD-MMM-YYYY hh:mm A') : "-"}</div>
                            </div>
                            <div className="col-md-6 my-2">
                                <div className="text-muted fs14 mb-1">Assigned Date & Time</div>
                                <div className="fw-bold">{_viewModal.data?.assignedDateTime ? moment(_viewModal.data.assignedDateTime).format('DD-MMM-YYYY hh:mm A') : "-"}</div>
                            </div>
                            <div className="col-md-6 my-2">
                                <div className="text-muted fs14 mb-1">Closed Date & Time</div>
                                <div className="fw-bold">{_viewModal.data?.closedDateTime ? moment(_viewModal.data.closedDateTime).format('DD-MMM-YYYY hh:mm A') : "-"}</div>
                            </div>
                            <div className="col-md-6 my-2">
                                <div className="text-muted fs14 mb-1">Assigned To</div>
                                <div className="fw-bold">{_viewModal.data?.assignedToName || _viewModal.data?.managerName || "-"}</div>
                            </div>
                            <div className="col-md-6 my-2">
                                <div className="text-muted fs14 mb-1">Assigned By</div>
                                <div className="fw-bold">{_viewModal.data?.assignedBy || "-"}</div>
                            </div>
                            <div className="col-md-6 my-2">
                                <div className="text-muted fs14 mb-1">Service Provider Type</div>
                                <div className="fw-bold">{_viewModal.data?.serviceProviderType || "-"}</div>
                            </div>
                            <div className="col-md-6 my-2">
                                <div className="text-muted fs14 mb-1">Service Provider</div>
                                <div className="fw-bold">{_viewModal.data?.serviceProviderName || "-"}</div>
                            </div>
                            <div className="col-md-6 my-2">
                                <div className="text-muted fs14 mb-1">Service Category</div>
                                <div className="fw-bold">{_viewModal.data?.serviceCategoryName || "-"}</div>
                            </div>
                            <div className="col-md-6 my-2">
                                <div className="text-muted fs14 mb-1">Escorted By</div>
                                <div className="fw-bold">{_viewModal.data?.escortedBy || "-"}</div>
                            </div>
                            <div className="col-md-12 my-2">
                                <div className="text-muted fs14 mb-1">Complaint Description</div>
                                <div className="p-3 bg-light rounded" style={{ minHeight: '80px', maxHeight: '200px', overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                    {_viewModal.data?.complaintDescription || "-"}
                                </div>
                            </div>
                            <div className="col-md-12 my-2">
                                <div className="text-muted fs14 mb-1">Remarks</div>
                                <div className="p-3 bg-light rounded" style={{ minHeight: '80px', maxHeight: '200px', overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                    {_viewModal.data?.remarks || "-"}
                                </div>
                            </div>
                            <div className="col-md-12 my-2">
                                <div className="text-muted fs14 mb-1">Submitted Photos</div>
                                <div className="d-flex align-items-center gap-3 flex-wrap">
                                    {_viewModal.data?.photosUrl?.split(',')?.filter(Boolean)?.map((photo: string, index: number) => (
                                        <div key={index}>
                                            <img 
                                                draggable={false} 
                                                src={ROUTES.API.DOWNLOAD_FILE + `${photo}`} 
                                                alt={`Photo ${index + 1}`} 
                                                className='rounded fieldBorderPrimary' 
                                                height={120} 
                                                width={120} 
                                                style={{ objectFit: 'cover', cursor: 'pointer' }}
                                                onClick={() => window.open(ROUTES.API.DOWNLOAD_FILE + `${photo}`, '_blank')}
                                            />
                                        </div>
                                    ))}
                                    {(!_viewModal.data?.photosUrl || _viewModal.data?.photosUrl?.split(',')?.filter(Boolean)?.length === 0) && (
                                        <div className="text-muted">No photos available</div>
                                    )}
                                </div>
                            </div>
                            {_viewModal.data?.resolvedPhotoUrl && (
                                <div className="col-md-12 my-2">
                                    <div className="text-muted fs14 mb-1">Resolved Photos</div>
                                    <div className="d-flex align-items-center gap-3 flex-wrap">
                                        {_viewModal.data?.resolvedPhotoUrl?.split(',')?.filter(Boolean)?.map((photo: string, index: number) => (
                                            <div key={index}>
                                                <img 
                                                    draggable={false} 
                                                    src={ROUTES.API.DOWNLOAD_FILE + `${photo}`} 
                                                    alt={`Resolved Photo ${index + 1}`} 
                                                    className='rounded fieldBorderPrimary' 
                                                    height={120} 
                                                    width={120} 
                                                    style={{ objectFit: 'cover', cursor: 'pointer' }}
                                                    onClick={() => window.open(ROUTES.API.DOWNLOAD_FILE + `${photo}`, '_blank')}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-5 text-muted">No data available</div>
                    )}
                </div>
            }
        />
    </>
}