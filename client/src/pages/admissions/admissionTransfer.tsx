import { FormControl, Select, MenuItem, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { IMAGES_ICON } from "../../assets/images/exportImages";
import { textFieldStyle, DisableKeyUpDown, CustomAlert, customTableHeader, customTableTemplate } from "../../services/HelperService";
import { useStateValue } from "../../providers/StateProvider";
import { useEffect, useState } from "react";
import { getBranchGridList, getCandidateAdmissionById, getBranchCandidateDetailSearch, getBranchRoomsList, getAdmissionBookingAvailability, insertUpdateCandidateAdmission, getCotsByCotId, insertUpdateVacateDetails } from "../../models";
import CustomDialogue from "../../components/helpers/CustomDialogue";
import moment from "moment";
import { CustomAutoSelect } from "../../components/helpers/CustomSelect";
import { AddCircleOutlineRounded, RemoveCircleOutlineRounded } from "@mui/icons-material";

export default function AdmissionTransfer({ PageAccess }: any) {
    const [{ user }]: any = useStateValue()
    const [_branchList, _setBranchList] = useState<any>([]);
    const [_roomList, _setRoomList] = useState<any>([]);
    const [_cotList, _setCotList] = useState<any>([]);
    const [_searchCandidate, _setSearchCandidate] = useState('');
    const [_search, _setSearch] = useState('');
    const [_loading, _setLoading] = useState(false);
    const [_available, _setAvailable] = useState(false);
    const [_candidateList, _setCandidateList] = useState<any>([]);
    const [_candidateDetails, _setCandidateDetails] = useState<any>({});

    const [_editForm, _setEditForm] = useState(false);
    const [_view, _setView] = useState(false);
    const [_formData, _setFormData] = useState<any>({ id: 0, isActive: true, noDayStay: '1', noDayStayType: 'Month' })
    const [_cotDetails, _setCotDetails] = useState<any>({})

    const changeFormData = (key: string, value: any) => {
        if (key === 'noDayStay') {
            let monthlyRent = 0, dateOfNotice = '';
            if (_formData?.noDayStayType === "Days") {
                const perDayRent = Number(_cotDetails?.perDayRent || '0');
                monthlyRent = perDayRent * Number(value)
                dateOfNotice = moment(_formData?.dateOfAdmission).add(Number(value), 'days').format('YYYY-MM-DD')
            } else {
                monthlyRent = Number(_cotDetails?.rentAmount || '0') * Number(value)
                dateOfNotice = moment(_formData?.dateOfAdmission).add(Number(value), 'months').format('YYYY-MM-DD')
            }
            _setFormData({ ..._formData, [key]: value, monthlyRent: monthlyRent, dateOfNotice: dateOfNotice })
        } else if (key === "noDayStayType") {
            let monthlyRent = 0, dateOfNotice = '';
            if (value === "Days") {
                const perDayRent = Number(_cotDetails?.perDayRent || '0');
                monthlyRent = perDayRent * Number(_formData?.noDayStay)
                dateOfNotice = moment(_formData?.dateOfAdmission).add(Number(_formData?.noDayStay), 'days').format('YYYY-MM-DD')
            } else {
                monthlyRent = Number(_cotDetails?.rentAmount || '0') * Number(_formData?.noDayStay)
                dateOfNotice = moment(_formData?.dateOfAdmission).add(Number(_formData?.noDayStay), 'months').format('YYYY-MM-DD')
            }
            _setFormData({ ..._formData, [key]: value, monthlyRent: monthlyRent, dateOfNotice: dateOfNotice })
        } else {

            _setFormData({ ..._formData, [key]: value });
        }
    }

    const handleCotAndFeeUpdate = (item: any) => {
        _setFormData({ ..._formData, cotRefId: item?.id, admissionFee: item?.advanceAmount, monthlyRent: item?.rentAmount })
    }

    const handleSearchCandidate = () => {
        if (!_searchCandidate?.trim()) {
            return
        }
        _setLoading(true)
        getBranchCandidateDetailSearch(_searchCandidate)
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    if (!resp?.data?.result?.length) {
                        CustomAlert("error", "Candidate not found")
                    } else {
                        _setCandidateList([...resp?.data?.result])
                    }
                }
            })
            .catch((err) => console.log(err))
            .finally(() => _setLoading(false))
    }

    const handleSelectCandidate = (id: number) => {
        if (!id) {
            CustomAlert('warning', 'Candidate not registered')
            return;
        }
        _setCandidateList([]);
        getCandidateAdmissionById({ candidateId: id })
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    const data = resp?.data?.result?.length ? resp?.data?.result[0] : { ...resp?.data?.result }
                    if (!Object?.keys(data)?.length) {
                        CustomAlert("warning", "Candidate doesn't have any admission")
                    } else {
                        _setCandidateDetails({
                            ...data,
                            dateOfAdmission: data?.dateOfAdmission,
                            cotNumber: data?.cotNumber,
                            roomNumber: data?.roomNumber,
                            branchName: data?.branchName,
                        })
                    }
                }
            })
            .catch((err) => console.log(err))
    }

    const handleClearForm = () => {
        _setLoading(false);
        _setEditForm(false);
        _setCandidateDetails({})
        _setSearchCandidate('')
        _setAvailable(false)
        _setFormData({ id: 0, isActive: true, noDayStay: '1', noDayStayType: 'Month' })
    }


    const handleCheckAvailable = () => {
        // Validate required fields before checking availability
        if (!_formData?.branchRefId) {
            CustomAlert('warning', 'Please select a branch');
            return;
        }
        if (!_formData?.roomRefId) {
            CustomAlert('warning', 'Please select a room');
            return;
        }
        if (!_formData?.cotRefId) {
            CustomAlert('warning', 'Please select a cot');
            return;
        }
        if (!_formData?.dateOfAdmission) {
            CustomAlert('warning', 'Please select admission date');
            return;
        }

        // Check if trying to transfer to the same cot
        if (_candidateDetails?.cotRefId === _formData?.cotRefId &&
            _candidateDetails?.roomRefId === _formData?.roomRefId &&
            _candidateDetails?.branchRefId === _formData?.branchRefId) {
            CustomAlert('warning', 'Cannot transfer to the same cot. Please select a different cot.');
            return;
        }

        _setLoading(true)
        const body = {
            roomId: _formData?.roomRefId,
            branchId: _formData?.branchRefId,
            dateOfAdmission: _formData?.dateOfAdmission,
            cotId: _formData?.cotRefId,
        }
        getAdmissionBookingAvailability(body)
            .then((resp: any) => {
                if (resp?.data?.status === "success") {
                    if (resp?.data?.result?.status === 'Available') {
                        CustomAlert('success', resp?.data?.result?.message || 'Cot is available for transfer')
                        _setAvailable(true)
                    } else {
                        const message = resp?.data?.result?.message || `Booking available from ${moment(resp?.data?.result?.availableDate)?.format('DD-MMM-YYYY')}`;
                        CustomAlert('warning', message)
                        _setAvailable(false)
                    }
                }
            })
            .catch((err: any) => {
                const errorMessage = err?.response?.data?.error || 'Error checking availability';
                CustomAlert('warning', errorMessage)
                _setAvailable(false)
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


    const checkValidation = () => {
        if (!_formData?.noDayStayType) {
            CustomAlert("warning", "Duration type required");
            return false
        }
        if (!_formData?.noDayStay) {
            CustomAlert("warning", "Duration count required");
            return false
        }
        if (!_available) {
            CustomAlert("warning", "Please check availability before proceeding");
            return false
        }
        if (!_formData?.branchRefId) {
            CustomAlert("warning", "Branch selection required");
            return false
        }
        if (!_formData?.roomRefId) {
            CustomAlert("warning", "Room selection required");
            return false
        }
        if (!_formData?.cotRefId) {
            CustomAlert("warning", "Cot selection required");
            return false
        }
        if (!_formData?.dateOfAdmission) {
            CustomAlert("warning", "Admission date required");
            return false
        }
        return true
    }

    const handleReset = () => {
        _setAvailable(false)
        _setFormData({ id: 0, isActive: true, noDayStay: '1', noDayStayType: 'Month' })
    }

    const handleSubmitForm = () => {
        _setLoading(true);
        if (!checkValidation()) {
            _setLoading(false);
            return;
        }
        let totalPaid = 0;
        if (_candidateDetails?.paymentStatus === "Paid") {
            if (_candidateDetails?.noDayStayType === "Month") {
                totalPaid = Number(_candidateDetails?.monthlyRent || '0') * Number(_candidateDetails?.noDayStay || '0') + Number(_candidateDetails?.admissionFee || '0') + Number(_candidateDetails?.advancePaid || '0');
            } else {
                totalPaid = Number(_candidateDetails?.monthlyRent || '0') / 30 * Number(_candidateDetails?.noDayStay || '0') + Number(_candidateDetails?.admissionFee || '0') + Number(_candidateDetails?.advancePaid || '0');
            }
        }
        const transferBody = {
            id: _candidateDetails?.id || 0,
            candidateRefId: _candidateDetails?.candidateRefId || 0,
            branchRefId: _formData?.branchRefId || 0,
            roomRefId: _formData?.roomRefId || 0,
            cotRefId: _formData?.cotRefId || 0,
            dateOfAdmission: _formData?.dateOfAdmission || "",
            admittedBy: user?.firstName + ' ' + user?.lastName || "",
            dateOfNotice: _formData?.dateOfNotice || "",
            admissionFee: _formData?.admissionFee || "",
            advancePaid: _formData?.advancePaid || "",
            monthlyRent: (_formData?.monthlyRent || '') || "",
            noDayStayType: (_formData?.noDayStayType + '') || "Month",
            noDayStay: (_formData?.noDayStay + '') || "1",
            admissionStatus: "Inprogress",
            dues: _candidateDetails?.dues || "",
            isActive: true,
        }
        const vacateBody = {
            id: _formData?.id || 0,
            candidateRefId: transferBody?.candidateRefId,
            branchRefId: transferBody?.branchRefId,
            admissionRefId: transferBody?.id,
            vacateType: 'Transfer Vacate',
            vacateStatus: 'Approved',
            feedbackBehavior: '',
            feedbackBrief: '',
            damageRemarks: '',
            payableAdvancePaid: _candidateDetails?.paymentStatus === 'Paid' ? _candidateDetails?.advancePaid : '0',
            payableAdmissionFee: _candidateDetails?.paymentStatus === 'Paid' ? _candidateDetails?.admissionFee : '0',
            payableMonthlyRent: _candidateDetails?.paymentStatus === 'Paid' ? _candidateDetails?.monthlyRent : '0',
            payablePenalty: _candidateDetails?.paymentStatus === 'Paid' ? '0' : '0',
            payableDuePending: _candidateDetails?.paymentStatus === 'Paid' ? '0' : '0',
            netAmountPayable: _candidateDetails?.paymentStatus === 'Paid' ? (totalPaid + '') : '0',
            isActive: true
        }

        insertUpdateVacateDetails(vacateBody)
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    insertUpdateCandidateAdmission(transferBody)
                        .then((resp) => {
                            if (resp?.data?.status === "success") {
                                CustomAlert("success", "Candidate transfer successfully");
                                handleClearForm()
                            }
                        })
                        .catch((err) => console.log(err))
                        .finally(() => _setLoading(false))
                }
            })
            .catch((err => console.log(err)))
    }

    useEffect(() => {
        if (_formData?.cotRefId) {
            getCotsByCotId(_formData?.cotRefId)
                .then((resp) => {
                    if (resp?.data?.status === "success") {
                        const cotDetail = resp?.data?.result;
                        _setCotDetails(cotDetail)
                        _setFormData({
                            ..._formData,
                            roomNumber: cotDetail?.roomNumber,
                            cotNumber: cotDetail?.cotNumber,
                            cotsType: cotDetail?.cotsType,
                            roomTypeName: cotDetail?.roomTypeName,
                            admissionFee: cotDetail?.admissionFee,
                            advancePaid: cotDetail?.advanceAmount,
                            oneDayStay: cotDetail?.oneDayStay,
                            monthlyRent: cotDetail?.rentAmount || '0',
                            noDayStay: cotDetail?.noDayStay || '1',
                            noDayStayType: cotDetail?.noDayStayType || 'Month',
                            dateOfNotice: cotDetail?.dateOfNotice ? cotDetail?.dateOfNotice : moment(cotDetail?.dateOfAdmission).add(1, 'months').format('YYYY-MM-DD')
                        });
                    } else {
                        _setFormData({ id: 0, isActive: true, noDayStay: '1', noDayStayType: 'Month' })
                    }
                })
                .catch((err) => {
                    console.log(err)
                    _setFormData({ id: 0, isActive: true, noDayStay: '1', noDayStayType: 'Month' })
                })
        }
    }, [_formData?.cotRefId])

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

    return <>
        {!_editForm && <>
            <div className="container py-3">
                <div className="bg-field-gray  border rounded px-4 py-1">
                    <div className="my-3 px-2">
                        {!_candidateDetails?.id ? <form action="" onSubmit={(e) => { e.preventDefault(); handleSearchCandidate() }}>
                            <div className="row align-items-center">
                                <div className="col-md-5 my-3">
                                    <TextField fullWidth sx={{ ...textFieldStyle }} placeholder="Search Candidate / Branch"
                                        value={_searchCandidate} onChange={(e: any) => _setSearchCandidate(e.target.value)} />
                                </div>
                                <div className="col-md-2 my-3">
                                    <Button variant="contained" className="px-3" color="primary" disabled={_loading} type="submit">Search</Button>
                                </div>
                            </div>
                        </form>
                            : <></>}
                        {_candidateDetails?.id ? <>
                            <div className="d-flex align-items-center py-2 borderBottomLight" role="button" onClick={handleClearForm}>
                                <img height={24} draggable={false} src={IMAGES_ICON.BackIcon} />
                                <div className="fw-bold">Back</div>
                            </div>
                            <div className="row align-items-center">
                                <div className="col-md-3 mt-3">
                                    <div className="text-muted fs14 mb-1">Candidate Id</div>
                                    <div className="">{_candidateDetails?.candidateId}</div>
                                </div>
                                <div className="col-md-3 mt-3">
                                    <div className="text-muted fs14 mb-1">Name</div>
                                    <div className="">{_candidateDetails?.candidateName}</div>
                                </div>
                                <div className="col-md-3 mt-3">
                                    <div className="text-muted fs14 mb-1">Mobile Number</div>
                                    <div className="">{_candidateDetails?.candidateMobileNumber}</div>

                                </div>
                                <div className="col-md-3 mt-3">
                                    <div className="text-muted fs14 mb-1">Email</div>
                                    <div className="">{_candidateDetails?.candidateEmail}</div>
                                </div>

                            </div>
                        </> : <></>}
                    </div>
                </div>
            </div>
        </>}
        {_candidateDetails?.id ? <div className="container py-3">
            <div className="mx-auto fw-bold">Transfer From:</div>
            <div className="bg-field-gray  border rounded px-4 py-1">
                <div className="row justify-content-between pt-2">
                    <div className="col-md-2 my-2">
                        <div className="text-muted fs14 mb-1 d-flex align-items-center gap-1"><img draggable="false" height={18} src={IMAGES_ICON.LocationPinIcon} /> Branch Name</div>
                        <div className="fs14 mb-1 ms-4 w-75">{_candidateDetails?.branchName}</div>
                    </div>
                    <div className="col-md-2 my-2">
                        <div className="text-muted fs14 mb-1 d-flex align-items-center gap-1"><img draggable="false" height={18} src={IMAGES_ICON.RoomsIcon} /> Room</div>
                        <div className="fs14 mb-1 ms-4 w-75">{_candidateDetails?.roomNumber}</div>
                    </div>
                    <div className="col-md-2 my-2" onClick={() => _setLoading(false)}>
                        <div className="text-muted fs14 mb-1 d-flex align-items-center gap-1"><img draggable="false" height={18} src={IMAGES_ICON.RoomTypeIcon} /> Room Type</div>
                        <div className="fs14 mb-1 ms-4 w-75">{_candidateDetails?.roomTypeName}</div>
                    </div>
                    <div className="col-md-2 my-2">
                        <div className="text-muted fs14 mb-1 d-flex align-items-center gap-1"><img draggable="false" height={18} src={IMAGES_ICON.CotIcon} /> Cot</div>
                        <div className="fs14 mb-1 ms-4 w-75">{_candidateDetails?.cotNumber}</div>
                    </div>
                    <div className="col-md-2 my-2">
                        <div className="text-muted fs14 mb-1 d-flex align-items-center gap-1"><img draggable="false" height={18} src={IMAGES_ICON.CalenderIcon} /> Admission Date</div>
                        <div className="fs14 mb-1 ms-4 w-75">{moment(_candidateDetails?.dateOfAdmission)?.format('DD-MM-YYYY')}</div>
                    </div>
                    <div className="col-md-2 my-2">
                        <div className="text-muted fs14 mb-1 d-flex align-items-center gap-1"><img draggable="false" height={18} src={IMAGES_ICON.BoyUserIcon} /> Admitted By</div>
                        <div className="fs14 mb-1 ms-4 w-75">{_candidateDetails?.admittedBy}</div>
                    </div>
                </div>
            </div>
            <div className="mx-auto fw-bold mt-3">Transfer To:</div>
            <div className="bg-field-gray  border rounded px-4 py-1">
                {/* <div className="d-flex align-items-center py-2 borderBottomLight" role="button" onClick={handleGoBack}>
                    <img height={24} draggable={false} src={IMAGES_ICON.BackIcon} />
                    <div className="fw-bold">Back</div>
                </div> */}
                <div className="row justify-content-between pt-2">
                    <div className="col-md-2 my-2">
                        <div className="text-muted fs14 mb-1 d-flex align-items-center gap-1"><img draggable="false" height={18} src={IMAGES_ICON.LocationPinIcon} /> Branch Name</div>
                        <FormControl className="ms-4 w-75" variant="standard" fullWidth>
                            <Select value={_formData?.branchRefId} onChange={(e) => changeFormData("branchRefId", e.target.value)}
                                disabled={_available} label=" " sx={{ fontSize: "14px" }} disableUnderline>
                                {_branchList?.map((mItem: any, mIndex: number) =>
                                    <MenuItem className="fs14" key={mIndex} value={mItem?.id}>{mItem?.branchName}</MenuItem>
                                )}
                            </Select>
                        </FormControl>
                    </div>
                    <div className="col-md-2 my-2">
                        <div className="text-muted fs14 mb-1 d-flex align-items-center gap-1"><img draggable="false" height={18} src={IMAGES_ICON.RoomsIcon} /> Room</div>
                        <FormControl className="ms-4 w-75" variant="standard" fullWidth>
                            <Select value={_formData?.roomRefId}
                                disabled={_available} label=" " sx={{ fontSize: "14px" }} disableUnderline>
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
                            <Select value={_formData?.cotRefId}
                                disabled={_available} label=" " sx={{ fontSize: "14px" }} disableUnderline>
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
                            slotProps={{ input: { readOnly: _available } }}
                            inputProps={{ min: new Date().toISOString().split('T')[0], }} />
                    </div>
                    <div className="col-md-2 my-2">
                        <div className="text-muted fs14 mb-1 d-flex align-items-center gap-1"><img draggable="false" height={18} src={IMAGES_ICON.BoyUserIcon} /> Transferred By</div>
                        <div className="fs14 mb-1 ms-4 w-75">{user?.firstName + ' ' + user?.lastName}</div>
                    </div>
                </div>
            </div>
            {_available && <>
                <hr />
                <div className="row mt-3">
                    <div className="fw-bold">Stay Duration</div>
                    <div className="col-md-3 my-3">
                        <div className="text-muted fs14 mb-1 required">Duration Type</div>
                        <CustomAutoSelect value={_formData?.noDayStayType}
                            onChange={(value: any) => { changeFormData('noDayStayType', value || '') }}
                            placeholder={"Select sharing type"}
                            menuItem={(_formData?.oneDayStay ? ['Days', 'Month'] : ['Month'])?.map((item: any) => {
                                return { title: item, value: item }
                            })} />
                    </div>
                    <div className="col-md-3 my-3">
                        <div className="text-muted fs14 mb-1 required">Duration Count</div>
                        <TextField fullWidth sx={{ ...textFieldStyle }}
                            value={_formData?.noDayStay}
                            inputProps={{ style: { textAlign: "center" } }}
                            InputProps={{
                                readOnly: true,
                                startAdornment: <RemoveCircleOutlineRounded className={`${_formData?.noDayStay > 1 ? 'text-danger' : 'text-muted'}`} role="button"
                                    onClick={() => _formData?.noDayStay > 1 && changeFormData('noDayStay', Number(_formData?.noDayStay) - 1)} />,
                                endAdornment: <AddCircleOutlineRounded className={`${'text-success'}`} role="button"
                                    onClick={() => changeFormData('noDayStay', Number(_formData?.noDayStay) + 1)} />,
                            }} />
                    </div>
                </div>
                <hr />
                <div className="row">
                    <div className="fw-bold">Room Details</div>
                    <div className="col-md-3 my-3">
                        <div className="text-muted fs14 mb-1">Room Number</div>
                        <div className="">{_formData?.roomNumber}</div>
                    </div>
                    <div className="col-md-3 my-3">
                        <div className="text-muted fs14 mb-1">Cot No</div>
                        <div className="">{_formData?.cotNumber}</div>
                    </div>
                    <div className="col-md-3 my-3">
                        <div className="text-muted fs14 mb-1">Cot Type</div>
                        <div className="">{_formData?.cotsType}</div>
                    </div>
                    <div className="col-md-3 my-3">
                        <div className="text-muted fs14 mb-1">Room Type</div>
                        <div className="">{_formData?.roomTypeName}</div>
                    </div>
                    <div></div>
                    <div className="col-md-3 my-3">
                        <div className="text-muted fs14 mb-1">Date of Admission</div>
                        <div className="">{moment(_formData?.dateOfAdmission)?.format('DD-MMM-YYYY')}</div>
                    </div>
                    <div className="col-md-3 my-3">
                        <div className="text-muted fs14 mb-1">Date of Notice</div>
                        <div className="">{_formData?.dateOfNotice ? moment(_formData?.dateOfNotice)?.format('DD-MMM-YYYY') : ''}</div>
                    </div>
                </div>
                <hr />
                <div className="row">
                    <div className="fw-bold">Fee Details</div>
                    <div className="col-md-3 my-3">
                        <div className="text-muted fs14 mb-1">Admission Fee</div>
                        <div className="">₹ {_formData?.admissionFee}</div>
                        {/* <TextField fullWidth sx={{ ...textFieldStyle }} type="number" onKeyDown={DisableKeyUpDown}
                                    value={_formData?.admissionFee}
                                    InputProps={{ readOnly: true, startAdornment: <span className="text-muted me-1">₹</span> }} /> */}
                    </div>
                    <div className="col-md-3 my-3">
                        <div className="text-muted fs14 mb-1">Advance Pay</div>
                        <div className="">₹ {_formData?.advancePaid}</div>

                        {/* <TextField fullWidth sx={{ ...textFieldStyle }} type="number" onKeyDown={DisableKeyUpDown}
                                    value={_formData?.advancePaid}
                                    InputProps={{ readOnly: true, startAdornment: <span className="text-muted me-1">₹</span> }} /> */}
                    </div>
                    <div className="col-md-3 my-3">
                        <div className="text-muted fs14 mb-1">Monthly Rent</div>
                        <div className="">₹ {_formData?.monthlyRent}</div>

                        {/* <TextField fullWidth sx={{ ...textFieldStyle }} value={_formData?.monthlyRent}
                                    InputProps={{ readOnly: true, startAdornment: <span className="text-muted me-1">₹</span> }} /> */}
                    </div>
                </div>
            </>}
            {PageAccess === 'Write' && <div className="my-3 text-center d-flex justify-content-center gap-3 align-items-center">
                <Button variant="outlined" color="primary" disabled={_loading} className="" onClick={handleReset}>Reset</Button>
                {_available ? <Button variant="contained" color="primary" disabled={_loading} className="" onClick={handleSubmitForm}>Update</Button>
                    : <Button variant="contained" color="primary" disabled={_loading} className="" onClick={handleCheckAvailable}>Check Availability</Button>}
            </div>}
        </div> : <></>}

        <CustomDialogue displaySize={"md"} title={'Select Candidate'} dialogueFlag={_candidateList?.length > 0} onCloseClick={() => _setCandidateList([])}
            mainContent={<div className="my-2">
                <TableContainer className="tableBorder rounded">
                    <Table size="small" sx={{ ...customTableTemplate }} >
                        <TableHead>
                            <TableRow className="px-2" sx={{ ...customTableHeader }}>
                                <TableCell className="fw-bold text-nowrap"></TableCell>
                                <TableCell className="fw-bold text-nowrap">Name</TableCell>
                                <TableCell className="fw-bold text-nowrap">Email</TableCell>
                                <TableCell className="fw-bold text-nowrap">Branch Name</TableCell>
                                <TableCell className="fw-bold text-nowrap">Date of Admission</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {_candidateList?.map((item: any, index: number) =>
                                <TableRow key={index}>
                                    <TableCell>
                                        {item?.CandidateDetails?.blackListed === "yes" ?
                                            <Button className="" size="small" variant="contained" color="error">Blocked</Button> :
                                            <Button className="" size="small" variant="outlined" color="secondary" onClick={() => handleSelectCandidate(item?.candidateRefId)}>Select</Button>}
                                    </TableCell>
                                    <TableCell className="text-muted text-nowrap">{item?.CandidateDetails?.name}</TableCell>
                                    <TableCell className="text-muted text-nowrap">{item?.CandidateDetails?.email}</TableCell>
                                    <TableCell className="text-muted text-nowrap">{item?.BranchDetails?.branchName}</TableCell>
                                    <TableCell className="text-muted text-nowrap">{item?.dateOfAdmission && moment(item?.dateOfAdmission)?.format('DD-MMM-YYYY')}</TableCell>
                                </TableRow>)}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>} />
    </>
}
