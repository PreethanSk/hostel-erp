import { MutableRefObject, useEffect, useRef, useState } from "react";
import { Button, Checkbox, FormControlLabel, Box, Typography, Divider, IconButton, Skeleton } from "@mui/material";
import Grid2 from '@mui/material/Grid2';
import { styled } from '@mui/material';
import { commonUploadFile, getBranchPhotosList, insertUpdateBranchPhotos } from "../../../models";
import { CustomAlert } from "../../../services/HelperService";
import { ROUTES } from "../../../configs/constants";
import { useStateValue } from "../../../providers/StateProvider";
import { Upload, X } from 'lucide-react';
import { gray } from "../../../theme/tokens";
import Swal from "sweetalert2";

const Input = styled('input')({ display: 'none' });

export default function BranchPhotos({ handleBack, handleNext }: any) {
    const [{ branchDetails }, dispatch]: any = useStateValue();
    const refDocument = useRef() as MutableRefObject<HTMLInputElement>;
    const [_loading, _setLoading] = useState<any>(false);
    const [_pageLoading, _setPageLoading] = useState(true);
    const [_formData, _setFormData] = useState<any>({ photos: [] });

    const checkValidation = () => {
        let isValid = true;
        if (branchDetails?.branchDetails?.isActive && !_formData?.photos?.length) {
            isValid = false;
            CustomAlert("warning", "Photos needs to upload");
        }
        return isValid;
    };

    const handleSubmitForm = () => {
        _setLoading(true);
        if (!checkValidation()) { _setLoading(false); return; }
        const body = { photos: _formData?.photos || [] };
        insertUpdateBranchPhotos(body)
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    dispatch({ type: "SET_BRANCH_DETAILS", data: { ...branchDetails, photos: body.photos } });
                    CustomAlert("success", "Branch photos saved");
                    handleNext();
                }
            })
            .catch(console.log)
            .finally(() => _setLoading(false));
    };

    const onUpload = async (files: any) => {
        _setLoading(true);
        let imageList: any = [];
        for (let i = 0; i < files?.length; i++) {
            if (i === 50) break;
            const formData = new FormData();
            formData.append('file', files[i]);
            await commonUploadFile(formData)
                .then((response) => {
                    if (response.status === 200) imageList.push({ id: 0, photoUrl: response?.data?.file, isActive: true, branchId: branchDetails?.branchDetails?.id });
                })
                .catch(error => console.log(error.response));
        }
        await _setFormData({ photos: [..._formData?.photos, ...imageList] });
        await _setLoading(false);
    };

    const removePhotosItem = (index: number) => {
        Swal.fire({
            title: "Are you sure?", text: "You want to delete this image!", icon: "warning",
            showCancelButton: true, confirmButtonColor: "#388024", cancelButtonColor: "#bf1029", confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {
                let _temp = _formData?.photos;
                _temp[index].isActive = false;
                _setFormData({ photos: [..._temp] });
            }
        });
    };

    const getOtherList = () => {
        _setPageLoading(true);
        getBranchPhotosList(branchDetails?.branchDetails?.id)
            .then((resp) => { if (resp?.data?.status === "success") _setFormData({ ...branchDetails?.branchDetails, photos: resp?.data?.result }); })
            .catch(console.log)
            .finally(() => _setPageLoading(false));
    };

    useEffect(() => { if (branchDetails) getOtherList(); }, [branchDetails]);

    return (
        <Box>
            {_pageLoading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 4 }}>
                    <Skeleton variant="rectangular" width="50%" height={200} sx={{ borderRadius: 2 }} />
                </Box>
            ) : _formData?.photos?.length > 0 ? (
                <Box sx={{ maxWidth: '50%', mx: 'auto', border: `2px dashed ${gray[300]}`, borderRadius: 2, p: 4 }}>
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <Button variant="outlined" component="label" startIcon={<Upload size={16} />}
                            sx={{ textTransform: 'none', color: gray[700], borderColor: gray[300] }}>
                            Upload More Photos
                            <Input style={{ visibility: 'hidden', position: 'absolute' }} accept={'image/*'} type="file" ref={refDocument} multiple onChange={(e: any) => onUpload(e.target.files)} />
                        </Button>
                    </Box>
                    {_formData?.photos?.map((item: any, index: number) => item?.isActive && (
                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
                            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                                {item?.photoUrl ? (
                                    <>
                                        <Box component="img" draggable={false} src={ROUTES.API.DOWNLOAD_FILE + `${item?.photoUrl}`} alt="photo"
                                            sx={{ height: 50, width: 66, objectFit: 'cover', borderRadius: 1, border: `1px solid ${gray[200]}` }} />
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{item?.photoUrl?.slice(8)}</Typography>
                                    </>
                                ) : (
                                    <Box sx={{ height: 50, width: 66, borderRadius: 1, border: `1px solid ${gray[200]}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Typography variant="caption">N/A</Typography>
                                    </Box>
                                )}
                            </Box>
                            <IconButton size="small" onClick={() => removePhotosItem(index)}
                                sx={{ border: `1px solid ${gray[300]}`, '&:hover': { backgroundColor: gray[100] } }}>
                                <X size={16} />
                            </IconButton>
                        </Box>
                    ))}
                </Box>
            ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography sx={{ fontWeight: 600, mt: 2 }}>Upload Branch Photo</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 400, mx: 'auto' }}>
                        You can upload multiple photos, Supported format .JPG, .PNG, .JPEG (Recommended size maximum 2MB)
                    </Typography>
                    <Box sx={{ mt: 3 }}>
                        <Button component="label" variant="outlined"
                            sx={{ textTransform: 'none', border: `2px dashed ${gray[300]}`, p: 4, display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography sx={{ fontWeight: 600 }}>UPLOAD PHOTOS</Typography>
                            <Typography variant="body2">Select & Browse to <span style={{ color: '#1976d2' }}>Upload</span></Typography>
                            <Input style={{ visibility: 'hidden', position: 'absolute' }} accept={'image/*'} type="file" ref={refDocument} multiple onChange={(e: any) => onUpload(e.target.files)} />
                        </Button>
                    </Box>
                </Box>
            )}

            <Divider sx={{ my: 2 }} />

            <Grid2 container spacing={3} sx={{ alignItems: 'center' }}>
                <Grid2 size={{ xs: 12, md: 8 }} />
                <Grid2 size={{ xs: 12, md: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
                        <FormControlLabel label="Active"
                            control={<Checkbox checked={branchDetails?.branchDetails?.isActive} />} />
                        <Button variant="outlined" disabled={_loading} onClick={handleBack}
                            sx={{ textTransform: 'none', px: 4, color: 'black', borderColor: gray[300] }}>Back</Button>
                        <Button variant="contained" color="primary" disabled={_loading} onClick={handleSubmitForm}
                            sx={{ textTransform: 'none', px: 4 }}>Next</Button>
                    </Box>
                </Grid2>
            </Grid2>
        </Box>
    );
}
