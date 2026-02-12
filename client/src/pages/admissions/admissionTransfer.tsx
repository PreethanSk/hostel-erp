import { useState } from "react";
import { Button, MenuItem, TextField } from "@mui/material";
import { KeyboardArrowRightRounded } from "@mui/icons-material";
import CustomSearch from "../../components/helpers/CustomSearch";
import CustomSelect from "../../components/helpers/CustomSelect";
import { CustomAlert, textFieldStyle } from "../../services/HelperService";
import {
  getBranchGridList,
  getBranchRoomsList,
  getBranchCotsList,
  getCandidateDetailSearch,
  getCandidateAdmissionById,
  insertUpdateCandidateAdmission,
} from "../../models";

type Props = {
  PageAccess: string;
};

export default function AdmissionTransfer({ PageAccess }: Props) {
  const [_search, _setSearch] = useState("");
  const [_candidateList, _setCandidateList] = useState<any[]>([]);
  const [_selectedCandidate, _setSelectedCandidate] = useState<any | null>(null);
  const [_admission, _setAdmission] = useState<any | null>(null);

  const [_branchList, _setBranchList] = useState<any[]>([]);
  const [_roomList, _setRoomList] = useState<any[]>([]);
  const [_cotList, _setCotList] = useState<any[]>([]);

  const [_loading, _setLoading] = useState(false);

  const readOnly = PageAccess === "ReadOnly";

  const handleSearch = (value: string) => {
    _setSearch(value);
    if (value?.trim().length < 3) {
      _setCandidateList([]);
      return;
    }
    getCandidateDetailSearch(value)
      .then((resp: any) => {
        if (resp?.data?.status === "success") {
          _setCandidateList(resp?.data?.result || []);
        }
      })
      .catch(console.log);
  };

  const loadBranches = () => {
    if (_branchList?.length) return;
    getBranchGridList(1, 0)
      .then((resp: any) => {
        if (resp?.data?.status === "success") {
          _setBranchList(resp?.data?.result?.results || []);
        }
      })
      .catch(console.log);
  };

  const handleSelectCandidate = async (item: any) => {
    try {
      _setSelectedCandidate(item);
      loadBranches();
      _setAdmission(null);
      const resp = await getCandidateAdmissionById({
        candidateId: item?.id,
      });
      if (resp?.data?.status === "success") {
        const result = resp?.data?.result || {};
        _setAdmission({
          id: result?.id,
          candidateRefId: result?.candidateRefId || item?.id,
          branchRefId: result?.branchRefId,
          roomRefId: result?.roomRefId,
          cotRefId: result?.cotRefId,
          dateOfAdmission: result?.dateOfAdmission,
          admissionStatus: result?.admissionStatus,
        });
        if (result?.branchRefId) {
          getBranchRoomsList(result.branchRefId, "")
            .then((r: any) => {
              if (r?.data?.status === "success") {
                _setRoomList(r?.data?.result || []);
              }
            })
            .catch(console.log);
          getBranchCotsList(result.branchRefId)
            .then((r: any) => {
              if (r?.data?.status === "success") {
                _setCotList(r?.data?.result || []);
              }
            })
            .catch(console.log);
        }
      } else {
        _setAdmission(null);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleChangeBranch = (value: any) => {
    if (!_admission) return;
    const branchRefId = value || "";
    _setAdmission({ ..._admission, branchRefId, roomRefId: "", cotRefId: "" });
    if (!branchRefId) {
      _setRoomList([]);
      _setCotList([]);
      return;
    }
    getBranchRoomsList(branchRefId, "")
      .then((resp: any) => {
        if (resp?.data?.status === "success") {
          _setRoomList(resp?.data?.result || []);
        }
      })
      .catch(console.log);
    getBranchCotsList(branchRefId)
      .then((resp: any) => {
        if (resp?.data?.status === "success") {
          _setCotList(resp?.data?.result || []);
        }
      })
      .catch(console.log);
  };

  const handleChangeRoom = (value: any) => {
    if (!_admission) return;
    const roomRefId = value || "";
    _setAdmission({ ..._admission, roomRefId, cotRefId: "" });
  };

  const handleChangeCot = (value: any) => {
    if (!_admission) return;
    const cotRefId = value || "";
    _setAdmission({ ..._admission, cotRefId });
  };

  const handleTransfer = async () => {
    if (readOnly || !_admission || !_selectedCandidate) return;

    if (!_admission?.branchRefId || !_admission?.roomRefId || !_admission?.cotRefId) {
      CustomAlert("warning", "Please select branch, room and cot");
      return;
    }

    try {
      _setLoading(true);
      const body = {
        ..._admission,
        admissionStatus: _admission?.admissionStatus || "Inprogress",
      };
      const resp = await insertUpdateCandidateAdmission(body);
      if (resp?.data?.status === "success") {
        CustomAlert("success", "Admission transferred successfully");
      } else {
        CustomAlert("warning", resp?.data?.error || "Unable to transfer admission");
      }
    } catch (err) {
      console.log(err);
      CustomAlert("warning", "Unable to transfer admission");
    } finally {
      _setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-3">
      <div className="container">
        <div className="row justify-content-between align-items-center py-3">
          <div className="col-md-6 my-2">
            <div className="d-flex align-items-center gap-2 mobJustify">
              <span className="text-dark fw-bold">Admission </span>
              <span className="text-dark">
                <KeyboardArrowRightRounded />
              </span>
              <span className="text-muted">Admission Transfer</span>
            </div>
          </div>
        </div>

        <div className="bg-field-gray border rounded px-3 py-3">
          <div className="row mb-3">
            <div className="col-md-6 my-2">
              <div className="text-muted fs14 mb-1">Search Candidate</div>
              <CustomSearch getSearchText={handleSearch} />
              <div className="mt-2">
                {_candidateList?.length > 0 &&
                  _candidateList?.map((item: any) => (
                    <div
                      key={item?.id}
                      className="d-flex justify-content-between align-items-center py-1 borderBottomLight"
                      role="button"
                      onClick={() => handleSelectCandidate(item)}
                    >
                      <div>
                        <div className="fw-bold">{item?.name}</div>
                        <div className="fs12 text-muted">
                          {item?.mobileNumber} {item?.email ? `/ ${item?.email}` : ""}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="col-md-6 my-2">
              {_selectedCandidate ? (
                <div className="bg-white border rounded p-3 h-100">
                  <div className="fw-bold mb-1">{_selectedCandidate?.name}</div>
                  <div className="fs12 text-muted mb-2">
                    {_selectedCandidate?.mobileNumber}{" "}
                    {_selectedCandidate?.email ? `/ ${_selectedCandidate?.email}` : ""}
                  </div>

                  {_admission ? (
                    <div className="row">
                      <div className="col-12 my-1">
                        <div className="text-muted fs14 mb-1">Branch</div>
                        <CustomSelect
                          className="bg-white"
                          padding={"0px 10px"}
                          value={_admission?.branchRefId || ""}
                          disabled={readOnly}
                          onChange={(e: any) => handleChangeBranch(e?.target?.value || "")}
                          placeholder={"Select Branch"}
                          menuItem={[
                            <MenuItem key="select" value="">
                              Select Branch
                            </MenuItem>,
                            ..._branchList?.map((item: any) => (
                              <MenuItem key={item?.id} value={item?.id}>
                                {item?.branchName}
                              </MenuItem>
                            )),
                          ]}
                        />
                      </div>
                      <div className="col-12 my-1">
                        <div className="text-muted fs14 mb-1">Room</div>
                        <CustomSelect
                          className="bg-white"
                          padding={"0px 10px"}
                          value={_admission?.roomRefId || ""}
                          disabled={readOnly || !_admission?.branchRefId}
                          onChange={(e: any) => handleChangeRoom(e?.target?.value || "")}
                          placeholder={"Select Room"}
                          menuItem={[
                            <MenuItem key="select" value="">
                              Select Room
                            </MenuItem>,
                            ..._roomList?.map((item: any) => (
                              <MenuItem key={item?.id} value={item?.id}>
                                {item?.roomNumber}
                              </MenuItem>
                            )),
                          ]}
                        />
                      </div>
                      <div className="col-12 my-1">
                        <div className="text-muted fs14 mb-1">Cot</div>
                        <CustomSelect
                          className="bg-white"
                          padding={"0px 10px"}
                          value={_admission?.cotRefId || ""}
                          disabled={readOnly || !_admission?.roomRefId}
                          onChange={(e: any) => handleChangeCot(e?.target?.value || "")}
                          placeholder={"Select Cot"}
                          menuItem={[
                            <MenuItem key="select" value="">
                              Select Cot
                            </MenuItem>,
                            ..._cotList?.map((item: any) => (
                              <MenuItem key={item?.id} value={item?.id}>
                                {item?.cotNumber}
                              </MenuItem>
                            )),
                          ]}
                        />
                      </div>
                      <div className="col-12 my-1">
                        <div className="text-muted fs14 mb-1">Admission Date</div>
                        <TextField
                          fullWidth
                          type="date"
                          sx={{ ...textFieldStyle }}
                          value={_admission?.dateOfAdmission || ""}
                          InputProps={{ readOnly: true }}
                          InputLabelProps={{ shrink: true }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted fs14">
                      No active admission found for this candidate.
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-100 d-flex align-items-center justify-content-center text-muted">
                  Select a candidate to transfer admission.
                </div>
              )}
            </div>
          </div>

          <div className="d-flex justify-content-end">
            <Button
              variant="contained"
              color="primary"
              className="text-capitalize"
              disabled={readOnly || !_admission || _loading}
              onClick={handleTransfer}
            >
              Transfer Admission
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

