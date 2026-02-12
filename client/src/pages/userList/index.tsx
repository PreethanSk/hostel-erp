import { useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  MenuItem,
  Pagination,
  PaginationItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { KeyboardArrowRightRounded } from "@mui/icons-material";
import {
  CustomAlert,
  customTableHeader,
  customTableTemplate,
  getExportEXCEL,
  textFieldStyle,
} from "../../services/HelperService";
import {
  getAdminUserList,
  getBranchGridList,
  getMasterUserRole,
  insertUpdateUserRegister,
} from "../../models";
import { IMAGES_ICON } from "../../assets/images/exportImages";
import { SkeletonProviderTables } from "../../providers/SkeletonProvider";
import CustomSearch from "../../components/helpers/CustomSearch";
import CustomSelect from "../../components/helpers/CustomSelect";

type Props = {
  PageAccess: string;
};

type UserItem = {
  id: number;
  firstName?: string;
  lastName?: string;
  emailAddress?: string;
  mobileNumber?: string;
  isActive?: boolean;
  userRoleId?: number;
  branchId?: number;
  roleName?: string;
  branchName?: string;
};

type UserForm = {
  id: number;
  firstName: string;
  lastName: string;
  emailAddress: string;
  mobileNumber: string;
  userRoleId: string;
  branchId: string;
  isActive: boolean;
};

type ValidateState = {
  firstName: { error: boolean; message: string };
  lastName: { error: boolean; message: string };
  emailAddress: { error: boolean; message: string };
  mobileNumber: { error: boolean; message: string };
  userRoleId: { error: boolean; message: string };
  branchId: { error: boolean; message: string };
};

const emptyForm: UserForm = {
  id: 0,
  firstName: "",
  lastName: "",
  emailAddress: "",
  mobileNumber: "",
  userRoleId: "",
  branchId: "",
  isActive: true,
};

const validateInit: ValidateState = {
  firstName: { error: false, message: "" },
  lastName: { error: false, message: "" },
  emailAddress: { error: false, message: "" },
  mobileNumber: { error: false, message: "" },
  userRoleId: { error: false, message: "" },
  branchId: { error: false, message: "" },
};

export default function Index({ PageAccess }: Props) {
  const [_tableItems, _setTableItems] = useState<UserItem[]>([]);
  const [_tableTotalCount, _setTableTotalCount] = useState(0);
  const [_tableLoading, _setTableLoading] = useState(true);
  const [_loading, _setLoading] = useState(false);
  const [_search, _setSearch] = useState("");
  const [_page, _setPage] = useState(1);
  const [_rowsPerPage, _setRowsPerPage] = useState(10);
  const [_editForm, _setEditForm] = useState(false);

  const [_roleList, _setRoleList] = useState<any[]>([]);
  const [_branchList, _setBranchList] = useState<any[]>([]);

  const [_formData, _setFormData] = useState<UserForm>({ ...emptyForm });
  const [_validate, _setValidate] = useState<ValidateState>({ ...validateInit });

  const handleChangePage = (_event: React.ChangeEvent<unknown>, value: number) => {
    _setPage(value);
  };

  const changeFormData = (key: keyof UserForm, value: any) => {
    _setFormData({ ..._formData, [key]: value });
  };

  const handleUpdateItem = (item: UserItem) => {
    _setFormData({
      id: item.id || 0,
      firstName: item.firstName || "",
      lastName: item.lastName || "",
      emailAddress: item.emailAddress || "",
      mobileNumber: item.mobileNumber || "",
      userRoleId: item.userRoleId ? String(item.userRoleId) : "",
      branchId: item.branchId ? String(item.branchId) : "",
      isActive: item.isActive !== undefined ? item.isActive : true,
    });
    _setEditForm(true);
  };

  const handleGoBack = () => {
    _setEditForm(false);
    handleClearForm();
  };

  const handleClearForm = () => {
    _setLoading(false);
    _setValidate({ ...validateInit });
    _setFormData({ ...emptyForm });
  };

  const checkValidation = () => {
    let valid = true;
    const validation: ValidateState = {
      firstName: { ...validateInit.firstName },
      lastName: { ...validateInit.lastName },
      emailAddress: { ...validateInit.emailAddress },
      mobileNumber: { ...validateInit.mobileNumber },
      userRoleId: { ...validateInit.userRoleId },
      branchId: { ...validateInit.branchId },
    };

    if (!_formData.firstName?.trim()) {
      validation.firstName.error = true;
      validation.firstName.message = "Required Field";
      valid = false;
    }
    if (!_formData.lastName?.trim()) {
      validation.lastName.error = true;
      validation.lastName.message = "Required Field";
      valid = false;
    }
    if (!_formData.emailAddress?.trim()) {
      validation.emailAddress.error = true;
      validation.emailAddress.message = "Required Field";
      valid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(_formData.emailAddress.trim())) {
        validation.emailAddress.error = true;
        validation.emailAddress.message = "Invalid email";
        valid = false;
      }
    }
    if (!_formData.mobileNumber?.trim()) {
      validation.mobileNumber.error = true;
      validation.mobileNumber.message = "Required Field";
      valid = false;
    } else {
      const digits = _formData.mobileNumber.replace(/\D/g, "");
      if (digits.length < 6 || digits.length > 15) {
        validation.mobileNumber.error = true;
        validation.mobileNumber.message = "Mobile must be 6–15 digits";
        valid = false;
      }
    }
    if (!_formData.userRoleId) {
      validation.userRoleId.error = true;
      validation.userRoleId.message = "Required Field";
      valid = false;
    }
    if (!_formData.branchId) {
      validation.branchId.error = true;
      validation.branchId.message = "Required Field";
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
      id: _formData.id || 0,
      userRoleId: Number(_formData.userRoleId),
      branchId: Number(_formData.branchId),
      isActive: _formData.isActive,
      firstName: _formData.firstName.trim(),
      lastName: _formData.lastName.trim(),
      emailAddress: _formData.emailAddress.trim(),
      mobileNumber: _formData.mobileNumber.replace(/\D/g, ""),
    };

    insertUpdateUserRegister(body)
      .then((resp) => {
        if (resp?.data?.status === "success") {
          getGridList();
          handleGoBack();
          CustomAlert("success", body.id === 0 ? "Successfully saved" : "Successfully Updated");
        } else {
          CustomAlert("warning", resp?.data?.error || "Failed to save user");
        }
      })
      .catch((err) => {
        console.log(err);
        CustomAlert("error", "Error saving user");
      })
      .finally(() => _setLoading(false));
  };

  const getPrintTableHeadBody = () => {
    const header = ["S. No", "Name", "Email", "Mobile", "Role", "Branch", "Status"];
    const body = _tableItems?.map((item: UserItem, index: number) => [
      index + 1 + (_page - 1) * _rowsPerPage,
      `${item.firstName || ""} ${item.lastName || ""}`.trim() || "-",
      item.emailAddress || "-",
      item.mobileNumber || "-",
      item.roleName || "-",
      item.branchName || "-",
      item.isActive ? "Active" : "Inactive",
    ]);
    return { header, body };
  };

  const exportEXCEL = () => {
    const { header, body } = getPrintTableHeadBody();
    getExportEXCEL({ header, body, fileName: "User List" });
  };

  const getGridList = () => {
    _setTableLoading(true);
    getAdminUserList(_page, _rowsPerPage)
      .then((resp) => {
        if (resp?.data?.status === "success") {
          const result = resp?.data?.result || {};
          _setTableItems(result?.results || []);
          _setTableTotalCount(result?.totalItems || 0);
        } else {
          CustomAlert("warning", resp?.data?.error || "Failed to load users");
        }
      })
      .catch((err) => {
        console.log(err);
        CustomAlert("error", "Error loading users");
      })
      .finally(() => _setTableLoading(false));
  };

  const getRoleAndBranchList = () => {
    getMasterUserRole()
      .then((resp) => {
        if (resp?.data?.status === "success") {
          _setRoleList(resp?.data?.result || []);
        }
      })
      .catch(console.log);

    getBranchGridList(1, 0)
      .then((resp) => {
        if (resp?.data?.status === "success") {
          _setBranchList(resp?.data?.result?.results || []);
        }
      })
      .catch(console.log);
  };

  useEffect(() => {
    getRoleAndBranchList();
  }, []);

  useEffect(() => {
    getGridList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_page, _rowsPerPage]);

  const filteredItems = _tableItems?.filter((content: any) => {
    const lowerSearchInput = _search?.toLowerCase()?.trim();
    if (!lowerSearchInput) return true;
    return Object?.values(content || {})?.some((value: any) =>
      value?.toString()?.toLowerCase()?.includes(lowerSearchInput)
    );
  });

  return (
    <div className="container">
      {!_editForm && (
        <>
          <div className="row justify-content-between align-items-center py-3">
            <div className="col-md-4 my-2 d-flex align-items-center gap-1">
              <span className="text-dark fw-bold">User </span>
              <span className="text-dark">
                <KeyboardArrowRightRounded />
              </span>
              <span className="text-muted">User List</span>
            </div>
            <div className="col-md-6 my-2 d-flex justify-content-end align-items-center gap-4">
              {PageAccess === "Write" && (
                <div className="line-item">
                  <Button
                    className="text-capitalize"
                    sx={{ color: "black" }}
                    startIcon={
                      <img
                        height={18}
                        draggable={false}
                        src={IMAGES_ICON.TableNewItemIcon}
                      />
                    }
                    onClick={() => _setEditForm(true)}
                  >
                    Add New
                  </Button>
                </div>
              )}
              <CustomSearch
                getSearchText={(value: string) => {
                  _setSearch(value);
                  _setPage(1);
                }}
              />
              <img
                draggable="false"
                height={24}
                src={IMAGES_ICON.TableDownloadIcon}
                role="button"
                onClick={exportEXCEL}
              />
            </div>
          </div>

          <TableContainer className="tableBorder rounded">
            <Table sx={{ ...customTableTemplate }}>
              <TableHead>
                <TableRow sx={{ ...customTableHeader }}>
                  <TableCell className="fw-bold">S.No</TableCell>
                  <TableCell className="fw-bold">Name</TableCell>
                  <TableCell className="fw-bold">Email</TableCell>
                  <TableCell className="fw-bold">Mobile</TableCell>
                  <TableCell className="fw-bold">Role</TableCell>
                  <TableCell className="fw-bold">Branch</TableCell>
                  <TableCell className="fw-bold" align="center">
                    Status
                  </TableCell>
                  <TableCell className="fw-bold" align="center">
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems?.length > 0 ? (
                  filteredItems?.map((item: UserItem, index: number) => (
                    <TableRow key={item.id || index}>
                      <TableCell>
                        {index + 1 + (_page - 1) * _rowsPerPage}
                      </TableCell>
                      <TableCell className="text-nowrap">
                        {`${item.firstName || ""} ${item.lastName || ""}`.trim() ||
                          "-"}
                      </TableCell>
                      <TableCell className="text-nowrap">
                        {item.emailAddress || "-"}
                      </TableCell>
                      <TableCell className="text-nowrap">
                        {item.mobileNumber || "-"}
                      </TableCell>
                      <TableCell className="text-nowrap">
                        {item.roleName || "-"}
                      </TableCell>
                      <TableCell className="text-nowrap">
                        {item.branchName || "-"}
                      </TableCell>
                      <TableCell align="center">
                        {item.isActive ? (
                          <span className="fs12 statusBgActive text-success rounded--50 px-3 py-1">
                            Active
                          </span>
                        ) : (
                          <span className="fs12 statusBgInactive text-danger rounded--50 px-3 py-1">
                            Inactive
                          </span>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {PageAccess === "Write" && (
                          <div className="d-flex align-items-center justify-content-center gap-3">
                            <div
                              className="d-flex align-items-center justify-content-center gap-1"
                              role="button"
                              onClick={() => handleUpdateItem(item)}
                            >
                              <span className="">Edit</span>
                              <img
                                height="16"
                                src={IMAGES_ICON.EditIcon}
                                alt="icon"
                                draggable="false"
                              />
                            </div>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : !_tableLoading ? (
                  <TableRow>
                    <TableCell
                      className="fs-3 text-muted"
                      align="center"
                      colSpan={8}
                    >
                      Data Not Found
                    </TableCell>
                  </TableRow>
                ) : null}
                <SkeletonProviderTables columns={8} visible={_tableLoading} />
              </TableBody>
            </Table>
          </TableContainer>

          <div className="mt-3 d-flex justify-content-between flex-wrap">
            <div className="d-flex align-items-center gap-2">
              <span className="textLightGray fs14 text-nowrap">
                Items per page:
              </span>
              <CustomSelect
                padding={"6px"}
                value={Number(_rowsPerPage)}
                onChange={(e: any) => {
                  _setRowsPerPage(e.target.value);
                  _setPage(1);
                }}
                placeholder={" "}
                menuItem={[10, 20, 30]?.map((item: number) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              />
            </div>
            <Pagination
              count={Math.ceil(_tableTotalCount / _rowsPerPage) || 0}
              page={_page}
              onChange={handleChangePage}
              size={"small"}
              color={"primary"}
              renderItem={(item) => (
                <PaginationItem sx={{ mx: "4px" }} {...item} />
              )}
            />
          </div>
        </>
      )}

      {_editForm && (
        <div className="container py-3">
          <div className="bg-field-gray  border rounded px-4 py-1">
            <div
              className="d-flex align-items-center py-2 borderBottomLight"
              role="button"
              onClick={handleGoBack}
            >
              <img height={24} draggable={false} src={IMAGES_ICON.BackIcon} />
              <div className="fw-bold">Back</div>
            </div>
            <div className="bg-field-gray d-flex flex-column justify-content-between">
              <div className="row pb-3">
                <div className="col-md-4 my-3">
                  <div className="text-muted fs14 mb-1">First Name</div>
                  <TextField
                    fullWidth
                    sx={{ ...textFieldStyle }}
                    value={_formData.firstName}
                    onChange={(e: any) =>
                      changeFormData("firstName", e.target.value)
                    }
                    error={_validate.firstName.error}
                    helperText={_validate.firstName.message}
                  />
                </div>
                <div className="col-md-4 my-3">
                  <div className="text-muted fs14 mb-1">Last Name</div>
                  <TextField
                    fullWidth
                    sx={{ ...textFieldStyle }}
                    value={_formData.lastName}
                    onChange={(e: any) =>
                      changeFormData("lastName", e.target.value)
                    }
                    error={_validate.lastName.error}
                    helperText={_validate.lastName.message}
                  />
                </div>
                <div className="col-md-4 my-3">
                  <div className="text-muted fs14 mb-1">Email</div>
                  <TextField
                    fullWidth
                    sx={{ ...textFieldStyle }}
                    value={_formData.emailAddress}
                    onChange={(e: any) =>
                      changeFormData("emailAddress", e.target.value)
                    }
                    error={_validate.emailAddress.error}
                    helperText={_validate.emailAddress.message}
                  />
                </div>
                <div className="col-md-4 my-3">
                  <div className="text-muted fs14 mb-1">Mobile</div>
                  <TextField
                    fullWidth
                    sx={{ ...textFieldStyle }}
                    value={_formData.mobileNumber}
                    onChange={(e: any) =>
                      changeFormData("mobileNumber", e.target.value)
                    }
                    error={_validate.mobileNumber.error}
                    helperText={_validate.mobileNumber.message}
                  />
                </div>
                <div className="col-md-4 my-3">
                  <div className="text-muted fs14 mb-1">Role</div>
                  <FormControl fullWidth error={_validate.userRoleId.error}>
                    <Select
                      size="small"
                      value={_formData.userRoleId}
                      onChange={(e: any) =>
                        changeFormData("userRoleId", e.target.value)
                      }
                      style={{ backgroundColor: "#F3F3F3" }}
                    >
                      <MenuItem value="">Select</MenuItem>
                      {_roleList?.map((item: any) =>
                        item?.isActive ? (
                          <MenuItem key={item?.id} value={item?.id}>
                            {item?.roleName}
                          </MenuItem>
                        ) : null
                      )}
                    </Select>
                    <span className="text-danger fs12">
                      {_validate.userRoleId.message}
                    </span>
                  </FormControl>
                </div>
                <div className="col-md-4 my-3">
                  <div className="text-muted fs14 mb-1">Branch</div>
                  <FormControl fullWidth error={_validate.branchId.error}>
                    <Select
                      size="small"
                      value={_formData.branchId}
                      onChange={(e: any) =>
                        changeFormData("branchId", e.target.value)
                      }
                      style={{ backgroundColor: "#F3F3F3" }}
                    >
                      <MenuItem value="">Select</MenuItem>
                      {_branchList?.map((item: any) => (
                        <MenuItem key={item?.id} value={item?.id}>
                          {item?.branchName}
                        </MenuItem>
                      ))}
                    </Select>
                    <span className="text-danger fs12">
                      {_validate.branchId.message}
                    </span>
                  </FormControl>
                </div>
              </div>
            </div>
            <div className="row">
              <hr />
              <div className="col-md-8 mb-2" />
              <div className="col-md-4 mb-2">
                <div className="d-flex align-items-center justify-content-end mobJustify gap-2">
                  <FormControlLabel
                    label="Active"
                    control={
                      <Checkbox
                        className="text-capitalize"
                        checked={_formData.isActive}
                        onChange={() =>
                          changeFormData("isActive", !_formData.isActive)
                        }
                      />
                    }
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={_loading}
                    className=""
                    onClick={handleSubmitForm}
                  >
                    {_formData.id > 0 ? "Update" : "Save"}
                  </Button>
                  <Button
                    className="text-capitalize bg-white"
                    variant="outlined"
                    onClick={handleGoBack}
                  >
                    Back
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
