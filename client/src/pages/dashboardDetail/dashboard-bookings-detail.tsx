import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  TableContainer,
} from "@mui/material";
import { IMAGES_ICON } from "../../assets/images/exportImages";
import {
  customTableTemplate,
  customTableHeader,
  getExportEXCEL,
} from "../../services/HelperService";
import CustomDialogue from "../../components/helpers/CustomDialogue";
import { useEffect, useState } from "react";
import { getDashboardBookingsDetail } from "../../models";
import { SkeletonProviderTables } from "../../providers/SkeletonProvider";
import moment from "moment";

interface DashboardBookingsDetailModalProps {
  open: boolean;
  onClose: () => void;
  fromDate: string;
  toDate: string;
  branchId: string;
  type?: string;
  detailedData?: any;
}

interface BookingDetail {
  candidateId: number;
  candidateName: string;
  mobileNumber?: string;
  email?: string;
  branchName?: string;
  roomNumber?: string;
  cotNumber?: string;
  roomRent?: string;
  rejectedOrCancelledDate?: string;
  paymentStatus?: string;
  status?: string;
}

export default function DashboardBookingsDetailModal({
  open,
  onClose,
  fromDate,
  toDate,
  branchId,
  type = "confirmBooking",
  detailedData,
}: DashboardBookingsDetailModalProps) {
  const [data, setData] = useState<BookingDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [_search, _setSearch] = useState("");

  useEffect(() => {
    if (!open) return;
    if (detailedData) {
      setData(detailedData?.[type] || []);
      return;
    }
    setLoading(true);
    const queryStr = `?branchId=${branchId}&from=${fromDate}&to=${toDate}`;
    getDashboardBookingsDetail(queryStr).then((resp: any) => {
      if (resp?.data?.status === "success") {
        setData(resp.data.result?.[type] || []);
      } else {
        setData([]);
      }
      setLoading(false);
    });
  }, [open, fromDate, toDate, branchId, type, detailedData]);

  const getPrintTableHeadBody = () => {
    const header = [
      "S. No",
      "Candidate ID",
      "Candidate Name",
      "Mobile No",
      "Email",
      "Branch",
      "Room",
      "Cot",
      "Room Rent",
      "Payment Status",
      "Booking Status",
    ];
    if (type === "totalBooking" || type === "pendingBooking" || type === "confirmBooking") {
      header.push("Payment Status");
    }
    if (type === "cancelled") header.push("Rejected/Cancelled Date");
    const body = data?.map((item: BookingDetail, index: number) => {
      const row = [
        index + 1,
        item.candidateId || "-",
        item.candidateName || "-",
        item.mobileNumber || "-",
        item.email || "-",
        item.branchName || "-",
        item.roomNumber || "-",
        item.cotNumber || "-",
        item.roomRent || "-",
        item.paymentStatus || "-",
        item.status || "-",
      ];
      if (type === "totalBooking" || type === "pendingBooking" || type === "confirmBooking") {
        row.push(item.paymentStatus || "-");
      }
      if (type === "cancelled") {
        row.push(
          item.rejectedOrCancelledDate && moment(item.rejectedOrCancelledDate).isValid()
            ? moment(item.rejectedOrCancelledDate).format("DD-MMM-YYYY")
            : "-"
        );
      }
      return row;
    });
    return { header, body };
  };

  const exportEXCEL = () => {
    const { header, body } = getPrintTableHeadBody();
    getExportEXCEL({ header, body, fileName: "Bookings Details" });
  };

  let title = "";
  if (type === "totalBooking") title = "Total Booking";
  if (type === "cancelled") title = "Cancelled";
  if (type === "pendingBooking") title = "Pending";
  if (type === "confirmBooking") title = "Confirm";

  if (!open) return null;

  return (
    <CustomDialogue
      displaySize={"lg"}
      title={title + " Details"}
      dialogueFlag={true}
      onCloseClick={onClose}
      mainContent={
        <div className="my-2">
          <TableContainer className="tableBorder rounded">
            <Table size="small" sx={{ ...customTableTemplate }}>
              <TableHead>
                <TableRow sx={{ ...customTableHeader }}>
                  <TableCell className="fw-bold text-nowrap">S.No</TableCell>
                  <TableCell className="fw-bold text-nowrap">Candidate ID</TableCell>
                  <TableCell className="fw-bold text-nowrap">Candidate Name</TableCell>
                  <TableCell className="fw-bold text-nowrap">Mobile No</TableCell>
                  <TableCell className="fw-bold text-nowrap">Email</TableCell>
                  <TableCell className="fw-bold text-nowrap">Branch</TableCell>
                  <TableCell className="fw-bold text-nowrap">Room</TableCell>
                  <TableCell className="fw-bold text-nowrap">Cot</TableCell>
                  <TableCell className="fw-bold text-nowrap">Room Rent</TableCell>
                  <TableCell className="fw-bold text-nowrap">Payment Status</TableCell>
                  <TableCell className="fw-bold text-nowrap">Booking Status</TableCell>
                  {type === "cancelled" && <TableCell className="fw-bold"> Rejected/Cancelled Date</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.length > 0
                  ? data
                    .filter((content: BookingDetail) => {
                      const lowerSearchInput = _search?.toLowerCase()?.trim();
                      return (
                        lowerSearchInput === "" ||
                        Object?.values(content)?.some((value) => value?.toString()?.toLowerCase()?.includes(lowerSearchInput))
                      );
                    })
                    .map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{row?.candidateId || "-"}</TableCell>
                        <TableCell>{row?.candidateName || "-"}</TableCell>
                        <TableCell>{row?.mobileNumber || "-"}</TableCell>
                        <TableCell>{row?.email || "-"}</TableCell>
                        <TableCell>{row?.branchName || "-"}</TableCell>
                        <TableCell>{row?.roomNumber || "-"}</TableCell>
                        <TableCell>{row?.cotNumber || "-"}</TableCell>
                        <TableCell>{row?.roomRent || "-"}</TableCell>
                        <TableCell>{row?.paymentStatus || "Unpaid"}</TableCell>
                        <TableCell>{row?.status || "-"}</TableCell>
                        {(type === "totalBooking" || type === "pendingBooking" || type === "confirmBooking") && (
                          <TableCell>{row?.paymentStatus || "-"}</TableCell>
                        )}
                        {type === "cancelled" && (
                          <TableCell>
                            {row?.rejectedOrCancelledDate && moment(row.rejectedOrCancelledDate).isValid()
                              ? moment(row.rejectedOrCancelledDate).format("DD-MMM-YYYY")
                              : "-"}
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  : !loading && (
                    <TableRow>
                      <TableCell className="fs-3 text-muted" align="center" colSpan={type === "cancelled" ? 12 : 11}>Data Not Found</TableCell>
                    </TableRow>
                  )}
                <SkeletonProviderTables columns={type === "cancelled" ? 12 : 11} visible={loading} />
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
                onChange={(e) => _setSearch(e.target.value)}
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
}
