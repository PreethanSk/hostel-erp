import { useEffect, useState } from 'react';
import { useStateValue } from '../../../providers/StateProvider'
import { CustomAlert, textFieldStyle } from '../../../services/HelperService';
import { Button, TextField } from '@mui/material';
import { getCotsByCotId, insertUpdateCandidateAdmissionAnyDetail } from '../../../models';
import moment from 'moment';
import { CustomAutoSelect } from '../../../components/helpers/CustomSelect';
import { RemoveCircleOutlineRounded, AddCircleOutlineRounded } from '@mui/icons-material';

export default function RoomAndFee({ handleBack, handleNext }: any) {
    const [{ admissionDetails }, dispatch]: any = useStateValue()
    const [_loading, _setLoading] = useState(false)
    const [_formData, _setFormData] = useState<any>({ noDayStay: '1', noDayStayType: 'Month' })
    const [_cotDetails, _setCotDetails] = useState<any>({})

    const changeFormData = (key: string, value: any) => {
        if (key === 'noDayStay') {
            let dateOfNotice = '';
            if (_formData?.noDayStayType === "Days") {
                dateOfNotice = moment(_formData?.dateOfAdmission).add(Number(value), 'days').format('YYYY-MM-DD')
            } else {
                dateOfNotice = moment(_formData?.dateOfAdmission).add(Number(value), 'months').format('YYYY-MM-DD')
            }
            _setFormData({ ..._formData, [key]: value, dateOfNotice: dateOfNotice })
        } else if (key === "noDayStayType") {
            let dateOfNotice = '', rent = '';
            if (value === "Days") {
                dateOfNotice = moment(_formData?.dateOfAdmission).add(Number(_formData?.noDayStay), 'days').format('YYYY-MM-DD')
                rent = _cotDetails?.perDayRent
            } else {
                dateOfNotice = moment(_formData?.dateOfAdmission).add(Number(_formData?.noDayStay), 'months').format('YYYY-MM-DD')
                rent = _cotDetails?.rentAmount
            }
            _setFormData({ ..._formData, [key]: value, dateOfNotice: dateOfNotice, monthlyRent: rent })
        } else {
            _setFormData({ ..._formData, [key]: value })
        }
    }

    const checkValidation = () => {
        if (!_formData?.noDayStayType) {
            CustomAlert("warning", "Duration type required");
            return false
        }
        if (!_formData?.noDayStay) {
            CustomAlert("warning", "Tentative Duration count required");
            return false
        }
        return true
    }

    const handleSubmitForm = () => {
        _setLoading(true);
        if (!checkValidation()) {
            _setLoading(false);
            return;
        }

        const body = {
            id: admissionDetails?.admissionDetails?.id || 0,
            candidateRefId: admissionDetails?.admissionDetails?.candidateRefId || 0,
            branchRefId: admissionDetails?.admissionDetails?.branchRefId || 0,
            roomRefId: admissionDetails?.admissionDetails?.roomRefId || 0,
            cotRefId: admissionDetails?.admissionDetails?.cotRefId || 0,
            dateOfAdmission: admissionDetails?.admissionDetails?.dateOfAdmission || "",
            dues: admissionDetails?.admissionDetails?.dues || "",
            admittedBy: admissionDetails?.admissionDetails?.admittedBy || "",
            isActive: admissionDetails?.admissionDetails?.isActive || false,
            dateOfNotice: _formData?.dateOfNotice || "",
            admissionFee: _formData?.admissionFee || '',
            lateFeeAmount: _formData?.lateFeeAmount || '',
            advancePaid: _formData?.advancePaid || '',
            monthlyRent: _formData?.monthlyRent || '',
            noDayStayType: (_formData?.noDayStayType + '') || "Month",
            noDayStay: (_formData?.noDayStay + '') || "1",
            admissionStatus: _formData?.admissionStatus || "Inprogress",
        }
        // _setLoading(false);
        // return;
        insertUpdateCandidateAdmissionAnyDetail(body)
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    dispatch({
                        type: "SET_ADMISSION_DETAILS",
                        data: {
                            ...admissionDetails, admissionDetails: {
                                ...admissionDetails?.admissionDetails,
                                ..._formData
                            }
                        }
                    })
                    CustomAlert("success", "Room and Fee details saved");
                    handleNext()
                }
            })
            .catch((err) => {
                console.log(err)
                CustomAlert("warning", err?.response?.data?.error)
            })
            .finally(() => _setLoading(false))
    }

    useEffect(() => {
        if (admissionDetails?.admissionDetails) {
            getCotsByCotId(admissionDetails?.admissionDetails?.cotRefId)
                .then((resp) => {
                    if (resp?.data?.status === "success") {
                        const cotDetail = resp?.data?.result;
                        _setCotDetails(cotDetail)
                        _setFormData({
                            ...admissionDetails?.admissionDetails,
                            roomNumber: cotDetail?.roomNumber,
                            cotNumber: cotDetail?.cotNumber,
                            cotsType: cotDetail?.cotsType,
                            roomTypeName: cotDetail?.roomTypeName,
                            admissionFee: cotDetail?.admissionFee,
                            lateFeeAmount: cotDetail?.lateFeeAmount,
                            advancePaid: cotDetail?.advanceAmount,
                            monthlyRent: cotDetail?.rentAmount || '0',
                            oneDayStay: cotDetail?.oneDayStay,
                            perDayRent: cotDetail?.perDayRent || '0',
                            noDayStay: admissionDetails?.admissionDetails?.noDayStay || '1',
                            noDayStayType: admissionDetails?.admissionDetails?.noDayStayType || 'Month',
                            dateOfNotice: admissionDetails?.admissionDetails?.dateOfNotice ? admissionDetails?.admissionDetails?.dateOfNotice : moment(_formData?.dateOfAdmission).add(1, 'months').format('YYYY-MM-DD')
                        });
                    } else {
                        _setFormData({ ...admissionDetails?.admissionDetails })
                    }
                })
                .catch((err) => {
                    console.log(err)
                    _setFormData({ ...admissionDetails?.admissionDetails })
                })
        }
    }, [admissionDetails])
    console.log(admissionDetails)

    return <>
        <div className="">
            <div className="row">
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
                    <div className="text-muted fs14 mb-1 required">Tentative Duration Count</div>
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
                {/* <div className="col-md-3 my-3">
                    <div className="text-muted fs14 mb-1">Date of Notice</div>
                    <div className="">{_formData?.dateOfNotice ? moment(_formData?.dateOfNotice)?.format('DD-MMM-YYYY') : ''}</div>
                </div> */}
            </div>
            <hr />
            <div className="row">
                <div className="fw-bold">Fee Details</div>
                {_formData?.noDayStayType === "Month" && <>
                    <div className="col-md-3 my-3">
                        <div className="text-muted fs14 mb-1">Admission Fee</div>
                        <TextField type="number" fullWidth sx={{ ...textFieldStyle }}
                            value={_formData?.admissionFee || ''}
                            onChange={(e: any) => changeFormData('admissionFee', e.target.value)}
                            placeholder="Enter admission fee"
                        />
                    </div>
                    <div className="col-md-3 my-3">
                        <div className="text-muted fs14 mb-1">Advance Amount</div>
                        <TextField type="number" fullWidth sx={{ ...textFieldStyle }}
                            value={_formData?.advancePaid || ''}
                            onChange={(e: any) => changeFormData('advancePaid', e.target.value)}
                            placeholder="Enter advance amount"
                        />
                    </div>
                    {admissionDetails?.admissionDetails?.admissionStatus === 'Approved' && <div className="col-md-3 my-3">
                        <div className="text-muted fs14 mb-1">Late Fee</div>
                        <TextField type="number" fullWidth sx={{ ...textFieldStyle }}
                            value={_formData?.lateFeeAmount || ''}
                            onChange={(e: any) => changeFormData('lateFeeAmount', e.target.value)}
                            placeholder="Enter late fee"
                        />
                    </div>}
                </>}
                <div className="col-md-3 my-3">
                    <div className="text-muted fs14 mb-1">Per {_formData?.noDayStayType} Rent</div>
                    <TextField fullWidth sx={{ ...textFieldStyle }} value={_formData?.monthlyRent || ''} type="number"
                        onChange={(e: any) => changeFormData('monthlyRent', e.target.value)}
                        placeholder={`Enter ${_formData?.noDayStayType === "Month" ? "monthly" : "daily"} rent`}
                    />
                </div>
            </div>
            <div className="mt-4 d-flex align-items-center justify-content-end mobJustify gap-3">
                <Button className="px-4 bg-white text-capitalize" variant="outlined" sx={{ color: "black" }} disabled={_loading} onClick={handleBack}>Back</Button>
                <Button className="px-4" variant="contained" color="primary" disabled={_loading} onClick={handleSubmitForm}>Next</Button>
            </div>
        </div>
    </>
}
