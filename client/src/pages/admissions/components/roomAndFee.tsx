import { useEffect, useState } from "react";
import { MenuItem, TextField } from "@mui/material";
import CustomSelect from "../../../components/helpers/CustomSelect";
import { textFieldStyle } from "../../../services/HelperService";
import { getBranchGridList, getBranchRoomsList, getBranchCotsList, getAdmissionBookingAvailability } from "../../../models";

type Props = {
  formData: any;
  onChange: (key: string, value: any) => void;
  readOnly?: boolean;
};

export default function RoomAndFee({ formData, onChange, readOnly }: Props) {
  const [_branchList, _setBranchList] = useState<any[]>([]);
  const [_roomList, _setRoomList] = useState<any[]>([]);
  const [_cotList, _setCotList] = useState<any[]>([]);

  const branchId = formData?.branchRefId || "";
  const roomId = formData?.roomRefId || "";
  const cotId = formData?.cotRefId || "";

  useEffect(() => {
    getBranchGridList(1, 0)
      .then((resp: any) => {
        if (resp?.data?.status === "success") {
          _setBranchList(resp?.data?.result?.results || []);
        }
      })
      .catch(console.log);
  }, []);

  useEffect(() => {
    if (!branchId) {
      _setRoomList([]);
      return;
    }
    getBranchRoomsList(branchId, "")
      .then((resp: any) => {
        if (resp?.data?.status === "success") {
          _setRoomList(resp?.data?.result || []);
        }
      })
      .catch(console.log);
  }, [branchId]);

  useEffect(() => {
    if (!branchId || !roomId) {
      _setCotList([]);
      return;
    }
    getBranchCotsList(branchId)
      .then((resp: any) => {
        if (resp?.data?.status === "success") {
          const list = (resp?.data?.result || []).filter((c: any) => c?.roomRefId === Number(roomId));
          _setCotList(list);
        }
      })
      .catch(console.log);
  }, [branchId, roomId]);

  const handleChangeBranch = (value: any) => {
    onChange("branchRefId", value);
    onChange("roomRefId", "");
    onChange("cotRefId", "");
  };

  const handleChangeRoom = (value: any) => {
    onChange("roomRefId", value);
    onChange("cotRefId", "");
  };

  const handleChangeCot = (value: any) => {
    onChange("cotRefId", value);
    if (formData?.dateOfAdmission && value && branchId && roomId) {
      getAdmissionBookingAvailability({
        branchId,
        roomId,
        cotId: value,
        dateOfAdmission: formData?.dateOfAdmission,
      })
        .then((resp: any) => {
          if (resp?.data?.status !== "success") {
            // Reset cot if not available
            onChange("cotRefId", "");
          }
        })
        .catch(console.log);
    }
  };

  return (
    <div className="row">
      <div className="col-md-4 my-2">
        <div className="text-muted fs14 mb-1">Branch</div>
        <CustomSelect
          className="bg-white"
          padding={"0px 10px"}
          value={branchId}
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

      <div className="col-md-4 my-2">
        <div className="text-muted fs14 mb-1">Room</div>
        <CustomSelect
          className="bg-white"
          padding={"0px 10px"}
          value={roomId}
          disabled={readOnly || !branchId}
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

      <div className="col-md-4 my-2">
        <div className="text-muted fs14 mb-1">Cot</div>
        <CustomSelect
          className="bg-white"
          padding={"0px 10px"}
          value={cotId}
          disabled={readOnly || !roomId}
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

      <div className="col-md-4 my-2">
        <div className="text-muted fs14 mb-1">Date of Admission</div>
        <TextField
          fullWidth
          type="date"
          sx={{ ...textFieldStyle }}
          value={formData?.dateOfAdmission || ""}
          onChange={(e) => onChange("dateOfAdmission", e.target.value)}
          InputLabelProps={{ shrink: true }}
          InputProps={{ readOnly }}
        />
      </div>
      <div className="col-md-4 my-2">
        <div className="text-muted fs14 mb-1">Admission Fee</div>
        <TextField
          fullWidth
          sx={{ ...textFieldStyle }}
          value={formData?.admissionFee || ""}
          onChange={(e) => onChange("admissionFee", e.target.value)}
          InputProps={{ readOnly }}
        />
      </div>
      <div className="col-md-4 my-2">
        <div className="text-muted fs14 mb-1">Advance Paid</div>
        <TextField
          fullWidth
          sx={{ ...textFieldStyle }}
          value={formData?.advancePaid || ""}
          onChange={(e) => onChange("advancePaid", e.target.value)}
          InputProps={{ readOnly }}
        />
      </div>
      <div className="col-md-4 my-2">
        <div className="text-muted fs14 mb-1">Monthly Rent</div>
        <TextField
          fullWidth
          sx={{ ...textFieldStyle }}
          value={formData?.monthlyRent || ""}
          onChange={(e) => onChange("monthlyRent", e.target.value)}
          InputProps={{ readOnly }}
        />
      </div>
      <div className="col-md-4 my-2">
        <div className="text-muted fs14 mb-1">Late Fee Amount</div>
        <TextField
          fullWidth
          sx={{ ...textFieldStyle }}
          value={formData?.lateFeeAmount || ""}
          onChange={(e) => onChange("lateFeeAmount", e.target.value)}
          InputProps={{ readOnly }}
        />
      </div>
    </div>
  );
}

