import { Drawer } from "@mui/material";
import { useState } from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import { ROUTES } from "../../configs/constants";
import { IMAGES_ICON } from "../../assets/images/exportImages";
import { CustomAbsoluteBox } from "../helpers/CustomAbsoluteBox";
import { useStateValue } from "../../providers/StateProvider";

export function DashboardNewHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [{ user }, dispatch]: any = useStateValue();
  const [_drawer, _setDrawer] = useState(false);
  const [_admissionPopup, _setAdmissionPopup] = useState(false);
  const [_admissionMobPopup, _setAdmissionMobPopup] = useState(false);
  const [_masterPopup, _setMasterPopup] = useState(false);
  const [_masterMobPopup, _setMasterMobPopup] = useState(false);
  const [_userPopup, _setUserPopup] = useState(false);
  const [_userMobPopup, _setUserMobPopup] = useState(false);
  const [_menuPopup, _setMenuPopup] = useState(false);

  const isMasterActive = [
    ROUTES.HOME.MASTER.AMENITIES_CATEGORIES,
    ROUTES.HOME.MASTER.AMENITIES_SUB_CATEGORIES,
    ROUTES.HOME.MASTER.AMENITIES_FACILITIES,
    ROUTES.HOME.MASTER.ROOM_TYPE,
    ROUTES.HOME.MASTER.BATHROOM_TYPE,
    ROUTES.HOME.MASTER.COT_TYPE,
    ROUTES.HOME.MASTER.SHARING_TYPE,
    ROUTES.HOME.MASTER.ISSUE_CATEGORIES,
    ROUTES.HOME.MASTER.ISSUE_SUB_CATEGORIES,
    ROUTES.HOME.MASTER.PAGE_LIST,
    ROUTES.HOME.MASTER.MASTER_USER_ROLE,
    ROUTES.HOME.MASTER.SERVICE_PROVIDER_CATEGORY,
  ].includes(location.pathname);

  const isUserActive = [ROUTES.HOME.USER.LIST, ROUTES.HOME.USER.ROLE, ROUTES.HOME.USER.SERVICE_PROVIDER].includes(
    location.pathname
  );

  const isAdmissionActive = [
    ROUTES.HOME.ADMISSION.LIST,
    ROUTES.HOME.ADMISSION.CONFIRMATION,
    ROUTES.HOME.ADMISSION.TRANSFER,
  ].includes(location.pathname);

  const handleLogout = () => {
    localStorage.clear();
    dispatch({
      type: "SET_USER",
      user: null,
    });
    navigate(ROUTES.AUTH.LOGIN);
  };

  return (
    <>
      <div className="bg-gray py-3 no-select">
        <div className="px-3">
          <div className="container">
            <div className="d-flex justify-content-between align-items-center flex-wrap">
              <div className="my-2 rounded h-100" role="button" onClick={() => navigate(ROUTES.HOME.DASHBOARD)}>
                <img className="" height={40} src={IMAGES_ICON.HeaderLogo} alt="icon" draggable="false" />
              </div>
              <div className="d-none d-lg-block col-md-8 flex-grow-1 px-3">
                <div className="my-2 bg-primary rounded h-100 px-3 pt-2 pb-4">
                  <div className="d-flex flex-wrap justify-content-between align-items-center text-center">
                    <NavLink to={ROUTES.HOME.DASHBOARD} className="mx-2 nav-link">
                      <img height={20} src={IMAGES_ICON.DashboardIcon} alt="Icon" draggable="false" loading="lazy" />
                      <div className="mt-1">Dashboard</div>
                    </NavLink>
                    <NavLink to={ROUTES.HOME.COMPLAINTS} className="mx-2 nav-link">
                      <img height={20} src={IMAGES_ICON.ComplaintsIcon} alt="Icon" draggable="false" loading="lazy" />
                      <div className="mt-1">Complaint</div>
                    </NavLink>
                    <div className="mx-2 position-relative">
                      <div className={`nav-link ${isAdmissionActive ? "active" : ""}`} role="button" onClick={() => _setAdmissionPopup(true)} >
                        <img height={20} src={IMAGES_ICON.AdmissionIcon} alt="Icon" draggable="false" loading="lazy" />
                        <div className="mt-1">Admission</div>
                      </div>
                      {_admissionPopup && (
                        <CustomAbsoluteBox onClose={() => _setAdmissionPopup(false)}>
                          <div className="position-relative">
                            <div className="position-absolute bg-white shadow rounded"
                              style={{ zIndex: "9999", width: "185px", top: "6px", overflowY: "auto", maxHeight: "200px", }}>
                              <div className="text-start">
                                {[
                                  { label: "Admission List", path: ROUTES.HOME.ADMISSION.LIST },
                                  { label: "Admission Confirmation", path: ROUTES.HOME.ADMISSION.CONFIRMATION },
                                  { label: "Admission Transfer", path: ROUTES.HOME.ADMISSION.TRANSFER },
                                  { label: "Candidate Payments", path: ROUTES.HOME.ADMISSION.PAYMENTS },
                                  { label: "EB Charges", path: ROUTES.HOME.ADMISSION.EB_CHARGES },
                                ]?.map((mItem: any) => <div key={mItem?.label} className="text-truncate px-2 py-1 subMenu" role="button"
                                  onClick={() => { _setAdmissionPopup(false); navigate(mItem?.path); }}>{mItem?.label}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CustomAbsoluteBox>
                      )}
                    </div>
                    <NavLink to={ROUTES.HOME.VACATE} className="mx-2 nav-link">
                      <img height={20} src={IMAGES_ICON.VacateIcon} alt="Icon" draggable="false" loading="lazy" />
                      <div className="mt-1">Vacate</div>
                    </NavLink>
                    {/* <NavLink to={ROUTES.HOME.ATTENDANCE} className="mx-2 nav-link">
                      <img height={20} src={IMAGES_ICON.AttendanceIcon} alt="Icon" draggable="false" loading="lazy" />
                      <div className="mt-1">Attendance</div>
                    </NavLink> */}
                    <NavLink to={ROUTES.HOME.BRANCH} className="mx-2 nav-link">
                      <img height={20} src={IMAGES_ICON.BranchIcon} alt="Icon" draggable="false" loading="lazy" />
                      <div className="mt-1">Branch</div>
                    </NavLink>
                    <NavLink to={ROUTES.HOME.BLACKLIST} className="mx-2 nav-link">
                      <img height={20} src={IMAGES_ICON.BlockListIcon} alt="Icon" draggable="false" loading="lazy" />
                      <div className="mt-1">Black List</div>
                    </NavLink>
                    <NavLink to={ROUTES.HOME.FEEDBACK} className="mx-2 nav-link">
                      <img height={20} src={IMAGES_ICON.FeedbackIcon} alt="Icon" draggable="false" loading="lazy" />
                      <div className="mt-1">Feedback</div>
                    </NavLink>
                    {/* <NavLink to={ROUTES.HOME.ROOMS} className="mx-2 nav-link" >
                      <img height={20} src={IMAGES_ICON.RoomsIcon} alt="Icon" draggable="false" loading="lazy" />
                      <div className="mt-1">Rooms</div>
                    </NavLink> */}
                    <div className="mx-2 position-relative">
                      <div className={`nav-link ${isMasterActive ? "active" : ""}`} role="button" onClick={() => _setMasterPopup(true)} >
                        <img height={20} src={IMAGES_ICON.MasterIcon} alt="Icon" draggable="false" loading="lazy" />
                        <div className="mt-1">Master</div>
                      </div>
                      {_masterPopup && (
                        <CustomAbsoluteBox onClose={() => _setMasterPopup(false)}>
                          <div className="position-relative">
                            <div className="position-absolute bg-white shadow rounded"
                              style={{ zIndex: "9999", width: "185px", top: "6px", overflowY: "auto", maxHeight: "200px", }}>
                              <div className="text-start">
                                {[
                                  { label: "Amenities Categories", path: ROUTES.HOME.MASTER.AMENITIES_CATEGORIES },
                                  { label: "Amenities Sub-Categories", path: ROUTES.HOME.MASTER.AMENITIES_SUB_CATEGORIES },
                                  { label: "Amenities Facilities", path: ROUTES.HOME.MASTER.AMENITIES_FACILITIES },
                                  { label: "Room Type", path: ROUTES.HOME.MASTER.ROOM_TYPE },
                                  { label: "Bathroom Type", path: ROUTES.HOME.MASTER.BATHROOM_TYPE },
                                  { label: "Cot Type", path: ROUTES.HOME.MASTER.COT_TYPE },
                                  { label: "Sharing Type", path: ROUTES.HOME.MASTER.SHARING_TYPE },
                                  { label: "Issue Categories", path: ROUTES.HOME.MASTER.ISSUE_CATEGORIES },
                                  { label: "Issue Sub-Categories", path: ROUTES.HOME.MASTER.ISSUE_SUB_CATEGORIES },
                                  { label: "Page List", path: ROUTES.HOME.MASTER.PAGE_LIST },
                                  { label: "User Role", path: ROUTES.HOME.MASTER.MASTER_USER_ROLE },
                                  { label: "Service Provider Category", path: ROUTES.HOME.MASTER.SERVICE_PROVIDER_CATEGORY },
                                  { label: "Bulk Upload", path: ROUTES.HOME.MASTER.BULK_UPLOAD },
                                ]?.map((mItem: any) => <div key={mItem?.label} className="text-truncate px-2 py-1 subMenu" role="button"
                                  onClick={() => { _setMasterPopup(false); navigate(mItem?.path); }}>{mItem?.label}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CustomAbsoluteBox>
                      )}
                    </div>
                    <div className="mx-2 position-relative">
                      <div className={`nav-link ${isUserActive ? "active" : ""}`} role="button" onClick={() => _setUserPopup(true)}>
                        <img height={20} src={IMAGES_ICON.UserIcon} alt="Icon" draggable="false" loading="lazy" />
                        <div className="mt-1">User</div>
                      </div>
                      {_userPopup && (
                        <CustomAbsoluteBox onClose={() => _setUserPopup(false)}>
                          <div className="position-relative">
                            <div className="position-absolute bg-white shadow rounded"
                              style={{ zIndex: "9999", width: "185px", top: "6px", overflowY: "auto", maxHeight: "200px", }}>
                              <div className="text-start">
                                {[
                                  { label: "Page Access by Role", path: ROUTES.HOME.USER.ROLE },
                                  { label: "User List", path: ROUTES.HOME.USER.LIST },
                                  { label: "Service Provider", path: ROUTES.HOME.USER.SERVICE_PROVIDER },
                                ]?.map((mItem: any) => <div key={mItem?.label} className="text-truncate px-2 py-1 subMenu" role="button"
                                  onClick={() => { _setUserPopup(false); navigate(mItem?.path); }}>{mItem?.label}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CustomAbsoluteBox>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="d-none d-lg-block">
                <div className="my-2 bg-white rounded p-3 d-flex justify-content-end align-items-center gap-3">
                  <div className="d-flex align-items-center">
                    <img height={40} src={user?.profilePic ? (ROUTES.API.DOWNLOAD_FILE + user?.profilePic) : IMAGES_ICON.ProfilePic} alt="icon" draggable="false" className="rounded-circle" />
                    <div className="">
                      <div className="">{user?.firstName}</div>
                      <div className="fs14">Admin</div>
                    </div>
                    <img height={30} src={IMAGES_ICON.MoreIcon} alt="icon" draggable="false" role="button" onClick={() => _setMenuPopup(true)} />
                  </div>
                  {_menuPopup && (
                    <CustomAbsoluteBox onClose={() => _setMenuPopup(false)}>
                      <div className="position-relative">
                        <div className="position-absolute bg-white shadow rounded"
                          style={{ zIndex: "9999", width: "185px", left: "-128px", top: "16px", }}>
                          <div className="text-start">
                            <div className="p-1 px-2 subMenu rounded" role="button" onClick={handleLogout}>Logout</div>
                          </div>
                        </div>
                      </div>
                    </CustomAbsoluteBox>
                  )}
                  <div className="d-block d-lg-none">
                    <img height={30} src={IMAGES_ICON.MenuIcon} alt="icon" draggable="false" role="button" onClick={() => _setDrawer(true)} />
                  </div>
                </div>
              </div>
              <div className="d-block d-lg-none">
                <img height={30} src={IMAGES_ICON.MenuIcon} alt="icon" draggable="false" role="button" onClick={() => _setDrawer(true)} />
              </div>
            </div>
          </div>
        </div>
      </div >
      <Drawer anchor={"top"} open={_drawer} onClose={() => _setDrawer(false)} PaperProps={{ sx: { width: "100%", zIndex: "99999" } }} disableScrollLock={true}
        disableEnforceFocus={true}>
        <div className="d-flex flex-column justify-content-between h-100" style={{ background: "#FFF7E9" }}>
          <div className="">
            <div className="d-flex justify-content-between align-items-center p-3">
              <img className="" src={IMAGES_ICON.HeaderLogo} alt="icon" draggable="false" onClick={() => navigate(ROUTES.HOME.DASHBOARD)} />
              <img className="" src={IMAGES_ICON.CloseIcon} alt="icon" draggable="false" onClick={() => _setDrawer(false)} />
            </div>
            <div className="p-3 h-100" style={{ overflowY: "auto" }}>
              <div className="row">
                <NavLink className="mob-nav-link text-dark text-decoration-none py-3 gap-3 borderBottomDark d-flex align-items-center"
                  to={ROUTES.HOME.DASHBOARD} onClick={() => _setDrawer(false)}>
                  <img className="filterDark" height={20} src={IMAGES_ICON.DashboardIcon} alt="Icon" draggable="false" loading="lazy" />
                  <span className="text-truncate" title="Home">Home</span>
                </NavLink>
                <NavLink className="mob-nav-link text-dark text-decoration-none py-3 gap-3 borderBottomDark d-flex align-items-center"
                  to={ROUTES.HOME.COMPLAINTS} onClick={() => _setDrawer(false)}>
                  <img className="filterDark" height={20} src={IMAGES_ICON.ComplaintsIcon} alt="Icon" draggable="false" loading="lazy" />
                  <span className="text-truncate">Complaint</span>
                </NavLink>
                <div className="position-relative borderBottomDark">
                  <div className={`mob-nav-link py-3 gap-3 ${isAdmissionActive ? "active" : ""} d-flex align-items-center`}
                    role="button" onClick={() => _setAdmissionMobPopup(true)}>
                    <img className="filterDark" height={20} src={IMAGES_ICON.UserIcon} alt="Icon" draggable="false" loading="lazy" />
                    <div className="text-truncate">User</div>
                  </div>
                  {_admissionMobPopup && (
                    <CustomAbsoluteBox onClose={() => _setAdmissionMobPopup(false)}>
                      <div className="position-relative">
                        <div className="position-absolute bg-white shadow rounded"
                          style={{ zIndex: "9999", width: "100%", top: "6px", overflowY: "auto", maxHeight: "200px", }}>
                          <div className="text-start">
                            {[
                              { label: "Admission List", path: ROUTES.HOME.ADMISSION.LIST },
                              { label: "Admission Confirmation", path: ROUTES.HOME.ADMISSION.CONFIRMATION },
                              { label: "Admission Transfer", path: ROUTES.HOME.ADMISSION.TRANSFER },
                              { label: "Candidate Payments", path: ROUTES.HOME.ADMISSION.PAYMENTS },
                            ]?.map((mItem: any) => <div className="text-truncate px-2 py-1 subMenu" role="button"
                              onClick={() => { _setDrawer(false); _setAdmissionMobPopup(false); navigate(mItem?.path); }}>{mItem?.label}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CustomAbsoluteBox>
                  )}
                </div>
                <NavLink className="mob-nav-link text-dark text-decoration-none py-3 gap-3 borderBottomDark d-flex align-items-center"
                  to={ROUTES.HOME.VACATE} onClick={() => _setDrawer(false)}>
                  <img className="filterDark" height={20} src={IMAGES_ICON.VacateIcon} alt="Icon" draggable="false" loading="lazy" />
                  <span className="text-truncate">Vacate</span>
                </NavLink>
                <NavLink className="mob-nav-link text-dark text-decoration-none py-3 gap-3 borderBottomDark d-flex align-items-center"
                  to={ROUTES.HOME.BRANCH} onClick={() => _setDrawer(false)}>
                  <img className="filterDark" height={20} src={IMAGES_ICON.BranchIcon} alt="Icon" draggable="false" loading="lazy" />
                  <span className="text-truncate">Branch</span>
                </NavLink>
                <NavLink className="mob-nav-link text-dark text-decoration-none py-3 gap-3 borderBottomDark d-flex align-items-center"
                  to={ROUTES.HOME.BLACKLIST} onClick={() => _setDrawer(false)}>
                  <img className="filterDark" height={20} src={IMAGES_ICON.BlockListIcon} alt="Icon" draggable="false" loading="lazy" />
                  <span className="text-truncate">Black List</span>
                </NavLink>
                <NavLink className="mob-nav-link text-dark text-decoration-none py-3 gap-3 borderBottomDark d-flex align-items-center"
                  to={ROUTES.HOME.FEEDBACK} onClick={() => _setDrawer(false)}>
                  <img className="filterDark" height={20} src={IMAGES_ICON.FeedbackIcon} alt="Icon" draggable="false" loading="lazy" />
                  <span className="text-truncate">Feedback</span>
                </NavLink>
                <div className="position-relative borderBottomDark">
                  <div className={`mob-nav-link py-3 gap-3 ${isMasterActive ? "active" : ""} d-flex align-items-center`}
                    role="button" onClick={() => _setMasterMobPopup(true)}>
                    <img className="filterDark" height={20} src={IMAGES_ICON.MasterIcon} alt="Icon" draggable="false" loading="lazy" />
                    <div className="text-truncate">Master</div>
                  </div>
                  {_masterMobPopup && (
                    <CustomAbsoluteBox onClose={() => _setMasterMobPopup(false)}>
                      <div className="position-relative">
                        <div className="bg-white shadow rounded"
                          style={{
                            position: "absolute", zIndex: 9999, width: "100%", top: "6px", overflowY: "auto", maxHeight: "200px",
                          }}>
                          <div className="text-start">
                            {[
                              { label: "Amenities Categories", path: ROUTES.HOME.MASTER.AMENITIES_CATEGORIES },
                              { label: "Amenities Sub-Categories", path: ROUTES.HOME.MASTER.AMENITIES_SUB_CATEGORIES },
                              { label: "Amenities Facilities", path: ROUTES.HOME.MASTER.AMENITIES_FACILITIES },
                              { label: "Room Type", path: ROUTES.HOME.MASTER.ROOM_TYPE },
                              { label: "Bathroom Type", path: ROUTES.HOME.MASTER.BATHROOM_TYPE },
                              { label: "Cot Type", path: ROUTES.HOME.MASTER.COT_TYPE },
                              { label: "Sharing Type", path: ROUTES.HOME.MASTER.SHARING_TYPE },
                              { label: "Issue Categories", path: ROUTES.HOME.MASTER.ISSUE_CATEGORIES },
                              { label: "Issue Sub-Categories", path: ROUTES.HOME.MASTER.ISSUE_SUB_CATEGORIES },
                              { label: "Page List", path: ROUTES.HOME.MASTER.PAGE_LIST },
                              { label: "User Role", path: ROUTES.HOME.MASTER.MASTER_USER_ROLE },
                              { label: "Service Provider Category", path: ROUTES.HOME.MASTER.SERVICE_PROVIDER_CATEGORY },
                            ]?.map((mItem: any, mIndex: number) =>
                              <div key={mIndex} className="text-truncate px-2 py-1 subMenu" role="button"
                                onClick={(e) => { e.stopPropagation(); navigate(mItem?.path); _setDrawer(false); _setMasterMobPopup(false) }}>{mItem?.label}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CustomAbsoluteBox>
                  )}
                </div>
                <div className="position-relative borderBottomDark">
                  <div className={`mob-nav-link py-3 gap-3 ${isUserActive ? "active" : ""} d-flex align-items-center`}
                    role="button" onClick={() => _setUserMobPopup(true)}>
                    <img className="filterDark" height={20} src={IMAGES_ICON.UserIcon} alt="Icon" draggable="false" loading="lazy" />
                    <div className="text-truncate">User</div>
                  </div>
                  {_userMobPopup && (
                    <CustomAbsoluteBox onClose={() => _setUserMobPopup(false)}>
                      <div className="position-relative">
                        <div className="position-absolute bg-white shadow rounded"
                          style={{ zIndex: "9999", width: "100%", top: "6px", overflowY: "auto", maxHeight: "200px", }}>
                          <div className="text-start">
                            {[
                              { label: "Role", path: ROUTES.HOME.USER.ROLE },
                              { label: "User List", path: ROUTES.HOME.USER.LIST },
                              { label: "Service Provider", path: ROUTES.HOME.USER.SERVICE_PROVIDER },
                            ]?.map((mItem: any) => <div className="text-truncate px-2 py-1 subMenu" role="button"
                              onClick={() => { _setDrawer(false); _setUserMobPopup(false); navigate(mItem?.path); }}>{mItem?.label}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CustomAbsoluteBox>
                  )}
                </div>
                <div className="position-relative">
                  <div className={`mob-nav-link py-3 gap-3 ${isUserActive ? "active" : ""} d-flex align-items-center`}
                    role="button" onClick={handleLogout}>
                    <img className="filterDark" height={20} src={IMAGES_ICON.VacateIcon} alt="Icon" draggable="false" loading="lazy" />
                    <div className="text-truncate">Logout</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="">
              {/* <img className='' height={400} src={IMAGES_ICON.FooterImage} alt="logo" draggable={false} /> */}
            </div>
            {/* <div className="my-2">© {new Date().getFullYear()} All rights reserved</div> */}
          </div>
        </div>
      </Drawer>

    </>
  );
}
