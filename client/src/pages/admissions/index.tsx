import { useEffect, useState } from "react";
import {
  Button,
  MenuItem,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { KeyboardArrowRightRounded } from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTES } from "../../configs/constants";
import {
  CustomAlert,
  customTableHeader,
  customTableTemplate,
} from "../../services/HelperService";
import {
  deleteCandidateAdmission,
  getAdmissionGridList,
  getApprovedAdmissionGridList,
  getBranchGridList,
} from "../../models";
import CustomSearch from "../../components/helpers/CustomSearch";
import CustomSelect from "../../components/helpers/CustomSelect";
import DateRangeSelector from "../../components/helpers/DateRangeSelector";
import { IMAGES_ICON } from "../../assets/images/exportImages";
import { SkeletonProviderTables } from "../../providers/SkeletonProvider";
import Swal from "sweetalert2";

type AdmissionTab = "pending" | "approved";

type AdmissionItem = {
  id?: number;
  admissionId?: number;
  candidateRefId?: number;
  candidateId?: number | string;
  candidateName?: string;
  mobileNumber?: string;
  email?: string;
  emailId?: string;
  branchRefId?: number;
  branchId?: number;
  branchName?: string;
  roomRefId?: number;
  roomNumber?: string;
  roomNo?: string;
  cotRefId?: number;
  cotNumber?: string;
  cotNo?: string;
  dateOfAdmission?: string;
  admissionStatus?: string;
  status?: string;
  paymentStatus?: string;
};

type BranchItem = {
  id: number;
  branchName: string;
};

type Props = {
  PageAccess: string;
};

