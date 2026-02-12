import { useEffect, useState } from 'react';
import { useStateValue } from '../../../providers/StateProvider'
import { CustomAlert, customRadio, DisableKeyUpDown, textFieldStyle } from '../../../services/HelperService';
import { Button, FormControlLabel, Radio, RadioGroup, TextField } from '@mui/material';
import { CustomAutoSelect } from '../../../components/helpers/CustomSelect';
import { getAllCityByStateCode, getAllCountry, getAllStateByCountryCode, getCandidateContactPerson, insertUpdateCandidateContactPerson } from '../../../models';
import { validateMobile, validatePinCode, validateMobileNumberUniqueness } from '../../../services/ValidationService';
import { IMAGES_ICON } from '../../../assets/images/exportImages';

export default function ContactPerson({ handleBack, handleNext }: any) {
    const [{ admissionDetails }]: any = useStateValue()
    const [_loading, _setLoading] = useState(false)
    const [_addSecond, _setAddSecond] = useState(false)
    const [_countryList, _setCountryList] = useState<any>([])
    const [_stateList, _setStateList] = useState<any>([])
    const [_cityList, _setCityList] = useState<any>([])
    const [_formData, _setFormData] = useState<any>({
        id: 0,
        admissionRefId: 0,
        candidateRefId: 0,
        name: "",
        relationshipType: "",
        mobileNumber: "",
        name2: "",
        relationshipType2: "",
        mobileNumber2: "",
        localGuardianStatus: true,
        guardianName: "",
        guardianMobileNumber: "",
        guardianRelationshipType: "",
        guardianAddress: "",
        guardianPlace: "",
        guardianCity: "",
        guardianPincode: "",
        guardianState: 31,
        guardianCountry: 101,
        isActive: true
    })
    const changeFormData = (key: string, value: any) => {
        const newForm = { ..._formData, [key]: value };
        if (key === "guardianCountry") {
            newForm.guardianState = "";
            newForm.guardianCity = "";
        } else if (key === "guardianState") {
            newForm.guardianCity = "";
        }
        _setFormData(newForm);
        _setFormData({ ..._formData, [key]: value })
    }

    const checkValidation = async () => {
        if (!_formData?.relationshipType) {
            CustomAlert("warning", "Relationship Type required");
            return false
        }
        if (!_formData?.name) {
            CustomAlert("warning", "Name required");
            return false
        }
        if (!_formData?.mobileNumber) {
            CustomAlert("warning", "Mobile number required");
            return false
        }
        if (_formData?.mobileNumber && !validateMobile(_formData?.mobileNumber)) {
            CustomAlert("warning", "Invalid mobile number");
            return false
        }

        // Check mobile number uniqueness for first contact person
        if (_formData?.mobileNumber && validateMobile(_formData?.mobileNumber)) {
            const candidateId = admissionDetails?.admissionDetails?.candidateRefId;
            if (candidateId) {
                const uniquenessResult = await validateMobileNumberUniqueness(
                    candidateId,
                    _formData.mobileNumber,
                    _formData?.id || undefined,
                    'contact_person'
                );

                if (!uniquenessResult.isValid) {
                    CustomAlert("warning", uniquenessResult.message);
                    return false;
                }
            }
        }

        if (_addSecond) {
            if (!_formData?.relationshipType2) {
                CustomAlert("warning", "Relationship Type required");
                return false
            }
            if (!_formData?.name2) {
                CustomAlert("warning", "Name required");
                return false
            }
            if (!_formData?.mobileNumber2) {
                CustomAlert("warning", "Mobile number required");
                return false
            }
            if (_formData?.mobileNumber2 && !validateMobile(_formData?.mobileNumber2)) {
                CustomAlert("warning", "Invalid mobile number");
                return false
            }

            // Check mobile number uniqueness for second contact person
            // if (_formData?.mobileNumber2 && validateMobile(_formData?.mobileNumber2)) {
            //     const candidateId = admissionDetails?.admissionDetails?.candidateRefId;
            //     if (candidateId) {
            //         const uniquenessResult = await validateMobileNumberUniqueness(
            //             candidateId,
            //             _formData.mobileNumber2,
            //             _formData?.id || undefined,
            //             'contact_person'
            //         );

            //         if (!uniquenessResult.isValid) {
            //             CustomAlert("warning", uniquenessResult.message);
            //             return false;
            //         }
            //     }
            // }
        }
        if (_formData?.localGuardianStatus) {
            if (!_formData?.guardianName) {
                CustomAlert("warning", "Guardian Name required");
                return false
            }
            if (!_formData?.guardianRelationshipType) {
                CustomAlert("warning", "Guardian Relationship Type required");
                return false
            }
            if (!_formData?.guardianMobileNumber) {
                CustomAlert("warning", "Guardian Mobile Number required");
                return false
            }
            if (_formData?.guardianMobileNumber?.trim() && !validateMobile(_formData?.guardianMobileNumber)) {
                CustomAlert("warning", "Enter valid mobile number");
                return false
            }


            // if (_formData?.guardianMobileNumber && validateMobile(_formData?.guardianMobileNumber)) {
            //     const candidateId = admissionDetails?.admissionDetails?.candidateRefId;
            //     if (candidateId) {
            //         const uniquenessResult = await validateMobileNumberUniqueness(
            //             candidateId,
            //             _formData.guardianMobileNumber,
            //             _formData?.id || undefined,
            //             'contact_person'
            //         );

            //         if (!uniquenessResult.isValid) {
            //             CustomAlert("warning", uniquenessResult.message);
            //             return false;
            //         }
            //     }
            // }

            if (!_formData?.guardianAddress) {
                CustomAlert("warning", "Guardian Address required");
                return false
            }
            if (!_formData?.guardianPlace) {
                CustomAlert("warning", "Guardian Place required");
                return false
            }
            if (!_formData?.guardianPincode) {
                CustomAlert("warning", "Guardian Pincode required");
                return false
            }
            if (_formData?.guardianPincode?.trim() && !validatePinCode(_formData?.guardianPincode)) {
                CustomAlert("warning", "Enter valid pincode");
                return false
            }
            if (!_formData?.guardianCountry) {
                CustomAlert("warning", "Guardian Country required");
                return false
            }
            if (!_formData?.guardianState) {
                CustomAlert("warning", "Guardian State required");
                return false
            }
            if (!_formData?.guardianCity) {
                CustomAlert("warning", "Guardian City required");
                return false
            }
        }
        return true;
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

        insertUpdateCandidateContactPerson(body)
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    CustomAlert("success", "Contact person details saved");
                    handleNext()
                }
            })
            .catch(console.log)
            .finally(() => _setLoading(false));
    }

    const getContactPersonDetails = () => {
        getCandidateContactPerson(admissionDetails?.admissionDetails?.candidateRefId)
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
        getContactPersonDetails()
    }, [])

    useEffect(() => {
        if (_formData?.guardianCountry) {
            getAllStateByCountryCode(Number(_formData?.guardianCountry || '0'))
                .then((resp) => {
                    if (resp?.data?.status === "success") {
                        _setStateList(resp?.data?.result);
                    }
                })
                .catch(console.log)
        }
    }, [_formData?.guardianCountry])
    useEffect(() => {
        if (_formData?.guardianState) {
            getAllCityByStateCode(Number(_formData?.guardianState || '0'))
                .then((resp) => {
                    if (resp?.data?.status === "success") {
                        _setCityList(resp?.data?.result);
                    }
                })
                .catch(console.log)
        }
    }, [_formData?.guardianState])

    return <>
        <div className="">
            <div className="row">
                <div className="fw-bold">Home Contact Information</div>
                <div className="mt-2">Provide Home Person Relationship Type, Name, Mobile No who stays in home</div>
                <div className="col-md-3 my-3">
                    <div className="text-muted fs14 mb-1 required">Relationship Type</div>
                    <TextField fullWidth sx={{ ...textFieldStyle }}
                        value={_formData?.relationshipType} onChange={(e: any) => {
                            const input = e.target.value;
                            const onlyLetters = input.replace(/[^a-zA-Z\s]/g, '');
                            changeFormData('relationshipType', onlyLetters)
                        }}
                    // InputProps={{ readOnly: admissionDetails?.edit }}
                    />
                </div>
                <div className="col-md-3 my-3">
                    <div className="text-muted fs14 mb-1 required">Name</div>
                    <TextField fullWidth sx={{ ...textFieldStyle }}
                        value={_formData?.name} onChange={(e: any) => {
                            const input = e.target.value;
                            const onlyLetters = input.replace(/[^a-zA-Z\s]/g, '');
                            changeFormData('name', onlyLetters)
                        }}
                    // InputProps={{ readOnly: admissionDetails?.edit }}
                    />
                </div>
                <div className="col-md-3 my-3">
                    <div className="text-muted fs14 mb-1 required">Mobile Number</div>
                    <TextField fullWidth sx={{ ...textFieldStyle }} type="number" onKeyDown={DisableKeyUpDown}
                        value={_formData?.mobileNumber} onChange={(e: any) => changeFormData('mobileNumber', e.target.value)}
                    // InputProps={{ readOnly: admissionDetails?.edit }}
                    />
                </div>
                {!_addSecond && _formData?.relationshipType2?.length === 0 && <div className="col-md-3 my-auto">
                    <img draggable={false} src={IMAGES_ICON.AddMoreIcon} alt="Add" role="button" onClick={() => _setAddSecond(true)} />
                </div>}
                <div className=""></div>
                {(_addSecond || _formData?.relationshipType2?.length > 0) && <>
                    <div className="col-md-3 my-3">
                        <div className="text-muted fs14 mb-1 required">Relationship Type</div>
                        <TextField fullWidth sx={{ ...textFieldStyle }}
                            value={_formData?.relationshipType2} onChange={(e: any) => {
                                const input = e.target.value;
                                const onlyLetters = input.replace(/[^a-zA-Z\s]/g, '');
                                changeFormData('relationshipType2', onlyLetters)
                            }}
                        // InputProps={{ readOnly: admissionDetails?.edit }}
                        />
                    </div>
                    <div className="col-md-3 my-3">
                        <div className="text-muted fs14 mb-1 required">Name</div>
                        <TextField fullWidth sx={{ ...textFieldStyle }}
                            value={_formData?.name2} onChange={(e: any) => {
                                const input = e.target.value;
                                const onlyLetters = input.replace(/[^a-zA-Z\s]/g, '');
                                changeFormData('name2', onlyLetters)
                            }}
                        // InputProps={{ readOnly: admissionDetails?.edit }}
                        />
                    </div>
                    <div className="col-md-3 my-3">
                        <div className="text-muted fs14 mb-1 required">Mobile Number</div>
                        <TextField fullWidth sx={{ ...textFieldStyle }} type="number" onKeyDown={DisableKeyUpDown}
                            value={_formData?.mobileNumber2} onChange={(e: any) => changeFormData('mobileNumber2', e.target.value)}
                        // InputProps={{ readOnly: admissionDetails?.edit }}
                        />
                    </div>
                    <div className="col-md-3 my-auto">
                        <img draggable={false} src={IMAGES_ICON.RemoveIcon} alt="Add" role="button" onClick={() => { _setAddSecond(false); _setFormData({ ..._formData, relationshipType2: '', name2: '', mobileNumber2: '' }) }} />
                    </div>
                </>}
            </div>
            <hr />
            <div className="d-flex gap-2 align-items-center">
                <span className="required">Do you have any Local Guardian / Relative Nearby</span>
                <RadioGroup row value={_formData?.localGuardianStatus} sx={{ marginLeft: "10px" }}
                    onChange={(e) => changeFormData("localGuardianStatus", e.target.value === "true")}>
                    <FormControlLabel value={true} control={<Radio size="small" sx={{ ...customRadio }} />} label="Yes" />
                    <FormControlLabel value={false} control={<Radio size="small" sx={{ ...customRadio }} />} label="No" />
                </RadioGroup>
            </div>
            <hr />
            {_formData?.localGuardianStatus && <div className="row">
                <div className="mt-2">Provide Local Guardian Name, Relationship Type, Contact & Address</div>
                <div className="col-md-3 my-3">
                    <div className="text-muted fs14 mb-1 required">Name</div>
                    <TextField fullWidth sx={{ ...textFieldStyle }}
                        value={_formData?.guardianName} onChange={(e: any) => changeFormData('guardianName', e.target.value)}
                    // InputProps={{ readOnly: admissionDetails?.edit }}
                    />
                </div>
                <div className="col-md-3 my-3">
                    <div className="text-muted fs14 mb-1 required">Relationship Type</div>
                    <TextField fullWidth sx={{ ...textFieldStyle }}
                        value={_formData?.guardianRelationshipType} onChange={(e: any) => {
                            const input = e.target.value;
                            const onlyLetters = input.replace(/[^a-zA-Z\s]/g, '');
                            changeFormData('guardianRelationshipType', onlyLetters)
                        }}
                    // InputProps={{ readOnly: admissionDetails?.edit }}
                    />
                </div>
                <div className="col-md-3 my-3">
                    <div className="text-muted fs14 mb-1 required">Mobile Number</div>
                    <TextField fullWidth sx={{ ...textFieldStyle }} type="number" onKeyDown={DisableKeyUpDown}
                        value={_formData?.guardianMobileNumber} onChange={(e: any) => changeFormData('guardianMobileNumber', e.target.value)}
                        // InputProps={{ readOnly: admissionDetails?.edit }}
                        slotProps={{ input: { startAdornment: <span className="fw-bold me-1">+{_countryList?.find((fItem: any) => fItem?.id === Number(_formData?.guardianCountry))?.phoneCode}-</span> } }}
                    />
                </div>
                <div className=""></div>
                <div className="col-md-3 my-3">
                    <div className="text-muted fs14 mb-1">Door No & Street</div>
                    <TextField fullWidth sx={{ ...textFieldStyle }}
                        value={_formData?.guardianAddress} onChange={(e: any) => changeFormData('guardianAddress', e.target.value)}
                    // InputProps={{ readOnly: admissionDetails?.edit }}
                    />
                </div>
                <div className="col-md-3 my-3">
                    <div className="text-muted fs14 mb-1">Place & Area</div>
                    <TextField fullWidth sx={{ ...textFieldStyle }}
                        value={_formData?.guardianPlace} onChange={(e: any) => changeFormData('guardianPlace', e.target.value)}
                    // InputProps={{ readOnly: admissionDetails?.edit }}
                    />
                </div>
                <div className=""></div>
                <div className="col-md-3 my-3">
                    <div className="text-muted fs14 mb-1">Pincode</div>
                    <TextField fullWidth sx={{ ...textFieldStyle }} type="number" onKeyDown={DisableKeyUpDown}
                        value={_formData?.guardianPincode} onChange={(e: any) => changeFormData('guardianPincode', e.target.value)}
                    // InputProps={{ readOnly: admissionDetails?.edit }}
                    />
                </div>
                <div className="col-md-3 my-3">
                    <div className="text-muted fs14 mb-1">Country</div>
                    <CustomAutoSelect value={Number(_formData?.guardianCountry)}
                        onChange={(value: any) => { changeFormData('guardianCountry', value || '') }}
                        menuItem={_countryList?.map((item: any) => {
                            return item?.isActive ? { title: (item?.name || ''), value: item?.id } : null
                        })?.filter(Boolean)} />
                </div>
                <div className="col-md-3 my-3">
                    <div className="text-muted fs14 mb-1">State</div>
                    <CustomAutoSelect value={Number(_formData?.guardianState)}
                        onChange={(value: any) => { changeFormData('guardianState', value || '') }}
                        menuItem={_stateList?.map((item: any) => {
                            return item?.isActive ? { title: (item?.name || ''), value: item?.id } : null
                        })?.filter(Boolean)} />
                </div>
                <div className="col-md-3 my-3">
                    <div className="text-muted fs14 mb-1">City</div>
                    <TextField fullWidth sx={{ ...textFieldStyle }}
                        value={_formData?.guardianCity} onChange={(e: any) => changeFormData('guardianCity', e.target.value)} />
                    {/* <CustomAutoSelect value={Number(_formData?.guardianCity)}
                        onChange={(value: any) => { changeFormData('guardianCity', value || '') }}
                        menuItem={_cityList?.map((item: any) => {
                            return item?.isActive ? { title: (item?.name || ''), value: item?.id } : null
                        })?.filter(Boolean)} /> */}
                </div>
            </div>}
            <div className="mt-4 d-flex align-items-center justify-content-end mobJustify gap-3">
                <Button className="px-4 bg-white text-capitalize" variant="outlined" sx={{ color: "black" }} disabled={_loading} onClick={handleBack}>Back</Button>
                <Button className="px-4" variant="contained" color="primary" disabled={_loading} onClick={handleSubmitForm}>Next</Button>
            </div>
        </div>
    </>
}
