import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { KeyboardArrowRightRounded } from "@mui/icons-material";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { CustomAlert, customTableHeader, customTableTemplate } from "../../services/HelperService";
import { getCandidatePaymentDetail } from "../../models";

export default function CandidatePaymentDetails() {
  const [searchParams] = useSearchParams();
  const candidateIdParam = searchParams.get("candidateId");
  const candidateId = Number(candidateIdParam || 0) || undefined;

  const [_payment, _setPayment] = useState<any | null>(null);

  useEffect(() => {
    if (!candidateId) return;
    getCandidatePaymentDetail(candidateId)
      .then((resp: any) => {
        if (resp?.data?.status === "success") {
          _setPayment(resp?.data?.result || null);
        } else {
          CustomAlert("warning", resp?.data?.error || "Unable to fetch payment details");
        }
      })
      .catch((err: any) => {
        console.log(err);
        CustomAlert("warning", "Unable to fetch payment details");
      });
  }, [candidateId]);

  const rows = _payment
    ? [
        { label: "Payment Option", value: _payment.paymentOption },
        { label: "Paid Amount", value: _payment.paidAmount },
        { label: "Admission Fee Paid", value: _payment.admissionFeePaid },
        { label: "Admission Fee Pending", value: _payment.admissionFeePending },
        { label: "Advance Paid", value: _payment.advancePaid },
        { label: "Advance Pending", value: _payment.advancePending },
        { label: "Monthly Rent Paid", value: _payment.monthlyRentPaid },
        { label: "Monthly Rent Pending", value: _payment.monthlyRentPending },
        { label: "Late Fee Paid", value: _payment.lateFeePaid },
        { label: "Late Fee Pending", value: _payment.lateFeePending },
        { label: "Token Amount Paid", value: _payment.tokenAmountPaid },
        { label: "Token Amount Pending", value: _payment.tokenAmountPending },
        { label: "Refund Paid", value: _payment.refundPaid },
        { label: "Refund Pending", value: _payment.refundPending },
        { label: "Cancellation Fee Paid", value: _payment.cancellationFeePaid },
        { label: "Cancellation Fee Pending", value: _payment.cancellationFeePending },
        { label: "Due To Paid", value: _payment.dueToPaid },
        { label: "Total Pending Amount", value: _payment.totalPendingAmount },
        { label: "Due Date", value: _payment.dueDate },
      ]
    : [];

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
              <span className="text-muted">Candidate Payment Details</span>
            </div>
          </div>
        </div>

        <TableContainer className="tableBorder rounded">
          <Table sx={{ ...customTableTemplate }}>
            <TableHead>
              <TableRow sx={{ ...customTableHeader }}>
                <TableCell className="fw-bold">S.No</TableCell>
                <TableCell className="fw-bold">Field</TableCell>
                <TableCell className="fw-bold">Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows?.length ? (
                rows.map((row, index) => (
                  <TableRow key={row.label}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{row.label}</TableCell>
                    <TableCell>{row.value ?? "-"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="fs-3 text-muted" align="center" colSpan={3}>
                    No payment details found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
}

