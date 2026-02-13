import { useEffect, useState } from 'react';
import { Button, TextField, Typography, Box, Divider, CircularProgress } from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import moment from 'moment';
import { useStateValue } from '../../../providers/StateProvider';
import { CustomAlert, DisableKeyUpDown } from '../../../services/HelperService';
import { getCandidateDetail, getCandidatePaymentDetail, getCotsByCotId, getRedirectToPayment, insertUpdateCandidateAdmissionAnyDetail, insertUpdateCandidatePaymentDetail } from '../../../models';
import { CustomAutoSelect } from '../../../components/helpers/CustomSelect';
import DialogModal from '../../../components/shared/DialogModal';
import FormField from '../../../components/shared/FormField';
import { gray } from '../../../theme/tokens';
import Swal from 'sweetalert2';

export default function Payments({ PageAccess, handleBack, handleNext, handleClose }: any) {
  const [{ admissionDetails }, dispatch]: any = useStateValue();
  const [_loading, _setLoading] = useState(false);
  const [_totalAmount, _setTotalAmount] = useState(0);
  const [_editPayment, _setEditPayment] = useState("");
  const [_paymentLoading, _setPaymentLoading] = useState(false);
  const [_candidateDetails, _setCandidateDetails] = useState<any>({});
  const [_paymentDetails, _setPaymentDetails] = useState<any>({});
  const [_admissionType, _setAdmissionType] = useState<string>(admissionDetails?.admissionDetails?.admissionType || 'Candidate');
  const [_payFor, _setPayFor] = useState<any>({
    admissionFee: "0", advancePaid: "0", lateFeeAmount: '0', monthlyRent: '0',
    tokenAmount: '0', cancellationFee: null, refundAmount: null, cancelReason: null,
  });
  const [_formData, _setFormData] = useState<any>({
    id: 0, admissionRefId: 0, candidateRefId: 0, paymentOption: "All",
    paidAmount: "", dueToPaid: "", dueDate: "",
    admissionFeePending: "", advancePaid: "", advancePending: "",
    monthlyRentPaid: "", monthlyRentPending: "", lateFeePaid: "", lateFeePending: "",
    tokenAmountPaid: "", tokenAmountPending: "", refundPaid: "", refundPending: "",
    cancellationFeePaid: "", cancellationFeePending: "", discountOffer: "", isActive: true,
  });

  const changeFormData = (key: string, value: any) => {
    if (key === "tokenAmountPaid") {
      _setFormData({ ..._formData, [key]: value, dueToPaid: "", discountOffer: "" });
      getTotalSum({ ..._formData, [key]: value, dueToPaid: "", discountOffer: "" });
    } else if (key === "dueToPaid") {
      _setFormData({ ..._formData, [key]: value, discountOffer: "" });
      getTotalSum({ ..._formData, [key]: value, discountOffer: "" });
    } else {
      _setFormData({ ..._formData, [key]: value });
      getTotalSum({ ..._formData, [key]: value });
    }
  };

  const getTotalSum = (obj: any) => {
    let totalAmount = [
      Math.ceil(Number(obj?.admissionFeePending || '0')),
      Math.ceil(Number(obj?.advancePending || '0')),
      Math.ceil(Number(obj?.lateFeePending || '0')),
      Math.ceil(Number(obj?.monthlyRentPending || '0')),
      Math.ceil(Number(obj?.ebChargePending || '0')),
      Math.ceil(Number(obj?.miscellaneousPending || '0')),
    ]?.reduce((acc, value) => acc + value, 0);
    totalAmount -= Number(obj?.tokenAmountPaid || '0');
    _setTotalAmount(totalAmount);
  };

  const changeCancelForm = (key: string, value: any) => { _setPayFor({ ..._payFor, [key]: value }); };

  const checkValidation = () => {
    if (_admissionType === 'Staff') return true;
    if (!_formData?.dueDate) { CustomAlert("warning", "Due date required"); return false; }
    if (!_formData?.dueToPaid) { CustomAlert("warning", "Candidate pay required"); return false; }
    return true;
  };

  const handleChangeAdmissionType = (value: string) => {
    const newType = value || 'Candidate';
    _setAdmissionType(newType);
    if (admissionDetails?.admissionDetails) {
      dispatch({
        type: "SET_ADMISSION_DETAILS",
        data: { ...admissionDetails, admissionDetails: { ...admissionDetails?.admissionDetails, admissionType: newType } }
      });
    }
    if (newType === 'Staff') {
      const resetForm = {
        ..._formData, admissionFeePending: '0', advancePending: '0', lateFeePending: '0',
        monthlyRentPending: '0', ebChargePending: '0', miscellaneousPending: '0',
        tokenAmountPaid: '0', dueToPaid: '0', discountOffer: '0', paidAmount: '0',
        totalPendingAmount: '0', dueDate: '',
      };
      _setFormData(resetForm);
      _setTotalAmount(0);
    } else {
      getPaymentDetails();
    }
  };

  const getCandidateData = () => {
    if (admissionDetails?.admissionDetails?.candidateRefId) {
      getCandidateDetail(admissionDetails?.admissionDetails?.candidateRefId)
        .then((resp) => { if (resp?.data?.status === "success") _setCandidateDetails({ ...resp?.data?.result }); })
        .catch(console.log);
    }
  };

  const handlePayment = () => {
    const admissionData = { ...admissionDetails?.admissionDetails };
    const body = {
      amount: Math.ceil(_formData?.dueToPaid || '0'),
      mobileNumber: _candidateDetails?.mobileNumber, email: _candidateDetails?.email,
      name: _candidateDetails?.name, admissionId: admissionData?.id + "",
      candidateId: admissionData?.candidateRefId + "",
    };
    _setLoading(true);
    _setPaymentLoading(true);
    getRedirectToPayment(body)
      .then((resp) => { if (resp?.data?.status === "success") window.location.href = resp?.data?.result?.redirectTo; })
      .catch(console.log)
      .finally(() => _setLoading(false));
  };

  const handleUpdateStatus = (status: string = 'Submitted') => {
    _setLoading(true);
    const body: any = {
      id: admissionDetails?.admissionDetails?.id || 0, admissionStatus: status,
      paymentStatus: 'Unpaid', discountOffer: Number(_formData?.discountOffer || '0'),
      admissionType: _admissionType,
    };
    if (status === "Submitted" || status === "Approved") {
      if (!admissionDetails?.admissionDetails?.monthlyRent) body.monthlyRent = _formData?.monthlyRentPending || "";
      body.lateFeeAmount = _formData?.lateFeePending || "";
      body.tokenAmount = _formData?.tokenAmountPaid || "";
    }
    insertUpdateCandidateAdmissionAnyDetail(body)
      .then((resp) => { if (resp?.data?.status === "success") { CustomAlert("success", "Admission status updated"); handleNext(); } })
      .catch((err) => { console.log(err); CustomAlert("warning", err?.response?.data?.error); })
      .finally(() => _setLoading(false));
  };

  const handleCancellation = () => {
    if (!_payFor?.cancellationFee) { CustomAlert("warning", "Cancellation fee required"); return; }
    if (!_payFor?.refundAmount) { CustomAlert("warning", "Refund amount required"); return; }
    if (!_payFor?.cancelReason) { CustomAlert("warning", "Reason required"); return; }
    _setLoading(true);
    const body = {
      id: admissionDetails?.admissionDetails?.id || 0, admissionStatus: "Cancelled",
      paymentStatus: 'Refund', admissionType: _admissionType, ..._payFor
    };
    insertUpdateCandidateAdmissionAnyDetail(body)
      .then((resp) => { if (resp?.data?.status === "success") { CustomAlert("success", "Admission status updated"); handleNext(); } })
      .catch((err) => { console.log(err); CustomAlert("warning", err?.response?.data?.error); })
      .finally(() => _setLoading(false));
  };

  const handleSubmitForm = (status = 'Submitted') => {
    if (status === 'Rejected') {
      Swal.fire({
        title: "Are you sure?", text: "You want to reject this admission!", icon: "warning",
        input: "text", inputPlaceholder: "Enter rejection reason...",
        inputValidator: (value) => { if (!value) return "Rejection reason is required!"; return null; },
        showCancelButton: true, confirmButtonColor: "#388024", cancelButtonColor: "#bf1029",
        confirmButtonText: "Yes, reject it!"
      }).then((result) => {
        if (result.isConfirmed) {
          const rejectionReason = result.value;
          const body = {
            ..._formData, dueToPaid: _formData?.dueToPaid,
            totalPendingAmount: Math.ceil(Number(_totalAmount || '0') - Number(_formData?.dueToPaid || '0')),
            admissionRefId: admissionDetails?.admissionDetails?.id || 0,
            candidateRefId: admissionDetails?.admissionDetails?.candidateRefId || 0,
          };
          insertUpdateCandidatePaymentDetail(body)
            .then((resp) => {
              if (resp?.data?.status === "success") {
                const body2: any = {
                  id: admissionDetails?.admissionDetails?.id || 0, admissionStatus: status,
                  paymentStatus: 'Unpaid', discountOffer: Number(_formData?.discountOffer || '0'),
                  admissionType: _admissionType, admissionStatusReason: rejectionReason || ''
                };
                insertUpdateCandidateAdmissionAnyDetail(body2)
                  .then((resp) => { if (resp?.data?.status === "success") { CustomAlert("success", "Admission status updated"); handleNext(); } })
                  .catch((err) => { console.log(err); CustomAlert("warning", err?.response?.data?.error); })
                  .finally(() => _setLoading(false));
              }
            })
            .catch(console.log)
            .finally(() => _setLoading(false));
        }
      });
    } else {
      if (!checkValidation()) return;
      const body = {
        ..._formData, dueToPaid: _formData?.dueToPaid,
        totalPendingAmount: Math.ceil(Number(_totalAmount || '0') - Number(_formData?.dueToPaid || '0')),
        admissionRefId: admissionDetails?.admissionDetails?.id || 0,
        candidateRefId: admissionDetails?.admissionDetails?.candidateRefId || 0,
        discountOffer: Number(_formData?.discountOffer || '0'),
      };
      _setLoading(true);
      insertUpdateCandidatePaymentDetail(body)
        .then((resp) => {
          if (resp?.data?.status === "success") {
            handleUpdateStatus(status);
            CustomAlert("success", "Payment details saved");
            handleNext();
          }
        })
        .catch(console.log)
        .finally(() => _setLoading(false));
    }
  };

  const getPaymentDetails = () => {
    getCandidatePaymentDetail(admissionDetails?.admissionDetails?.candidateRefId)
      .then((resp) => {
        if (resp?.data?.status === "success") {
          if (resp?.data?.result) {
            _setFormData({ ...resp?.data?.result, dueToPaid: Math.ceil(resp?.data?.result?.dueToPaid), monthlyRentPending: Math.ceil(resp?.data?.result?.monthlyRentPending) });
            getTotalSum({ ...resp?.data?.result });
            getFromRoomCot(false);
          } else {
            getFromRoomCot(true);
          }
        }
      })
      .catch(console.log);
  };

  const getFromRoomCot = (key: boolean) => {
    if (admissionDetails?.admissionDetails) {
      getCotsByCotId(admissionDetails?.admissionDetails?.cotRefId)
        .then((resp) => {
          if (resp?.data?.status === "success") {
            const cotDetail = resp?.data?.result;
            const temp: any = {
              ..._formData,
              admissionRefId: admissionDetails?.admissionDetails?.id || 0,
              candidateRefId: admissionDetails?.admissionDetails?.candidateRefId || 0,
              admissionFeePending: Math.ceil(cotDetail?.admissionFee) || "",
              advancePending: Math.ceil(cotDetail?.advanceAmount) || "",
              lateFeePending: admissionDetails?.admissionDetails?.admissionStatus === "Approved" ? Math.ceil(cotDetail?.lateFeeAmount) : "",
              monthlyRentPending: admissionDetails?.admissionDetails?.noDayStayType === "Month" ? Math.ceil(cotDetail?.rentAmount) : Math.ceil(cotDetail?.perDayRent),
              advancePaid: "", monthlyRentPaid: "", lateFeePaid: "",
              tokenAmountPending: "", tokenAmountPaid: "", refundPaid: "", refundPending: "",
              cancellationFeePaid: "", cancellationFeePending: "",
            };
            if (admissionDetails?.admissionDetails?.noDayStayType === 'Month' && admissionDetails?.admissionDetails?.dateOfAdmission && admissionDetails?.admissionDetails?.monthlyRent) {
              const dateOfAdmission = moment(admissionDetails?.admissionDetails?.dateOfAdmission, 'YYYY-MM-DD');
              const endOfMonth = moment(dateOfAdmission).endOf('month');
              const totalStayDays = endOfMonth.diff(dateOfAdmission, 'days') + 1;
              const monthlyRent = Number(admissionDetails?.admissionDetails?.monthlyRent);
              const totalDaysInMonth = dateOfAdmission.daysInMonth();
              const perDayRent = monthlyRent / totalDaysInMonth;
              const adjustedRent = Math.ceil(perDayRent * totalStayDays);
              temp.monthlyRentPending = Math.ceil(adjustedRent) || "";
            }
            if (key) {
              const temp2 = {
                ...temp,
                dueToPaid: admissionDetails?.admissionDetails?.noDayStayType === "Month" ? Math.ceil(cotDetail?.rentAmount) : Math.ceil(cotDetail?.perDayRent),
                monthlyRentPending: admissionDetails?.admissionDetails?.noDayStayType === "Month" ? Math.ceil(cotDetail?.rentAmount) : Math.ceil(cotDetail?.perDayRent),
              };
              _setFormData(temp2);
              getTotalSum(temp2);
            }
            _setPaymentDetails({
              admissionFee: cotDetail?.admissionFee, advancePaid: cotDetail?.advanceAmount,
              lateFeeAmount: cotDetail?.lateFeeAmount,
              monthlyRent: admissionDetails?.admissionDetails?.noDayStayType === "Month" ? Math.ceil(cotDetail?.rentAmount) : Math.ceil(cotDetail?.perDayRent),
              perDayRent: Math.ceil(cotDetail?.perDayRent), rentAmount: Math.ceil(cotDetail?.rentAmount),
              noDayStayType: admissionDetails?.admissionDetails?.noDayStayType,
            });
          }
        })
        .catch(console.log);
    }
  };

  useEffect(() => { getPaymentDetails(); getCandidateData(); }, []);

  return (
    <Box>
      <Grid2 container spacing={3}>
        <Grid2 size={{ xs: 12, md: 3 }}>
          <FormField label="Admission Type">
            <CustomAutoSelect value={_admissionType}
              onChange={(value: any) => handleChangeAdmissionType(value || 'Candidate')}
              placeholder="Select type"
              menuItem={['Candidate', 'Staff']?.map((item: any) => ({ title: item, value: item }))} />
          </FormField>
        </Grid2>
      </Grid2>

      {_admissionType === 'Candidate' && (
        <>
          <Typography variant="body2" sx={{ color: gray[500], mb: 1 }}>Include Amount for Pay:</Typography>
          <Grid2 container spacing={3}>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <FormField label="Admission Fee">
                <TextField fullWidth size="small" type="number" onKeyDown={DisableKeyUpDown}
                  value={_formData?.admissionFeePending?.toString() || ''} onChange={(e: any) => {
                    const numericValue = Number(e.target.value);
                    const maxValue = Number(_paymentDetails?.admissionFee || '0');
                    changeFormData("admissionFeePending", numericValue < maxValue ? numericValue : maxValue);
                  }} />
              </FormField>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <FormField label="Advance Fee">
                <TextField fullWidth size="small" type="number" onKeyDown={DisableKeyUpDown}
                  value={_formData?.advancePending?.toString() || ''} onChange={(e: any) => {
                    const numericValue = Number(e.target.value);
                    const maxValue = Number(_paymentDetails?.advancePaid || '0');
                    changeFormData("advancePending", numericValue < maxValue ? numericValue : maxValue);
                  }} />
              </FormField>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <FormField label={`Rent (${admissionDetails?.admissionDetails?.noDayStayType === "Month" ? 'Monthly' : 'Per Day'})`}>
                <TextField fullWidth size="small" type="number" onKeyDown={DisableKeyUpDown}
                  value={_formData?.monthlyRentPending?.toString() || ''} onChange={(e: any) => {
                    const numericValue = Math.ceil(Number(e.target.value));
                    const maxValue = Math.ceil(Number(_paymentDetails?.monthlyRent || '0'));
                    changeFormData("monthlyRentPending", numericValue < maxValue ? numericValue : maxValue);
                  }} />
              </FormField>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <FormField label="Token Amount">
                <TextField fullWidth size="small" type="number" onKeyDown={DisableKeyUpDown}
                  value={_formData?.tokenAmountPaid?.toString() || ''} onChange={(e: any) => {
                    const numericValue = Math.ceil(Number(e.target.value));
                    const maxValue = Math.ceil(Number(_formData?.admissionFeePending || '0') + Number(_formData?.advancePending || '0') + Number(_formData?.monthlyRentPending || '0'));
                    changeFormData("tokenAmountPaid", numericValue < maxValue ? numericValue : maxValue);
                  }} />
              </FormField>
            </Grid2>
            {admissionDetails?.admissionDetails?.admissionStatus === "Approved" && (
              <Grid2 size={{ xs: 12, md: 3 }}>
                <FormField label="Late Fee">
                  <TextField fullWidth size="small" type="number" onKeyDown={DisableKeyUpDown}
                    value={_formData?.lateFeePending?.toString() || ''} onChange={(e: any) => {
                      changeFormData("lateFeePending", Math.ceil(Number(e.target.value)));
                    }} />
                </FormField>
              </Grid2>
            )}
            <Grid2 size={{ xs: 12, md: 3 }}>
              <FormField label="Due Date">
                <TextField fullWidth size="small" type="date" onKeyDown={DisableKeyUpDown}
                  value={_formData?.dueDate} onChange={(e: any) => changeFormData('dueDate', e.target.value)}
                  inputProps={{ min: new Date().toISOString().split('T')[0] }} />
              </FormField>
            </Grid2>
          </Grid2>

          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" sx={{ color: gray[500], mb: 1 }}>Total Amount for Candidate Pay:</Typography>

          <Grid2 container spacing={3}>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <FormField label="Pay by Candidate">
                <TextField fullWidth size="small" type="number" onKeyDown={DisableKeyUpDown}
                  value={_formData?.dueToPaid?.toString() || ''} onChange={(e: any) => {
                    const numericValue = Math.ceil(Number(e.target.value));
                    const maxValue = Math.ceil(Number(_formData?.admissionFeePending || '0') + Number(_formData?.advancePending || '0') + Number(_formData?.monthlyRentPending || '0') - Number(_formData?.tokenAmountPaid || '0'));
                    changeFormData("dueToPaid", numericValue < maxValue ? numericValue : maxValue);
                  }} />
              </FormField>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <FormField label="Discount Offer">
                <TextField fullWidth size="small" type="number" onKeyDown={DisableKeyUpDown}
                  value={_formData?.discountOffer?.toString() || ''} onChange={(e: any) => {
                    const numericValue = Number(e.target.value);
                    const maxValue = Number(_formData?.admissionFeePending || '0') + Number(_formData?.advancePending || '0') + Number(_formData?.monthlyRentPending || '0') - Number(_formData?.tokenAmountPaid || '0') - Number(_formData?.dueToPaid || '0');
                    changeFormData("discountOffer", numericValue < maxValue ? numericValue : maxValue);
                  }} />
              </FormField>
            </Grid2>
          </Grid2>

          <Divider sx={{ my: 2 }} />

          <Grid2 container spacing={3}>
            {Number(_formData?.ebChargePending || '0') > 0 && (
              <Grid2 size={{ xs: 6, md: 2 }}>
                <FormField label="Utility Charges">
                  <Typography variant="body2">{_formData?.ebChargePending || 0}</Typography>
                </FormField>
              </Grid2>
            )}
            {Number(_formData?.miscellaneousPending || '0') > 0 && (
              <Grid2 size={{ xs: 6, md: 2 }}>
                <FormField label="Miscellaneous Charges">
                  <Typography variant="body2">{_formData?.miscellaneousPending || 0}</Typography>
                </FormField>
              </Grid2>
            )}
            <Grid2 size={{ xs: 6, md: 2 }}>
              <FormField label="Due to be Paid">
                <Typography variant="body2">{Math.ceil(Number(_totalAmount || '0'))}</Typography>
              </FormField>
            </Grid2>
            <Grid2 size={{ xs: 6, md: 2 }}>
              <FormField label="Remaining Amount">
                <Typography variant="body2">{Math.ceil(Number(_totalAmount || '0') - Number(_formData?.dueToPaid || '0') - Number(_formData?.discountOffer || '0'))}</Typography>
              </FormField>
            </Grid2>
            {Number(_formData?.paidAmount || '0') > 0 && (
              <Grid2 size={{ xs: 6, md: 2 }}>
                <FormField label="Paid Amount">
                  <Typography variant="body2">{_formData?.paidAmount || 0}</Typography>
                </FormField>
              </Grid2>
            )}
          </Grid2>
        </>
      )}

      {admissionDetails?.payment && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography sx={{ fontWeight: 600, mb: 2 }}>Booking Cancellation</Typography>
          <Grid2 container spacing={3}>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <FormField label="Cancellation Fee">
                <TextField fullWidth size="small" type="number" onKeyDown={DisableKeyUpDown}
                  value={_payFor?.cancellationFee} onChange={(e: any) => changeCancelForm('cancellationFee', e.target.value)} />
              </FormField>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <FormField label="Refund Amount">
                <TextField fullWidth size="small" type="number" onKeyDown={DisableKeyUpDown}
                  value={_payFor?.refundAmount} onChange={(e: any) => changeCancelForm('refundAmount', e.target.value)} />
              </FormField>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <FormField label="Cancel Reason">
                <TextField fullWidth size="small"
                  value={_payFor?.cancelReason} onChange={(e: any) => changeCancelForm('cancelReason', e.target.value)} />
              </FormField>
            </Grid2>
          </Grid2>
        </>
      )}

      {admissionDetails?.admissionDetails?.admissionStatus === 'Approved' ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
          <Button variant="outlined" disabled={_loading} onClick={handleClose}
            sx={{ textTransform: 'none', px: 4, color: 'black', borderColor: gray[300] }}>Close</Button>
          {PageAccess === 'Write' && <Button variant="contained" color="success" disabled={_loading} onClick={() => handleSubmitForm('Approved')}
            sx={{ textTransform: 'none', px: 4 }}>Approved</Button>}
          {PageAccess === 'Write' && admissionDetails?.payment && <Button variant="contained" color="primary" disabled={_loading} onClick={handleCancellation}
            sx={{ textTransform: 'none', px: 4 }}>Cancellation Submit</Button>}
        </Box>
      ) : admissionDetails?.admissionDetails?.admissionStatus === 'Submitted' ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
          <Button variant="outlined" disabled={_loading} onClick={handleClose}
            sx={{ textTransform: 'none', px: 4, color: 'black', borderColor: gray[300] }}>Close</Button>
          {PageAccess === 'Write' && <Button variant="contained" color="error" disabled={_loading} onClick={() => handleSubmitForm('Rejected')}
            sx={{ textTransform: 'none', px: 4 }}>Reject</Button>}
          {PageAccess === 'Write' && <Button variant="contained" color="success" disabled={_loading} onClick={() => handleSubmitForm('Approved')}
            sx={{ textTransform: 'none', px: 4 }}>Approved</Button>}
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
          <Button variant="outlined" disabled={_loading} onClick={handleBack}
            sx={{ textTransform: 'none', px: 4, color: 'black', borderColor: gray[300] }}>Back</Button>
          <Button variant="contained" color="primary" disabled={_loading} onClick={() => handleSubmitForm('Submitted')}
            sx={{ textTransform: 'none', px: 4 }}>Submit for Approval</Button>
        </Box>
      )}

      <DialogModal open={_paymentLoading} onClose={() => {}} title=" ">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
          <CircularProgress size={50} sx={{ mb: 2 }} />
          <Typography sx={{ fontSize: '1.3em', fontWeight: 500 }}>Preparing Your Payment</Typography>
          <Typography variant="body2" sx={{ color: gray[500], mt: 1 }}>Please wait a moment...</Typography>
        </Box>
      </DialogModal>
    </Box>
  );
}
