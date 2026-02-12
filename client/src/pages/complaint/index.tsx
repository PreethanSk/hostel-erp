import { ChangeEvent, useEffect, useState } from "react";
import {
  Button,
  MenuItem,
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
  commonUploadFile,
  getBranchGridList,
  getComplaintsDetailsById,
  getComplaintsGridList,
  getMasterIssueCategory,
  getMasterIssueSubCategory,
  getServiceProvider,
  getServiceProviderCategory,
  insertUpdateComplaints,
  updateComplaintStatus,
} from "../../models";
import CustomSearch from "../../components/helpers/CustomSearch";
import CustomSelect from "../../components/helpers/CustomSelect";
import DateRangeSelector from "../../components/helpers/DateRangeSelector";
import CustomDialogue from "../../components/helpers/CustomDialogue";
import { IMAGES_ICON } from "../../assets/images/exportImages";
import { SkeletonProviderTables } from "../../providers/SkeletonProvider";
import { ROUTES } from "../../configs/constants";

type ComplaintStatus = "Open" | "InProgress" | "Hold" | "Closed" | "Reject" | "";

type ComplaintItem = {
  id: number;
  branchRefId?: number;
  roomRefId?: number;
  cotRefId?: number;
  branchName?: string;
  roomNumber?: string;
  cotNumber?: string;
  candidateName?: string;
  complaintDescription?: string;
  complaintStatus?: ComplaintStatus;
  issueType?: string;
  subCategoryName?: string;
  photosUrl?: string;
  resolvedPhotoUrl?: string;
  serviceProviderId?: number;
  serviceCategoryId?: number;
  updatedAt?: string;
};

type BranchItem = {
  id: number;
  branchName: string;
};

type IssueTypeItem = {
  id: number;
  issueType: string;
  isActive?: boolean;
};

type IssueSubCategoryItem = {
  id: number;
  issueId: number;
  subCategoryName: string;
  isActive?: boolean;
};

type ServiceProviderCategoryItem = {
  id: number;
  name: string;
  isActive?: boolean;
};

type ServiceProviderItem = {
  id: number;
  contactPerson?: string;
  name?: string;
  type?: string;
};

type NewComplaintForm = {
  branchId: string;
  roomId: string;
  issueTypeId: string;
  issueSubCategoryId: string;
  description: string;
  photoUrl: string;
};

type NewComplaintValidate = {
  branchId: { error: boolean; message: string };
  roomId: { error: boolean; message: string };
  issueTypeId: { error: boolean; message: string };
  issueSubCategoryId: { error: boolean; message: string };
  description: { error: boolean; message: string };
};

type StatusForm = {
  status: ComplaintStatus;
  remarks: string;
  serviceCategoryId: string;
  serviceProviderId: string;
};

type Props = {
  PageAccess: string;
};

const emptyNewForm: NewComplaintForm = {
  branchId: "",
  roomId: "",
  issueTypeId: "",
  issueSubCategoryId: "",
  description: "",
  photoUrl: "",
};

const newFormValidate: NewComplaintValidate = {
  branchId: { error: false, message: "" },
  roomId: { error: false, message: "" },
  issueTypeId: { error: false, message: "" },
  issueSubCategoryId: { error: false, message: "" },
  description: { error: false, message: "" },
};

const emptyStatusForm: StatusForm = {
  status: "",
  remarks: "",
  serviceCategoryId: "",
  serviceProviderId: "",
};

