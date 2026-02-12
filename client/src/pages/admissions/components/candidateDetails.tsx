import { TextField, MenuItem } from "@mui/material";
import { textFieldStyle } from "../../../services/HelperService";

type Props = {
  formData: any;
  onChange: (key: string, value: any) => void;
  readOnly?: boolean;
};

export default function CandidateDetails({ formData, onChange, readOnly }: Props) {
  return (
    <div className="row">
      <div className="col-md-4 my-2">
        <div className="text-muted fs14 mb-1">Name</div>
        <TextField
          fullWidth
          sx={{ ...textFieldStyle }}
          value={formData?.name || ""}
          onChange={(e) => onChange("name", e.target.value)}
          InputProps={{ readOnly }}
        />
      </div>
      <div className="col-md-4 my-2">
        <div className="text-muted fs14 mb-1">Date of Birth</div>
        <TextField
          fullWidth
          type="date"
          sx={{ ...textFieldStyle }}
          value={formData?.dob || ""}
          onChange={(e) => onChange("dob", e.target.value)}
          InputLabelProps={{ shrink: true }}
          InputProps={{ readOnly }}
        />
      </div>
      <div className="col-md-4 my-2">
        <div className="text-muted fs14 mb-1">Gender</div>
        <TextField
          fullWidth
          select
          sx={{ ...textFieldStyle }}
          value={formData?.gender || ""}
          onChange={(e) => onChange("gender", e.target.value)}
          InputProps={{ readOnly }}
        >
          <MenuItem value="">Select</MenuItem>
          <MenuItem value="Male">Male</MenuItem>
          <MenuItem value="Female">Female</MenuItem>
          <MenuItem value="Other">Other</MenuItem>
        </TextField>
      </div>
      <div className="col-md-4 my-2">
        <div className="text-muted fs14 mb-1">Mobile Number</div>
        <TextField
          fullWidth
          sx={{ ...textFieldStyle }}
          value={formData?.mobileNumber || ""}
          onChange={(e) => onChange("mobileNumber", e.target.value)}
          InputProps={{ readOnly }}
        />
      </div>
      <div className="col-md-4 my-2">
        <div className="text-muted fs14 mb-1">Email</div>
        <TextField
          fullWidth
          sx={{ ...textFieldStyle }}
          value={formData?.email || ""}
          onChange={(e) => onChange("email", e.target.value)}
          InputProps={{ readOnly }}
        />
      </div>
      <div className="col-md-4 my-2">
        <div className="text-muted fs14 mb-1">City</div>
        <TextField
          fullWidth
          sx={{ ...textFieldStyle }}
          value={formData?.city || ""}
          onChange={(e) => onChange("city", e.target.value)}
          InputProps={{ readOnly }}
        />
      </div>
      <div className="col-md-8 my-2">
        <div className="text-muted fs14 mb-1">Address</div>
        <TextField
          fullWidth
          multiline
          minRows={2}
          sx={{ ...textFieldStyle }}
          value={formData?.address || ""}
          onChange={(e) => onChange("address", e.target.value)}
          InputProps={{ readOnly }}
        />
      </div>
      <div className="col-md-4 my-2">
        <div className="text-muted fs14 mb-1">Pincode</div>
        <TextField
          fullWidth
          sx={{ ...textFieldStyle }}
          value={formData?.pincode || ""}
          onChange={(e) => onChange("pincode", e.target.value)}
          InputProps={{ readOnly }}
        />
      </div>
    </div>
  );
}

