import { Button, Checkbox, FormControlLabel, TextField, Box, Divider, Typography } from "@mui/material";
import Grid2 from '@mui/material/Grid2';
import { useEffect, useState } from "react";
import { CustomAlert, DisableKeyUpDown } from "../../../services/HelperService";
import { getAllCityByStateCode, getAllCountry, getAllStateByCountryCode, getBranchRoomsList, insertUpdateBranchDetails } from "../../../models";
import { validatePinCode } from "../../../services/ValidationService";
import { CustomAutoSelect } from "../../../components/helpers/CustomSelect";
import { useStateValue } from "../../../providers/StateProvider";
import FormField from "../../../components/shared/FormField";
import { gray } from "../../../theme/tokens";
import { Check, X } from 'lucide-react';

export default function BranchDetails({ handleBack, handleNext }: any) {
  const [{ branchDetails }, dispatch]: any = useStateValue();
  const [_countryList, _setCountryList] = useState<any>([]);
  const [_stateList, _setStateList] = useState<any>([]);
  const [_cityList, _setCityList] = useState<any>([]);
  const [_loading, _setLoading] = useState(false);
  const [_totalRoomCot, _setTotalRoomCot] = useState({ room: 0, cot: 0 });
  const [_formData, _setFormData] = useState<any>({
    id: 0, branchName: "", contactPerson: "", branchAddress: "", numberOfRooms: "",
    numberOfCots: "", isActive: true, mobileNumber: "", pincode: "", city: "", state: 31, country: 101, notes: '',
  });

  const validate = {
    branchName: { error: false, message: "" }, numberOfRooms: { error: false, message: "" },
    numberOfCots: { error: false, message: "" }, contactPerson: { error: false, message: "" },
    mobileNumber: { error: false, message: "" }, branchAddress: { error: false, message: "" },
    pincode: { error: false, message: "" }, country: { error: false, message: "" },
    state: { error: false, message: "" }, city: { error: false, message: "" },
  };
  const [_validate, _setValidate] = useState(validate);

  const changeFormData = (key: string, value: any) => {
    let processedValue = value;
    if (key === "mobileNumber") {
      const digitsOnly = value.replace(/\D/g, '');
      processedValue = digitsOnly.slice(0, 10);
    }
    const newForm = { ..._formData, [key]: processedValue };
    if (key === "country") { newForm.state = ""; newForm.city = ""; }
    else if (key === "state") { newForm.city = ""; }
    _setFormData(newForm);
  };

  const checkValidation = () => {
    let valid = true;
    const validation = { ...validate };
    if (!_formData?.branchName?.trim()) { validation.branchName = { error: true, message: "Required Field" }; valid = false; }
    if (!_formData?.numberOfRooms) { validation.numberOfRooms = { error: true, message: "Required Field" }; valid = false; }
    if (!_formData?.numberOfCots) { validation.numberOfCots = { error: true, message: "Required Field" }; valid = false; }
    if (!_formData?.contactPerson?.trim()) { validation.contactPerson = { error: true, message: "Required Field" }; valid = false; }
    if (!_formData?.mobileNumber?.trim()) { validation.mobileNumber = { error: true, message: "Required Field" }; valid = false; }
    if (!_formData?.branchAddress?.trim()) { validation.branchAddress = { error: true, message: "Required Field" }; valid = false; }
    if (!_formData?.pincode?.trim()) { validation.pincode = { error: true, message: "Required Field" }; valid = false; }
    if (_formData?.pincode?.trim() && !validatePinCode(_formData?.pincode)) { validation.pincode = { error: true, message: "Enter valid pincode number" }; valid = false; }
    if (!_formData?.country) { CustomAlert('warning', "Country not selected"); valid = false; }
    if (!_formData?.state) { CustomAlert('warning', "State not selected"); valid = false; }
    if (!_formData?.city) { CustomAlert('warning', "City not selected"); valid = false; }
    if (_formData?.id) {
      if (_totalRoomCot?.cot > _formData?.numberOfCots) { CustomAlert('warning', "Available Beds is higher than given number"); valid = false; }
      if (_totalRoomCot?.room > _formData?.numberOfRooms) { CustomAlert('warning', "Available Rooms is higher than given number"); valid = false; }
    }
    _setValidate(validation);
    return valid;
  };

  const handleSubmitForm = () => {
    _setLoading(true);
    if (!checkValidation()) { _setLoading(false); return; }
    const body = {
      id: _formData?.id || 0, branchName: _formData?.branchName || "",
      contactPerson: _formData?.contactPerson || "", branchAddress: _formData?.branchAddress || "",
      numberOfRooms: Number(_formData?.numberOfRooms || '0'), numberOfCots: Number(_formData?.numberOfCots || '0'),
      isActive: _formData?.isActive || false, mobileNumber: _formData?.mobileNumber || "",
      pincode: _formData?.pincode || "", city: _formData?.city + "", state: _formData?.state + "",
      country: _formData?.country + "", notes: _formData?.notes || "",
    };
    insertUpdateBranchDetails(body)
      .then((resp) => {
        if (resp?.data?.status === "success") {
          if (body?.id === 0) body.id = resp?.data?.result?.branchId;
          dispatch({ type: "SET_BRANCH_DETAILS", data: { ...branchDetails, branchDetails: body } });
          CustomAlert("success", "Branch details saved");
          handleNext();
        }
      })
      .catch(console.log)
      .finally(() => _setLoading(false));
  };

  const getOtherList = () => {
    getAllCountry()
      .then((resp) => { if (resp?.data?.status === "success") _setCountryList(resp?.data?.result); })
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

  const getBranchRoomsDetails = (id: number) => {
    getBranchRoomsList(id, 'admin')
      .then((resp) => {
        if (resp?.data?.status === "success") {
          const total_data = resp?.data?.result.flatMap((room: any) =>
            room?.Cots?.length > 0 ? room?.Cots.map((cot: any) => ({ ...room, cot })) : [{ ...room, cot: {} }]
          );
          _setTotalRoomCot({ room: resp?.data?.result?.filter((fItem: any) => fItem?.isActive)?.length, cot: total_data?.filter((fItem: any) => fItem?.cot?.isActive)?.length });
        }
      })
      .catch(console.log);
  };

  useEffect(() => {
    if (branchDetails) { _setFormData({ ...branchDetails?.branchDetails }); getBranchRoomsDetails(branchDetails?.branchDetails?.id); }
    getOtherList();
  }, [branchDetails]);

  return (
    <Box>
      <Grid2 container spacing={3}>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <FormField label="Branch Name" required error={_validate?.branchName?.error ? _validate?.branchName?.message : undefined}>
            <TextField autoComplete="off" fullWidth size="small"
              value={_formData?.branchName} onChange={(e: any) => changeFormData('branchName', e.target.value)}
              error={_validate?.branchName?.error} />
          </FormField>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 2 }}>
          <FormField label="Number of Rooms" required error={_validate?.numberOfRooms?.error ? _validate?.numberOfRooms?.message : undefined}>
            <TextField fullWidth size="small" type="number" autoComplete="off" onKeyDown={DisableKeyUpDown}
              value={_formData?.numberOfRooms} onChange={(e: any) => changeFormData('numberOfRooms', e.target.value)}
              error={_validate?.numberOfRooms?.error} />
          </FormField>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 2 }}>
          <FormField label="Number of Beds" required error={_validate?.numberOfCots?.error ? _validate?.numberOfCots?.message : undefined}>
            <TextField fullWidth size="small" type="number" autoComplete="off" onKeyDown={DisableKeyUpDown}
              value={_formData?.numberOfCots} onChange={(e: any) => changeFormData('numberOfCots', e.target.value)}
              error={_validate?.numberOfCots?.error} />
          </FormField>
        </Grid2>
        <Grid2 size={12}><Box /></Grid2>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <FormField label="Contact Person Name" required error={_validate?.contactPerson?.error ? _validate?.contactPerson?.message : undefined}>
            <TextField fullWidth size="small"
              value={_formData?.contactPerson} onChange={(e: any) => changeFormData('contactPerson', e.target.value)}
              error={_validate?.contactPerson?.error} />
          </FormField>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <FormField label="Mobile Number" required error={_validate?.mobileNumber?.error ? _validate?.mobileNumber?.message : undefined}>
            <TextField fullWidth size="small" autoComplete="off"
              value={_formData?.mobileNumber} onChange={(e: any) => changeFormData('mobileNumber', e.target.value)}
              error={_validate?.mobileNumber?.error}
              slotProps={{
                input: {
                  startAdornment: <Typography variant="body2" sx={{ fontWeight: 600, mr: 0.5, whiteSpace: 'nowrap' }}>+{_countryList?.find((fItem: any) => fItem?.id === Number(_formData?.country))?.phoneCode}-</Typography>,
                  endAdornment: _formData?.mobileNumber ? (
                    _formData?.mobileNumber?.length === 10 ? <Check size={16} color="#4caf50" /> : <X size={16} color="#f44336" />
                  ) : null,
                }
              }} />
          </FormField>
        </Grid2>
        <Grid2 size={12}><Box /></Grid2>
        <Grid2 size={{ xs: 12, md: 8 }}>
          <FormField label="Branch Full Address" required error={_validate?.branchAddress?.error ? _validate?.branchAddress?.message : undefined}>
            <TextField fullWidth size="small"
              value={_formData?.branchAddress} onChange={(e: any) => changeFormData('branchAddress', e.target.value)}
              error={_validate?.branchAddress?.error} />
          </FormField>
        </Grid2>
        <Grid2 size={12}><Box /></Grid2>
        <Grid2 size={{ xs: 12, md: 3 }}>
          <FormField label="Pincode" required error={_validate?.pincode?.error ? _validate?.pincode?.message : undefined}>
            <TextField fullWidth size="small"
              value={_formData?.pincode} onChange={(e: any) => changeFormData('pincode', e.target.value)}
              error={_validate?.pincode?.error} />
          </FormField>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 3 }}>
          <FormField label="Country" required>
            <CustomAutoSelect value={Number(_formData?.country)}
              onChange={(value: any) => changeFormData('country', value || '')}
              menuItem={_countryList?.map((item: any) => item?.isActive ? { title: (item?.name || ''), value: item?.id } : null)?.filter(Boolean)} />
          </FormField>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 3 }}>
          <FormField label="State" required>
            <CustomAutoSelect value={Number(_formData?.state)}
              onChange={(value: any) => changeFormData('state', value || '')}
              menuItem={_stateList?.map((item: any) => item?.isActive ? { title: (item?.name || ''), value: item?.id } : null)?.filter(Boolean)} />
          </FormField>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 3 }}>
          <FormField label="City" required>
            <TextField fullWidth size="small"
              value={_formData?.city} onChange={(e: any) => changeFormData('city', e.target.value)} />
          </FormField>
        </Grid2>
      </Grid2>

      <Divider sx={{ my: 2 }} />

      <Grid2 container spacing={3} sx={{ alignItems: 'center' }}>
        <Grid2 size={{ xs: 12, md: 8 }}>
          <TextField size="small" fullWidth placeholder="Add Notes" autoComplete="off"
            value={_formData?.notes} onChange={(e: any) => changeFormData('notes', e.target.value)} />
        </Grid2>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
            <FormControlLabel label="Active"
              control={<Checkbox checked={_formData?.isActive} onChange={() => changeFormData('isActive', !_formData?.isActive)} />} />
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
