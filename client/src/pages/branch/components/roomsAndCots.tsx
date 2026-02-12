import { AddBoxOutlined, AddCircleOutlineRounded, CloudUploadRounded, RemoveCircleOutlineRounded, VisibilityRounded } from "@mui/icons-material";
import { Button, Table, TableHead, TableRow, TableCell, TableBody, MenuItem, Pagination, PaginationItem, TextField, styled, Tab, Tabs, Checkbox, FormControlLabel, TableContainer } from "@mui/material";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { IMAGES_ICON } from "../../../assets/images/exportImages";
import CustomSelect, { CustomAutoSelect } from "../../../components/helpers/CustomSelect";
import { SkeletonProviderTables } from "../../../providers/SkeletonProvider";
import { customTableTemplate, customTableHeader, CustomAlert, textFieldStyle, DisableKeyUpDown } from "../../../services/HelperService";
import CustomDialogue from "../../../components/helpers/CustomDialogue";
import { commonUploadFile, getBranchRoomsList, getMasterBathroomType, getMasterCotType, getMasterRoomType, getMasterSharingType, insertUpdateBranchAnyDetails, insertUpdateBranchCots, insertUpdateBranchRooms } from "../../../models";
import { useStateValue } from "../../../providers/StateProvider";
import { ROUTES } from "../../../configs/constants";
import Swal from "sweetalert2";


