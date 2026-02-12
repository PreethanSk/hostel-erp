import { TextField } from "@mui/material";
import { textFieldStyle } from "../../../services/HelperService";

type Props = {
  formData: any;
  onChange: (key: string, value: any) => void;
  readOnly?: boolean;
};

export default function Payments({ formData, onChange, readOnly }: Props) {
  const fields: { key: string; label: string }[] = [
    { key: "paymentOption", label: "Payment Option" },
    { key: "paidAmount", label: "Paid Amount" },
    { key: "admissionFeePaid", label: "Admission Fee Paid" },
    { key: "admissionFeePending", label: "Admission Fee Pending" },
    { key: "advancePaid", label: "Advance Paid" },
    { key: "advancePending", label: "Advance Pending" },
    { key: "monthlyRentPaid", label: "Monthly Rent Paid" },
    { key: "monthlyRentPending", label: "Monthly Rent Pending" },
    { key: "lateFeePaid", label: "Late Fee Paid" },
    { key: "lateFeePending", label: "Late Fee Pending" },
    { key: "tokenAmountPaid", label: "Token Amount Paid" },
    { key: "tokenAmountPending", label: "Token Amount Pending" },
    { key: "refundPaid", label: "Refund Paid" },
    { key: "refundPending", label: "Refund Pending" },
    { key: "cancellationFeePaid", label: "Cancellation Fee Paid" },
    { key: "cancellationFeePending", label: "Cancellation Fee Pending" },
    { key: "dueToPaid", label: "Due To Paid" },
    { key: "totalPendingAmount", label: "Total Pending Amount" },
  ];

  return (
    <div className="row">
      {fields.map(({ key, label }) => (
        <div key={key} className="col-md-4 my-2">
          <div className="text-muted fs14 mb-1">{label}</div>
          <TextField
            fullWidth
            sx={{ ...textFieldStyle }}
            value={formData?.[key] ?? ""}
            onChange={(e) => onChange(key, e.target.value)}
            InputProps={{ readOnly }}
          />
        </div>
      ))}
      <div className="col-md-4 my-2">
        <div className="text-muted fs14 mb-1">Due Date</div>
        <TextField
          fullWidth
          type="date"
          sx={{ ...textFieldStyle }}
          value={formData?.dueDate || ""}
          onChange={(e) => onChange("dueDate", e.target.value)}
          InputLabelProps={{ shrink: true }}
          InputProps={{ readOnly }}
        />
      </div>
    </div>
  );
}

