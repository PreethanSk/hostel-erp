import { Button, styled, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Box, Divider, CircularProgress } from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { CustomAlert, DisableKeyUpDown } from "../../../services/HelperService";
import { commonUploadFile, getAllCityByStateCode, getAllCountry, getAllStateByCountryCode, getBranchDetailById, getCandidateDetail, getCandidateDetailSearch, insertUpdateBranchAnyDetails, insertUpdateCandidateAdmissionAnyDetail, insertUpdateCandidateDetails } from "../../../models";
import { validateEmail, validateMobile, validatePinCode, validateMobileNumberUniqueness, validateEmailUniqueness } from "../../../services/ValidationService";
import { CustomAutoSelect } from "../../../components/helpers/CustomSelect";
import { useStateValue } from "../../../providers/StateProvider";
import { ROUTES } from "../../../configs/constants";
import { Upload, Check, X, RotateCw } from "lucide-react";
import FormField from "../../../components/shared/FormField";
import DialogModal from "../../../components/shared/DialogModal";
import { gray } from "../../../theme/tokens";

const Input = styled('input')({ display: 'none' });

export default function CandidateDetails({ handleBack, handleNext }: any) {
    const [{ admissionDetails }, dispatch]: any = useStateValue();
    const refDocument = useRef() as MutableRefObject<HTMLInputElement>;
    const [_countryList, _setCountryList] = useState<any>([]);
    const [_stateList, _setStateList] = useState<any>([]);
    const [_cityList, _setCityList] = useState<any>([]);
    const [_candidateList, _setCandidateList] = useState<any>([]);
    const [_searchCandidate, _setSearchCandidate] = useState('');
    const [_selectCandidateType, _setSelectCandidateType] = useState('New Registration');
    const [_loading, _setLoading] = useState(false);
    const [_formData, _setFormData] = useState<any>({
        id: 0, name: "", dob: "", address: "", place: "",
        email: "", isActive: true, mobileNumber: "", pincode: "", city: "", state: 31, country: 101, profilePicture: ""
    });

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
    };
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
    };

    const handleClearForm = () => {
        _setFormData({
            id: 0, name: "", dob: "", address: "", place: "",
            email: "", isActive: true, mobileNumber: "", pincode: "", city: "", state: 31, country: 101
        });
    };

    const handleUserType = (value: string) => {
        _setSelectCandidateType(value);
        handleClearForm();
    };

    const onUpload = async (files: any) => {
        _setLoading(true);
        const formData = new FormData();
        formData.append('file', files[0]);
        await commonUploadFile(formData)
            .then((response) => {
                if (response.status === 200) {
                    changeFormData("profilePicture", response?.data?.file);
                    if (refDocument.current) {
                        refDocument.current.value = "";
                    }
                }
            })
            .catch(error => { console.log(error.response); })
            .finally(() => _setLoading(false));
    };

    const checkValidation = async () => {
        let valid = true;
        const validation = { ...validate };

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
                    candidateId, _formData.mobileNumber, _formData?.id || undefined, 'candidate_details'
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
                    candidateId, _formData.email, _formData?.id || undefined
                );
                if (!uniquenessResult.isValid) {
                    validation.email.error = true;
                    validation.email.message = uniquenessResult.message;
                    valid = false;
                }
            }
        }

        if (!_formData?.place?.trim()) { validation.place.error = true; validation.place.message = "Required Field"; valid = false; }
        if (!_formData?.address?.trim()) { validation.address.error = true; validation.address.message = "Required Field"; valid = false; }
        if (!_formData?.pincode?.trim()) { validation.pincode.error = true; validation.pincode.message = "Required Field"; valid = false; }
        if (_formData?.pincode?.trim() && !validatePinCode(_formData?.pincode)) { validation.pincode.error = true; validation.pincode.message = "Enter valid pincode number"; valid = false; }
        if (!_formData?.country) { validation.country.error = true; validation.country.message = "Required Field"; valid = false; }
        if (!_formData?.state) { validation.state.error = true; validation.state.message = "Required Field"; valid = false; }
        if (!_formData?.city) { validation.city.error = true; validation.city.message = "Required Field"; valid = false; }
        if (!_formData?.profilePicture) { CustomAlert('warning', 'Candidate photo required'); valid = false; }

        _setValidate(validation);
        return valid;
    };

    const handleSearchCandidate = () => {
        if (!_searchCandidate?.trim()) return;
        _setLoading(true);
        getCandidateDetailSearch(_searchCandidate)
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    if (!resp?.data?.result?.length) {
                        CustomAlert("error", "Candidate not found");
                    } else {
                        _setCandidateList([...resp?.data?.result]);
                    }
                }
            })
            .catch((err) => console.log(err))
            .finally(() => _setLoading(false));
    };

    const handleUpdateBranchTotalCots = () => {
        getBranchDetailById(admissionDetails?.admissionDetails?.branchRefId)
            .then((resp) => {
                if (resp?.data?.status) {
                    const branchDetail = resp?.data?.result || {};
                    const cotArr = branchDetail?.cotOccupied?.split(',').filter(Boolean) || [];
                    if (!cotArr?.includes(admissionDetails?.admissionDetails?.cotRefId + '')) {
                        cotArr?.push(admissionDetails?.admissionDetails?.cotRefId + '');
                    }
                    const body = {
                        id: admissionDetails?.admissionDetails?.branchRefId,
                        cotOccupied: cotArr?.join(','),
                        cotVacant: branchDetail?.totalCots?.split(',').filter(Boolean)?.filter((item: any) => !cotArr?.includes(item))?.join(',')
                    };
                    insertUpdateBranchAnyDetails(body).then(() => {}).catch(console.log);
                }
            })
            .catch(console.log);
    };

    const handleSubmitForm = async () => {
        if (!(await checkValidation())) return;
        _setLoading(true);
        const body = {
            id: _formData?.id || 0, name: _formData?.name || "", dob: _formData?.dob || "",
            address: _formData?.address || "", place: _formData?.place || '', email: _formData?.email || '',
            isActive: _formData?.isActive || false, mobileNumber: _formData?.mobileNumber || "",
            pincode: _formData?.pincode || "", city: _formData?.city + "", state: _formData?.state + "",
            country: _formData?.country + "", profilePicture: _formData?.profilePicture + "",
        };

        insertUpdateCandidateDetails(body)
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    if (body?.id === 0) body.id = resp?.data?.result?.insertedId;
                    if (!admissionDetails?.edit) handleUpdateBranchTotalCots();
                    dispatch({
                        type: "SET_ADMISSION_DETAILS",
                        data: { ...admissionDetails, admissionDetails: { ...admissionDetails?.admissionDetails, candidateRefId: body.id || 0 }, candidateDetails: body }
                    });
                    const admissionBody = { id: admissionDetails?.admissionDetails?.id, candidateRefId: body?.id };
                    insertUpdateCandidateAdmissionAnyDetail(admissionBody)
                        .then((resp) => {
                            if (resp?.data?.status === "success") {
                                handleNext();
                                CustomAlert("success", body?.id === 0 ? "Candidate details saved" : "Candidate details updated");
                                _setValidate(validate);
                            }
                        })
                        .catch((err) => { console.log(err); CustomAlert("warning", err?.response?.data?.error); });
                }
            })
            .catch(console.log)
            .finally(() => _setLoading(false));
    };

    const handleSelectCandidate = (item: any) => {
        _setFormData({ ...item });
        _setCandidateList([]);
    };

    const getOtherList = () => {
        getAllCountry()
            .then((resp) => { if (resp?.data?.status === "success") _setCountryList(resp?.data?.result); })
            .catch(console.log);
    };

    const getCandidateData = (id: number) => {
        getCandidateDetail(id)
            .then((resp) => { if (resp?.data?.status === "success") _setFormData({ ...resp?.data?.result }); })
            .catch(console.log);
    };

    useEffect(() => {
        if (_formData?.country) {
            getAllStateByCountryCode(Number(_formData?.country || '0'))
                .then((resp) => { if (resp?.data?.status === "success") _setStateList(resp?.data?.result); })
                .catch(console.log);
        }
    }, [_formData?.country]);

    useEffect(() => {
        if (_formData?.state) {
            getAllCityByStateCode(Number(_formData?.state || '0'))
                .then((resp) => { if (resp?.data?.status === "success") _setCityList(resp?.data?.result); })
                .catch(console.log);
        }
    }, [_formData?.state]);

    useEffect(() => {
        if (admissionDetails) {
            if (admissionDetails?.admissionDetails?.candidateRefId) {
                getCandidateData(admissionDetails?.admissionDetails?.candidateRefId);
            }
        }
        getOtherList();
    }, [admissionDetails]);

    const [_mobileValidationStatus, _setMobileValidationStatus] = useState<{
        isValid: boolean; message: string; isChecking: boolean;
    }>({ isValid: true, message: '', isChecking: false });

    const [_emailValidationStatus, _setEmailValidationStatus] = useState<{
        isValid: boolean; message: string; isChecking: boolean;
    }>({ isValid: true, message: '', isChecking: false });

    const handleMobileNumberChange = async (value: string) => {
        changeFormData('mobileNumber', value);
        if (!value.trim()) { _setMobileValidationStatus({ isValid: true, message: '', isChecking: false }); return; }
        if (validateMobile(value)) {
            _setMobileValidationStatus({ isValid: true, message: '', isChecking: true });
            const candidateId = _formData?.id || admissionDetails?.admissionDetails?.candidateRefId;
            if (candidateId) {
                try {
                    const uniquenessResult = await validateMobileNumberUniqueness(candidateId, value, _formData?.id || undefined, 'candidate_details');
                    _setMobileValidationStatus({ isValid: uniquenessResult.isValid, message: uniquenessResult.message, isChecking: false });
                } catch {
                    _setMobileValidationStatus({ isValid: true, message: '', isChecking: false });
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
        if (!value.trim()) { _setEmailValidationStatus({ isValid: true, message: '', isChecking: false }); return; }
        if (!validateEmail(value)) {
            _setEmailValidationStatus({ isValid: false, message: 'Please enter a valid email address (e.g., something@example.com)', isChecking: false });
            return;
        }
        _setEmailValidationStatus({ isValid: true, message: '', isChecking: true });
        const candidateId = _formData?.id || admissionDetails?.admissionDetails?.candidateRefId;
        if (candidateId) {
            try {
                const uniquenessResult = await validateEmailUniqueness(candidateId, value, _formData?.id || undefined);
                _setEmailValidationStatus({ isValid: uniquenessResult.isValid, message: uniquenessResult.message, isChecking: false });
            } catch {
                _setEmailValidationStatus({ isValid: false, message: 'Email validation service is currently unavailable. Please try again later.', isChecking: false });
            }
        } else {
            _setEmailValidationStatus({ isValid: true, message: '', isChecking: false });
        }
    };

    const ValidationIcon = ({ status }: { status: { isChecking: boolean; isValid: boolean } }) => {
        if (status.isChecking) return <RotateCw size={16} color="#ff9800" style={{ animation: 'spin 1s linear infinite' }} />;
        if (status.isValid) return <Check size={16} color="#4caf50" />;
        return <X size={16} color="#f44336" />;
    };

    return (
        <>
            <Box>
                <Typography sx={{ fontWeight: 600, mb: 1 }}>Personal Information</Typography>

                {!admissionDetails?.edit && (
                    <>
                        <Grid2 container spacing={3}>
                            <Grid2 size={{ xs: 12, md: 3 }}>
                                <FormField label="Select Type">
                                    <CustomAutoSelect value={_selectCandidateType}
                                        onChange={(value: any) => handleUserType(value)}
                                        placeholder="Type"
                                        menuItem={['Registered', 'New Registration']?.map((item: any) => ({ title: item, value: item }))} />
                                </FormField>
                            </Grid2>
                        </Grid2>
                        {_selectCandidateType === "Registered" && (
                            <Grid2 container spacing={3} sx={{ alignItems: 'center' }}>
                                <Grid2 size={{ xs: 12, md: 5 }}>
                                    <TextField fullWidth size="small" placeholder="Search Candidate by Id / Name / Email / Mobile"
                                        value={_searchCandidate} onChange={(e: any) => _setSearchCandidate(e.target.value)} />
                                </Grid2>
                                <Grid2 size={{ xs: 12, md: 2 }}>
                                    <Button variant="contained" color="primary" disabled={_loading} onClick={handleSearchCandidate}
                                        sx={{ textTransform: 'none', px: 3 }}>Search</Button>
                                </Grid2>
                            </Grid2>
                        )}
                        <Divider sx={{ my: 2 }} />
                    </>
                )}

                <Grid2 container spacing={3}>
                    <Grid2 size={{ xs: 12, md: 9 }}>
                        <Grid2 container spacing={3}>
                            <Grid2 size={{ xs: 12, md: 4 }}>
                                <FormField label="Name" required>
                                    <TextField fullWidth size="small"
                                        value={_formData?.name} onChange={(e: any) => changeFormData('name', e.target.value)}
                                        error={_validate?.name?.error} helperText={_validate?.name?.message} />
                                </FormField>
                            </Grid2>
                            {_formData?.candidateId && (
                                <Grid2 size={{ xs: 12, md: 4 }}>
                                    <FormField label="Candidate Id">
                                        <Typography variant="body2">#{_formData?.candidateId}</Typography>
                                    </FormField>
                                </Grid2>
                            )}
                            <Grid2 size={12}><Box /></Grid2>
                            <Grid2 size={{ xs: 12, md: 4 }}>
                                <FormField label="Date of Birth" required>
                                    <TextField fullWidth size="small" type="date" onKeyDown={DisableKeyUpDown}
                                        value={_formData?.dob} onChange={(e: any) => changeFormData('dob', e.target.value)}
                                        error={_validate?.dob?.error} helperText={_validate?.dob?.message} />
                                </FormField>
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 4 }}>
                                <FormField label="Mobile Number" required>
                                    <TextField fullWidth size="small" type="number" onKeyDown={DisableKeyUpDown}
                                        value={_formData?.mobileNumber} onChange={(e: any) => handleMobileNumberChange(e.target.value)}
                                        slotProps={{
                                            input: {
                                                startAdornment: <Typography variant="body2" sx={{ fontWeight: 600, mr: 0.5, whiteSpace: 'nowrap' }}>+{_countryList?.find((fItem: any) => fItem?.id === Number(_formData?.country))?.phoneCode}-</Typography>,
                                                endAdornment: _formData?.mobileNumber ? <ValidationIcon status={_mobileValidationStatus} /> : null
                                            }
                                        }}
                                        error={_validate?.mobileNumber?.error || (!_mobileValidationStatus.isValid && _formData?.mobileNumber)}
                                        helperText={_validate?.mobileNumber?.message || (_mobileValidationStatus.message && !_mobileValidationStatus.isValid ? _mobileValidationStatus.message : '')} />
                                </FormField>
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 4 }}>
                                <FormField label="Email Address" required>
                                    <TextField fullWidth size="small"
                                        value={_formData?.email} onChange={(e: any) => handleEmailChange(e.target.value)}
                                        slotProps={{
                                            input: {
                                                endAdornment: _formData?.email ? <ValidationIcon status={_emailValidationStatus} /> : null
                                            }
                                        }}
                                        error={_validate?.email?.error || (!_emailValidationStatus.isValid && _formData?.email)}
                                        helperText={_validate?.email?.message || (_emailValidationStatus.message && !_emailValidationStatus.isValid ? _emailValidationStatus.message : '')} />
                                </FormField>
                            </Grid2>
                        </Grid2>
                    </Grid2>

                    <Grid2 size={{ xs: 12, md: 3 }}>
                        <FormField label="Candidate Photo" required>
                            <Box sx={{ textAlign: 'center' }}>
                                <Button onClick={() => refDocument.current?.click()} sx={{ p: 0, border: 'none', background: 'transparent', textTransform: 'none' }}>
                                    {_formData?.profilePicture ? (
                                        <img src={ROUTES.API.DOWNLOAD_FILE + _formData?.profilePicture} alt="Profile" draggable={false}
                                            style={{ height: 152, width: 160, objectFit: 'cover', borderRadius: '50%' }} />
                                    ) : (
                                        <Box sx={{ height: 152, width: 160, background: gray[300], borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Upload size={32} color={gray[500]} />
                                        </Box>
                                    )}
                                </Button>
                                <Typography variant="body2" sx={{ fontWeight: 600, textDecoration: 'underline', cursor: 'pointer', mt: 0.5 }}
                                    onClick={() => refDocument.current?.click()}>
                                    {!_formData?.profilePicture ? 'Upload Profile' : 'Change Profile'}
                                </Typography>
                                <Input style={{ visibility: 'hidden' }} accept={'image/*'} type="file" ref={refDocument} onChange={(e: any) => onUpload(e.target.files)} />
                            </Box>
                        </FormField>
                    </Grid2>
                </Grid2>

                <Divider sx={{ my: 2 }} />
                <Typography sx={{ fontWeight: 600, mb: 1 }}>Address</Typography>

                <Grid2 container spacing={3}>
                    <Grid2 size={{ xs: 12, md: 3 }}>
                        <FormField label="Door No & Street" required>
                            <TextField fullWidth size="small"
                                value={_formData?.address} onChange={(e: any) => changeFormData('address', e.target.value)}
                                error={_validate?.address?.error} helperText={_validate?.address?.message} />
                        </FormField>
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 3 }}>
                        <FormField label="Place & Area" required>
                            <TextField fullWidth size="small"
                                value={_formData?.place} onChange={(e: any) => changeFormData('place', e.target.value)}
                                error={_validate?.place?.error} helperText={_validate?.place?.message} />
                        </FormField>
                    </Grid2>
                    <Grid2 size={12}><Box /></Grid2>
                    <Grid2 size={{ xs: 12, md: 3 }}>
                        <FormField label="Pincode" required>
                            <TextField fullWidth size="small" type="number" onKeyDown={DisableKeyUpDown}
                                value={_formData?.pincode} onChange={(e: any) => changeFormData('pincode', e.target.value)}
                                error={_validate?.pincode?.error} helperText={_validate?.pincode?.message} />
                        </FormField>
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 3 }}>
                        <FormField label="Country">
                            <CustomAutoSelect value={Number(_formData?.country)}
                                onChange={(value: any) => changeFormData('country', value || '')}
                                menuItem={_countryList?.map((item: any) => item?.isActive ? { title: (item?.name || ''), value: item?.id } : null)?.filter(Boolean)} />
                        </FormField>
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 3 }}>
                        <FormField label="State">
                            <CustomAutoSelect value={Number(_formData?.state)}
                                onChange={(value: any) => changeFormData('state', value || '')}
                                menuItem={_stateList?.map((item: any) => item?.isActive ? { title: (item?.name || ''), value: item?.id } : null)?.filter(Boolean)} />
                        </FormField>
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 3 }}>
                        <FormField label="City" required>
                            <TextField fullWidth size="small"
                                value={_formData?.city} onChange={(e: any) => changeFormData('city', e.target.value)}
                                error={_validate?.city?.error} helperText={_validate?.city?.message} />
                        </FormField>
                    </Grid2>
                </Grid2>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                    <Button variant="outlined" disabled={_loading} onClick={handleBack}
                        sx={{ textTransform: 'none', px: 4, color: 'black', borderColor: gray[300] }}>Back</Button>
                    <Button variant="contained" color="primary" disabled={_loading} onClick={handleSubmitForm}
                        sx={{ textTransform: 'none', px: 4 }}>Next</Button>
                </Box>
            </Box>

            <DialogModal open={_candidateList?.length > 0} onClose={() => _setCandidateList([])}
                title="Select Candidate" maxWidth="md">
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}></TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Candidate Id</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {_candidateList?.map((item: any, index: number) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Button size="small" variant="outlined" color="secondary" onClick={() => handleSelectCandidate(item)}
                                            sx={{ textTransform: 'none' }}>Select</Button>
                                    </TableCell>
                                    <TableCell sx={{ color: gray[500] }}>{item?.candidateId}</TableCell>
                                    <TableCell sx={{ color: gray[500] }}>{item?.name}</TableCell>
                                    <TableCell sx={{ color: gray[500] }}>{item?.email}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogModal>
        </>
    );
}
