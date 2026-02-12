import { Table, TableHead, TableRow, TableCell, TableBody, TableContainer, TextField, } from "@mui/material";
import { useEffect, useState } from "react";
import { getDashboardCotsDetail } from "../../models";
import { IMAGES_ICON } from "../../assets/images/exportImages";
import { SkeletonProviderTables } from "../../providers/SkeletonProvider";
import { customTableTemplate, customTableHeader, getExportEXCEL, } from "../../services/HelperService";
import CustomDialogue from "../../components/helpers/CustomDialogue";

export default function DashboardCotsDetailModal({ open, onClose, fromDate, toDate, branchId, type = "totalCots", detailedData }: { open: boolean; onClose: () => void; fromDate: string; toDate: string; branchId: string; type?: string; detailedData?: any; }) {
  // Use a more specific type for cots detail rows
  type CotDetailRow = {
    candidateId?: number | string;
    candidateName?: string;
    mobileNumber?: string;
    email?: string;
    branchName?: string;
    roomNumber?: string;
    cotNumber?: string;
    cotTypeName?: string;
    roomRent?: string;
    rentAmount?: string;
    status?: string;
    admissionType?: string;
  };
  const [data, setData] = useState<CotDetailRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [_search, _setSearch] = useState("");

  useEffect(() => {
    if (!open) return;
    if (detailedData) {
      let list: CotDetailRow[] = [];
      if (type === "totalCots") list = detailedData.totalCots || [];
      if (type === "occupied") list = detailedData.occupied || [];
      if (type === "maintenance") list = detailedData.maintenance || [];
      if (type === "available") list = detailedData.available || [];
      if (type === "booked") list = detailedData.booked || [];
      setData(list);
      return;
    }
    setLoading(true);
    const queryStr = `?branchId=${branchId}&from=${fromDate}&to=${toDate}`;
    getDashboardCotsDetail(queryStr).then((resp: any) => {
      if (resp?.data?.status === "success") {
        const result = resp.data.result;
        let list: CotDetailRow[] = [];
        if (type === "totalCots") list = result.totalCots || [];
        if (type === "occupied") list = result.occupied || [];
        if (type === "maintenance") list = result.maintenance || [];
        if (type === "available") list = result.available || [];
        if (type === "booked") list = result.booked || [];
        setData(list);
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
      "Cot Type",
      "Room Rent",
      "Status",
    ];
    const body = data?.map((item: CotDetailRow, index: number) => [
      index + 1,
      item?.candidateId || "-",
      item?.candidateName || "-",
      item?.mobileNumber || "-",
      item?.email || "-",
      item?.branchName || "-",
      item?.roomNumber || "-",
      item?.cotNumber || "-",
      item?.cotTypeName || "-",
      item?.roomRent || "-",
      item?.status || "-",
    ]);
    return { header, body };
  };

  const exportEXCEL = () => {
    const { header, body } = getPrintTableHeadBody();
    getExportEXCEL({ header, body, fileName: "Cots Details" });
  };

  let title = "Total Cots";
  if (type === "occupied") title = "Occupied Cots";
  if (type === "maintenance") title = "Maintenance Cots";
  if (type === "available") title = "Available Cots";
  if (type === "booked") title = "Booked Cots";

  if (!open) return null;

  return (
    <CustomDialogue
      displaySize={"lg"}
      title={title}
      dialogueFlag={true}
      onCloseClick={onClose}
      mainContent={
        <div className="my-2">
          <TableContainer className="tableBorder rounded">
            <Table size="small" sx={{ ...customTableTemplate }}>
              <TableHead>
                <TableRow sx={{ ...customTableHeader }}>
                  <TableCell className="fw-bold text-nowrap">S.No</TableCell>
                  {(type !== 'available' && type !== 'maintenance') && <TableCell className="fw-bold text-nowrap">Admission Type</TableCell>}
                  {(type !== 'available' && type !== 'maintenance') && <TableCell className="fw-bold text-nowrap">Candidate ID</TableCell>}
                  {(type !== 'available' && type !== 'maintenance') && <TableCell className="fw-bold text-nowrap">Candidate Name</TableCell>}
                  {(type !== 'available' && type !== 'maintenance') && <TableCell className="fw-bold text-nowrap">Mobile No</TableCell>}
                  {(type !== 'available' && type !== 'maintenance') && <TableCell className="fw-bold text-nowrap">Email</TableCell>}
                  <TableCell className="fw-bold text-nowrap">Branch</TableCell>
                  <TableCell className="fw-bold text-nowrap">Room</TableCell>
                  <TableCell className="fw-bold text-nowrap">Cot</TableCell>
                  <TableCell className="fw-bold text-nowrap">Cot Type</TableCell>
                  <TableCell className="fw-bold text-nowrap">Room Rent</TableCell>
                  {(type !== 'available' && type !== 'maintenance') && <TableCell className="fw-bold text-nowrap">Status</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.length > 0
                  ? data?.filter((content: CotDetailRow) => {
                    const lowerSearchInput = _search?.toLowerCase()?.trim();
                    return (
                      lowerSearchInput === "" ||
                      Object?.values(content)?.some((value) => value?.toString()?.toLowerCase()?.includes(lowerSearchInput))
                    );
                  })
                    ?.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{idx + 1}</TableCell>
                        {(type !== 'available' && type !== 'maintenance') && <TableCell className="text-nowrap">
                          <span className={`fs14 text-white ${row.admissionType === 'Staff' ? 'bg-danger rounded px-2' : 'bg-success rounded px-2'}`}>{row.admissionType || 'Normal'}</span>
                        </TableCell>}
                        {(type !== 'available' && type !== 'maintenance') && <TableCell className="text-nowrap">{row.candidateId || "-"}</TableCell>}
                        {(type !== 'available' && type !== 'maintenance') && <TableCell className="text-nowrap">{row.candidateName || "-"}</TableCell>}
                        {(type !== 'available' && type !== 'maintenance') && <TableCell className="text-nowrap">{row.mobileNumber || "-"}</TableCell>}
                        {(type !== 'available' && type !== 'maintenance') && <TableCell className="text-nowrap">{row.email || "-"}</TableCell>}
                        <TableCell className="text-nowrap">{row.branchName || "-"}</TableCell>
                        <TableCell className="text-nowrap">{row.roomNumber || "-"}</TableCell>
                        <TableCell className="text-nowrap">{row.cotNumber || "-"}</TableCell>
                        <TableCell className="text-nowrap">{row.cotTypeName || "-"}</TableCell>
                        <TableCell className="text-nowrap">{row.roomRent || row.rentAmount || "-"}</TableCell>
                        {(type !== 'available' && type !== 'maintenance') && <TableCell className="text-nowrap">{row.status || "-"}</TableCell>}
                      </TableRow>
                    ))
                  : !loading && (
                    <TableRow>
                      <TableCell className="fs-3 text-muted" align="center" colSpan={11}>Data Not Found</TableCell>
                    </TableRow>
                  )}
                <SkeletonProviderTables columns={11} visible={loading} />
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
              <TextField
                size="small"
                fullWidth
                className="bg-white py-0"
                value={_search}
                onChange={(e: any) => _setSearch(e.target.value)}
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
