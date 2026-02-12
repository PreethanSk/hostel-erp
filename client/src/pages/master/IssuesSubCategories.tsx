import { useEffect, useState } from "react";
import Checkbox from "@mui/material/Checkbox";
import { Button, FormControl, FormControlLabel, FormHelperText, MenuItem, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, } from "@mui/material";
import { CustomAlert, customTableHeader, customTableTemplate, getExportEXCEL, textFieldStyle } from "../../services/HelperService";
import { deleteMasterIssueSubCategory, getMasterIssueCategory, getMasterIssueSubCategory, insertUpdateMasterIssueSubCategory } from "../../models";
import { IMAGES_ICON } from "../../assets/images/exportImages";
import { SkeletonProviderTables } from "../../providers/SkeletonProvider";
import { KeyboardArrowRightRounded } from "@mui/icons-material";
import Swal from "sweetalert2";
import CustomSearch from "../../components/helpers/CustomSearch";

export default function Index({ PageAccess }: any) {
  const [_tableItems, _setTableItems] = useState<any>([]);
  const [_issueList, _setIssueList] = useState<any>([]);
  const [_tableLoading, _setTableLoading] = useState(true);
  const [_loading, _setLoading] = useState(false);
  const [_search, _setSearch] = useState('');
  const [_editForm, _setEditForm] = useState(false);
  const [_formData, _setFormData] = useState<any>({ id: 0, issueId: '', subCategoryName: '', isActive: true, notes: "" });

  const validate = {
    issueId: { error: false, message: '' },
    subCategoryName: { error: false, message: '' },
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
        deleteMasterIssueSubCategory(item?.id)
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
    _setLoading(false)
    _setValidate(validate)
    _setFormData({ id: 0, issueId: '', subCategoryName: '', isActive: true, notes: '' })
  }

  const checkValidation = () => {
    const validation = Object.assign(validate, {})
    let valid = true
    if (!_formData?.issueId) {
      validation.issueId.error = true;
      validation.issueId.message = 'Required Field';
      valid = false
    }
    if (!_formData?.subCategoryName?.trim()) {
      validation.subCategoryName.error = true;
      validation.subCategoryName.message = 'Required Field';
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
      issueId: _formData?.issueId,
      subCategoryName: _formData?.subCategoryName,
      isActive: _formData?.isActive,
      notes: _formData?.notes || ""
    }

    insertUpdateMasterIssueSubCategory(body)
      .then((resp) => {
        if (resp?.data?.status === "success") {
          getGridList()
          handleGoBack()
          CustomAlert('success', body.id === 0 ? "Successfully saved" : "Successfully Updated");
        } else {
          CustomAlert('warning', resp?.data?.error)
        }
      })
      .catch((err) => console.log(err))
      .finally(() => _setLoading(false))
  }

  const getPrintTableHeadBody = () => {
    const header = ["S. No", "Issue Type", "Issue Sub-Category", "Status"];
    let body: any = _tableItems?.map((item: any, index: number) => [
      index + 1,
      item?.issueType,
      item?.subCategoryName,
      item?.isActive ? "Active" : "Inactive"
    ]);
    return { header, body };
  };


  const exportEXCEL = () => {
    const { header, body } = getPrintTableHeadBody()
    getExportEXCEL({ header, body, fileName: "Issue Sub-Category" })
  }

  const getGridList = () => {
    _setTableLoading(true)
    getMasterIssueSubCategory()
      .then((resp) => {
        if (resp?.data?.status === "success") {
          _setTableItems([...resp?.data?.result])
        }
      })
      .catch((err) => console.log(err))
      .finally(() => _setTableLoading(false))
  }

  const getCategoryList = () => {
    getMasterIssueCategory()
      .then((resp) => {
        if (resp?.data?.status === "success") {
          _setIssueList([...resp?.data?.result])
        }
      })
      .catch((err) => console.log(err))
  }

  useEffect(() => {
    getGridList()
    getCategoryList()
  }, [])

  return (
    <>
      <div className="container">
        {!_editForm && (<>
          <div className="row justify-content-between align-items-center py-3">
            <div className="col-md-4 my-2">
              <div className="d-flex align-items-center gap-2 mobJustify">
                <span className="text-dark fw-bold">Master </span>
                <span className="text-dark"><KeyboardArrowRightRounded /></span>
                <span className="text-muted">Issue Sub Categories</span>
              </div>
            </div>
            <div className="my-2 col-md-6">
              <div className="d-flex justify-content-end align-items-center gap-4 mobJustify">
                <div className="line-item">
                  <Button className="text-capitalize" sx={{ color: "black" }} startIcon={<img height={18} src={IMAGES_ICON.TableNewItemIcon} />} onClick={() => _setEditForm(true)}>Add New</Button>
                </div>
                <CustomSearch getSearchText={(value: string) => _setSearch(value)} />
                <img height={24} draggable={false} src={IMAGES_ICON.TableDownloadIcon} role="button" onClick={exportEXCEL} />
              </div>
            </div>
          </div>

          <TableContainer className="tableBorder rounded">
            <Table sx={{ ...customTableTemplate }}>
              <TableHead>
                <TableRow className="px-2" sx={{ ...customTableHeader }}>
                  <TableCell className="fw-bold">S.No</TableCell>
                  <TableCell className="fw-bold">Issue Category</TableCell>
                  <TableCell className="fw-bold">Issue Sub-Category</TableCell>
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
                  })?.map((item: any, index: any) => (
                    <TableRow key={index} className="mt-2" style={{ border: "none", borderBottom: "1px solid #D2D2D2", }}>
                      <TableCell align="left">{index + 1}</TableCell>
                      <TableCell className="text-muted bolder text-nowrap">{item?.issueType}</TableCell>
                      <TableCell className="text-muted bolder text-nowrap">{item?.subCategoryName}</TableCell>
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
                ) : !_tableLoading && <TableRow key={0}>
                  <TableCell align={"center"} colSpan={5}>
                    <h3 className="text-muted">Data Not Found</h3>
                  </TableCell>
                </TableRow>
                }
                <SkeletonProviderTables columns={5} visible={_tableLoading} />
              </TableBody>
            </Table>
          </TableContainer>
        </>)}
        {_editForm && <div className="container py-3">
          <div className="bg-field-gray  border rounded px-4 py-1">
            <div className="d-flex align-items-center py-2 borderBottomLight" role="button" onClick={handleGoBack}>
              <img height={24} draggable={false} src={IMAGES_ICON.BackIcon} />
              <div className="fw-bold">Back</div>
            </div>
            <div className="bg-field-grayd-flex flex-column justify-content-between">
              <div className="row pb-3">
                <div className="col-md-3 my-3">
                  <div className="text-muted fs14 mb-1">Issue</div>
                  <FormControl fullWidth error={_validate?.issueId?.error}>
                    <Select size="small" value={_formData?.issueId} onChange={(e: any) => changeFormData('issueId', e.target.value)}
                      style={{ backgroundColor: "#F3F3F3", }}>
                      <MenuItem value="Select" disabled>Select</MenuItem>
                      {_issueList?.map((mItem: any) =>
                        mItem?.isActive && <MenuItem key={mItem?.id} value={mItem?.id}>{mItem?.issueType}</MenuItem>
                      )}
                    </Select>
                    <FormHelperText className="text-danger">{_validate?.issueId?.message}</FormHelperText>
                  </FormControl>
                </div>
                <div className="col-md-6 my-3">
                  <div className="text-muted fs14 mb-1">Issue Sub-Category</div>
                  <TextField fullWidth sx={{ ...textFieldStyle }}
                    value={_formData?.subCategoryName} onChange={(e: any) => changeFormData('subCategoryName', e.target.value)}
                    error={_validate?.subCategoryName?.error} helperText={_validate?.subCategoryName?.message} />
                </div>
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
        </div>}
      </div>
    </>
  );
}