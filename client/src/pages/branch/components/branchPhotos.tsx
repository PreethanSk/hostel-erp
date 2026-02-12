import { MutableRefObject, useEffect, useRef, useState } from "react";
import { Button, Checkbox, FormControlLabel, TextField } from "@mui/material";
import { IMAGES_ICON } from "../../../assets/images/exportImages";
import { styled } from '@mui/material';
import { commonUploadFile, getBranchPhotosList, insertUpdateBranchPhotos } from "../../../models";
import { CustomAlert, textFieldStyle } from "../../../services/HelperService";
import { ROUTES } from "../../../configs/constants";
import { useStateValue } from "../../../providers/StateProvider";
import { SkeletonPage, } from "../../../providers/SkeletonProvider";
import Swal from "sweetalert2";

const Input = styled('input')({
    display: 'none',
});

export default function BranchPhotos({ handleBack, handleNext }: any) {
    const [{ branchDetails }, dispatch]: any = useStateValue()
    const refDocument = useRef() as MutableRefObject<HTMLInputElement>;
    const [_loading, _setLoading] = useState<any>(false);
    const [_pageLoading, _setPageLoading] = useState(true);
    const [_removePhoto, _setRemovePhoto] = useState(-1)
    const [_formData, _setFormData] = useState<any>({
        photos: [],
    });

    const checkValidation = () => {
        let isValid = true;
        if (branchDetails?.branchDetails?.isActive && !_formData?.photos?.length) {
            isValid = false
            CustomAlert("warning", "Photos needs to upload");
        }
        return isValid;
    }

    const handleSubmitForm = () => {
        _setLoading(true);
        if (!checkValidation()) {
            _setLoading(false);
            return;
        }

        const body = {
            photos: _formData?.photos || []
        }

        insertUpdateBranchPhotos(body)
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    dispatch({
                        type: "SET_BRANCH_DETAILS",
                        data: { ...branchDetails, photos: body.photos }
                    })
                    CustomAlert("success", "Branch photos saved");
                    handleNext()
                }
            })
            .catch(console.log)
            .finally(() => _setLoading(false));
    }

    const onUpload = async (files: any) => {
        _setLoading(true)
        let imageList: any = []
        for (let i = 0; i < files?.length; i++) {
            if (i === 50) {
                break;
            }
            const formData = new FormData();
            formData.append('file', files[i]);
            await commonUploadFile(formData)
                .then((response) => {
                    if (response.status === 200) {
                        imageList.push({ id: 0, photoUrl: response?.data?.file, isActive: true, branchId: branchDetails?.branchDetails?.id })
                    }
                })
                .catch(error => { console.log(error.response); })
        }
        await _setFormData({ photos: [..._formData?.photos, ...imageList] })
        await _setLoading(false)
    }

    const removePhotosItem = (index: number) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You want to delete this image!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#388024",
            cancelButtonColor: "#bf1029",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {
                let _temp = _formData?.photos;
                _temp[index].isActive = false;
                _setFormData({ photos: [..._temp] })
            }
        });
    }

    const getOtherList = () => {
        _setPageLoading(true)
        getBranchPhotosList(branchDetails?.branchDetails?.id)
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    _setFormData({ ...branchDetails?.branchDetails, photos: resp?.data?.result });
                }
            })
            .catch(console.log)
            .finally(() => _setPageLoading(false))
    }

    useEffect(() => {
        if (branchDetails) {
            getOtherList()
        }
    }, [branchDetails])

    return <>
        {_pageLoading ? <div className="text-center">
            <SkeletonPage />
        </div>
            :
            _formData?.photos?.length > 0 ? <div className="">
                <div className="col-md-6 mx-auto fieldBorderDashed rounded--1 p-4">
                    <div className="text-center">
                        <Button variant="text" component="label">
                            <div className="fs-6 fw-bold text-dark darkBorder rounded px-4 py-2">+ Upload More Photos</div>
                            <Input style={{ visibility: 'hidden' }} accept={'image/*'} type="file" ref={refDocument} multiple onChange={(e: any) => onUpload(e.target.files)} />
                        </Button>
                    </div>
                    {_formData?.photos?.map((item: any, index: any) => item?.isActive && <div className="mt-2" key={index}>
                        <div className="d-flex justify-content-between align-items-center" >
                            {item?.photoUrl ?
                                <div className="d-flex gap-2 align-items-center">
                                    <img draggable={false} src={ROUTES.API.DOWNLOAD_FILE + `${item?.photoUrl}`} alt="icons" className='rounded fieldBorderPrimary' height={50} width={66} style={{ objectFit: 'cover' }} />
                                    <span className="fs14 fw-bold">{item?.photoUrl?.slice(8)}</span>
                                </div>
                                : <div className="rounded fieldBorderPrimary fs14 alignCenter" style={{ height: "50px", width: "66px" }}>Not Available</div>}
                            <img src={IMAGES_ICON.CloseOutlineIcon} alt="Close Icon" height="26" role="button" onClick={() => removePhotosItem(index)} />
                        </div>
                    </div>)}
                </div>
            </div> : <div className="mt-4 rounded p-0">
                <div className="mx-auto text-center col-md-4">
                    <div className="mt-2 fw-bold">Upload Branch Photo</div>
                    <div className="mt-2 text-muted fs14">You can upload multiple photos, Supported format .JPG, .PNG, .JPEG (Recommended size maximum 2MB )</div>
                </div>
                <div className={`m-4 rounded d-flex py-2 px-3 align-items-center justify-content-center`}>
                    <Button className="px-4 fieldBorderDashed transformNone fw400 text-dark p-4 d-flex flex-column" component="label" >
                        <div className="fs-6 fw-bold">UPLOAD PHOTOS</div>
                        <div className='fs16'>Select & Browse to <span className='text-nowrap text-underline text-primary'>Upload</span></div>
                        <Input style={{ visibility: 'hidden' }} accept={'image/*'} type="file" ref={refDocument} multiple onChange={(e: any) => onUpload(e.target.files)} />
                    </Button>
                </div>
            </div>}
        {/* <hr className="mb-0" />
        <div className="px-4 pt-4 d-flex align-items-center justify-content-end mobJustify gap-2">
            <Button className="text-capitalize" sx={{ color: "black" }} onClick={handleClearForm}>Clear</Button>
            <Button variant="contained" color="primary" disabled={_loading} className="px-4" onClick={handleSubmitForm}>Save</Button>
        </div> */}
        <div className="row pt-3">
            <hr />
            <div className="col-md-8 mb-2">
                {/* <TextField sx={{ ...textFieldStyle }} className="" fullWidth placeholder="Add Notes"
                    value={branchDetails?.branchDetails?.notes} InputProps={{ readOnly: true }} /> */}
            </div>
            <div className="col-md-4 mb-2">
                <div className="d-flex align-items-center justify-content-end mobJustify gap-3">
                    <FormControlLabel label="Active"
                        control={<Checkbox className="text-capitalize" checked={branchDetails?.branchDetails?.isActive} />} />
                    <Button className="px-4 text-capitalize" variant="outlined" sx={{ color: "black" }} disabled={_loading} onClick={handleBack}>Back</Button>
                    <Button className="px-4" variant="contained" color="primary" disabled={_loading} onClick={handleSubmitForm}>Next</Button>
                </div>
            </div>
        </div>
    </>
}
