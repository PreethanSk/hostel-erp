import { useEffect, useState } from 'react';
import { useStateValue } from '../../../providers/StateProvider'
import { CustomAlert, DisableKeyUpDown, textFieldStyle } from '../../../services/HelperService';
import { CustomAutoSelect } from '../../../components/helpers/CustomSelect';
import { getAllCityByStateCode, getAllCountry, getAllStateByCountryCode, getCandidatePurposeOfStay, insertUpdateCandidatePurposeOfStay } from '../../../models';
import { Button, TextField } from '@mui/material';
import { validateMobile, validatePinCode, validateMobileNumberUniqueness } from '../../../services/ValidationService';

export default function PurposeOfStay({ handleBack, handleNext }: any) {
    const [{ admissionDetails }]: any = useStateValue()
    const [_loading, _setLoading] = useState(false)
    const [_countryList, _setCountryList] = useState<any>([])
    const [_stateList, _setStateList] = useState<any>([])
    const [_cityList, _setCityList] = useState<any>([])
    const [_formData, _setFormData] = useState<any>({
        id: 0,
        admissionRefId: 0,
        candidateRefId: 0,
        mentionedPurpose: "",
        reasonOfStay: "",
        organizationName: "",
        organizationMobileNumber: "",
        organizationAddress: "",
        organizationPlace: "",
        organizationCity: "",
        organizationPincode: "",
        organizationState: 31,
        organizationCountry: 101,
        isActive: true
    })
    const changeFormData = (key: string, value: any) => {
        const newForm = { ..._formData, [key]: value };
        if (key === "organizationCountry") {
            newForm.organizationState = "";
            newForm.organizationCity = "";
        } else if (key === "organizationState") {
            newForm.organizationCity = "";
        }
        _setFormData(newForm);
    }

    const checkValidation = async () => {
        if (_formData?.mentionedPurpose === "Others") {
            if (!_formData?.reasonOfStay) {
                CustomAlert("warning", "Reason of stay required");
                return false
            }
        }
        if (_formData?.mentionedPurpose === "Employment" || _formData?.mentionedPurpose === "Education") {
            if (!_formData?.organizationName) {
                CustomAlert("warning", "Name required");
                return false
            }
            if (!_formData?.organizationMobileNumber) {
                CustomAlert("warning", "Mobile Number required");
                return false
            }
            if (_formData?.organizationMobileNumber?.trim() && !validateMobile(_formData?.organizationMobileNumber)) {
                CustomAlert("warning", "Enter valid mobile number");
                return false
            }

            if (_formData?.organizationMobileNumber && validateMobile(_formData?.organizationMobileNumber)) {
                const candidateId = admissionDetails?.admissionDetails?.candidateRefId;
                if (candidateId) {
                    const uniquenessResult = await validateMobileNumberUniqueness(
                        candidateId,
                        _formData.organizationMobileNumber,
                        _formData?.id || undefined,
                        'purpose_of_stay'
                    );

                    if (!uniquenessResult.isValid) {
                        CustomAlert("warning", uniquenessResult.message);
                        return false;
                    }
                }
            }

            if (!_formData?.organizationAddress) {
                CustomAlert("warning", "Address required");
                return false
            }
            if (!_formData?.organizationPlace) {
                CustomAlert("warning", "Place required");
                return false
            }
            if (!_formData?.organizationPincode) {
                CustomAlert("warning", "Pincode required");
                return false
            }
            if (_formData?.organizationPincode?.trim() && !validatePinCode(_formData?.organizationPincode)) {
                CustomAlert("warning", "Enter valid pincode");
                return false
            }
            if (!_formData?.organizationCountry) {
                CustomAlert("warning", "Country required");
                return false
            }
            if (!_formData?.organizationState) {
                CustomAlert("warning", "State required");
                return false
            }
            if (!_formData?.organizationCity) {
                CustomAlert("warning", "City required");
                return false
            }
        }
        return true
    }

    const handleSubmitForm = async () => {
        _setLoading(true);
        if (!(await checkValidation())) {
            _setLoading(false);
            return;
        }
        const body = {
            ..._formData,
            admissionRefId: admissionDetails?.admissionDetails?.id || 0,
            candidateRefId: admissionDetails?.admissionDetails?.candidateRefId || 0,
        }

        insertUpdateCandidatePurposeOfStay(body)
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    CustomAlert("success", "Purpose of stay details saved");
                    handleNext()
                }
            })
            .catch(console.log)
            .finally(() => _setLoading(false));
    }

    const getPurposeDetails = () => {
        getCandidatePurposeOfStay(admissionDetails?.admissionDetails?.candidateRefId)
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    if (resp?.data?.result) {
                        _setFormData({ ...resp?.data?.result })
                    }
                }
            })
            .catch((err) => console.log(err))
    }

    const getOtherList = () => {
        getAllCountry()
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    _setCountryList(resp?.data?.result);
                }
            })
            .catch(console.log)
    }

    useEffect(() => {
        getOtherList()
        getPurposeDetails()
    }, [])

    useEffect(() => {
        if (_formData?.organizationCountry) {
            getAllStateByCountryCode(Number(_formData?.organizationCountry || '0'))
                .then((resp) => {
                    if (resp?.data?.status === "success") {
                        _setStateList(resp?.data?.result);
                    }
                })
                .catch(console.log)
        }
    }, [_formData?.organizationCountry])
    useEffect(() => {
        if (_formData?.organizationState) {
            getAllCityByStateCode(Number(_formData?.organizationState || '0'))
                .then((resp) => {
                    if (resp?.data?.status === "success") {
                        _setCityList(resp?.data?.result);
                    }
                })
                .catch(console.log)
        }
    }, [_formData?.organizationState])

    return <>
        <div className="">
            <div className="row">
                <div className="fw-bold">Purpose of Stay</div>
                <div className="col-md-3 my-3">
                    <CustomAutoSelect value={_formData?.mentionedPurpose}
                        onChange={(value: any) => { changeFormData('mentionedPurpose', value || '') }}
                        placeholder={"Select Purpose of Stay"}
                        menuItem={["Employment", "Education", "Job Search", "Others"]?.map((item: any) => {
                            return { title: item, value: item }
                        })} />
                </div>
                <div className=""></div>
                {_formData?.mentionedPurpose === "Others" && <div className="">
                    <div className="col-md-6 my-3">
                        <div className="text-muted fs14 mb-1 required">Reason of stay</div>
                        <TextField fullWidth sx={{ ...textFieldStyle }} multiline rows={3}
                            value={_formData?.reasonOfStay} onChange={(e: any) => changeFormData('reasonOfStay', e.target.value)} />
                    </div>
                </div>}
                {["Employment", "Education"]?.includes(_formData?.mentionedPurpose) && <>
                    <div className="col-md-3 my-3">
                        <div className="text-muted fs14 mb-1 required">{_formData?.mentionedPurpose === 'Education' ? 'Institute' : 'Organization'} Name</div>
                        <TextField fullWidth sx={{ ...textFieldStyle }}
                            value={_formData?.organizationName} onChange={(e: any) => changeFormData('organizationName', e.target.value)} />
                    </div>
                    <div className="col-md-3 my-3">
                        <div className="text-muted fs14 mb-1 required">Mobile Number</div>
                        <TextField fullWidth sx={{ ...textFieldStyle }} type="number" onKeyDown={DisableKeyUpDown}
                            value={_formData?.organizationMobileNumber} onChange={(e: any) => changeFormData('organizationMobileNumber', e.target.value)}
                            slotProps={{ input: { startAdornment: <span className="fw-bold me-1">+{_countryList?.find((fItem: any) => fItem?.id === Number(_formData?.organizationCountry))?.phoneCode}-</span> } }} />
                    </div>
                    <div className=""></div>
                    <div className="col-md-3 my-3">
                        <div className="text-muted fs14 mb-1 required">Door No & Street</div>
                        <TextField fullWidth sx={{ ...textFieldStyle }}
                            value={_formData?.organizationAddress} onChange={(e: any) => changeFormData('organizationAddress', e.target.value)} />
                    </div>
                    <div className="col-md-3 my-3">
                        <div className="text-muted fs14 mb-1 required">Place & Area</div>
                        <TextField fullWidth sx={{ ...textFieldStyle }}
                            value={_formData?.organizationPlace} onChange={(e: any) => changeFormData('organizationPlace', e.target.value)} />
                    </div>
                    <div className=""></div>
                    <div className="col-md-3 my-3">
                        <div className="text-muted fs14 mb-1 required">Pincode</div>
                        <TextField fullWidth sx={{ ...textFieldStyle }} type="number" onKeyDown={DisableKeyUpDown}
                            value={_formData?.organizationPincode} onChange={(e: any) => changeFormData('organizationPincode', e.target.value)} />
                    </div>
                    <div className="col-md-3 my-3">
                        <div className="text-muted fs14 mb-1 required">Country</div>
                        <CustomAutoSelect value={Number(_formData?.organizationCountry)}
                            onChange={(value: any) => { changeFormData('organizationCountry', value || '') }}
                            menuItem={_countryList?.map((item: any) => {
                                return item?.isActive ? { title: (item?.name || ''), value: item?.id } : null
                            })?.filter(Boolean)} />
                    </div>
                    <div className="col-md-3 my-3">
                        <div className="text-muted fs14 mb-1 required">State</div>
                        <CustomAutoSelect value={Number(_formData?.organizationState)}
                            onChange={(value: any) => { changeFormData('organizationState', value || '') }}
                            menuItem={_stateList?.map((item: any) => {
                                return item?.isActive ? { title: (item?.name || ''), value: item?.id } : null
                            })?.filter(Boolean)} />
                    </div>
                    <div className="col-md-3 my-3">
                        <div className="text-muted fs14 mb-1 required">City</div>
                        <TextField fullWidth sx={{ ...textFieldStyle }}
                            value={_formData?.organizationCity} onChange={(e: any) => changeFormData('organizationCity', e.target.value)} />
                        {/* <CustomAutoSelect value={Number(_formData?.organizationCity)}
                            onChange={(value: any) => { changeFormData('organizationCity', value || '') }}
                            menuItem={_cityList?.map((item: any) => {
                                return item?.isActive ? { title: (item?.name || ''), value: item?.id } : null
                            })?.filter(Boolean)} /> */}
                    </div>
                </>}
            </div>
            <div className="d-flex align-items-center justify-content-end mobJustify gap-3">
                <Button className="px-4 text-capitalize" variant="outlined" sx={{ color: "black" }} disabled={_loading} onClick={handleBack}>Back</Button>
                <Button className="px-4" variant="contained" color="primary" disabled={_loading} onClick={handleSubmitForm}>Next</Button>
            </div>
        </div>
    </>
}
