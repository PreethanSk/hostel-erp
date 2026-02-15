import { useEffect, useState } from 'react';
import { useStateValue } from '../../../providers/StateProvider';
import { CustomAlert } from '../../../services/HelperService';
import { Button, TextField, Typography, Box, Divider, IconButton } from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import { getCotsByCotId, insertUpdateCandidateAdmissionAnyDetail } from '../../../models';
import moment from 'moment';
import { CustomAutoSelect } from '../../../components/helpers/CustomSelect';
import { MinusCircle, PlusCircle } from 'lucide-react';
import FormField from '../../../components/shared/FormField';
import { gray } from '../../../theme/tokens';

export default function RoomAndFee({ handleBack, handleNext }: any) {
    const [{ admissionDetails }, dispatch]: any = useStateValue();
    const [_loading, _setLoading] = useState(false);
    const [_formData, _setFormData] = useState<any>({ noDayStay: '1', noDayStayType: 'Month' });
    const [_cotDetails, _setCotDetails] = useState<any>({});

    const changeFormData = (key: string, value: any) => {
        if (key === 'noDayStay') {
            let dateOfNotice = '';
            if (_formData?.noDayStayType === "Days") {
                dateOfNotice = moment(_formData?.dateOfAdmission).add(Number(value), 'days').format('YYYY-MM-DD');
            } else {
                dateOfNotice = moment(_formData?.dateOfAdmission).add(Number(value), 'months').format('YYYY-MM-DD');
            }
            _setFormData({ ..._formData, [key]: value, dateOfNotice });
        } else if (key === "noDayStayType") {
            let dateOfNotice = '', rent = '';
            if (value === "Days") {
                dateOfNotice = moment(_formData?.dateOfAdmission).add(Number(_formData?.noDayStay), 'days').format('YYYY-MM-DD');
                rent = _cotDetails?.perDayRent;
            } else {
                dateOfNotice = moment(_formData?.dateOfAdmission).add(Number(_formData?.noDayStay), 'months').format('YYYY-MM-DD');
                rent = _cotDetails?.rentAmount;
            }
            _setFormData({ ..._formData, [key]: value, dateOfNotice, monthlyRent: rent });
        } else {
            _setFormData({ ..._formData, [key]: value });
        }
    };

    const checkValidation = () => {
        if (!_formData?.noDayStayType) { CustomAlert("warning", "Duration type required"); return false; }
        if (!_formData?.noDayStay) { CustomAlert("warning", "Tentative Duration count required"); return false; }
        return true;
    };

    const handleSubmitForm = () => {
        _setLoading(true);
        if (!checkValidation()) { _setLoading(false); return; }
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
        };
        insertUpdateCandidateAdmissionAnyDetail(body)
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    dispatch({
                        type: "SET_ADMISSION_DETAILS",
                        data: { ...admissionDetails, admissionDetails: { ...admissionDetails?.admissionDetails, ..._formData } }
                    });
                    CustomAlert("success", "Room and Fee details saved");
                    handleNext();
                }
            })
            .catch((err) => { console.log(err); CustomAlert("warning", err?.response?.data?.error); })
            .finally(() => _setLoading(false));
    };

    useEffect(() => {
        if (admissionDetails?.admissionDetails) {
            getCotsByCotId(admissionDetails?.admissionDetails?.cotRefId)
                .then((resp) => {
                    if (resp?.data?.status === "success") {
                        const cotDetail = resp?.data?.result;
                        _setCotDetails(cotDetail);
                        _setFormData({
                            ...admissionDetails?.admissionDetails,
                            roomNumber: cotDetail?.roomNumber, cotNumber: cotDetail?.cotNumber,
                            cotsType: cotDetail?.cotsType, roomTypeName: cotDetail?.roomTypeName,
                            admissionFee: cotDetail?.admissionFee, lateFeeAmount: cotDetail?.lateFeeAmount,
                            advancePaid: cotDetail?.advanceAmount, monthlyRent: cotDetail?.rentAmount || '0',
                            oneDayStay: cotDetail?.oneDayStay, perDayRent: cotDetail?.perDayRent || '0',
                            noDayStay: admissionDetails?.admissionDetails?.noDayStay || '1',
                            noDayStayType: admissionDetails?.admissionDetails?.noDayStayType || 'Month',
                            dateOfNotice: admissionDetails?.admissionDetails?.dateOfNotice ? admissionDetails?.admissionDetails?.dateOfNotice : moment(_formData?.dateOfAdmission).add(1, 'months').format('YYYY-MM-DD')
                        });
                    } else {
                        _setFormData({ ...admissionDetails?.admissionDetails });
                    }
                })
                .catch((err) => { console.log(err); _setFormData({ ...admissionDetails?.admissionDetails }); });
        }
    }, [admissionDetails]);

    return (
        <Box>
            <Typography sx={{ fontWeight: 600, mb: 2 }}>Stay Duration</Typography>

            <Grid2 container spacing={3}>
                <Grid2 size={{ xs: 12, md: 3 }}>
                    <FormField label="Duration Type" required>
                        <CustomAutoSelect value={_formData?.noDayStayType}
                            onChange={(value: any) => changeFormData('noDayStayType', value || '')}
                            placeholder="Select sharing type"
                            menuItem={(_formData?.oneDayStay ? ['Days', 'Month'] : ['Month'])?.map((item: any) => ({ title: item, value: item }))} />
                    </FormField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 3 }}>
                    <FormField label="Tentative Duration Count" required>
                        <TextField fullWidth size="small"
                            value={_formData?.noDayStay}
                            inputProps={{ style: { textAlign: "center" } }}
                            slotProps={{
                                input: {
                                    readOnly: true,
                                    startAdornment: (
                                        <IconButton size="small" color={_formData?.noDayStay > 1 ? "error" : "default"} disabled={_formData?.noDayStay <= 1}
                                            onClick={() => _formData?.noDayStay > 1 && changeFormData('noDayStay', Number(_formData?.noDayStay) - 1)}>
                                            <MinusCircle size={20} />
                                        </IconButton>
                                    ),
                                    endAdornment: (
                                        <IconButton size="small" color="success"
                                            onClick={() => changeFormData('noDayStay', Number(_formData?.noDayStay) + 1)}>
                                            <PlusCircle size={20} />
                                        </IconButton>
                                    ),
                                }
                            }} />
                    </FormField>
                </Grid2>
            </Grid2>

            <Divider sx={{ my: 2 }} />
            <Typography sx={{ fontWeight: 600, mb: 2 }}>Room Details</Typography>

            <Grid2 container spacing={3}>
                <Grid2 size={{ xs: 12, md: 3 }}>
                    <FormField label="Room Number">
                        <Typography variant="body2">{_formData?.roomNumber || '-'}</Typography>
                    </FormField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 3 }}>
                    <FormField label="Bed No">
                        <Typography variant="body2">{_formData?.cotNumber || '-'}</Typography>
                    </FormField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 3 }}>
                    <FormField label="Bed Type">
                        <Typography variant="body2">{_formData?.cotsType || '-'}</Typography>
                    </FormField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 3 }}>
                    <FormField label="Room Type">
                        <Typography variant="body2">{_formData?.roomTypeName || '-'}</Typography>
                    </FormField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 3 }}>
                    <FormField label="Date of Admission">
                        <Typography variant="body2">{moment(_formData?.dateOfAdmission)?.format('DD-MMM-YYYY')}</Typography>
                    </FormField>
                </Grid2>
            </Grid2>

            <Divider sx={{ my: 2 }} />
            <Typography sx={{ fontWeight: 600, mb: 2 }}>Fee Details</Typography>

            <Grid2 container spacing={3}>
                {_formData?.noDayStayType === "Month" && (
                    <>
                        <Grid2 size={{ xs: 12, md: 3 }}>
                            <FormField label="Admission Fee">
                                <TextField type="number" fullWidth size="small"
                                    value={_formData?.admissionFee || ''}
                                    onChange={(e: any) => changeFormData('admissionFee', e.target.value)}
                                    placeholder="Enter admission fee" />
                            </FormField>
                        </Grid2>
                        <Grid2 size={{ xs: 12, md: 3 }}>
                            <FormField label="Advance Amount">
                                <TextField type="number" fullWidth size="small"
                                    value={_formData?.advancePaid || ''}
                                    onChange={(e: any) => changeFormData('advancePaid', e.target.value)}
                                    placeholder="Enter advance amount" />
                            </FormField>
                        </Grid2>
                        {admissionDetails?.admissionDetails?.admissionStatus === 'Approved' && (
                            <Grid2 size={{ xs: 12, md: 3 }}>
                                <FormField label="Late Fee">
                                    <TextField type="number" fullWidth size="small"
                                        value={_formData?.lateFeeAmount || ''}
                                        onChange={(e: any) => changeFormData('lateFeeAmount', e.target.value)}
                                        placeholder="Enter late fee" />
                                </FormField>
                            </Grid2>
                        )}
                    </>
                )}
                <Grid2 size={{ xs: 12, md: 3 }}>
                    <FormField label={`Per ${_formData?.noDayStayType} Rent`}>
                        <TextField fullWidth size="small" value={_formData?.monthlyRent || ''} type="number"
                            onChange={(e: any) => changeFormData('monthlyRent', e.target.value)}
                            placeholder={`Enter ${_formData?.noDayStayType === "Month" ? "monthly" : "daily"} rent`} />
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
    );
}
