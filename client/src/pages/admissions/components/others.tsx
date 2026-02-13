import { useEffect, useState } from 'react';
import { useStateValue } from '../../../providers/StateProvider';
import { CustomAlert } from '../../../services/HelperService';
import { RadioGroup, FormControlLabel, Radio, TextField, Button, Checkbox, FormGroup, Typography, Box } from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import { getCandidateOtherDetail, insertUpdateCandidateOtherDetail } from '../../../models';
import FormField from '../../../components/shared/FormField';
import { gray } from '../../../theme/tokens';

export default function Others({ handleBack, handleNext }: any) {
    const [{ admissionDetails }]: any = useStateValue();
    const [_loading, _setLoading] = useState(false);
    const [_formData, _setFormData] = useState<any>({
        id: 0, admissionRefId: 0, candidateRefId: 0,
        anySpecialCareRequired: true, detailsOfSpecialCare: "",
        howDoTheyKnowAboutUs: "", enquiryBeforeVisiting: false, isActive: true
    });

    const changeFormData = (key: string, value: any) => { _setFormData({ ..._formData, [key]: value }); };

    const handleCheckboxChange = (event: any) => {
        const { name, checked } = event.target;
        const updatedValue = checked
            ? [...(_formData?.howDoTheyKnowAboutUs?.split(',') || []), name]
            : (_formData?.howDoTheyKnowAboutUs?.split(',') || []).filter((item: any) => item !== name);
        changeFormData('howDoTheyKnowAboutUs', updatedValue?.filter(Boolean)?.join(','));
    };

    const checkValidation = () => {
        if (_formData?.anySpecialCareRequired) {
            if (!_formData?.detailsOfSpecialCare) { CustomAlert("warning", "Details of special care required"); return false; }
        }
        if (!_formData?.howDoTheyKnowAboutUs) { CustomAlert("warning", "How do they know about us? required"); return false; }
        return true;
    };

    const handleSubmitForm = () => {
        _setLoading(true);
        if (!checkValidation()) { _setLoading(false); return; }
        const body = {
            ..._formData,
            admissionRefId: admissionDetails?.admissionDetails?.id || 0,
            candidateRefId: admissionDetails?.admissionDetails?.candidateRefId || 0,
        };
        insertUpdateCandidateOtherDetail(body)
            .then((resp) => { if (resp?.data?.status === "success") { CustomAlert("success", "Purpose of stay details saved"); handleNext(); } })
            .catch(console.log)
            .finally(() => _setLoading(false));
    };

    const getOtherDetails = () => {
        getCandidateOtherDetail(admissionDetails?.admissionDetails?.candidateRefId)
            .then((resp) => { if (resp?.data?.status === "success" && resp?.data?.result) _setFormData({ ...resp?.data?.result }); })
            .catch(console.log);
    };

    useEffect(() => { getOtherDetails(); }, []);

    return (
        <Box>
            <Typography sx={{ fontWeight: 600, mb: 2 }}>Others</Typography>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#F04438' }}>*</Typography>
                <Typography variant="body2">Any special care required?</Typography>
                <RadioGroup row value={_formData?.anySpecialCareRequired} sx={{ ml: 1 }}
                    onChange={(e) => changeFormData("anySpecialCareRequired", e.target.value === "true")}>
                    <FormControlLabel value={true} control={<Radio size="small" />} label="Yes" />
                    <FormControlLabel value={false} control={<Radio size="small" />} label="No" />
                </RadioGroup>
            </Box>

            {_formData?.anySpecialCareRequired && (
                <Grid2 container spacing={3}>
                    <Grid2 size={{ xs: 12, md: 6 }}>
                        <FormField label="Details of special care" required>
                            <TextField fullWidth size="small" multiline rows={2}
                                value={_formData?.detailsOfSpecialCare} onChange={(e: any) => changeFormData('detailsOfSpecialCare', e.target.value)} />
                        </FormField>
                    </Grid2>
                </Grid2>
            )}

            <Grid2 container spacing={3}>
                <Grid2 size={{ xs: 12, md: 6 }}>
                    <FormField label="How do you know about us?" required>
                        <FormGroup>
                            <Grid2 container spacing={1}>
                                {['Internet', 'Justdial', 'Institution/Office', 'Friends/Relatives', 'Hostel handouts / Posters by hostel', 'Marketing call received from hostel']?.map((mItem: string, mIndex: number) => (
                                    <Grid2 key={mIndex} size={{ xs: 12, md: 6 }}>
                                        <FormControlLabel label={mItem}
                                            control={<Checkbox size="small" name={mItem}
                                                checked={_formData?.howDoTheyKnowAboutUs?.split(',')?.includes(mItem)}
                                                onChange={handleCheckboxChange} />} />
                                    </Grid2>
                                ))}
                            </Grid2>
                        </FormGroup>
                    </FormField>
                </Grid2>
            </Grid2>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#F04438' }}>*</Typography>
                <Typography variant="body2">Spoken to Hostel Enquiry before visiting in person?</Typography>
                <RadioGroup row value={_formData?.enquiryBeforeVisiting} sx={{ ml: 1 }}
                    onChange={(e) => changeFormData("enquiryBeforeVisiting", e.target.value === "true")}>
                    <FormControlLabel value={true} control={<Radio size="small" />} label="Yes" />
                    <FormControlLabel value={false} control={<Radio size="small" />} label="No" />
                </RadioGroup>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                <Button variant="outlined" disabled={_loading} onClick={handleBack}
                    sx={{ textTransform: 'none', px: 4, color: 'black', borderColor: gray[300] }}>Back</Button>
                <Button variant="contained" color="primary" disabled={_loading} onClick={handleSubmitForm}
                    sx={{ textTransform: 'none', px: 4 }}>Next</Button>
            </Box>
        </Box>
    );
}
