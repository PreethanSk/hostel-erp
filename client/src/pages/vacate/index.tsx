import { useEffect, useState } from "react";
import { Button, Table, TableBody, TableCell, TableHead, TableRow, TextField, MenuItem, Pagination, PaginationItem, Checkbox, FormControlLabel, TableContainer, Box } from '@mui/material';
import { CustomAlert, customRadio, customTableHeader, CustomTableHover, customTableTemplate, DisableKeyUpDown, getExportEXCEL, textFieldStyle } from '../../services/HelperService';
import { IMAGES_ICON } from '../../assets/images/exportImages';
import { SkeletonProviderTables } from '../../providers/SkeletonProvider';
import Swal from "sweetalert2";

import moment from 'moment';
import { getBranchGridList, getCandidateAdmissionById, getCandidateDetail, getCandidateDetailSearch, getCandidateFeedbackById, getVacateListGridList, insertUpdateCandidateAnyDetail, insertUpdateCandidateFeedback, insertUpdateVacateDetails, deleteVacateDetails, getVacateByCandidateId } from '../../models';
import CustomSelect from '../../components/helpers/CustomSelect';
import CustomDialogue from "../../components/helpers/CustomDialogue";
import { SentimentSatisfiedAlt } from "@mui/icons-material";
import { useStateValue } from "../../providers/StateProvider";
import CustomSearch from "../../components/helpers/CustomSearch";
import DateRangeSelector from "../../components/helpers/DateRangeSelector";

