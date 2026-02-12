import React, { useEffect, useState } from "react";
import { getDashboardPaymentsDetail } from "../../models/index";
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TextField, } from "@mui/material";
import { IMAGES_ICON } from "../../assets/images/exportImages";
import { SkeletonProviderTables } from "../../providers/SkeletonProvider";
import { customTableTemplate, customTableHeader, getExportEXCEL, } from "../../services/HelperService";
import CustomDialogue from "../../components/helpers/CustomDialogue";
import moment from "moment";

interface DashboardPaymentsDetailModalProps {
  open: boolean;
  onClose: () => void;
  fromDate: string;
  toDate: string;
  branchId: string;
  type?: string;
  detailedData?: any;
}

interface PaymentDetail {
  candidateId: number;
  candidateName: string;
  mobileNumber?: string;
  branchName?: string;
  roomNumber?: string;
  cotNumber?: string;
  updatedAt?: string;
  totalPayment?: string;
  advance?: string;
  pendingPayment?: string;
  refund?: string;
  dueDate?: string;
  advancePending?: string;
  monthlyRentPending?: string;
  lateFeePending?: string;
  tokenAmountPending?: string;
  advancePaid?: string;
  monthlyRentPaid?: string;
  lateFeePaid?: string;
  tokenAmountPaid?: string;
}

