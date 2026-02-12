import { Checkbox, FormControlLabel, TextField } from "@mui/material";
import { textFieldStyle } from "../../../services/HelperService";

type Props = {
  formData: any;
  onChange: (key: string, value: any) => void;
  readOnly?: boolean;
};

export default function ContactPerson({ formData, onChange, readOnly }: Props) {
  return (
    <div className="row">
      <div className="col-md-4 my-2">
        <div className="text-muted fs14 mb-1">Primary Contact Name</div>
        <TextField
          fullWidth
          sx={{ ...textFieldStyle }}
          value={formData?.name || ""}
          onChange={(e) => onChange("name", e.target.value)}
          InputProps={{ readOnly }}
        />
      </div>
      <div className="col-md-4 my-2">
        <div className="text-muted fs14 mb-1">Relationship</div>
        <TextField
          fullWidth
          sx={{ ...textFieldStyle }}
          value={formData?.relationshipType || ""}
          onChange={(e) => onChange("relationshipType", e.target.value)}
          InputProps={{ readOnly }}
        />
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
        <div className="text-muted fs14 mb-1">Secondary Contact Name</div>
        <TextField
          fullWidth
          sx={{ ...textFieldStyle }}
          value={formData?.name2 || ""}
          onChange={(e) => onChange("name2", e.target.value)}
          InputProps={{ readOnly }}
        />
      </div>
      <div className="col-md-4 my-2">
        <div className="text-muted fs14 mb-1">Secondary Relationship</div>
        <TextField
          fullWidth
          sx={{ ...textFieldStyle }}
          value={formData?.relationshipType2 || ""}
          onChange={(e) => onChange("relationshipType2", e.target.value)}
          InputProps={{ readOnly }}
        />
      </div>
      <div className="col-md-4 my-2">
        <div className="text-muted fs14 mb-1">Secondary Mobile</div>
        <TextField
          fullWidth
          sx={{ ...textFieldStyle }}
          value={formData?.mobileNumber2 || ""}
          onChange={(e) => onChange("mobileNumber2", e.target.value)}
          InputProps={{ readOnly }}
        />
      </div>

      <div className="col-12 my-2">
        <FormControlLabel
          control={
            <Checkbox
              checked={!!formData?.localGuardianStatus}
              onChange={(_, checked) => onChange("localGuardianStatus", checked)}
              disabled={readOnly}
            />
          }
          label="Local Guardian"
        />
      </div>

      <div className="col-md-4 my-2">
        <div className="text-muted fs14 mb-1">Guardian Name</div>
        <TextField
          fullWidth
          sx={{ ...textFieldStyle }}
          value={formData?.guardianName || ""}
          onChange={(e) => onChange("guardianName", e.target.value)}
          InputProps={{ readOnly }}
        />
      </div>
      <div className="col-md-4 my-2">
        <div className="text-muted fs14 mb-1">Guardian Mobile</div>
        <TextField
          fullWidth
          sx={{ ...textFieldStyle }}
          value={formData?.guardianMobileNumber || ""}
          onChange={(e) => onChange("guardianMobileNumber", e.target.value)}
          InputProps={{ readOnly }}
        />
      </div>
      <div className="col-md-4 my-2">
        <div className="text-muted fs14 mb-1">Guardian Relationship</div>
        <TextField
          fullWidth
          sx={{ ...textFieldStyle }}
          value={formData?.guardianRelationshipType || ""}
          onChange={(e) => onChange("guardianRelationshipType", e.target.value)}
          InputProps={{ readOnly }}
        />
      </div>

      <div className="col-md-8 my-2">
        <div className="text-muted fs14 mb-1">Guardian Address</div>
        <TextField
          fullWidth
          multiline
          minRows={2}
          sx={{ ...textFieldStyle }}
          value={formData?.guardianAddress || ""}
          onChange={(e) => onChange("guardianAddress", e.target.value)}
          InputProps={{ readOnly }}
        />
      </div>
      <div className="col-md-4 my-2">
        <div className="text-muted fs14 mb-1">Guardian City</div>
        <TextField
          fullWidth
          sx={{ ...textFieldStyle }}
          value={formData?.guardianCity || ""}
          onChange={(e) => onChange("guardianCity", e.target.value)}
          InputProps={{ readOnly }}
        />
      </div>
    </div>
  );
}