export default function Index({ PageAccess }: any) {
  const [{ user }]: any = useStateValue()
  const [_branchList, _setBranchList] = useState<any>([]);
  const [_tableItems, _setTableItems] = useState<any>([]);
  const [_tableTotalCount, _setTableTotalCount] = useState(0);
  const [_pageList, _setPageList] = useState<any>([]);
  const [_tableLoading, _setTableLoading] = useState(true);
  const [_loading, _setLoading] = useState(false);
  const [_candidateBehavior, _setCandidateBehavior] = useState('');
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
    isActive: true
  });

  const [_filterData, _setFilterData] = useState({ branchId: '', status: '', fromDate: moment().clone().startOf('month').format('YYYY-MM-DD'), toDate: moment().format('YYYY-MM-DD') });
  const [_searchCandidate, _setSearchCandidate] = useState('');
  const [_search, _setSearch] = useState('');
  const [_view, _setView] = useState(false);
  const [_editForm, _setEditForm] = useState(false);
  const [_provideFromCandidate, _setProvideFromCandidate] = useState(false);
  const [_provideAboutCandidate, _setProvideAboutCandidate] = useState(false);
  const [_formData, _setFormData] = useState<any>({
    id: 0, isActive: true, admissionDetails: {}, candidateDetails: {}, isBlackListed: false,
    dateOfNoticeGiven: "", proposedVacatingDate: "", actualVacatingDate: ""
  })
  const [_candidateList, _setCandidateList] = useState<any>([]);
  const [_candidateDetails, _setCandidateDetails] = useState<any>({ blackListed: "no", blackListedReason: "" });

  const [_page, _setPage] = useState(1);
  const [_rowPopup, _setRowPopup] = useState(false);
  const [_rowsPerPage, _setRowsPerPage] = useState(10);
  const payableList = ["payableAdvancePaid", "payableAdmissionFee", "payableMonthlyRent", "payablePenalty", "payableDuePending"]

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

  const changeFeedbackData = (key: string, value: any) => {
    _setFeedbackDetails({ ..._feedbackDetails, [key]: value });
  }

  const changeFormData = (key: string, value: any) => {
    if (payableList?.includes(key)) {
      const newNetPayable = payableList?.reduce((sum: any, item: string) => {
        if (item === key) {
          return Number(sum || '0') + Number(value || '0');
        } else {
          return Number(sum || '0') + Number(_formData[item] || '0');
        }
      }, 0);
      _setFormData({ ..._formData, [key]: value, netAmountPayable: newNetPayable });
    } else {
      _setFormData({ ..._formData, [key]: value });
    }
  }

  const getCandidateData = (id: number) => {
    getCandidateDetail(id)
      .then((resp) => {
        if (resp?.data?.status === "success") {
          _setCandidateDetails({ ...resp?.data?.result });
        }
      })
      .catch(console.log)
  }

  const handleEditVacate = (item: any) => {
    _setEditForm(true)
    _setView(true)
    getCandidateData(item?.candidateRefId)
    getCandidateAdmissionById({ admissionId: item?.admissionRefId })
      .then((resp) => {
        if (resp?.data?.status === "success") {
          const data = resp?.data?.result?.length ? resp?.data?.result[0] : { ...resp?.data?.result }
          _setFormData({
            ..._formData, ...item,
            admissionDetails: data,
          })
        }

      })
      .catch((err) => console.log(err))
    // _setFormData({ ...item })
  }

  const getCandidateFeedbackData = (item: any) => {
    getCandidateFeedbackById({ candidateId: item?.candidateRefId, admissionId: item?.id, branchId: item?.branchRefId })
      .then((resp) => {
        if (resp?.data?.status === "success") {
          const data = resp?.data?.result
          if (data?.length > 0) {
            _setFeedbackDetails({ ...data[0] })
            _setProvideFromCandidate(true)
            if (data[0]?.managerCandidateBehavior) {
              _setProvideAboutCandidate(true)
            }
          }
        }
      })
      .catch((err) => console.log(err))
  }

  const checkCandidateVacateStatus = (candidateId: number, candidateName: string) => {
    getVacateByCandidateId(candidateId)
      .then((resp) => {
        if (resp?.data?.status === "success" && resp?.data?.result) {
          const existingVacate = resp?.data?.result;
          const status = existingVacate?.vacateStatus || 'Pending';
          CustomAlert("warning", `${candidateName} is already ${status.toLowerCase()}`);
          return false;
        }
        return true;
      })
      .catch((err) => {
        console.log(err);
        return true;
      });
  }

  const handleSelectCandidate = (item: any) => {
    
    getVacateByCandidateId(item?.id)
      .then((resp) => {
        if (resp?.data?.status === "success" && resp?.data?.result) {
          const existingVacate = resp?.data?.result;
          const status = existingVacate?.vacateStatus || 'Pending';
          const candidateName = item?.name || 'Candidate';
          CustomAlert("warning", `${candidateName} is already ${status.toLowerCase()}`);
          return;
        }
        
        // If no existing vacate entry, proceed with admission check
        getCandidateAdmissionById({ candidateId: item?.id })
          .then((resp) => {
            if (resp?.data?.status === "success") {
              const data = resp?.data?.result?.length ? resp?.data?.result[0] : { ...resp?.data?.result }
              if (!Object?.keys(data).length) {
                CustomAlert("warning", "Candidate doesn't have any admission")
              } else {
                _setCandidateList([]);
                _setFormData({
                  ..._formData,
                  candidateDetails: item,
                  admissionDetails: data,
                  dateOfNoticeGiven: data?.dateOfNotice?.slice(0, 10)
                })
                getCandidateFeedbackData(data)
              }
            }
          })
          .catch((err) => console.log(err))
      })
      .catch((err) => {
        console.log(err);
        
        getCandidateAdmissionById({ candidateId: item?.id })
          .then((resp) => {
            if (resp?.data?.status === "success") {
              const data = resp?.data?.result?.length ? resp?.data?.result[0] : { ...resp?.data?.result }
              if (!Object?.keys(data).length) {
                CustomAlert("warning", "Candidate doesn't have any admission")
              } else {
                _setCandidateList([]);
                _setFormData({
                  ..._formData,
                  candidateDetails: item,
                  admissionDetails: data,
                  dateOfNoticeGiven: data?.dateOfNotice?.slice(0, 10)
                })
                getCandidateFeedbackData(data)
              }
            }
          })
          .catch((err) => console.log(err))
      })
  }

  const handleSearchCandidate = () => {
    if (!_searchCandidate?.trim()) {
      return
    }
    _setLoading(true)
    getCandidateDetailSearch(_searchCandidate)
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

  const handleClearForm = () => {
    getGridList()
    _setLoading(false);
    _setEditForm(false);
    _setView(false)
    _setCandidateDetails({ blackListed: "no", blackListedReason: "" })
    _setSearchCandidate('')
    _setFormData({
      id: 0, isActive: true, admissionDetails: {}, candidateDetails: {},
      dateOfNoticeGiven: "", proposedVacatingDate: "", actualVacatingDate: ""
    });
  }

  const getPrintTableHeadBody = () => {
    const header = ["S. No", "Status", "Branch Name", "Candidate Name", "Room No", "Cot No", "Mobile Number", "Date of Admission", "Date of Notice", "Date of Notice Given", "Proposed Vacating Date", "Actual Vacating Date"];
    const body = _tableItems?.map((item: any, index: number) => [
      index + 1, 
      item?.vacateStatus === "Approved" ? "Approved" : item?.vacateStatus === "Reject" ? "Reject" : "Pending",
      item?.branchName,
      item?.candidateName,
      item?.roomNumber,
      item?.cotNumber,
      item?.candidateMobileNumber,
      item?.dateOfAdmission ? moment(item?.dateOfAdmission)?.format('DD-MMM-YYYY') : '',
      item?.dateOfNotice ? moment(item?.dateOfNotice)?.format('DD-MMM-YYYY') : '',
      item?.dateOfNoticeGiven ? moment(item?.dateOfNoticeGiven)?.format('DD-MMM-YYYY') : '',
      item?.proposedVacatingDate ? moment(item?.proposedVacatingDate)?.format('DD-MMM-YYYY') : '',
      item?.actualVacatingDate ? moment(item?.actualVacatingDate)?.format('DD-MMM-YYYY') : ''
    ]);
    return { header, body }
  }

  const exportEXCEL = () => {
    const { header, body } = getPrintTableHeadBody();
    getExportEXCEL({ header, body, fileName: "Vacate" })
  }

  const checkValidation = () => {
    if (!_formData?.dateOfNoticeGiven) {
      CustomAlert('warning', "Date of notice given Required")
      return false;
    }
    if (!_formData?.proposedVacatingDate) {
      CustomAlert('warning', "Proposed Vacating Date Required")
      return false;
    }
    if (!_formData?.actualVacatingDate) {
      CustomAlert('warning', "Actual Vacting Date Required")
      return false;
    }
    return true
  }

  const handleSubmitAboutCandidate = () => {
    if (!_feedbackDetails?.managerCandidateBehavior) {
      CustomAlert('warning', "Feedback Behavior Required")
      return false;
    }
    if (!_feedbackDetails?.managerComments) {
      CustomAlert('warning', "Feedback Brief Required")
      return false;
    }
    _setCandidateBehavior('')
    if (!_feedbackDetails?.id) {
      _setProvideAboutCandidate(true)
    } else {
      _setLoading(true)
      const body = {
        id: _feedbackDetails?.id || 0,
        candidateRefId: _formData?.admissionDetails?.candidateRefId,
        branchRefId: _formData?.admissionDetails?.branchRefId,
        admissionRefId: _formData?.admissionDetails?.id,
        rateStay: _feedbackDetails?.rateStay || "",
        rateFoodService: _feedbackDetails?.rateFoodService || "",
        rateCleanliness: _feedbackDetails?.rateCleanliness || "",
        rateSecuritySafety: _feedbackDetails?.rateSecuritySafety || "",
        rateSupportStaff: _feedbackDetails?.rateSupportStaff || "",
        managerCandidateBehavior: _feedbackDetails?.managerCandidateBehavior || "",
        managerComments: _feedbackDetails?.managerComments || "",
        isActive: true
      }

      insertUpdateCandidateFeedback(body)
        .then((resp) => {
          if (resp?.data?.status === 'success') {
            CustomAlert("success", 'Candidate Feedback Updated')
            _setCandidateBehavior('')
            _setProvideAboutCandidate(true)
          }
        })
        .catch((err) => console.log(err))
        .finally(() => _setLoading(false))
    }
  }

  const handleSubmitFromCandidate = () => {
    _setLoading(true)
    if (!_feedbackDetails?.rateStay || !_feedbackDetails?.rateFoodService || !_feedbackDetails?.rateCleanliness || !_feedbackDetails?.rateSecuritySafety || !_feedbackDetails?.rateSupportStaff) {
      CustomAlert("warning", 'Provide All Feedbacks')
      _setLoading(false)
      return
    }
    const body = {
      id: _feedbackDetails?.id || 0,
      candidateRefId: _formData?.admissionDetails?.candidateRefId,
      branchRefId: _formData?.admissionDetails?.branchRefId,
      admissionRefId: _formData?.admissionDetails?.id,
      rateStay: _feedbackDetails?.rateStay || "",
      rateFoodService: _feedbackDetails?.rateFoodService || "",
      rateCleanliness: _feedbackDetails?.rateCleanliness || "",
      rateSecuritySafety: _feedbackDetails?.rateSecuritySafety || "",
      rateSupportStaff: _feedbackDetails?.rateSupportStaff || "",
      managerCandidateBehavior: _feedbackDetails?.managerCandidateBehavior || "",
      managerComments: _feedbackDetails?.managerComments || "",
      isActive: true
    }

    insertUpdateCandidateFeedback(body)
      .then((resp) => {
        if (resp?.data?.status === 'success') {
          CustomAlert("success", 'Candidate Feedback Inserted')
          _setCandidateBehavior('')
          changeFeedbackData('id', resp?.data?.result?.insertedId)
          _setProvideFromCandidate(true)
        }
      })
      .catch((err) => console.log(err))
      .finally(() => _setLoading(false))
  }

  const getNetPayableAmount = () => {
    const totalPaid = Number(_formData?.admissionDetails?.advancePaid || '0') + Number(_formData?.admissionDetails?.admissionFee || '0') + Number(_formData?.admissionDetails?.monthlyRent || '0')
    const result = totalPaid + Number(_formData?.payablePenalty || 0) + Number(_formData?.payableDuePending || 0)
    return result
  }

  const handleDeleteVacate = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this vacate entry!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#388024",
      cancelButtonColor: "#bf1029",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        _setLoading(true)
        deleteVacateDetails(_formData?.id)
          .then((resp) => {
            if (resp?.data?.status === "success") {
              CustomAlert("success", "Vacate entry deleted successfully");
              handleClearForm()
            }
          })
          .catch((err) => console.log(err))
          .finally(() => _setLoading(false))
      }
    });
  }

  const handleSubmitForm = () => {
    if (!checkValidation()) {
      return;
    }
    _setLoading(true)
    
    
    let vacateStatus = 'Pending';
    if (_formData?.id) {
      
      if (_formData?.vacateStatus === 'Pending') {
        vacateStatus = 'Approved';
      } else {
        vacateStatus = _formData?.vacateStatus || 'Pending';
      }
    }
    
    const body = {
      id: _formData?.id || 0,
      candidateRefId: _formData?.admissionDetails?.candidateRefId,
      branchRefId: _formData?.admissionDetails?.branchRefId,
      admissionRefId: _formData?.admissionDetails?.id,
      vacateType: moment(_formData?.admissionDetails?.dateOfNotice).isAfter(moment(), 'day') ? 'Vacate Notice' : 'Immediate Vacate',
      vacateStatus: vacateStatus,
      feedbackBehavior: _feedbackDetails?.managerCandidateBehavior || '',
      feedbackBrief: _feedbackDetails?.managerComments || '',
      damageRemarks: _formData?.damageRemarks || '',
      payableAdvancePaid: _formData?.admissionDetails?.advancePaid || null,
      payableAdmissionFee: _formData?.admissionDetails?.admissionFee || null,
      payableMonthlyRent: _formData?.admissionDetails?.monthlyRent || null,
      payableDuePending: _formData?.payableDuePending || null,
      payablePenalty: _formData?.payablePenalty || null,
      netAmountPayable: getNetPayableAmount() + '',
      dateOfNoticeGiven: _formData?.dateOfNoticeGiven || null,
      proposedVacatingDate: _formData?.proposedVacatingDate || null,
      actualVacatingDate: _formData?.actualVacatingDate || null,
      isActive: _formData?.isActive || false
    }

    // _setLoading(false);
    // return;

    insertUpdateVacateDetails(body)
      .then((resp) => {
        if (resp?.data?.status === "success") {
          CustomAlert("success", "Vacate details saved");
          if (_candidateDetails?.blackListed === "yes") {
            const candidateBody = {
              id: _candidateDetails?.id || 0,
              blackListed: _candidateDetails?.blackListed || "",
              blackListedBy: (user?.firstName + " " + user?.lastName),
              blackListedReason: _candidateDetails?.blackListedReason || "",
              blackListedDate: moment(),
            }
            insertUpdateCandidateAnyDetail(candidateBody)
              .then((resp) => {
                if (resp?.data?.status === "success") {
                  console.log(resp?.data?.result)
                }
              }).catch((err) => console.log(err))
          }
          handleClearForm()
        }
      })
      .catch((err) => console.log(err))
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
    getVacateListGridList(_page, _rowsPerPage, _filterData?.branchId?.toString(), _filterData?.status?.toString(), _filterData?.fromDate, _filterData?.toDate)
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
    getOtherList()
  }, [])

  useEffect(() => {
    getGridList();
  }, [_page, _rowsPerPage, _filterData])
  return (<>
    {!_editForm && <div className="container">
      <div className="row justify-content-between align-items-center py-3">
        <div className="col-md-4 my-2 d-flex align-items-center gap-5 flex-wrap">
          <span className="text-dark fw-bold">Vacate </span>
          <div className="d-flex align-items-center gap-5 flex-wrap">
            <span className={`${_filterData?.status === '' ? 'text-primary borderBottomPrimary fw-bold' : ''}`} role="button" onClick={() => changeFilterData('status', '')}>All</span>
            <span className={`${_filterData?.status === 'Pending' ? 'text-primary borderBottomPrimary fw-bold' : ''}`} role="button" onClick={() => changeFilterData('status', 'Pending')}>Pending</span>
            <span className={`${_filterData?.status === 'Approved' ? 'text-primary borderBottomPrimary fw-bold' : ''}`} role="button" onClick={() => changeFilterData('status', 'Approved')}>Approved</span>
          </div>
        </div>
        <div className="col-md-8">
          <div className="row align-items-center">
            <div className="col-md-2 my-2">
              {PageAccess === 'Write' && <Button className="text-capitalize text-nowrap" sx={{ color: "black" }} startIcon={<img height={18} src={IMAGES_ICON.TableNewItemIcon} />} onClick={handleAddNew}>Add New</Button>}
            </div>
            <div className="col-md-2 my-2">
              <CustomSelect className="" padding={'0px 10px'} value={_filterData?.branchId} onChange={(e: any) => changeFilterData('branchId', e.target.value)}
                placeholder={"Branch"} menuItem={[<MenuItem className="px-2 fs14" value={''} key={-1}>All</MenuItem>,
                ..._branchList?.map((item: any) => <MenuItem className="px-2 fs14" key={item?.id} value={item?.id}>{item?.branchName}</MenuItem>)]} />
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
              <TableCell className="fw-bold text-nowrap">Status</TableCell>
              <TableCell className="fw-bold text-nowrap">Branch Name</TableCell>
              <TableCell className="fw-bold text-nowrap">Candidate Name</TableCell>
              <TableCell className="fw-bold text-nowrap">Room No</TableCell>
              <TableCell className="fw-bold text-nowrap">Cot No</TableCell>
              <TableCell className="fw-bold text-nowrap">Mobile Number</TableCell>
              <TableCell className="fw-bold text-nowrap">Date of Admission</TableCell>
              <TableCell className="fw-bold text-nowrap">Date of Notice</TableCell>
              <TableCell className="fw-bold text-nowrap">Date of Notice Given</TableCell>
              <TableCell className="fw-bold text-nowrap">Proposed Vacating Date</TableCell>
              <TableCell className="fw-bold text-nowrap">Actual Vacating Date</TableCell>
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
                    {PageAccess === 'Write' && <div className="d-flex align-items-center gap-2 justify-content-center" role="button" onClick={() => handleEditVacate(item)}>
                      <span>Edit</span>
                      <img draggable="false" height={16} src={IMAGES_ICON.EditIcon} alt="icon" />
                    </div>}
                  </TableCell>
                  <TableCell className="text-muted text-nowrap">{item?.vacateStatus === "Approved" ?
                    <span className="fs12 statusBgActive text-success rounded--50 px-3 py-1">Approved</span> :
                    item?.vacateStatus === "Reject" ?
                      <span className="fs12 statusBgInactive text-danger rounded--50 px-3 py-1">Reject</span> :
                      <span className="fs12 statusBgPending rounded--50 px-3 py-1">Pending</span>
                  }</TableCell>
                  <TableCell className="text-muted text-nowrap">{item?.branchName}</TableCell>
                  <TableCell className="text-muted text-nowrap">{item?.candidateName}</TableCell>
                  <TableCell className="text-muted text-nowrap">{item?.roomNumber}</TableCell>
                  <TableCell className="text-muted text-nowrap">{item?.cotNumber}</TableCell>
                  <TableCell className="text-muted text-nowrap">{item?.candidateMobileNumber}</TableCell>
                  <TableCell className="text-muted text-nowrap">{item?.dateOfAdmission && moment(item?.dateOfAdmission)?.format('DD-MMM-YYYY')}</TableCell>
                  <TableCell className="text-muted text-nowrap">{item?.dateOfNotice && moment(item?.dateOfNotice)?.format('DD-MMM-YYYY')}</TableCell>
                  <TableCell className="text-muted text-nowrap">{item?.dateOfNoticeGiven && moment(item?.dateOfNoticeGiven)?.format('DD-MMM-YYYY')}</TableCell>
                  <TableCell className="text-muted text-nowrap">{item?.proposedVacatingDate && moment(item?.proposedVacatingDate)?.format('DD-MMM-YYYY')}</TableCell>
                  <TableCell className="text-muted text-nowrap">{item?.actualVacatingDate && moment(item?.actualVacatingDate)?.format('DD-MMM-YYYY')}</TableCell>
                </TableRow>
              ))
            ) : !_tableLoading && (
              <TableRow>
                <TableCell className="fs-3 text-muted" align="center" colSpan={13}>Data Not Found</TableCell>
              </TableRow>
            )}
            <SkeletonProviderTables columns={13} visible={_tableLoading} />
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
          <div className="d-flex align-items-center py-2 borderBottomLight" role="button" onClick={handleClearForm}>
            <img height={24} draggable={false} src={IMAGES_ICON.BackIcon} />
            <div className="fw-bold">Back</div>
          </div>
          <div className="my-3 px-2">
            {!_view ? <div className="row align-items-center">
              <div className="col-md-5 my-3">
                <TextField fullWidth sx={{ ...textFieldStyle }} placeholder="Search Candidate by Id / Name / Email / Mobile" autoComplete="off"
                  value={_searchCandidate} onChange={(e: any) => _setSearchCandidate(e.target.value)} />
              </div>
              <div className="col-md-2 my-3">
                <Button variant="contained" className="px-3" color="primary" disabled={_loading} onClick={handleSearchCandidate}>Search</Button>
              </div>
            </div> : <></>}
            {_formData?.admissionDetails?.id ? <>
              {!_view && <hr />}
              <div className="row align-items-center">
                <div className="fw-bold">Candidate Details</div>
                <div className="col-md-2 my-3">
                  <div className="text-muted fs14 mb-1">Branch</div>
                  <div className="">{_formData?.admissionDetails?.branchName}</div>
                </div>
                <div className="col-md-2 my-3">
                  <div className="text-muted fs14 mb-1">Name</div>
                  <div className="">{_formData?.admissionDetails?.candidateName}</div>
                </div>
                <div className="col-md-2 my-3">
                  <div className="text-muted fs14 mb-1">Room Number</div>
                  <div className="">{_formData?.admissionDetails?.roomNumber}</div>
                </div>
                <div className="col-md-2 my-3">
                  <div className="text-muted fs14 mb-1">Cot Number</div>
                  <div className="">{_formData?.admissionDetails?.cotNumber}</div>
                </div>
                <div className="col-md-2 my-3">
                  <div className="text-muted fs14 mb-1">Mobile Number</div>
                  <div className="">{_formData?.admissionDetails?.candidateMobileNumber}</div>
                </div>
                <div className=""></div>
                <div className="col-md-2 my-3">
                  <div className="text-muted fs14 mb-1">Date of Admission</div>
                  <div className="">{_formData?.admissionDetails?.dateOfAdmission && moment(_formData?.admissionDetails?.dateOfAdmission)?.format('DD-MMM-YYYY')}</div>
                </div>
                <div className="col-md-2 my-3">
                  <div className="text-muted fs14 mb-1">Date of Notice</div>
                  <div className="">{_formData?.admissionDetails?.dateOfNotice && moment(_formData?.admissionDetails?.dateOfNotice)?.format('DD-MMM-YYYY')}</div>
                </div>
                <div className="col-md-2 my-3">
                  <div className="text-muted fs14 mb-1">Duration Type</div>
                  <div className="">{_formData?.admissionDetails?.noDayStayType}</div>
                </div>
                <div className="col-md-2 my-3">
                  <div className="text-muted fs14 mb-1">Duration Count</div>
                  <div className="">{_formData?.admissionDetails?.noDayStay}</div>
                </div>
                <hr />
                <div className="fw-bold">Notice Details</div>
                <div className="col-md-2 my-3">
                  <div className="text-muted fs14 mb-1 required">Date of Notice Given</div>
                  <TextField fullWidth sx={{ ...textFieldStyle }} type="date" onKeyDown={DisableKeyUpDown} value={_formData?.dateOfNoticeGiven} autoComplete="off"
                    onChange={(e) => changeFormData("dateOfNoticeGiven", e.target.value)} />
                </div>
                <div className="col-md-2 my-3">
                  <div className="text-muted fs14 mb-1 required">Proposed Vacating Date</div>
                  <TextField fullWidth sx={{ ...textFieldStyle }} type="date" onKeyDown={DisableKeyUpDown} value={_formData?.proposedVacatingDate} autoComplete="off"
                    onChange={(e) => changeFormData("proposedVacatingDate", e.target.value)}
                    inputProps={{ min: moment(_formData?.dateOfNoticeGiven).format('YYYY-MM-DD') }} />
                </div>
                <div className="col-md-2 my-3">
                  <div className="text-muted fs14 mb-1 required">Actual Vacating Date</div>
                  <TextField fullWidth sx={{ ...textFieldStyle }} type="date" onKeyDown={DisableKeyUpDown} value={_formData?.actualVacatingDate} autoComplete="off"
                    onChange={(e) => changeFormData("actualVacatingDate", e.target.value)}
                    inputProps={{ min: moment(_formData?.dateOfNoticeGiven).format('YYYY-MM-DD') }} />
                </div>
                <hr />
                <div className="fw-bold">Payment Details</div>
                <div className="col-md-2 my-3">
                  <div className="text-muted fs14 mb-1">Advance Paid</div>
                  <div className="">{_formData?.admissionDetails?.advancePaid}</div>
                </div>
                <div className="col-md-2 my-3">
                  <div className="text-muted fs14 mb-1">Admission Fee</div>
                  <div className="">{_formData?.admissionDetails?.admissionFee}</div>
                </div>
                <div className="col-md-2 my-3">
                  <div className="text-muted fs14 mb-1">Monthly Rent</div>
                  <div className="">{_formData?.admissionDetails?.monthlyRent}</div>
                </div>
                <div className=""></div>
                <div className="col-md-2 my-3">
                  <div className="text-muted fs14 mb-1">Penalty</div>
                  <TextField fullWidth type="number" onKeyDown={DisableKeyUpDown} sx={{ ...textFieldStyle }} value={_formData?.payablePenalty} autoComplete="off"
                    onChange={(e) => changeFormData("payablePenalty", e.target.value)} />
                </div>
                <div className="col-md-2 my-3">
                  <div className="text-muted fs14 mb-1">Due Pending</div>
                  <TextField fullWidth type="number" onKeyDown={DisableKeyUpDown} sx={{ ...textFieldStyle }} value={_formData?.payableDuePending} autoComplete="off"
                    onChange={(e) => changeFormData("payableDuePending", e.target.value)} />
                </div>
                <div className="col-md-4 my-3">
                  <div className="text-muted fs14 mb-1">Net Amount Payable</div>
                  <div className="">{getNetPayableAmount()}</div>
                </div>
                <div className="col-md-6 my-3">
                  <div className="text-muted fs14 mb-1 required">Damage Remarks</div>
                  <TextField fullWidth sx={{ ...textFieldStyle }} value={_formData?.damageRemarks}
                    onChange={(e) => changeFormData("damageRemarks", e.target.value)} />
                </div>
                <hr />
                <div className="">
                  <FormControlLabel label="Mark this candidate as Blacklist (if yes provide reason below)"
                    control={<Checkbox size="small" sx={{ ...customRadio }} checked={_candidateDetails?.blackListed === "yes"}
                      onChange={() => _setCandidateDetails({ ..._candidateDetails, blackListed: _candidateDetails?.blackListed === "yes" ? "no" : "yes" })} />} />
                </div>
                {_candidateDetails?.blackListed === "yes" ? <div className="">
                  <div className="text-muted fs14 mb-1">Reason for Blacklist</div>
                  <TextField fullWidth sx={{ ...textFieldStyle }} value={_candidateDetails?.blackListedReason}
                    onChange={(e) => _setCandidateDetails({ ..._candidateDetails, blackListedReason: e.target.value })} />
                </div> : <></>}
              </div>
              <div className="pt-4 d-flex justify-content-between align-items-center flex-wrap mobJustify">
                <div className="d-flex align-items-center gap-3">
                  {!_formData?.id && (
                    <>
                      <FormControlLabel 
                        control={<Checkbox checked={_provideAboutCandidate} size="small" sx={{ ...customRadio }} />} 
                        label="Provide Candidate Behavior"
                        onClick={() => _setCandidateBehavior('About_Candidate')} 
                      />
                      <FormControlLabel 
                        control={<Checkbox checked={_provideFromCandidate} size="small" sx={{ ...customRadio }} />} 
                        label="Provide feedback from Candidate"
                        onClick={() => _setCandidateBehavior('From_Candidate')} 
                      />
                    </>
                  )}
                </div>
                <div className="d-flex align-items-center gap-3">
                  {_formData?.id ? (
                    <Button variant="contained" color="error" disabled={_loading} className="" onClick={handleDeleteVacate}>Delete</Button>
                  ) : null}
                  {_formData?.vacateStatus === "Pending" ? 
                    <Button variant="contained" color="primary" disabled={_loading} className="" onClick={handleSubmitForm}>Approve</Button> : 
                    _formData?.vacateStatus === "Approved" ? 
                      <Button variant="contained" color="primary" disabled={_loading} className="" onClick={handleSubmitForm}>Apply</Button> :
                      <Button variant="contained" color="primary" disabled={_loading} className="" onClick={handleSubmitForm}>Submit</Button>
                  }
                </div>
              </div>
            </> : <></>}
          </div>
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
      </div>} />
    <CustomDialogue displaySize={"sm"} title={'Feedback About Candidate Behavior'} dialogueFlag={_candidateBehavior === 'About_Candidate'} onCloseClick={() => _setCandidateBehavior('')}
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
        <div className="px-4 d-flex justify-content-between align-items-center flex-grow-1">
          <div className="fw-bold">1/2</div>
          <Button className="px-4" variant="contained" color="primary" onClick={handleSubmitAboutCandidate}>Submit</Button>
        </div>
      } />
    <CustomDialogue displaySize={"sm"} title={'Feedback From Candidate'} dialogueFlag={_candidateBehavior === 'From_Candidate'} onCloseClick={() => _setCandidateBehavior('')}
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
                      onChange={() => changeFeedbackData('rateStay', label)} />
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
                      onChange={() => changeFeedbackData('rateFoodService', label)} />
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
                      onChange={() => changeFeedbackData('rateCleanliness', label)}
                    />
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
                      onChange={() => changeFeedbackData('rateSecuritySafety', label)}
                    />
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
                      onChange={() => changeFeedbackData('rateSupportStaff', label)}
                    />
                  }
                  label={<span className="fs14">{label}</span>}
                />
              ))}
            </div>
          </div>
        </Box>
      </div>}
      actionContent={
        <div className="px-4 d-flex justify-content-between align-items-center flex-grow-1">
          <div className="fw-bold">2/2</div>
          <Button className="px-3" variant="contained" color="primary" disabled={_loading} onClick={handleSubmitFromCandidate}>Submit</Button>
        </div>
      } />
  </>)
}