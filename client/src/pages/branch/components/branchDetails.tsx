import { Button, Checkbox, FormControlLabel, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { CustomAlert, DisableKeyUpDown, textFieldStyle } from "../../../services/HelperService";
import { getAllCityByStateCode, getAllCountry, getAllStateByCountryCode, getBranchRoomsList, insertUpdateBranchDetails } from "../../../models";
import { validatePinCode } from "../../../services/ValidationService";
import { CustomAutoSelect } from "../../../components/helpers/CustomSelect";
import { useStateValue } from "../../../providers/StateProvider";

export default function BranchDetails({ handleBack, handleNext }: any) {
  const [{ branchDetails }, dispatch]: any = useStateValue()
  const [_countryList, _setCountryList] = useState<any>([])
  const [_stateList, _setStateList] = useState<any>([])
  const [_cityList, _setCityList] = useState<any>([])
  const [_loading, _setLoading] = useState(false)
  const [_totalRoomCot, _setTotalRoomCot] = useState({ room: 0, cot: 0 })
  const [_formData, _setFormData] = useState<any>({
    id: 0, branchName: "", contactPerson: "", branchAddress: "", numberOfRooms: "",
    numberOfCots: "", isActive: true, mobileNumber: "", pincode: "", city: "", state: 31, country: 101,
    notes: '',
  })

  const validate = {
    branchName: { error: false, message: "" },
    numberOfRooms: { error: false, message: "" },
    numberOfCots: { error: false, message: "" },
    contactPerson: { error: false, message: "" },
    mobileNumber: { error: false, message: "" },
    branchAddress: { error: false, message: "" },
    pincode: { error: false, message: "" },
    country: { error: false, message: "" },
    state: { error: false, message: "" },
    city: { error: false, message: "" },
  }
  const [_validate, _setValidate] = useState(validate);

  const changeFormData = (key: string, value: any) => {
    let processedValue = value;

    // Handle mobile number validation
    if (key === "mobileNumber") {
      // Only allow digits and limit to 10 characters
      const digitsOnly = value.replace(/\D/g, '');
      processedValue = digitsOnly.slice(0, 10);
    }

    const newForm = { ..._formData, [key]: processedValue };
    if (key === "country") {
      newForm.state = "";
      newForm.city = "";
    } else if (key === "state") {
      newForm.city = "";
    }
    _setFormData(newForm);
  }

  const checkValidation = () => {
    let valid = true;
    const validation = { ...validate }

    if (!_formData?.branchName?.trim()) {
      validation.branchName.error = true;
      validation.branchName.message = "Required Field";
      valid = false;
    }
    if (!_formData?.numberOfRooms) {
      validation.numberOfRooms.error = true;
      validation.numberOfRooms.message = "Required Field";
      valid = false;
    }
    if (!_formData?.numberOfCots) {
      validation.numberOfCots.error = true;
      validation.numberOfCots.message = "Required Field";
      valid = false;
    }
    if (!_formData?.contactPerson?.trim()) {
      validation.contactPerson.error = true;
      validation.contactPerson.message = "Required Field";
      valid = false;
    }
    if (!_formData?.mobileNumber?.trim()) {
      validation.mobileNumber.error = true;
      validation.mobileNumber.message = "Required Field";
      valid = false;
    }
    if (!_formData?.branchAddress?.trim()) {
      validation.branchAddress.error = true;
      validation.branchAddress.message = "Required Field";
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
      CustomAlert('warning', "Country not selected")
      valid = false;
    }
    if (!_formData?.state) {
      CustomAlert('warning', "State not selected")
      valid = false;
    }
    if (!_formData?.city) {
      CustomAlert('warning', "City not selected")
      valid = false;
    }

    if (_formData?.id) {
      if (_totalRoomCot?.cot > _formData?.numberOfCots) {
        CustomAlert('warning', "Available Cots is higher then given number")
        valid = false;
      }
      if (_totalRoomCot?.room > _formData?.numberOfRooms) {
        CustomAlert('warning', "Available Rooms is higher then given number")
        valid = false;
      }
    }
    _setValidate(validation);
    return valid;
  }


  const handleSubmitForm = () => {
    _setLoading(true);
    if (!checkValidation()) {
      _setLoading(false);
      return;
    }

    const body = {
      id: _formData?.id || 0,
      branchName: _formData?.branchName || "",
      contactPerson: _formData?.contactPerson || "",
      branchAddress: _formData?.branchAddress || "",
      numberOfRooms: Number(_formData?.numberOfRooms || '0'),
      numberOfCots: Number(_formData?.numberOfCots || '0'),
      isActive: _formData?.isActive || false,
      mobileNumber: _formData?.mobileNumber || "",
      pincode: _formData?.pincode || "",
      city: _formData?.city + "",
      state: _formData?.state + "",
      country: _formData?.country + "",
      notes: _formData?.notes || "",
    }

    insertUpdateBranchDetails(body)
      .then((resp) => {
        if (resp?.data?.status === "success") {
          if (body?.id === 0) {
            body.id = resp?.data?.result?.branchId
          }
          dispatch({
            type: "SET_BRANCH_DETAILS",
            data: { ...branchDetails, branchDetails: body }
          })
          CustomAlert("success", "Branch details saved");
          handleNext()
        }
      })
      .catch(console.log)
      .finally(() => _setLoading(false));
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

  const getBranchRoomsDetails = (id: number) => {
    getBranchRoomsList(id, 'admin')
      .then((resp) => {
        if (resp?.data?.status === "success") {
          const total_data = resp?.data?.result.flatMap((room: any) =>
            room?.Cots?.length > 0
              ? room?.Cots.map((cot: any) => ({ ...room, cot }))
              : [{ ...room, cot: {} }]
          )
          _setTotalRoomCot({ room: resp?.data?.result?.filter((fItem: any) => fItem?.isActive)?.length, cot: total_data?.filter((fItem: any) => fItem?.cot?.isActive)?.length })
        }
      })
      .catch(console.log)
  }
  useEffect(() => {
    if (branchDetails) {
      _setFormData({ ...branchDetails?.branchDetails })
      getBranchRoomsDetails(branchDetails?.branchDetails?.id)
    }
    getOtherList()
  }, [branchDetails])

  return <>
    <div className="p-4">
      <div className="row">
        <div className="col-md-4 my-3">
          <div className="text-muted fs14 mb-1 required">Branch Name</div>
          <TextField autoComplete="off" fullWidth sx={{ ...textFieldStyle }}
            value={_formData?.branchName} onChange={(e: any) => changeFormData('branchName', e.target.value)}
            error={_validate?.branchName?.error} helperText={_validate?.branchName?.message} />
        </div>
        <div className="col-md-2 my-3">
          <div className="text-muted fs14 mb-1 required">Number of Rooms</div>
          <TextField fullWidth sx={{ ...textFieldStyle }} type="number" autoComplete="off" onKeyDown={DisableKeyUpDown}
            value={_formData?.numberOfRooms} onChange={(e: any) => changeFormData('numberOfRooms', e.target.value)}
            error={_validate?.numberOfRooms?.error} helperText={_validate?.numberOfRooms?.message} />
        </div>
        <div className="col-md-2 my-3">
          <div className="text-muted fs14 mb-1 required">Number of Cots</div>
          <TextField fullWidth sx={{ ...textFieldStyle }} type="number" autoComplete="off" onKeyDown={DisableKeyUpDown}
            value={_formData?.numberOfCots} onChange={(e: any) => changeFormData('numberOfCots', e.target.value)}
            error={_validate?.numberOfCots?.error} helperText={_validate?.numberOfCots?.message} />
        </div>
        <div className=""></div>
        <div className="col-md-4 my-3">
          <div className="text-muted fs14 mb-1 required">Contact Person Name</div>
          <TextField fullWidth sx={{ ...textFieldStyle }}
            value={_formData?.contactPerson} onChange={(e: any) => changeFormData('contactPerson', e.target.value)}
            error={_validate?.contactPerson?.error} helperText={_validate?.contactPerson?.message} />
        </div>
        <div className="col-md-4 my-3">
          <div className="text-muted fs14 mb-1 required">Mobile Number</div>
          <TextField fullWidth sx={{ ...textFieldStyle }} autoComplete="off"
            value={_formData?.mobileNumber} onChange={(e: any) => changeFormData('mobileNumber', e.target.value)}
            slotProps={{
              input: {
                startAdornment: <span className="fw-bold me-1">+{_countryList?.find((fItem: any) => fItem?.id === Number(_formData?.country))?.phoneCode}-</span>,
                endAdornment: _formData?.mobileNumber && (
                  <span className="ms-2">
                    {_formData?.mobileNumber?.length === 10 ? (
                      <span style={{ color: '#4caf50', fontSize: '16px' }}>✓</span>
                    ) : (
                      <span style={{ color: '#f44336', fontSize: '16px' }}>✕</span>
                    )}
                  </span>
                )
              }
            }}
            error={_validate?.mobileNumber?.error} helperText={_validate?.mobileNumber?.message} />
        </div>
        <div className=""></div>
        <div className="col-md-8 my-3">
          <div className="text-muted fs14 mb-1 required">Branch Full Address</div>
          <TextField fullWidth sx={{ ...textFieldStyle }}
            value={_formData?.branchAddress} onChange={(e: any) => changeFormData('branchAddress', e.target.value)}
            error={_validate?.branchAddress?.error} helperText={_validate?.branchAddress?.message} />
        </div>
        <div className=""></div>
        <div className="col-md-3 my-3">
          <div className="text-muted fs14 mb-1 required">Pincode</div>
          <TextField fullWidth sx={{ ...textFieldStyle }}
            value={_formData?.pincode} onChange={(e: any) => changeFormData('pincode', e.target.value)}
            error={_validate?.pincode?.error} helperText={_validate?.pincode?.message} />
        </div>
        <div className="col-md-3 my-3">
          <div className="text-muted fs14 mb-1 required">Country</div>
          <CustomAutoSelect value={Number(_formData?.country)}
            onChange={(value: any) => { changeFormData('country', value || '') }}
            menuItem={_countryList?.map((item: any) => {
              return item?.isActive ? { title: (item?.name || ''), value: item?.id } : null
            })?.filter(Boolean)} />
        </div>
        <div className="col-md-3 my-3">
          <div className="text-muted fs14 mb-1 required">State</div>
          <CustomAutoSelect value={Number(_formData?.state)}
            onChange={(value: any) => { changeFormData('state', value || '') }}
            menuItem={_stateList?.map((item: any) => {
              return item?.isActive ? { title: (item?.name || ''), value: item?.id } : null
            })?.filter(Boolean)} />
        </div>
        <div className="col-md-3 my-3">
          <div className="text-muted fs14 mb-1 required">City</div>
          <TextField fullWidth sx={{ ...textFieldStyle }}
            value={_formData?.city} onChange={(e: any) => changeFormData('city', e.target.value)} />
          {/* <CustomAutoSelect value={Number(_formData?.city)}
            onChange={(value: any) => { changeFormData('city', value || '') }}
            menuItem={_cityList?.map((item: any) => {
              return item?.isActive ? { title: (item?.name || ''), value: item?.id } : null
            })?.filter(Boolean)} /> */}
        </div>
      </div>
    </div>
    <div className="row">
      <hr />
      <div className="col-md-8 mb-2">
        <TextField sx={{ ...textFieldStyle }} className="" fullWidth placeholder="Add Notes" autoComplete="off"
          value={_formData?.notes} onChange={(e: any) => changeFormData('notes', e.target.value)} />
      </div>
      <div className="col-md-4 mb-2">
        <div className="d-flex align-items-center justify-content-end mobJustify gap-3">
          <FormControlLabel label="Active"
            control={<Checkbox className="text-capitalize" checked={_formData?.isActive}
              onChange={() => changeFormData('isActive', !_formData?.isActive)} />} />
          <Button className="px-4 text-capitalize" variant="outlined" sx={{ color: "black" }} disabled={_loading} onClick={handleBack}>Back</Button>
          <Button className="px-4" variant="contained" color="primary" disabled={_loading} onClick={handleSubmitForm}>Next</Button>
        </div>
      </div>
    </div>
    {/* <div className="px-4 d-flex align-items-center justify-content-end mobJustify gap-2">
            <Button className="text-capitalize px-4" sx={{ color: "black" }} onClick={handleClearForm}>Clear</Button>
            <Button variant="contained" color="primary" disabled={_loading} className="px-4" onClick={handleSubmitForm}>Save</Button>
        </div> */}
  </>
}
