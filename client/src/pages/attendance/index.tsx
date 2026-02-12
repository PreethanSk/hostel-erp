import { useEffect, useState } from "react";
import { Button, Checkbox, FormControlLabel, Table, TableBody, TableCell, TableHead, TableRow, TextField, MenuItem, Pagination, PaginationItem } from '@mui/material';
import { CustomAlert, customRadio, customTableHeader, CustomTableHover, customTableTemplate, getExportEXCEL, textFieldStyle } from '../../services/HelperService';
import { IMAGES_ICON } from '../../assets/images/exportImages';
import { SkeletonProviderTables } from '../../providers/SkeletonProvider';
import { getCandidateAdmissionById, getCandidateAttendanceGridList, insertUpdateCandidateBlackList } from '../../models';
import CustomSelect from '../../components/helpers/CustomSelect';
import CustomDialogue from "../../components/helpers/CustomDialogue";
import { useStateValue } from "../../providers/StateProvider";
import CustomSearch from "../../components/helpers/CustomSearch";


export default function Index() {
    const [{ user }]: any = useStateValue()
    const [_tableItems, _setTableItems] = useState<any>([]);
    const [_tableTotalCount, _setTableTotalCount] = useState(0);
    const [_pageList, _setPageList] = useState<any>([]);
    const [_tableLoading, _setTableLoading] = useState(true);
    const [_loading, _setLoading] = useState(false);
    const [_search, _setSearch] = useState('');

    const [_searchCandidate, _setSearchCandidate] = useState('');
    const [_view, _setView] = useState(false);
    const [_editForm, _setEditForm] = useState(false);
    const [_candidateList, _setCandidateList] = useState<any>([]);
    const [_formData, _setFormData] = useState<any>({ id: 0, blackListed: "", blackListedReason: "", informToParents: false, informToLocalGuardian: false, isActive: true })
    const [_page, _setPage] = useState(1);
    const [_rowPopup, _setRowPopup] = useState(false);
    const [_rowsPerPage, _setRowsPerPage] = useState(10);

    const handleChangePage = (_event: React.ChangeEvent<unknown>, value: number) => {
        _setPage(value);
    }


    const validate = { type: { error: false, message: "" } }
    const [_validate, _setValidate] = useState(validate);

    const changeFormData = (key: string, value: any) => {
        _setFormData({ ..._formData, [key]: value });
    }

    // const handleSearchCandidate = () => {
    //     if (!_searchCandidate?.trim()) {
    //         return
    //     }
    //     _setLoading(true)
    //     getCandidateDetailSearch(_searchCandidate)
    //         .then((resp) => {
    //             if (resp?.data?.status === "success") {
    //                 if (!resp?.data?.result?.length) {
    //                     CustomAlert("error", "Candidate not found")
    //                 } else {
    //                     _setCandidateList([...resp?.data?.result])
    //                 }
    //             }
    //         })
    //         .catch((err) => console.log(err))
    //         .finally(() => _setLoading(false))
    // }

    const handleAddNew = () => {
        handleClearForm()
        _setEditForm(true);
    }

    const handleGoBack = () => {
        _setEditForm(false);
        handleClearForm();
    }

    const handleClearForm = () => {
        getGridList()
        _setView(false)
        _setSearchCandidate('')
        _setLoading(false);
        _setEditForm(false);
        _setFormData({ id: 0, blackListed: "", blackListedReason: "", informToParents: false, informToLocalGuardian: false, isActive: true });
    }


    const getPrintTableHeadBody = () => {
        const header = [
            "S. No",
            "Location",
            "Candidate Id",
            "Candidate Name",
            "Mobile No",
            "Out Date",
            "Out Time",
            "In Date",
            "In Time"
        ];
        const body = _tableItems?.map((item: any, index: number) => [
            index + 1,
            item?.location || '-',
            item?.candidateId || '-',
            item?.candidateName || '-',
            item?.mobileNumber || '-',
            item?.date || '-',
            item?.outTime || '-',
            item?.date || '-',
            item?.inTime || '-',
        ]);
        return { header, body }
    }

    const exportEXCEL = () => {
        const { header, body } = getPrintTableHeadBody();
        getExportEXCEL({ header, body, fileName: "Attendance" })
    }


    const handleViewCandidate = (item: any) => {
        _setEditForm(true)
        _setView(true)
        handleSelectCandidate(item)
    }

    const handleSubmitForm = () => {
        _setLoading(true)
        const body = {
            id: _formData?.id || 0,
            blackListed: "yes",
            blackListedBy: (user?.firstName + " " + user?.lastName),
            blackListedReason: _formData?.blackListedReason || "",
            informToParents: _formData?.informToParents || false,
            informToLocalGuardian: _formData?.informToLocalGuardian || false
        }

        insertUpdateCandidateBlackList(body)
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    CustomAlert("success", "Candidate added as blacklisted")
                    handleClearForm();
                }
            })
            .catch((err) => console.log(err))
            .finally(() => _setLoading(false))

    }

    const handleSelectCandidate = (item: any) => {
        _setCandidateList([]);
        getCandidateAdmissionById(item?.id)
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    const data = resp?.data?.result?.length ? resp?.data?.result[0] : { ...resp?.data?.result }
                    _setFormData({
                        ..._formData, ...item,
                        dateOfAdmission: data?.dateOfAdmission,
                        cotNumber: data?.cotNumber,
                        roomNumber: data?.roomNumber,
                        branchName: data?.branchName,
                    })
                }
            })
            .catch((err) => console.log(err))
    }

    const getGridList = () => {
        _setTableLoading(true);
        getCandidateAttendanceGridList(_page, _rowsPerPage)
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    _setTableItems(resp?.data?.result?.results);
                    _setTableTotalCount(resp?.data?.result?.totalItems)
                }
            })
            .catch(console.log)
            .finally(() => _setTableLoading(false));
    }

    useEffect(() => {
        getGridList();
    }, [_page, _rowsPerPage])

    return (<>
        {!_editForm && <div className="container">
            <div className="row justify-content-between align-items-center py-3">
                <div className="col-md-4 my-2">
                    <span className="text-dark fw-bold">Attendance</span>
                </div>
                <div className="col-md-6 my-2 d-flex justify-content-end align-items-center gap-4">
                    <Button className="text-capitalize" sx={{ color: "black" }} startIcon={<img height={18} src={IMAGES_ICON.TableNewItemIcon} />} onClick={handleAddNew}>Add New</Button>
                    <CustomSearch getSearchText={(value: string) => _setSearch(value)} />
                    <img height={24} src={IMAGES_ICON.TableDownloadIcon} role="button" draggable="false" onClick={exportEXCEL} />
                </div>
            </div>
            <Table sx={{ ...customTableTemplate }} >
                <TableHead>
                    <TableRow className="px-2" sx={{ ...customTableHeader }}>
                        <TableCell className="fw-bold text-nowrap">S.No</TableCell>
                        <TableCell className="fw-bold text-nowrap">View</TableCell>
                        <TableCell className="fw-bold text-nowrap">Location</TableCell>
                        <TableCell className="fw-bold text-nowrap">Candidate Id</TableCell>
                        <TableCell className="fw-bold text-nowrap">Candidate Name</TableCell>
                        <TableCell className="fw-bold text-nowrap">Mobile No</TableCell>
                        <TableCell className="fw-bold text-nowrap">Out Date</TableCell>
                        <TableCell className="fw-bold text-nowrap">Out Time</TableCell>
                        <TableCell className="fw-bold text-nowrap">In Date</TableCell>
                        <TableCell className="fw-bold text-nowrap">In Time</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {_tableItems?.length > 0 ? (
                        _tableItems?.map((item: any, index: number) => (
                            <TableRow key={index} sx={{ ...CustomTableHover }}>
                                <TableCell>{(index + 1) + ((_page - 1) * _rowsPerPage)}</TableCell>
                                <TableCell className="text-muted text-nowrap">
                                    <img className="filterPrimary" src={IMAGES_ICON.EyeIcon} alt="View" role="button" onClick={() => handleViewCandidate(item)} />
                                </TableCell>
                                <TableCell className="text-muted text-nowrap">{item.location || '-'}</TableCell>
                                <TableCell className="text-muted text-nowrap">{item.candidateId || '-'}</TableCell>
                                <TableCell className="text-muted text-nowrap">{item.candidateName || '-'}</TableCell>
                                <TableCell className="text-muted text-nowrap">{item.mobileNumber}</TableCell>
                                <TableCell className="text-muted text-nowrap">{item.date}</TableCell>
                                <TableCell className="text-muted text-nowrap">{item.outTime}</TableCell>
                                <TableCell className="text-muted text-nowrap">{item.date}</TableCell> {/* Assuming same as Out Date */}
                                <TableCell className="text-muted text-nowrap">{item.inTime}</TableCell>
                            </TableRow>
                        ))
                    ) : !_tableLoading && (
                        <TableRow>
                            <TableCell className="fs-3 text-muted" align="center" colSpan={10}>Data Not Found</TableCell>
                        </TableRow>
                    )}
                    <SkeletonProviderTables columns={10} visible={_tableLoading} />
                </TableBody>
            </Table>
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
                    <div className="bg-white my-3 px-2">
                        {_formData?.id ? <>
                            {!_view && <hr />}
                            <div className="row align-items-center">
                                <div className="col-md-3 my-3">
                                    <div className="text-muted fs14 mb-1">Candidate Id</div>
                                    <TextField fullWidth sx={{ ...textFieldStyle }} value={_formData?.candidateId}
                                        InputProps={{ readOnly: true }} />
                                </div>
                                <div className=""></div>
                                <div className="col-md-3 my-3">
                                    <div className="text-muted fs14 mb-1">Name</div>
                                    <TextField fullWidth sx={{ ...textFieldStyle }} value={_formData?.name}
                                        InputProps={{ readOnly: true }} />
                                </div>
                                <div className="col-md-3 my-3">
                                    <div className="text-muted fs14 mb-1">Mobile Number</div>
                                    <TextField fullWidth sx={{ ...textFieldStyle }} value={_formData?.mobileNumber}
                                        InputProps={{ readOnly: true }} />
                                </div>
                                <div className="col-md-3 my-3">
                                    <div className="text-muted fs14 mb-1">Email</div>
                                    <TextField fullWidth sx={{ ...textFieldStyle }} value={_formData?.email}
                                        InputProps={{ readOnly: true }} />
                                </div>
                                <div className=""></div>
                                <div className="col-md-3 my-3">
                                    <div className="text-muted fs14 mb-1">Branch</div>
                                    <TextField fullWidth sx={{ ...textFieldStyle }} value={_formData?.branchName}
                                        InputProps={{ readOnly: true }} />
                                </div>
                                <div className="col-md-3 my-3">
                                    <div className="text-muted fs14 mb-1">Room Number</div>
                                    <TextField fullWidth sx={{ ...textFieldStyle }} value={_formData?.roomNumber}
                                        InputProps={{ readOnly: true }} />
                                </div>
                                <div className="col-md-3 my-3">
                                    <div className="text-muted fs14 mb-1">Cot Number</div>
                                    <TextField fullWidth sx={{ ...textFieldStyle }} value={_formData?.cotNumber}
                                        InputProps={{ readOnly: true }} />
                                </div>
                                <div className=""></div>
                                <div className="col-md-3 my-3">
                                    <div className="text-muted fs14 mb-1">Date of Admission</div>
                                    <TextField fullWidth sx={{ ...textFieldStyle }} value={_formData?.dateOfAdmission}
                                        InputProps={{ readOnly: true }} />
                                </div>
                                <div className="col-md-3 my-3">
                                    <div className="text-muted fs14 mb-1">Date of Vacate</div>
                                    <TextField fullWidth sx={{ ...textFieldStyle }} value={_formData?.dateOfVacate}
                                        InputProps={{ readOnly: true }} />
                                </div>
                                <div className="col-md-3 my-3">
                                    <FormControlLabel value={!_formData?.informToParents} control={<Checkbox size="small" sx={{ ...customRadio }} />} label="Informed to Parents"
                                        onClick={() => changeFormData("informToParents", !_formData?.informToParents)} />
                                </div>
                                <div className="col-md-3 my-3">
                                    <FormControlLabel value={!_formData?.informToLocalGuardian} control={<Checkbox size="small" sx={{ ...customRadio }} />} label="Informed to Local Guardian"
                                        onClick={() => changeFormData("informToLocalGuardian", !_formData?.informToLocalGuardian)} />
                                </div>
                                <div className="col-md-6 my-3">
                                    <div className="text-muted fs14 mb-1">Reason</div>
                                    <TextField fullWidth sx={{ ...textFieldStyle }} value={_formData?.blackListedReason}
                                        onChange={(e) => changeFormData("blackListedReason", e.target.value)} />
                                </div>
                            </div>
                        </> : <></>}
                    </div>

                    {!_view ? <div className="row">

                        <div className="text-muted"> Branch</div>
                        <hr />

                        <div className="col-md-8 mb-2">
                            <TextField sx={{ ...textFieldStyle }} className="" fullWidth placeholder="Add Notes" />
                        </div>
                        <div className="col-md-4 mb-2">
                            <div className="d-flex align-items-center justify-content-end mobJustify gap-2">
                                {/* <FormControlLabel label="Active"
                                    control={<Checkbox className="text-capitalize" checked={_formData?.isActive}
                                        onChange={() => changeFormData('isActive', !_formData?.isActive)} />} /> */}
                                <Button variant="contained" color="primary" disabled={_loading || !_formData?.id} className="" onClick={handleSubmitForm}>Save</Button>
                                <Button className="text-capitalize" sx={{ color: "black" }} onClick={handleClearForm}>Clear</Button>
                            </div>
                        </div>
                    </div> : <></>}
                </div>
            </div>
        </>}
        <CustomDialogue displaySize={"md"} title={'Select Candidate'} dialogueFlag={_candidateList?.length > 0} onCloseClick={() => _setCandidateList([])}
            mainContent={<div className="my-2">
                <Table size="small" sx={{ ...customTableTemplate }} >
                    <TableHead>
                        <TableRow className="px-2" sx={{ ...customTableHeader }}>
                            <TableCell className="fw-bold text-nowrap"></TableCell>
                            <TableCell className="fw-bold text-nowrap">Candidate Id</TableCell>
                            <TableCell className="fw-bold text-nowrap">Name</TableCell>
                            <TableCell className="fw-bold text-nowrap">Email</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {_candidateList?.map((item: any, index: number) =>
                            <TableRow key={index}>
                                <TableCell>
                                    {item?.CandidateDetails?.blackListed === "yes" ?
                                        <Button className="" size="small" variant="contained" color="error">Blocked</Button> :
                                        <Button className="" size="small" variant="outlined" color="secondary" onClick={() => handleSelectCandidate(item)}>Select</Button>}
                                </TableCell>
                                <TableCell className="text-muted text-nowrap">{item?.candidateId}</TableCell>
                                <TableCell className="text-muted text-nowrap">{item?.name}</TableCell>
                                <TableCell className="text-muted text-nowrap">{item?.email}</TableCell>
                            </TableRow>)}
                    </TableBody>
                </Table>
            </div>} />
    </>)
}