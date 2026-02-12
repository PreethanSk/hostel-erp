import { useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { KeyboardArrowRightRounded } from "@mui/icons-material";
import {
  CustomAlert,
  customTableHeader,
  customTableTemplate,
} from "../../services/HelperService";
import {
  getMasterPageList,
  getMasterUserRole,
  getRolePageAccessByRoleId,
  insertUpdateUserRolePageAccess,
} from "../../models";
import { IMAGES_ICON } from "../../assets/images/exportImages";
import CustomSearch from "../../components/helpers/CustomSearch";

type Props = {
  PageAccess: string;
};

type RoleItem = {
  id: number;
  roleName: string;
  isActive?: boolean;
};

type PageItem = {
  id?: number;
  pageId: number;
  pageName: string;
  pageUrl?: string;
  accessLevel: "Full" | "ReadOnly" | "No";
  isActive: boolean;
};

export default function UserRole({ PageAccess }: Props) {
  const [_roleList, _setRoleList] = useState<RoleItem[]>([]);
  const [_pageMaster, _setPageMaster] = useState<PageItem[]>([]);
  const [_pages, _setPages] = useState<PageItem[]>([]);
  const [_roleId, _setRoleId] = useState<string>("");
  const [_loading, _setLoading] = useState(false);
  const [_search, _setSearch] = useState("");

  const loadRolesAndPages = () => {
    getMasterUserRole()
      .then((resp) => {
        if (resp?.data?.status === "success") {
          _setRoleList(resp?.data?.result || []);
        }
      })
      .catch(console.log);

    getMasterPageList()
      .then((resp) => {
        if (resp?.data?.status === "success") {
          const list = (resp?.data?.result || [])?.map((item: any) => ({
            id: undefined,
            pageId: item?.id,
            pageName: item?.pageName,
            pageUrl: item?.pageUrl,
            accessLevel: "No" as const,
            isActive: true,
          }));
          _setPageMaster(list);
        }
      })
      .catch(console.log);
  };

  const loadRoleAccess = (roleId: string) => {
    if (!roleId) {
      _setPages([]);
      return;
    }
    if (!_pageMaster?.length) return;

    _setLoading(true);
    getRolePageAccessByRoleId(Number(roleId))
      .then((resp) => {
        if (resp?.data?.status === "success") {
          const existing: any[] = resp?.data?.result || [];
          const mapped = _pageMaster.map((page) => {
            const found = existing.find(
              (p: any) => p.pageId === page.pageId || p.pageId === page.id
            );
            if (found) {
              return {
                id: found.id,
                pageId: found.pageId,
                pageName: found.pageName || page.pageName,
                pageUrl: found.pageUrl || page.pageUrl,
                accessLevel: (found.accessLevel || "No") as
                  | "Full"
                  | "ReadOnly"
                  | "No",
                isActive:
                  typeof found.isActive === "boolean" ? found.isActive : true,
              };
            }
            return { ...page };
          });
          _setPages(mapped);
        } else {
          CustomAlert("warning", resp?.data?.error || "Unable to load page access");
        }
      })
      .catch((err) => {
        console.log(err);
        CustomAlert("warning", "Unable to load page access");
      })
      .finally(() => _setLoading(false));
  };

  const handleChangeAccess = (
    pageId: number,
    level: "Full" | "ReadOnly" | "No"
  ) => {
    if (PageAccess === "ReadOnly") return;
    const updated = _pages.map((item) =>
      item.pageId === pageId ? { ...item, accessLevel: level, isActive: true } : item
    );
    _setPages(updated);
  };

  const handleSave = () => {
    if (!_roleId) {
      CustomAlert("warning", "Select a role");
      return;
    }
    if (!_pages?.length) {
      CustomAlert("warning", "No pages to update");
      return;
    }

    _setLoading(true);
    const payload = {
      pages: _pages.map((p) => ({
        id: p.id || undefined,
        roleId: Number(_roleId),
        pageId: p.pageId,
        accessLevel: p.accessLevel,
        isActive: p.isActive,
      })),
    };

    insertUpdateUserRolePageAccess(payload)
      .then((resp) => {
        if (resp?.data?.status === "success") {
          CustomAlert("success", "Page access updated");
          loadRoleAccess(_roleId);
        } else {
          CustomAlert("warning", resp?.data?.error || "Failed to update access");
        }
      })
      .catch((err) => {
        console.log(err);
        CustomAlert("error", "Error updating access");
      })
      .finally(() => _setLoading(false));
  };

  const handleChangeRole = (value: string) => {
    _setRoleId(value);
    _setSearch("");
    if (value) {
      loadRoleAccess(value);
    } else {
      _setPages([]);
    }
  };

  const filteredPages = _pages?.filter((content: any) => {
    const lowerSearchInput = _search?.toLowerCase()?.trim();
    if (!lowerSearchInput) return true;
    return Object?.values(content || {})?.some((value: any) =>
      value?.toString()?.toLowerCase()?.includes(lowerSearchInput)
    );
  });

  useEffect(() => {
    loadRolesAndPages();
  }, []);

  useEffect(() => {
    if (_roleId && _pageMaster?.length) {
      loadRoleAccess(_roleId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_pageMaster]);

  return (
    <div className="container">
      <div className="row justify-content-between align-items-center py-3">
        <div className="col-md-4 my-2 d-flex align-items-center gap-1">
          <span className="text-dark fw-bold">User </span>
          <span className="text-dark">
            <KeyboardArrowRightRounded />
          </span>
          <span className="text-muted">Page Access</span>
        </div>
        <div className="col-md-6 my-2 d-flex justify-content-end align-items-center gap-4">
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={_roleId}
              onChange={(e: any) => handleChangeRole(e.target.value)}
              displayEmpty
              style={{ backgroundColor: "#F3F3F3" }}
            >
              <MenuItem value="">
                <span className="text-muted fs14">Select Role</span>
              </MenuItem>
              {_roleList
                ?.filter((r) => r.isActive ?? true)
                ?.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.roleName}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <CustomSearch
            getSearchText={(value: string) => {
              _setSearch(value);
            }}
          />
          {PageAccess === "Write" && (
            <Button
              className="text-capitalize"
              variant="contained"
              color="primary"
              disabled={_loading || !_roleId}
              onClick={handleSave}
            >
              Save
            </Button>
          )}
        </div>
      </div>

      <TableContainer className="tableBorder rounded">
        <Table sx={{ ...customTableTemplate }}>
          <TableHead>
            <TableRow sx={{ ...customTableHeader }}>
              <TableCell className="fw-bold">S.No</TableCell>
              <TableCell className="fw-bold">Page</TableCell>
              <TableCell className="fw-bold" align="center">
                Full Access
              </TableCell>
              <TableCell className="fw-bold" align="center">
                Read Only
              </TableCell>
              <TableCell className="fw-bold" align="center">
                No Access
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPages?.length > 0 ? (
              filteredPages?.map((item: PageItem, index: number) => (
                <TableRow key={item.pageId || index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="text-nowrap">
                    {item.pageName || "-"}
                  </TableCell>
                  <TableCell align="center">
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={item.accessLevel === "Full"}
                          onChange={() => handleChangeAccess(item.pageId, "Full")}
                          disabled={PageAccess === "ReadOnly" || !_roleId}
                        />
                      }
                      label=""
                    />
                  </TableCell>
                  <TableCell align="center">
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={item.accessLevel === "ReadOnly"}
                          onChange={() =>
                            handleChangeAccess(item.pageId, "ReadOnly")
                          }
                          disabled={PageAccess === "ReadOnly" || !_roleId}
                        />
                      }
                      label=""
                    />
                  </TableCell>
                  <TableCell align="center">
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={item.accessLevel === "No"}
                          onChange={() => handleChangeAccess(item.pageId, "No")}
                          disabled={PageAccess === "ReadOnly" || !_roleId}
                        />
                      }
                      label=""
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="fs-3 text-muted"
                  align="center"
                  colSpan={5}
                >
                  {_roleId ? "Pages not found" : "Select a role to view pages"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