export default function AdmissionList({ PageAccess }: Props) {
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();

  const [_activeTab, _setActiveTab] = useState<AdmissionTab>("pending");
  const [_tableItems, _setTableItems] = useState<AdmissionItem[]>([]);
  const [_tableLoading, _setTableLoading] = useState(true);
  const [_search, _setSearch] = useState("");
  const [_branchList, _setBranchList] = useState<BranchItem[]>([]);
  const [_branchId, _setBranchId] = useState<string>("");
  const [_fromDate, _setFromDate] = useState<string>("");
  const [_toDate, _setToDate] = useState<string>("");

  const loadBranches = () => {
    getBranchGridList(1, 0)
      .then((resp: any) => {
        if (resp?.data?.status === "success") {
          _setBranchList(resp?.data?.result?.results || []);
        }
      })
      .catch(console.log);
  };

  const loadAdmissions = () => {
    _setTableLoading(true);
    const isApproved = _activeTab === "approved";
    const apiCall = isApproved ? getApprovedAdmissionGridList : getAdmissionGridList;

    apiCall(1, 0, _branchId, _fromDate, _toDate)
      .then((resp: any) => {
        if (resp?.data?.status === "success") {
          const result = resp?.data?.result;
          // support both paginated {results: []} and plain array responses
          _setTableItems((result && (result.results || result)) || []);
        } else {
          CustomAlert("warning", resp?.data?.error || "Failed to fetch admissions");
        }
      })
      .catch((err: any) => {
        console.log(err);
        CustomAlert("warning", "Unable to load admissions");
      })
      .finally(() => _setTableLoading(false));
  };

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    loadAdmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_activeTab, _branchId, _fromDate, _toDate]);

  const handleTabChange = (_e: any, value: AdmissionTab) => {
    _setActiveTab(value);
  };

  const handleChangeDate = (from: string, to: string) => {
    _setFromDate(from);
    _setToDate(to);
  };

  const handleCreateAdmission = () => {
    setSearchParams({});
    navigate(ROUTES.HOME.ADMISSION.CONFIRMATION);
  };

  const handleManageAdmission = (item: AdmissionItem) => {
    const params: any = {};
    const admissionId = item.admissionId || item.id;
    const branchId = item.branchId || item.branchRefId;
    const candidateId = item.candidateRefId || item.candidateId;
    const cotId = item.cotRefId;

    if (candidateId) params.candidateId = candidateId;
    if (branchId) params.branchId = branchId;
    if (admissionId) params.admissionId = admissionId;
    if (cotId) params.cotId = cotId;

    const query = new URLSearchParams(params).toString();
    navigate(`${ROUTES.HOME.ADMISSION.CONFIRMATION}${query ? `?${query}` : ""}`);
  };

  const handleDeleteAdmission = (item: AdmissionItem) => {
    const admissionId = item.admissionId || item.id;
    if (!admissionId) return;
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this admission!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#388024",
      cancelButtonColor: "#bf1029",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteCandidateAdmission(admissionId)
          .then((resp: any) => {
            if (resp?.data?.status === "success") {
              CustomAlert("success", resp?.data?.result || "Admission deleted successfully");
              loadAdmissions();
            } else {
              CustomAlert("warning", resp?.data?.error || "Unable to delete admission");
            }
          })
          .catch((err: any) => {
            console.log(err);
            CustomAlert("warning", "Unable to delete admission");
          });
      }
    });
  };

  const filteredItems = _tableItems?.filter((content: any) => {
    const lowerSearchInput = _search?.toLowerCase()?.trim();
    if (!lowerSearchInput) return true;
    return Object?.values(content || {})?.some((value: any) =>
      value?.toString()?.toLowerCase()?.includes(lowerSearchInput)
    );
  });

  return (
    <div className="container-fluid py-3">
      <div className="container">
        <div className="row justify-content-between align-items-center py-3">
          <div className="col-md-5 my-2">
            <div className="d-flex align-items-center gap-2 mobJustify">
              <span className="text-dark fw-bold">Admission </span>
              <span className="text-dark">
                <KeyboardArrowRightRounded />
              </span>
              <span className="text-muted">Admission List</span>
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
                  onClick={handleCreateAdmission}
                >
                  Add New Admission
                </Button>
              )}
              <CustomSearch getSearchText={(value: string) => _setSearch(value)} />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-lg-4 mb-2">
            <Tabs
              value={_activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              allowScrollButtonsMobile
            >
              <Tab value="pending" label="Pending / In Progress" />
              <Tab value="approved" label="Approved Admissions" />
            </Tabs>
          </div>
          <div className="col-lg-8 mb-2">
            <div className="row align-items-center">
              <div className="col-md-4 my-2 px-1">
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
              <div className="col-md-8 my-2 px-1">
                <DateRangeSelector
                  className="bg-white"
                  handleChangeDate={handleChangeDate}
                />
              </div>
            </div>
          </div>
        </div>

        <TableContainer className="tableBorder rounded">
          <Table sx={{ ...customTableTemplate }}>
            <TableHead>
              <TableRow sx={{ ...customTableHeader }}>
                <TableCell className="fw-bold">S.No</TableCell>
                <TableCell className="fw-bold">Candidate</TableCell>
                <TableCell className="fw-bold">Contact</TableCell>
                <TableCell className="fw-bold">Branch / Room / Cot</TableCell>
                <TableCell className="fw-bold">Admission Date</TableCell>
                <TableCell className="fw-bold">Status</TableCell>
                {_activeTab === "approved" && (
                  <TableCell className="fw-bold">Payment Status</TableCell>
                )}
                <TableCell className="fw-bold" align="center">
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems?.length > 0 ? (
                filteredItems?.map((item: AdmissionItem, index: number) => {
                  const candidateName =
                    item?.candidateName ||
                    (item as any)?.name ||
                    "";
                  const email = item?.emailId || item?.email || "";
                  const branchName = item?.branchName || "";
                  const roomNo = item?.roomNumber || item?.roomNo || "";
                  const cotNo = item?.cotNumber || item?.cotNo || "";
                  const status =
                    item?.admissionStatus ||
                    item?.status ||
                    (_activeTab === "approved" ? "Approved" : "Pending");

                  return (
                    <TableRow key={item?.admissionId || item?.id || index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <div className="fw-bold text-nowrap">
                          {candidateName || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="text-nowrap">
                        <div>{item?.mobileNumber || "-"}</div>
                        {email && (
                          <div className="fs12 text-muted">{email}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-nowrap">
                        <div className="fw-bold">
                          {branchName || "Branch -"}
                        </div>
                        <div className="fs12 text-muted">
                          Room {roomNo || "-"} / Cot {cotNo || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="text-nowrap">
                        {item?.dateOfAdmission || "-"}
                      </TableCell>
                      <TableCell className="text-nowrap">
                        <span className="fs12 statusBgActive text-success rounded--50 px-3 py-1">
                          {status}
                        </span>
                      </TableCell>
                      {_activeTab === "approved" && (
                        <TableCell className="text-nowrap">
                          {item?.paymentStatus || "-"}
                        </TableCell>
                      )}
                      <TableCell align="center">
                        <div className="d-flex align-items-center justify-content-center gap-3">
                          <div
                            className="d-flex align-items-center justify-content-center gap-1"
                            role="button"
                            onClick={() => handleManageAdmission(item)}
                          >
                            <span className="">Manage</span>
                            <img
                              height="16"
                              src={IMAGES_ICON.EditIcon}
                              alt="icon"
                              draggable="false"
                            />
                          </div>
                          {PageAccess !== "ReadOnly" && _activeTab !== "approved" && (
                            <div
                              className="d-flex align-items-center justify-content-center gap-1"
                              role="button"
                              onClick={() => handleDeleteAdmission(item)}
                            >
                              <span className="">Delete</span>
                              <img
                                height="16"
                                src={IMAGES_ICON.DeleteIcon}
                                alt="icon"
                                draggable="false"
                              />
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : !_tableLoading ? (
                <TableRow>
                  <TableCell className="fs-3 text-muted" align="center" colSpan={8}>
                    Data Not Found
                  </TableCell>
                </TableRow>
              ) : null}
              <SkeletonProviderTables
                columns={_activeTab === "approved" ? 8 : 7}
                visible={_tableLoading}
              />
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
}

