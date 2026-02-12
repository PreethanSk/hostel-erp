import { useEffect, useState } from 'react';
import { useStateValue } from '../../../providers/StateProvider'
import { CustomAlert, customRadio, textFieldStyle } from '../../../services/HelperService';
import { RadioGroup, FormControlLabel, Radio, TextField, Button, Checkbox, FormGroup } from '@mui/material';
import { getCandidateOtherDetail, insertUpdateCandidateOtherDetail } from '../../../models';

export default function Others({ handleBack, handleNext }: any) {
    const [{ admissionDetails }]: any = useStateValue()
    const [_loading, _setLoading] = useState(false)
    const [_formData, _setFormData] = useState<any>({
        id: 0,
        admissionRefId: 0,
        candidateRefId: 0,
        anySpecialCareRequired: true,
        detailsOfSpecialCare: "",
        howDoTheyKnowAboutUs: "",
        enquiryBeforeVisiting: false,
        isActive: true
    })

    const changeFormData = (key: string, value: any) => {
        _setFormData({ ..._formData, [key]: value })
    }

    const handleCheckboxChange = (event: any) => {
        const { name, checked } = event.target;
        const updatedValue = checked
            ? [...(_formData?.howDoTheyKnowAboutUs?.split(',') || []), name]
            : (_formData?.howDoTheyKnowAboutUs?.split(',') || []).filter((item: any) => item !== name);

        changeFormData('howDoTheyKnowAboutUs', updatedValue?.filter(Boolean)?.join(','));
    };

    const checkValidation = () => {
        if (_formData?.anySpecialCareRequired) {
            if (!_formData?.detailsOfSpecialCare) {
                CustomAlert("warning", "Details of special care required");
                return false
            }
        }
        if (!_formData?.howDoTheyKnowAboutUs) {
            CustomAlert("warning", "How do they know about us? required");
            return false
        }
        return true;
    }

    const handleSubmitForm = () => {
        _setLoading(true);
        if (!checkValidation()) {
            _setLoading(false);
            return;
        }
        const body = {
            ..._formData,
            admissionRefId: admissionDetails?.admissionDetails?.id || 0,
            candidateRefId: admissionDetails?.admissionDetails?.candidateRefId || 0,
        }

        insertUpdateCandidateOtherDetail(body)
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    CustomAlert("success", "Purpose of stay details saved");
                    handleNext()
                }
            })
            .catch(console.log)
            .finally(() => _setLoading(false));
    }

    const getOtherDetails = () => {
        getCandidateOtherDetail(admissionDetails?.admissionDetails?.candidateRefId)
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    if (resp?.data?.result) {
                        _setFormData({ ...resp?.data?.result })
                    }
                }
            })
            .catch((err) => console.log(err))
    }

    useEffect(() => {
        getOtherDetails()
    }, [])

    return <>
        <div className="">
            <div className="row">
                <div className="fw-bold">Others</div>
                <div className="d-flex gap-2 align-items-center">
                    <span className="required">Any special care required?</span>
                    <RadioGroup row value={_formData?.anySpecialCareRequired} sx={{ marginLeft: "10px" }}
                        onChange={(e) => changeFormData("anySpecialCareRequired", e.target.value === "true")}>
                        <FormControlLabel value={true} control={<Radio size="small" sx={{ ...customRadio }} />} label="Yes" />
                        <FormControlLabel value={false} control={<Radio size="small" sx={{ ...customRadio }} />} label="No" />
                    </RadioGroup>
                </div>
                {_formData?.anySpecialCareRequired && <div className="col-md-6 my-3">
                    <div className="text-muted fs14 mb-1 required">Details of special care</div>
                    <TextField fullWidth sx={{ ...textFieldStyle }} multiline rows={2}
                        value={_formData?.detailsOfSpecialCare} onChange={(e: any) => changeFormData('detailsOfSpecialCare', e.target.value)} />
                </div>}
                <div className=""></div>
                <div className="col-md-6 my-3">
                    <div className="mb-1 required">How do you know about us?</div>

                    <FormGroup className=''>
                        <div className="row">
                            {['Internet', 'Justdial', 'Institution/Office', 'Friends/Relatives', 'Hostel handouts / Posters by hostel', 'Marketing call received from hostel']?.map((mItem: string, mIndex: number) =>
                                <div key={mIndex} className="col-md-6 mb-2">
                                    <FormControlLabel label={mItem} className=''
                                        control={<Checkbox size='small' name={mItem}
                                            checked={_formData?.howDoTheyKnowAboutUs?.split(',')?.includes(mItem)}
                                            onChange={handleCheckboxChange} />
                                        } />
                                </div>
                            )}
                        </div>
                    </FormGroup>
                    {/* <TextField fullWidth sx={{ ...textFieldStyle }} multiline rows={2}
                        value={_formData?.howDoTheyKnowAboutUs} onChange={(e: any) => changeFormData('howDoTheyKnowAboutUs', e.target.value)} /> */}
                </div>
                <div className="d-flex gap-2 align-items-center">
                    <span className="required">Spoken to Hostel Enquiry before visiting in person?</span>
                    <RadioGroup row value={_formData?.enquiryBeforeVisiting} sx={{ marginLeft: "10px" }}
                        onChange={(e) => changeFormData("enquiryBeforeVisiting", e.target.value === "true")}>
                        <FormControlLabel value={true} control={<Radio size="small" sx={{ ...customRadio }} />} label="Yes" />
                        <FormControlLabel value={false} control={<Radio size="small" sx={{ ...customRadio }} />} label="No" />
                    </RadioGroup>
                </div>
                <div></div>
            </div>
            <div className="mt-4 d-flex align-items-center justify-content-end mobJustify gap-3">
                <Button className="px-4 bg-white text-capitalize" variant="outlined" sx={{ color: "black" }} disabled={_loading} onClick={handleBack}>Back</Button>
                <Button className="px-4" variant="contained" color="primary" disabled={_loading} onClick={handleSubmitForm}>Next</Button>
            </div>
        </div>
    </>
}