export default function Complaint({ PageAccess }: Props) {
  const [_tableItems, _setTableItems] = useState<ComplaintItem[]>([]);
  const [_tableLoading, _setTableLoading] = useState(true);
  const [_search, _setSearch] = useState("");

  const [_branchList, _setBranchList] = useState<BranchItem[]>([]);
  const [_branchId, _setBranchId] = useState<string>("");
  const [_statusFilter, _setStatusFilter] = useState<ComplaintStatus>("");
  const [_fromDate, _setFromDate] = useState<string>("");
  const [_toDate, _setToDate] = useState<string>("");

  const [_issueTypes, _setIssueTypes] = useState<IssueTypeItem[]>([]);
  const [_issueSubCategories, _setIssueSubCategories] = useState<IssueSubCategoryItem[]>([]);
  const [_rooms, _setRooms] = useState<any[]>([]);
  const [_serviceCategories, _setServiceCategories] = useState<ServiceProviderCategoryItem[]>([]);
  const [_serviceProviders, _setServiceProviders] = useState<ServiceProviderItem[]>([]);

  const [_dialogOpen, _setDialogOpen] = useState(false);
  const [_dialogMode, _setDialogMode] = useState<"view" | "create">("view");
  const [_selectedComplaint, _setSelectedComplaint] = useState<ComplaintItem | null>(null);
  const [_complaintDetail, _setComplaintDetail] = useState<any | null>(null);
  const [_detailLoading, _setDetailLoading] = useState(false);

  const [_newForm, _setNewForm] = useState<NewComplaintForm>({ ...emptyNewForm });
  const [_newValidate, _setNewValidate] = useState<NewComplaintValidate>({ ...newFormValidate });
  const [_newSaving, _setNewSaving] = useState(false);

  const [_statusForm, _setStatusForm] = useState<StatusForm>({ ...emptyStatusForm });
  const [_statusSaving, _setStatusSaving] = useState(false);
  const [_resolvedFile, _setResolvedFile] = useState<File | null>(null);

  const loadBranches = () => {
    getBranchGridList(1, 0)
      .then((resp: any) => {
        if (resp?.data?.status === "success") {
          _setBranchList(resp?.data?.result?.results || []);
        }
      })
      .catch(console.log);
  };

  const loadIssueMasters = () => {
    getMasterIssueCategory()
      .then((resp: any) => {
        if (resp?.data?.status === "success") {
          _setIssueTypes(resp?.data?.result || []);
        }
      })
      .catch(console.log);

    getMasterIssueSubCategory()
      .then((resp: any) => {
        if (resp?.data?.status === "success") {
          _setIssueSubCategories(resp?.data?.result || []);
        }
      })
      .catch(console.log);
  };

  const loadServiceProviderMasters = () => {
    getServiceProviderCategory()
      .then((resp: any) => {
        if (resp?.data?.status === "success") {
          _setServiceCategories(resp?.data?.result || []);
        }
      })
      .catch(console.log);
  };

  const loadComplaints = () => {
    _setTableLoading(true);
    getComplaintsGridList(1, 0, _branchId, _statusFilter || "", _fromDate, _toDate)
      .then((resp: any) => {
        if (resp?.data?.status === "success") {
          const result = resp?.data?.result;
          const items = (result && (result.results || result)) || [];
          _setTableItems(items);
        } else {
          CustomAlert("warning", resp?.data?.error || "Unable to load complaints");
        }
      })
      .catch((err: any) => {
        console.log(err);
        CustomAlert("warning", "Unable to load complaints");
      })
      .finally(() => _setTableLoading(false));
  };

  const loadRoomsForBranch = (branchId: string) => {
    if (!branchId) {
      _setRooms([]);
      return;
    }
    getBranchGridList(1, 0)
      .then((resp: any) => {
        if (resp?.data?.status === "success") {
          const branches = resp?.data?.result?.results || [];
          const branch = branches.find((b: any) => `${b?.id}` === branchId);
          if (!branch) return;
        }
      })
      .catch(console.log);
    // Rooms for selected branch (admin view)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    import("../../models").then((m) => {
      m
        .getBranchRoomsList(Number(branchId), "admin")
        .then((resp: any) => {
          if (resp?.data?.status === "success") {
            _setRooms(resp?.data?.result || []);
          }
        })
        .catch((err: any) => {
          console.log(err);
          CustomAlert("warning", "Unable to load rooms");
        });
    });
  };

  const handleChangeDate = (from: string, to: string) => {
    _setFromDate(from);
    _setToDate(to);
  };

  const handleOpenNew = () => {
    _setDialogMode("create");
    _setNewForm({ ...emptyNewForm, branchId: _branchId || "" });
    _setNewValidate({ ...newFormValidate });
    _setResolvedFile(null);
    _setDialogOpen(true);
    if (_branchId) {
      loadRoomsForBranch(_branchId);
    }
  };

  const handleOpenDetail = (item: ComplaintItem) => {
    _setDialogMode("view");
    _setSelectedComplaint(item);
    _setComplaintDetail(null);
    _setStatusForm({
      status: (item.complaintStatus as ComplaintStatus) || "Open",
      remarks: "",
      serviceCategoryId: item.serviceCategoryId ? String(item.serviceCategoryId) : "",
      serviceProviderId: item.serviceProviderId ? String(item.serviceProviderId) : "",
    });
    _setResolvedFile(null);
    _setDialogOpen(true);
    loadComplaintDetail(item);
    loadServiceProviders(item.serviceCategoryId ? String(item.serviceCategoryId) : "");
  };

  const handleCloseDialog = () => {
    _setDialogOpen(false);
    _setSelectedComplaint(null);
    _setComplaintDetail(null);
    _setNewForm({ ...emptyNewForm });
    _setStatusForm({ ...emptyStatusForm });
    _setResolvedFile(null);
  };

  const loadComplaintDetail = (item: ComplaintItem) => {
    if (!item?.id) return;
    _setDetailLoading(true);
    getComplaintsDetailsById(
      item.branchRefId ? String(item.branchRefId) : "",
      String(item.id)
    )
      .then((resp: any) => {
        if (resp?.data?.status === "success") {
          const result = resp?.data?.result || [];
          _setComplaintDetail(result[0] || null);
        } else {
          CustomAlert("warning", resp?.data?.error || "Unable to load complaint detail");
        }
      })
      .catch((err: any) => {
        console.log(err);
        CustomAlert("warning", "Unable to load complaint detail");
      })
      .finally(() => _setDetailLoading(false));
  };

  const loadServiceProviders = (categoryId: string) => {
    const payload: any = {};
    if (categoryId) {
      payload.categoryId = categoryId;
    }
    getServiceProvider(payload)
      .then((resp: any) => {
        if (resp?.data?.status === "success") {
          _setServiceProviders(resp?.data?.result || []);
        }
      })
      .catch(console.log);
  };

  const changeNewForm = (key: keyof NewComplaintForm, value: string) => {
    const updated = { ..._newForm, [key]: value };
    _setNewForm(updated);
    if (key === "branchId") {
      loadRoomsForBranch(value);
      updated.roomId = "";
    }
    _setNewForm(updated);
  };

  const validateNewForm = () => {
    const validation: NewComplaintValidate = {
      branchId: { ...newFormValidate.branchId },
      roomId: { ...newFormValidate.roomId },
      issueTypeId: { ...newFormValidate.issueTypeId },
      issueSubCategoryId: { ...newFormValidate.issueSubCategoryId },
      description: { ...newFormValidate.description },
    };
    let valid = true;

    if (!_newForm.branchId) {
      validation.branchId.error = true;
      validation.branchId.message = "Required Field";
      valid = false;
    }
    if (!_newForm.roomId) {
      validation.roomId.error = true;
      validation.roomId.message = "Required Field";
      valid = false;
    }
    if (!_newForm.issueTypeId) {
      validation.issueTypeId.error = true;
      validation.issueTypeId.message = "Required Field";
      valid = false;
    }
    if (!_newForm.issueSubCategoryId) {
      validation.issueSubCategoryId.error = true;
      validation.issueSubCategoryId.message = "Required Field";
      valid = false;
    }
    if (!_newForm.description?.toString()?.trim()) {
      validation.description.error = true;
      validation.description.message = "Required Field";
      valid = false;
    }

    _setNewValidate(validation);
    return valid;
  };

  const handleNewPhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    const file = files[0];
    try {
      const formData = new FormData();
      formData.append("file", file);
      const resp: any = await commonUploadFile(formData);
      if (resp?.data?.file) {
        _setNewForm({
          ..._newForm,
          photoUrl: resp.data.file,
        });
        CustomAlert("success", "Issue photo uploaded");
      } else {
        CustomAlert("warning", "Unable to upload file");
      }
    } catch (error) {
      console.log(error);
      CustomAlert("warning", "Unable to upload file");
    } finally {
      e.target.value = "";
    }
  };

  const handleCreateComplaint = () => {
    if (!validateNewForm()) return;
    _setNewSaving(true);

    const body = {
      id: 0,
      branchRefId: Number(_newForm.branchId),
      roomRefId: Number(_newForm.roomId),
      cotRefId: null,
      issueTypeRefId: Number(_newForm.issueTypeId),
      issueSubCategoryRefId: Number(_newForm.issueSubCategoryId),
      complaintDescription: _newForm.description?.trim(),
      photosUrl: _newForm.photoUrl || "",
      complaintStatus: "Open",
    };

    insertUpdateComplaints(body)
      .then((resp: any) => {
        if (resp?.data?.status === "success") {
          CustomAlert("success", "Complaint created successfully");
          handleCloseDialog();
          loadComplaints();
        } else {
          CustomAlert("warning", resp?.data?.error || "Unable to create complaint");
        }
      })
      .catch((err: any) => {
        console.log(err);
        CustomAlert("warning", "Unable to create complaint");
      })
      .finally(() => _setNewSaving(false));
  };

  const handleChangeStatusForm = (key: keyof StatusForm, value: string) => {
    const updated = { ..._statusForm, [key]: value };
    _setStatusForm(updated);
    if (key === "serviceCategoryId") {
      _setStatusForm({ ...updated, serviceProviderId: "" });
      loadServiceProviders(value);
    }
  };

  const handleResolvedFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    _setResolvedFile(files[0]);
  };

  const handleUpdateStatus = async () => {
    if (!_selectedComplaint?.id) return;

    if (!_statusForm.status) {
      CustomAlert("warning", "Please select complaint status");
      return;
    }

    if (!_statusForm.serviceProviderId) {
      CustomAlert("warning", "Please select service provider");
      return;
    }

    if (_statusForm.status === "Closed" && !_resolvedFile && !_selectedComplaint?.resolvedPhotoUrl) {
      CustomAlert("warning", "Resolved photo is required when closing a complaint");
      return;
    }

    _setStatusSaving(true);
    let resolvedPhotoUrl = _selectedComplaint?.resolvedPhotoUrl || "";

    try {
      if (_resolvedFile) {
        const formData = new FormData();
        formData.append("file", _resolvedFile);
        const resp: any = await commonUploadFile(formData);
        if (resp?.data?.file) {
          resolvedPhotoUrl = resp.data.file;
        } else {
          CustomAlert("warning", "Unable to upload resolved photo");
          _setStatusSaving(false);
          return;
        }
      }

      if (_statusForm.serviceCategoryId) {
        const assignBody: any = {
          id: _selectedComplaint.id,
          serviceProviderId: Number(_statusForm.serviceProviderId),
          serviceCategoryId: Number(_statusForm.serviceCategoryId),
        };
        await insertUpdateComplaints(assignBody);
      }

      const statusBody: any = {
        complaintId: _selectedComplaint.id,
        serviceProviderId: Number(_statusForm.serviceProviderId),
        complaintStatus: _statusForm.status,
        resolvedPhotoUrl: resolvedPhotoUrl || "",
        comment: _statusForm.remarks || "",
      };

      const respStatus: any = await updateComplaintStatus(statusBody);
      if (respStatus?.data?.status === "success") {
        CustomAlert("success", respStatus?.data?.result?.message || "Complaint updated successfully");
        handleCloseDialog();
        loadComplaints();
      } else {
        CustomAlert("warning", respStatus?.data?.error || "Unable to update complaint status");
      }
    } catch (error) {
      console.log(error);
      CustomAlert("warning", "Unable to update complaint status");
    } finally {
      _setStatusSaving(false);
    }
  };

  const getPrintTableHeadBody = () => {
    const header = ["S. No", "Candidate", "Branch / Room", "Issue", "Status", "Last Updated"];
    const body = _tableItems?.map((item: ComplaintItem, index: number) => [
      index + 1,
      item?.candidateName || "",
      `${item?.branchName || ""} / Room ${item?.roomNumber || ""}`,
      `${item?.issueType || ""}${
        item?.subCategoryName ? " / " + item.subCategoryName : ""
      }`,
      item?.complaintStatus || "",
      item?.updatedAt || "",
    ]);
    return { header, body };
  };

  const exportEXCEL = () => {
    const { header, body } = getPrintTableHeadBody();
    getExportEXCEL({ header, body, fileName: "Complaints" });
  };

  const filteredItems = _tableItems?.filter((content: any) => {
    const lowerSearchInput = _search?.toLowerCase()?.trim();
    if (!lowerSearchInput) return true;
    return Object?.values(content || {})?.some((value: any) =>
      value?.toString()?.toLowerCase()?.includes(lowerSearchInput)
    );
  });

  useEffect(() => {
    loadBranches();
    loadIssueMasters();
    loadServiceProviderMasters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_branchId, _statusFilter, _fromDate, _toDate]);

  const renderDialogContent = () => {
    if (_dialogMode === "create") {
      const availableSubCategories = _issueSubCategories?.filter(
        (s: IssueSubCategoryItem) => `${s.issueId}` === _newForm.issueTypeId
      );

      return (
        <>
          <div className="py-3">
            <div className="row">
              <div className="col-md-4 my-2">
                <div className="text-muted fs14 mb-1">Branch</div>
                <TextField
                  fullWidth
                  select
                  size="small"
                  sx={{ ...textFieldStyle }}
                  value={_newForm.branchId}
                  onChange={(e: any) => changeNewForm("branchId", e.target.value)}
                  error={_newValidate.branchId.error}
                  helperText={_newValidate.branchId.message}
                >
                  <option value="">Select</option>
                  {_branchList?.map((item: BranchItem) => (
                    <option key={item.id} value={item.id}>
                      {item.branchName}
                    </option>
                  ))}
                </TextField>
              </div>
              <div className="col-md-4 my-2">
                <div className="text-muted fs14 mb-1">Room</div>
                <TextField
                  fullWidth
                  select
                  size="small"
                  sx={{ ...textFieldStyle }}
                  value={_newForm.roomId}
                  onChange={(e: any) => changeNewForm("roomId", e.target.value)}
                  error={_newValidate.roomId.error}
                  helperText={_newValidate.roomId.message}
                  disabled={!_newForm.branchId}
                >
                  <option value="">Select</option>
                  {_rooms?.map((room: any) => (
                    <option key={room?.id} value={room?.id}>
                      {room?.roomNumber}
                    </option>
                  ))}
                </TextField>
              </div>
              <div className="col-md-4 my-2">
                <div className="text-muted fs14 mb-1">Issue Type</div>
                <TextField
                  fullWidth
                  select
                  size="small"
                  sx={{ ...textFieldStyle }}
                  value={_newForm.issueTypeId}
                  onChange={(e: any) => changeNewForm("issueTypeId", e.target.value)}
                  error={_newValidate.issueTypeId.error}
                  helperText={_newValidate.issueTypeId.message}
                >
                  <option value="">Select</option>
                  {_issueTypes
                    ?.filter((i) => i.isActive ?? true)
                    ?.map((item: IssueTypeItem) => (
                      <option key={item.id} value={item.id}>
                        {item.issueType}
                      </option>
                    ))}
                </TextField>
              </div>
              <div className="col-md-6 my-2">
                <div className="text-muted fs14 mb-1">Issue Sub-Category</div>
                <TextField
                  fullWidth
                  select
                  size="small"
                  sx={{ ...textFieldStyle }}
                  value={_newForm.issueSubCategoryId}
                  onChange={(e: any) => changeNewForm("issueSubCategoryId", e.target.value)}
                  error={_newValidate.issueSubCategoryId.error}
                  helperText={_newValidate.issueSubCategoryId.message}
                  disabled={!_newForm.issueTypeId}
                >
                  <option value="">Select</option>
                  {availableSubCategories?.map((item: IssueSubCategoryItem) => (
                    <option key={item.id} value={item.id}>
                      {item.subCategoryName}
                    </option>
                  ))}
                </TextField>
              </div>
              <div className="col-md-6 my-2">
                <div className="text-muted fs14 mb-1">Issue Description</div>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  sx={{ ...textFieldStyle }}
                  value={_newForm.description}
                  onChange={(e: any) => changeNewForm("description", e.target.value)}
                  error={_newValidate.description.error}
                  helperText={_newValidate.description.message}
                />
              </div>
              <div className="col-md-6 my-2">
                <div className="text-muted fs14 mb-1">Issue Photo (optional)</div>
                <div className="d-flex align-items-center gap-2">
                  <label className="btn btn-light btn-sm text-capitalize mb-0">
                    <img
                      height={18}
                      draggable={false}
                      src={IMAGES_ICON.TableNewItemIcon}
                      alt="icon"
                      className="me-1"
                    />
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleNewPhotoChange}
                    />
                  </label>
                  {_newForm.photoUrl && (
                    <span className="fs12 text-muted text-truncate">
                      {_newForm.photoUrl.split("/").pop()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }

    const detail = _complaintDetail || _selectedComplaint;

    return (
      <div className="py-3">
        {_detailLoading ? (
          <div className="text-center py-4">Loading complaint details...</div>
        ) : detail ? (
          <>
            <div className="row mb-3">
              <div className="col-md-6 my-2">
                <div className="fw-bold mb-1">
                  {detail?.candidateName || "Complaint"}{" "}
                </div>
                <div className="fs12 text-muted">
                  {detail?.branchName || _selectedComplaint?.branchName || "-"}{" "}
                  {detail?.roomNumber || _selectedComplaint?.roomNumber
                    ? ` / Room ${detail?.roomNumber || _selectedComplaint?.roomNumber}`
                    : ""}
                  {detail?.cotNumber || _selectedComplaint?.cotNumber
                    ? ` / Cot ${detail?.cotNumber || _selectedComplaint?.cotNumber}`
                    : ""}
                </div>
                <div className="fs12 text-muted mt-1">
                  {detail?.issueType || _selectedComplaint?.issueType || "-"}
                  {detail?.subCategoryName || _selectedComplaint?.subCategoryName
                    ? ` / ${detail?.subCategoryName || _selectedComplaint?.subCategoryName}`
                    : ""}
                </div>
              </div>
              <div className="col-md-6 my-2">
                <div className="d-flex flex-column align-items-md-end">
                  <div className="mb-1">
                    <span className="fs12 text-muted me-2">Status:</span>
                    <span className="fs12 statusBgActive text-success rounded--50 px-3 py-1">
                      {detail?.complaintStatus ||
                        _selectedComplaint?.complaintStatus ||
                        "Open"}
                    </span>
                  </div>
                  {detail?.candidateMobileNumber && (
                    <div className="fs12 text-muted">
                      Candidate: {detail?.candidateMobileNumber}
                    </div>
                  )}
                  {detail?.managerMobileNumber && (
                    <div className="fs12 text-muted">
                      Manager: {detail?.managerMobileNumber}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6 my-2">
                <div className="text-muted fs14 mb-1">Description</div>
                <div className="bg-field-gray border rounded px-2 py-2 fs14">
                  {detail?.complaintDescription ||
                    _selectedComplaint?.complaintDescription ||
                    "-"}
                </div>
              </div>
              <div className="col-md-6 my-2">
                <div className="row">
                  <div className="col-sm-6 mb-2">
                    <div className="text-muted fs14 mb-1">Issue Photo</div>
                    {detail?.photosUrl || _selectedComplaint?.photosUrl ? (
                      <div className="ratio ratio-4x3 bg-light rounded overflow-hidden">
                        <img
                          src={
                            ROUTES.API.DOWNLOAD_FILE +
                            (detail?.photosUrl || _selectedComplaint?.photosUrl)
                          }
                          alt="Issue"
                          className="w-100 h-100 object-fit-cover"
                          draggable={false}
                        />
                      </div>
                    ) : (
                      <div className="bg-field-gray border rounded px-2 py-3 text-center fs12 text-muted">
                        No issue photo uploaded
                      </div>
                    )}
                  </div>
                  <div className="col-sm-6 mb-2">
                    <div className="text-muted fs14 mb-1">Resolved Photo</div>
                    {detail?.resolvedPhotoUrl || _selectedComplaint?.resolvedPhotoUrl ? (
                      <div className="ratio ratio-4x3 bg-light rounded overflow-hidden">
                        <img
                          src={
                            ROUTES.API.DOWNLOAD_FILE +
                            (detail?.resolvedPhotoUrl ||
                              _selectedComplaint?.resolvedPhotoUrl)
                          }
                          alt="Resolved"
                          className="w-100 h-100 object-fit-cover"
                          draggable={false}
                        />
                      </div>
                    ) : (
                      <div className="bg-field-gray border rounded px-2 py-3 text-center fs12 text-muted">
                        Not yet resolved
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {PageAccess !== "ReadOnly" && (
              <>
                <hr />
                <div className="row mt-3">
                  <div className="col-md-4 my-2">
                    <div className="text-muted fs14 mb-1">Service Category</div>
                    <TextField
                      fullWidth
                      select
                      size="small"
                      sx={{ ...textFieldStyle }}
                      value={_statusForm.serviceCategoryId}
                      onChange={(e: any) =>
                        handleChangeStatusForm("serviceCategoryId", e.target.value)
                      }
                    >
                      <option value="">Select</option>
                      {_serviceCategories
                        ?.filter((c) => c.isActive ?? true)
                        ?.map((item: ServiceProviderCategoryItem) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                    </TextField>
                  </div>
                  <div className="col-md-4 my-2">
                    <div className="text-muted fs14 mb-1">Service Provider</div>
                    <TextField
                      fullWidth
                      select
                      size="small"
                      sx={{ ...textFieldStyle }}
                      value={_statusForm.serviceProviderId}
                      onChange={(e: any) =>
                        handleChangeStatusForm("serviceProviderId", e.target.value)
                      }
                    >
                      <option value="">Select</option>
                      {_serviceProviders?.map((item: ServiceProviderItem) => (
                        <option key={item.id} value={item.id}>
                          {item.contactPerson || item.name || `Provider #${item.id}`}
                        </option>
                      ))}
                    </TextField>
                  </div>
                  <div className="col-md-4 my-2">
                    <div className="text-muted fs14 mb-1">Status</div>
                    <TextField
                      fullWidth
                      select
                      size="small"
                      sx={{ ...textFieldStyle }}
                      value={_statusForm.status}
                      onChange={(e: any) =>
                        handleChangeStatusForm("status", e.target.value)
                      }
                    >
                      <option value="">Select</option>
                      <option value="Open">Open</option>
                      <option value="InProgress">In Progress</option>
                      <option value="Hold">Hold</option>
                      <option value="Closed">Closed</option>
                      <option value="Reject">Reject</option>
                    </TextField>
                  </div>
                  <div className="col-md-8 my-2">
                    <div className="text-muted fs14 mb-1">Remarks</div>
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      sx={{ ...textFieldStyle }}
                      value={_statusForm.remarks}
                      onChange={(e: any) =>
                        handleChangeStatusForm("remarks", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-md-4 my-2">
                    <div className="text-muted fs14 mb-1">Resolved Photo</div>
                    <div className="d-flex align-items-center gap-2">
                      <label className="btn btn-light btn-sm text-capitalize mb-0">
                        <img
                          height={18}
                          draggable={false}
                          src={IMAGES_ICON.TableNewItemIcon}
                          alt="icon"
                          className="me-1"
                        />
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={handleResolvedFileChange}
                        />
                      </label>
                      {_resolvedFile && (
                        <span className="fs12 text-muted text-truncate">
                          {_resolvedFile.name}
                        </span>
                      )}
                    </div>
                    <div className="fs12 text-muted mt-1">
                      Required when status is <strong>Closed</strong>.
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="text-center py-4 text-muted">Complaint not found.</div>
        )}
      </div>
    );
  };

  const renderDialogActions = () => {
    if (_dialogMode === "create") {
      return (
        <div className="d-flex justify-content-end align-items-center gap-2 w-100 px-3 pb-3">
          <Button
            className="text-capitalize bg-white"
            variant="outlined"
            onClick={handleCloseDialog}
          >
            Cancel
          </Button>
          <Button
            className="text-capitalize"
            variant="contained"
            color="primary"
            disabled={_newSaving}
            onClick={handleCreateComplaint}
          >
            Save Complaint
          </Button>
        </div>
      );
    }

    return (
      <div className="d-flex justify-content-end align-items-center gap-2 w-100 px-3 pb-3">
        <Button
          className="text-capitalize bg-white"
          variant="outlined"
          onClick={handleCloseDialog}
        >
          Close
        </Button>
        {PageAccess !== "ReadOnly" && (
          <Button
            className="text-capitalize"
            variant="contained"
            color="primary"
            disabled={_statusSaving}
            onClick={handleUpdateStatus}
          >
            Update
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="container-fluid py-3">
      <div className="container">
        <div className="row justify-content-between align-items-center py-3">
          <div className="col-md-5 my-2">
            <div className="d-flex align-items-center gap-2 mobJustify">
              <span className="text-dark fw-bold">Complaints </span>
              <span className="text-dark">
                <KeyboardArrowRightRounded />
              </span>
              <span className="text-muted">Complaints List</span>
            </div>
          </div>
          <div className="my-2 col-md-7">
            <div className="d-flex justify-content-end align-items-center gap-4 mobJustify">
              {PageAccess !== "ReadOnly" && (
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
                  onClick={handleOpenNew}
                >
                  Add Complaint
                </Button>
              )}
              <CustomSearch getSearchText={(value: string) => _setSearch(value)} />
              <img
                height={24}
                draggable={false}
                src={IMAGES_ICON.TableDownloadIcon}
                role="button"
                onClick={exportEXCEL}
              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-lg-4 mb-2">
            <CustomSelect
              className="bg-white"
              placeholder="Select Branch"
              value={_branchId}
              onChange={(e: any) => _setBranchId(e?.target?.value || "")}
              padding={"0px 10px"}
              menuItem={[
                <MenuItem key="All" value="">
                  All Branches
                </MenuItem>,
                ...(_branchList || [])?.map((item: BranchItem) => (
                  <MenuItem key={item?.id} value={item?.id}>
                    {item?.branchName}
                  </MenuItem>
                )),
              ]}
            />
          </div>
          <div className="col-lg-4 mb-2">
            <CustomSelect
              className="bg-white"
              placeholder="Complaint Status"
              value={_statusFilter}
              onChange={(e: any) => _setStatusFilter(e?.target?.value || "")}
              padding={"0px 10px"}
              menuItem={[
                <MenuItem key="All" value="">
                  All Status
                </MenuItem>,
                <MenuItem key="Open" value="Open">
                  Open
                </MenuItem>,
                <MenuItem key="InProgress" value="InProgress">
                  In Progress
                </MenuItem>,
                <MenuItem key="Hold" value="Hold">
                  Hold
                </MenuItem>,
                <MenuItem key="Closed" value="Closed">
                  Closed
                </MenuItem>,
                <MenuItem key="Reject" value="Reject">
                  Reject
                </MenuItem>,
              ]}
            />
          </div>
          <div className="col-lg-4 mb-2">
            <DateRangeSelector
              className="bg-white"
              handleChangeDate={handleChangeDate}
            />
          </div>
        </div>

        <TableContainer className="tableBorder rounded">
          <Table sx={{ ...customTableTemplate }}>
            <TableHead>
              <TableRow sx={{ ...customTableHeader }}>
                <TableCell className="fw-bold">S.No</TableCell>
                <TableCell className="fw-bold">Complaint</TableCell>
                <TableCell className="fw-bold">Branch / Room</TableCell>
                <TableCell className="fw-bold">Issue</TableCell>
                <TableCell className="fw-bold">Status</TableCell>
                <TableCell className="fw-bold">Last Updated</TableCell>
                <TableCell className="fw-bold" align="center">
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems?.length > 0 ? (
                filteredItems?.map((item: ComplaintItem, index: number) => (
                  <TableRow key={item.id || index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="text-nowrap">
                      <div className="fw-bold">
                        {item.candidateName || "Complaint #" + item.id}
                      </div>
                      <div className="fs12 text-muted text-truncate">
                        {item.complaintDescription || ""}
                      </div>
                    </TableCell>
                    <TableCell className="text-nowrap">
                      <div className="fw-bold">
                        {item.branchName || "Branch -"}
                      </div>
                      <div className="fs12 text-muted">
                        Room {item.roomNumber || "-"}
                      </div>
                    </TableCell>
                    <TableCell className="text-nowrap">
                      <div className="fs12">
                        {item.issueType || "-"}
                        {item.subCategoryName
                          ? ` / ${item.subCategoryName}`
                          : ""}
                      </div>
                    </TableCell>
                    <TableCell className="text-nowrap">
                      <span className="fs12 statusBgActive text-success rounded--50 px-3 py-1">
                        {item.complaintStatus || "Open"}
                      </span>
                    </TableCell>
                    <TableCell className="text-nowrap">
                      {item.updatedAt || "-"}
                    </TableCell>
                    <TableCell align="center">
                      <div className="d-flex align-items-center justify-content-center gap-3">
                        <div
                          className="d-flex align-items-center justify-content-center gap-1"
                          role="button"
                          onClick={() => handleOpenDetail(item)}
                        >
                          <span className="">View</span>
                          <img
                            height="16"
                            src={IMAGES_ICON.EyeIcon}
                            alt="icon"
                            draggable="false"
                          />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : !_tableLoading ? (
                <TableRow>
                  <TableCell
                    className="fs-3 text-muted"
                    align="center"
                    colSpan={7}
                  >
                    Data Not Found
                  </TableCell>
                </TableRow>
              ) : null}
              <SkeletonProviderTables columns={7} visible={_tableLoading} />
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      <CustomDialogue
        title={
          _dialogMode === "create"
            ? "Add Complaint"
            : "Complaint Details"
        }
        dialogueFlag={_dialogOpen}
        displaySize="md"
        mainContent={renderDialogContent()}
        actionContent={renderDialogActions()}
        onCloseClick={handleCloseDialog}
      />
    </div>
  );
}
