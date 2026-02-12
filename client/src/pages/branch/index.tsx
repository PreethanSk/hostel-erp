import { useEffect, useState } from "react";
import { Button, Table, TableBody, TableCell, TableHead, TableRow, Box, MenuItem, Pagination, PaginationItem, Tabs, Tab, LinearProgress, TableContainer } from '@mui/material';
import { customTableHeader, CustomTableHover, customTableTemplate, getExportEXCEL } from '../../services/HelperService';
import { IMAGES_ICON } from '../../assets/images/exportImages';
import { SkeletonProviderTables } from '../../providers/SkeletonProvider';
import BranchAmenities from './components/branchAmenities';
import BranchDetails from './components/branchDetails';
import BranchRoomsAndCots from './components/roomsAndCots';
import BranchPhotos from './components/branchPhotos';
import { getBranchGridList } from '../../models';
import CustomSelect from '../../components/helpers/CustomSelect';
import { useStateValue } from "../../providers/StateProvider";
import CustomSearch from "../../components/helpers/CustomSearch";


export default function Index({ PageAccess }: any) {
  const [{ }, dispatch]: any = useStateValue()
  const [_tableItems, _setTableItems] = useState<any>([]);
  const [_tableTotalCount, _setTableTotalCount] = useState(0);
  const [_pageList, _setPageList] = useState<any>([]);
  const [_tableLoading, _setTableLoading] = useState(true);
  const [_loading, _setLoading] = useState(false);
  const [_search, _setSearch] = useState('');

  const [_editForm, _setEditForm] = useState(false);
  const [_addScreen, _setAddScreen] = useState(false);
  const [_selectedTab, _setSelectedTab] = useState(1);
  const [_page, _setPage] = useState(1);
  const [_rowPopup, _setRowPopup] = useState(false);
  const [_rowsPerPage, _setRowsPerPage] = useState(10);

  const handleChangePage = (_event: React.ChangeEvent<unknown>, value: number) => {
    _setPage(value);
  }


  const validate = { type: { error: false, message: "" } }
  const [_validate, _setValidate] = useState(validate);

  const handleUpdateItem = (item: any) => {
    _setEditForm(true);
    dispatch({
      type: "SET_BRANCH_DETAILS",
      data: { branchDetails: { ...item }, edit: true }
    })
  }
  const handleAddNew = () => {
    handleClearForm()
    _setEditForm(true);
  }

  const handleGoBack = () => {
    _setEditForm(false);
    handleClearForm();
  }

  const handleClearForm = () => {
    dispatch({
      type: "SET_BRANCH_DETAILS",
      data: null
    })
    getGridList()
    _setSelectedTab(1)
    _setLoading(false);
    _setEditForm(false);
  }


  const getPrintTableHeadBody = () => {
    const header = ["S. No", "Branch Name", "Status", "Total Cots", "Cots Vacant", "Cots Occupied", "Contact Person Name", "Mobile Number"];
    const body = _tableItems?.map((item: any, index: number) => [
      index + 1,
      item?.branchName,
      item?.isActive ? "Active" : "Inactive",
      item?.totalCots?.split(',').filter(Boolean)?.length || 0,
      item?.cotVacant?.split(',').filter(Boolean)?.length || 0,
      item?.cotOccupied?.split(',').filter(Boolean)?.length || 0,
      item?.contactPerson,
      item?.mobileNumber
    ]);
    return { header, body }
  }

  const exportEXCEL = () => {
    const { header, body } = getPrintTableHeadBody();
    getExportEXCEL({ header, body, fileName: "Branch" })
  }

  const getGridList = () => {
    _setTableLoading(true);
    getBranchGridList(_page, _rowsPerPage)
      .then((resp) => {
        if (resp?.data?.status === "success") {
          _setTableItems(resp?.data?.result?.results);
          _setTableTotalCount(resp?.data?.result?.totalItems)
        }
      })
      .catch(console.log)
      .finally(() => _setTableLoading(false));
  }

  useEffect(() => {
    getGridList();
  }, [_page, _rowsPerPage])

  return (<>
    {!_editForm && <div className="container">
      <div className="row justify-content-between align-items-center py-3">
        <div className="col-md-4 my-2">
          <span className="text-dark fw-bold">Branch </span>
        </div>
        <div className="col-md-6 my-2 d-flex justify-content-end align-items-center gap-4">
          {PageAccess === 'Write' && <Button className="text-capitalize" sx={{ color: "black" }} startIcon={<img height={18} src={IMAGES_ICON.TableNewItemIcon} />} onClick={handleAddNew}>Add New</Button>}
          <CustomSearch getSearchText={(value: string) => _setSearch(value)} />
          <img height={24} src={IMAGES_ICON.TableDownloadIcon} role="button" draggable="false" onClick={exportEXCEL} />
        </div>
      </div>
      <TableContainer className="tableBorder rounded">
        <Table sx={{ ...customTableTemplate }} >
          <TableHead>
            <TableRow className="px-2" sx={{ ...customTableHeader }}>
              <TableCell className="fw-bold">S.No</TableCell>
              <TableCell className="fw-bold" align="center">Status</TableCell>
              <TableCell className="fw-bold">Action</TableCell>
              <TableCell className="fw-bold">Branch</TableCell>
              <TableCell className="fw-bold">Total Cots</TableCell>
              <TableCell className="fw-bold">Cots Vacant</TableCell>
              <TableCell className="fw-bold">Cots Occupied</TableCell>
              <TableCell className="fw-bold">Contact Person Name</TableCell>
              <TableCell className="fw-bold">Mobile Number</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {_tableItems?.length > 0 ? (
              _tableItems?.filter((content: any) => {
                const lowerSearchInput = _search?.toLowerCase()?.trim();
                return lowerSearchInput === '' || Object?.values(content)?.some((value) =>
                  value?.toString()?.toLowerCase()?.includes(lowerSearchInput)
                );
              })?.map((item: any, index: number) => (
                <TableRow key={index} sx={{ ...CustomTableHover }}>
                  <TableCell>{(index + 1) + ((_page - 1) * _rowsPerPage)}</TableCell>
                  <TableCell className="text-muted" align="center">
                    {item?.isActive ?
                      <span className="fs12 statusBgActive text-success rounded--50 px-3 py-1">Active</span>
                      : <span className="fs12 statusBgInactive text-danger rounded--50 px-3 py-1">Inactive</span>
                    }
                  </TableCell>
                  <TableCell className="text-muted" align="center">
                    {PageAccess === 'Write' && <div className="d-flex align-items-center gap-2 justify-content-center" role="button" onClick={() => handleUpdateItem(item)}>
                      <span>Edit</span>
                      <img draggable="false" height={16} src={IMAGES_ICON.EditIcon} alt="icon" />
                    </div>}
                  </TableCell>
                  <TableCell className="text-muted text-nowrap">{item?.branchName}</TableCell>
                  <TableCell className="text-muted text-nowrap">{item?.totalCots?.split(',').filter(Boolean)?.length || 0}</TableCell>
                  <TableCell className="text-muted text-nowrap">{item?.cotVacant?.split(',').filter(Boolean)?.length || 0}</TableCell>
                  <TableCell className="text-muted text-nowrap">{item?.cotOccupied?.split(',').filter(Boolean)?.length || 0}</TableCell>
                  <TableCell className="text-muted text-nowrap">{item?.contactPerson}</TableCell>
                  <TableCell className="text-muted text-nowrap">{item?.mobileNumber}</TableCell>
                </TableRow>
              ))
            ) : !_tableLoading && (
              <TableRow>
                <TableCell className="fs-3 text-muted" align="center" colSpan={9}>Data Not Found</TableCell>
              </TableRow>
            )}
            <SkeletonProviderTables columns={9} visible={_tableLoading} />
          </TableBody>
        </Table>
      </TableContainer>
      <div className="mt-3 d-flex justify-content-between flex-wrap">
        <div className="d-flex align-items-center gap-2">
          <span className='textLightGray fs14 text-nowrap'>Items per page:</span>
          <CustomSelect padding={'6px'} value={Number(_rowsPerPage)} onChange={(e: any) => _setRowsPerPage(e.target.value)}
            placeholder={" "} menuItem={[10, 20, 30]?.map((item: any) =>
              <MenuItem key={item} value={item}>{item}</MenuItem>)} />
        </div>
        <Pagination count={Math.ceil(_tableTotalCount / _rowsPerPage) || 0} page={_page} onChange={handleChangePage}
          size={"small"} color={"primary"}
          renderItem={(item) => <PaginationItem sx={{ mx: '4px' }} {...item} />} />
      </div>
    </div>}

    {_editForm && <>
      <div className="container py-3">
        <div className="bg-field-gray  border rounded px-4 py-1">
          <div className="d-flex align-items-center py-2 borderBottomLight" role="button" onClick={handleGoBack}>
            <img height={24} draggable={false} src={IMAGES_ICON.BackIcon} />
            <div className="fw-bold">Back</div>
          </div>
          <div className="bg-white my-3">
            <div className="">
              <Tabs value={false} selectionFollowsFocus={false}
                variant="scrollable"
                scrollButtons
                allowScrollButtonsMobile={false}
                className='d-flex align-items-center justify-content-between gap-3 w-100'
              >
                <Tab onClick={() => { _setSelectedTab(1); }} className="col-md-3" label={<div className={`${_selectedTab === 1 ? 'text-dark' : ''} ${_selectedTab > 1 ? 'text-primary' : ''} fw-bold`}>Branch Details</div>} />
                <Tab onClick={() => { _setSelectedTab(2); }} className="col-md-3" label={<div className={`${_selectedTab === 2 ? 'text-dark' : ''} ${_selectedTab > 2 ? 'text-primary' : ''} fw-bold`}>Photos</div>} />
                <Tab onClick={() => { _setSelectedTab(3); }} className="col-md-3" label={<div className={`${_selectedTab === 3 ? 'text-dark' : ''} ${_selectedTab > 3 ? 'text-primary' : ''} fw-bold`}>Room & Cots</div>} />
                <Tab onClick={() => { _setSelectedTab(4); }} className="col-md-3" label={<div className={`${_selectedTab === 4 ? 'text-dark' : ''} ${_selectedTab > 4 ? 'text-primary' : ''} fw-bold`}>Amenities</div>} />
              </Tabs>
              <Box sx={{ width: '100%' }}>
                <LinearProgress variant="determinate" value={25 * (_selectedTab - 1)} />
              </Box>

              <div className="p-4">
                {_selectedTab === 1 && <BranchDetails handleBack={handleGoBack} handleNext={() => _setSelectedTab(2)} />}
                {_selectedTab === 2 && <BranchPhotos handleBack={() => _setSelectedTab(1)} handleNext={() => _setSelectedTab(3)} />}
                {_selectedTab === 3 && <BranchRoomsAndCots handleBack={() => _setSelectedTab(2)} handleNext={() => _setSelectedTab(4)} />}
                {_selectedTab === 4 && <BranchAmenities handleBack={() => _setSelectedTab(3)} handleNext={handleGoBack} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>}
  </>)
}