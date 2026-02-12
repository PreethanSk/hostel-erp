import { useEffect, useState } from 'react';
import { Button, TextField } from '@mui/material';
import moment from 'moment';
import { useStateValue } from '../../../providers/StateProvider'
import { CustomAlert, DisableKeyUpDown, textFieldStyle } from '../../../services/HelperService';
import { getCandidateDetail, getCandidatePaymentDetail, getCotsByCotId, getRedirectToPayment, insertUpdateCandidateAdmissionAnyDetail, insertUpdateCandidatePaymentDetail } from '../../../models';
import { CustomSimpleDialogue } from '../../../components/helpers/CustomDialogue';
import { CustomAutoSelect } from '../../../components/helpers/CustomSelect';
import "./style.scss"
import Swal from 'sweetalert2';

export default function Payments({ PageAccess, handleBack, handleNext, handleClose }: any) {
  const [{ admissionDetails }, dispatch]: any = useStateValue();
  const [_loading, _setLoading] = useState(false)
  const [_totalAmount, _setTotalAmount] = useState(0)
  const [_editPayment, _setEditPayment] = useState("")
  const [_paymentLoading, _setPaymentLoading] = useState(false)
  const [_candidateDetails, _setCandidateDetails] = useState<any>({})
  const [_paymentDetails, _setPaymentDetails] = useState<any>({})
  const [_admissionType, _setAdmissionType] = useState<string>(admissionDetails?.admissionDetails?.admissionType || 'Candidate')
  const [_payFor, _setPayFor] = useState<any>({
    admissionFee: "0",
    advancePaid: "0",
    lateFeeAmount: '0',
    monthlyRent: '0',
    tokenAmount: '0',
    cancellationFee: null,
    refundAmount: null,
    cancelReason: null,
  })
  const [_formData, _setFormData] = useState<any>({
    id: 0,
    admissionRefId: 0,
    candidateRefId: 0,
    paymentOption: "All",
    paidAmount: "",
    dueToPaid: "",
    dueDate: "",
    admissionFeePending: "",
    advancePaid: "",
    advancePending: "",
    monthlyRentPaid: "",
    monthlyRentPending: "",
    lateFeePaid: "",
    lateFeePending: "",
    tokenAmountPaid: "",
    tokenAmountPending: "",
    refundPaid: "",
    refundPending: "",
    cancellationFeePaid: "",
    cancellationFeePending: "",
    discountOffer: "",
    isActive: true,
  })

  const changeFormData = (key: string, value: any) => {
    if (key === "tokenAmountPaid") {
      _setFormData({ ..._formData, [key]: value, dueToPaid: "", discountOffer: "" })
      getTotalSum({ ..._formData, [key]: value, dueToPaid: "", discountOffer: "" })
    } else if (key === "dueToPaid") {
      _setFormData({ ..._formData, [key]: value, discountOffer: "" })
      getTotalSum({ ..._formData, [key]: value, discountOffer: "" })
    } else {
      _setFormData({ ..._formData, [key]: value })
      getTotalSum({ ..._formData, [key]: value })
    }
  }

  const getTotalSum = (obj: any) => {
    let totalAmount = [
      Math.ceil(Number(obj?.admissionFeePending || '0')),
      Math.ceil(Number(obj?.advancePending || '0')),
      Math.ceil(Number(obj?.lateFeePending || '0')),
      Math.ceil(Number(obj?.monthlyRentPending || '0')),
      Math.ceil(Number(obj?.ebChargePending || '0')),
      Math.ceil(Number(obj?.miscellaneousPending || '0')),
      // Number(obj?.tokenAmountPending || '0'),
    ]?.reduce((acc, value) => acc + value, 0)
    totalAmount -= Number(obj?.tokenAmountPaid || '0')
    _setTotalAmount(totalAmount)
  }

  const changeCancelForm = (key: string, value: any) => {
    _setPayFor({ ..._payFor, [key]: value })
  }

  const checkValidation = () => {
    if (_admissionType === 'Staff') {
      return true;
    }
    if (!_formData?.dueDate) {
      CustomAlert("warning", "Due date required");
      return false
    }
    if (!_formData?.dueToPaid) {
      CustomAlert("warning", "Candidate pay required");
      return false
    }
    // if (!Number(_totalAmount || '0')) {
    //   CustomAlert("warning", "Due to paid required, select some amount");
    //   return false
    // }
    return true
  }
  const handleChangeAdmissionType = (value: string) => {
    const newType = value || 'Candidate';
    _setAdmissionType(newType);

    // sync admission type to global admissionDetails so header/top bar reflects it
    if (admissionDetails?.admissionDetails) {
      dispatch({
        type: "SET_ADMISSION_DETAILS",
        data: {
          ...admissionDetails,
          admissionDetails: {
            ...admissionDetails?.admissionDetails,
            admissionType: newType
          }
        }
      });
    }

    if (newType === 'Staff') {
      const resetForm = {
        ..._formData,
        admissionFeePending: '0',
        advancePending: '0',
        lateFeePending: '0',
        monthlyRentPending: '0',
        ebChargePending: '0',
        miscellaneousPending: '0',
        tokenAmountPaid: '0',
        dueToPaid: '0',
        discountOffer: '0',
        paidAmount: '0',
        totalPendingAmount: '0',
        dueDate: '',
      };
      _setFormData(resetForm);
      _setTotalAmount(0);
    } else {
      // Reload payment details for candidate type
      getPaymentDetails();
    }
  }

  const getCandidateData = () => {
    if (admissionDetails?.admissionDetails?.candidateRefId) {
      getCandidateDetail(admissionDetails?.admissionDetails?.candidateRefId)
        .then((resp) => {
          if (resp?.data?.status === "success") {
            _setCandidateDetails({ ...resp?.data?.result });
          }
        })
        .catch(console.log)
    }
  }

  const handlePayment = () => {
    const admissionData = { ...admissionDetails?.admissionDetails }
    const body = {
      amount: Math.ceil(_formData?.dueToPaid || '0'),
      mobileNumber: _candidateDetails?.mobileNumber,
      email: _candidateDetails?.email,
      name: _candidateDetails?.name,
      admissionId: admissionData?.id + "",
      candidateId: admissionData?.candidateRefId + "",
    }
    _setLoading(true);
    _setPaymentLoading(true);
    getRedirectToPayment(body)
      .then((resp) => {
        if (resp?.data?.status === "success") {
          window.location.href = resp?.data?.result?.redirectTo;
        }
      })
      .catch(console.log)
      .finally(() => _setLoading(false))
  }

  const handleUpdateStatus = (status: string = 'Submitted') => {
    _setLoading(true);
    const body: any = {
      id: admissionDetails?.admissionDetails?.id || 0,
      admissionStatus: status,
      paymentStatus: 'Unpaid',
      discountOffer: Number(_formData?.discountOffer || '0'),
      admissionType: _admissionType,
    }

    if (status === "Submitted" || status === "Approved") {
      // body.admissionFee = _formData?.admissionFeePending || "";
      // body.advancePaid = _formData?.advancePending || "";
      if (!admissionDetails?.admissionDetails?.monthlyRent) {
        body.monthlyRent = _formData?.monthlyRentPending || "";
      }
      body.lateFeeAmount = _formData?.lateFeePending || "";
      body.tokenAmount = _formData?.tokenAmountPaid || "";
    }
    insertUpdateCandidateAdmissionAnyDetail(body)
      .then((resp) => {
        if (resp?.data?.status === "success") {
          CustomAlert("success", "Admission status updated");
          handleNext()
        }
      })
      .catch((err) => {
        console.log(err)
        CustomAlert("warning", err?.response?.data?.error)
      })
      .finally(() => _setLoading(false));
  }

  const handleCancellation = () => {
    if (!_payFor?.cancellationFee) {
      CustomAlert("warning", "Cancellation fee required")
      return
    }
    if (!_payFor?.refundAmount) {
      CustomAlert("warning", "Refund amount required")
      return
    }
    if (!_payFor?.cancelReason) {
      CustomAlert("warning", "Reason required")
      return
    }
    _setLoading(true);
    const body = {
      id: admissionDetails?.admissionDetails?.id || 0,
      admissionStatus: "Cancelled",
      paymentStatus: 'Refund',
      admissionType: _admissionType,
      ..._payFor
    }

    insertUpdateCandidateAdmissionAnyDetail(body)
      .then((resp) => {
        if (resp?.data?.status === "success") {
          CustomAlert("success", "Admission status updated");
          handleNext()
        }
      })
      .catch((err) => {
        console.log(err)
        CustomAlert("warning", err?.response?.data?.error)
      })
      .finally(() => _setLoading(false));
  }

  const handleSubmitForm = (status = 'Submitted') => {
    if (status === 'Rejected') {
      Swal.fire({
        title: "Are you sure?",
        text: "You want to reject this admission!",
        icon: "warning",
        input: "text",
        inputPlaceholder: "Enter rejection reason...",
        inputValidator: (value) => {
          if (!value) {
            return "Rejection reason is required!";
          }
          return null;
        },
        showCancelButton: true,
        confirmButtonColor: "#388024",
        cancelButtonColor: "#bf1029",
        confirmButtonText: "Yes, reject it!"
      }).then((result) => {
        if (result.isConfirmed) {
          const rejectionReason = result.value;
          const body = {
            ..._formData,
            dueToPaid: _formData?.dueToPaid,
            totalPendingAmount: Math.ceil(Number(_totalAmount || '0') - Number(_formData?.dueToPaid || '0')),
            admissionRefId: admissionDetails?.admissionDetails?.id || 0,
            candidateRefId: admissionDetails?.admissionDetails?.candidateRefId || 0,
          }
          insertUpdateCandidatePaymentDetail(body)
            .then((resp) => {
              if (resp?.data?.status === "success") {
                const body: any = {
                  id: admissionDetails?.admissionDetails?.id || 0,
                  admissionStatus: status,
                  paymentStatus: 'Unpaid',
                  discountOffer: Number(_formData?.discountOffer || '0'),
                  admissionType: _admissionType,
                  admissionStatusReason: rejectionReason || ''
                }
                insertUpdateCandidateAdmissionAnyDetail(body)
                  .then((resp) => {
                    if (resp?.data?.status === "success") {
                      CustomAlert("success", "Admission status updated");
                      handleNext()
                    }
                  })
                  .catch((err) => {
                    console.log(err)
                    CustomAlert("warning", err?.response?.data?.error)
                  })
                  .finally(() => _setLoading(false));
              }
            })
            .catch(console.log)
            .finally(() => _setLoading(false));
        }
      });
    } else {
      if (!checkValidation()) {
        return;
      }
      const body = {
        ..._formData,
        dueToPaid: _formData?.dueToPaid,
        totalPendingAmount: Math.ceil(Number(_totalAmount || '0') - Number(_formData?.dueToPaid || '0')),
        admissionRefId: admissionDetails?.admissionDetails?.id || 0,
        candidateRefId: admissionDetails?.admissionDetails?.candidateRefId || 0,
        discountOffer: Number(_formData?.discountOffer || '0'),
      }
      _setLoading(true);
      insertUpdateCandidatePaymentDetail(body)
        .then((resp) => {
          if (resp?.data?.status === "success") {
            handleUpdateStatus(status)
            CustomAlert("success", "Payment details saved");
            handleNext()
          }
        })
        .catch(console.log)
        .finally(() => _setLoading(false));
    }
  }

  const getPaymentDetails = () => {
    getCandidatePaymentDetail(admissionDetails?.admissionDetails?.candidateRefId)
      .then((resp) => {
        if (resp?.data?.status === "success") {
          if (resp?.data?.result) {
            _setFormData({ ...resp?.data?.result, dueToPaid: Math.ceil(resp?.data?.result?.dueToPaid), monthlyRentPending: Math.ceil(resp?.data?.result?.monthlyRentPending) })
            getTotalSum({ ...resp?.data?.result })
            getFromRoomCot(false)
          } else {
            getFromRoomCot(true)
          }
        }
      })
      .catch((err) => console.log(err))
  }


  const getFromRoomCot = (key: boolean) => {
    if (admissionDetails?.admissionDetails) {
      getCotsByCotId(admissionDetails?.admissionDetails?.cotRefId)
        .then((resp) => {
          if (resp?.data?.status === "success") {
            const cotDetail = resp?.data?.result;
            const temp = {
              ..._formData,
              admissionRefId: admissionDetails?.admissionDetails?.id || 0,
              candidateRefId: admissionDetails?.admissionDetails?.candidateRefId || 0,
              admissionFeePending: Math.ceil(cotDetail?.admissionFee) || "",
              advancePending: Math.ceil(cotDetail?.advanceAmount) || "",
              lateFeePending: admissionDetails?.admissionDetails?.admissionStatus === "Approved" ? Math.ceil(cotDetail?.lateFeeAmount) : "",
              monthlyRentPending: admissionDetails?.admissionDetails?.noDayStayType === "Month" ? Math.ceil(cotDetail?.rentAmount) : Math.ceil(cotDetail?.perDayRent),
              advancePaid: "",
              monthlyRentPaid: "",
              lateFeePaid: "",
              tokenAmountPending: "",
              tokenAmountPaid: "",
              refundPaid: "",
              refundPending: "",
              cancellationFeePaid: "",
              cancellationFeePending: "",
            }
            if (admissionDetails?.admissionDetails?.noDayStayType === 'Month' && admissionDetails?.admissionDetails?.dateOfAdmission && admissionDetails?.admissionDetails?.monthlyRent) {
              const dateOfAdmission = moment(admissionDetails?.admissionDetails?.dateOfAdmission, 'YYYY-MM-DD');
              const endOfMonth = moment(dateOfAdmission).endOf('month');

              const totalStayDays = endOfMonth.diff(dateOfAdmission, 'days') + 1;

              const monthlyRent = Number(admissionDetails?.admissionDetails?.monthlyRent);
              const totalDaysInMonth = dateOfAdmission.daysInMonth();
              const perDayRent = monthlyRent / totalDaysInMonth;

              const adjustedRent = Math.ceil(perDayRent * totalStayDays);

              console.log(`📆 Date of Admission: ${dateOfAdmission.format('YYYY-MM-DD')}`);
              console.log(`📅 Days Stayed in Month: ${totalStayDays}`);
              console.log(`💰 Per Day Rent: ${perDayRent}`);
              console.log(`🔢 Adjusted Rent to be Charged: ${adjustedRent}`);
              temp.monthlyRentPending = Math.ceil(adjustedRent) || ""
            }

            if (key) {
              const temp2 = {
                ...temp,
                dueToPaid: admissionDetails?.admissionDetails?.noDayStayType === "Month" ? Math.ceil(cotDetail?.rentAmount) : Math.ceil(cotDetail?.perDayRent),
                monthlyRentPending: admissionDetails?.admissionDetails?.noDayStayType === "Month" ? Math.ceil(cotDetail?.rentAmount) : Math.ceil(cotDetail?.perDayRent),
              }
              _setFormData(temp2);
              getTotalSum(temp2)
            }
            _setPaymentDetails({
              admissionFee: cotDetail?.admissionFee,
              advancePaid: cotDetail?.advanceAmount,
              lateFeeAmount: cotDetail?.lateFeeAmount,
              monthlyRent: admissionDetails?.admissionDetails?.noDayStayType === "Month" ? Math.ceil(cotDetail?.rentAmount) : Math.ceil(cotDetail?.perDayRent),
              perDayRent: Math.ceil(cotDetail?.perDayRent),
              rentAmount: Math.ceil(cotDetail?.rentAmount),
              noDayStayType: admissionDetails?.admissionDetails?.noDayStayType,
            });
          }
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }

  useEffect(() => {
    getPaymentDetails()
    getCandidateData()
  }, [])
  return <>
    <div className="">
      <div className="mb-3">
        <div className="row my-2">
          <div className="col-md-3 my-3">
            <div className="text-muted fs14 mb-1">Admission Type</div>
            <CustomAutoSelect value={_admissionType}
              onChange={(value: any) => handleChangeAdmissionType(value || 'Candidate')}
              placeholder="Select type"
              menuItem={['Candidate', 'Staff']?.map((item: any) => {
                return { title: item, value: item }
              })} />
          </div>
        </div>
        {_admissionType === 'Candidate' && <>
          <div className="text-muted mb-1">Include Amount for Pay:</div>
          <div className="row">
          <div className="col-md-3 my-3">
            <div className="text-muted fs14 mb-1">Admission Fee</div>
            <TextField fullWidth sx={{ ...textFieldStyle }} type="number" onKeyDown={DisableKeyUpDown}
              value={_formData?.admissionFeePending?.toString() || ''} onChange={(e: any) => {
                const rawValue = e.target.value;
                const numericValue = Number(rawValue);
                const maxValue = Number(_paymentDetails?.admissionFee || '0');
                const finalValue = numericValue < maxValue ? numericValue : maxValue;
                changeFormData("admissionFeePending", finalValue)
              }} />
          </div>
          <div className="col-md-3 my-3">
            <div className="text-muted fs14 mb-1">Advance Fee</div>
            <TextField fullWidth sx={{ ...textFieldStyle }} type="number" onKeyDown={DisableKeyUpDown}
              value={_formData?.advancePending?.toString() || ''} onChange={(e: any) => {
                const rawValue = e.target.value;
                const numericValue = Number(rawValue);
                const maxValue = Number(_paymentDetails?.advancePaid || '0');
                const finalValue = numericValue < maxValue ? numericValue : maxValue;
                changeFormData("advancePending", finalValue)
              }} />
          </div>
          <div className="col-md-3 my-3">
            <div className="text-muted fs14 mb-1">Rent ({admissionDetails?.admissionDetails?.noDayStayType === "Month" ? 'Monthly' : 'Per Day'})</div>
            <TextField fullWidth sx={{ ...textFieldStyle }} type="number" onKeyDown={DisableKeyUpDown}
              value={_formData?.monthlyRentPending?.toString() || ''} onChange={(e: any) => {
                const rawValue = e.target.value;
                const numericValue = Math.ceil(Number(rawValue));
                const maxValue = Math.ceil(Number(_paymentDetails?.monthlyRent || '0'));
                const finalValue = numericValue < maxValue ? numericValue : maxValue;
                changeFormData("monthlyRentPending", finalValue)
              }} />
          </div>
          <div className="col-md-3 my-3">
            <div className="text-muted fs14 mb-1">Token Amount</div>
            <TextField fullWidth sx={{ ...textFieldStyle }} type="number" onKeyDown={DisableKeyUpDown}
              value={_formData?.tokenAmountPaid?.toString() || ''} onChange={(e: any) => {
                const rawValue = e.target.value;
                const numericValue = Math.ceil(Number(rawValue));
                const maxValue = Math.ceil(Number(_formData?.admissionFeePending || '0') + Number(_formData?.advancePending || '0') + Number(_formData?.monthlyRentPending || '0'))
                const finalValue = numericValue < maxValue ? numericValue : maxValue
                changeFormData("tokenAmountPaid", finalValue)
              }} />
          </div>
          {admissionDetails?.admissionDetails?.admissionStatus === "Approved" && <div className="col-md-3 my-3">
            <div className="text-muted fs14 mb-1">Late Fee</div>
            <TextField fullWidth sx={{ ...textFieldStyle }} type="number" onKeyDown={DisableKeyUpDown}
              value={_formData?.lateFeePending?.toString() || ''} onChange={(e: any) => {
                const rawValue = e.target.value;
                const numericValue = Math.ceil(Number(rawValue));
                changeFormData("lateFeePending", numericValue)
              }} />
          </div>}
          <div className="col-md-3 my-3">
            <div className="text-muted fs14 mb-1">Due Date</div>
            <TextField fullWidth sx={{ ...textFieldStyle }} type="date" onKeyDown={DisableKeyUpDown}
              value={_formData?.dueDate} onChange={(e: any) => changeFormData('dueDate', e.target.value)}
              inputProps={{ min: new Date().toISOString().split('T')[0], }} />
          </div>
          <hr />
          <div className="text-muted mb-1">Total Amount for Candidate Pay:</div>
          <div className="col-md-3 my-3">
            <div className="text-muted fs14 mb-1">Pay by Candidate</div>
            <TextField fullWidth sx={{ ...textFieldStyle }} type="number" onKeyDown={DisableKeyUpDown}
              value={_formData?.dueToPaid?.toString() || ''} onChange={(e: any) => {
                const rawValue = e.target.value;
                const numericValue = Math.ceil(Number(rawValue));
                const maxValue = Math.ceil(Number(_formData?.admissionFeePending || '0') + Number(_formData?.advancePending || '0') + Number(_formData?.monthlyRentPending || '0') - Number(_formData?.tokenAmountPaid || '0'))
                const finalValue = numericValue < maxValue ? numericValue : maxValue
                changeFormData("dueToPaid", finalValue)
              }} />
          </div>
          <div className="col-md-3 my-3">
            <div className="text-muted fs14 mb-1">Discount Offer</div>
            <TextField fullWidth sx={{ ...textFieldStyle }} type="number" onKeyDown={DisableKeyUpDown}
              value={_formData?.discountOffer?.toString() || ''} onChange={(e: any) => {
                const rawValue = e.target.value;
                const numericValue = Number(rawValue);
                const maxValue = Number(_formData?.admissionFeePending || '0') + Number(_formData?.advancePending || '0') + Number(_formData?.monthlyRentPending || '0') - Number(_formData?.tokenAmountPaid || '0') - Number(_formData?.dueToPaid || '0')
                const finalValue = numericValue < maxValue ? numericValue : maxValue
                changeFormData("discountOffer", finalValue)
              }} />
          </div>
          <hr />
          {Number(_formData?.ebChargePending || '0') > 0 && <div className="col-md-2 col-6 my-3">
            <div className="text-muted fs14 mb-1">EB Charges</div>
            <div className="">{_formData?.ebChargePending || 0}</div>
          </div>}
          {Number(_formData?.miscellaneousPending || '0') > 0 && <div className="col-md-2 col-6 my-3">
            <div className="text-muted fs14 mb-1">Miscellaneous Charges</div>
            <div className="">{_formData?.miscellaneousPending || 0}</div>
          </div>}

          <div className="col-md-2 col-6 my-3">
            <div className="text-muted fs14 mb-1">Due to be Paid</div>
            <div className="">{Math.ceil(Number(_totalAmount || '0'))}</div>
          </div>
          <div className="col-md-2 col-6 my-3">
            <div className="text-muted fs14 mb-1">Remaining Amount</div>
            <div className="">{Math.ceil(Number(_totalAmount || '0') - Number(_formData?.dueToPaid || '0') - Number(_formData?.discountOffer || '0'))}</div>
          </div>

          {Number(_formData?.paidAmount || '0') > 0 && <div className="col-md-2 col-6 my-3">
            <div className="text-muted fs14 mb-1">Paid Amount</div>
            <div className="">{_formData?.paidAmount || 0}</div>
          </div>}

          {/* {[
            { label: "Admission Fee", value: 'admissionFee' },
            { label: "Advance Fee", value: 'advancePaid' },
            { label: "Late Fee", value: 'lateFeeAmount' },
            { label: "Rent (Monthly or Per Day)", value: 'monthlyRent' },]?.map((item) =>
              <div className="col-md-3 my-2">
                <div className="d-flex align-items-center gap-2">
                  {_editPayment === item?.value ?
                    <TextField className='w-100' fullWidth sx={{ ...textFieldStyle }} type="number" onKeyDown={DisableKeyUpDown}
                      value={_payFor[_editPayment]} onChange={(e: any) => { _setPayFor({ ..._payFor, [_editPayment]: e.target.value }); }} slotProps={{
                        input: {
                          endAdornment: <Button variant='contained' size="small" onClick={() => { updateTokenAmount(); _setEditPayment("") }}>Save</Button>
                        }
                      }} />
                    : <FormControlLabel className='customFieldBorder me-1 w-100'
                      control={
                        <Checkbox size="small" sx={{ color: "#F76D61", "&.Mui-checked": { color: "#F76D61" }, }} disabled={admissionDetails?.payment || !_paymentDetails[item?.value]}
                          checked={Number(_payFor[item.value]) > 0} onChange={() => changePayment(item.value)} />
                      }
                      label={<span className="fs14 pe-3">{item.label + ` (${Number(_payFor[item?.value])})`}</span>}
                    />}
                  {_editPayment === item?.value ?
                    <img src={IMAGES_ICON.CloseIcon} role="button" onClick={() => _setEditPayment("")} draggable="false" /> :
                    <img src={IMAGES_ICON.EditIcon} role="button" onClick={() => _setEditPayment(item?.value)} draggable="false" />}
                </div>
              </div>
            )} */}
        </div>
        </>}
      </div>
      {admissionDetails?.payment ? <>
        <hr />
        <div className="mt-3">Booking Cancellation</div>
        <div className="row">
          <div className="col-md-3 my-3">
            <div className="text-muted fs14 mb-1">Cancellation Fee</div>
            <TextField fullWidth sx={{ ...textFieldStyle }} type="number" onKeyDown={DisableKeyUpDown}
              value={_payFor?.cancellationFee} onChange={(e: any) => changeCancelForm('cancellationFee', e.target.value)} />
          </div>
          <div className="col-md-3 my-3">
            <div className="text-muted fs14 mb-1">Refund Amount</div>
            <TextField fullWidth sx={{ ...textFieldStyle }} type="number" onKeyDown={DisableKeyUpDown}
              value={_payFor?.refundAmount} onChange={(e: any) => changeCancelForm('refundAmount', e.target.value)} />
          </div>
          <div className="col-md-3 my-3">
            <div className="text-muted fs14 mb-1">Cancel Reason</div>
            <TextField fullWidth sx={{ ...textFieldStyle }}
              value={_payFor?.cancelReason} onChange={(e: any) => changeCancelForm('cancelReason', e.target.value)} />
          </div>
        </div>
      </> : <></>}
      {admissionDetails?.admissionDetails?.admissionStatus === 'Approved' ? <div className="mt-4 d-flex align-items-center justify-content-end mobJustify gap-3">
        <Button className="px-4 bg-white text-capitalize" variant="outlined" sx={{ color: "black" }} disabled={_loading} onClick={handleClose}>Close</Button>
        {/* {PageAccess === 'Write' && admissionDetails?.admissionDetails?.paymentStatus !== 'Paid' && <Button className="px-4" variant="contained" color="primary" disabled={_loading} onClick={handlePayment}>Payment</Button>} */}
        {PageAccess === 'Write' && <Button className="px-4" variant="contained" color="success" disabled={_loading} onClick={() => handleSubmitForm('Approved')}>Approved</Button>}
        {PageAccess === 'Write' && admissionDetails?.payment && <Button className="px-4" variant="contained" color="primary" disabled={_loading} onClick={handleCancellation}>Cancellation Submit</Button>}
      </div> :
        admissionDetails?.admissionDetails?.admissionStatus === 'Submitted' ? <div className="mt-4 d-flex align-items-center justify-content-end mobJustify gap-3">
          <Button className="px-4 bg-white text-capitalize" variant="outlined" sx={{ color: "black" }} disabled={_loading} onClick={handleClose}>Close</Button>
          {PageAccess === 'Write' && <Button className="px-4 text-capitalize" variant="contained" color="error" disabled={_loading} onClick={() => handleSubmitForm('Rejected')}>Reject</Button>}
          {PageAccess === 'Write' && <Button className="px-4" variant="contained" color="success" disabled={_loading} onClick={() => handleSubmitForm('Approved')}>Approved</Button>}
        </div> : <div className="mt-4 d-flex align-items-center justify-content-end mobJustify gap-3">
          <Button className="px-4 bg-white text-capitalize" variant="outlined" sx={{ color: "black" }} disabled={_loading} onClick={handleBack}>Back</Button>
          <Button className="px-4" variant="contained" color="primary" disabled={_loading} onClick={() => handleSubmitForm('Submitted')}>Submit for Approval</Button>
        </div>}
    </div>
    <CustomSimpleDialogue title=" " dialogueFlag={_paymentLoading}
      mainContent={<div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Preparing Your Payment</p>
        <p className="loading-subtext">Please wait a moment...</p>
      </div>} />
  </>
}