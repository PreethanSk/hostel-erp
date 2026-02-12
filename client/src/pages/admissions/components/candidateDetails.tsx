import { Button, styled, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { CustomAlert, customTableHeader, customTableTemplate, DisableKeyUpDown, textFieldStyle } from "../../../services/HelperService";
import { commonUploadFile, getAllCityByStateCode, getAllCountry, getAllStateByCountryCode, getBranchDetailById, getCandidateDetail, getCandidateDetailSearch, insertUpdateBranchAnyDetails, insertUpdateCandidateAdmissionAnyDetail, insertUpdateCandidateDetails } from "../../../models";
import { validateEmail, validateMobile, validatePinCode, validateMobileNumberUniqueness, validateEmailUniqueness } from "../../../services/ValidationService";
import { CustomAutoSelect } from "../../../components/helpers/CustomSelect";
import { useStateValue } from "../../../providers/StateProvider";
import { ROUTES } from "../../../configs/constants";
import { IMAGES_ICON } from "../../../assets/images/exportImages";
import CustomDialogue from "../../../components/helpers/CustomDialogue";


const Input = styled('input')({ display: 'none', });
export default function CandidateDetails({ handleBack, handleNext }: any) {
    const [{ admissionDetails }, dispatch]: any = useStateValue()
    const refDocument = useRef() as MutableRefObject<HTMLInputElement>;
    const [_countryList, _setCountryList] = useState<any>([])
    const [_stateList, _setStateList] = useState<any>([])
    const [_cityList, _setCityList] = useState<any>([])
    const [_candidateList, _setCandidateList] = useState<any>([])
    const [_searchCandidate, _setSearchCandidate] = useState('')
    const [_selectCandidateType, _setSelectCandidateType] = useState('New Registration')
    const [_loading, _setLoading] = useState(false)
    const [_formData, _setFormData] = useState<any>({
        id: 0, name: "", dob: "", address: "", place: "",
        email: "", isActive: true, mobileNumber: "", pincode: "", city: "", state: 31, country: 101, profilePicture: ""
    })

    const validate = {
        name: { error: false, message: "" },
        dob: { error: false, message: "" },
        email: { error: false, message: "" },
        mobileNumber: { error: false, message: "" },
        address: { error: false, message: "" },
        place: { error: false, message: "" },
        pincode: { error: false, message: "" },
        country: { error: false, message: "" },
        state: { error: false, message: "" },
        city: { error: false, message: "" },
    }
    const [_validate, _setValidate] = useState(validate);

    const changeFormData = (key: string, value: any) => {
        const newForm = { ..._formData, [key]: value };
        if (key === "country") {
            newForm.state = "";
            newForm.city = "";
        } else if (key === "state") {
            newForm.city = "";
        }
        _setFormData(newForm);
        _setFormData({ ..._formData, [key]: value });
    }

    const handleClearForm = () => {
        _setFormData({
            id: 0, name: "", dob: "", address: "", place: "",
            email: "", isActive: true, mobileNumber: "", pincode: "", city: "", state: 31, country: 101
        });
    }

    const handleUserType = (value: string) => {
        _setSelectCandidateType(value)
        handleClearForm()
    }

    const onUpload = async (files: any) => {
        _setLoading(true)
        const formData = new FormData();
        formData.append('file', files[0]);
        await commonUploadFile(formData)
            .then((response) => {
                if (response.status === 200) {
                    changeFormData("profilePicture", response?.data?.file)
                    if (refDocument.current) {
                        refDocument.current.value = "";
                    }
                }
            })
            .catch(error => { console.log(error.response); })
            .finally(() => _setLoading(false))
    }

    const checkValidation = async () => {
        let valid = true;
        const validation = { ...validate }

        if (!_formData?.name?.trim()) {
            validation.name.error = true;
            validation.name.message = "Required Field";
            valid = false;
        }

        if (!_formData?.dob?.trim()) {
            validation.dob.error = true;
            validation.dob.message = "Required Field";
            valid = false;
        }
        if (!_formData?.email?.trim()) {
            validation.email.error = true;
            validation.email.message = "Required Field";
            valid = false;
        }
        if (_formData?.email?.trim() && !validateEmail(_formData?.email)) {
            validation.email.error = true;
            validation.email.message = "Enter valid email id";
            valid = false;
        }
        if (!_formData?.mobileNumber?.trim()) {
            validation.mobileNumber.error = true;
            validation.mobileNumber.message = "Required Field";
            valid = false;
        }
        if (_formData?.mobileNumber?.trim() && !validateMobile(_formData?.mobileNumber)) {
            validation.mobileNumber.error = true;
            validation.mobileNumber.message = "Enter valid mobile number";
            valid = false;
        }

        if (valid && _formData?.mobileNumber?.trim() && validateMobile(_formData?.mobileNumber)) {
            const candidateId = _formData?.id || admissionDetails?.admissionDetails?.candidateRefId;
            if (candidateId) {
                const uniquenessResult = await validateMobileNumberUniqueness(
                    candidateId,
                    _formData.mobileNumber,
                    _formData?.id || undefined,
                    'candidate_details'
                );

                if (!uniquenessResult.isValid) {
                    validation.mobileNumber.error = true;
                    validation.mobileNumber.message = uniquenessResult.message;
                    valid = false;
                }
            }
        }


        if (valid && _formData?.email?.trim() && validateEmail(_formData?.email)) {
            const candidateId = _formData?.id || admissionDetails?.admissionDetails?.candidateRefId;
            if (candidateId) {
                const uniquenessResult = await validateEmailUniqueness(
                    candidateId,
                    _formData.email,
                    _formData?.id || undefined
                );

                if (!uniquenessResult.isValid) {
                    validation.email.error = true;
                    validation.email.message = uniquenessResult.message;
                    valid = false;
                }
            }
        }

        if (!_formData?.place?.trim()) {
            validation.place.error = true;
            validation.place.message = "Required Field";
            valid = false;
        }
        if (!_formData?.address?.trim()) {
            validation.address.error = true;
            validation.address.message = "Required Field";
            valid = false;
        }
        if (!_formData?.pincode?.trim()) {
            validation.pincode.error = true;
            validation.pincode.message = "Required Field";
            valid = false;
        }
        if (_formData?.pincode?.trim() && !validatePinCode(_formData?.pincode)) {
            validation.pincode.error = true;
            validation.pincode.message = "Enter valid pincode number";
            valid = false;
        }
        if (!_formData?.country) {
            validation.country.error = true;
            validation.country.message = "Required Field";
            valid = false;
        }
        if (!_formData?.state) {
            validation.state.error = true;
            validation.state.message = "Required Field";
            valid = false;
        }
        if (!_formData?.city) {
            validation.city.error = true;
            validation.city.message = "Required Field";
            valid = false;
        }
        if (!_formData?.profilePicture) {
            CustomAlert('warning', 'Candidate photo required')
            valid = false;
        }
        _setValidate(validation);
        return valid;
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

    const handleUpdateBranchTotalCots = () => {
        getBranchDetailById(admissionDetails?.admissionDetails?.branchRefId)
            .then((resp) => {
                if (resp?.data?.status) {
                    const branchDetail = resp?.data?.result || {}
                    const cotArr = branchDetail?.cotOccupied?.split(',').filter(Boolean) || []
                    if (!cotArr?.includes(admissionDetails?.admissionDetails?.cotRefId + '')) {
                        cotArr?.push(admissionDetails?.admissionDetails?.cotRefId + '')
                    }
                    const body = {
                        id: admissionDetails?.admissionDetails?.branchRefId,
                        cotOccupied: cotArr?.join(','),
                        cotVacant: branchDetail?.totalCots?.split(',').filter(Boolean)?.filter((item: any) => !cotArr?.includes(item))?.join(',')
                    }
                    insertUpdateBranchAnyDetails(body)
                        .then((resp) => {
                            if (resp?.data?.status === "success") {
                            }
                        })
                        .catch((err) => console.log(err))
                }
            })
            .catch((err) => console.log(err))

    }

    const handleSubmitForm = async () => {

        if (!(await checkValidation())) {
            return;
        }

        _setLoading(true);
        const body = {
            id: _formData?.id || 0,
            name: _formData?.name || "",
            dob: _formData?.dob || "",
            address: _formData?.address || "",
            place: _formData?.place || '',
            email: _formData?.email || '',
            isActive: _formData?.isActive || false,
            mobileNumber: _formData?.mobileNumber || "",
            pincode: _formData?.pincode || "",
            city: _formData?.city + "",
            state: _formData?.state + "",
            country: _formData?.country + "",
            profilePicture: _formData?.profilePicture + "",
        }

        insertUpdateCandidateDetails(body)
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    if (body?.id === 0) {
                        body.id = resp?.data?.result?.insertedId
                    }
                    if (!admissionDetails?.edit) {
                        handleUpdateBranchTotalCots()
                    }

                    dispatch({
                        type: "SET_ADMISSION_DETAILS",
                        data: { ...admissionDetails, admissionDetails: { ...admissionDetails?.admissionDetails, candidateRefId: body.id || 0 }, candidateDetails: body }
                    })

                    const admissionBody = { id: admissionDetails?.admissionDetails?.id, candidateRefId: body?.id }
                    insertUpdateCandidateAdmissionAnyDetail(admissionBody)
                        .then((resp) => {
                            if (resp?.data?.status === "success") {
                                console.log(resp?.data?.result)
                                handleNext()
                                CustomAlert("success", body?.id === 0 ? "Candidate details saved" : "Candidate details updated");
                                _setValidate(validate)
                            }
                        })
                        .catch((err) => {
                            console.log(err)
                            CustomAlert("warning", err?.response?.data?.error)
                        })
                }
            })
            .catch(console.log)
            .finally(() => _setLoading(false));
    }

    const handleSelectCandidate = (item: any) => {
        _setFormData({ ...item })
        _setCandidateList([])
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

    const getCandidateData = (id: number) => {
        getCandidateDetail(id)
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    _setFormData({ ...resp?.data?.result });
                }
            })
            .catch(console.log)
    }

    useEffect(() => {
        if (_formData?.country) {
            getAllStateByCountryCode(Number(_formData?.country || '0'))
                .then((resp) => {
                    if (resp?.data?.status === "success") {
                        _setStateList(resp?.data?.result);
                    }
                })
                .catch(console.log)
        }
    }, [_formData?.country])
    useEffect(() => {
        if (_formData?.state) {
            getAllCityByStateCode(Number(_formData?.state || '0'))
                .then((resp) => {
                    if (resp?.data?.status === "success") {
                        _setCityList(resp?.data?.result);
                    }
                })
                .catch(console.log)
        }
    }, [_formData?.state])

    useEffect(() => {
        if (admissionDetails) {
            if (admissionDetails?.admissionDetails?.candidateRefId) {
                getCandidateData(admissionDetails?.admissionDetails?.candidateRefId)
            }
            // if (admissionDetails?.candidateDetails) {
            //     _setFormData({ ...admissionDetails?.candidateDetails })
            // } else {
            // }
        }
        getOtherList()
    }, [admissionDetails])

    const [_mobileValidationStatus, _setMobileValidationStatus] = useState<{
        isValid: boolean;
        message: string;
        isChecking: boolean;
    }>({ isValid: true, message: '', isChecking: false });

    const [_emailValidationStatus, _setEmailValidationStatus] = useState<{
        isValid: boolean;
        message: string;
        isChecking: boolean;
    }>({ isValid: true, message: '', isChecking: false });

    const handleMobileNumberChange = async (value: string) => {
        changeFormData('mobileNumber', value);


        if (!value.trim()) {
            _setMobileValidationStatus({ isValid: true, message: '', isChecking: false });
            return;
        }


        if (validateMobile(value)) {
            _setMobileValidationStatus({ isValid: true, message: '', isChecking: true });

            const candidateId = _formData?.id || admissionDetails?.admissionDetails?.candidateRefId;
            if (candidateId) {
                try {
                    const uniquenessResult = await validateMobileNumberUniqueness(
                        candidateId,
                        value,
                        _formData?.id || undefined,
                        'candidate_details'
                    );

                    _setMobileValidationStatus({
                        isValid: uniquenessResult.isValid,
                        message: uniquenessResult.message,
                        isChecking: false
                    });
                } catch (error) {
                    _setMobileValidationStatus({
                        isValid: true,
                        message: '',
                        isChecking: false
                    });
                }
            } else {
                _setMobileValidationStatus({ isValid: true, message: '', isChecking: false });
            }
        } else {
            _setMobileValidationStatus({ isValid: true, message: '', isChecking: false });
        }
    };

    const handleEmailChange = async (value: string) => {
        changeFormData('email', value);


        if (!value.trim()) {
            _setEmailValidationStatus({ isValid: true, message: '', isChecking: false });
            return;
        }

        // Check email format first
        if (!validateEmail(value)) {
            _setEmailValidationStatus({
                isValid: false,
                message: 'Please enter a valid email address (e.g., something@example.com)',
                isChecking: false
            });
            return;
        }

        // If email format is valid, check uniqueness
        _setEmailValidationStatus({ isValid: true, message: '', isChecking: true });

        const candidateId = _formData?.id || admissionDetails?.admissionDetails?.candidateRefId;
        if (candidateId) {
            try {
                const uniquenessResult = await validateEmailUniqueness(
                    candidateId,
                    value,
                    _formData?.id || undefined
                );

                _setEmailValidationStatus({
                    isValid: uniquenessResult.isValid,
                    message: uniquenessResult.message,
                    isChecking: false
                });
            } catch (error) {
                _setEmailValidationStatus({
                    isValid: false,
                    message: 'Email validation service is currently unavailable. Please try again later.',
                    isChecking: false
                });
            }
        } else {
            _setEmailValidationStatus({ isValid: true, message: '', isChecking: false });
        }
    };

    return <>
        <div className="">
            <div className="row">
                <div className="fw-bold">Personal Information</div>
                {!admissionDetails?.edit && <>
                    <div className="col-md-3 my-2">
                        <div className="text-muted fs14 mb-1">Select Type</div>
                        <CustomAutoSelect value={_selectCandidateType}
                            onChange={(value: any) => handleUserType(value)}
                            placeholder="Type"
                            menuItem={['Registered', 'New Registration']?.map((item: any) => {
                                return { title: item, value: item }
                            })?.filter(Boolean)} />
                    </div>
                    {_selectCandidateType === "Registered" && <div className="row align-items-center">
                        <div className="col-md-5 my-3">
                            <TextField fullWidth sx={{ ...textFieldStyle }} placeholder="Search Candidate by Id / Name / Email / Mobile"
                                value={_searchCandidate} onChange={(e: any) => _setSearchCandidate(e.target.value)} />
                        </div>
                        <div className="col-md-2 my-3">
                            <Button variant="contained" className="px-3" color="primary" disabled={_loading} onClick={handleSearchCandidate}>Search</Button>
                        </div>
                    </div>
                    }
                    <hr />
                </>}
                <>
                    <div className="col-md-9">
                        <div className="row my-2">
                            <div className="col-md-4 my-3">
                                <div className="text-muted fs14 mb-1 required">Name</div>
                                <TextField fullWidth sx={{ ...textFieldStyle, border: "none" }}
                                    value={_formData?.name} onChange={(e: any) => changeFormData('name', e.target.value)}
                                    // InputProps={{ readOnly: admissionDetails?.edit }}
                                    error={_validate?.name?.error} helperText={_validate?.name?.message} />
                            </div>
                            {_formData?.candidateId && <div className="col-md-4 my-3">
                                <div className="text-muted fs14 mb-1 required">Candidate Id</div>
                                <div className="">#{_formData?.candidateId}</div>
                            </div>}
                            <div className=""></div>
                            <div className="col-md-4 my-3">
                                <div className="text-muted fs14 mb-1 required">Date of Birth</div>
                                <TextField fullWidth sx={{ ...textFieldStyle }} type="date" onKeyDown={DisableKeyUpDown}
                                    value={_formData?.dob} onChange={(e: any) => changeFormData('dob', e.target.value)}
                                    // InputProps={{ readOnly: admissionDetails?.edit }}
                                    error={_validate?.dob?.error} helperText={_validate?.dob?.message} />
                            </div>
                            <div className="col-md-4 my-3">
                                <div className="text-muted fs14 mb-1 required">Mobile Number</div>
                                <TextField fullWidth sx={{ ...textFieldStyle }} type="number" onKeyDown={DisableKeyUpDown}
                                    value={_formData?.mobileNumber} onChange={(e: any) => handleMobileNumberChange(e.target.value)}
                                    // InputProps={{ readOnly: admissionDetails?.edit }}
                                    slotProps={{
                                        input: {
                                            startAdornment: <span className="fw-bold me-1">+{_countryList?.find((fItem: any) => fItem?.id === Number(_formData?.country))?.phoneCode}-</span>,
                                            endAdornment: _formData?.mobileNumber ? (
                                                <span className="ms-2">
                                                    {_mobileValidationStatus.isChecking ? (
                                                        <span style={{ color: '#ff9800', fontSize: '16px' }}>⟳</span>
                                                    ) : _mobileValidationStatus.isValid ? (
                                                        <span style={{ color: '#4caf50', fontSize: '16px' }}>✓</span>
                                                    ) : (
                                                        <span style={{ color: '#f44336', fontSize: '16px' }}>✕</span>
                                                    )}
                                                </span>
                                            ) : null
                                        }
                                    }}
                                    error={_validate?.mobileNumber?.error || (!_mobileValidationStatus.isValid && _formData?.mobileNumber)}
                                    helperText={_validate?.mobileNumber?.message || (_mobileValidationStatus.message && !_mobileValidationStatus.isValid ? _mobileValidationStatus.message : '')} />
                            </div>
                            <div className="col-md-4 my-3">
                                <div className="text-muted fs14 mb-1 required">Email Address</div>
                                <TextField fullWidth sx={{ ...textFieldStyle }}
                                    value={_formData?.email} onChange={(e: any) => handleEmailChange(e.target.value)}
                                    // InputProps={{ readOnly: admissionDetails?.edit }}
                                    slotProps={{
                                        input: {
                                            endAdornment: _formData?.email ? (
                                                <span className="ms-2">
                                                    {_emailValidationStatus.isChecking ? (
                                                        <span style={{ color: '#ff9800', fontSize: '16px' }}>⟳</span>
                                                    ) : _emailValidationStatus.isValid ? (
                                                        <span style={{ color: '#4caf50', fontSize: '16px' }}>✓</span>
                                                    ) : (
                                                        <span style={{ color: '#f44336', fontSize: '16px' }}>✕</span>
                                                    )}
                                                </span>
                                            ) : null
                                        }
                                    }}
                                    error={_validate?.email?.error || (!_emailValidationStatus.isValid && _formData?.email)}
                                    helperText={_validate?.email?.message || (_emailValidationStatus.message && !_emailValidationStatus.isValid ? _emailValidationStatus.message : '')} />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 my-2">
                        <div className={`mb-1 fw-bold text-dark text-center required`}>Candidate Photo</div>
                        <div className="text-center">
                            <Button onClick={() => refDocument.current?.click()} className="p-0 border-0 bg-transparent">
                                {_formData?.profilePicture ?
                                    <img src={ROUTES.API.DOWNLOAD_FILE + _formData?.profilePicture} alt="Profile" draggable={false}
                                        style={{ height: "152px" }} width={160} className="imageFit rounded-circle" /> :
                                    <div
                                        style={{ height: "152px", width: 160, background: "#989898" }} className="imageFit rounded-circle" />}
                                <div className={`fs14 fw-bold text-dark text-decoration-underline w-75 text-truncate`}>{!_formData?.profilePicture ? 'Upload Profile' : 'Change Profile'}</div>
                            </Button>
                            <Input style={{ visibility: 'hidden' }} accept={'image/*'} type="file" ref={refDocument} onChange={(e: any) => onUpload(e.target.files)} />
                        </div>
                    </div>
                    <hr />
                    <div className="fw-bold">Address</div>
                    <div className=""></div>
                    <div className="col-md-3 my-3">
                        <div className="text-muted fs14 mb-1 required">Door No & Street</div>
                        <TextField fullWidth sx={{ ...textFieldStyle }}
                            value={_formData?.address} onChange={(e: any) => changeFormData('address', e.target.value)}
                            // InputProps={{ readOnly: admissionDetails?.edit }}
                            error={_validate?.address?.error} helperText={_validate?.address?.message} />
                    </div>
                    <div className="col-md-3 my-3">
                        <div className="text-muted fs14 mb-1 required">Place & Area</div>
                        <TextField fullWidth sx={{ ...textFieldStyle }}
                            value={_formData?.place} onChange={(e: any) => changeFormData('place', e.target.value)}
                            // InputProps={{ readOnly: admissionDetails?.edit }}
                            error={_validate?.place?.error} helperText={_validate?.place?.message} />
                    </div>
                    <div className=""></div>
                    <div className="col-md-3 my-3">
                        <div className="text-muted fs14 mb-1 required">Pincode</div>
                        <TextField fullWidth sx={{ ...textFieldStyle }} type="number" onKeyDown={DisableKeyUpDown}
                            value={_formData?.pincode} onChange={(e: any) => changeFormData('pincode', e.target.value)}
                            // InputProps={{ readOnly: admissionDetails?.edit }}
                            error={_validate?.pincode?.error} helperText={_validate?.pincode?.message} />
                    </div>
                    <div className="col-md-3 my-3">
                        <div className="text-muted fs14 mb-1">Country</div>
                        <CustomAutoSelect value={Number(_formData?.country)}
                            onChange={(value: any) => { changeFormData('country', value || '') }}
                            menuItem={_countryList?.map((item: any) => {
                                return item?.isActive ? { title: (item?.name || ''), value: item?.id } : null
                            })?.filter(Boolean)} />
                    </div>
                    <div className="col-md-3 my-3">
                        <div className="text-muted fs14 mb-1">State</div>
                        <CustomAutoSelect value={Number(_formData?.state)}
                            onChange={(value: any) => { changeFormData('state', value || '') }}
                            menuItem={_stateList?.map((item: any) => {
                                return item?.isActive ? { title: (item?.name || ''), value: item?.id } : null
                            })?.filter(Boolean)} />
                    </div>
                    <div className="col-md-3 my-3">
                        <div className="text-muted fs14 mb-1 required">City</div>
                        <TextField fullWidth sx={{ ...textFieldStyle }}
                            value={_formData?.city} onChange={(e: any) => changeFormData('city', e.target.value)}
                            error={_validate?.city?.error} helperText={_validate?.city?.message} />
                        {/* <CustomAutoSelect value={Number(_formData?.city)}
                            error={_validate.city.error}
                            helperText={_validate.city.message}
                            onChange={(value: any) => { changeFormData('city', value || '') }}
                            menuItem={_cityList?.map((item: any) => {
                                return item?.isActive ? { title: (item?.name || ''), value: item?.id } : null
                            })?.filter(Boolean)} /> */}
                    </div>
                </>
                <div className="mt-4 d-flex align-items-center justify-content-end mobJustify gap-3">
                    <Button className="px-4 bg-white text-capitalize" variant="outlined" sx={{ color: "black" }} disabled={_loading} onClick={handleBack}>Back</Button>
                    <Button className="px-4" variant="contained" color="primary" disabled={_loading} onClick={handleSubmitForm}>Next</Button>
                </div>
            </div>
        </div>
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
    </>
}
