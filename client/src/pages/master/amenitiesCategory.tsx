import { useEffect, useState } from "react";
import Checkbox from "@mui/material/Checkbox";
import { Button, FormControlLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, } from "@mui/material";
import { CustomAlert, customTableHeader, customTableTemplate, getExportEXCEL, textFieldStyle } from "../../services/HelperService";
import { deleteMasterAmenitiesCategory, getMasterAmenitiesCategory, insertUpdateMasterAmenitiesCategory } from "../../models";
import { IMAGES_ICON } from "../../assets/images/exportImages";
import { SkeletonProviderTables } from "../../providers/SkeletonProvider";
import { KeyboardArrowRightRounded } from "@mui/icons-material";
import Swal from "sweetalert2";
import CustomSearch from "../../components/helpers/CustomSearch";

export default function Index({ PageAccess }: any) {
  const [_tableItems, _setTableItems] = useState<any>([]);
  const [_tableLoading, _setTableLoading] = useState(true);
  const [_loading, _setLoading] = useState(false);
  const [_search, _setSearch] = useState('');
  const [_editForm, _setEditForm] = useState(false);
  const [_formData, _setFormData] = useState<any>({ id: 0, name: '', isActive: true, notes: '' });

  const validate = {
    name: { error: false, message: '' }
  }
  const [_validate, _setValidate] = useState(validate)

  const changeFormData = (key: string, value: any) => {
    _setFormData({ ..._formData, [key]: value });
  };

  const handleUpdateItem = (item: any) => {
    _setFormData({ ...item })
    _setEditForm(true)
  }

  const handleDeleteItem = (item: any) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this item!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#388024",
      cancelButtonColor: "#bf1029",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMasterAmenitiesCategory(item?.id)
          .then((resp) => {
            if (resp?.data?.status === "success") {
              CustomAlert('warning', resp?.data?.result)
              getGridList()
            }
          })
      }
    });
  }

  const handleGoBack = () => {
    _setEditForm(false)
    _setLoading(false);
    _setValidate(validate);
    _setFormData({ id: 0, name: '', isActive: true, notes: '' })
  }

  const checkValidation = () => {
    const validation = Object.assign(validate, {})
    let valid = true
    if (!_formData?.name?.trim()) {
      validation.name.error = true;
      validation.name.message = 'Required Field';
      valid = false
    }
    _setValidate({ ...validation })
    return valid
  }

  const handleSubmitForm = () => {
    _setLoading(true)
    if (!checkValidation()) {
      _setLoading(false)
      return
    }
    const body = {
      id: _formData?.id || 0,
      name: _formData?.name,
      isActive: _formData?.isActive,
      notes: _formData?.notes || ""
    }

    insertUpdateMasterAmenitiesCategory(body)
      .then((resp) => {
        if (resp?.data?.status === "success") {
          getGridList()
          handleGoBack()
          CustomAlert('success', body.id === 0 ? 'Successfully saved' : 'Successfully Updated');
        } else {
          CustomAlert('warning', resp?.data?.error)
        }
      })
      .catch((err) => console.log(err))
      .finally(() => _setLoading(false))
  }

  const getPrintTableHeadBody = () => {
    const header = ["S. No", "Category", "Status"];
    let body: any = _tableItems?.map((item: any, index: number) => {
      return [
        index + 1,
        item?.name,
        item?.isActive ? "Active" : "Inactive"
      ];
    });
    return { header: header, body: body }
  }

  const exportEXCEL = () => {
    const { header, body } = getPrintTableHeadBody()
    getExportEXCEL({ header, body, fileName: "Amenities" })
  }

  const getGridList = () => {
    _setTableLoading(true)
    getMasterAmenitiesCategory()
      .then((resp) => {
        if (resp?.data?.status === "success") {
          _setTableItems([...resp?.data?.result])
        }
      })
      .catch((err) => console.log(err))
      .finally(() => _setTableLoading(false))
  }

  useEffect(() => {
    getGridList()
  }, [])

  return <>
    <div className="container">
      {!_editForm && (<>
        <div className="row justify-content-between align-items-center py-3">
          <div className="col-md-4 my-2">
            <div className="d-flex align-items-center gap-2 mobJustify">
              <span className="text-dark fw-bold">Master </span>
              <span className="text-dark"><KeyboardArrowRightRounded /></span>
              <span className="text-muted">Amenities Category</span>
            </div>
          </div>
          <div className="my-2 col-md-6">
            <div className="d-flex justify-content-end align-items-center gap-4 mobJustify">
              <div className="line-item">
                <Button className="text-capitalize" sx={{ color: "black" }} startIcon={<img height={18} draggable={false} src={IMAGES_ICON.TableNewItemIcon} />} onClick={() => _setEditForm(true)}>Add New</Button>
              </div>
              <CustomSearch getSearchText={(value: string) => _setSearch(value)} />
              <img height={24} draggable={false} src={IMAGES_ICON.TableDownloadIcon} role="button" onClick={exportEXCEL} />
            </div>
          </div>
        </div>

        <div className="">
          <TableContainer className="tableBorder rounded">
            <Table sx={{ ...customTableTemplate }}>
              <TableHead>
                <TableRow className="px-2" sx={{ ...customTableHeader }}>
                  <TableCell className="fw-bold">S.No</TableCell>
                  <TableCell className="fw-bold">Category</TableCell>
                  <TableCell className="fw-bold" align="center">Status</TableCell>
                  <TableCell className="fw-bold" align="center">Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody sx={{}}>
                {_tableItems?.length > 0 ? (
                  _tableItems?.filter((content: any) => {
                    const lowerSearchInput = _search?.toLowerCase()?.trim();
                    return lowerSearchInput === '' || Object?.values(content)?.some((value) =>
                      value?.toString()?.toLowerCase()?.includes(lowerSearchInput)
                    );
                  })?.map((item: any, index: number) => (
                    <TableRow key={index} className="mt-2" style={{ border: "none", borderBottom: "1px solid #D2D2D2", }}>
                      <TableCell align="left">{index + 1}</TableCell>
                      <TableCell className="text-muted bolder text-nowrap">{item?.name}</TableCell>
                      <TableCell className="text-muted bolder" align="center">
                        {item?.isActive ? <span className="fs12 statusBgActive text-success rounded--50 px-3 py-1">Active</span>
                          : <span className="fs12 statusBgInactive text-danger rounded--50 px-3 py-1">Inactive</span>
                        }
                      </TableCell>
                      <TableCell className="" align="center">
                        <div className="d-flex align-items-center justify-content-center gap-3">
                          <div className="d-flex align-items-center justify-content-center gap-1" role="button" onClick={() => handleUpdateItem(item)}>
                            <span className="">Edit</span>
                            <img height="16" src={IMAGES_ICON.EditIcon} alt="icon" draggable="false" />
                          </div>
                          <div className="d-flex align-items-center justify-content-center gap-1" role="button" onClick={() => handleDeleteItem(item)}>
                            <span className="">Delete</span>
                            <img height="16" src={IMAGES_ICON.DeleteIcon} alt="icon" draggable="false" />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : !_tableLoading && (
                  <TableRow key={0}>
                    <TableCell align={"center"} colSpan={4}>
                      <h3 className="text-muted">Data Not Found</h3>
                    </TableCell>
                  </TableRow>
                )}
                <SkeletonProviderTables columns={4} visible={_tableLoading} />
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </>)}
      {_editForm && <div className="container py-3">
        <div className="bg-field-gray  border rounded px-4 py-1">
          <div className="d-flex align-items-center py-2 borderBottomLight" role="button" onClick={handleGoBack}>
            <img height={24} draggable={false} src={IMAGES_ICON.BackIcon} />
            <div className="fw-bold">Back</div>
          </div>
          <div className="bg-field-gray d-flex flex-column justify-content-between">
            <div className="row pb-3">
              <div className="col-md-6 mt-3">
                <div className="text-muted fs14 mb-1">Category</div>
                <TextField className="" fullWidth sx={{ ...textFieldStyle }}
                  value={_formData?.name} onChange={(e: any) => changeFormData('name', e.target.value)}
                  error={_validate?.name?.error} helperText={_validate?.name?.message} />
              </div>
            </div>
            <div className="row">
              <hr />
              <div className="col-md-8 mb-2">
                <TextField sx={{ ...textFieldStyle }} className="" fullWidth placeholder="Add Notes"
                  value={_formData?.notes} onChange={(e: any) => changeFormData('notes', e.target.value)} />
              </div>
              <div className="col-md-4 mb-2">
                <div className="d-flex align-items-center justify-content-end mobJustify gap-2">
                  <FormControlLabel label="Active"
                    control={<Checkbox className="text-capitalize" checked={_formData?.isActive}
                      onChange={() => changeFormData('isActive', !_formData?.isActive)} />} />
                  <Button variant="contained" color="primary" disabled={_loading} className="" onClick={handleSubmitForm}>Save</Button>
                  <Button className="text-capitalize bg-white" variant="outlined" onClick={handleGoBack}>Back</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>}
    </div>
  </>
}
