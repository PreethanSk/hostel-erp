import { useEffect, useState } from "react";
import { Button, Checkbox, FormControl, FormControlLabel, MenuItem, Pagination, PaginationItem, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, ListItemText } from "@mui/material";
import { CustomAlert, customTableHeader, customTableTemplate, DisableKeyUpDown, getExportEXCEL, textFieldStyle } from "../../services/HelperService";
import { getServiceProvider, getServiceProviderCategory, insertUpdateServiceProvider } from "../../models";
import { IMAGES_ICON } from "../../assets/images/exportImages";
import { SkeletonProviderTables } from "../../providers/SkeletonProvider";
import { KeyboardArrowRightRounded } from "@mui/icons-material";
import CustomSelect from "../../components/helpers/CustomSelect";
import CustomSearch from "../../components/helpers/CustomSearch";

export default function Index({ PageAccess }: any) {
    const [_categoryList, _setCategoryList] = useState<any>([]);
    const [_allData, _setAllData] = useState<any>([]);
    const [_tableItems, _setTableItems] = useState<any>([]);
    const [_tableLoading, _setTableLoading] = useState(true);
    const [_loading, _setLoading] = useState(false);
    const [_search, _setSearch] = useState('');
    const [_categoryId, _setCategoryId] = useState<any>('');
    const [_type, _setType] = useState<any>('');
    const [_page, _setPage] = useState(1);
    const [_rowsPerPage, _setRowsPerPage] = useState(10);
    const [_editForm, _setEditForm] = useState(false);
    const [_formData, _setFormData] = useState<any>({
        id: 0,
        name: '',
        mobile: '',
        email: '',
        categories: '',
        type: 'External',
        companyName: '',
        address: '',
        gstNumber: '',
        contactPerson: '',
        rating: '',
        isActive: true
    });

    const validate = {
        name: { error: false, message: "" },
        mobile: { error: false, message: "" },
    };
    const [_validate, _setValidate] = useState(validate);

    const handleChangePage = (_event: React.ChangeEvent<unknown>, value: number) => {
        _setPage(value);
    };

    const changeFormData = (key: string, value: any) => {
        _setFormData({ ..._formData, [key]: value });
    };

    const handleUpdateItem = (item: any) => {
        _setFormData({
            id: item?.id || 0,
            name: item?.name || '',
            mobile: item?.mobile || '',
            email: item?.email || '',
            categories: item?.categories || '',
            type: item?.type || 'External',
            companyName: item?.companyName || '',
            address: item?.address || '',
            gstNumber: item?.gstNumber || '',
            contactPerson: item?.contactPerson || '',
            rating: item?.rating || '',
            isActive: item?.isActive !== undefined ? item?.isActive : true
        });
        _setEditForm(true);
    };

    const handleGoBack = () => {
        _setEditForm(false);
        handleClearForm();
    };

    const handleClearForm = () => {
        _setLoading(false);
        _setValidate(validate);
        _setFormData({
            id: 0,
            name: '',
            mobile: '',
            email: '',
            categories: '',
            type: 'External',
            companyName: '',
            address: '',
            gstNumber: '',
            contactPerson: '',
            rating: '',
            isActive: true
        });
    };

    const checkValidation = () => {
        let valid = true;
        const validation = { ...validate };

        if (!_formData?.name?.trim()) {
            validation.name.error = true;
            validation.name.message = "Required Field";
            valid = false;
        }
        if (!_formData?.mobile?.trim()) {
            validation.mobile.error = true;
            validation.mobile.message = "Required Field";
            valid = false;
        } else {
            const mobileDigits = _formData.mobile.replace(/\D/g, ''); // Remove non-digits
            if (mobileDigits.length < 10 || mobileDigits.length > 15) {
                validation.mobile.error = true;
                validation.mobile.message = "Mobile number must be between 10 and 15 digits";
                valid = false;
            }
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
            name: _formData?.name?.trim() || '',
            mobile: _formData?.mobile?.replace(/\D/g, '') || '', // Remove non-digits
            email: _formData?.email || '',
            categories: _formData?.categories || '',
            type: _formData?.type || "External",
            companyName: _formData?.companyName || '',
            address: _formData?.address || '',
            gstNumber: _formData?.gstNumber || '',
            contactPerson: _formData?.contactPerson || '',
            rating: _formData?.rating || '',
            isActive: _formData?.isActive ? 1 : 0,
        };

        insertUpdateServiceProvider(body)
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    getGridList();
                    handleGoBack();
                    CustomAlert("success", body.id === 0 ? "Successfully saved" : "Successfully Updated");
                } else {
                    CustomAlert('warning', resp?.data?.error || 'Failed to save');
                }
            })
            .catch((err) => {
                console.log(err);
                CustomAlert('error', 'Error saving service provider');
            })
            .finally(() => _setLoading(false));
    };

    const getPrintTableHeadBody = () => {
        const header = ["S. No", "Name", "Mobile", "Email", "Company Name", "Contact Person", "Categories", "Type", "Rating", "Status"];
        const body = _allData?.map((item: any, index: number) => [
            index + 1,
            item?.name || "-",
            item?.mobile || "-",
            item?.email || "-",
            item?.companyName || "-",
            item?.contactPerson || "-",
            item?.categoryNames || "-",
            item?.type || "-",
            item?.rating || "-",
            item?.isActive ? "Active" : "Inactive"
        ]);
        return { header, body };
    };

    const exportEXCEL = () => {
        const { header, body } = getPrintTableHeadBody();
        getExportEXCEL({ header, body, fileName: "Service Provider List" });
    };

    const getGridList = () => {
        _setTableLoading(true);
        const formData = {
            search: _search || '',
            categoryId: _categoryId || '',
            type: _type || ''
        };
        getServiceProvider(formData)
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    _setAllData(resp?.data?.result?.data || []);
                } else {
                    CustomAlert('warning', resp?.data?.error || 'Failed to load data');
                }
            })
            .catch((err) => {
                console.log(err);
                CustomAlert('error', 'Error loading service providers');
            })
            .finally(() => _setTableLoading(false));
    };

    const getCategoryList = () => {
        getServiceProviderCategory()
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    _setCategoryList([...resp?.data?.result]);
                }
            })
            .catch((err) => console.log(err));
    };

    // Client-side pagination
    useEffect(() => {
        const startIndex = (_page - 1) * _rowsPerPage;
        const endIndex = startIndex + _rowsPerPage;
        const paginatedData = _allData?.slice(startIndex, endIndex);
        _setTableItems(paginatedData || []);
    }, [_allData, _page, _rowsPerPage]);

    useEffect(() => {
        getGridList();
    }, [_search, _categoryId, _type]);

    useEffect(() => {
        getCategoryList();
    }, []);

    return (
        <div className="container">
            {!_editForm && <>
                <div className="row justify-content-between align-items-center py-3">
                    <div className="col-md-4 my-2 d-flex align-items-center gap-1">
                        <span className="text-dark fw-bold">User </span>
                        <span className="text-dark"><KeyboardArrowRightRounded /></span>
                        <span className="text-muted">Service Provider</span>
                    </div>
                    <div className="col-md-6 my-2 d-flex justify-content-end align-items-center gap-4">
                        <div className="line-item">
                            <Button className="text-capitalize" sx={{ color: "black" }} startIcon={<img height={18} draggable={false} src={IMAGES_ICON.TableNewItemIcon} />} onClick={() => _setEditForm(true)}>Add New</Button>
                        </div>
                        <CustomSearch getSearchText={(value: string) => { _setSearch(value); _setPage(1); }} />
                        <img draggable="false" height={24} src={IMAGES_ICON.TableDownloadIcon} role="button" onClick={exportEXCEL} />
                    </div>
                </div>
            <div className="row mb-3">
                <div className="col-md-3">
                    <div className="text-muted fs14 mb-1">Category</div>
                    <Select
                        fullWidth
                        size="small"
                        value={_categoryId}
                        onChange={(e: any) => { _setCategoryId(e.target.value); _setPage(1); }}
                        style={{ backgroundColor: "#F3F3F3" }}
                    >
                        <MenuItem value="">All Categories</MenuItem>
                        {_categoryList?.map((item: any) =>
                            item?.isActive && <MenuItem key={item?.id} value={item?.id}>{item?.name}</MenuItem>
                        )}
                    </Select>
                </div>
                <div className="col-md-3">
                    <div className="text-muted fs14 mb-1">Type</div>
                    <Select
                        fullWidth
                        size="small"
                        value={_type}
                        onChange={(e: any) => { _setType(e.target.value); _setPage(1); }}
                        style={{ backgroundColor: "#F3F3F3" }}
                    >
                        <MenuItem value="">All Types</MenuItem>
                        <MenuItem value="External">External</MenuItem>
                        <MenuItem value="Internal">Internal</MenuItem>
                    </Select>
                </div>
            </div>
            <TableContainer className="tableBorder rounded">
                <Table sx={{ ...customTableTemplate }}>
                    <TableHead>
                        <TableRow sx={{ ...customTableHeader }}>
                            <TableCell className="fw-bold">S.No</TableCell>
                            <TableCell className="fw-bold">Name</TableCell>
                            <TableCell className="fw-bold">Mobile</TableCell>
                            <TableCell className="fw-bold">Email</TableCell>
                            <TableCell className="fw-bold">Company Name</TableCell>
                            <TableCell className="fw-bold">Contact Person</TableCell>
                            <TableCell className="fw-bold">Categories</TableCell>
                            <TableCell className="fw-bold">Type</TableCell>
                            <TableCell className="fw-bold">Rating</TableCell>
                            <TableCell className="fw-bold" align="center">Status</TableCell>
                            <TableCell className="fw-bold" align="center">Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {_tableItems?.length > 0 ? (
                            _tableItems?.map((item: any, index: number) => (
                                <TableRow key={index}>
                                    <TableCell>{(index + 1) + ((_page - 1) * _rowsPerPage)}</TableCell>
                                    <TableCell>{item?.name || "-"}</TableCell>
                                    <TableCell>{item?.mobile || "-"}</TableCell>
                                    <TableCell>{item?.email || "-"}</TableCell>
                                    <TableCell>{item?.companyName || "-"}</TableCell>
                                    <TableCell>{item?.contactPerson || "-"}</TableCell>
                                    <TableCell>{item?.categoryNames || "-"}</TableCell>
                                    <TableCell>{item?.type || "-"}</TableCell>
                                    <TableCell>{item?.rating || "-"}</TableCell>
                                    <TableCell align="center">{item?.isActive ?
                                        <span className="fs12 statusBgActive text-success rounded--50 px-3 py-1">Active</span>
                                        : <span className="fs12 statusBgInactive text-danger rounded--50 px-3 py-1">Inactive</span>
                                    }</TableCell>
                                    <TableCell className="" align="center">
                                        <div className="d-flex align-items-center justify-content-center gap-3">
                                            <div className="d-flex align-items-center justify-content-center gap-1" role="button" onClick={() => handleUpdateItem(item)}>
                                                <span className="">Edit</span>
                                                <img height="16" src={IMAGES_ICON.EditIcon} alt="icon" draggable="false" />
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : !_tableLoading && (
                            <TableRow>
                                <TableCell className="fs-3 text-muted" align="center" colSpan={11}>Data Not Found</TableCell>
                            </TableRow>
                        )}
                        <SkeletonProviderTables columns={11} visible={_tableLoading} />
                    </TableBody>
                </Table>
            </TableContainer>
            <div className="mt-3 d-flex justify-content-between flex-wrap">
                <div className="d-flex align-items-center gap-2">
                    <span className='textLightGray fs14 text-nowrap'>Items per page:</span>
                    <CustomSelect padding={'6px'} value={Number(_rowsPerPage)} onChange={(e: any) => { _setRowsPerPage(e.target.value); _setPage(1); }}
                        placeholder={" "} menuItem={[10, 20, 30]?.map((item: any) =>
                            <MenuItem key={item} value={item}>{item}</MenuItem>)} />
                </div>
                <Pagination count={Math.ceil(_allData?.length / _rowsPerPage) || 0} page={_page} onChange={handleChangePage}
                    size={"small"} color={"primary"}
                    renderItem={(item) => <PaginationItem sx={{ mx: '4px' }} {...item} />} />
            </div>
            </>}
            {_editForm && (
                <div>
                    <div className="container py-3">
                        <div className="bg-field-gray  border rounded px-4 py-1">
                            <div className="d-flex align-items-center py-2 borderBottomLight" role="button" onClick={handleGoBack}>
                                <img height={24} draggable={false} src={IMAGES_ICON.BackIcon} />
                                <div className="fw-bold">Back</div>
                            </div>
                            <div className="bg-field-gray d-flex flex-column justify-content-between">
                                <div className="row pb-3">
                                    <div className="col-md-4 my-3">
                                        <div className="text-muted fs14 mb-1">Name</div>
                                        <TextField fullWidth sx={{ ...textFieldStyle }}
                                            value={_formData?.name} onChange={(e: any) => changeFormData('name', e.target.value)}
                                            error={_validate?.name?.error} helperText={_validate?.name?.message} />
                                    </div>
                                    <div className="col-md-4 my-3">
                                        <div className="text-muted fs14 mb-1">Mobile</div>
                                        <TextField fullWidth sx={{ ...textFieldStyle }} type="text" onKeyDown={DisableKeyUpDown}
                                            value={_formData?.mobile} onChange={(e: any) => changeFormData('mobile', e.target.value)}
                                            error={_validate?.mobile?.error} helperText={_validate?.mobile?.message} />
                                    </div>
                                    <div className="col-md-4 my-3">
                                        <div className="text-muted fs14 mb-1">Email</div>
                                        <TextField fullWidth sx={{ ...textFieldStyle }}
                                            value={_formData?.email || ""} onChange={(e: any) => changeFormData('email', e.target.value)} />
                                    </div>
                                    <div className="col-md-4 my-3">
                                        <div className="text-muted fs14 mb-1">Type</div>
                                        <FormControl fullWidth>
                                            <Select size="small" value={_formData?.type} onChange={(e: any) => changeFormData('type', e.target.value)}
                                                style={{ backgroundColor: "#F3F3F3" }}>
                                                <MenuItem value="External">External</MenuItem>
                                                <MenuItem value="Internal">Internal</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </div>
                                    <div className="col-md-4 my-3">
                                        <div className="text-muted fs14 mb-1">Categories</div>
                                        <FormControl fullWidth>
                                            <Select
                                                size="small"
                                                multiple
                                                value={_formData?.categories ? _formData.categories.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id)) : []}
                                                onChange={(e: any) => {
                                                    const selectedIds = e.target.value;
                                                    const categoriesString = Array.isArray(selectedIds) ? selectedIds.join(',') : '';
                                                    changeFormData('categories', categoriesString);
                                                }}
                                                style={{ backgroundColor: "#F3F3F3" }}
                                                renderValue={(selected: any) => {
                                                    if (!selected || selected.length === 0) return 'Select Categories';
                                                    return selected.map((id: number) => {
                                                        const category = _categoryList.find((cat: any) => cat.id === id);
                                                        return category ? category.name : '';
                                                    }).filter(Boolean).join(', ');
                                                }}
                                                MenuProps={{
                                                    PaperProps: {
                                                        style: {
                                                            maxHeight: 300,
                                                        },
                                                    },
                                                }}
                                            >
                                                {_categoryList?.map((item: any) =>
                                                    item?.isActive && (
                                                        <MenuItem key={item?.id} value={item?.id}>
                                                            <Checkbox checked={_formData?.categories ? _formData.categories.split(',').map((id: string) => parseInt(id.trim())).includes(item?.id) : false} />
                                                            <ListItemText primary={item?.name} />
                                                        </MenuItem>
                                                    )
                                                )}
                                            </Select>
                                        </FormControl>
                                    </div>
                                    <div className="col-md-4 my-3">
                                        <div className="text-muted fs14 mb-1">Company Name</div>
                                        <TextField fullWidth sx={{ ...textFieldStyle }}
                                            value={_formData?.companyName || ""} onChange={(e: any) => changeFormData('companyName', e.target.value)} />
                                    </div>
                                    <div className="col-md-4 my-3">
                                        <div className="text-muted fs14 mb-1">Contact Person</div>
                                        <TextField fullWidth sx={{ ...textFieldStyle }}
                                            value={_formData?.contactPerson || ""} onChange={(e: any) => changeFormData('contactPerson', e.target.value)} />
                                    </div>
                                    <div className="col-md-4 my-3">
                                        <div className="text-muted fs14 mb-1">GST Number</div>
                                        <TextField fullWidth sx={{ ...textFieldStyle }}
                                            value={_formData?.gstNumber || ""} onChange={(e: any) => changeFormData('gstNumber', e.target.value)} />
                                    </div>
                                    <div className="col-md-4 my-3">
                                        <div className="text-muted fs14 mb-1">Rating</div>
                                        <TextField fullWidth sx={{ ...textFieldStyle }} type="number"
                                            value={_formData?.rating || ""} onChange={(e: any) => changeFormData('rating', e.target.value)} />
                                    </div>
                                    <div className="col-md-12 my-3">
                                        <div className="text-muted fs14 mb-1">Address</div>
                                        <TextField fullWidth sx={{ ...textFieldStyle }} multiline rows={3}
                                            value={_formData?.address || ""} onChange={(e: any) => changeFormData('address', e.target.value)} />
                                    </div>
                                </div>
                                <div className="row">
                                    <hr />
                                    <div className="col-md-8 mb-2">
                                    </div>
                                    <div className="col-md-4 mb-2">
                                        <div className="d-flex align-items-center justify-content-end mobJustify gap-2">
                                            <FormControlLabel label="Active"
                                                control={<Checkbox className="text-capitalize" checked={_formData?.isActive} onChange={() => changeFormData('isActive', !_formData?.isActive)} />} />
                                            <Button variant="contained" color="primary" disabled={_loading} className="" onClick={handleSubmitForm}>Save</Button>
                                            <Button className="text-capitalize bg-white" variant="outlined" onClick={handleGoBack}>Back</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

