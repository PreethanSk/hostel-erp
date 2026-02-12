import { Checkbox, FormControlLabel, TextField } from "@mui/material";
import { textFieldStyle } from "../../../services/HelperService";

type Props = {
  formData: any;
  onChange: (key: string, value: any) => void;
  readOnly?: boolean;
};

export default function Others({ formData, onChange, readOnly }: Props) {
  return (
    <div className="row">
      <div className="col-md-12 my-2">
        <FormControlLabel
          control={
            <Checkbox
              checked={!!formData?.anySpecialCareRequired}
              onChange={(_, checked) => onChange("anySpecialCareRequired", checked)}
              disabled={readOnly}
            />
          }
          label="Any Special Care Required"
        />
      </div>
      <div className="col-md-12 my-2">
        <div className="text-muted fs14 mb-1">Details of Special Care</div>
        <TextField
          fullWidth
          multiline
          minRows={2}
          sx={{ ...textFieldStyle }}
          value={formData?.detailsOfSpecialCare || ""}
          onChange={(e) => onChange("detailsOfSpecialCare", e.target.value)}
          InputProps={{ readOnly }}
        />
      </div>
      <div className="col-md-6 my-2">
        <div className="text-muted fs14 mb-1">How Do They Know About Us</div>
        <TextField
          fullWidth
          sx={{ ...textFieldStyle }}
          value={formData?.howDoTheyKnowAboutUs || ""}
          onChange={(e) => onChange("howDoTheyKnowAboutUs", e.target.value)}
          InputProps={{ readOnly }}
        />
      </div>
      <div className="col-md-6 my-2">
        <div className="text-muted fs14 mb-1">Enquiry Before Visiting</div>
        <TextField
          fullWidth
          sx={{ ...textFieldStyle }}
          value={formData?.enquiryBeforeVisiting || ""}
          onChange={(e) => onChange("enquiryBeforeVisiting", e.target.value)}
          InputProps={{ readOnly }}
        />
      </div>
    </div>
  );
}