const Input = styled('input')({ display: 'none', });
export default function BranchRoomsAndCots({ handleBack, handleNext }: any) {
    const [{ branchDetails }]: any = useStateValue()
    const refDocument = useRef() as MutableRefObject<HTMLInputElement>;
    const [_formData, _setFormData] = useState<any>({
        id: 0,
        sharingTypeId: '',
        roomTypeId: '',
        bathroomTypeId: '',
        roomSize: '',
        roomNumber: '',
        floorNumber: '',
        numberOfCots: 0,
        oneDayStay: true,
        admissionFee: '',
        isActive: true,
        cotStatus: 'Vacant',
    })
    const [_tableList, _setTableList] = useState<any>([]);
    const [_roomList, _setRoomList] = useState<any>([]);
    const [_cotList, _setCotList] = useState<any>([]);
    const [_addPopup, _setAddPopup] = useState(false);
    const [_roomId, _setRoomId] = useState(0);
    const [_totalRoomCot, _setTotalRoomCot] = useState({ room: 0, cot: 0, totalRoom: 0, totalCot: 0 });
    const [_tableLoading, _setTableLoading] = useState(false);
    const [_loading, _setLoading] = useState(false);
    const [_page, _setPage] = useState(1);
    const [_rowsPerPage, _setRowsPerPage] = useState(10);

    const [_previewImage, _setPreviewImage] = useState(-1);

    const [_sharingTypeList, _setSharingTypeList] = useState<any>([]);
    const [_roomTypeList, _setRoomTypeList] = useState<any>([]);
    const [_bathroomTypeList, _setBathroomTypeList] = useState<any>([]);
    const [_cotTypeList, _setCotTypeList] = useState<any>([]);

    const validate = {
        sharingTypeId: { error: false, message: "" },
        roomTypeId: { error: false, message: "" },
        bathroomTypeId: { error: false, message: "" },
        admissionFee: { error: false, message: "" },
        advanceAmount: { error: false, message: "" },
        lateFeeAmount: { error: false, message: "" },
        roomSize: { error: false, message: "" },
        roomNumber: { error: false, message: "" },
        floorNumber: { error: false, message: "" },
        numberOfCots: { error: false, message: "" },
    }

    const [_validate, _setValidate] = useState(validate);

    const changeCotData = (index: number, key: string, value: any) => {
        const _tempArr = [..._cotList]
        _tempArr[index][key] = value
        _setCotList([..._tempArr])
    }

    const changeFormData = (key: string, value: any, extraValue?: any) => {
        if (key === "numberOfCots") {
            if (extraValue === 'add') {
                const _tempArr = [..._cotList, {
                    id: 0,
                    roomId: 0,
                    cotTypeId: null,
                    cotNumber: "A" + (_cotList?.length + 1),
                    rentAmount: "",
                    perDayRent: "",
                    cotPhotos: [],
                    isActive: true,
                    cotStatus: 'Vacant',
                }]
                _setTotalRoomCot({ ..._totalRoomCot, cot: _totalRoomCot?.cot + 1 })
                _setCotList([..._tempArr])
                _setFormData({ ..._formData, [key]: value })
            } else if (extraValue === 'remove') {
                const _tempArr = [..._cotList]
                if (_tempArr.at(-1)?.id) {
                    // _tempArr[_tempArr?.length - 1].isActive = false;
                } else {
                    _tempArr.pop();
                    _setTotalRoomCot({ ..._totalRoomCot, cot: _totalRoomCot?.cot - 1 })
                    _setFormData({ ..._formData, [key]: value })
                }
                _setCotList([..._tempArr])
            }
        } else {
            _setFormData({ ..._formData, [key]: value })
        }
    }

    const handleChangePage = (_event: React.ChangeEvent<unknown>, value: number) => {
        _setPage(value);
    }

    const handleAddNew = () => {
        if ((_totalRoomCot?.totalRoom - _totalRoomCot?.room) === 0) {
            CustomAlert("warning", "Room limit exceed !!!")
        } else {
            _setAddPopup(true)
        }
    }

    const handlePopupClose = () => {
        _setAddPopup(false)
        _setCotList([])
        _setFormData({ id: 0, sharingTypeId: '', roomTypeId: '', bathroomTypeId: '', roomSize: '', roomNumber: '', floorNumber: '', numberOfCots: 0, isActive: true, cotStatus: 'Vacant' })
        let cot = 0;
        _roomList?.forEach((fItem: any) => {
            cot += fItem?.Cots?.length;
        })
        const TOTAL_ROOM = branchDetails?.branchDetails?.numberOfRooms
        const TOTAL_COT = branchDetails?.branchDetails?.numberOfCots
        _setTotalRoomCot({ room: _roomList?.length, cot: cot, totalRoom: TOTAL_ROOM, totalCot: TOTAL_COT })

    }

    const handleUpdateItem = (item: any) => {
        _setAddPopup(true)
        _setFormData({ ...item })
        _setCotList([...item?.Cots?.map((mItem: any) => {
            return {
                ...mItem,
                cotPhotos: mItem?.cotPhotos ? mItem?.cotPhotos?.split(',').filter(Boolean) : []
            }
        })])
    }

    const handlePreviewImage = (index: number) => {
        _setPreviewImage(index)
    }

    const checkValidation = () => {
        let valid = true;

        const validation = { ...validate };

        if (!_formData?.sharingTypeId) {
            validation.sharingTypeId.error = true;
            validation.sharingTypeId.message = "Required Field";
            valid = false;
        }
        if (!_formData?.roomTypeId) {
            validation.roomTypeId.error = true;
            validation.roomTypeId.message = "Required Field";
            valid = false;
        }
        if (!_formData?.bathroomTypeId) {
            validation.bathroomTypeId.error = true;
            validation.bathroomTypeId.message = "Required Field";
            valid = false;
        }
        if (!_formData?.bathroomTypeId) {
            validation.bathroomTypeId.error = true;
            validation.bathroomTypeId.message = "Required Field";
            valid = false;
        }
        if (!_formData?.admissionFee?.trim()) {
            validation.admissionFee.error = true;
            validation.admissionFee.message = "Required Field";
            valid = false;
        }
        if (!_formData?.advanceAmount?.trim()) {
            validation.advanceAmount.error = true;
            validation.advanceAmount.message = "Required Field";
            valid = false;
        }
        if (!_formData?.lateFeeAmount?.trim()) {
            validation.lateFeeAmount.error = true;
            validation.lateFeeAmount.message = "Required Field";
            valid = false;
        }
        if (!_formData?.roomSize) {
            validation.roomSize.error = true;
            validation.roomSize.message = "Required Field";
            valid = false;
        }
        if (!_formData?.roomNumber) {
            validation.roomNumber.error = true;
            validation.roomNumber.message = "Required Field";
            valid = false;
        }
        if (!_formData?.floorNumber) {
            validation.floorNumber.error = true;
            validation.floorNumber.message = "Required Field";
            valid = false;
        }

        _setValidate(validation);
        return valid;
    }

    const handleSubmitForm = () => {
        _setLoading(true);
        if (!checkValidation()) {
            _setLoading(false);
            return;
        }

        const body = {
            id: _formData?.id || 0,
            branchId: branchDetails?.branchDetails?.id,
            roomTypeId: _formData?.roomTypeId,
            bathroomTypeId: _formData?.bathroomTypeId,
            sharingTypeId: _formData?.sharingTypeId,
            roomNumber: _formData?.roomNumber || "",
            roomSize: _formData?.roomSize || "",
            floorNumber: _formData?.floorNumber || "",
            numberOfCots: _formData?.numberOfCots || 0,
            admissionFee: _formData?.admissionFee || '0',
            advanceAmount: _formData?.advanceAmount || '0',
            lateFeeAmount: _formData?.lateFeeAmount || '0',
            oneDayStay: _formData?.oneDayStay || false,
            isActive: _formData?.isActive || false,
            cotStatus: _formData?.cotStatus || 'Vacant',
        }

        insertUpdateBranchRooms(body)
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    handleUpdateCotsId(resp?.data?.result?.roomId)
                }
            })
            .catch(console.log)
    }

    const handleUpdateCotsId = (roomId: any) => {
        const _tempArr = [..._cotList?.map((mItem: any) => {
            mItem.roomId = roomId
            mItem.cotPhotos = mItem?.cotPhotos?.length ? mItem?.cotPhotos?.join(',') : ""
            return mItem
        })]
        if (_tempArr?.length > 0) {
            insertUpdateBranchCots({ cots: [..._tempArr] })
                .then((resp) => {
                    if (resp?.data?.status === "success") {
                        CustomAlert("success", "Rooms & Cots saved");
                        getRoomListData('CotUpdate', [..._tempArr])
                        handlePopupClose()
                    }
                })
                .catch(console.log)
                .finally(() => _setLoading(false))
        } else {
            _setLoading(false)
            CustomAlert("success", "Rooms & Cots saved")
            handlePopupClose()
        }
    }

    const onUpload = async (files: any, index: number) => {
        _setLoading(true)
        const _tempArr = [..._cotList]
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
                .catch(error => { console.log(error.response); })
        }
        _tempArr[index].cotPhotos.push(...imageList)
        await _setCotList([..._tempArr])
        await _setLoading(false)
    }

    const getRoomListData = (type = "", _tempArr: any = []) => {
        _setTableLoading(true)
        getBranchRoomsList(branchDetails?.branchDetails?.id, 'admin')
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    const total_data = resp?.data?.result.flatMap((room: any) =>
                        room?.Cots?.length > 0
                            ? room?.Cots.map((cot: any) => {
                                const fItem = _tempArr?.find((fItem: any) => fItem?.id === cot?.id)
                                if (fItem) {
                                    cot.cotStatus = fItem?.cotStatus
                                }
                                return { ...room, cot }
                            })
                            : [{ ...room, cot: {} }]
                    )
                    _setTableList(resp?.data?.result)
                    _setRoomList(resp?.data?.result);
                    let cot = 0;
                    resp?.data?.result?.forEach((fItem: any) => {
                        cot += fItem?.Cots?.length;
                    })
                    const TOTAL_ROOM = branchDetails?.branchDetails?.numberOfRooms
                    const TOTAL_COT = branchDetails?.branchDetails?.numberOfCots
                    _setTotalRoomCot({ room: resp?.data?.result?.length, cot: cot, totalRoom: TOTAL_ROOM, totalCot: TOTAL_COT })

                    if (type === "CotUpdate") {
                        handleUpdateBranchTotalCots(total_data)
                    }
                }
            })
            .catch(console.log)
            .finally(() => _setTableLoading(false))
    }

    const handleUpdateBranchTotalCots = (item: any) => {
        if (item?.length === 0) return;
        const body = {
            id: branchDetails?.branchDetails?.id,
            cotVacant: item?.map((mItem: any) => { if (mItem?.cot?.cotStatus === 'Vacant') return mItem?.cot?.id })?.filter(Boolean)?.join(','),
            cotMaintenance: item?.map((mItem: any) => { if (mItem?.cot?.cotStatus === 'Maintenance') return mItem?.cot?.id })?.filter(Boolean)?.join(','),
            totalCots: item?.map((mItem: any) => { return mItem?.cot?.id })?.join(',')
        }
        insertUpdateBranchAnyDetails(body)
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    getRoomListData()
                }
            })
            .catch((err) => console.log(err))
    }

    const removePhotosItem = (index: number, cIndex: number) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You want to delete this image!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#388024",
            cancelButtonColor: "#bf1029",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {
                let _temp = [..._cotList];
                let photosList = _temp[index]?.cotPhotos
                photosList.splice(cIndex, 1)
                _temp[index].cotPhotos = [...photosList];
                _setCotList([..._temp])
            }
        });
    }

    const getAllOtherList = () => {
        getMasterRoomType()
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    _setRoomTypeList(resp?.data?.result);
                }
            })
            .catch(console.log)
        getMasterSharingType()
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    _setSharingTypeList(resp?.data?.result);
                }
            })
            .catch(console.log)
        getMasterCotType()
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    _setCotTypeList(resp?.data?.result);
                }
            })
            .catch(console.log)
        getMasterBathroomType()
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    _setBathroomTypeList(resp?.data?.result);
                }
            })
            .catch(console.log)
    }

    useEffect(() => {
        getAllOtherList()
        getRoomListData()
    }, [])


    return <>
        <div className=''>
            <div className='d-flex align-items-center justify-content-between'>
                <div className='fw-bold fs16'>Rooms & Cots</div>
                <Button className="text-capitalize cursorPointer" startIcon={<AddBoxOutlined sx={{ color: "#F76D61" }} />}
                    onClick={handleAddNew}>Add New</Button>
            </div>

            <div className="mt-3">
                <TableContainer className="tableBorder rounded">
                    <Table sx={{ ...customTableTemplate }} >
                        <TableHead>
                            <TableRow className="px-2" sx={{ ...customTableHeader }}>
                                <TableCell className="fw-bold">S.No</TableCell>
                                <TableCell className="fw-bold">Room Type</TableCell>
                                <TableCell className="fw-bold">Room Number</TableCell>
                                <TableCell className="fw-bold">Admission Fee</TableCell>
                                <TableCell className="fw-bold">Advance Amount</TableCell>
                                <TableCell className="fw-bold">Late Fee</TableCell>
                                <TableCell className="fw-bold" align="center">Status</TableCell>
                                <TableCell className="fw-bold" align="center">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {_tableList?.length > 0 ?
                                _tableList?.slice((_page - 1) * _rowsPerPage, (_page - 1) * _rowsPerPage + _rowsPerPage)
                                    ?.map((item: any, index: number) =>
                                        <TableRow key={index}>
                                            <TableCell>{(index + 1) + ((_page - 1) * _rowsPerPage)}</TableCell>
                                            <TableCell className="text-muted text-nowrap">{item?.roomTypeName}</TableCell>
                                            <TableCell className="text-muted text-nowrap">{item?.roomNumber}</TableCell>
                                            <TableCell className="text-muted text-nowrap">{item?.admissionFee}</TableCell>
                                            <TableCell className="text-muted text-nowrap">{item?.advanceAmount}</TableCell>
                                            <TableCell className="text-muted text-nowrap">{item?.lateFeeAmount}</TableCell>
                                            <TableCell className="text-muted" align="center">
                                                {item?.isActive ?
                                                    <span className="fs12 statusBgActive text-success rounded--50 px-3 py-1">Active</span>
                                                    : <span className="fs12 statusBgInactive text-danger rounded--50 px-3 py-1">Inactive</span>
                                                }
                                            </TableCell>
                                            <TableCell className="text-muted" align="center">
                                                <div className="d-flex align-items-center gap-2 justify-content-center" role="button" onClick={() => handleUpdateItem(item)}>
                                                    <span>Edit</span>
                                                    <img draggable="false" height={16} src={IMAGES_ICON.EditIcon} alt="icon" />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                : !_tableLoading && (
                                    <TableRow>
                                        <TableCell className="fs-3 text-muted" align="center" colSpan={8}>No Rooms Added</TableCell>
                                    </TableRow>
                                )}
                            <SkeletonProviderTables columns={8} visible={_tableLoading} />
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
            <div className="mt-3 d-flex justify-content-between flex-wrap">
                <div className="d-flex align-items-center gap-2">
                    <span className='textLightGray fs14 text-nowrap'>Items per page:</span>
                    <CustomSelect padding={'6px'} value={Number(_rowsPerPage)} onChange={(e: any) => _setRowsPerPage(e.target.value)}
                        placeholder={" "} menuItem={[10, 20, 30]?.map((item: any) =>
                            <MenuItem key={item} value={item}>{item}</MenuItem>)} />
                </div>
                <Pagination count={Math.ceil((_roomList?.reduce((sum: number, room: any) => sum + (room?.Cots?.length || 1), 0)) / _rowsPerPage) || 0} page={_page} onChange={handleChangePage}
                    size={"small"} color={"primary"}
                    renderItem={(item) => <PaginationItem sx={{ mx: '4px' }} {...item} />} />
            </div>

            <div className="row mt-3">
                <hr />
                <div className="col-md-8 mb-2">
                    {/* <TextField sx={{ ...textFieldStyle }} className="" fullWidth placeholder="Add Notes"
                        value={branchDetails?.branchDetails?.notes} InputProps={{ readOnly: true }} /> */}
                </div>
                <div className="col-md-4 mb-2">
                    <div className="d-flex align-items-center justify-content-end mobJustify gap-3">
                        <FormControlLabel label="Active"
                            control={<Checkbox className="text-capitalize" checked={branchDetails?.branchDetails?.isActive} />} />
                        <Button className="px-4 text-capitalize" variant="outlined" sx={{ color: "black" }} disabled={_loading} onClick={handleBack}>Back</Button>
                        <Button className="px-4" variant="contained" color="primary" disabled={_loading} onClick={handleNext}>Next</Button>
                    </div>
                </div>
            </div>
        </div>
        <hr className="mb-0" />
        <CustomDialogue displaySize="lg" title="Rooms & Cots" dialogueFlag={_addPopup} onCloseClick={handlePopupClose}
            mainContent={<div className="my-2 no-select">
                <div className="row">
                    <div className="col-md-3 mb-3">
                        <div className="text-muted fs14 mb-1 required">Sharing Type</div>
                        <CustomAutoSelect value={_formData?.sharingTypeId}
                            error={_validate.sharingTypeId.error}
                            helperText={_validate.sharingTypeId.message}
                            onChange={(value: any) => { changeFormData('sharingTypeId', value || '') }}
                            placeholder={"Select sharing type"}
                            menuItem={_sharingTypeList?.map((item: any) => {
                                return item?.isActive ? { title: (item?.type || ''), value: item?.id } : null
                            })?.filter(Boolean)} />
                    </div>
                    <div className="col-md-3 mb-3">
                        <div className="text-muted fs14 mb-1 required">Room Type</div>
                        <CustomAutoSelect value={_formData?.roomTypeId}
                            error={_validate.roomTypeId.error}
                            helperText={_validate.roomTypeId.message}
                            onChange={(value: any) => { changeFormData('roomTypeId', value || '') }}
                            placeholder={"Select room type"}
                            menuItem={_roomTypeList?.map((item: any) => {
                                return item?.isActive ? { title: (item?.type || ''), value: item?.id } : null
                            })?.filter(Boolean)} />
                    </div>
                    <div className="col-md-3 mb-3">
                        <div className="text-muted fs14 mb-1 required">Bathroom Type</div>
                        <CustomAutoSelect value={_formData?.bathroomTypeId}
                            error={_validate.bathroomTypeId.error}
                            helperText={_validate.bathroomTypeId.message}
                            onChange={(value: any) => { changeFormData('bathroomTypeId', value || '') }}
                            placeholder={"Select bathroom type"}
                            menuItem={_bathroomTypeList?.map((item: any) => {
                                return item?.isActive ? { title: (item?.type || ''), value: item?.id } : null
                            })?.filter(Boolean)} />
                    </div>
                    <div className="col-md-3 mb-3">
                        <div className="text-muted fs14 mb-1">Room Size</div>
                        <TextField fullWidth sx={{ ...textFieldStyle }}
                            value={_formData?.roomSize} onChange={(e: any) => changeFormData('roomSize', e.target.value)}
                            error={_validate.roomSize.error} helperText={_validate.roomSize.message} />
                    </div>
                    <div className="col-md-3 mb-3">
                        <div className="text-muted fs14 mb-1 required">Room Number</div>
                        <TextField fullWidth sx={{ ...textFieldStyle }}
                            value={_formData?.roomNumber} onChange={(e: any) => changeFormData('roomNumber', e.target.value)}
                            error={_validate.roomNumber.error} helperText={_validate.roomNumber.message} />
                    </div>
                    <div className="col-md-3 mb-3">
                        <div className="text-muted fs14 mb-1 required">Floor Number</div>
                        <TextField fullWidth sx={{ ...textFieldStyle }}
                            value={_formData?.floorNumber} onChange={(e: any) => changeFormData('floorNumber', e.target.value)}
                            error={_validate.floorNumber.error} helperText={_validate.floorNumber.message} />
                    </div>
                    <div className="col-md-3 mb-3">
                        <div className="text-muted fs14 mb-1">Number of Cots</div>
                        <TextField fullWidth sx={{ ...textFieldStyle }}
                            value={_formData?.numberOfCots + '/' + (_totalRoomCot?.totalCot)}
                            inputProps={{ style: { textAlign: "center" } }}
                            InputProps={{
                                readOnly: true,
                                startAdornment: <RemoveCircleOutlineRounded className={`${_formData?.numberOfCots > 0 ? 'text-danger' : 'text-muted'}`} role="button"
                                    onClick={() => _formData?.numberOfCots > 0 && changeFormData('numberOfCots', Number(_formData?.numberOfCots) - 1, 'remove')} />,
                                endAdornment: <AddCircleOutlineRounded className={`${_totalRoomCot?.cot < _totalRoomCot?.totalCot ? 'text-success' : 'text-muted'}`} role="button"
                                    onClick={() => _totalRoomCot?.cot < _totalRoomCot?.totalCot && changeFormData('numberOfCots', Number(_formData?.numberOfCots) + 1, 'add')} />,
                            }} />
                    </div>
                    <div className="col-md-3 mb-3">
                        <div className="text-muted fs14 mb-1">One Day Stay</div>
                        <div className="customFieldBorder px-2">
                            <FormControlLabel label={_formData?.oneDayStay ? "Available" : "Unavailable"}
                                control={<Checkbox className="text-capitalize" checked={_formData?.oneDayStay}
                                    onChange={() => changeFormData('oneDayStay', !_formData?.oneDayStay)} />} />
                        </div>
                    </div>
                    <div className="fw-bold">Fee Details</div>
                    <div className="col-md-3 my-3">
                        <div className="text-muted fs14 mb-1 required">Admission Fee</div>
                        <TextField fullWidth sx={{ ...textFieldStyle }} type="number" onKeyDown={DisableKeyUpDown}
                            value={_formData?.admissionFee} onChange={(e: any) => changeFormData('admissionFee', e.target.value)}
                            InputProps={{ startAdornment: <span className="text-muted me-1">₹</span> }}
                            error={_validate.admissionFee.error} helperText={_validate.admissionFee.message} />
                    </div>
                    <div className="col-md-3 my-3">
                        <div className="text-muted fs14 mb-1 required">Advance Amount</div>
                        <TextField fullWidth sx={{ ...textFieldStyle }} type="number" onKeyDown={DisableKeyUpDown}
                            value={_formData?.advanceAmount} onChange={(e: any) => changeFormData('advanceAmount', e.target.value)}
                            InputProps={{ startAdornment: <span className="text-muted me-1">₹</span> }}
                            error={_validate.advanceAmount.error} helperText={_validate.advanceAmount.message} />
                    </div>
                    <div className="col-md-3 my-3">
                        <div className="text-muted fs14 mb-1 required">Late Fee</div>
                        <TextField fullWidth sx={{ ...textFieldStyle }} type="number" onKeyDown={DisableKeyUpDown}
                            value={_formData?.lateFeeAmount} onChange={(e: any) => changeFormData('lateFeeAmount', e.target.value)}
                            InputProps={{ startAdornment: <span className="text-muted me-1">₹</span> }}
                            error={_validate.lateFeeAmount.error} helperText={_validate.lateFeeAmount.message} />
                    </div>
                </div>
                <hr className="my-0" />
                <div className="mt-3">
                    <TableContainer className="tableBorder rounded">
                        <Table sx={{ ...customTableTemplate }} >
                            <TableHead>
                                <TableRow className="px-2" sx={{ ...customTableHeader }}>
                                    <TableCell className="fw-bold text-nowrap">Status</TableCell>
                                    <TableCell className="fw-bold text-nowrap">Cot Number</TableCell>
                                    <TableCell className="fw-bold text-nowrap">Cot Type</TableCell>
                                    <TableCell className="fw-bold text-nowrap">Monthly Rent</TableCell>
                                    {_formData?.oneDayStay && <TableCell className="fw-bold text-nowrap">Daily Rent</TableCell>}
                                    <TableCell className="fw-bold text-nowrap">Upload Photos</TableCell>
                                    <TableCell className="fw-bold text-nowrap">Status</TableCell>
                                    <TableCell className="fw-bold text-nowrap">Maintenance</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {[..._cotList]?.length > 0 ? (
                                    [..._cotList]?.map((item: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell align="center">
                                                <Checkbox className="text-capitalize" checked={item?.isActive} onChange={() => changeCotData(index, 'isActive', item?.isActive ? false : true)} />
                                            </TableCell>
                                            <TableCell className="text-muted text-nowrap" sx={{ width: "200px" }}>
                                                <TextField fullWidth sx={{ ...textFieldStyle }}
                                                    value={item?.cotNumber} onChange={(e: any) => changeCotData(index, 'cotNumber', e.target.value)} />
                                            </TableCell>
                                            <TableCell className="text-muted text-nowrap" sx={{ width: "200px" }}>
                                                <CustomAutoSelect value={item?.cotTypeId}
                                                    onChange={(value: any) => { changeCotData(index, 'cotTypeId', value || '') }}
                                                    placeholder={"Select cot type"}
                                                    menuItem={_cotTypeList?.map((item: any) => {
                                                        return item?.isActive ? { title: (item?.type || ''), value: item?.id } : null
                                                    })?.filter(Boolean)} />
                                            </TableCell>
                                            <TableCell className="text-muted text-nowrap" sx={{ width: "200px" }}>
                                                <TextField fullWidth sx={{ ...textFieldStyle }} type="number" onKeyDown={DisableKeyUpDown}
                                                    value={item?.rentAmount} onChange={(e: any) => changeCotData(index, 'rentAmount', e.target.value)}
                                                    InputProps={{ startAdornment: <span className="text-muted me-1">₹</span> }} />
                                            </TableCell>
                                            {_formData?.oneDayStay && <TableCell className="text-muted text-nowrap" sx={{ width: "200px" }}>
                                                <TextField fullWidth sx={{ ...textFieldStyle }} type="number" onKeyDown={DisableKeyUpDown}
                                                    value={item?.perDayRent} onChange={(e: any) => changeCotData(index, 'perDayRent', e.target.value)}
                                                    InputProps={{ startAdornment: <span className="text-muted me-1">₹</span> }} />
                                            </TableCell>}
                                            <TableCell className="text-muted text-nowrap">
                                                <div className="d-flex align-items-center gap-2">
                                                    <Button size="small" variant="text" component="label">
                                                        <div className="fs-6 fw-bold statusBgInactive fieldBorder rounded py-1 w-100 text-center">
                                                            <CloudUploadRounded />
                                                        </div>
                                                        <Input style={{ visibility: 'hidden' }} accept={'image/*'} type="file" ref={refDocument} multiple onChange={(e: any) => onUpload(e.target.files, index)} />
                                                    </Button>
                                                    {item?.cotPhotos?.slice(0, 3)?.map((cItem: any, cIndex: number) =>
                                                        <div key={cIndex} className="position-relative">
                                                            {cItem ?
                                                                <img draggable={false} src={ROUTES.API.DOWNLOAD_FILE + `${cItem}`} alt="icons" className='rounded fieldBorderPrimary' height={40} width={40} style={{ objectFit: 'cover' }} />
                                                                : <div className="rounded fieldBorderPrimary fs14 alignCenter" style={{ height: "40px", width: "40px" }}>None</div>}
                                                            <img className="position-absolute rounded-circle" style={{ right: "-6px", top: "-6px" }} src={IMAGES_ICON.CloseOutlineIcon} alt="Close" height="18" role="button" onClick={() => removePhotosItem(index, cIndex)} />
                                                            <VisibilityRounded className="position-absolute rounded-circle text-white" style={{ right: "13px", top: "14px", fontSize: "16px" }} role="button" onClick={() => handlePreviewImage(index)} />
                                                        </div>
                                                    )}
                                                    {item?.cotPhotos?.length > 3 && <div className="rounded fieldBorderPrimary fs12 alignCenter text-center" role="button" style={{ height: "40px", width: "40px", whiteSpace: "normal" }}
                                                        onClick={() => handlePreviewImage(0)}>View More</div>}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted text-nowrap">
                                                <span className={`text-center py-1 px-2 rounded text-white ${item?.cotStatus === 'Vacant' ? 'bg-success' : item?.cotStatus === 'Occupied' ? 'bg-danger' : 'bg-warning'}`}>{item?.cotStatus}</span>
                                            </TableCell>
                                            <TableCell>
                                                <Checkbox disabled={item?.cotStatus === 'Occupied'} className="text-capitalize" checked={item?.cotStatus === 'Maintenance'} onChange={() => changeCotData(index, 'cotStatus', item?.cotStatus !== 'Maintenance' ? 'Maintenance' : 'Vacant')} />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : !_tableLoading && (
                                    <TableRow>
                                        <TableCell className="fs-3 text-muted" align="center" colSpan={7}>No Cots Added</TableCell>
                                    </TableRow>
                                )}
                                <SkeletonProviderTables columns={7} visible={_tableLoading} />
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            </div>}
            actionContent={<div className="d-flex justify-content-center flex-grow-1 py-3">
                <FormControlLabel label="Active"
                    control={<Checkbox className="text-capitalize" checked={_formData?.isActive} onChange={() => changeFormData('isActive', !_formData?.isActive)} />} />
                <Button variant="contained" color="primary" disabled={_loading} className="px-4 py-2" onClick={handleSubmitForm}>Submit</Button>
            </div>} />

        <CustomDialogue displaySize={_cotList[_previewImage]?.cotPhotos?.length > 2 ? "lg" : "md"} title="Photos" dialogueFlag={_previewImage > -1} onCloseClick={() => _setPreviewImage(-1)}
            mainContent={<div className="my-2">
                <Tabs value={false} selectionFollowsFocus={false}
                    variant="scrollable"
                    scrollButtons
                    allowScrollButtonsMobile={false}
                    className='d-flex align-items-center justify-content-center gap-3 w-100'
                    sx={{
                        "& .MuiTabs-scrollButtons": {
                            backgroundColor: "#f4908752",
                            borderRadius: "50%",
                            width: "36px",
                            height: "36px",
                            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                            transition: "background-color 0.3s ease-in-out",
                        },
                    }}
                >
                    {_cotList[_previewImage]?.cotPhotos?.map((cItem: any, cIndex: number) =>
                        <Tab key={cIndex} className="col-md-6" label={
                            <div key={cIndex} className="position-relative" style={{ alignContent: "center" }}>
                                <img draggable={false} src={ROUTES.API.DOWNLOAD_FILE + `${cItem}`} alt="icons" className='rounded w-100' height={300} style={{ objectFit: 'cover' }} />
                                <img className="position-absolute rounded-circle bg-white p-1 darkBorder" style={{ bottom: "-12px", left: "50%" }} src={IMAGES_ICON.CloseIcon} alt="Close" height="28" role="button" onClick={() => removePhotosItem(_previewImage, cIndex)} />
                            </div>
                        } />
                    )}
                </Tabs>
            </div>} />
    </>
}
