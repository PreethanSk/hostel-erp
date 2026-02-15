import { Button, TextField, styled, Checkbox, FormControlLabel, Box, Typography, Divider, IconButton, Tabs, Tab } from "@mui/material";
import Grid2 from '@mui/material/Grid2';
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { CustomAutoSelect } from "../../../components/helpers/CustomSelect";
import { CustomAlert, DisableKeyUpDown } from "../../../services/HelperService";
import { commonUploadFile, getBranchRoomsList, getMasterBathroomType, getMasterCotType, getMasterRoomType, getMasterSharingType, insertUpdateBranchAnyDetails, insertUpdateBranchCots, insertUpdateBranchRooms } from "../../../models";
import { useStateValue } from "../../../providers/StateProvider";
import { ROUTES } from "../../../configs/constants";
import { PlusSquare, MinusCircle, PlusCircle, Upload, X, Eye } from 'lucide-react';
import DataTable, { Column } from "../../../components/shared/DataTable";
import StatusBadge from "../../../components/shared/StatusBadge";
import FormField from "../../../components/shared/FormField";
import DialogModal from "../../../components/shared/DialogModal";
import { gray } from "../../../theme/tokens";
import Swal from "sweetalert2";

const Input = styled('input')({ display: 'none' });

export default function BranchRoomsAndCots({ handleBack, handleNext }: any) {
    const [{ branchDetails }]: any = useStateValue();
    const refDocument = useRef() as MutableRefObject<HTMLInputElement>;
    const [_formData, _setFormData] = useState<any>({
        id: 0, sharingTypeId: '', roomTypeId: '', bathroomTypeId: '', roomSize: '', roomNumber: '',
        floorNumber: '', numberOfCots: 0, oneDayStay: true, admissionFee: '', isActive: true, cotStatus: 'Vacant',
    });
    const [_tableList, _setTableList] = useState<any>([]);
    const [_roomList, _setRoomList] = useState<any>([]);
    const [_cotList, _setCotList] = useState<any>([]);
    const [_addPopup, _setAddPopup] = useState(false);
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
        sharingTypeId: { error: false, message: "" }, roomTypeId: { error: false, message: "" },
        bathroomTypeId: { error: false, message: "" }, admissionFee: { error: false, message: "" },
        advanceAmount: { error: false, message: "" }, lateFeeAmount: { error: false, message: "" },
        roomSize: { error: false, message: "" }, roomNumber: { error: false, message: "" },
        floorNumber: { error: false, message: "" }, numberOfCots: { error: false, message: "" },
    };
    const [_validate, _setValidate] = useState(validate);

    const changeCotData = (index: number, key: string, value: any) => {
        const _tempArr = [..._cotList]; _tempArr[index][key] = value; _setCotList([..._tempArr]);
    };

    const changeFormData = (key: string, value: any, extraValue?: any) => {
        if (key === "numberOfCots") {
            if (extraValue === 'add') {
                const _tempArr = [..._cotList, {
                    id: 0, roomId: 0, cotTypeId: null, cotNumber: "A" + (_cotList?.length + 1),
                    rentAmount: "", perDayRent: "", cotPhotos: [], isActive: true, cotStatus: 'Vacant',
                }];
                _setTotalRoomCot({ ..._totalRoomCot, cot: _totalRoomCot?.cot + 1 });
                _setCotList([..._tempArr]);
                _setFormData({ ..._formData, [key]: value });
            } else if (extraValue === 'remove') {
                const _tempArr = [..._cotList];
                if (_tempArr.at(-1)?.id) { /* skip */ } else {
                    _tempArr.pop();
                    _setTotalRoomCot({ ..._totalRoomCot, cot: _totalRoomCot?.cot - 1 });
                    _setFormData({ ..._formData, [key]: value });
                }
                _setCotList([..._tempArr]);
            }
        } else {
            _setFormData({ ..._formData, [key]: value });
        }
    };

    const handleAddNew = () => {
        if ((_totalRoomCot?.totalRoom - _totalRoomCot?.room) === 0) CustomAlert("warning", "Room limit exceed !!!");
        else _setAddPopup(true);
    };

    const handlePopupClose = () => {
        _setAddPopup(false);
        _setCotList([]);
        _setFormData({ id: 0, sharingTypeId: '', roomTypeId: '', bathroomTypeId: '', roomSize: '', roomNumber: '', floorNumber: '', numberOfCots: 0, isActive: true, cotStatus: 'Vacant' });
        let cot = 0;
        _roomList?.forEach((fItem: any) => { cot += fItem?.Cots?.length; });
        const TOTAL_ROOM = branchDetails?.branchDetails?.numberOfRooms;
        const TOTAL_COT = branchDetails?.branchDetails?.numberOfCots;
        _setTotalRoomCot({ room: _roomList?.length, cot, totalRoom: TOTAL_ROOM, totalCot: TOTAL_COT });
    };

    const handleUpdateItem = (item: any) => {
        _setAddPopup(true);
        _setFormData({ ...item });
        _setCotList([...item?.Cots?.map((mItem: any) => ({
            ...mItem, cotPhotos: mItem?.cotPhotos ? mItem?.cotPhotos?.split(',').filter(Boolean) : []
        }))]);
    };

    const checkValidation = () => {
        let valid = true;
        const validation = { ...validate };
        if (!_formData?.sharingTypeId) { validation.sharingTypeId = { error: true, message: "Required Field" }; valid = false; }
        if (!_formData?.roomTypeId) { validation.roomTypeId = { error: true, message: "Required Field" }; valid = false; }
        if (!_formData?.bathroomTypeId) { validation.bathroomTypeId = { error: true, message: "Required Field" }; valid = false; }
        if (!_formData?.admissionFee?.trim()) { validation.admissionFee = { error: true, message: "Required Field" }; valid = false; }
        if (!_formData?.advanceAmount?.trim()) { validation.advanceAmount = { error: true, message: "Required Field" }; valid = false; }
        if (!_formData?.lateFeeAmount?.trim()) { validation.lateFeeAmount = { error: true, message: "Required Field" }; valid = false; }
        if (!_formData?.roomSize) { validation.roomSize = { error: true, message: "Required Field" }; valid = false; }
        if (!_formData?.roomNumber) { validation.roomNumber = { error: true, message: "Required Field" }; valid = false; }
        if (!_formData?.floorNumber) { validation.floorNumber = { error: true, message: "Required Field" }; valid = false; }
        _setValidate(validation);
        return valid;
    };

    const handleSubmitForm = () => {
        _setLoading(true);
        if (!checkValidation()) { _setLoading(false); return; }
        const body = {
            id: _formData?.id || 0, branchId: branchDetails?.branchDetails?.id,
            roomTypeId: _formData?.roomTypeId, bathroomTypeId: _formData?.bathroomTypeId,
            sharingTypeId: _formData?.sharingTypeId, roomNumber: _formData?.roomNumber || "",
            roomSize: _formData?.roomSize || "", floorNumber: _formData?.floorNumber || "",
            numberOfCots: _formData?.numberOfCots || 0, admissionFee: _formData?.admissionFee || '0',
            advanceAmount: _formData?.advanceAmount || '0', lateFeeAmount: _formData?.lateFeeAmount || '0',
            oneDayStay: _formData?.oneDayStay || false, isActive: _formData?.isActive || false,
            cotStatus: _formData?.cotStatus || 'Vacant',
        };
        insertUpdateBranchRooms(body)
            .then((resp) => { if (resp?.data?.status === "success") handleUpdateCotsId(resp?.data?.result?.roomId); })
            .catch(console.log);
    };

    const handleUpdateCotsId = (roomId: any) => {
        const _tempArr = [..._cotList?.map((mItem: any) => {
            mItem.roomId = roomId;
            mItem.cotPhotos = mItem?.cotPhotos?.length ? mItem?.cotPhotos?.join(',') : "";
            return mItem;
        })];
        if (_tempArr?.length > 0) {
            insertUpdateBranchCots({ cots: [..._tempArr] })
                .then((resp) => {
                    if (resp?.data?.status === "success") {
                        CustomAlert("success", "Rooms & Beds saved");
                        getRoomListData('CotUpdate', [..._tempArr]);
                        handlePopupClose();
                    }
                })
                .catch(console.log)
                .finally(() => _setLoading(false));
        } else {
            _setLoading(false);
            CustomAlert("success", "Rooms & Beds saved");
            handlePopupClose();
        }
    };

    const onUpload = async (files: any, index: number) => {
        _setLoading(true);
        const _tempArr = [..._cotList];
        let imageList: any = [];
        for (let i = 0; i < files?.length; i++) {
            if (i === 50) break;
            const formData = new FormData();
            formData.append('file', files[i]);
            await commonUploadFile(formData)
                .then((response) => { if (response.status === 200) imageList.push(response?.data?.file); })
                .catch(error => console.log(error.response));
        }
        _tempArr[index].cotPhotos.push(...imageList);
        await _setCotList([..._tempArr]);
        await _setLoading(false);
    };

    const getRoomListData = (type = "", _tempArr: any = []) => {
        _setTableLoading(true);
        getBranchRoomsList(branchDetails?.branchDetails?.id, 'admin')
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    const total_data = resp?.data?.result.flatMap((room: any) =>
                        room?.Cots?.length > 0
                            ? room?.Cots.map((cot: any) => {
                                const fItem = _tempArr?.find((fItem: any) => fItem?.id === cot?.id);
                                if (fItem) cot.cotStatus = fItem?.cotStatus;
                                return { ...room, cot };
                            })
                            : [{ ...room, cot: {} }]
                    );
                    _setTableList(resp?.data?.result);
                    _setRoomList(resp?.data?.result);
                    let cot = 0;
                    resp?.data?.result?.forEach((fItem: any) => { cot += fItem?.Cots?.length; });
                    const TOTAL_ROOM = branchDetails?.branchDetails?.numberOfRooms;
                    const TOTAL_COT = branchDetails?.branchDetails?.numberOfCots;
                    _setTotalRoomCot({ room: resp?.data?.result?.length, cot, totalRoom: TOTAL_ROOM, totalCot: TOTAL_COT });
                    if (type === "CotUpdate") handleUpdateBranchTotalCots(total_data);
                }
            })
            .catch(console.log)
            .finally(() => _setTableLoading(false));
    };

    const handleUpdateBranchTotalCots = (item: any) => {
        if (item?.length === 0) return;
        const body = {
            id: branchDetails?.branchDetails?.id,
            cotVacant: item?.map((mItem: any) => { if (mItem?.cot?.cotStatus === 'Vacant') return mItem?.cot?.id; })?.filter(Boolean)?.join(','),
            cotMaintenance: item?.map((mItem: any) => { if (mItem?.cot?.cotStatus === 'Maintenance') return mItem?.cot?.id; })?.filter(Boolean)?.join(','),
            totalCots: item?.map((mItem: any) => mItem?.cot?.id)?.join(',')
        };
        insertUpdateBranchAnyDetails(body)
            .then((resp) => { if (resp?.data?.status === "success") getRoomListData(); })
            .catch(console.log);
    };

    const removePhotosItem = (index: number, cIndex: number) => {
        Swal.fire({
            title: "Are you sure?", text: "You want to delete this image!", icon: "warning",
            showCancelButton: true, confirmButtonColor: "#388024", cancelButtonColor: "#bf1029", confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {
                let _temp = [..._cotList];
                let photosList = _temp[index]?.cotPhotos;
                photosList.splice(cIndex, 1);
                _temp[index].cotPhotos = [...photosList];
                _setCotList([..._temp]);
            }
        });
    };

    const getAllOtherList = () => {
        getMasterRoomType().then((resp) => { if (resp?.data?.status === "success") _setRoomTypeList(resp?.data?.result); }).catch(console.log);
        getMasterSharingType().then((resp) => { if (resp?.data?.status === "success") _setSharingTypeList(resp?.data?.result); }).catch(console.log);
        getMasterCotType().then((resp) => { if (resp?.data?.status === "success") _setCotTypeList(resp?.data?.result); }).catch(console.log);
        getMasterBathroomType().then((resp) => { if (resp?.data?.status === "success") _setBathroomTypeList(resp?.data?.result); }).catch(console.log);
    };

    useEffect(() => { getAllOtherList(); getRoomListData(); }, []);

    const roomColumns: Column<any>[] = [
        { id: 'sno', label: 'S.No', width: 60, render: (_r: any, i: number) => (i + 1) + ((_page - 1) * _rowsPerPage) },
        { id: 'roomType', label: 'Room Type', render: (row: any) => row?.roomTypeName },
        { id: 'roomNumber', label: 'Room Number', render: (row: any) => row?.roomNumber },
        { id: 'admissionFee', label: 'Admission Fee', render: (row: any) => row?.admissionFee },
        { id: 'advanceAmount', label: 'Advance Amount', render: (row: any) => row?.advanceAmount },
        { id: 'lateFee', label: 'Late Fee', render: (row: any) => row?.lateFeeAmount },
        { id: 'status', label: 'Status', align: 'center' as const, render: (row: any) => <StatusBadge status={row?.isActive ? "Active" : "Inactive"} /> },
        {
            id: 'action', label: 'Action', align: 'center' as const,
            render: (row: any) => <Button size="small" onClick={() => handleUpdateItem(row)} sx={{ textTransform: 'none', fontSize: '13px', color: gray[600] }}>Edit</Button>
        },
    ];

    const cotColumns: Column<any>[] = [
        { id: 'active', label: 'Status', width: 60, align: 'center' as const, render: (_r: any, i: number) => <Checkbox checked={_cotList[i]?.isActive} onChange={() => changeCotData(i, 'isActive', !_cotList[i]?.isActive)} /> },
        { id: 'cotNumber', label: 'Bed Number', render: (_r: any, i: number) => <TextField fullWidth size="small" value={_cotList[i]?.cotNumber} onChange={(e: any) => changeCotData(i, 'cotNumber', e.target.value)} /> },
        {
            id: 'cotType', label: 'Bed Type', render: (_r: any, i: number) => (
                <CustomAutoSelect value={_cotList[i]?.cotTypeId} onChange={(value: any) => changeCotData(i, 'cotTypeId', value || '')}
                    placeholder="Select bed type" menuItem={_cotTypeList?.map((item: any) => item?.isActive ? { title: (item?.type || ''), value: item?.id } : null)?.filter(Boolean)} />
            )
        },
        { id: 'rent', label: 'Monthly Rent', render: (_r: any, i: number) => <TextField fullWidth size="small" type="number" onKeyDown={DisableKeyUpDown} value={_cotList[i]?.rentAmount} onChange={(e: any) => changeCotData(i, 'rentAmount', e.target.value)} slotProps={{ input: { startAdornment: <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>₹</Typography> } }} /> },
        ...(_formData?.oneDayStay ? [{
            id: 'dailyRent', label: 'Daily Rent', render: (_r: any, i: number) => <TextField fullWidth size="small" type="number" onKeyDown={DisableKeyUpDown} value={_cotList[i]?.perDayRent} onChange={(e: any) => changeCotData(i, 'perDayRent', e.target.value)} slotProps={{ input: { startAdornment: <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>₹</Typography> } }} />
        }] : []),
        {
            id: 'photos', label: 'Upload Photos', render: (_r: any, i: number) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button size="small" variant="outlined" component="label" sx={{ minWidth: 'auto', p: 0.5 }}>
                        <Upload size={16} />
                        <Input style={{ visibility: 'hidden', position: 'absolute' }} accept={'image/*'} type="file" ref={refDocument} multiple onChange={(e: any) => onUpload(e.target.files, i)} />
                    </Button>
                    {_cotList[i]?.cotPhotos?.slice(0, 3)?.map((cItem: any, cIndex: number) => (
                        <Box key={cIndex} sx={{ position: 'relative' }}>
                            <Box component="img" draggable={false} src={ROUTES.API.DOWNLOAD_FILE + `${cItem}`} alt="photo"
                                sx={{ height: 40, width: 40, objectFit: 'cover', borderRadius: 0.5, border: `1px solid ${gray[200]}` }} />
                            <IconButton size="small" onClick={() => removePhotosItem(i, cIndex)}
                                sx={{ position: 'absolute', right: -6, top: -6, backgroundColor: '#fff', border: `1px solid ${gray[300]}`, width: 18, height: 18 }}>
                                <X size={10} />
                            </IconButton>
                        </Box>
                    ))}
                    {_cotList[i]?.cotPhotos?.length > 3 && (
                        <Button size="small" variant="text" onClick={() => _setPreviewImage(i)} sx={{ fontSize: '11px', minWidth: 'auto' }}>+More</Button>
                    )}
                </Box>
            )
        },
        { id: 'cotStatus', label: 'Status', render: (_r: any, i: number) => <StatusBadge status={_cotList[i]?.cotStatus || 'Vacant'} /> },
        {
            id: 'maintenance', label: 'Maintenance', render: (_r: any, i: number) => (
                <Checkbox disabled={_cotList[i]?.cotStatus === 'Occupied'} checked={_cotList[i]?.cotStatus === 'Maintenance'}
                    onChange={() => changeCotData(i, 'cotStatus', _cotList[i]?.cotStatus !== 'Maintenance' ? 'Maintenance' : 'Vacant')} />
            )
        },
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontWeight: 600 }}>Rooms & Beds</Typography>
                <Button startIcon={<PlusSquare size={16} />} onClick={handleAddNew} sx={{ textTransform: 'none', color: gray[700] }}>Add New</Button>
            </Box>

            <DataTable
                columns={roomColumns}
                data={_tableList?.slice((_page - 1) * _rowsPerPage, (_page - 1) * _rowsPerPage + _rowsPerPage) || []}
                loading={_tableLoading}
                totalCount={_tableList?.length || 0}
                page={_page}
                rowsPerPage={_rowsPerPage}
                onPageChange={(p) => _setPage(p)}
                onRowsPerPageChange={(s) => _setRowsPerPage(s)}
                emptyTitle="No Rooms Added"
            />

            <Divider sx={{ my: 2 }} />

            <Grid2 container spacing={3} sx={{ alignItems: 'center' }}>
                <Grid2 size={{ xs: 12, md: 8 }} />
                <Grid2 size={{ xs: 12, md: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
                        <FormControlLabel label="Active"
                            control={<Checkbox checked={branchDetails?.branchDetails?.isActive} />} />
                        <Button variant="outlined" disabled={_loading} onClick={handleBack}
                            sx={{ textTransform: 'none', px: 4, color: 'black', borderColor: gray[300] }}>Back</Button>
                        <Button variant="contained" color="primary" disabled={_loading} onClick={handleNext}
                            sx={{ textTransform: 'none', px: 4 }}>Next</Button>
                    </Box>
                </Grid2>
            </Grid2>

            {/* Add/Edit Room & Beds Dialog */}
            <DialogModal open={_addPopup} onClose={handlePopupClose} title="Rooms & Beds" maxWidth="lg">
                <Box sx={{ py: 1 }}>
                    <Grid2 container spacing={3}>
                        <Grid2 size={{ xs: 12, md: 3 }}>
                            <FormField label="Sharing Type" required error={_validate.sharingTypeId.error ? _validate.sharingTypeId.message : undefined}>
                                <CustomAutoSelect value={_formData?.sharingTypeId}
                                    onChange={(value: any) => changeFormData('sharingTypeId', value || '')} placeholder="Select sharing type"
                                    menuItem={_sharingTypeList?.map((item: any) => item?.isActive ? { title: (item?.type || ''), value: item?.id } : null)?.filter(Boolean)} />
                            </FormField>
                        </Grid2>
                        <Grid2 size={{ xs: 12, md: 3 }}>
                            <FormField label="Room Type" required error={_validate.roomTypeId.error ? _validate.roomTypeId.message : undefined}>
                                <CustomAutoSelect value={_formData?.roomTypeId}
                                    onChange={(value: any) => changeFormData('roomTypeId', value || '')} placeholder="Select room type"
                                    menuItem={_roomTypeList?.map((item: any) => item?.isActive ? { title: (item?.type || ''), value: item?.id } : null)?.filter(Boolean)} />
                            </FormField>
                        </Grid2>
                        <Grid2 size={{ xs: 12, md: 3 }}>
                            <FormField label="Bathroom Type" required error={_validate.bathroomTypeId.error ? _validate.bathroomTypeId.message : undefined}>
                                <CustomAutoSelect value={_formData?.bathroomTypeId}
                                    onChange={(value: any) => changeFormData('bathroomTypeId', value || '')} placeholder="Select bathroom type"
                                    menuItem={_bathroomTypeList?.map((item: any) => item?.isActive ? { title: (item?.type || ''), value: item?.id } : null)?.filter(Boolean)} />
                            </FormField>
                        </Grid2>
                        <Grid2 size={{ xs: 12, md: 3 }}>
                            <FormField label="Room Size" error={_validate.roomSize.error ? _validate.roomSize.message : undefined}>
                                <TextField fullWidth size="small" value={_formData?.roomSize} onChange={(e: any) => changeFormData('roomSize', e.target.value)} error={_validate.roomSize.error} />
                            </FormField>
                        </Grid2>
                        <Grid2 size={{ xs: 12, md: 3 }}>
                            <FormField label="Room Number" required error={_validate.roomNumber.error ? _validate.roomNumber.message : undefined}>
                                <TextField fullWidth size="small" value={_formData?.roomNumber} onChange={(e: any) => changeFormData('roomNumber', e.target.value)} error={_validate.roomNumber.error} />
                            </FormField>
                        </Grid2>
                        <Grid2 size={{ xs: 12, md: 3 }}>
                            <FormField label="Floor Number" required error={_validate.floorNumber.error ? _validate.floorNumber.message : undefined}>
                                <TextField fullWidth size="small" value={_formData?.floorNumber} onChange={(e: any) => changeFormData('floorNumber', e.target.value)} error={_validate.floorNumber.error} />
                            </FormField>
                        </Grid2>
                        <Grid2 size={{ xs: 12, md: 3 }}>
                            <FormField label="Number of Beds">
                                <TextField fullWidth size="small" value={_formData?.numberOfCots + '/' + (_totalRoomCot?.totalCot)}
                                    inputProps={{ style: { textAlign: "center" } }}
                                    slotProps={{
                                        input: {
                                            readOnly: true,
                                            startAdornment: (
                                                <IconButton size="small" color={_formData?.numberOfCots > 0 ? "error" : "default"} disabled={_formData?.numberOfCots <= 0}
                                                    onClick={() => _formData?.numberOfCots > 0 && changeFormData('numberOfCots', Number(_formData?.numberOfCots) - 1, 'remove')}>
                                                    <MinusCircle size={20} />
                                                </IconButton>
                                            ),
                                            endAdornment: (
                                                <IconButton size="small" color={_totalRoomCot?.cot < _totalRoomCot?.totalCot ? "success" : "default"} disabled={_totalRoomCot?.cot >= _totalRoomCot?.totalCot}
                                                    onClick={() => _totalRoomCot?.cot < _totalRoomCot?.totalCot && changeFormData('numberOfCots', Number(_formData?.numberOfCots) + 1, 'add')}>
                                                    <PlusCircle size={20} />
                                                </IconButton>
                                            ),
                                        }
                                    }} />
                            </FormField>
                        </Grid2>
                        <Grid2 size={{ xs: 12, md: 3 }}>
                            <FormField label="One Day Stay">
                                <Box sx={{ border: `1px solid ${gray[300]}`, borderRadius: 1, px: 1.5 }}>
                                    <FormControlLabel label={_formData?.oneDayStay ? "Available" : "Unavailable"}
                                        control={<Checkbox checked={_formData?.oneDayStay} onChange={() => changeFormData('oneDayStay', !_formData?.oneDayStay)} />} />
                                </Box>
                            </FormField>
                        </Grid2>
                    </Grid2>

                    <Typography sx={{ fontWeight: 600, mb: 2 }}>Fee Details</Typography>
                    <Grid2 container spacing={3}>
                        <Grid2 size={{ xs: 12, md: 3 }}>
                            <FormField label="Admission Fee" required error={_validate.admissionFee.error ? _validate.admissionFee.message : undefined}>
                                <TextField fullWidth size="small" type="number" onKeyDown={DisableKeyUpDown}
                                    value={_formData?.admissionFee} onChange={(e: any) => changeFormData('admissionFee', e.target.value)}
                                    error={_validate.admissionFee.error}
                                    slotProps={{ input: { startAdornment: <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>₹</Typography> } }} />
                            </FormField>
                        </Grid2>
                        <Grid2 size={{ xs: 12, md: 3 }}>
                            <FormField label="Advance Amount" required error={_validate.advanceAmount.error ? _validate.advanceAmount.message : undefined}>
                                <TextField fullWidth size="small" type="number" onKeyDown={DisableKeyUpDown}
                                    value={_formData?.advanceAmount} onChange={(e: any) => changeFormData('advanceAmount', e.target.value)}
                                    error={_validate.advanceAmount.error}
                                    slotProps={{ input: { startAdornment: <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>₹</Typography> } }} />
                            </FormField>
                        </Grid2>
                        <Grid2 size={{ xs: 12, md: 3 }}>
                            <FormField label="Late Fee" required error={_validate.lateFeeAmount.error ? _validate.lateFeeAmount.message : undefined}>
                                <TextField fullWidth size="small" type="number" onKeyDown={DisableKeyUpDown}
                                    value={_formData?.lateFeeAmount} onChange={(e: any) => changeFormData('lateFeeAmount', e.target.value)}
                                    error={_validate.lateFeeAmount.error}
                                    slotProps={{ input: { startAdornment: <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>₹</Typography> } }} />
                            </FormField>
                        </Grid2>
                    </Grid2>

                    <Divider sx={{ my: 2 }} />

                    {/* Beds Table */}
                    <DataTable columns={cotColumns} data={_cotList || []} loading={_tableLoading} emptyTitle="No Beds Added" />

                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, py: 3 }}>
                        <FormControlLabel label="Active"
                            control={<Checkbox checked={_formData?.isActive} onChange={() => changeFormData('isActive', !_formData?.isActive)} />} />
                        <Button variant="contained" color="primary" disabled={_loading} onClick={handleSubmitForm}
                            sx={{ textTransform: 'none', px: 4 }}>Submit</Button>
                    </Box>
                </Box>
            </DialogModal>

            {/* Photo Preview Dialog */}
            <DialogModal open={_previewImage > -1} onClose={() => _setPreviewImage(-1)}
                title="Photos" maxWidth={_cotList[_previewImage]?.cotPhotos?.length > 2 ? "lg" : "md"}>
                <Box sx={{ py: 1 }}>
                    <Tabs value={false} selectionFollowsFocus={false} variant="scrollable" scrollButtons allowScrollButtonsMobile={false}
                        sx={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, width: '100%',
                            "& .MuiTabs-scrollButtons": { backgroundColor: "rgba(244, 144, 135, 0.32)", borderRadius: "50%", width: 36, height: 36, boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" },
                        }}>
                        {_cotList[_previewImage]?.cotPhotos?.map((cItem: any, cIndex: number) => (
                            <Tab key={cIndex} sx={{ flex: 1 }} label={
                                <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <Box component="img" draggable={false} src={ROUTES.API.DOWNLOAD_FILE + `${cItem}`} alt="photo"
                                        sx={{ width: '100%', height: 300, objectFit: 'cover', borderRadius: 1 }} />
                                    <IconButton size="small" onClick={() => removePhotosItem(_previewImage, cIndex)}
                                        sx={{ position: 'absolute', bottom: -12, left: '50%', transform: 'translateX(-50%)', backgroundColor: '#fff', border: `1px solid ${gray[300]}` }}>
                                        <X size={14} />
                                    </IconButton>
                                </Box>
                            } />
                        ))}
                    </Tabs>
                </Box>
            </DialogModal>
        </Box>
    );
}
