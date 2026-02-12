import { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import { TextField } from "@mui/material";
import { IMAGES_ICON } from "../../assets/images/exportImages";
import { SkeletonProviderTables } from "../../providers/SkeletonProvider";
import { customTableTemplate, customTableHeader, getExportEXCEL, } from "../../services/HelperService";
import CustomDialogue from "../../components/helpers/CustomDialogue";
import { getDashboardComplaintsDetail } from "../../models";

interface ComplaintDetail {
  creator?: string;
  branchName?: string;
  roomNumber?: string;
  cotNumber?: string;
  complaintDate?: string;
  mobileNumber?: string;
  natureOfComplaint?: string;
  assignTo?: string;
  closedBy?: string;
  status?: string;
  // Add backend fields for mapping
  issueTypeName?: string;
  issueSubCategoryName?: string;
  assignedToName?: string;
  closedByName?: string;
  description?: string;
  imageUrl?: string;
  createdBy?: string;
  assignedBy?: string;
  pickedOn?: string;
  closedOn?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  fromDate: string;
  toDate: string;
  branchId: string;
  type?: string;
  detailedData?: any;
  serviceProviderId?: string;
}

export default function DashboardComplaintsDetailModal({
  open,
  onClose,
  fromDate,
  toDate,
  branchId,
  type = "Open",
  detailedData,
  serviceProviderId,
}: Props) {
  const [data, setData] = useState<ComplaintDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [_search, _setSearch] = useState("");

  useEffect(() => {
    if (!open) return;
    if (detailedData) {
      let groupKey = "Open";
      if (type === "InProgress") groupKey = "InProgress";
      else if (type === "Hold") groupKey = "Hold";
      else if (type === "Closed") groupKey = "Closed";
      else if (type === "Reject") groupKey = "Reject";
      const group = detailedData?.[groupKey] || [];
      const mapped = group.map((item: ComplaintDetail) => ({
        creator: item.creator,
        branchName: item.branchName,
        roomNumber: item.roomNumber,
        cotNumber: item.cotNumber,
        complaintDate: item.complaintDate,
        mobileNumber: item.mobileNumber || "-",
        natureOfComplaint: item.issueTypeName,
        issueSubCategoryName: item.issueSubCategoryName,
        assignTo: item.assignedToName,
        closedBy: item.closedByName || "-",
        status: item.status,
        description: item.description,
        imageUrl: item.imageUrl,
        createdBy: item.createdBy,
        assignedBy: item.assignedBy,
        pickedOn: item.pickedOn,
        closedOn: item.closedOn,
      }));
      setData(mapped);
      return;
    }
    setLoading(true);
    let queryStr = `?from=${fromDate}&to=${toDate}`;
    if (branchId) queryStr += `&branchId=${branchId}`;
    if (serviceProviderId) queryStr += `&serviceProviderId=${serviceProviderId}`;
    getDashboardComplaintsDetail(queryStr).then((resp: any) => {
      if (resp?.data?.status === "success") {
        let groupKey = "Open";
        if (type === "InProgress") groupKey = "InProgress";
        else if (type === "Hold") groupKey = "Hold";
        else if (type === "Closed") groupKey = "Closed";
        else if (type === "Reject") groupKey = "Reject";
        const group = resp.data.result?.[groupKey] || [];
        const mapped = group.map((item: ComplaintDetail) => ({
          creator: item.creator,
          branchName: item.branchName,
          roomNumber: item.roomNumber,
          cotNumber: item.cotNumber,
          complaintDate: item.complaintDate,
          mobileNumber: item.mobileNumber || "-",
          natureOfComplaint: item.issueTypeName,
          issueSubCategoryName: item.issueSubCategoryName,
          assignTo: item.assignedToName,
          closedBy: item.closedByName || "-",
          status: item.status,
          description: item.description,
          imageUrl: item.imageUrl,
          createdBy: item.createdBy,
          assignedBy: item.assignedBy,
          pickedOn: item.pickedOn,
          closedOn: item.closedOn,
        }));
        setData(mapped);
      } else {
        setData([]);
      }
      setLoading(false);
    });
  }, [open, fromDate, toDate, branchId, type, detailedData, serviceProviderId]);

  const getPrintTableHeadBody = () => {
    const header = [
      "S. No",
      "Creator",
      "Branch",
      "Room",
      "Cot",
      "Complaint Date",
      "Mobile No",
      "Nature of Complaint",
      "Sub Category",
      "Description",
      "Images",
      "Created By",
      "Assign To",
      "Assigned By",
      "Picked On",
      "Closed On",
      "Closed By",
      "Status",
    ];
    const body = data?.map((item: ComplaintDetail, index: number) => [
      index + 1,
      item?.creator || "-",
      item?.branchName || "-",
      item?.roomNumber || "-",
      item?.cotNumber || "-",
      item?.complaintDate || "-",
      item?.mobileNumber || "-",
      item?.natureOfComplaint || "-",
      item?.issueSubCategoryName || "-",
      item?.description || "-",
      item?.imageUrl || "-",
      item?.createdBy || "-",
      item?.assignTo || "-",
      item?.assignedBy || "-",
      item?.pickedOn || "-",
      item?.closedOn || "-",
      item?.closedBy || "-",
      item?.status || "-",
    ]);
    return { header, body };
  };

  const exportEXCEL = () => {
    const { header, body } = getPrintTableHeadBody();
    getExportEXCEL({ header, body, fileName: "Complaints Details" });
  };

  let title = "Open Complaints";
  if (type === "InProgress") title = "In Progress Complaints";
  if (type === "Hold") title = "On Hold Complaints";
  if (type === "Closed") title = "Resolved Complaints";
  if (type === "Reject") title = "Rejected Complaints";

  if (!open) return null;

  return (
    <CustomDialogue
      displaySize={"lg"}
      title={title}
      dialogueFlag={true}
      onCloseClick={onClose}
      mainContent={
        <div className="my-2">
          <Table size="small" sx={{ ...customTableTemplate }}>
            <TableHead>
              <TableRow sx={{ ...customTableHeader }}>
                <TableCell className="fw-bold text-nowrap">S.No</TableCell>
                <TableCell className="fw-bold text-nowrap">Creator</TableCell>
                <TableCell className="fw-bold text-nowrap">Branch</TableCell>
                <TableCell className="fw-bold text-nowrap">Room</TableCell>
                <TableCell className="fw-bold text-nowrap">Cot</TableCell>
                <TableCell className="fw-bold text-nowrap">Complaint Date</TableCell>
                <TableCell className="fw-bold text-nowrap">Mobile No</TableCell>
                <TableCell className="fw-bold text-nowrap">Nature of Complaint</TableCell>
                <TableCell className="fw-bold text-nowrap">Sub Category</TableCell>
                <TableCell className="fw-bold text-nowrap">Description</TableCell>
                <TableCell className="fw-bold text-nowrap">Images</TableCell>
                <TableCell className="fw-bold text-nowrap">Created By</TableCell>
                <TableCell className="fw-bold text-nowrap">Assign To</TableCell>
                <TableCell className="fw-bold text-nowrap">Assigned By</TableCell>
                <TableCell className="fw-bold text-nowrap">Picked On</TableCell>
                <TableCell className="fw-bold text-nowrap">Closed On</TableCell>
                <TableCell className="fw-bold text-nowrap">Closed By</TableCell>
                <TableCell className="fw-bold text-nowrap">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.length > 0
                ? data
                  .filter((content: ComplaintDetail) => {
                    const lowerSearchInput = _search?.toLowerCase()?.trim();
                    return (
                      lowerSearchInput === "" ||
                      Object?.values(content)?.some((value) => value?.toString()?.toLowerCase()?.includes(lowerSearchInput))
                    );
                  })
                  .map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{row.creator || "-"}</TableCell>
                      <TableCell>{row.branchName || "-"}</TableCell>
                      <TableCell>{row.roomNumber || "-"}</TableCell>
                      <TableCell>{row.cotNumber || "-"}</TableCell>
                      <TableCell>{row.complaintDate || "-"}</TableCell>
                      <TableCell>{row.mobileNumber || "-"}</TableCell>
                      <TableCell>{row.natureOfComplaint || "-"}</TableCell>
                      <TableCell>{row.issueSubCategoryName || "-"}</TableCell>
                      <TableCell>{row.description || "-"}</TableCell>
                      <TableCell>
                        {row.imageUrl ? (
                          row.imageUrl.split(',').map((url: string, imgIdx: number) => (
                            <a key={imgIdx} href={url.trim()} target="_blank" rel="noopener noreferrer" className="me-2">
                              Image {imgIdx + 1}
                            </a>
                          ))
                        ) : "-"}
                      </TableCell>
                      <TableCell>{row.createdBy || "-"}</TableCell>
                      <TableCell>{row.assignTo || "-"}</TableCell>
                      <TableCell>{row.assignedBy || "-"}</TableCell>
                      <TableCell>{row.pickedOn || "-"}</TableCell>
                      <TableCell>{row.closedOn || "-"}</TableCell>
                      <TableCell>{row.closedBy || "-"}</TableCell>
                      <TableCell>{row.status || "-"}</TableCell>
                    </TableRow>
                  ))
                : !loading && (
                  <TableRow>
                    <TableCell className="fs-3 text-muted" align="center" colSpan={18}>Data Not Found</TableCell>
                  </TableRow>
                )}
              <SkeletonProviderTables columns={18} visible={loading} />
            </TableBody>
          </Table>
        </div>
      }
      actionContent={
        <div className="flex-grow-1">
          <hr className="mt-0" />
          <div className="my-2 d-flex justify-content-center align-items-center gap-4">
            <div className="d-flex align-items-center">
              <TextField
                size="small"
                fullWidth
                className="bg-white py-0"
                value={_search}
                onChange={(e) => _setSearch(e.target.value)}
                placeholder="Search"
                InputProps={{
                  endAdornment: (
                    <img
                      height={18}
                      src={IMAGES_ICON.TableSearchIcon}
                      role="button"
                      draggable="false"
                    />
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