const DashboardPaymentsDetailModal: React.FC<DashboardPaymentsDetailModalProps> = ({
  open, onClose, fromDate, toDate, branchId, type = "paid", detailedData, }) => {
  const [data, setData] = useState<PaymentDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [_search, _setSearch] = useState("");

  const getPrintTableHeadBody = () => {
    let header: string[] = ["S. No", "Candidate ID", "Candidate Name", "Mobile No", "Branch", "Room", "Cot",];
    let body: any[][] = [];
    if (type === "advance") {
      header.push("Advance Paid");
      body = data?.map((item, index) => [
        index + 1,
        item.candidateId,
        item.candidateName,
        item.mobileNumber || "-",
        item.branchName || "-",
        item.roomNumber || "-",
        item.cotNumber || "-",
        item.advance || "-",
      ]);
    } else if (type === "pending") {
      header.push("Total Paid", "Total Pending");
      body = data?.map((item, index) => [
        index + 1,
        item.candidateId,
        item.candidateName,
        item.mobileNumber || "-",
        item.branchName || "-",
        item.roomNumber || "-",
        item.cotNumber || "-",
        item.totalPayment || "-",
        item.pendingPayment || "-",
      ]);
    } else if (type === "totalPayments") {
      header.push("Total Paid", "Total Pending", "Refund");
      body = data?.map((item, index) => [
        index + 1,
        item.candidateId,
        item.candidateName,
        item.mobileNumber || "-",
        item.branchName || "-",
        item.roomNumber || "-",
        item.cotNumber || "-",
        item.totalPayment || "-",
        item.pendingPayment || "-",
        item.refund || "-",
      ]);
    } else {
      header.push("Total Paid ", "Advance Paid", "Total Pending", "Refund");
      body = data?.map((item, index) => [
        index + 1,
        item.candidateId,
        item.candidateName,
        item.mobileNumber || "-",
        item.branchName || "-",
        item.roomNumber || "-",
        item.cotNumber || "-",
        item.totalPayment || "-",
        item.advance || "-",
        item.pendingPayment || "-",
        item.refund || "-",
      ]);
    }
    return { header, body };
  };

  const exportEXCEL = () => {
    const { header, body } = getPrintTableHeadBody();
    getExportEXCEL({ header, body, fileName: "Payment Details" });
  };

  useEffect(() => {
    if (!open) return;
    if (detailedData) {
      let groupKey = "paid";
      if (type === "advance") groupKey = "advance";
      else if (type === "pending") groupKey = "pending";
      else if (type === "refund") groupKey = "refund";
      else if (type === "totalPayments") groupKey = "totalPayments";
      else if (type === "paid") groupKey = "paid";
      setData(detailedData?.[groupKey] || []);
      return;
    }
    const queryStr = `?branchId=${branchId}&fromDate=${fromDate}&toDate=${toDate}`;
    setLoading(true);
    getDashboardPaymentsDetail(queryStr)
      .then((resp: any) => {
        if (resp?.data?.status === "success") {
          let groupKey = "paid";
          if (type === "advance") groupKey = "advance";
          else if (type === "pending") groupKey = "pending";
          else if (type === "refund") groupKey = "refund";
          else if (type === "totalPayments") groupKey = "totalPayments";
          else if (type === "paid") groupKey = "paid";
          setData(resp.data.result?.[groupKey] || []);
        } else {
          setData([]);
        }
      })
      .finally(() => setLoading(false));
  }, [open, fromDate, toDate, branchId, type, detailedData]);

  if (!open) return null;

  let tableHeaders: string[] = [
    "S. No",
    "Candidate Name",
    "Mobile No",
    "Branch",
    "Room",
    "Cot",
    "Last Update",
  ];
  if (type === "advance") {
    tableHeaders.push("Advance Paid");
  } else if (type === "pending") {
    tableHeaders.push("Total Paid", "Total Pending", "Due Date", "Advance Pending",
      "Monthly Pending", "Late Fee Pending", "Token Amount Pending")
  } else if (type === "paid") {
    tableHeaders.push("Total Paid", "Advance Paid",
      "Monthly Paid", "Late Fee Paid", "Token Amount Paid");
  } else if (type === "refund") {
    tableHeaders.push("Total Paid", "Total Pending", "Refund");
  } else if (type === "totalPayments") {
    tableHeaders.push("Total Paid", "Total Pending", "Refund");
  } else {
    tableHeaders.push("Total Paid", "Total Pending", "Refund");
  }

  return (
    <CustomDialogue
      displaySize={"lg"}
      title={
        type === "advance" ? "Token Advance"
          : type === "pending" ? "Pending Payments"
            : type === "refund" ? "Refund Payments"
              : type === "totalPayments" ? "Total Payments" : "Total Paid"
      }
      dialogueFlag={true}
      onCloseClick={onClose}
      mainContent={
        <div className="my-2">
          <TableContainer className="tableBorder rounded">
            <Table size="small" sx={{ ...customTableTemplate }}>
              <TableHead>
                <TableRow sx={{ ...customTableHeader }}>
                  {tableHeaders.map((header, idx) => (
                    <TableCell className="fw-bold text-nowrap" key={idx}>{header}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.length > 0
                  ? data
                    ?.filter((content: any) => {
                      const lowerSearchInput = _search?.toLowerCase()?.trim();
                      return (
                        lowerSearchInput === "" ||
                        Object?.values(content)?.some((value) => value?.toString()?.toLowerCase()?.includes(lowerSearchInput))
                      );
                    })
                    ?.map((item: PaymentDetail, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>{" "}
                        <TableCell className="text-nowrap">{item.candidateName}</TableCell>
                        <TableCell className="text-nowrap">{item.mobileNumber || "-"}</TableCell>
                        <TableCell className="text-nowrap">{item.branchName || "-"}</TableCell>
                        <TableCell className="text-nowrap">{item.roomNumber || "-"}</TableCell>
                        <TableCell className="text-nowrap">{item.cotNumber || "-"}</TableCell>
                        <TableCell className="text-nowrap">{item.updatedAt ? moment(item?.updatedAt)?.format('DD-MMM-YYYY hh:mm a') : '-'}</TableCell>
                        {type === "advance" ? (
                          <TableCell align="center">{item.advance || "-"}  </TableCell>) :
                          type === "pending" ?
                            <>
                              <TableCell align="center">{item.totalPayment || "-"}</TableCell>
                              <TableCell align="center">{item.pendingPayment || "-"}</TableCell>
                              <TableCell align="center" className="text-nowrap">{item.dueDate ? moment(item.dueDate).format('DD-MM-YYYY') : "-"}</TableCell>
                              <TableCell align="center">{item.advancePending || "-"}</TableCell>
                              <TableCell align="center">{item.monthlyRentPending || "-"}</TableCell>
                              <TableCell align="center">{item.lateFeePending || "-"}</TableCell>
                              <TableCell align="center">{item.tokenAmountPending || "-"}</TableCell>
                            </> :
                            type === "paid" ?
                              <>
                                <TableCell align="center">{item.totalPayment || "-"}</TableCell>
                                <TableCell align="center">{item.advancePaid || "-"}</TableCell>
                                <TableCell align="center">{item.monthlyRentPaid || "-"}</TableCell>
                                <TableCell align="center">{item.lateFeePaid || "-"}</TableCell>
                                <TableCell align="center">{item.tokenAmountPaid || "-"}</TableCell>
                              </> :
                              type === "refund" ?
                                <>
                                  <TableCell align="center">{item.totalPayment || "-"}</TableCell>
                                  <TableCell align="center">{item.pendingPayment || "-"}</TableCell>
                                  <TableCell align="center">{item.refund || "-"}</TableCell>
                                </> :
                                type === "totalPayments" ?
                                  <>
                                    <TableCell align="center">{item.totalPayment || "-"}</TableCell>
                                    <TableCell align="center">{item.pendingPayment || "-"}</TableCell>
                                    <TableCell align="center">{item.refund || "-"}</TableCell>
                                  </> :
                                  (
                                    <>
                                      <TableCell align="center">{item.totalPayment || "-"}</TableCell>
                                      <TableCell align="center">{item.pendingPayment || "-"}</TableCell>
                                      <TableCell align="center">{item.refund || "-"}</TableCell>
                                    </>
                                  )}
                      </TableRow>
                    ))
                  : !loading && (
                    <TableRow>
                      <TableCell className="fs-3 text-muted" align="center" colSpan={tableHeaders.length}>Data Not Found</TableCell>
                    </TableRow>
                  )}
                <SkeletonProviderTables columns={tableHeaders.length} visible={loading} />
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      }
      actionContent={
        <div className="flex-grow-1">
          <hr className="mt-0" />
          <div className="my-2 d-flex justify-content-center align-items-center gap-4">
            <div className="d-flex align-items-center">
              <TextField size="small" fullWidth className="bg-white py-0" value={_search} placeholder="Search"
                onChange={(e: any) => _setSearch(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <img height={18} src={IMAGES_ICON.TableSearchIcon} role="button" draggable="false" />
                  ),
                }}
              />
            </div>
            <img height={24} src={IMAGES_ICON.TableDownloadIcon} role="button" draggable="false" onClick={exportEXCEL} />
          </div>
        </div>
      }
    />
  );
};

export default DashboardPaymentsDetailModal;
