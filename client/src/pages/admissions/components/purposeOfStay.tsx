import { useEffect, useState } from 'react';
import { useStateValue } from '../../../providers/StateProvider';
import { CustomAlert, DisableKeyUpDown } from '../../../services/HelperService';
import { CustomAutoSelect } from '../../../components/helpers/CustomSelect';
import { getAllCityByStateCode, getAllCountry, getAllStateByCountryCode, getCandidatePurposeOfStay, insertUpdateCandidatePurposeOfStay } from '../../../models';
import { Button, TextField, Typography, Box } from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import { validateMobile, validatePinCode, validateMobileNumberUniqueness } from '../../../services/ValidationService';
import FormField from '../../../components/shared/FormField';
import { gray } from '../../../theme/tokens';

export default function PurposeOfStay({ handleBack, handleNext }: any) {
    const [{ admissionDetails }]: any = useStateValue();
    const [_loading, _setLoading] = useState(false);
    const [_countryList, _setCountryList] = useState<any>([]);
    const [_stateList, _setStateList] = useState<any>([]);
    const [_cityList, _setCityList] = useState<any>([]);
    const [_formData, _setFormData] = useState<any>({
        id: 0, admissionRefId: 0, candidateRefId: 0,
        mentionedPurpose: "", reasonOfStay: "",
        organizationName: "", organizationMobileNumber: "",
        organizationAddress: "", organizationPlace: "",
        organizationCity: "", organizationPincode: "",
        organizationState: 31, organizationCountry: 101, isActive: true
    });

    const changeFormData = (key: string, value: any) => {
        const newForm = { ..._formData, [key]: value };
        if (key === "organizationCountry") { newForm.organizationState = ""; newForm.organizationCity = ""; }
        else if (key === "organizationState") { newForm.organizationCity = ""; }
        _setFormData(newForm);
    };

    const checkValidation = async () => {
        if (_formData?.mentionedPurpose === "Others") {
            if (!_formData?.reasonOfStay) { CustomAlert("warning", "Reason of stay required"); return false; }
        }
        if (_formData?.mentionedPurpose === "Employment" || _formData?.mentionedPurpose === "Education") {
            if (!_formData?.organizationName) { CustomAlert("warning", "Name required"); return false; }
            if (!_formData?.organizationMobileNumber) { CustomAlert("warning", "Mobile Number required"); return false; }
            if (_formData?.organizationMobileNumber?.trim() && !validateMobile(_formData?.organizationMobileNumber)) { CustomAlert("warning", "Enter valid mobile number"); return false; }
            if (_formData?.organizationMobileNumber && validateMobile(_formData?.organizationMobileNumber)) {
                const candidateId = admissionDetails?.admissionDetails?.candidateRefId;
                if (candidateId) {
                    const uniquenessResult = await validateMobileNumberUniqueness(candidateId, _formData.organizationMobileNumber, _formData?.id || undefined, 'purpose_of_stay');
                    if (!uniquenessResult.isValid) { CustomAlert("warning", uniquenessResult.message); return false; }
                }
            }
            if (!_formData?.organizationAddress) { CustomAlert("warning", "Address required"); return false; }
            if (!_formData?.organizationPlace) { CustomAlert("warning", "Place required"); return false; }
            if (!_formData?.organizationPincode) { CustomAlert("warning", "Pincode required"); return false; }
            if (_formData?.organizationPincode?.trim() && !validatePinCode(_formData?.organizationPincode)) { CustomAlert("warning", "Enter valid pincode"); return false; }
            if (!_formData?.organizationCountry) { CustomAlert("warning", "Country required"); return false; }
            if (!_formData?.organizationState) { CustomAlert("warning", "State required"); return false; }
            if (!_formData?.organizationCity) { CustomAlert("warning", "City required"); return false; }
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
        insertUpdateCandidatePurposeOfStay(body)
            .then((resp) => { if (resp?.data?.status === "success") { CustomAlert("success", "Purpose of stay details saved"); handleNext(); } })
            .catch(console.log)
            .finally(() => _setLoading(false));
    };

    const getPurposeDetails = () => {
        getCandidatePurposeOfStay(admissionDetails?.admissionDetails?.candidateRefId)
            .then((resp) => { if (resp?.data?.status === "success" && resp?.data?.result) _setFormData({ ...resp?.data?.result }); })
            .catch(console.log);
    };

    const getOtherList = () => {
        getAllCountry()
            .then((resp) => { if (resp?.data?.status === "success") _setCountryList(resp?.data?.result); })
            .catch(console.log);
    };

    useEffect(() => { getOtherList(); getPurposeDetails(); }, []);

    useEffect(() => {
        if (_formData?.organizationCountry) {
            getAllStateByCountryCode(Number(_formData?.organizationCountry || '0'))
                .then((resp) => { if (resp?.data?.status === "success") _setStateList(resp?.data?.result); })
                .catch(console.log);
        }
    }, [_formData?.organizationCountry]);

    useEffect(() => {
        if (_formData?.organizationState) {
            getAllCityByStateCode(Number(_formData?.organizationState || '0'))
                .then((resp) => { if (resp?.data?.status === "success") _setCityList(resp?.data?.result); })
                .catch(console.log);
        }
    }, [_formData?.organizationState]);

    return (
        <Box>
            <Typography sx={{ fontWeight: 600, mb: 2 }}>Purpose of Stay</Typography>

            <Grid2 container spacing={3}>
                <Grid2 size={{ xs: 12, md: 3 }}>
                    <FormField label="Purpose of Stay">
                        <CustomAutoSelect value={_formData?.mentionedPurpose}
                            onChange={(value: any) => changeFormData('mentionedPurpose', value || '')}
                            placeholder="Select Purpose of Stay"
                            menuItem={["Employment", "Education", "Job Search", "Others"]?.map((item: any) => ({ title: item, value: item }))} />
                    </FormField>
                </Grid2>
            </Grid2>

            {_formData?.mentionedPurpose === "Others" && (
                <Grid2 container spacing={3}>
                    <Grid2 size={{ xs: 12, md: 6 }}>
                        <FormField label="Reason of stay" required>
                            <TextField fullWidth size="small" multiline rows={3}
                                value={_formData?.reasonOfStay} onChange={(e: any) => changeFormData('reasonOfStay', e.target.value)} />
                        </FormField>
                    </Grid2>
                </Grid2>
            )}

            {["Employment", "Education"]?.includes(_formData?.mentionedPurpose) && (
                <Grid2 container spacing={3}>
                    <Grid2 size={{ xs: 12, md: 3 }}>
                        <FormField label={`${_formData?.mentionedPurpose === 'Education' ? 'Institute' : 'Organization'} Name`} required>
                            <TextField fullWidth size="small"
                                value={_formData?.organizationName} onChange={(e: any) => changeFormData('organizationName', e.target.value)} />
                        </FormField>
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 3 }}>
                        <FormField label="Mobile Number" required>
                            <TextField fullWidth size="small" type="number" onKeyDown={DisableKeyUpDown}
                                value={_formData?.organizationMobileNumber} onChange={(e: any) => changeFormData('organizationMobileNumber', e.target.value)}
                                slotProps={{ input: { startAdornment: <Typography variant="body2" sx={{ fontWeight: 600, mr: 0.5, whiteSpace: 'nowrap' }}>+{_countryList?.find((fItem: any) => fItem?.id === Number(_formData?.organizationCountry))?.phoneCode}-</Typography> } }} />
                        </FormField>
                    </Grid2>
                    <Grid2 size={12}><Box /></Grid2>
                    <Grid2 size={{ xs: 12, md: 3 }}>
                        <FormField label="Door No & Street" required>
                            <TextField fullWidth size="small"
                                value={_formData?.organizationAddress} onChange={(e: any) => changeFormData('organizationAddress', e.target.value)} />
                        </FormField>
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 3 }}>
                        <FormField label="Place & Area" required>
                            <TextField fullWidth size="small"
                                value={_formData?.organizationPlace} onChange={(e: any) => changeFormData('organizationPlace', e.target.value)} />
                        </FormField>
                    </Grid2>
                    <Grid2 size={12}><Box /></Grid2>
                    <Grid2 size={{ xs: 12, md: 3 }}>
                        <FormField label="Pincode" required>
                            <TextField fullWidth size="small" type="number" onKeyDown={DisableKeyUpDown}
                                value={_formData?.organizationPincode} onChange={(e: any) => changeFormData('organizationPincode', e.target.value)} />
                        </FormField>
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 3 }}>
                        <FormField label="Country" required>
                            <CustomAutoSelect value={Number(_formData?.organizationCountry)}
                                onChange={(value: any) => changeFormData('organizationCountry', value || '')}
                                menuItem={_countryList?.map((item: any) => item?.isActive ? { title: (item?.name || ''), value: item?.id } : null)?.filter(Boolean)} />
                        </FormField>
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 3 }}>
                        <FormField label="State" required>
                            <CustomAutoSelect value={Number(_formData?.organizationState)}
                                onChange={(value: any) => changeFormData('organizationState', value || '')}
                                menuItem={_stateList?.map((item: any) => item?.isActive ? { title: (item?.name || ''), value: item?.id } : null)?.filter(Boolean)} />
                        </FormField>
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 3 }}>
                        <FormField label="City" required>
                            <TextField fullWidth size="small"
                                value={_formData?.organizationCity} onChange={(e: any) => changeFormData('organizationCity', e.target.value)} />
                        </FormField>
                    </Grid2>
                </Grid2>
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
