import { Button, MenuItem, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Pagination, PaginationItem, FormControl, Select, TextField, Tabs, Tab } from '@mui/material';
import moment from 'moment';
import { useState, useEffect } from 'react';
import { IMAGES_ICON } from '../../assets/images/exportImages';
import CustomSearch from '../../components/helpers/CustomSearch';
import CustomSelect from '../../components/helpers/CustomSelect';
import DateRangeSelector from '../../components/helpers/DateRangeSelector';
import { getApprovedAdmissionGridList, getBranchGridList, getBranchRoomsList, insertUpdateCandidateAdmission } from '../../models'
import { SkeletonProviderTables } from '../../providers/SkeletonProvider';
import { useStateValue } from '../../providers/StateProvider';
import { getExportEXCEL, CustomAlert, customTableTemplate, customTableHeader, CustomTableHover, textFieldStyle, DisableKeyUpDown } from '../../services/HelperService';
import CandidateDetails from './components/candidateDetails';
import ContactPerson from './components/contactPerson';
import Documents from './components/documents';
import Others from './components/others';
import PurposeOfStay from './components/purposeOfStay';
import RoomAndFee from './components/roomAndFee';
import Payments from './components/payments';

export default function AdmissionConfirm({ PageAccess }: any) {
    const [{ user, admissionDetails }, dispatch]: any = useStateValue()
    const [_branchList, _setBranchList] = useState<any>([]);
    const [_roomList, _setRoomList] = useState<any>([]);
    const [_cotList, _setCotList] = useState<any>([]);

    const [_tableItems, _setTableItems] = useState<any>([]);
    const [_tableTotalCount, _setTableTotalCount] = useState(0);
    const [_pageList, _setPageList] = useState<any>([]);
    const [_tableLoading, _setTableLoading] = useState(true);
    const [_loading, _setLoading] = useState(false);
    const [_search, _setSearch] = useState('');
    const [_filterData, _setFilterData] = useState({ branchId: '', paymentStatus: '', fromDate: moment().clone().startOf('month').format('YYYY-MM-DD'), toDate: moment().format('YYYY-MM-DD') });
    const [_editForm, _setEditForm] = useState(false);
    const [_addScreen, _setAddScreen] = useState(false);
    const [_selectedTab, _setSelectedTab] = useState(1);
    const [_submitSave, _setSubmitSave] = useState({ clicked: false });
    const [_formData, _setFormData] = useState<any>({ id: 0, edit: false, isActive: true })
    const [_page, _setPage] = useState(1);
    const [_rowPopup, _setRowPopup] = useState(false);
    const [_rowsPerPage, _setRowsPerPage] = useState(10);

    const handleChangePage = (_event: React.ChangeEvent<unknown>, value: number) => {
        _setPage(value);
    }

    const validate = {
        branchRefId: { error: false, message: "" },
        roomRefId: { error: false, message: "" },
        cotRefId: { error: false, message: "" },
        dateOfAdmission: { error: false, message: "" },
    }
    const [_validate, _setValidate] = useState(validate);

    const changeFilterData = (key: string, value: any) => {
        _setFilterData({ ..._filterData, [key]: value });
    }
    const changeFormData = (key: string, value: any) => {
        _setFormData({ ..._formData, [key]: value });
    }

    const handleUpdateItem = (item: any) => {
        dispatch({
            type: "SET_ADMISSION_DETAILS",
            data: { admissionDetails: { ...item }, edit: true, payment: true }
        })
        _setFormData({ ...item, edit: true });
        _setEditForm(true);
    }

    const handleGoBack = () => {
        _setEditForm(false);
        _setSubmitSave({ clicked: false })
        handleClearForm();
    }

    const handleClearForm = () => {
        dispatch({ type: "SET_ADMISSION_DETAILS", data: null })
        getGridList()
        _setSelectedTab(1)
        _setLoading(false);
        _setEditForm(false);
        _setFormData({ id: 0, edit: false, isActive: true });
    }

    const handleCotAndFeeUpdate = (item: any) => {
        _setFormData({ ..._formData, cotRefId: item?.id, admissionFee: item?.advanceAmount, monthlyRent: admissionDetails?.admissionDetails?.noDayStayType === "Month" ? item?.rentAmount : item?.perDayRent })
    }


    const getPrintTableHeadBody = () => {
        const header = ["S. No", "Branch Name", "Status", "Room No", "Room Type", "Cot No", "Cot Type", "Candidate Name", "Mobile Number", "Date of Admission", "Updated At"];
        const body = _tableItems?.map((item: any, index: number) => {
            const statusLabel = item?.admissionType === 'Staff' ? 'Staff' : (item?.paymentStatus || "Unpaid");
            return [
                index + 1,
                item?.branchName,
                statusLabel,
                item?.roomNumber,
                item?.roomTypeName,
                item?.cotNumber,
                item?.cotTypeName,
                item?.candidateName,
                item?.candidateMobileNumber,
                item?.dateOfAdmission ? moment(item?.dateOfAdmission)?.format('DD-MMM-YYYY') : "",
                item?.updatedAt ? moment(item?.updatedAt)?.format('DD-MMM-YYYY') : ""
            ]
        });
        return { header, body }
    }

    const exportEXCEL = () => {
        const { header, body } = getPrintTableHeadBody();
        getExportEXCEL({ header, body, fileName: "Admissions" })
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
        if (!_formData?.dateOfAdmission) {
            CustomAlert('warning', "Date of admission not selected")
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
            id: _formData?.id || 0,
            candidateRefId: _formData?.candidateRefId || 0,
            branchRefId: _formData?.branchRefId || 0,
            roomRefId: _formData?.roomRefId || 0,
            cotRefId: _formData?.cotRefId || 0,
            dateOfAdmission: _formData?.dateOfAdmission || "",
            dateOfNotice: _formData?.dateOfNotice || _formData?.dateOfAdmission || "",
            admissionFee: _formData?.admissionFee || "",
            advancePaid: _formData?.advancePaid || "",
            monthlyRent: _formData?.monthlyRent || "",
            noDayStayType: _formData?.noDayStayType || "Month",
            noDayStay: _formData?.noDayStay || "1",
            dues: _formData?.dues || "",
            admittedBy: _formData?.id ? _formData?.admittedBy : (user?.firstName + " " + user?.lastName),
            admissionStatus: "Approved",
            paymentStatus: "Unpaid",
            isActive: _formData?.isActive || false,
        }
        insertUpdateCandidateAdmission(body)
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    CustomAlert("success", "Admission details saved");
                    if (body?.id === 0) {
                        body.id = resp?.data?.result?.insertedId
                    }
                    _setFormData({ ..._formData, id: resp?.data?.result?.insertedId, admittedBy: body?.admittedBy })
                    dispatch({
                        type: "SET_ADMISSION_DETAILS",
                        data: { ...admissionDetails, admissionDetails: body }
                    })
                }
            })
            .catch((err) => {
                console.log(err)
                CustomAlert("warning", err?.response?.data?.error)
            })
            .finally(() => _setLoading(false))
    }

    const getOtherList = () => {
        getBranchGridList()
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    _setBranchList(resp?.data?.result?.results);
                }
            })
            .catch(console.log)
    }

    const getGridList = () => {
        _setTableLoading(true);
        getApprovedAdmissionGridList(_page, _rowsPerPage, _filterData?.branchId?.toString(), _filterData?.fromDate, _filterData?.toDate, _filterData?.paymentStatus)
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    _setTableItems(resp?.data?.result?.results);
                    _setTableTotalCount(resp?.data?.result?.totalItems)
                }
            })
            .catch(console.log)
            .finally(() => _setTableLoading(false));
    }

    const handleUpdateSearch = (fromDate: string, toDate: string) => {
        _setFilterData({ ..._filterData, fromDate: fromDate, toDate: toDate })
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
    }, [])

    useEffect(() => {
        getGridList();
    }, [_page, _rowsPerPage, _filterData])


    return <>
        {!_editForm && <div className="container">
            <div className="row justify-content-between align-items-center py-3">
                <div className="col-md-4 my-2">
                    <span className="text-dark fw-bold">Admissions </span>
                </div>
                <div className="col-md-8">
                    <div className="row align-items-center">
                        <div className="col-md-2 my-2">
                            <CustomSelect className="" padding={'0px 10px'} value={_filterData?.branchId} onChange={(e: any) => changeFilterData('branchId', e.target.value)}
                                placeholder={"Branch"} menuItem={[<MenuItem className="px-2 fs14" value={''} key={-1}>All</MenuItem>,
                                ..._branchList?.map((item: any) => <MenuItem className="px-2 fs14" key={item?.id} value={item?.id}>{item?.branchName}</MenuItem>)]} />
                        </div>
                        <div className="col-md-2 my-2">
                            <CustomSelect className="" padding={'0px 10px'} value={_filterData?.paymentStatus} onChange={(e: any) => changeFilterData('paymentStatus', e.target.value)}
                                placeholder={"Status"} menuItem={[<MenuItem className="px-2 fs14" value={''} key={-1}>All</MenuItem>,
                                ['Paid', 'Unpaid', 'Partially Paid']?.map((item: any) => <MenuItem className="px-2 fs14" key={item} value={item}>{item}</MenuItem>)]} />
                        </div>
                        <div className="col-md-7 my-2">
                            <DateRangeSelector handleChangeDate={handleUpdateSearch} />
                        </div>
                        <div className="col-md-1 my-2">
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
                            <TableCell className="fw-bold text-nowrap">Status</TableCell>
                            <TableCell className="fw-bold text-nowrap">Branch</TableCell>
                            <TableCell className="fw-bold text-nowrap">Room No</TableCell>
                            <TableCell className="fw-bold text-nowrap">Room Type</TableCell>
                            <TableCell className="fw-bold text-nowrap">Cot No</TableCell>
                            <TableCell className="fw-bold text-nowrap">Cot Type</TableCell>
                            <TableCell className="fw-bold text-nowrap">Candidate Name</TableCell>
                            <TableCell className="fw-bold text-nowrap">Mobile Number</TableCell>
                            <TableCell className="fw-bold text-nowrap">Date of Admission</TableCell>
                            <TableCell className="fw-bold text-nowrap">Updated At</TableCell>
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
                                <TableRow key={index} sx={{ ...CustomTableHover }}>
                                    <TableCell>{(index + 1) + ((_page - 1) * _rowsPerPage)}</TableCell>
                                    <TableCell className="text-muted" align="center">
                                        <div className="d-flex align-items-center gap-2 justify-content-center" role="button" onClick={() => handleUpdateItem(item)}>
                                            <span>View</span>
                                            <img draggable="false" height={16} src={IMAGES_ICON.EyeIcon} alt="icon" />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted text-nowrap">
                                        <div className={`fs14 text-uppercase text-center px-2 pt-1 ${
                                            item?.admissionType === 'Staff'
                                                ? 'statusResolved'
                                                : item?.paymentStatus === "Paid"
                                                    ? 'statusResolved'
                                                    : item?.paymentStatus === "Unpaid"
                                                        ? 'statusRejected'
                                                        : 'statusInProgress'
                                        }`}>
                                            {item?.admissionType === 'Staff' ? 'Staff' : (item?.paymentStatus || "Unpaid")}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted text-nowrap">{item?.branchName}</TableCell>
                                    <TableCell className="text-muted text-nowrap">{item?.roomNumber}</TableCell>
                                    <TableCell className="text-muted text-nowrap">{item?.roomTypeName}</TableCell>
                                    <TableCell className="text-muted text-nowrap">{item?.cotNumber}</TableCell>
                                    <TableCell className="text-muted text-nowrap">{item?.cotTypeName}</TableCell>
                                    <TableCell className="text-muted text-nowrap">{item?.candidateName}</TableCell>
                                    <TableCell className="text-muted text-nowrap">{item?.candidateMobileNumber}</TableCell>
                                    <TableCell className="text-muted text-nowrap">{item?.dateOfAdmission && moment(item?.dateOfAdmission)?.format('DD-MMM-YYYY')}</TableCell>
                                    <TableCell className="text-muted text-nowrap">{item?.updatedAt && moment(item?.updatedAt)?.format('DD-MMM-YYYY')}</TableCell>
                                </TableRow>
                            ))
                        ) : !_tableLoading && (
                            <TableRow>
                                <TableCell className="fs-3 text-muted" align="center" colSpan={12}>Data Not Found</TableCell>
                            </TableRow>
                        )}
                        <SkeletonProviderTables columns={12} visible={_tableLoading} />
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
                    <div className="d-flex align-items-center py-2 borderBottomLight" role="button" onClick={handleGoBack}>
                        <img height={24} draggable={false} src={IMAGES_ICON.BackIcon} />
                        <div className="fw-bold">Back</div>
                    </div>
                    <div className="row justify-content-between pt-2">
                        <div className="col-md-2 my-2">
                            <div className="text-muted fs14 mb-1 d-flex align-items-center gap-1"><img draggable="false" height={18} src={IMAGES_ICON.LocationPinIcon} /> Branch Name</div>
                            <FormControl className="ms-4 w-75" variant="standard" fullWidth>
                                <Select readOnly={_formData?.edit} value={_formData?.branchRefId} onChange={(e) => changeFormData("branchRefId", e.target.value)}
                                    label=" " sx={{ fontSize: "14px" }} disableUnderline>
                                    {_branchList?.map((mItem: any, mIndex: number) =>
                                        <MenuItem className="fs14" key={mIndex} value={mItem?.id}>{mItem?.branchName}</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        </div>
                        <div className="col-md-2 my-2">
                            <div className="text-muted fs14 mb-1 d-flex align-items-center gap-1"><img draggable="false" height={18} src={IMAGES_ICON.RoomsIcon} /> Room</div>
                            <FormControl className="ms-4 w-75" variant="standard" fullWidth>
                                <Select readOnly={_formData?.edit} value={_formData?.roomRefId}
                                    label=" " sx={{ fontSize: "14px" }} disableUnderline>
                                    {_roomList?.map((mItem: any, mIndex: number) =>
                                        <MenuItem className="fs14" key={mIndex} value={mItem?.id} onClick={() => {
                                            _setCotList([...mItem?.Cots]);
                                            _setFormData({ ..._formData, roomRefId: mItem?.id, roomTypeName: mItem?.roomTypeName })
                                        }}>{mItem?.roomNumber}</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        </div>
                        <div className="col-md-2 my-2" onClick={() => _setLoading(false)}>
                            <div className="text-muted fs14 mb-1 d-flex align-items-center gap-1"><img draggable="false" height={18} src={IMAGES_ICON.RoomTypeIcon} /> Room Type</div>
                            <div className="fs14 mb-1 ms-4 w-75">{_formData?.roomTypeName}</div>
                        </div>
                        <div className="col-md-2 my-2">
                            <div className="text-muted fs14 mb-1 d-flex align-items-center gap-1"><img draggable="false" height={18} src={IMAGES_ICON.CotIcon} /> Cot</div>
                            <FormControl className="ms-4 w-75" variant="standard" fullWidth>
                                <Select readOnly={_formData?.edit} value={_formData?.cotRefId}
                                    label=" " sx={{ fontSize: "14px" }} disableUnderline>
                                    {_cotList?.map((mItem: any, mIndex: number) =>
                                        <MenuItem className="fs14" key={mIndex} value={mItem?.id} onClick={() => handleCotAndFeeUpdate(mItem)}>{mItem?.cotNumber} - {mItem?.CotType?.type}</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        </div>
                        <div className="col-md-2 my-2">
                            <div className="text-muted fs14 mb-1 d-flex align-items-center gap-1"><img draggable="false" height={18} src={IMAGES_ICON.CalenderIcon} /> Admission Date</div>
                            <TextField className="ms-4 w-75" fullWidth sx={{ ...textFieldStyle, padding: "8px 0px" }} variant="standard" type="date" onKeyDown={DisableKeyUpDown}
                                value={_formData?.dateOfAdmission} onChange={(e: any) => changeFormData('dateOfAdmission', e.target.value)}
                                inputProps={{ min: new Date().toISOString().split('T')[0], }} InputProps={{ readOnly: _formData?.edit }} />
                        </div>
                        {_formData?.id ? <div className="col-md-2 my-2">
                            <div className="text-muted fs14 mb-1 d-flex align-items-center gap-1"><img draggable="false" height={18} src={IMAGES_ICON.BoyUserIcon} /> Admitted By</div>
                            <div className="fs14 mb-1 ms-4 w-75">{_formData?.admittedBy}</div>
                        </div> :
                            <div className="col-md-2 my-2 alignCenter">
                                <Button variant="contained" color="primary" disabled={_loading} className="" onClick={handleSubmitForm}>Save</Button>
                            </div>
                        }
                    </div>
                    <div className="my-3">
                        <div className={_formData?.id ? '' : 'd-none'}>
                            <Tabs value={_selectedTab - 1} selectionFollowsFocus={false}
                                variant="scrollable"
                                scrollButtons
                                allowScrollButtonsMobile={false}
                                className='bg-dark d-flex align-items-center justify-content-between gap-3 w-100'
                                sx={{
                                    '& .MuiTabs-flexContainer': {
                                        justifyContent: 'space-between !important'
                                    }
                                }}
                            >
                                <Tab className="" onClick={() => _setSelectedTab(1)} label={<div className={`${_selectedTab === 1 ? 'text-white fw-bold' : 'fontLight'}`}>Candidate Details</div>} />
                                <Tab className="" onClick={() => _setSelectedTab(2)} label={<div className={`${_selectedTab === 2 ? 'text-white fw-bold' : 'fontLight'}`}>Room & Fee</div>} />
                                <Tab className="" onClick={() => _setSelectedTab(3)} label={<div className={`${_selectedTab === 3 ? 'text-white fw-bold' : 'fontLight'}`}>Documents</div>} />
                                <Tab className="" onClick={() => _setSelectedTab(4)} label={<div className={`${_selectedTab === 4 ? 'text-white fw-bold' : 'fontLight'}`}>Contact Person Info</div>} />
                                <Tab className="" onClick={() => _setSelectedTab(5)} label={<div className={`${_selectedTab === 5 ? 'text-white fw-bold' : 'fontLight'}`}>Purpose Of Stay</div>} />
                                <Tab className="" onClick={() => _setSelectedTab(6)} label={<div className={`${_selectedTab === 6 ? 'text-white fw-bold' : 'fontLight'}`}>Others</div>} />
                                <Tab className="" onClick={() => _setSelectedTab(7)} label={<div className={`${_selectedTab === 7 ? 'text-white fw-bold' : 'fontLight'}`}>Payments</div>} />
                            </Tabs>

                            <div className="p-4">
                                {_selectedTab === 1 && <CandidateDetails handleBack={handleGoBack} handleNext={() => _setSelectedTab(2)} />}
                                {_selectedTab === 2 && <RoomAndFee handleBack={() => _setSelectedTab(1)} handleNext={() => _setSelectedTab(3)} />}
                                {_selectedTab === 3 && <Documents handleBack={() => _setSelectedTab(2)} handleNext={() => _setSelectedTab(4)} />}
                                {_selectedTab === 4 && <ContactPerson handleBack={() => _setSelectedTab(3)} handleNext={() => _setSelectedTab(5)} />}
                                {_selectedTab === 5 && <PurposeOfStay handleBack={() => _setSelectedTab(4)} handleNext={() => _setSelectedTab(6)} />}
                                {_selectedTab === 6 && <Others handleBack={() => _setSelectedTab(5)} handleNext={() => _setSelectedTab(7)} />}
                                {_selectedTab === 7 && <Payments handleClose={handleGoBack} handleBack={() => _setSelectedTab(6)} PageAccess={PageAccess} handleNext={handleGoBack} />}
                            </div>
                        </div>
                        {/* {_formData?.id > 0 && <div className="px-4 d-flex align-items-center justify-content-end mobJustify gap-2">
                            {_selectedTab > 1 && <Button className="text-capitalize px-4" sx={{ color: "black" }} variant="outlined" onClick={() => _setSelectedTab(_selectedTab - 1)}>Back</Button>}
                            <Button variant="contained" color="primary" disabled={_loading} className="px-4" onClick={() => (_selectedTab === 7 && admissionDetails?.edit) ? handleGoBack() : handleNextTab()}>{(_selectedTab === 7 && admissionDetails?.edit) ? 'Close' : 'Next'}</Button>
                        </div>} */}
                    </div>
                </div>
            </div>
        </>}
    </>
}
