import { useEffect, useState } from "react";
import { Button, Table, TableBody, TableCell, TableHead, TableRow, TextField, MenuItem, Pagination, PaginationItem, TableContainer } from '@mui/material';
import { CustomAlert, customTableHeader, CustomTableHover, customTableTemplate, getExportEXCEL, textFieldStyle } from '../../services/HelperService';
import { IMAGES_ICON } from '../../assets/images/exportImages';
import { SkeletonProviderTables } from '../../providers/SkeletonProvider';
import moment from 'moment';
import { getBlacklistGridList, getBranchCandidateDetailSearch, getCandidateAdmissionById, insertUpdateCandidateBlackList } from '../../models';
import CustomSelect from '../../components/helpers/CustomSelect';
import CustomDialogue from "../../components/helpers/CustomDialogue";
import { useStateValue } from "../../providers/StateProvider";
import CustomSearch from "../../components/helpers/CustomSearch";


export default function Index({ PageAccess }: any) {
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
        const header = ["S. No", "Candidate Name", "Status"];
        const body = _tableItems?.map((item: any, index: number) => [index + 1, item?.name, item?.isActive]);
        return { header, body }
    }

    const exportEXCEL = () => {
        const { header, body } = getPrintTableHeadBody();
        getExportEXCEL({ header, body, fileName: "Blacklist" })
    }


    const handleViewCandidate = (item: any) => {
        _setEditForm(true)
        _setView(true)
        handleSelectCandidate(item?.id)
    }

    const handleSubmitForm = (flag: string) => {
        _setLoading(true)
        const body = {
            id: _formData?.candidateRefId || 0,
            blackListed: flag,
            blackListedBy: flag === "yes" ? (user?.firstName + " " + user?.lastName) : "",
            blackListedReason: flag === "yes" ? (_formData?.blackListedReason || "") : "",
            blackListedDate: flag === "yes" ? moment() : "",
            // informToParents: flag === "yes" ? (_formData?.informToParents || false) : false,
            // informToLocalGuardian: flag === "yes" ? (_formData?.informToLocalGuardian || false) : false
        }

        insertUpdateCandidateBlackList(body)
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    CustomAlert("success", flag === "yes" ? "Candidate added as blacklisted" : "Removed Blacklisted")
                    handleClearForm();
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
                    _setFormData({
                        ..._formData, ...data,
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
        getBlacklistGridList(_page, _rowsPerPage)
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
                    <span className="text-dark fw-bold">Black List</span>
                </div>
                <div className="col-md-6 my-2 d-flex justify-content-end align-items-center gap-4">
                    {PageAccess === 'Write' && <Button className="text-capitalize" sx={{ color: "black" }} startIcon={<img height={18} src={IMAGES_ICON.TableNewItemIcon} />} onClick={handleAddNew}>Add New</Button>}
                    <CustomSearch getSearchText={(value: string) => _setSearch(value)} />
                    <img height={24} src={IMAGES_ICON.TableDownloadIcon} role="button" draggable="false" onClick={exportEXCEL} />
                </div>
            </div>
            <TableContainer className="tableBorder rounded">
                <Table sx={{ ...customTableTemplate }} >
                    <TableHead>
                        <TableRow className="px-2" sx={{ ...customTableHeader }}>
                            <TableCell className="fw-bold text-nowrap">S.No</TableCell>
                            <TableCell className="fw-bold text-nowrap">View</TableCell>
                            <TableCell className="fw-bold text-nowrap">Candidate Id</TableCell>
                            <TableCell className="fw-bold text-nowrap">Name</TableCell>
                            <TableCell className="fw-bold text-nowrap">Mobile No</TableCell>
                            <TableCell className="fw-bold text-nowrap">Email</TableCell>
                            <TableCell className="fw-bold text-nowrap">Reason</TableCell>
                            <TableCell className="fw-bold text-nowrap">Update By</TableCell>
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
                                <TableRow key={index} sx={{ ...CustomTableHover }}>
                                    <TableCell>{(index + 1) + ((_page - 1) * _rowsPerPage)}</TableCell>
                                    <TableCell className="text-muted text-nowrap">
                                        <img className="filterPrimary" src={IMAGES_ICON.EyeIcon} alt="View" role="button" onClick={() => handleViewCandidate(item)} />
                                    </TableCell>
                                    <TableCell className="text-muted text-nowrap">{item?.candidateId}</TableCell>
                                    <TableCell className="text-muted text-nowrap">{item?.name}</TableCell>
                                    <TableCell className="text-muted text-nowrap">{item?.mobileNumber}</TableCell>
                                    <TableCell className="text-muted text-nowrap">{item?.email}</TableCell>
                                    <TableCell className="text-muted text-nowrap">{item?.blackListedReason}</TableCell>
                                    <TableCell className="text-muted text-nowrap">{item?.blackListedBy}</TableCell>
                                    <TableCell className="text-muted text-nowrap">{item?.blackListedDate && moment(item?.blackListedDate)?.format('DD-MM-YYYY & hh:mm A')}</TableCell>
                                </TableRow>
                            ))
                        ) : !_tableLoading && (
                            <TableRow>
                                <TableCell className="fs-3 text-muted" align="center" colSpan={9}>Data Not Found</TableCell>
                            </TableRow>
                        )}
                        <SkeletonProviderTables columns={9} visible={_tableLoading} />
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
                    <div className="bg-white my-3 px-2">
                        {!_view ? <form action="" onSubmit={(e) => { e.preventDefault(); handleSearchCandidate() }}>
                            <div className="row align-items-center">
                                <div className="col-md-5 my-3">
                                    <TextField fullWidth sx={{ ...textFieldStyle }} placeholder="Search Candidate / Branch"
                                        value={_searchCandidate} onChange={(e: any) => _setSearchCandidate(e.target.value)} />
                                </div>
                                <div className="col-md-2 my-3">
                                    <Button variant="contained" className="px-3" color="primary" disabled={_loading} type="submit">Search</Button>
                                </div>
                            </div>
                        </form> : <></>}
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
                                    <TextField fullWidth sx={{ ...textFieldStyle }} value={_formData?.candidateName}
                                        InputProps={{ readOnly: true }} />
                                </div>
                                <div className="col-md-3 my-3">
                                    <div className="text-muted fs14 mb-1">Mobile Number</div>
                                    <TextField fullWidth sx={{ ...textFieldStyle }} value={_formData?.candidateMobileNumber}
                                        InputProps={{ readOnly: true }} />
                                </div>
                                <div className="col-md-3 my-3">
                                    <div className="text-muted fs14 mb-1">Email</div>
                                    <TextField fullWidth sx={{ ...textFieldStyle }} value={_formData?.candidateEmail}
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
                                {/* <div className="col-md-3 my-3">
                                    <FormControlLabel value={!_formData?.informToParents} control={<Checkbox size="small" sx={{ ...customRadio }} />} label="Informed to Parents"
                                        onClick={() => changeFormData("informToParents", !_formData?.informToParents)} />
                                </div>
                                <div className="col-md-3 my-3">
                                    <FormControlLabel value={!_formData?.informToLocalGuardian} control={<Checkbox size="small" sx={{ ...customRadio }} />} label="Informed to Local Guardian"
                                        onClick={() => changeFormData("informToLocalGuardian", !_formData?.informToLocalGuardian)} />
                                </div> */}
                                <div className=""></div>
                                <div className="col-md-6 my-3">
                                    <div className="text-muted fs14 mb-1">Reason</div>
                                    <TextField fullWidth sx={{ ...textFieldStyle }} value={_formData?.blackListedReason}
                                        slotProps={{ input: { readOnly: _view } }}
                                        onChange={(e) => changeFormData("blackListedReason", e.target.value)} />
                                </div>
                            </div>
                        </> : <></>}
                    </div>

                    {!_view ? <div className="">
                        <hr />
                        <div className="mb-2">
                            <div className="d-flex justify-content-center align-items-center mobJustify gap-2">
                                {/* <FormControlLabel label="Active"
                                    control={<Checkbox className="text-capitalize" checked={_formData?.isActive}
                                        onChange={() => changeFormData('isActive', !_formData?.isActive)} />} /> */}
                                <Button variant="contained" color="primary" disabled={_loading || !_formData?.id} className="" onClick={() => handleSubmitForm("yes")}>Save</Button>
                                <Button className="text-capitalize" sx={{ color: "black" }} onClick={handleClearForm}>Clear</Button>
                            </div>
                        </div>
                    </div> : <div className="d-flex justify-content-end py-3">
                        <Button variant="contained" color="success" disabled={_loading || !_formData?.id} className="" onClick={() => handleSubmitForm("no")}>Unblock</Button>
                    </div>}
                </div>
            </div>
        </>}
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
    </>)
}