import { useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowRight } from "@mui/icons-material";
import Swal from "sweetalert2";
import { IMAGES_ICON } from "../../../assets/images/exportImages";
import { CustomAlert, customTableHeader, customTableTemplate, textFieldStyle } from "../../../services/HelperService";
import {
  getBranchRoomsList,
  insertUpdateBranchCots,
  insertUpdateBranchRooms,
  getMasterRoomType,
  getMasterSharingType,
  getMasterBathroomType,
  getMasterCotType,
} from "../../../models";

type Props = {
  branch: any;
  readOnly?: boolean;
};

export default function RoomsAndCots({ branch, readOnly }: Props) {
  const [_rooms, _setRooms] = useState<any[]>([]);
  const [_loading, _setLoading] = useState(false);
  const [_expandedRoomId, _setExpandedRoomId] = useState<number | null>(null);
  const [_editingRoom, _setEditingRoom] = useState<any | null>(null);
  const [_editingCots, _setEditingCots] = useState<any[]>([]);

  const [_roomTypes, _setRoomTypes] = useState<any[]>([]);
  const [_sharingTypes, _setSharingTypes] = useState<any[]>([]);
  const [_bathroomTypes, _setBathroomTypes] = useState<any[]>([]);
  const [_cotTypes, _setCotTypes] = useState<any[]>([]);

  const roomValidate = {
    roomNumber: { error: false, message: "" },
  };
  const [_roomValidate, _setRoomValidate] = useState(roomValidate);

  useEffect(() => {
    if (!branch?.id) return;
    loadMasters();
    loadRooms();
  }, [branch?.id]);

  const loadMasters = () => {
    getMasterRoomType()
      .then((resp: any) => {
        if (resp?.data?.status === "success") {
          _setRoomTypes(resp?.data?.result || []);
        }
      })
      .catch(console.log);

    getMasterSharingType()
      .then((resp: any) => {
        if (resp?.data?.status === "success") {
          _setSharingTypes(resp?.data?.result || []);
        }
      })
      .catch(console.log);

    getMasterBathroomType()
      .then((resp: any) => {
        if (resp?.data?.status === "success") {
          _setBathroomTypes(resp?.data?.result || []);
        }
      })
      .catch(console.log);

    getMasterCotType()
      .then((resp: any) => {
        if (resp?.data?.status === "success") {
          _setCotTypes(resp?.data?.result || []);
        }
      })
      .catch(console.log);
  };

  const loadRooms = () => {
    if (!branch?.id) return;
    _setLoading(true);
    getBranchRoomsList(branch.id, "admin")
      .then((resp: any) => {
        if (resp?.data?.status === "success") {
          _setRooms(resp?.data?.result || []);
        }
      })
      .catch((err: any) => {
        console.log(err);
        CustomAlert("warning", "Unable to load rooms");
      })
      .finally(() => _setLoading(false));
  };

  const openNewRoom = () => {
    if (readOnly) return;
    _setEditingRoom({
      id: 0,
      branchId: branch?.id,
      roomTypeId: "",
      sharingTypeId: "",
      bathroomTypeId: "",
      roomNumber: "",
      floorNumber: "",
      roomSize: "",
      numberOfCots: "",
      oneDayStay: false,
      admissionFee: "",
      advanceAmount: "",
      lateFeeAmount: "",
      isActive: true,
      notes: "",
    });
    _setRoomValidate(roomValidate);
  };

  const openEditRoom = (room: any) => {
    if (readOnly) return;
    _setEditingRoom({ ...room });
    _setRoomValidate(roomValidate);
  };

  const cancelEditRoom = () => {
    _setEditingRoom(null);
  };

  const changeRoomForm = (key: string, value: any) => {
    _setEditingRoom({ ..._editingRoom, [key]: value });
  };

  const checkRoomValidation = () => {
    let valid = true;
    const validation = { ...roomValidate };

    if (!_editingRoom?.roomNumber?.toString()?.trim()) {
      validation.roomNumber.error = true;
      validation.roomNumber.message = "Required Field";
      valid = false;
    }

    _setRoomValidate(validation);
    return valid;
  };

  const saveRoom = () => {
    if (readOnly || !_editingRoom) return;
    if (!checkRoomValidation()) return;

    _setLoading(true);
    const body = {
      id: _editingRoom?.id || 0,
      branchId: branch?.id,
      roomTypeId: _editingRoom?.roomTypeId || null,
      sharingTypeId: _editingRoom?.sharingTypeId || null,
      bathroomTypeId: _editingRoom?.bathroomTypeId || null,
      roomNumber: _editingRoom?.roomNumber,
      floorNumber: _editingRoom?.floorNumber || "",
      roomSize: _editingRoom?.roomSize || "",
      numberOfCots: _editingRoom?.numberOfCots || "",
      oneDayStay: _editingRoom?.oneDayStay || false,
      admissionFee: _editingRoom?.admissionFee || "",
      advanceAmount: _editingRoom?.advanceAmount || "",
      lateFeeAmount: _editingRoom?.lateFeeAmount || "",
      isActive: _editingRoom?.isActive ?? true,
      notes: _editingRoom?.notes || "",
    };

    insertUpdateBranchRooms(body)
      .then((resp: any) => {
        if (resp?.data?.status === "success") {
          CustomAlert("success", resp?.data?.result?.message || "Room saved successfully");
          cancelEditRoom();
          loadRooms();
        } else {
          CustomAlert("warning", resp?.data?.error || "Failed to save room");
        }
      })
      .catch((err: any) => {
        console.log(err);
        CustomAlert("warning", "Failed to save room");
      })
      .finally(() => _setLoading(false));
  };

  const openCotsForRoom = (room: any) => {
    const isExpanded = _expandedRoomId === room.id;
    _setExpandedRoomId(isExpanded ? null : room.id);
    if (!isExpanded) {
      const cots = room?.Cots || [];
      if (!cots?.length) {
        _setEditingCots([
          {
            id: 0,
            roomId: room.id,
            cotTypeId: "",
            cotNumber: "",
            rentAmount: "",
            advanceAmount: "",
            perDayRent: "",
            isActive: true,
          },
        ]);
      } else {
        _setEditingCots(cots.map((c: any) => ({ ...c })));
      }
    }
  };

  const addCotRow = () => {
    if (readOnly) return;
    _setEditingCots([
      ..._editingCots,
      {
        id: 0,
        roomId: _expandedRoomId,
        cotTypeId: "",
        cotNumber: "",
        rentAmount: "",
        advanceAmount: "",
        perDayRent: "",
        isActive: true,
      },
    ]);
  };

  const changeCotForm = (index: number, key: string, value: any) => {
    const list = [..._editingCots];
    list[index] = { ...list[index], [key]: value };
    _setEditingCots(list);
  };

  const toggleCotActive = (index: number) => {
    const list = [..._editingCots];
    list[index] = { ...list[index], isActive: !list[index].isActive };
    _setEditingCots(list);
  };

  const saveCots = () => {
    if (readOnly || !_expandedRoomId) return;
    if (!_editingCots?.length) {
      CustomAlert("warning", "Please add at least one cot");
      return;
    }

    const emptyCot = _editingCots.find(
      (c: any) => !c?.cotNumber?.toString()?.trim()
    );
    if (emptyCot) {
      CustomAlert("warning", "Cot number is required for all rows");
      return;
    }

    Swal.fire({
      title: "Confirm",
      text: "Do you want to save cots for this room?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#388024",
      cancelButtonColor: "#bf1029",
      confirmButtonText: "Yes, Save",
    }).then((result) => {
      if (!result.isConfirmed) return;

      _setLoading(true);
      const payload = {
        cots: _editingCots.map((cot: any) => ({
          id: cot?.id || 0,
          roomId: _expandedRoomId,
          cotTypeId: cot?.cotTypeId || null,
          cotNumber: cot?.cotNumber,
          rentAmount: cot?.rentAmount || "",
          advanceAmount: cot?.advanceAmount || "",
          perDayRent: cot?.perDayRent || "",
          cotPhotos: cot?.cotPhotos || "",
          isActive: cot?.isActive ?? true,
        })),
      };

      insertUpdateBranchCots(payload)
        .then((resp: any) => {
          if (resp?.data?.status === "success") {
            CustomAlert("success", "Cots saved successfully");
            loadRooms();
          } else {
            CustomAlert("warning", resp?.data?.error || "Failed to save cots");
          }
        })
        .catch((err: any) => {
          console.log(err);
          CustomAlert("warning", "Failed to save cots");
        })
        .finally(() => _setLoading(false));
    });
  };

  const getMasterText = (list: any[], id: any, key: string = "type") => {
    if (!id) return "";
    return list?.find((f: any) => f?.id === id)?.[key] || "";
  };

  return (
    <div className="bg-field-gray border rounded px-3 py-2">
      <div className="d-flex align-items-center justify-content-between borderBottomLight pb-2 mb-2">
        <div className="fw-bold">Rooms &amp; Cots</div>
        {!readOnly && (
          <Button
            className="text-capitalize"
            sx={{ color: "black" }}
            startIcon={<img height={18} draggable={false} src={IMAGES_ICON.TableNewItemIcon} />}
            onClick={openNewRoom}
            disabled={!branch?.id}
          >
            Add Room
          </Button>
        )}
      </div>

      <div className="mb-2 fs12 text-muted">
        Manage rooms and their cots for the selected branch.
      </div>

      {branch?.id ? (
        <>
          {_editingRoom && (
            <div className="bg-white border rounded p-2 mb-3">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="fw-bold fs14">
                  {_editingRoom?.id ? "Edit Room" : "New Room"}
                </div>
                <div className="d-flex gap-2">
                  <Button
                    size="small"
                    variant="outlined"
                    className="text-capitalize bg-white"
                    onClick={cancelEditRoom}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    className="text-capitalize"
                    disabled={_loading}
                    onClick={saveRoom}
                  >
                    Save Room
                  </Button>
                </div>
              </div>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <div className="text-muted fs12 mb-1">Room Number</div>
                  <TextField
                    fullWidth
                    sx={{ ...textFieldStyle }}
                    value={_editingRoom?.roomNumber || ""}
                    onChange={(e: any) => changeRoomForm("roomNumber", e.target.value)}
                    error={_roomValidate?.roomNumber?.error}
                    helperText={_roomValidate?.roomNumber?.message}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <div className="text-muted fs12 mb-1">Floor</div>
                  <TextField
                    fullWidth
                    sx={{ ...textFieldStyle }}
                    value={_editingRoom?.floorNumber || ""}
                    onChange={(e: any) => changeRoomForm("floorNumber", e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <div className="text-muted fs12 mb-1">Room Size</div>
                  <TextField
                    fullWidth
                    sx={{ ...textFieldStyle }}
                    value={_editingRoom?.roomSize || ""}
                    onChange={(e: any) => changeRoomForm("roomSize", e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <div className="text-muted fs12 mb-1">Room Type</div>
                  <TextField
                    fullWidth
                    select
                    SelectProps={{ native: true }}
                    sx={{ ...textFieldStyle }}
                    value={_editingRoom?.roomTypeId || ""}
                    onChange={(e: any) => changeRoomForm("roomTypeId", Number(e.target.value) || "")}
                  >
                    <option value="">Select</option>
                    {_roomTypes?.map((item: any) => (
                      <option key={item?.id} value={item?.id}>
                        {item?.type}
                      </option>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <div className="text-muted fs12 mb-1">Sharing Type</div>
                  <TextField
                    fullWidth
                    select
                    SelectProps={{ native: true }}
                    sx={{ ...textFieldStyle }}
                    value={_editingRoom?.sharingTypeId || ""}
                    onChange={(e: any) => changeRoomForm("sharingTypeId", Number(e.target.value) || "")}
                  >
                    <option value="">Select</option>
                    {_sharingTypes?.map((item: any) => (
                      <option key={item?.id} value={item?.id}>
                        {item?.type}
                      </option>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <div className="text-muted fs12 mb-1">Bathroom Type</div>
                  <TextField
                    fullWidth
                    select
                    SelectProps={{ native: true }}
                    sx={{ ...textFieldStyle }}
                    value={_editingRoom?.bathroomTypeId || ""}
                    onChange={(e: any) => changeRoomForm("bathroomTypeId", Number(e.target.value) || "")}
                  >
                    <option value="">Select</option>
                    {_bathroomTypes?.map((item: any) => (
                      <option key={item?.id} value={item?.id}>
                        {item?.type}
                      </option>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <div className="text-muted fs12 mb-1">Number of Cots</div>
                  <TextField
                    fullWidth
                    type="number"
                    sx={{ ...textFieldStyle }}
                    value={_editingRoom?.numberOfCots || ""}
                    onChange={(e: any) => changeRoomForm("numberOfCots", e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <div className="text-muted fs12 mb-1">Admission Fee</div>
                  <TextField
                    fullWidth
                    type="number"
                    sx={{ ...textFieldStyle }}
                    value={_editingRoom?.admissionFee || ""}
                    onChange={(e: any) => changeRoomForm("admissionFee", e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <div className="text-muted fs12 mb-1">Advance Amount</div>
                  <TextField
                    fullWidth
                    type="number"
                    sx={{ ...textFieldStyle }}
                    value={_editingRoom?.advanceAmount || ""}
                    onChange={(e: any) => changeRoomForm("advanceAmount", e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <div className="text-muted fs12 mb-1">Late Fee Amount</div>
                  <TextField
                    fullWidth
                    type="number"
                    sx={{ ...textFieldStyle }}
                    value={_editingRoom?.lateFeeAmount || ""}
                    onChange={(e: any) => changeRoomForm("lateFeeAmount", e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControlLabel
                    label="One Day Stay"
                    control={
                      <Checkbox
                        checked={_editingRoom?.oneDayStay || false}
                        onChange={() => changeRoomForm("oneDayStay", !_editingRoom?.oneDayStay)}
                      />
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControlLabel
                    label="Active"
                    control={
                      <Checkbox
                        checked={_editingRoom?.isActive ?? true}
                        onChange={() => changeRoomForm("isActive", !_editingRoom?.isActive)}
                      />
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <div className="text-muted fs12 mb-1">Notes</div>
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    sx={{ ...textFieldStyle }}
                    value={_editingRoom?.notes || ""}
                    onChange={(e: any) => changeRoomForm("notes", e.target.value)}
                  />
                </Grid>
              </Grid>
            </div>
          )}

          <TableContainer className="tableBorder rounded">
            <Table size="small" sx={{ ...customTableTemplate }}>
              <TableHead>
                <TableRow sx={{ ...customTableHeader }}>
                  <TableCell />
                  <TableCell className="fw-bold">Room</TableCell>
                  <TableCell className="fw-bold">Type</TableCell>
                  <TableCell className="fw-bold">Sharing</TableCell>
                  <TableCell className="fw-bold" align="center">
                    Cots
                  </TableCell>
                  <TableCell className="fw-bold" align="center">
                    Status
                  </TableCell>
                  <TableCell className="fw-bold" align="center">
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {_rooms?.length ? (
                  _rooms?.map((room: any) => {
                    const expanded = _expandedRoomId === room.id;
                    const totalCots = room?.Cots?.length || 0;
                    const vacantCount =
                      room?.Cots?.filter((c: any) => c?.cotStatus === "Vacant")?.length || 0;
                    return (
                      <>
                        <TableRow key={room.id}>
                          <TableCell width={40}>
                            <IconButton size="small" onClick={() => openCotsForRoom(room)}>
                              {expanded ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
                            </IconButton>
                          </TableCell>
                          <TableCell>
                            <div className="fw-bold">{room?.roomNumber}</div>
                            <div className="fs12 text-muted">
                              Floor: {room?.floorNumber || "-"} | Size:{" "}
                              {room?.roomSize || "-"}
                            </div>
                          </TableCell>
                          <TableCell>{room?.roomTypeName || getMasterText(_roomTypes, room?.roomTypeId)}</TableCell>
                          <TableCell>{room?.sharingTypeName || getMasterText(_sharingTypes, room?.sharingTypeId)}</TableCell>
                          <TableCell align="center">{totalCots}</TableCell>
                          <TableCell align="center">
                            {vacantCount ? (
                              <span className="fs12 statusBgActive text-success rounded--50 px-3 py-1">
                                {vacantCount} Vacant
                              </span>
                            ) : (
                              <span className="fs12 statusBgInactive text-muted rounded--50 px-3 py-1">
                                No Vacant
                              </span>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <div className="d-flex align-items-center justify-content-center gap-2">
                              {!readOnly && (
                                <div
                                  className="d-flex align-items-center justify-content-center gap-1"
                                  role="button"
                                  onClick={() => openEditRoom(room)}
                                >
                                  <span className="">Edit</span>
                                  <img
                                    height="16"
                                    src={IMAGES_ICON.EditIcon}
                                    alt="icon"
                                    draggable="false"
                                  />
                                </div>
                              )}
                              <div
                                className="d-flex align-items-center justify-content-center gap-1"
                                role="button"
                                onClick={() => openCotsForRoom(room)}
                              >
                                <span className="">Cots</span>
                                <img
                                  height="16"
                                  src={IMAGES_ICON.TableViewIcon}
                                  alt="icon"
                                  draggable="false"
                                />
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                        {expanded && (
                          <TableRow>
                            <TableCell colSpan={7} className="bg-field-gray">
                              <div className="d-flex align-items-center justify-content-between mb-2">
                                <div className="fw-bold fs14">Cots in Room {room?.roomNumber}</div>
                                {!readOnly && (
                                  <Button
                                    size="small"
                                    className="text-capitalize"
                                    sx={{ color: "black" }}
                                    startIcon={
                                      <img
                                        height={16}
                                        draggable={false}
                                        src={IMAGES_ICON.TableNewItemIcon}
                                      />
                                    }
                                    onClick={addCotRow}
                                  >
                                    Add Cot
                                  </Button>
                                )}
                              </div>
                              <TableContainer className="tableBorder rounded bg-white">
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell className="fw-bold">Cot No</TableCell>
                                      <TableCell className="fw-bold">Type</TableCell>
                                      <TableCell className="fw-bold">Rent</TableCell>
                                      <TableCell className="fw-bold">Advance</TableCell>
                                      <TableCell className="fw-bold">Per Day</TableCell>
                                      <TableCell className="fw-bold" align="center">
                                        Status
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {_editingCots?.length ? (
                                      _editingCots?.map((cot: any, cIndex: number) => (
                                        <TableRow key={cIndex}>
                                          <TableCell>
                                            <TextField
                                              fullWidth
                                              size="small"
                                              sx={{ ...textFieldStyle }}
                                              value={cot?.cotNumber || ""}
                                              onChange={(e: any) =>
                                                changeCotForm(cIndex, "cotNumber", e.target.value)
                                              }
                                              disabled={readOnly}
                                            />
                                          </TableCell>
                                          <TableCell>
                                            <TextField
                                              fullWidth
                                              size="small"
                                              select
                                              SelectProps={{ native: true }}
                                              sx={{ ...textFieldStyle }}
                                              value={cot?.cotTypeId || ""}
                                              onChange={(e: any) =>
                                                changeCotForm(
                                                  cIndex,
                                                  "cotTypeId",
                                                  Number(e.target.value) || ""
                                                )
                                              }
                                              disabled={readOnly}
                                            >
                                              <option value="">Select</option>
                                              {_cotTypes?.map((item: any) => (
                                                <option key={item?.id} value={item?.id}>
                                                  {item?.type}
                                                </option>
                                              ))}
                                            </TextField>
                                          </TableCell>
                                          <TableCell>
                                            <TextField
                                              fullWidth
                                              size="small"
                                              type="number"
                                              sx={{ ...textFieldStyle }}
                                              value={cot?.rentAmount || ""}
                                              onChange={(e: any) =>
                                                changeCotForm(cIndex, "rentAmount", e.target.value)
                                              }
                                              disabled={readOnly}
                                            />
                                          </TableCell>
                                          <TableCell>
                                            <TextField
                                              fullWidth
                                              size="small"
                                              type="number"
                                              sx={{ ...textFieldStyle }}
                                              value={cot?.advanceAmount || ""}
                                              onChange={(e: any) =>
                                                changeCotForm(
                                                  cIndex,
                                                  "advanceAmount",
                                                  e.target.value
                                                )
                                              }
                                              disabled={readOnly}
                                            />
                                          </TableCell>
                                          <TableCell>
                                            <TextField
                                              fullWidth
                                              size="small"
                                              type="number"
                                              sx={{ ...textFieldStyle }}
                                              value={cot?.perDayRent || ""}
                                              onChange={(e: any) =>
                                                changeCotForm(
                                                  cIndex,
                                                  "perDayRent",
                                                  e.target.value
                                                )
                                              }
                                              disabled={readOnly}
                                            />
                                          </TableCell>
                                          <TableCell align="center">
                                            <FormControlLabel
                                              label="Active"
                                              control={
                                                <Checkbox
                                                  checked={cot?.isActive ?? true}
                                                  onChange={() => toggleCotActive(cIndex)}
                                                  disabled={readOnly}
                                                />
                                              }
                                            />
                                          </TableCell>
                                        </TableRow>
                                      ))
                                    ) : (
                                      <TableRow>
                                        <TableCell
                                          align="center"
                                          colSpan={6}
                                          className="text-muted fs12"
                                        >
                                          No cots found
                                        </TableCell>
                                      </TableRow>
                                    )}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                              {!readOnly && (
                                <div className="d-flex justify-content-end mt-2">
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="primary"
                                    className="text-capitalize"
                                    disabled={_loading}
                                    onClick={saveCots}
                                  >
                                    Save Cots
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell align="center" colSpan={7}>
                      {branch?.id ? (
                        <span className="text-muted">No rooms found for this branch</span>
                      ) : (
                        <span className="text-muted">Select a branch to view rooms</span>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : (
        <div className="text-muted text-center py-4">
          Please create or select a branch first.
        </div>
      )}
    </div>
  );
}

