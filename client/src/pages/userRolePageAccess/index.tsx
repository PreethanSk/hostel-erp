import { useEffect, useState } from "react";
import { CustomAlert, customRadio, customTableHeader, customTableTemplate, getExportEXCEL } from '../../services/HelperService';
import { Button, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, RadioGroup, FormControlLabel, Radio, Checkbox } from "@mui/material";
import { KeyboardArrowRightRounded } from "@mui/icons-material";
import { IMAGES_ICON } from "../../assets/images/exportImages";
import { SkeletonProviderTables } from "../../providers/SkeletonProvider";
import { getMasterPageList, getMasterUserRole, getRolePageAccess, insertUpdateUserRolePageAccess, insertUpdateMasterUserRole } from "../../models";
import CustomSearch from "../../components/helpers/CustomSearch";


export default function Index({ PageAccess }: any) {
    const [_tableItems, _setTableItems] = useState<any>([]);
    const [_pageList, _setPageList] = useState<any>([]);
    const [_tableLoading, _setTableLoading] = useState(true);
    const [_loading, _setLoading] = useState(false);
    const [_search, _setSearch] = useState('');
    const [_editForm, _setEditForm] = useState(false);
    const [_addScreen, _setAddScreen] = useState(false);

    const [_roleList, _setRoleList] = useState<any>([]);
    const [_updatePageList, _setUpdatePageList] = useState<any>([]);
    const [_payloadBody, _setPayloadBody] = useState<any>([])

    const validate = {
        roleId: { error: false, message: "" },
        accessLevel: { error: false, message: "" },
        pages: { error: false, message: "" },
    };
    const [_validate, _setValidate] = useState(validate);

    const changePageAccess = (index: number, key: string, value: string) => {
        const _tempArr = [..._updatePageList]
        _tempArr[index][key] = value;
        _setUpdatePageList([..._tempArr])
    }

    const getPrintTableHeadBody = () => {
        const header = ["S. No", "User Role", 'Page Access', "Status"];
        const body = _tableItems?.map((item: any, index: number) => [
            index + 1,
            item?.roleName,
            item?.pages?.filter((mItem: any) => mItem?.accessLevel === 'Read' || mItem?.accessLevel === 'Write')
                .map((mItem: any) => mItem?.pageName)?.filter(Boolean)?.join(', '),
            item?.roleStatus ? "Active" : "Inactive"
        ]);
        return { header, body };
    }

    const exportEXCEL = () => {
        const { header, body } = getPrintTableHeadBody();
        getExportEXCEL({ header, body, fileName: "User Role" })
    }


    const handleUpdateItem = (item: any) => {
        const tempArr: any = [];
        _pageList?.forEach((page: any) => {
            const findItem = item?.pages?.find((fItem: any) => fItem?.pageId === page?.id);
            const obj = {
                id: findItem?.id || 0,
                roleId: item?.roleId,
                pageId: page?.id,
                pageName: page?.pageName,
                accessLevel: findItem?.accessLevel || "No",
                isActive: findItem?.isActive || page?.isActive,
                roleStatus: item?.roleStatus !== false // propagate status to all for easy access
            };
            tempArr.push(obj);
        });
        _setUpdatePageList([...tempArr]);
        _setAddScreen(true);
    };


    const handleGoBack = () => {
        _setEditForm(false);
        handleClearForm();
    }

    const handleClearForm = () => {
        _setLoading(false);
        _setValidate(validate)
        _setAddScreen(false)
    }

    const checkValidation = () => {
        let valid = true;
        const validation = { ...validate };

        if (!_updatePageList?.length) {
            validation.pages.error = true;
            validation.pages.message = "Required Field";
            valid = false;
        }

        _setValidate(validation);
        return valid;
    };

    const handleSubmitForm = async () => {
        _setLoading(true);
        if (!checkValidation()) {
            _setLoading(false);
            return;
        }

        // 1. Update the user role's isActive status
        const roleId = _updatePageList[0]?.roleId;
        const roleStatus = _updatePageList[0]?.roleStatus !== false;
        let roleUpdateSuccess = true;
        try {
            if (roleId) {
                const roleObj = _roleList.find((r: any) => r.id === roleId);
                if (roleObj && roleObj.isActive !== roleStatus) {
                    const resp = await insertUpdateMasterUserRole({
                        id: roleId,
                        roleName: roleObj.roleName,
                        isActive: roleStatus,
                        notes: roleObj.notes || ""
                    });
                    if (!(resp?.data?.status === "success")) {
                        roleUpdateSuccess = false;
                        CustomAlert("warning", "Failed to update role status");
                    }
                }
            }
        } catch (e) {
            roleUpdateSuccess = false;
            CustomAlert("warning", "Failed to update role status");
        }

        // 2. Update the page access if role status update succeeded
        if (roleUpdateSuccess) {
            insertUpdateUserRolePageAccess({ pages: _updatePageList })
                .then((resp) => {
                    if (resp?.data?.status === "success") {
                        getGridList();
                        handleGoBack();
                        CustomAlert("success", _updatePageList?.[0]?.id === 0 ? "Successfully saved" : "Successfully Updated");
                        setTimeout(() => {
                            location.reload()
                        }, 1000);
                    } else {
                        CustomAlert('warning', resp?.data?.error)
                    }
                })
                .catch((err: any) => {
                    if (err?.response?.data?.error?.name === "SequelizeUniqueConstraintError") {
                        CustomAlert("warning", "Duplicates not allowed");
                    }
                })
                .finally(() => _setLoading(false));
        } else {
            _setLoading(false);
        }
    }

    const getOtherList = () => {
        getMasterPageList()
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    _setPageList(resp?.data?.result);
                }
            })
            .catch(console.log)
        getMasterUserRole()
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    _setRoleList(resp?.data?.result);
                }
            })
            .catch(console.log)
    }

    const getGridList = () => {
        _setTableLoading(true);
        getRolePageAccess()
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    _setTableItems(resp?.data?.result);
                }
            })
            .catch(console.log)
            .finally(() => _setTableLoading(false));
    }

    // Helper to initialize a new page access list for a new role
    const handleAddNew = () => {
        if (!_roleList?.length || !_pageList?.length) return;
        // Default to first role in the list
        const defaultRoleId = _roleList[0]?.id;
        const tempArr = _pageList.map((page: any) => ({
            id: 0,
            roleId: defaultRoleId,
            pageId: page.id,
            pageName: page.pageName,
            accessLevel: "No",
            isActive: page.isActive,
            roleStatus: true // default to active
        }));
        _setUpdatePageList([...tempArr]);
        _setAddScreen(true);
    };

    useEffect(() => {
        getOtherList()
        getGridList();
    }, []);


    return <>
        {!_addScreen ? <div className="container">
            <div className="row justify-content-between align-items-center py-3">
                <div className="col-md-4 my-2 d-flex align-items-center gap-2">
                    <span className="text-dark fw-bold">User </span>
                    <span className="text-dark"><KeyboardArrowRightRounded /></span>
                    <span className="text-muted">Page Access By Role</span>
                </div>
                <div className="col-md-6 my-2 d-flex justify-content-end align-items-center gap-4">
                    <Button className="text-capitalize" sx={{ color: "black" }} startIcon={<img height={18} src={IMAGES_ICON.TableNewItemIcon} />} onClick={handleAddNew}>Add New</Button>
                    <CustomSearch getSearchText={(value: string) => _setSearch(value)} />
                    <img height={24} src={IMAGES_ICON.TableDownloadIcon} role="button" draggable="false" onClick={exportEXCEL} />
                </div>
            </div>
            <TableContainer className="tableBorder rounded">
                <Table sx={{ ...customTableTemplate }}>
                    <TableHead>
                        <TableRow className="px-2" sx={{ ...customTableHeader }}>
                            <TableCell className="fw-bold">S.No</TableCell>
                            <TableCell className="fw-bold">Role</TableCell>
                            <TableCell className="fw-bold">Screen Access</TableCell>
                            <TableCell className="fw-bold" align="center">Status</TableCell>
                            <TableCell className="fw-bold">Action</TableCell>
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
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell className="text-muted text-nowrap">{item?.roleName}</TableCell>
                                    <TableCell className="text-muted">
                                        <div className="d-flex flex-wrap align-items-center gap-2">
                                            {item?.pages?.filter((mItem: any) => mItem?.accessLevel === 'Read' || mItem?.accessLevel === 'Write')
                                                .map((mItem: any) => <span key={mItem?.pageId} className="bg-light p-2">{mItem?.pageName}</span>)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted" align="center">
                                        {item?.roleStatus ?
                                            <span className="fs12 statusBgActive text-success rounded--50 px-3 py-1">Active</span>
                                            : <span className="fs12 statusBgInactive text-danger rounded--50 px-3 py-1">Inactive</span>
                                        }
                                    </TableCell>
                                    <TableCell className="text-muted" align="center">
                                        <div className="d-flex align-items-center justify-content-center gap-3">
                                            <div className="d-flex align-items-center justify-content-center gap-1" role="button" onClick={() => handleUpdateItem(item)}>
                                                <span className="">Edit</span>
                                                <img height="16" src={IMAGES_ICON.EditIcon} alt="icon" draggable="false" />
                                            </div>
                                            <div className="d-flex align-items-center justify-content-center gap-1" role="button" onClick={() => {/* implement delete logic here */ }}>
                                                <span className="">Delete</span>
                                                <img height="16" src={IMAGES_ICON.DeleteIcon} alt="icon" draggable="false" />
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : !_tableLoading && (
                            <TableRow>
                                <TableCell className="fs-3 text-muted" align="center" colSpan={5}>Data Not Found</TableCell>
                            </TableRow>
                        )}
                        <SkeletonProviderTables columns={5} visible={_tableLoading} />
                    </TableBody>
                </Table>
            </TableContainer>
        </div> :
            <div className="container py-3">
                <div className="mb-3">
                    <label className="fw-bold mb-1">User Role</label>
                    <select
                        className="form-select"
                        value={_updatePageList[0]?.roleId || ''}
                        onChange={e => {
                            const newRoleId = Number(e.target.value);
                            const updated = _updatePageList.map((item: any) => ({ ...item, roleId: newRoleId }));
                            _setUpdatePageList(updated);
                        }}
                    >
                        {_roleList.map((role: any) => (
                            <option key={role.id} value={role.id}>{role.roleName}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-3 d-flex align-items-center gap-3">
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={_updatePageList[0]?.roleStatus !== false}
                                onChange={e => {
                                    const newStatus = e.target.checked;
                                    const updated = _updatePageList.map((item: any) => ({ ...item, roleStatus: newStatus }));
                                    _setUpdatePageList(updated);
                                }}
                            />
                        }
                        label={_updatePageList[0]?.roleStatus !== false ? 'Active' : 'Inactive'}
                    />
                </div>
                <div className="d-flex align-items-center justify-content-between py-2">
                    <div className="d-flex align-items-center" role="button" onClick={() => !_loading && handleGoBack()}>
                        <img height={24} draggable={false} src={IMAGES_ICON.BackIcon} />
                        <div className="fw-bold">Back to List</div>
                    </div>
                    <Button variant="contained" color="primary" className="px-4" disabled={_loading} onClick={handleSubmitForm}>Save</Button>
                </div>
                <div className="my-3">
                    <TableContainer className="tableBorder rounded">
                        <Table size="small" sx={{ ...customTableTemplate }}>
                            <TableHead>
                                <TableRow className="px-2" sx={{ ...customTableHeader }}>
                                    <TableCell className="fw-bold" sx={{ maxWidth: "200px" }}>Page</TableCell>
                                    <TableCell className="fw-bold">Screen Access</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody style={{ overflowY: "auto" }}>
                                {_updatePageList?.map((mItem: any, mIndex: number) => <TableRow key={mIndex}>
                                    <TableCell className="text-nowrap text-truncate" sx={{ maxWidth: "200px", fontSize: "16px" }}>{mItem?.pageName}</TableCell>
                                    <TableCell className="text-nowrap">
                                        <div className="no-select">
                                            <RadioGroup className="flex-nowrap gap-4" row value={mItem?.accessLevel} sx={{ marginLeft: "10px" }}
                                                onChange={(e) => changePageAccess(mIndex, "accessLevel", e.target.value)}>
                                                <FormControlLabel className="fieldBorderDark rounded pe-3" value={"Write"} control={<Radio size="small" sx={{ ...customRadio }} />} label="Read & Write" />
                                                <FormControlLabel className="fieldBorderDark rounded pe-3" value={"Read"} control={<Radio size="small" sx={{ ...customRadio }} />} label="Read Only" />
                                                <FormControlLabel className="fieldBorderDark rounded pe-3" value={"No"} control={<Radio size="small" sx={{ ...customRadio }} />} label="No Access" />
                                            </RadioGroup>
                                        </div>
                                    </TableCell>
                                </TableRow>)}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            </div >}
    </>
}