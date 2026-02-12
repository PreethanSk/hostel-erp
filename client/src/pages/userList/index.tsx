import { useEffect, useState } from "react";
import { Button, Checkbox, FormControl, FormControlLabel, FormHelperText, MenuItem, Pagination, PaginationItem, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, } from "@mui/material";
import { CustomAlert, customTableHeader, customTableTemplate, DisableKeyUpDown, getExportEXCEL, textFieldStyle } from "../../services/HelperService";
import { getAdminUserList, getBranchGridList, getMasterUserRole, insertUpdateUserRegister } from "../../models";
import { IMAGES_ICON } from "../../assets/images/exportImages";
import { SkeletonProviderTables } from "../../providers/SkeletonProvider";
import { KeyboardArrowRightRounded } from "@mui/icons-material";
import { validateEmail, validateMobile, validateMobileNumberUniqueness } from "../../services/ValidationService";
import CustomSelect from "../../components/helpers/CustomSelect";
import CustomSearch from "../../components/helpers/CustomSearch";

export default function Index({ PageAccess }: any) {
    const [_userRoleList, _setUserRoleList] = useState<any>([]);
    const [_branchList, _setBranchList] = useState<any>([]);
    const [_tableItems, _setTableItems] = useState<any>([]);
    const [_tableTotalCount, _setTableTotalCount] = useState<any>(0);
    const [_tableLoading, _setTableLoading] = useState(true);
    const [_loading, _setLoading] = useState(false);
    const [_search, _setSearch] = useState('');
    const [_editForm, _setEditForm] = useState(false);
    const [_formData, _setFormData] = useState<any>({
        id: 0,
        branchId: 0,
        userRoleId: 0,
        firstName: '',
        lastName: '',
        emailAddress: '',
        mobileNumber: '',
        isActive: true
    });

    const validate = {
        branchId: { error: false, message: "" },
        userRoleId: { error: false, message: "" },
        firstName: { error: false, message: "" },
        lastName: { error: false, message: "" },
        emailAddress: { error: false, message: "" },
        mobileNumber: { error: false, message: "" },
    };
    const [_validate, _setValidate] = useState(validate);
    
    // Mobile and Email validation status states
    const [_mobileValidationStatus, _setMobileValidationStatus] = useState<{
        isValid: boolean;
        message: string;
        isChecking: boolean;
    }>({ isValid: true, message: '', isChecking: false });
    
    const [_emailValidationStatus, _setEmailValidationStatus] = useState<{
        isValid: boolean;
        message: string;
        isChecking: boolean;
    }>({ isValid: true, message: '', isChecking: false });

    const [_page, _setPage] = useState(1);
    const [_rowPopup, _setRowPopup] = useState(false);
    const [_rowsPerPage, _setRowsPerPage] = useState(10);

    const handleChangePage = (_event: React.ChangeEvent<unknown>, value: number) => {
        _setPage(value);
    }

    const changeFormData = (key: string, value: any) => {
        _setFormData({ ..._formData, [key]: value });
    };

    const handleUpdateItem = (item: any) => {
        _setFormData({ ...item });
        _setEditForm(true);
    };

    const handleGoBack = () => {
        _setEditForm(false);
        handleClearForm();
    };

    const handleClearForm = () => {
        _setLoading(false);
        _setValidate(validate)
        _setFormData({ id: 0, branchId: 0, userRoleId: 0, firstName: '', lastName: '', emailAddress: '', mobileNumber: '', isActive: true });
        _setMobileValidationStatus({ isValid: true, message: '', isChecking: false });
        _setEmailValidationStatus({ isValid: true, message: '', isChecking: false });
    };

    const handleMobileNumberChange = (value: string) => {
        changeFormData('mobileNumber', value);
        
      
        if (!value.trim()) {
            _setMobileValidationStatus({ isValid: true, message: '', isChecking: false });
            return;
        }

       
        
        const countryCodePattern = /^\+\d{1,2}\s?\d{10}$/;
        const tenDigitPattern = /^\d{10}$/;
        
        if (!countryCodePattern.test(value) && !tenDigitPattern.test(value)) {
            _setMobileValidationStatus({ 
                isValid: false, 
                message: 'Mobile number must be 10 digits OR +country code + 10 digits (e.g., +91 9876543210)', 
                isChecking: false 
            });
            return;
        }

       
        _setMobileValidationStatus({ isValid: true, message: '', isChecking: false });
    };

    const handleEmailChange = (value: string) => {
        changeFormData('emailAddress', value);
        
       
        if (!value.trim()) {
            _setEmailValidationStatus({ isValid: true, message: '', isChecking: false });
            return;
        }

       
        if (!validateEmail(value)) {
            _setEmailValidationStatus({ 
                isValid: false, 
                message: 'Please enter a valid email address (e.g., something@example.com)', 
                isChecking: false 
            });
            return;
        }

        
        _setEmailValidationStatus({ isValid: true, message: '', isChecking: false });
    };

    const checkValidation = () => {
        let valid = true;
        const validation = { ...validate };

        if (!_formData?.firstName?.trim()) {
            validation.firstName.error = true;
            validation.firstName.message = "Required Field";
            valid = false;
        }
        if (!_formData?.lastName?.trim()) {
            validation.lastName.error = true;
            validation.lastName.message = "Required Field";
            valid = false;
        }
        if (!_formData?.emailAddress?.trim()) {
            validation.emailAddress.error = true;
            validation.emailAddress.message = "Required Field";
            valid = false;
        }
        if (!_formData?.mobileNumber?.trim()) {
            validation.mobileNumber.error = true;
            validation.mobileNumber.message = "Required Field";
            valid = false;
        }
        if (_formData?.emailAddress?.trim() && !_emailValidationStatus.isValid) {
            validation.emailAddress.error = true;
            validation.emailAddress.message = _emailValidationStatus.message || "Invalid Email";
            valid = false;
        }
        if (_formData?.mobileNumber?.trim() && !_mobileValidationStatus.isValid) {
            validation.mobileNumber.error = true;
            validation.mobileNumber.message = _mobileValidationStatus.message || "Invalid Mobile Number";
            valid = false;
        }

        _setValidate(validation);
        return valid;
    };

    const handleSubmitForm = () => {
        _setLoading(true);
        if (!checkValidation()) {
            _setLoading(false);
            return;
        }

        const body = {
            id: _formData?.id || 0,
            branchId: _formData?.branchId || 0,
            userRoleId: _formData?.userRoleId || 0,
            firstName: _formData?.firstName || "",
            lastName: _formData?.lastName || "",
            emailAddress: _formData?.emailAddress || "",
            mobileNumber: _formData?.mobileNumber || "",
            isActive: _formData?.isActive || false,
        };

        insertUpdateUserRegister(body)
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    getGridList();
                    handleGoBack();
                    CustomAlert("success", "Successfully Updated");
                }
            })
            .catch(console.log)
            .finally(() => _setLoading(false));
    };

    const getPrintTableHeadBody = () => {
        const header = ["S. No", "User Name", "Branch Name", "Role Type", "Email", "Status"];
        const body = _tableItems?.map((item: any, index: number) => [
            index + 1, 
            item?.fullName, 
            item?.branchName, 
            item?.roleName, 
            item?.emailAddress, 
            item?.isActive ? "Active" : "Inactive"
        ]);
        return { header, body };
    };

    const exportEXCEL = () => {
        const { header, body } = getPrintTableHeadBody();
        getExportEXCEL({ header, body, fileName: "User List" })
    };

    const getGridList = () => {
        _setTableLoading(true);
        getAdminUserList()
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    _setTableItems(resp?.data?.result?.results);
                    _setTableTotalCount(resp?.data?.result?.totalItems)
                }
            })
            .catch(console.log)
            .finally(() => _setTableLoading(false));
    }
    const getOtherList = () => {
        getMasterUserRole()
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    _setUserRoleList([...resp?.data?.result])
                }
            })
            .catch((err) => console.log(err))
        getBranchGridList()
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    _setBranchList([...resp?.data?.result?.results])
                }
            })
            .catch((err) => console.log(err))
    }

    useEffect(() => {
        getGridList();
        getOtherList()
    }, []);

    return (
        <div className="container">
            {!_editForm && <>
                <div className="row justify-content-between align-items-center py-3">
                    <div className="col-md-4 my-2 d-flex align-items-center gap-1">
                        <span className="text-dark fw-bold">User </span>
                        <span className="text-dark"><KeyboardArrowRightRounded /></span>
                        <span className="text-muted">List</span>
                    </div>
                    <div className="col-md-6 my-2 d-flex justify-content-end align-items-center gap-4">
                        {PageAccess === 'Write' && <Button className="text-capitalize" sx={{ color: "black" }} startIcon={<img height={18} src={IMAGES_ICON.TableNewItemIcon} />}
                            onClick={() => _setEditForm(true)}>Add New</Button>}
                        <CustomSearch getSearchText={(value: string) => _setSearch(value)} />
                        <img draggable="false" height={24} src={IMAGES_ICON.TableDownloadIcon} role="button" onClick={exportEXCEL} />
                    </div>
                </div>
                <TableContainer className="tableBorder rounded">
                    <Table sx={{ ...customTableTemplate }}>
                        <TableHead>
                            <TableRow sx={{ ...customTableHeader }}>
                                <TableCell className="fw-bold">S.No</TableCell>
                                <TableCell className="fw-bold">User Name</TableCell>
                                <TableCell className="fw-bold">Branch Name</TableCell>
                                <TableCell className="fw-bold">Role Type</TableCell>
                                <TableCell className="fw-bold">Email</TableCell>
                                <TableCell className="fw-bold" align="center">Status</TableCell>
                                <TableCell className="fw-bold" align="center">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {_tableItems?.length > 0 ? (
                                _tableItems?.filter((content: any) => {
                                    const lowerSearchInput = _search?.toLowerCase()?.trim();
                                    return lowerSearchInput === '' || Object?.values(content)?.some((value) =>
                                        value?.toString()?.toLowerCase()?.includes(lowerSearchInput)
                                    );
                                })?.map((item: any, index: number) => (
                                    <TableRow key={index}>
                                        <TableCell>{(index + 1) + ((_page - 1) * _rowsPerPage)}</TableCell>
                                        <TableCell>{item?.fullName}</TableCell>
                                        <TableCell>{item?.branchName}</TableCell>
                                        <TableCell>{item?.roleName}</TableCell>
                                        <TableCell>{item?.emailAddress}</TableCell>
                                        <TableCell align="center">{item?.isActive ?
                                            <span className="fs12 statusBgActive text-success rounded--50 px-3 py-1">Active</span>
                                            : <span className="fs12 statusBgInactive text-danger rounded--50 px-3 py-1">Inactive</span>
                                        }</TableCell>
                                        <TableCell align="center">
                                            {PageAccess === 'Write' && <div className="d-flex align-items-center gap-2 justify-content-center" role="button" onClick={() => handleUpdateItem(item)}>
                                                <span>Edit</span>
                                                <img draggable="false" height={16} src={IMAGES_ICON.EditIcon} alt="icon" />
                                            </div>}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : !_tableLoading && (
                                <TableRow>
                                    <TableCell className="fs-3 text-muted" align="center" colSpan={7}>Data Not Found</TableCell>
                                </TableRow>
                            )}
                            <SkeletonProviderTables columns={7} visible={_tableLoading} />
                        </TableBody>
                    </Table>
                </TableContainer>
                <div className="mt-3 d-flex justify-content-between flex-wrap">
                    <div className="d-flex align-items-center gap-2">
                        <span className='textLightGray fs14 text-nowrap'>Items per page:</span>
                        <CustomSelect padding={'6px'} value={Number(_rowsPerPage)} onChange={(e: any) => _setRowsPerPage(e.target.value)}
                            placeholder={" "} menuItem={[10, 20, 30]?.map((item: any) =>
                                <MenuItem key={item} value={item}>{item}</MenuItem>)} />
                    </div>
                    <Pagination count={Math.ceil(_tableTotalCount / _rowsPerPage) || 0} page={_page} onChange={handleChangePage}
                        size={"small"} color={"primary"}
                        renderItem={(item) => <PaginationItem sx={{ mx: '4px' }} {...item} />} />
                </div>
            </>}
            {_editForm && <div className="container py-3">
                <div className="bg-field-gray  border rounded px-4 py-1">
                    <div className="d-flex align-items-center py-2 borderBottomLight" role="button" onClick={handleGoBack}>
                        <img height={24} draggable={false} src={IMAGES_ICON.BackIcon} />
                        <div className="fw-bold">Back</div>
                    </div>
                    <div className="bg-field-gray d-flex flex-column justify-content-between">
                        <div className="row">
                            <div className="col-md-4 my-3">
                                <div className="text-muted fs14 mb-1">First Name</div>
                                <TextField fullWidth sx={{ ...textFieldStyle }}
                                    value={_formData?.firstName} onChange={(e: any) => changeFormData('firstName', e.target.value)}
                                    error={_validate?.firstName?.error} helperText={_validate?.firstName?.message} />
                            </div>
                            <div className="col-md-4 my-3">
                                <div className="text-muted fs14 mb-1">Last Name</div>
                                <TextField fullWidth sx={{ ...textFieldStyle }}
                                    value={_formData?.lastName} onChange={(e: any) => changeFormData('lastName', e.target.value)}
                                    error={_validate?.lastName?.error} helperText={_validate?.lastName?.message} />
                            </div>
                            <div className="col-md-4 my-3">
                                <div className="text-muted fs14 mb-1">Role Type</div>
                                <FormControl fullWidth error={_validate?.userRoleId?.error}>
                                    <Select size="small" value={_formData?.userRoleId} onChange={(e: any) => changeFormData('userRoleId', e.target.value)}
                                        style={{ backgroundColor: "#F3F3F3", }}>
                                        <MenuItem value="Select" disabled>Select</MenuItem>
                                        {_userRoleList?.map((mItem: any) =>
                                            mItem?.isActive && <MenuItem key={mItem?.id} value={mItem?.id}>{mItem?.roleName}</MenuItem>
                                        )}
                                    </Select>
                                    <FormHelperText className="text-danger">{_validate?.userRoleId?.message}</FormHelperText>
                                </FormControl>
                            </div>
                            <div className="col-md-4 my-3">
                                <div className="text-muted fs14 mb-1">Branch</div>
                                <FormControl fullWidth>
                                    <Select size="small" value={_formData?.branchId} onChange={(e: any) => changeFormData('branchId', e.target.value)}
                                        style={{ backgroundColor: "#F3F3F3", }}>
                                        <MenuItem value="Select" disabled>Select</MenuItem>
                                        {_branchList?.map((mItem: any) =>
                                            mItem?.isActive && <MenuItem key={mItem?.id} value={mItem?.id}>{mItem?.branchName}</MenuItem>
                                        )}
                                    </Select>
                                    {/* <FormHelperText className="text-danger">{_validate?.branchId?.message}</FormHelperText> */}
                                </FormControl>
                            </div>
                            <div className="col-md-4 my-3">
                                <div className="text-muted fs14 mb-1">Mobile Number</div>
                                <TextField fullWidth sx={{ ...textFieldStyle }} type="text" onKeyDown={DisableKeyUpDown}
                                    value={_formData?.mobileNumber} onChange={(e: any) => handleMobileNumberChange(e.target.value)}
                                    slotProps={{ 
                                        input: { 
                                            endAdornment: _formData?.mobileNumber ? (
                                                <span className="ms-2">
                                                    {_mobileValidationStatus.isValid ? (
                                                        <span style={{ color: '#4caf50', fontSize: '16px' }}>✓</span>
                                                    ) : (
                                                        <span style={{ color: '#f44336', fontSize: '16px' }}>✕</span>
                                                    )}
                                                </span>
                                            ) : null
                                        }
                                    }}
                                    error={_validate?.mobileNumber?.error} helperText={_validate?.mobileNumber?.message} />
                            </div>
                            <div className="col-md-4 my-3">
                                <div className="text-muted fs14 mb-1">Email Address</div>
                                <TextField fullWidth sx={{ ...textFieldStyle }}
                                    value={_formData?.emailAddress} onChange={(e: any) => handleEmailChange(e.target.value)}
                                    slotProps={{ 
                                        input: { 
                                            endAdornment: _formData?.emailAddress ? (
                                                <span className="ms-2">
                                                    {_emailValidationStatus.isValid ? (
                                                        <span style={{ color: '#4caf50', fontSize: '16px' }}>✓</span>
                                                    ) : (
                                                        <span style={{ color: '#f44336', fontSize: '16px' }}>✕</span>
                                                    )}
                                                </span>
                                            ) : null
                                        }
                                    }}
                                    error={_validate?.emailAddress?.error} helperText={_validate?.emailAddress?.message} />
                            </div>
                        </div>
                    </div>
                    <div className="row justify-content-center">
                        <hr />
                        <div className="col-md-4 mb-2">
                            <div className="d-flex align-items-center justify-content-end mobJustify gap-2">
                                <FormControlLabel label="Active"
                                    control={<Checkbox className="text-capitalize" checked={_formData?.isActive}
                                        onChange={() => changeFormData('isActive', !_formData?.isActive)} />} />
                                <Button variant="contained" color="primary" disabled={_loading} className="" onClick={handleSubmitForm}>{_formData?.id ? 'Update' : 'Save'}</Button>
                                <Button className="text-capitalize" variant="outlined" onClick={handleClearForm}>Clear</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>}
        </div>
    );
}