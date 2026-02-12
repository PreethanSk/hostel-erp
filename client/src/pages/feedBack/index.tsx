import { useEffect, useState } from "react";
import { IMAGES_ICON } from '../../assets/images/exportImages';
import { Box, Button, Checkbox, FormControlLabel, MenuItem, Pagination, PaginationItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material";
import { CustomAlert, customTableHeader, CustomTableHover, customTableTemplate, getExportEXCEL, textFieldStyle } from "../../services/HelperService";
import { getBranchGridList, getCandidateFeedbackGridList, insertUpdateCandidateFeedback } from "../../models";
import moment from "moment";
import { SkeletonProviderTables } from "../../providers/SkeletonProvider";
import CustomSelect, { CustomFilterMultiSelect } from "../../components/helpers/CustomSelect";
import CustomDialogue from "../../components/helpers/CustomDialogue";
import { SentimentSatisfiedAlt } from "@mui/icons-material";
import DateRangeSelector from "../../components/helpers/DateRangeSelector";
import CustomSearch from "../../components/helpers/CustomSearch";

export default function Index({ PageAccess }: any) {
    const [_feedbackDetails, _setFeedbackDetails] = useState({
        id: 0,
        candidateRefId: 0,
        branchRefId: 0,
        admissionRefId: 0,
        rateStay: "",
        rateFoodService: "",
        rateCleanliness: "",
        rateSecuritySafety: "",
        rateSupportStaff: "",
        managerCandidateBehavior: "",
        managerComments: "",
        candidateRemarks: "",
        isActive: true
    });
    const [_candidateBehavior, _setCandidateBehavior] = useState(false);
    const [_managerBehavior, _setManagerBehavior] = useState(false);
    const [_candidateList, _setCandidateList] = useState<any>([]);
    const [_filterData, _setFilterData] = useState({ branchList: [], fromDate: moment().clone().startOf('month').format('YYYY-MM-DD'), toDate: moment().format('YYYY-MM-DD') });
    const [_searchCandidate, _setSearchCandidate] = useState('');
    const [_view, _setView] = useState(false);
    const [_search, _setSearch] = useState('');


    const [_tableLoading, _setTableLoading] = useState(true);
    const [_tableItems, _setTableItems] = useState<any>([]);
    const [_tableTotalCount, _setTableTotalCount] = useState(0);
    const [_page, _setPage] = useState(1);
    const [_rowPopup, _setRowPopup] = useState(false);
    const [_rowsPerPage, _setRowsPerPage] = useState(10);
    const [_loading, _setLoading] = useState(false);
    const [_branchList, _setBranchList] = useState<any>([]);
    const [_editForm, _setEditForm] = useState(false);

    const handleChangePage = (_event: React.ChangeEvent<unknown>, value: number) => {
        _setPage(value);
    }

    const changeFilterData = (key: string, value: any) => {
        _setFilterData({ ..._filterData, [key]: value });
    }

    const changeFeedbackData = (key: string, value: any) => {
        _setFeedbackDetails({ ..._feedbackDetails, [key]: value });
    }


    const handleViewCandidateFeedback = (item: any) => {
        _setCandidateBehavior(true);
        _setFeedbackDetails(item)
        _setView(true)
    }

    const handleEditManagerFeedback = (item: any) => {
        _setManagerBehavior(true);
        _setFeedbackDetails(item)
    }

    // const handleAddNew = () => {
    //     handleClearForm()
    //     _setEditForm(true);
    // }

    const handleClearForm = () => {
        getGridList()
        _setLoading(false);
        _setEditForm(false);
        _setView(false)
        _setCandidateBehavior(false)
        _setManagerBehavior(false)
        _setSearchCandidate('')
        _setFeedbackDetails({
            id: 0,
            candidateRefId: 0,
            branchRefId: 0,
            admissionRefId: 0,
            rateStay: "",
            rateFoodService: "",
            rateCleanliness: "",
            rateSecuritySafety: "",
            rateSupportStaff: "",
            managerCandidateBehavior: "",
            managerComments: "",
            candidateRemarks: "",
            isActive: true
        });
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

    const handleSubmitAboutCandidate = () => {
        _setLoading(true)
        if (!_feedbackDetails?.managerCandidateBehavior) {
            CustomAlert('warning', "Feedback Behavior Required")
            _setLoading(false)
            return false;
        }
        if (!_feedbackDetails?.managerComments) {
            CustomAlert('warning', "Feedback Brief Required")
            _setLoading(false)
            return false;
        }
        const body = {
            id: _feedbackDetails?.id,
            candidateRefId: _feedbackDetails?.candidateRefId,
            branchRefId: _feedbackDetails?.branchRefId,
            admissionRefId: _feedbackDetails?.admissionRefId,
            rateStay: _feedbackDetails?.rateStay || "",
            rateFoodService: _feedbackDetails?.rateFoodService || "",
            rateCleanliness: _feedbackDetails?.rateCleanliness || "",
            rateSecuritySafety: _feedbackDetails?.rateSecuritySafety || "",
            rateSupportStaff: _feedbackDetails?.rateSupportStaff || "",
            managerCandidateBehavior: _feedbackDetails?.managerCandidateBehavior || "",
            managerComments: _feedbackDetails?.managerComments || "",
            candidateRemarks: _feedbackDetails?.candidateRemarks || "",
            isActive: true
        }
        insertUpdateCandidateFeedback(body)
            .then((resp) => {
                if (resp?.data?.status === 'success') {
                    CustomAlert("success", 'Manager Feedback Updated')
                    handleClearForm()
                }
            })
            .catch((err) => console.log(err))
            .finally(() => _setLoading(false))
    }

    // const handleSelectCandidate = (item: any) => {
    //     getCandidateAdmissionById({ candidateId: item?.id })
    //         .then((resp) => {
    //             if (resp?.data?.status === "success") {
    //                 if (!resp?.data?.result?.length) {
    //                     CustomAlert("warning", "Candidate doesn't have any admission")
    //                 } else {
    //                     _setCandidateList([]);
    //                     const data = resp?.data?.result?.length ? resp?.data?.result[0] : {}
    //                     getCandidateFeedbackData(data)
    //                 }
    //             }
    //         })
    //         .catch((err) => console.log(err))
    // }

    // const getCandidateFeedbackData = (item: any) => {
    //     getCandidateFeedbackById({ candidateId: item?.candidateRefId, admissionId: item?.id, branchId: item?.branchRefId })
    //         .then((resp) => {
    //             if (resp?.data?.status === "success") {
    //                 const data = resp?.data?.result
    //                 if (data?.length > 0) {
    //                     _setFeedbackDetails({ ...data[0] })
    //                     CustomAlert('warning', 'Candidate feedback already given')
    //                 } else {
    //                     _setFeedbackDetails({
    //                         id: 0,
    //                         candidateRefId: item?.candidateRefId || 0,
    //                         branchRefId: item?.branchRefId || 0,
    //                         admissionRefId: item?.id || 0,
    //                         rateStay: "",
    //                         rateFoodService: "",
    //                         rateCleanliness: "",
    //                         rateSecuritySafety: "",
    //                         rateSupportStaff: "",
    //                         managerCandidateBehavior: "",
    //                         managerComments: "",
    //                         isActive: true
    //                     })
    //                     _setCandidateBehavior(true)
    //                 }
    //             }
    //         })
    //         .catch((err) => console.log(err))
    // }


    const getGridList = () => {
        _setTableLoading(true);
        getCandidateFeedbackGridList(_page, _rowsPerPage, _filterData?.branchList?.join(','), _filterData?.fromDate, _filterData?.toDate)
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    _setTableItems(resp?.data?.result?.results);
                    _setTableTotalCount(resp?.data?.result?.totalItems)
                }
            })
            .catch(console.log)
            .finally(() => _setTableLoading(false));
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

    const getPrintTableHeadBody = () => {
        const header = ["S. No", "Branch Name", "Candidate Name", "Room No", "Cleanliness", "Food Service", "Security Safety", "Stay", "Support Staff"];
        const body = _tableItems?.map((item: any, index: number) => [index + 1, item?.branchName, item?.candidateName, item?.roomNumber, item?.rateCleanliness, item?.rateFoodService, item?.rateSecuritySafety, item?.rateStay, item?.rateSupportStaff]);
        return { header, body }
    }

    const exportEXCEL = () => {
        const { header, body } = getPrintTableHeadBody();
        getExportEXCEL({ header, body, fileName: "Feedback" })
    }

    const handleUpdateSearch = (fromDate: string, toDate: string) => {
        _setFilterData({ ..._filterData, fromDate: fromDate, toDate: toDate })
    }

    useEffect(() => {
        getGridList();
    }, [_page, _rowsPerPage, _filterData])

    useEffect(() => {
        getOtherList()
    }, [])

    return (
        <>
            {/* {_editForm && <>
                <div className="container py-3">
                    <div className="bg-field-gray  border rounded px-4 py-1">
                        <div className="d-flex align-items-center py-2 borderBottomLight" role="button" onClick={handleClearForm}>
                            <img height={24} draggable={false} src={IMAGES_ICON.BackIcon} />
                            <div className="fw-bold">Back</div>
                        </div>
                        <div className="my-3 px-2">
                            {!_view ? <div className="row align-items-center">
                                <div className="col-md-5 my-3">
                                    <TextField fullWidth sx={{ ...textFieldStyle }} placeholder="Search Candidate by Id / Name / Email / Mobile"
                                        value={_searchCandidate} onChange={(e: any) => _setSearchCandidate(e.target.value)} />
                                </div>
                                <div className="col-md-2 my-3">
                                    <Button variant="contained" className="px-3" color="primary" disabled={_loading} onClick={handleSearchCandidate}>Search</Button>
                                </div>
                            </div> : <></>}
                        </div>
                    </div>
                </div>
            </>} */}
            {!_editForm && <div className="container">
                <div className="row justify-content-between align-items-center py-3">
                    <div className="col-md-4 my-2">
                        <span className="text-dark fw-bold">Feedback </span>
                    </div>
                    <div className="col-md-8">
                        <div className="row align-items-center">
                            {/* <div className="col-md-3 my-2">
                                <Button className="text-capitalize text-nowrap" sx={{ color: "black" }} startIcon={<img height={18} src={IMAGES_ICON.TableNewItemIcon} />} onClick={handleAddNew}>Add New</Button>
                            </div> */}
                            <div className="col-md-3 my-2">
                                <CustomFilterMultiSelect value={_filterData?.branchList?.map((mItem: any) => Number(mItem))}
                                    onChange={(e: any) => { changeFilterData('branchList', e.target.value || '') }}
                                    placeholder={"Branch"} menuItem={_branchList?.map((item: any) => {
                                        return item?.isActive ? { title: (item?.branchName || ''), value: item?.id } : null
                                    }).filter(Boolean)} />
                                {/* <CustomSelect className="" padding={'0px 10px'} value={_filterData?.branchId} onChange={(e: any) => changeFilterData('branchId', e.target.value)}
                                    placeholder={"Branch"} menuItem={[<MenuItem className="px-2 fs14" value={''} key={-1}>All</MenuItem>,
                                    ..._branchList?.map((item: any) => <MenuItem className="px-2 fs14" key={item?.id} value={item?.id}>{item?.branchName}</MenuItem>)]} /> */}
                            </div>
                            <div className="col-md-7 my-2">
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
                    <Table sx={{ ...customTableTemplate }}>
                        <TableHead>
                            <TableRow className="px-2" sx={{ ...customTableHeader }}>
                                <TableCell className="fw-bold text-nowrap">S.No</TableCell>
                                <TableCell className="fw-bold text-nowrap" align="center">Action</TableCell>
                                <TableCell className="fw-bold text-nowrap">Name</TableCell>
                                <TableCell className="fw-bold text-nowrap">Mobile Number</TableCell>
                                <TableCell className="fw-bold text-nowrap">Email</TableCell>
                                <TableCell className="fw-bold text-nowrap">Branch</TableCell>
                                <TableCell className="fw-bold text-nowrap">Room Number</TableCell>
                                <TableCell className="fw-bold text-nowrap">Admission Date</TableCell>
                                <TableCell className="fw-bold text-nowrap">Vacate Date</TableCell>
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
                                        <TableCell align="left">{(index + 1) + ((_page - 1) * _rowsPerPage)}</TableCell>
                                        <TableCell className="text-muted" align="center">
                                            <div className="d-flex gap-3 align-items-center">
                                                <img className="filterPrimary" src={IMAGES_ICON.EyeIcon} alt="View" draggable="false" role="button" onClick={() => handleViewCandidateFeedback(item)} />
                                                {PageAccess === 'Write' && <img height={20} src={IMAGES_ICON.EditIcon} alt="icon" draggable="false" role="button" onClick={() => handleEditManagerFeedback(item)} />}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted bolder text-nowrap" align="left">{item?.candidateName}</TableCell>
                                        <TableCell className="text-muted bolder text-nowrap" align="left">{item?.candidateMobileNumber}</TableCell>
                                        <TableCell className="text-muted bolder text-nowrap" align="left">{item?.candidateEmail}</TableCell>
                                        <TableCell className="text-muted bolder text-nowrap" align="left">{item?.branchName}</TableCell>
                                        <TableCell className="text-muted bolder text-nowrap" align="left">{item?.roomNumber}</TableCell>
                                        <TableCell className="text-muted bolder text-nowrap" align="left">{item?.dateOfAdmission ? moment(item?.dateOfAdmission)?.format('DD-MMM-YYYY') : '-'}</TableCell>
                                        <TableCell className="text-muted bolder text-nowrap" align="left">{item?.dateOfNotice && moment(item?.dateOfNotice)?.format('DD-MMM-YYYY')}</TableCell>
                                    </TableRow>
                                ))
                            ) : !_tableLoading && (
                                <TableRow key={0}>
                                    <TableCell align={"center"} colSpan={9}><h3 className="text-muted">Data Not Found</h3></TableCell>
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
            {/* <CustomDialogue displaySize={"md"} title={'Select Candidate'} dialogueFlag={_candidateList?.length > 0} onCloseClick={() => _setCandidateList([])}
                mainContent={<div className="my-2">
                    <TableContainer className="tableBorder rounded">
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
                                            <Button className="" size="small" variant="outlined" color="secondary" onClick={() => handleSelectCandidate(item)}>Select</Button>
                                        </TableCell>
                                        <TableCell className="text-muted text-nowrap">{item?.candidateId}</TableCell>
                                        <TableCell className="text-muted text-nowrap">{item?.name}</TableCell>
                                        <TableCell className="text-muted text-nowrap">{item?.email}</TableCell>
                                    </TableRow>)}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>} /> */}
            <CustomDialogue displaySize={"sm"} title={'Feedback About Candidate Behavior'} dialogueFlag={_managerBehavior} onCloseClick={() => _setManagerBehavior(false)}
                mainContent={<div className="my-2">
                    <div className=""> How was the Behavior of the Candidate </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '80%', margin: '1rem 0' }}>
                            {[
                                { name: "Excellent", img: IMAGES_ICON.FeedbackAwesomeIcon },
                                { name: "Good", img: IMAGES_ICON.FeedbackGoodIcon },
                                { name: "Above Average", img: IMAGES_ICON.FeedbackGoodIcon },
                                { name: "Average", img: IMAGES_ICON.FeedbackAverageIcon },
                                { name: "Bad", img: IMAGES_ICON.FeedbackBadIcon }
                            ]?.map(({ name, img }) => (
                                <div className="text-center" key={name} role="button" onClick={() => changeFeedbackData("managerCandidateBehavior", name)}>
                                    {img ?
                                        <img src={img} alt={name} className="img-fluid"
                                            style={{
                                                filter: _feedbackDetails?.managerCandidateBehavior === name
                                                    ? 'invert(40%) sepia(75%) saturate(3600%) hue-rotate(2deg) brightness(95%) contrast(95%)'
                                                    : 'none',
                                            }}
                                        />
                                        :
                                        <SentimentSatisfiedAlt style={{ color: _feedbackDetails?.managerCandidateBehavior === name ? "#F76D61" : "black" }} />
                                    }
                                    <br />
                                    <span className="fs14" style={{ color: _feedbackDetails?.managerCandidateBehavior === name ? "#F76D61" : "black" }}>{name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="my-2">
                        <div className="text-muted fs14 mb-1">Describe in brief</div>
                        <TextField multiline variant="outlined" fullWidth className="" rows={3} sx={{ ...textFieldStyle }}
                            value={_feedbackDetails?.managerComments} onChange={(e: any) => changeFeedbackData('managerComments', e.target.value)} />
                    </div>
                </div>}
                actionContent={
                    <div className="px-4 d-flex justify-content-center align-items-center flex-grow-1">
                        <Button className="px-4" variant="contained" color="primary" disabled={_loading} onClick={handleSubmitAboutCandidate}>Submit</Button>
                    </div>
                } />
            <CustomDialogue displaySize={"sm"} title={'Feedback From Candidate'} dialogueFlag={_candidateBehavior} onCloseClick={() => _setCandidateBehavior(false)}
                mainContent={<div className="my-2">
                    <Box sx={{ width: '100%', height: '100%' }}>
                        <div className='px-1'>
                            <div className="mt-2 fw-bold">How do you rate your stay with us?</div>
                            <div className="checkDiv py-lg-2">
                                {["Excellent", "Good", "Above Average", "Average", "Poor"]?.map((label) => (
                                    <FormControlLabel key={label}
                                        control={
                                            <Checkbox size="small" sx={{ color: "#F76D61", "&.Mui-checked": { color: "#F76D61" }, }}
                                                checked={_feedbackDetails?.rateStay === label}
                                                onChange={() => !_view && changeFeedbackData("rateStay", label)} />
                                        }
                                        label={<span className="fs14">{label}</span>}
                                    />
                                ))}
                            </div>
                            <div className="mt-2 fw-bold">How do you rate our food service?</div>
                            <div className="checkDiv py-lg-2">
                                {["Excellent", "Good", "Above Average", "Average", "Poor"]?.map((label) => (
                                    <FormControlLabel key={label}
                                        control={
                                            <Checkbox size="small" sx={{ color: "#F76D61", "&.Mui-checked": { color: "#F76D61" }, }}
                                                checked={_feedbackDetails?.rateFoodService === label}
                                                onChange={() => !_view && changeFeedbackData("rateFoodService", label)} />
                                        }
                                        label={<span className="fs14">{label}</span>}
                                    />
                                ))}
                            </div>
                            <div className="mt-2 fw-bold">How do you rate our cleanliness and housekeeping?</div>
                            <div className="checkDiv py-lg-2">
                                {["Excellent", "Good", "Above Average", "Average", "Poor"]?.map((label) => (
                                    <FormControlLabel key={label}
                                        control={
                                            <Checkbox size="small" sx={{ color: "#F76D61", "&.Mui-checked": { color: "#F76D61" }, }}
                                                checked={_feedbackDetails?.rateCleanliness === label}
                                                onChange={() => !_view && changeFeedbackData("rateCleanliness", label)} />
                                        }
                                        label={<span className="fs14">{label}</span>}
                                    />
                                ))}
                            </div>
                            <div className="mt-2 fw-bold">How do you rate our security and safety measures?</div>
                            <div className="checkDiv py-lg-2">
                                {["Excellent", "Good", "Above Average", "Average", "Poor"]?.map((label) => (
                                    <FormControlLabel key={label}
                                        control={
                                            <Checkbox size="small" sx={{ color: "#F76D61", "&.Mui-checked": { color: "#F76D61" }, }}
                                                checked={_feedbackDetails?.rateSecuritySafety === label}
                                                onChange={() => !_view && changeFeedbackData("rateSecuritySafety", label)} />
                                        }
                                        label={<span className="fs14">{label}</span>}
                                    />
                                ))}
                            </div>
                            <div className="mt-2 fw-bold">How do you rate the support / cordiality of our staffs?</div>
                            <div className="checkDiv py-lg-2">
                                {["Excellent", "Good", "Above Average", "Average", "Poor"]?.map((label) => (
                                    <FormControlLabel key={label}
                                        control={
                                            <Checkbox size="small" sx={{ color: "#F76D61", "&.Mui-checked": { color: "#F76D61" }, }}
                                                checked={_feedbackDetails?.rateSupportStaff === label}
                                                onChange={() => !_view && changeFeedbackData("rateSupportStaff", label)} />
                                        }
                                        label={<span className="fs14">{label}</span>}
                                    />
                                ))}
                            </div>

                            <div className="my-2">
                                <div className="mt-2 fw-bold">Remarks</div>
                                <TextField multiline variant="outlined" fullWidth className="" rows={3} sx={{ ...textFieldStyle }}
                                    value={_feedbackDetails?.candidateRemarks} onChange={(e: any) => !_view && changeFeedbackData('candidateRemarks', e.target.value)} />
                            </div>
                        </div>
                    </Box>

                    {!_view && <>
                        <hr />
                        <div className="fw-bold my-3">Manager Feedback</div>
                        <div className=""> How was the Behavior of the Candidate </div>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '80%', margin: '1rem 0' }}>
                                {[
                                    { name: "Excellent", img: IMAGES_ICON.FeedbackAwesomeIcon },
                                    { name: "Good", img: IMAGES_ICON.FeedbackGoodIcon },
                                    { name: "Above Average", img: IMAGES_ICON.FeedbackGoodIcon },
                                    { name: "Average", img: IMAGES_ICON.FeedbackAverageIcon },
                                    { name: "Bad", img: IMAGES_ICON.FeedbackBadIcon }
                                ]?.map(({ name, img }) => (
                                    <div className="text-center" key={name} role="button" onClick={() => changeFeedbackData("managerCandidateBehavior", name)}>
                                        {img ?
                                            <img src={img} alt={name} className="img-fluid"
                                                style={{
                                                    filter: _feedbackDetails?.managerCandidateBehavior === name
                                                        ? 'invert(40%) sepia(75%) saturate(3600%) hue-rotate(2deg) brightness(95%) contrast(95%)'
                                                        : 'none',
                                                }}
                                            />
                                            :
                                            <SentimentSatisfiedAlt style={{ color: _feedbackDetails?.managerCandidateBehavior === name ? "#F76D61" : "black" }} />
                                        }
                                        <br />
                                        <span className="fs14" style={{ color: _feedbackDetails?.managerCandidateBehavior === name ? "#F76D61" : "black" }}>{name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="my-2">
                            <div className="text-muted fs14 mb-1">Describe in brief</div>
                            <TextField multiline variant="outlined" fullWidth className="" rows={3} sx={{ ...textFieldStyle }}
                                value={_feedbackDetails?.managerComments} onChange={(e: any) => changeFeedbackData('managerComments', e.target.value)} />
                        </div>
                    </>}
                </div>}
                actionContent={
                    !_view ? <div className="d-flex flex-grow-1 justify-content-center my-3">
                        <Button className="px-4" variant="contained" color="primary" disabled={_loading} onClick={handleSubmitAboutCandidate}>Submit</Button>
                    </div> : <></>
                } />
        </>
    )
}