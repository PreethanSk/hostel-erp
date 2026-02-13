import { useEffect, useState } from 'react';
import { useStateValue } from '../../../providers/StateProvider';
import { CustomAlert, DisableKeyUpDown } from '../../../services/HelperService';
import { Button, FormControlLabel, Radio, RadioGroup, TextField, Typography, Box, Divider, IconButton } from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import { CustomAutoSelect } from '../../../components/helpers/CustomSelect';
import { getAllCityByStateCode, getAllCountry, getAllStateByCountryCode, getCandidateContactPerson, insertUpdateCandidateContactPerson } from '../../../models';
import { validateMobile, validatePinCode, validateMobileNumberUniqueness } from '../../../services/ValidationService';
import { PlusCircle, MinusCircle } from 'lucide-react';
import FormField from '../../../components/shared/FormField';
import { gray } from '../../../theme/tokens';

export default function ContactPerson({ handleBack, handleNext }: any) {
    const [{ admissionDetails }]: any = useStateValue();
    const [_loading, _setLoading] = useState(false);
    const [_addSecond, _setAddSecond] = useState(false);
    const [_countryList, _setCountryList] = useState<any>([]);
    const [_stateList, _setStateList] = useState<any>([]);
    const [_cityList, _setCityList] = useState<any>([]);
    const [_formData, _setFormData] = useState<any>({
        id: 0, admissionRefId: 0, candidateRefId: 0,
        name: "", relationshipType: "", mobileNumber: "",
        name2: "", relationshipType2: "", mobileNumber2: "",
        localGuardianStatus: true,
        guardianName: "", guardianMobileNumber: "", guardianRelationshipType: "",
        guardianAddress: "", guardianPlace: "", guardianCity: "", guardianPincode: "",
        guardianState: 31, guardianCountry: 101, isActive: true
    });

    const changeFormData = (key: string, value: any) => {
        const newForm = { ..._formData, [key]: value };
        if (key === "guardianCountry") { newForm.guardianState = ""; newForm.guardianCity = ""; }
        else if (key === "guardianState") { newForm.guardianCity = ""; }
        _setFormData(newForm);
        _setFormData({ ..._formData, [key]: value });
    };

    const checkValidation = async () => {
        if (!_formData?.relationshipType) { CustomAlert("warning", "Relationship Type required"); return false; }
        if (!_formData?.name) { CustomAlert("warning", "Name required"); return false; }
        if (!_formData?.mobileNumber) { CustomAlert("warning", "Mobile number required"); return false; }
        if (_formData?.mobileNumber && !validateMobile(_formData?.mobileNumber)) { CustomAlert("warning", "Invalid mobile number"); return false; }

        if (_formData?.mobileNumber && validateMobile(_formData?.mobileNumber)) {
            const candidateId = admissionDetails?.admissionDetails?.candidateRefId;
            if (candidateId) {
                const uniquenessResult = await validateMobileNumberUniqueness(candidateId, _formData.mobileNumber, _formData?.id || undefined, 'contact_person');
                if (!uniquenessResult.isValid) { CustomAlert("warning", uniquenessResult.message); return false; }
            }
        }

        if (_addSecond) {
            if (!_formData?.relationshipType2) { CustomAlert("warning", "Relationship Type required"); return false; }
            if (!_formData?.name2) { CustomAlert("warning", "Name required"); return false; }
            if (!_formData?.mobileNumber2) { CustomAlert("warning", "Mobile number required"); return false; }
            if (_formData?.mobileNumber2 && !validateMobile(_formData?.mobileNumber2)) { CustomAlert("warning", "Invalid mobile number"); return false; }
        }

        if (_formData?.localGuardianStatus) {
            if (!_formData?.guardianName) { CustomAlert("warning", "Guardian Name required"); return false; }
            if (!_formData?.guardianRelationshipType) { CustomAlert("warning", "Guardian Relationship Type required"); return false; }
            if (!_formData?.guardianMobileNumber) { CustomAlert("warning", "Guardian Mobile Number required"); return false; }
            if (_formData?.guardianMobileNumber?.trim() && !validateMobile(_formData?.guardianMobileNumber)) { CustomAlert("warning", "Enter valid mobile number"); return false; }
            if (!_formData?.guardianAddress) { CustomAlert("warning", "Guardian Address required"); return false; }
            if (!_formData?.guardianPlace) { CustomAlert("warning", "Guardian Place required"); return false; }
            if (!_formData?.guardianPincode) { CustomAlert("warning", "Guardian Pincode required"); return false; }
            if (_formData?.guardianPincode?.trim() && !validatePinCode(_formData?.guardianPincode)) { CustomAlert("warning", "Enter valid pincode"); return false; }
            if (!_formData?.guardianCountry) { CustomAlert("warning", "Guardian Country required"); return false; }
            if (!_formData?.guardianState) { CustomAlert("warning", "Guardian State required"); return false; }
            if (!_formData?.guardianCity) { CustomAlert("warning", "Guardian City required"); return false; }
        }
        return true;
    };

    const handleSubmitForm = async () => {
        _setLoading(true);
        if (!(await checkValidation())) { _setLoading(false); return; }
        const body = {
            ..._formData,
            admissionRefId: admissionDetails?.admissionDetails?.id || 0,
            candidateRefId: admissionDetails?.admissionDetails?.candidateRefId || 0,
        };
        insertUpdateCandidateContactPerson(body)
            .then((resp) => { if (resp?.data?.status === "success") { CustomAlert("success", "Contact person details saved"); handleNext(); } })
            .catch(console.log)
            .finally(() => _setLoading(false));
    };

    const getContactPersonDetails = () => {
        getCandidateContactPerson(admissionDetails?.admissionDetails?.candidateRefId)
            .then((resp) => { if (resp?.data?.status === "success" && resp?.data?.result) _setFormData({ ...resp?.data?.result }); })
            .catch(console.log);
    };

    const getOtherList = () => {
        getAllCountry()
            .then((resp) => { if (resp?.data?.status === "success") _setCountryList(resp?.data?.result); })
            .catch(console.log);
    };

    useEffect(() => { getOtherList(); getContactPersonDetails(); }, []);

    useEffect(() => {
        if (_formData?.guardianCountry) {
            getAllStateByCountryCode(Number(_formData?.guardianCountry || '0'))
                .then((resp) => { if (resp?.data?.status === "success") _setStateList(resp?.data?.result); })
                .catch(console.log);
        }
    }, [_formData?.guardianCountry]);

    useEffect(() => {
        if (_formData?.guardianState) {
            getAllCityByStateCode(Number(_formData?.guardianState || '0'))
                .then((resp) => { if (resp?.data?.status === "success") _setCityList(resp?.data?.result); })
                .catch(console.log);
        }
    }, [_formData?.guardianState]);

    return (
        <Box>
            <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Home Contact Information</Typography>
            <Typography variant="body2" sx={{ color: gray[500], mb: 2 }}>
                Provide Home Person Relationship Type, Name, Mobile No who stays in home
            </Typography>

            <Grid2 container spacing={3}>
                <Grid2 size={{ xs: 12, md: 3 }}>
                    <FormField label="Relationship Type" required>
                        <TextField fullWidth size="small"
                            value={_formData?.relationshipType} onChange={(e: any) => {
                                const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                changeFormData('relationshipType', onlyLetters);
                            }} />
                    </FormField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 3 }}>
                    <FormField label="Name" required>
                        <TextField fullWidth size="small"
                            value={_formData?.name} onChange={(e: any) => {
                                const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                changeFormData('name', onlyLetters);
                            }} />
                    </FormField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 3 }}>
                    <FormField label="Mobile Number" required>
                        <TextField fullWidth size="small" type="number" onKeyDown={DisableKeyUpDown}
                            value={_formData?.mobileNumber} onChange={(e: any) => changeFormData('mobileNumber', e.target.value)} />
                    </FormField>
                </Grid2>
                {!_addSecond && _formData?.relationshipType2?.length === 0 && (
                    <Grid2 size={{ xs: 12, md: 3 }} sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton color="primary" onClick={() => _setAddSecond(true)}>
                            <PlusCircle size={24} />
                        </IconButton>
                    </Grid2>
                )}
            </Grid2>

            {(_addSecond || _formData?.relationshipType2?.length > 0) && (
                <Grid2 container spacing={3}>
                    <Grid2 size={{ xs: 12, md: 3 }}>
                        <FormField label="Relationship Type" required>
                            <TextField fullWidth size="small"
                                value={_formData?.relationshipType2} onChange={(e: any) => {
                                    const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                    changeFormData('relationshipType2', onlyLetters);
                                }} />
                        </FormField>
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 3 }}>
                        <FormField label="Name" required>
                            <TextField fullWidth size="small"
                                value={_formData?.name2} onChange={(e: any) => {
                                    const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                    changeFormData('name2', onlyLetters);
                                }} />
                        </FormField>
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 3 }}>
                        <FormField label="Mobile Number" required>
                            <TextField fullWidth size="small" type="number" onKeyDown={DisableKeyUpDown}
                                value={_formData?.mobileNumber2} onChange={(e: any) => changeFormData('mobileNumber2', e.target.value)} />
                        </FormField>
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 3 }} sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton color="error" onClick={() => { _setAddSecond(false); _setFormData({ ..._formData, relationshipType2: '', name2: '', mobileNumber2: '' }); }}>
                            <MinusCircle size={24} />
                        </IconButton>
                    </Grid2>
                </Grid2>
            )}

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#F04438' }}>*</Typography>
                <Typography variant="body2">Do you have any Local Guardian / Relative Nearby</Typography>
                <RadioGroup row value={_formData?.localGuardianStatus} sx={{ ml: 1 }}
                    onChange={(e) => changeFormData("localGuardianStatus", e.target.value === "true")}>
                    <FormControlLabel value={true} control={<Radio size="small" />} label="Yes" />
                    <FormControlLabel value={false} control={<Radio size="small" />} label="No" />
                </RadioGroup>
            </Box>

            <Divider sx={{ my: 2 }} />

            {_formData?.localGuardianStatus && (
                <>
                    <Typography variant="body2" sx={{ color: gray[500], mb: 2 }}>
                        Provide Local Guardian Name, Relationship Type, Contact & Address
                    </Typography>
                    <Grid2 container spacing={3}>
                        <Grid2 size={{ xs: 12, md: 3 }}>
                            <FormField label="Name" required>
                                <TextField fullWidth size="small"
                                    value={_formData?.guardianName} onChange={(e: any) => changeFormData('guardianName', e.target.value)} />
                            </FormField>
                        </Grid2>
                        <Grid2 size={{ xs: 12, md: 3 }}>
                            <FormField label="Relationship Type" required>
                                <TextField fullWidth size="small"
                                    value={_formData?.guardianRelationshipType} onChange={(e: any) => {
                                        const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                        changeFormData('guardianRelationshipType', onlyLetters);
                                    }} />
                            </FormField>
                        </Grid2>
                        <Grid2 size={{ xs: 12, md: 3 }}>
                            <FormField label="Mobile Number" required>
                                <TextField fullWidth size="small" type="number" onKeyDown={DisableKeyUpDown}
                                    value={_formData?.guardianMobileNumber} onChange={(e: any) => changeFormData('guardianMobileNumber', e.target.value)}
                                    slotProps={{ input: { startAdornment: <Typography variant="body2" sx={{ fontWeight: 600, mr: 0.5, whiteSpace: 'nowrap' }}>+{_countryList?.find((fItem: any) => fItem?.id === Number(_formData?.guardianCountry))?.phoneCode}-</Typography> } }} />
                            </FormField>
                        </Grid2>
                        <Grid2 size={12}><Box /></Grid2>
                        <Grid2 size={{ xs: 12, md: 3 }}>
                            <FormField label="Door No & Street">
                                <TextField fullWidth size="small"
                                    value={_formData?.guardianAddress} onChange={(e: any) => changeFormData('guardianAddress', e.target.value)} />
                            </FormField>
                        </Grid2>
                        <Grid2 size={{ xs: 12, md: 3 }}>
                            <FormField label="Place & Area">
                                <TextField fullWidth size="small"
                                    value={_formData?.guardianPlace} onChange={(e: any) => changeFormData('guardianPlace', e.target.value)} />
                            </FormField>
                        </Grid2>
                        <Grid2 size={12}><Box /></Grid2>
                        <Grid2 size={{ xs: 12, md: 3 }}>
                            <FormField label="Pincode">
                                <TextField fullWidth size="small" type="number" onKeyDown={DisableKeyUpDown}
                                    value={_formData?.guardianPincode} onChange={(e: any) => changeFormData('guardianPincode', e.target.value)} />
                            </FormField>
                        </Grid2>
                        <Grid2 size={{ xs: 12, md: 3 }}>
                            <FormField label="Country">
                                <CustomAutoSelect value={Number(_formData?.guardianCountry)}
                                    onChange={(value: any) => changeFormData('guardianCountry', value || '')}
                                    menuItem={_countryList?.map((item: any) => item?.isActive ? { title: (item?.name || ''), value: item?.id } : null)?.filter(Boolean)} />
                            </FormField>
                        </Grid2>
                        <Grid2 size={{ xs: 12, md: 3 }}>
                            <FormField label="State">
                                <CustomAutoSelect value={Number(_formData?.guardianState)}
                                    onChange={(value: any) => changeFormData('guardianState', value || '')}
                                    menuItem={_stateList?.map((item: any) => item?.isActive ? { title: (item?.name || ''), value: item?.id } : null)?.filter(Boolean)} />
                            </FormField>
                        </Grid2>
                        <Grid2 size={{ xs: 12, md: 3 }}>
                            <FormField label="City">
                                <TextField fullWidth size="small"
                                    value={_formData?.guardianCity} onChange={(e: any) => changeFormData('guardianCity', e.target.value)} />
                            </FormField>
                        </Grid2>
                    </Grid2>
                </>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                <Button variant="outlined" disabled={_loading} onClick={handleBack}
                    sx={{ textTransform: 'none', px: 4, color: 'black', borderColor: gray[300] }}>Back</Button>
                <Button variant="contained" color="primary" disabled={_loading} onClick={handleSubmitForm}
                    sx={{ textTransform: 'none', px: 4 }}>Next</Button>
            </Box>
        </Box>
    );
}
