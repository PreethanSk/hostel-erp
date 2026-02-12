import { useEffect, useState } from "react"
import { getBranchAmenitiesList, getMasterAmenitiesCategory, getMasterAmenitiesSubCategory, insertUpdateBranchAmenities } from "../../../models"
import { useStateValue } from "../../../providers/StateProvider"
import { Button, Checkbox, FormControlLabel, TextField } from "@mui/material"
import { SkeletonPage } from "../../../providers/SkeletonProvider"
import { CustomAlert, textFieldStyle } from "../../../services/HelperService"
import { IMAGES_ICON } from "../../../assets/images/exportImages"
import CustomDialogue from "../../../components/helpers/CustomDialogue"
import { CustomAutoMultiSelect } from "../../../components/helpers/CustomSelect"

export default function BranchAmenities({ handleBack, handleNext }: any) {
  const [{ branchDetails }, dispatch]: any = useStateValue()
  const [_categoryList, _setCategoryList] = useState<any>([])
  const [_subCategoryList, _setSubCategoryList] = useState<any>([])
  const [_loading, _setLoading] = useState(false);
  const [_pageLoading, _setPageLoading] = useState(true);
  const [_popupItem, _setPopupItem] = useState<any>(null);
  const [_popupForm, _setPopupForm] = useState<any>({ amenities: [] })
  const [_formData, _setFormData] = useState<any>({
    amenities: [],
  });

  const changeFormData = (key: string, value: any) => {
    if (key === 'amenities') {
      _setPopupForm({ ..._popupForm, amenities: value })
    } else {
      _setPopupForm({ ..._popupForm, [key]: value })
    }
  }

  const handleAddAmenities = () => {
    const _tempArr = [..._formData?.amenities]
    const findIndex = _tempArr.findIndex((fItem: any) => fItem?.categoryId === _popupForm?.id)
    if (findIndex > -1) {
      _tempArr[findIndex] = { ..._tempArr[findIndex], subCategoryId: _popupForm?.amenities?.join(','), description: _popupForm?.description || '', }
    } else {
      _tempArr.push({
        id: 0,
        branchId: branchDetails?.branchDetails?.id,
        categoryId: _popupForm?.id,
        subCategoryId: _popupForm?.amenities?.join(','),
        isActive: true,
        description: _popupForm?.description || '',
      })
    }
    _setFormData({ ..._formData, amenities: [..._tempArr] })
    handleClearForm()
  }

  const handleClearForm = () => {
    _setPopupItem(null)
    _setPopupForm({ amenities: [] })
    _setLoading(false)
  }

  const handlePopupForm = (item: any) => {
    _setPopupItem({ ...item });
    const obj = _formData?.amenities?.find((fItem: any) => fItem?.categoryId === item?.id)
    _setPopupForm({ ...item, description: obj?.description, amenities: obj?.subCategoryId?.length ? obj?.subCategoryId?.split(',').filter(Boolean) : [] })
  }

  const getOtherList = () => {
    getMasterAmenitiesCategory()
      .then((resp) => {
        if (resp?.data?.status === "success") {
          _setCategoryList([...resp?.data?.result])
        }
      })
      .catch((err) => console.log(err))
    getMasterAmenitiesSubCategory()
      .then((resp) => {
        if (resp?.data?.status === "success") {
          _setSubCategoryList([...resp?.data?.result])
        }
      })
      .catch((err) => console.log(err))
    getBranchAmenitiesList(branchDetails?.branchDetails?.id)
      .then((resp) => {
        if (resp?.data?.status === "success") {
          _setFormData({ amenities: resp?.data?.result });
        }
      })
      .catch(console.log)
      .finally(() => _setPageLoading(false))
  }

  const handleSubmitForm = () => {
    _setLoading(true);

    const body = {
      amenities: _formData?.amenities || []
    }

    insertUpdateBranchAmenities(body)
      .then((resp) => {
        if (resp?.data?.status === "success") {
          dispatch({
            type: "SET_BRANCH_DETAILS",
            data: { ...branchDetails, amenities: body.amenities }
          })
          CustomAlert("success", "Branch amenities saved");
          handleNext()
        }
      })
      .catch(console.log)
      .finally(() => _setLoading(false));
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
      <div className="">
        {_categoryList?.map((mItem: any, mIndex: number) => mItem?.isActive && <div key={mIndex} className="row">
          <div className="col-md-4 my-3">
            <div className="customFieldBorder">
              <div className="p-2">{mItem?.name}</div>
            </div>
          </div>
          <div className="col-md-4 my-3">
            <div className="customFieldBorder d-flex align-items-center justify-content-between">
              <div className="p-2">
                {_formData?.amenities?.find((fItem: any) => fItem?.categoryId === mItem?.id)?.subCategoryId?.split(',').filter(Boolean)?.length || 0} Amenities added
              </div>
              <div className="borderLeftPrimary px-2">
                <img src={IMAGES_ICON.EditIcon} alt="Edit" draggable="false" role="button" onClick={() => handlePopupForm(mItem)} />
              </div>
            </div>
          </div>
          <div className="col-md-4 my-3">
            <div className="customFieldBorder d-flex align-items-center justify-content-between">
              <div className="p-2">{_formData?.amenities?.find((fItem: any) => fItem?.categoryId === mItem?.id)?.description || '(Empty)'}</div>
              <div className="borderLeftPrimary px-2">
                <img src={IMAGES_ICON.EditIcon} alt="Edit" draggable="false" role="button" onClick={() => handlePopupForm(mItem)} />
              </div>
            </div>
          </div>
        </div>
        )}
      </div>}
    <div className="row">
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
          <Button className="px-4" variant="contained" color="primary" disabled={_loading} onClick={handleSubmitForm}>Submit</Button>
        </div>
      </div>
    </div>
    <CustomDialogue displaySize={"xs"} title={_popupItem?.name} dialogueFlag={_popupItem !== null} onCloseClick={handleClearForm}
      mainContent={<div className="my-2">
        <CustomAutoMultiSelect value={_popupForm?.amenities?.map((mItem: any) => Number(mItem))}
          onChange={(value: any) => { changeFormData('amenities', value || '') }}
          placeholder={"Select amenities"}
          menuItem={_subCategoryList?.filter((fItem: any) => fItem?.categoryId === _popupForm?.id)?.map((item: any) => {
            return item?.isActive ? { title: (item?.subCategory || ''), value: item?.id } : null
          }).filter(Boolean)} />

        <TextField className="mt-3" sx={{ ...textFieldStyle }} fullWidth placeholder="Description"
          value={_popupForm?.description} onChange={(e) => _setPopupForm({ ..._popupForm, description: e.target.value })}
          multiline minRows={3} />
      </div>}
      actionContent={<div className="d-flex justify-content-center mb-3 flex-grow-1">
        <Button variant="contained" color="primary" disabled={_loading} onClick={handleAddAmenities}>Submit</Button>
      </div>
      } />
  </>
}
