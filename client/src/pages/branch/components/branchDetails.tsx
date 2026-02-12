import { useEffect, useState } from "react";
import { Button, Checkbox, FormControlLabel, Grid, TextField } from "@mui/material";
import { IMAGES_ICON } from "../../../assets/images/exportImages";
import { CustomAlert, textFieldStyle } from "../../../services/HelperService";
import { getBranchDetailById, insertUpdateBranchDetails } from "../../../models";

type Props = {
  branch: any;
  onSaved?: (branch: any | null) => void;
  readOnly?: boolean;
};

export default function BranchDetails({ branch, onSaved, readOnly }: Props) {
  const [_formData, _setFormData] = useState<any>({ ...branch });
  const [_loading, _setLoading] = useState(false);

  const validate = {
    branchName: { error: false, message: "" },
    mobileNumber: { error: false, message: "" },
  };
  const [_validate, _setValidate] = useState(validate);

  useEffect(() => {
    _setFormData({ ...branch });
    _setValidate({ ...validate });
  }, [branch?.id]);

  const changeFormData = (key: string, value: any) => {
    _setFormData({ ..._formData, [key]: value });
  };

  const checkValidation = () => {
    let valid = true;
    const validation = { ...validate };

    if (!_formData?.branchName?.trim()) {
      validation.branchName.error = true;
      validation.branchName.message = "Required Field";
      valid = false;
    }

    if (!_formData?.mobileNumber?.toString()?.trim()) {
      validation.mobileNumber.error = true;
      validation.mobileNumber.message = "Required Field";
      valid = false;
    }

    _setValidate(validation);
    return valid;
  };

  const handleSave = () => {
    if (readOnly) return;
    _setLoading(true);
    if (!checkValidation()) {
      _setLoading(false);
      return;
    }

    const body = {
      id: _formData?.id || 0,
      branchName: _formData?.branchName,
      contactPerson: _formData?.contactPerson || "",
      branchAddress: _formData?.branchAddress || "",
      numberOfRooms: _formData?.numberOfRooms || 0,
      numberOfCots: _formData?.numberOfCots || 0,
      isActive: _formData?.isActive ?? true,
      mobileNumber: _formData?.mobileNumber,
      city: _formData?.city || "",
      pincode: _formData?.pincode || "",
      state: _formData?.state || "",
      country: _formData?.country || "",
      notes: _formData?.notes || "",
    };

    insertUpdateBranchDetails(body)
      .then((resp: any) => {
        if (resp?.data?.status === "success") {
          const branchId = resp?.data?.result?.branchId;
          CustomAlert("success", resp?.data?.result?.message || "Saved successfully");
          if (branchId) {
            getBranchDetailById(branchId)
              .then((bResp: any) => {
                if (bResp?.data?.status === "success") {
                  const updated = bResp?.data?.result;
                  _setFormData(updated);
                  onSaved && onSaved(updated);
                } else {
                  onSaved && onSaved(null);
                }
              })
              .catch((err: any) => {
                console.log(err);
                onSaved && onSaved(null);
              })
              .finally(() => _setLoading(false));
          } else {
            onSaved && onSaved(null);
            _setLoading(false);
          }
        } else {
          CustomAlert("warning", resp?.data?.error || "Failed to save branch");
          _setLoading(false);
        }
      })
      .catch((err: any) => {
        console.log(err);
        CustomAlert("warning", "Failed to save branch");
        _setLoading(false);
      });
  };

  return (
    <div className="bg-field-gray border rounded px-3 py-2">
      <div className="d-flex align-items-center justify-content-between borderBottomLight pb-2 mb-2">
        <div className="fw-bold">Branch Details</div>
        {_formData?.id ? (
          <div className="fs12 text-muted d-flex align-items-center gap-2">
            <img height={16} src={IMAGES_ICON.BranchIcon} alt="icon" draggable={false} />
            <span>{_formData?.branchName}</span>
          </div>
        ) : (
          <div className="fs12 text-muted">New Branch</div>
        )}
      </div>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <div className="text-muted fs14 mb-1">Branch Name</div>
          <TextField
            fullWidth
            sx={{ ...textFieldStyle }}
            value={_formData?.branchName || ""}
            onChange={(e: any) => changeFormData("branchName", e.target.value)}
            error={_validate?.branchName?.error}
            helperText={_validate?.branchName?.message}
            disabled={readOnly}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <div className="text-muted fs14 mb-1">Branch Code</div>
          <TextField
            fullWidth
            sx={{ ...textFieldStyle }}
            value={_formData?.branchCode || ""}
            onChange={(e: any) => changeFormData("branchCode", e.target.value)}
            disabled={readOnly}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <div className="text-muted fs14 mb-1">Contact Person</div>
          <TextField
            fullWidth
            sx={{ ...textFieldStyle }}
            value={_formData?.contactPerson || ""}
            onChange={(e: any) => changeFormData("contactPerson", e.target.value)}
            disabled={readOnly}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <div className="text-muted fs14 mb-1">Mobile Number</div>
          <TextField
            fullWidth
            sx={{ ...textFieldStyle }}
            value={_formData?.mobileNumber || ""}
            onChange={(e: any) => changeFormData("mobileNumber", e.target.value)}
            error={_validate?.mobileNumber?.error}
            helperText={_validate?.mobileNumber?.message}
            disabled={readOnly}
          />
        </Grid>

        <Grid item xs={12}>
          <div className="text-muted fs14 mb-1">Branch Address</div>
          <TextField
            fullWidth
            multiline
            minRows={2}
            sx={{ ...textFieldStyle }}
            value={_formData?.branchAddress || ""}
            onChange={(e: any) => changeFormData("branchAddress", e.target.value)}
            disabled={readOnly}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <div className="text-muted fs14 mb-1">City</div>
          <TextField
            fullWidth
            sx={{ ...textFieldStyle }}
            value={_formData?.city || ""}
            onChange={(e: any) => changeFormData("city", e.target.value)}
            disabled={readOnly}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <div className="text-muted fs14 mb-1">Pincode</div>
          <TextField
            fullWidth
            sx={{ ...textFieldStyle }}
            value={_formData?.pincode || ""}
            onChange={(e: any) => changeFormData("pincode", e.target.value)}
            disabled={readOnly}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <div className="text-muted fs14 mb-1">State</div>
          <TextField
            fullWidth
            sx={{ ...textFieldStyle }}
            value={_formData?.state || ""}
            onChange={(e: any) => changeFormData("state", e.target.value)}
            disabled={readOnly}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <div className="text-muted fs14 mb-1">Country</div>
          <TextField
            fullWidth
            sx={{ ...textFieldStyle }}
            value={_formData?.country || ""}
            onChange={(e: any) => changeFormData("country", e.target.value)}
            disabled={readOnly}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <div className="text-muted fs14 mb-1">Number of Rooms</div>
          <TextField
            fullWidth
            type="number"
            sx={{ ...textFieldStyle }}
            value={_formData?.numberOfRooms || ""}
            onChange={(e: any) => changeFormData("numberOfRooms", e.target.value)}
            disabled={readOnly}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <div className="text-muted fs14 mb-1">Number of Cots</div>
          <TextField
            fullWidth
            type="number"
            sx={{ ...textFieldStyle }}
            value={_formData?.numberOfCots || ""}
            onChange={(e: any) => changeFormData("numberOfCots", e.target.value)}
            disabled={readOnly}
          />
        </Grid>

        <Grid item xs={12}>
          <div className="text-muted fs14 mb-1">Notes</div>
          <TextField
            fullWidth
            multiline
            minRows={2}
            sx={{ ...textFieldStyle }}
            value={_formData?.notes || ""}
            onChange={(e: any) => changeFormData("notes", e.target.value)}
            disabled={readOnly}
          />
        </Grid>

        <Grid item xs={12}>
          <div className="d-flex align-items-center justify-content-between mt-2">
            <FormControlLabel
              label="Active"
              control={
                <Checkbox
                  className="text-capitalize"
                  checked={_formData?.isActive ?? true}
                  onChange={() => changeFormData("isActive", !_formData?.isActive)}
                  disabled={readOnly}
                />
              }
            />
            {!readOnly && (
              <Button
                variant="contained"
                color="primary"
                className="text-capitalize"
                disabled={_loading}
                onClick={handleSave}
              >
                Save
              </Button>
            )}
          </div>
        </Grid>
      </Grid>
    </div>
  );
}

