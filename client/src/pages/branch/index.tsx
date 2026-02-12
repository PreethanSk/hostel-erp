import { useEffect, useState } from "react";
import {
  Button,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { KeyboardArrowRightRounded } from "@mui/icons-material";
import CustomSearch from "../../components/helpers/CustomSearch";
import { IMAGES_ICON } from "../../assets/images/exportImages";
import { SkeletonProviderTables } from "../../providers/SkeletonProvider";
import { CustomAlert, customTableHeader, customTableTemplate } from "../../services/HelperService";
import { getBranchGridList } from "../../models";
import BranchDetails from "./components/branchDetails.tsx";
import RoomsAndCots from "./components/roomsAndCots.tsx";
import BranchPhotos from "./components/branchPhotos.tsx";
import BranchAmenities from "./components/branchAmenities.tsx";

type BranchItem = {
  id: number;
  branchName: string;
  branchCode?: string;
  contactPerson?: string;
  branchAddress?: string;
  numberOfRooms?: number;
  numberOfCots?: number;
  mobileNumber?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  isActive?: boolean;
  notes?: string;
};

type BranchTab = "details" | "rooms" | "photos" | "amenities";

export default function Branch({ PageAccess }: any) {
  const [_tableItems, _setTableItems] = useState<BranchItem[]>([]);
  const [_tableLoading, _setTableLoading] = useState(true);
  const [_search, _setSearch] = useState("");
  const [_selectedBranch, _setSelectedBranch] = useState<BranchItem | null>(null);
  const [_selectedTab, _setSelectedTab] = useState<BranchTab>("details");

  const getGridList = () => {
    _setTableLoading(true);
    getBranchGridList(1, 0)
      .then((resp: any) => {
        if (resp?.data?.status === "success") {
          const result = resp?.data?.result;
          _setTableItems(result?.results || []);
          if (!_selectedBranch && result?.results?.length) {
            _setSelectedBranch(result.results[0]);
          }
        } else {
          CustomAlert("warning", resp?.data?.error || "Failed to fetch branches");
        }
      })
      .catch((err: any) => {
        console.log(err);
        CustomAlert("warning", "Unable to load branches");
      })
      .finally(() => _setTableLoading(false));
  };

  useEffect(() => {
    getGridList();
  }, []);

  const handleTabChange = (_e: any, value: BranchTab) => {
    _setSelectedTab(value);
  };

  const handleSelectBranch = (item: BranchItem) => {
    _setSelectedBranch(item);
  };

  const handleCreateBranch = () => {
    _setSelectedBranch({
      id: 0,
      branchName: "",
      branchCode: "",
      contactPerson: "",
      branchAddress: "",
      numberOfRooms: 0,
      numberOfCots: 0,
      mobileNumber: "",
      city: "",
      state: "",
      country: "",
      pincode: "",
      isActive: true,
      notes: "",
    });
    _setSelectedTab("details");
  };

  const handleBranchSaved = (updated: BranchItem | null) => {
    // Refresh grid and optionally keep selection
    getGridList();
    if (updated) {
      _setSelectedBranch(updated);
    }
  };

  const filteredItems = _tableItems?.filter((content: any) => {
    const lowerSearchInput = _search?.toLowerCase()?.trim();
    if (!lowerSearchInput) return true;
    return Object?.values(content || {})?.some((value: any) =>
      value?.toString()?.toLowerCase()?.includes(lowerSearchInput)
    );
  });

  return (
    <div className="container-fluid py-3">
      <div className="container">
        <div className="row justify-content-between align-items-center py-3">
          <div className="col-md-5 my-2">
            <div className="d-flex align-items-center gap-2 mobJustify">
              <span className="text-dark fw-bold">Branch </span>
              <span className="text-dark">
                <KeyboardArrowRightRounded />
              </span>
              <span className="text-muted">Branch List</span>
            </div>
          </div>
          <div className="my-2 col-md-7">
            <div className="d-flex justify-content-end align-items-center gap-4 mobJustify">
              {PageAccess !== "ReadOnly" && (
                <Button
                  className="text-capitalize"
                  sx={{ color: "black" }}
                  startIcon={<img height={18} draggable={false} src={IMAGES_ICON.TableNewItemIcon} />}
                  onClick={handleCreateBranch}
                >
                  Add New Branch
                </Button>
              )}
              <CustomSearch getSearchText={(value: string) => _setSearch(value)} />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-7 mb-3">
            <TableContainer className="tableBorder rounded">
              <Table sx={{ ...customTableTemplate }}>
                <TableHead>
                  <TableRow sx={{ ...customTableHeader }}>
                    <TableCell className="fw-bold">S.No</TableCell>
                    <TableCell className="fw-bold">Branch</TableCell>
                    <TableCell className="fw-bold">City</TableCell>
                    <TableCell className="fw-bold">Mobile</TableCell>
                    <TableCell className="fw-bold" align="center">
                      Rooms
                    </TableCell>
                    <TableCell className="fw-bold" align="center">
                      Cots
                    </TableCell>
                    <TableCell className="fw-bold" align="center">
                      Status
                    </TableCell>
                    <TableCell className="fw-bold" align="center">
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredItems?.length > 0 ? (
                    filteredItems?.map((item: BranchItem, index: number) => {
                      const isSelected = _selectedBranch?.id === item.id;
                      return (
                        <TableRow
                          key={item.id}
                          hover
                          selected={isSelected}
                          role="button"
                          onClick={() => handleSelectBranch(item)}
                        >
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="text-nowrap">
                            <div className="fw-bold">{item?.branchName}</div>
                            {item?.branchAddress && (
                              <div className="fs12 text-muted text-truncate" title={item?.branchAddress}>
                                {item?.branchAddress}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-nowrap">{item?.city}</TableCell>
                          <TableCell className="text-nowrap">{item?.mobileNumber}</TableCell>
                          <TableCell align="center">{item?.numberOfRooms || 0}</TableCell>
                          <TableCell align="center">{item?.numberOfCots || 0}</TableCell>
                          <TableCell align="center">
                            {item?.isActive ? (
                              <span className="fs12 statusBgActive text-success rounded--50 px-3 py-1">Active</span>
                            ) : (
                              <span className="fs12 statusBgInactive text-danger rounded--50 px-3 py-1">Inactive</span>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <div className="d-flex align-items-center justify-content-center gap-2">
                              <div
                                className="d-flex align-items-center justify-content-center gap-1"
                                role="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectBranch(item);
                                  _setSelectedTab("details");
                                }}
                              >
                                <span className="">Manage</span>
                                <img height="16" src={IMAGES_ICON.EditIcon} alt="icon" draggable="false" />
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : !_tableLoading ? (
                    <TableRow>
                      <TableCell align="center" colSpan={8}>
                        <h3 className="text-muted">Data Not Found</h3>
                      </TableCell>
                    </TableRow>
                  ) : null}
                  <SkeletonProviderTables columns={8} visible={_tableLoading} />
                </TableBody>
              </Table>
            </TableContainer>
          </div>

          <div className="col-lg-5 mb-3">
            {_selectedBranch ? (
              <div className="bg-field-gray border rounded h-100 d-flex flex-column">
                <div className="px-3 pt-2 pb-0 borderBottomLight">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="fw-bold text-dark">
                        {_selectedBranch?.branchName || "New Branch"}
                      </div>
                      {_selectedBranch?.city && (
                        <div className="fs12 text-muted">
                          {_selectedBranch?.city}
                          {_selectedBranch?.state ? `, ${_selectedBranch?.state}` : ""}
                          {_selectedBranch?.country ? `, ${_selectedBranch?.country}` : ""}
                        </div>
                      )}
                    </div>
                    {_selectedBranch?.mobileNumber && (
                      <div className="fs12 text-muted text-end">
                        <div>Mobile</div>
                        <div className="fw-bold">{_selectedBranch?.mobileNumber}</div>
                      </div>
                    )}
                  </div>
                  <Tabs
                    value={_selectedTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    allowScrollButtonsMobile
                    sx={{ mt: 1 }}
                  >
                    <Tab value="details" label="Branch Details" />
                    <Tab value="rooms" label="Rooms & Cots" />
                    <Tab value="photos" label="Photos" />
                    <Tab value="amenities" label="Amenities" />
                  </Tabs>
                </div>
                <div className="flex-grow-1 p-3" style={{ overflowY: "auto", maxHeight: "72vh" }}>
                  {_selectedTab === "details" && (
                    <BranchDetails
                      branch={_selectedBranch}
                      onSaved={handleBranchSaved}
                      readOnly={PageAccess === "ReadOnly"}
                    />
                  )}
                  {_selectedTab === "rooms" && (
                    <RoomsAndCots
                      branch={_selectedBranch}
                      readOnly={PageAccess === "ReadOnly"}
                    />
                  )}
                  {_selectedTab === "photos" && (
                    <BranchPhotos
                      branch={_selectedBranch}
                      onUpdated={handleBranchSaved}
                      readOnly={PageAccess === "ReadOnly"}
                    />
                  )}
                  {_selectedTab === "amenities" && (
                    <BranchAmenities
                      branch={_selectedBranch}
                      readOnly={PageAccess === "ReadOnly"}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="h-100 d-flex align-items-center justify-content-center text-muted">
                Select a branch from the list or add a new branch to manage details.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
