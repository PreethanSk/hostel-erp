import { useEffect, useState } from "react";
import { getBranchAmenitiesList, getMasterAmenitiesCategory, getMasterAmenitiesSubCategory, getMasterAmenitiesFacilities, insertUpdateBranchAmenities } from "../../../models";
import { useStateValue } from "../../../providers/StateProvider";
import { Button, Checkbox, FormControlLabel, Box, Typography, Divider, IconButton, Skeleton } from "@mui/material";
import Grid2 from '@mui/material/Grid2';
import { CustomAlert } from "../../../services/HelperService";
import { CustomAutoMultiSelect } from "../../../components/helpers/CustomSelect";
import { Pencil } from 'lucide-react';
import DialogModal from "../../../components/shared/DialogModal";
import { gray } from "../../../theme/tokens";

export default function BranchAmenities({ handleBack, handleNext }: any) {
  const [{ branchDetails }, dispatch]: any = useStateValue();
  const [_categoryList, _setCategoryList] = useState<any>([]);
  const [_subCategoryList, _setSubCategoryList] = useState<any>([]);
  const [_facilitiesList, _setFacilitiesList] = useState<any>([]);
  const [_loading, _setLoading] = useState(false);
  const [_pageLoading, _setPageLoading] = useState(true);
  const [_popupItem, _setPopupItem] = useState<any>(null);
  const [_popupForm, _setPopupForm] = useState<any>({ amenities: [], facilities: [] });
  const [_formData, _setFormData] = useState<any>({ amenities: [] });

  const changeFormData = (key: string, value: any) => {
    if (key === 'amenities') _setPopupForm({ ..._popupForm, amenities: value || [] });
    else if (key === 'facilities') _setPopupForm({ ..._popupForm, facilities: value || [] });
    else _setPopupForm({ ..._popupForm, [key]: value });
  };

  const handleAddAmenities = () => {
    const _tempArr = [..._formData?.amenities];
    const findIndex = _tempArr.findIndex((fItem: any) => fItem?.categoryId === _popupForm?.id);
    const payload = {
      subCategoryId: _popupForm?.amenities?.join(',') || '',
      facilityId: _popupForm?.facilities?.join(',') || '',
      description: _popupForm?.description || '',
    };
    if (findIndex > -1) {
      _tempArr[findIndex] = { ..._tempArr[findIndex], ...payload };
    } else {
      _tempArr.push({
        id: 0, branchId: branchDetails?.branchDetails?.id, categoryId: _popupForm?.id,
        ...payload, isActive: true,
      });
    }
    _setFormData({ ..._formData, amenities: [..._tempArr] });
    handleClearForm();
  };

  const handleClearForm = () => {
    _setPopupItem(null);
    _setPopupForm({ amenities: [], facilities: [] });
    _setLoading(false);
  };

  const handlePopupForm = (item: any) => {
    _setPopupItem({ ...item });
    const obj = _formData?.amenities?.find((fItem: any) => fItem?.categoryId === item?.id);
    _setPopupForm({
      ...item,
      description: obj?.description,
      amenities: obj?.subCategoryId?.length ? obj?.subCategoryId?.split(',').filter(Boolean) : [],
      facilities: obj?.facilityId?.length ? obj?.facilityId?.split(',').filter(Boolean) : [],
    });
  };

  const getOtherList = () => {
    getMasterAmenitiesCategory()
      .then((resp) => { if (resp?.data?.status === "success") _setCategoryList([...resp?.data?.result]); })
      .catch(console.log);
    getMasterAmenitiesSubCategory()
      .then((resp) => { if (resp?.data?.status === "success") _setSubCategoryList([...resp?.data?.result]); })
      .catch(console.log);
    getMasterAmenitiesFacilities()
      .then((resp) => { if (resp?.data?.status === "success") _setFacilitiesList([...resp?.data?.result]); })
      .catch(console.log);
    getBranchAmenitiesList(branchDetails?.branchDetails?.id)
      .then((resp) => { if (resp?.data?.status === "success") _setFormData({ amenities: resp?.data?.result }); })
      .catch(console.log)
      .finally(() => _setPageLoading(false));
  };

  const handleSubmitForm = () => {
    _setLoading(true);
    const body = { amenities: _formData?.amenities || [] };
    insertUpdateBranchAmenities(body)
      .then((resp) => {
        if (resp?.data?.status === "success") {
          dispatch({ type: "SET_BRANCH_DETAILS", data: { ...branchDetails, amenities: body.amenities } });
          CustomAlert("success", "Branch amenities saved");
          handleNext();
        }
      })
      .catch(console.log)
      .finally(() => _setLoading(false));
  };

  useEffect(() => { if (branchDetails) getOtherList(); }, [branchDetails]);

  return (
    <Box>
      {_pageLoading ? (
        <Box sx={{ py: 4 }}>
          <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2 }} />
        </Box>
      ) : (
        <Box>
          {/* Column headers */}
          <Grid2 container spacing={3} sx={{ mb: 0.5 }}>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: gray[700], px: 1.5 }}>Category</Typography>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: gray[700], px: 1.5 }}>Sub Categories</Typography>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: gray[700], px: 1.5 }}>Facilities</Typography>
            </Grid2>
          </Grid2>
          {_categoryList?.map((mItem: any, mIndex: number) => mItem?.isActive && (
            <Grid2 container spacing={3} key={mIndex} sx={{ mb: 1 }}>
              <Grid2 size={{ xs: 12, md: 4 }}>
                <Box sx={{ border: `1px solid ${gray[300]}`, borderRadius: 1, p: 1.5 }}>
                  <Typography variant="body2">{mItem?.name}</Typography>
                </Box>
              </Grid2>
              <Grid2 size={{ xs: 12, md: 4 }}>
                <Box sx={{ border: `1px solid ${gray[300]}`, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ p: 1.5 }}>
                    {(() => {
                      const row = _formData?.amenities?.find((fItem: any) => fItem?.categoryId === mItem?.id);
                      const ids = row?.subCategoryId?.split(',').filter(Boolean) || [];
                      const names = ids.map((id: string) => _subCategoryList?.find((s: any) => String(s?.id) === String(id))?.subCategory).filter(Boolean);
                      return names?.length ? names.join(', ') : (ids.length ? `${ids.length} selected` : '—');
                    })()}
                  </Typography>
                  <Box sx={{ borderLeft: `1px solid ${gray[300]}`, px: 1 }}>
                    <IconButton size="small" onClick={() => handlePopupForm(mItem)}>
                      <Pencil size={16} color={gray[500]} />
                    </IconButton>
                  </Box>
                </Box>
              </Grid2>
              <Grid2 size={{ xs: 12, md: 4 }}>
                <Box sx={{ border: `1px solid ${gray[300]}`, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ p: 1.5 }}>
                    {(() => {
                      const row = _formData?.amenities?.find((fItem: any) => fItem?.categoryId === mItem?.id);
                      const ids = row?.facilityId?.split(',').filter(Boolean) || [];
                      const names = ids.map((id: string) => _facilitiesList?.find((f: any) => String(f?.id) === String(id))?.facilityName).filter(Boolean);
                      return names?.length ? names.join(', ') : (ids.length ? `${ids.length} selected` : '—');
                    })()}
                  </Typography>
                  <Box sx={{ borderLeft: `1px solid ${gray[300]}`, px: 1 }}>
                    <IconButton size="small" onClick={() => handlePopupForm(mItem)}>
                      <Pencil size={16} color={gray[500]} />
                    </IconButton>
                  </Box>
                </Box>
              </Grid2>
            </Grid2>
          ))}
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
              sx={{ textTransform: 'none', px: 4 }}>Submit</Button>
          </Box>
        </Grid2>
      </Grid2>

      {/* Amenities Popup */}
      <DialogModal open={_popupItem !== null} onClose={handleClearForm} title={_popupItem?.name} maxWidth="xs">
        <Box sx={{ py: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: gray[700], mb: 0.5 }}>Sub Categories</Typography>
          <CustomAutoMultiSelect value={_popupForm?.amenities?.map((mItem: any) => Number(mItem))}
            onChange={(value: any) => changeFormData('amenities', value || '')}
            placeholder="Select sub categories"
            menuItem={_subCategoryList?.filter((fItem: any) => fItem?.categoryId === _popupForm?.id)?.map((item: any) =>
              item?.isActive ? { title: (item?.subCategory || ''), value: item?.id } : null
            ).filter(Boolean)} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: gray[700], mt: 2, mb: 0.5 }}>Facilities</Typography>
          <CustomAutoMultiSelect value={_popupForm?.facilities?.map((mItem: any) => Number(mItem))}
            onChange={(value: any) => changeFormData('facilities', value || '')}
            placeholder="Select facilities (from master list)"
            menuItem={_facilitiesList
              ?.filter((f: any) => f?.isActive && _popupForm?.amenities?.some((sid: string) => String(sid) === String(f?.subCategoryId)))
              ?.map((item: any) => ({ title: (item?.facilityName || ''), value: item?.id })) || []} />
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button variant="contained" color="primary" disabled={_loading} onClick={handleAddAmenities}
              sx={{ textTransform: 'none', px: 4 }}>Submit</Button>
          </Box>
        </Box>
      </DialogModal>
    </Box>
  );
}
