import { TextField } from "@mui/material";
import { textFieldStyle } from "../../../services/HelperService";

type Props = {
  formData: any;
  onChange: (key: string, value: any) => void;
  readOnly?: boolean;
};

export default function PurposeOfStay({ formData, onChange, readOnly }: Props) {
  return (
    <div className="row">
      <div className="col-md-4 my-2">
        <div className="text-muted fs14 mb-1">Mentioned Purpose</div>
        <TextField
          fullWidth
          sx={{ ...textFieldStyle }}
          value={formData?.mentionedPurpose || ""}
          onChange={(e) => onChange("mentionedPurpose", e.target.value)}
          InputProps={{ readOnly }}
        />
      </div>
      <div className="col-md-8 my-2">
        <div className="text-muted fs14 mb-1">Reason of Stay</div>
        <TextField
          fullWidth
          multiline
          minRows={2}
          sx={{ ...textFieldStyle }}
          value={formData?.reasonOfStay || ""}
          onChange={(e) => onChange("reasonOfStay", e.target.value)}
          InputProps={{ readOnly }}
        />
      </div>

      <div className="col-md-6 my-2">
        <div className="text-muted fs14 mb-1">Organization Name</div>
        <TextField
          fullWidth
          sx={{ ...textFieldStyle }}
          value={formData?.organizationName || ""}
          onChange={(e) => onChange("organizationName", e.target.value)}
          InputProps={{ readOnly }}
        />
      </div>
      <div className="col-md-6 my-2">
        <div className="text-muted fs14 mb-1">Organization Mobile</div>
        <TextField
          fullWidth
          sx={{ ...textFieldStyle }}
          value={formData?.organizationMobileNumber || ""}
          onChange={(e) => onChange("organizationMobileNumber", e.target.value)}
          InputProps={{ readOnly }}
        />
      </div>
      <div className="col-md-12 my-2">
        <div className="text-muted fs14 mb-1">Organization Address</div>
        <TextField
          fullWidth
          multiline
          minRows={2}
          sx={{ ...textFieldStyle }}
          value={formData?.organizationAddress || ""}
          onChange={(e) => onChange("organizationAddress", e.target.value)}
          InputProps={{ readOnly }}
        />
      </div>
    </div>
  );
}

