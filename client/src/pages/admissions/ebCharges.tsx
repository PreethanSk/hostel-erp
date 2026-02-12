import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, TextField, MenuItem, Pagination, PaginationItem, TableContainer, Button } from '@mui/material';
import { CustomAlert, customTableHeader, CustomTableHover, customTableTemplate, DisableKeyUpDown, getExportEXCEL, textFieldStyle } from '../../services/HelperService';
import { IMAGES_ICON } from '../../assets/images/exportImages';
import { SkeletonProviderTables } from '../../providers/SkeletonProvider';
import moment from 'moment';
import { getAdmissionEbChargesGridList, getBranchGridList, getBranchRoomsList, getCandidatePaymentDetail, getMasterRoomType, insertUpdateCandidateAdmissionAnyDetail, insertUpdateCandidatePaymentAnyDetails } from '../../models';
import CustomSelect from '../../components/helpers/CustomSelect';
import { useStateValue } from "../../providers/StateProvider";
import DateRangeSelector from "../../components/helpers/DateRangeSelector";
import CustomSearch from "../../components/helpers/CustomSearch";
import { Edit } from "@mui/icons-material";

export default function EbCharges({ PageAccess }: any) {
    const [{ }]: any = useStateValue()
    const [_branchList, _setBranchList] = useState<any>([]);
    const [_roomTypeList, _setRoomTypeList] = useState<any>([]);
    const [_roomList, _setRoomList] = useState<any>([]);
    const [_cotList, _setCotList] = useState<any>([]);

    const [_tableItems, _setTableItems] = useState<any>([]);
    const [_tableTotalCount, _setTableTotalCount] = useState(0);
    const [_pageList, _setPageList] = useState<any>([]);
    const [_tableLoading, _setTableLoading] = useState(true);
    const [_loading, _setLoading] = useState(-1);
    const [_search, _setSearch] = useState('');
    const [_filterData, _setFilterData] = useState({ branchId: '', fromDate: moment().clone().startOf('month').format('YYYY-MM-DD'), toDate: moment().format('YYYY-MM-DD'), roomType: '' });
    const [_editForm, _setEditForm] = useState(false);
    const [_page, _setPage] = useState(1);
    const [_rowPopup, _setRowPopup] = useState(false);
    const [_rowsPerPage, _setRowsPerPage] = useState(10);

    const [_ebFlag, _setEbFlag] = useState(false)
    const [_totalAmount, _setTotalAmount] = useState(0)
    const [_paymentDetails, _setPaymentDetails] = useState<any>({})
    const [_formData, _setFormData] = useState<any>({
        id: 0,
        ebChargePaid: "",
        ebChargePending: "",
        miscellaneousPaid: "",
        miscellaneousPending: "",
        ebCharges: "",
        miscellaneousCharges: "",
        selectedIndex: -1,
    })
    const handleChangePage = (_event: React.ChangeEvent<unknown>, value: number) => {
        _setPage(value);
    }

    const validate = {
        branchRefId: { error: false, message: "" },
        roomRefId: { error: false, message: "" },
        cotRefId: { error: false, message: "" },
        dateOfAdmission: { error: false, message: "" },
    }
    const [_validate, _setValidate] = useState(validate);

    const changeFilterData = (key: string, value: any) => {
        _setFilterData({ ..._filterData, [key]: value });
    }
    const changeFormData = (key: string, value: any) => {
        _setFormData({ ..._formData, [key]: value });
        getTotalSum({ ..._formData, [key]: value })
    }

    const changeGridItem = (key: string, value: any, index: number) => {
        const tempArr = [..._tableItems]
        tempArr[index][key] = value
        _setTableItems([...tempArr])
    }

    const handleClearForm = () => {
        getGridList()
        _setLoading(-1);
        _setFormData({ id: 0, edit: false, isActive: true });
    }


    const getTotalSum = (obj: any) => {
        let totalAmount = [
            Number(obj?.admissionFeePending || '0'),
            Number(obj?.advancePending || '0'),
            Number(obj?.lateFeePending || '0'),
            Number(obj?.monthlyRentPending || '0'),
            Number(obj?.ebChargePending || '0'),
            Number(obj?.miscellaneousPending || '0'),
        ]?.reduce((acc, value) => acc + value, 0)
        totalAmount -= Number(obj?.tokenAmountPaid || '0')
        return totalAmount
    }


    const getPrintTableHeadBody = () => {
        const header = ["S. No", "Branch", "Room No", "Room Type", "Cot No", "Cot Type", "Candidate Name", "Mobile Number", "Date of Admission", "EB Charges", "Miscellaneous Charges"];
        const body = _tableItems?.map((item: any, index: number) => [
            index + 1,
            item?.branchName,
            item?.roomNumber,
            item?.roomTypeName,
            item?.cotNumber,
            item?.cotTypeName,
            item?.candidateName,
            item?.candidateMobileNumber,
            item?.dateOfAdmission ? moment(item?.dateOfAdmission)?.format('DD-MMM-YYYY') : "",
            item?.ebCharges || "",
            item?.miscellaneousCharges || "",
        ]);
        return { header, body }
    }

    const exportEXCEL = () => {
        const { header, body } = getPrintTableHeadBody();
        getExportEXCEL({ header, body, fileName: "EB Charges" })
    }


    const getOtherList = () => {
        getBranchGridList()
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    _setBranchList(resp?.data?.result?.results);
                }
            })
            .catch(console.log)
        getMasterRoomType()
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    _setRoomTypeList(resp?.data?.result);
                }
            })
            .catch(console.log)
    }

    const getGridList = () => {
        _setTableLoading(true);
        getAdmissionEbChargesGridList(_page, _rowsPerPage, _filterData?.branchId?.toString(), _filterData?.roomType?.toString(), _filterData?.fromDate, _filterData?.toDate)
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    _setTableItems(resp?.data?.result?.results);
                    _setTableTotalCount(resp?.data?.result?.totalItems)
                }
            })
            .catch(console.log)
            .finally(() => _setTableLoading(false));
    }

    const handleUpdateSearch = (fromDate: string, toDate: string) => {
        _setFilterData({ ..._filterData, fromDate: fromDate, toDate: toDate })
    }

    const handleSave = (item: any, index: number) => {
        const admissionBody = {
            id: item?.id,
            ebCharges: item?.ebCharges,
            miscellaneousCharges: item?.miscellaneousCharges,
        }
        _setLoading(index);
        insertUpdateCandidateAdmissionAnyDetail(admissionBody)
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    getCandidatePaymentDetail(item?.candidateRefId)
                        .then((resp) => {
                            if (resp?.data?.status === "success") {
                                const paymentDetail = resp?.data?.result
                                const totalAmount = getTotalSum({
                                    ...paymentDetail,
                                    ebChargePending: admissionBody?.ebCharges,
                                    miscellaneousPending: admissionBody?.miscellaneousCharges,
                                })
                                let dueToPaid = Number(paymentDetail?.dueToPaid || '0')
                                if (Number(paymentDetail?.ebChargePending || '0')) {
                                    dueToPaid -= Number(paymentDetail?.ebChargePending || '0')
                                    dueToPaid += Number(admissionBody?.ebCharges || '0')
                                } else {
                                    dueToPaid += Number(admissionBody?.ebCharges || '0')
                                }
                                if (Number(paymentDetail?.miscellaneousPending || '0')) {
                                    dueToPaid -= Number(paymentDetail?.miscellaneousPending || '0')
                                    dueToPaid += Number(admissionBody?.miscellaneousCharges || '0')
                                } else {
                                    dueToPaid += Number(admissionBody?.miscellaneousCharges || '0')
                                }

                                const paymentBody = {
                                    id: paymentDetail?.id,
                                    ebChargePending: admissionBody?.ebCharges,
                                    miscellaneousPending: admissionBody?.miscellaneousCharges,
                                    dueToPaid: dueToPaid,
                                    totalPendingAmount: Math.ceil(Number(totalAmount || '0') - Number(dueToPaid || '0')),
                                }
                                insertUpdateCandidatePaymentAnyDetails(paymentBody)
                                    .then((resp) => {
                                        if (resp?.data?.status === "success") {
                                            CustomAlert("success", "EB charges updated");
                                        }
                                    })
                                    .catch(console.log)
                                    .finally(() => _setLoading(-1));
                            }
                        })
                }
            })
            .catch(console.log)
    }

    useEffect(() => {
        if (_formData?.branchRefId) {
            getBranchRoomsList(_formData?.branchRefId)
                .then((resp) => {
                    if (resp?.data?.status === "success") {
                        _setRoomList(resp?.data?.result);
                        if (_formData?.cotRefId) {
                            const tempArr = resp?.data?.result?.find((fItem: any) => fItem?.id === _formData?.roomRefId)?.Cots
                            _setCotList([...tempArr])
                        }
                    }
                })
                .catch(console.log)
        }
    }, [_formData?.branchRefId])

    useEffect(() => {
        getGridList();
    }, [_page, _rowsPerPage, _filterData])

    useEffect(() => {
        getOtherList()
    }, [])

    return (<>
        {_editForm ? <div className="mb-3 container">
            <div className="d-flex align-items-center py-2 borderBottomLight" role="button" onClick={handleClearForm}>
                <img height={24} draggable={false} src={IMAGES_ICON.BackIcon} />
                <div className="fw-bold">Back</div>
            </div>
            <div className="row">
                <div className="col-md-3 my-3">
                    <div className="text-muted fs14 mb-1">Admission Fee</div>
                    <div className="">{_paymentDetails?.admissionFee || '-'}</div>
                </div>
                <div className="col-md-3 my-3">
                    <div className="text-muted fs14 mb-1">Advance Fee</div>
                    <div className="">{_formData?.advancePending?.toString() || '-'}</div>
                </div>
                <div className="col-md-3 my-3">
                    <div className="text-muted fs14 mb-1">Rent ({_formData?.noDayStayType === "Month" ? 'Monthly' : 'Per Day'})</div>
                    <div className="">{_formData?.monthlyRentPending?.toString() || '-'}</div>
                </div>
                <div className="col-md-3 my-3">
                    <div className="text-muted fs14 mb-1">Token Amount</div>
                    <div className="">{_formData?.tokenAmountPaid?.toString() || '-'}</div>
                </div>
                <div className="col-md-3 my-3">
                    <div className="text-muted fs14 mb-1">Late Fee</div>
                    <div className="">{_formData?.lateFeePending?.toString() || '-'}</div>
                </div>
                <div className="col-md-3 my-3">
                    <div className="text-muted fs14 mb-1">Due Date</div>
                    <div className="">{_formData?.dueDate ? moment(_formData?.dueDate)?.format('DD-MM-YYYY') : '-'}</div>
                </div>
                <hr />
                <div className="text-muted mb-1">Total Amount for Candidate Pay:</div>
                <div className="col-md-3 my-3">
                    <div className="text-muted fs14 mb-1">Pay by Candidate</div>
                    <div className="">{_formData?.dueToPaid?.toString() || '-'}</div>
                </div>
                <div className="col-md-3 my-3">
                    <div className="text-muted fs14 mb-1">Discount Offer</div>
                    <div className="">{_formData?.discountOffer?.toString() || '-'}</div>
                </div>
                <div className="col-md-3 my-3">
                    <div className="text-muted fs14 mb-1">Additional Charges</div>
                    <div className="">{_formData?.additionalCharges?.toString() || '-'}</div>
                </div>
                <hr />
                <div className="col-md-3 my-3">
                    <div className="text-muted fs14 mb-1">EB Charges</div>
                    <div className="d-flex align-items-center gap-3">
                        {_ebFlag ? <TextField fullWidth sx={{ ...textFieldStyle }} type="number" onKeyDown={DisableKeyUpDown}
                            value={_formData?.ebChargePending?.toString() || ''} onChange={(e: any) => {
                                const rawValue = e.target.value;
                                const numericValue = Number(rawValue);
                                // const maxValue = Number(_formData?.admissionFeePending || '0') + Number(_formData?.advancePending || '0') + Number(_formData?.monthlyRentPending || '0')
                                // const finalValue = numericValue < maxValue ? numericValue : maxValue
                                changeFormData("ebChargePending", rawValue)
                            }} /> :
                            <div className="">{_formData?.ebChargePending?.toString() || '-'}</div>}
                        {!_ebFlag && <Edit role="button" style={{ fontSize: "16px" }} className="text-primary" onClick={() => _setEbFlag(true)} />}
                    </div>
                </div>
                <div className="col-md-3 my-3">
                    <div className="text-muted fs14 mb-1">Paid Amount</div>
                    <div className="">{_formData?.paidAmount || 0}</div>
                </div>
                <div className="col-md-3 my-3">
                    <div className="text-muted fs14 mb-1">Due to be Paid</div>
                    <div className="">{Math.ceil(Number(_totalAmount || '0'))}</div>
                </div>
                <div className="col-md-3 my-3">
                    <div className="text-muted fs14 mb-1">Remaining Amount</div>
                    <div className="">{Math.ceil(Number(_totalAmount || '0') - Number(_formData?.dueToPaid || '0') - Number(_formData?.discountOffer || '0'))}</div>
                </div>
            </div>
            <div className="d-flex align-items-center justify-content-center gap-3 py-3">
                {/* <Button className="px-3" size="small" variant="contained" color="primary" onClick={handleSave}>Save</Button> */}
                <Button className="px-3" size="small" variant="outlined" color="error" onClick={handleClearForm}>Cancel</Button>
            </div>
        </div> : <div className="container">
            <div className="row justify-content-between align-items-center py-3">
                <div className="col-md-4 my-2">
                    <span className="text-dark fw-bold">EB Charges </span>
                </div>
                <div className="col-md-8">
                    <div className="row align-items-center">
                        <div className="col-md-2 my-2">
                            <CustomSelect className="" padding={'0px 10px'} value={_filterData?.branchId} onChange={(e: any) => changeFilterData('branchId', e.target.value)}
                                placeholder={"Branch"} menuItem={[<MenuItem className="px-2 fs14" value={''} key={-1}>All</MenuItem>,
                                ..._branchList?.map((item: any) => <MenuItem className="px-2 fs14" key={item?.id} value={item?.id}>{item?.branchName}</MenuItem>)]} />
                        </div>
                        <div className="col-md-2 my-2">
                            <CustomSelect className="" padding={'0px 10px'} value={_filterData?.roomType} onChange={(e: any) => changeFilterData('roomType', e.target.value)}
                                placeholder={"Room Type"} menuItem={[<MenuItem className="px-2 fs14" value={''} key={-1}>All</MenuItem>,
                                ..._roomTypeList?.map((item: any) => <MenuItem className="px-2 fs14" key={item?.id} value={item?.id}>{item?.type}</MenuItem>)]} />
                        </div>
                        <div className="col-md-6 my-2">
                            <DateRangeSelector handleChangeDate={handleUpdateSearch} />
                        </div>
                        <div className="col-md-2 my-2">
                            <div className="d-flex align-items-center gap-4 justify-content-around mobJustify">
                                <CustomSearch getSearchText={(value: string) => _setSearch(value)} />
                                <img height={24} src={IMAGES_ICON.TableDownloadIcon} role="button" draggable="false" onClick={exportEXCEL} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <TableContainer className="tableBorder rounded">
                <Table size="small" sx={{ ...customTableTemplate }} >
                    <TableHead>
                        <TableRow className="px-2" sx={{ ...customTableHeader }}>
                            <TableCell className="fw-bold text-nowrap">S.No</TableCell>
                            <TableCell className="fw-bold text-nowrap">Branch</TableCell>
                            <TableCell className="fw-bold text-nowrap">Room No</TableCell>
                            <TableCell className="fw-bold text-nowrap">Room Type</TableCell>
                            <TableCell className="fw-bold text-nowrap">Cot No</TableCell>
                            <TableCell className="fw-bold text-nowrap">Cot Type</TableCell>
                            <TableCell className="fw-bold text-nowrap">Candidate Name</TableCell>
                            <TableCell className="fw-bold text-nowrap">Mobile Number</TableCell>
                            <TableCell className="fw-bold text-nowrap">Date of Admission</TableCell>
                            <TableCell className="fw-bold text-nowrap">Booking Type</TableCell>
                            <TableCell className="fw-bold text-nowrap">EB Charges</TableCell>
                            <TableCell className="fw-bold text-nowrap">Miscellaneous Charges</TableCell>
                            <TableCell className="fw-bold text-nowrap">Action</TableCell>
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
                                    <TableCell className="text-muted text-nowrap">{item?.branchName}</TableCell>
                                    <TableCell className="text-muted text-nowrap">{item?.roomNumber}</TableCell>
                                    <TableCell className="text-muted text-nowrap">{item?.roomTypeName}</TableCell>
                                    <TableCell className="text-muted text-nowrap">{item?.cotNumber}</TableCell>
                                    <TableCell className="text-muted text-nowrap">{item?.cotTypeName}</TableCell>
                                    <TableCell className="text-muted text-nowrap">{item?.candidateName}</TableCell>
                                    <TableCell className="text-muted text-nowrap">{item?.candidateMobileNumber}</TableCell>
                                    <TableCell className="text-muted text-nowrap">{item?.dateOfAdmission && moment(item?.dateOfAdmission)?.format('DD-MMM-YYYY')}</TableCell>
                                    <TableCell className="text-muted text-nowrap">{item?.noDayStayType}</TableCell>
                                    <TableCell className="text-muted text-nowrap">
                                        <TextField className="" size="small" fullWidth sx={{ ...textFieldStyle, width: "100px" }} type="number" onKeyDown={DisableKeyUpDown}
                                            value={item?.ebCharges?.toString() || ''} onChange={(e: any) => {
                                                const rawValue = e.target.value;
                                                const numericValue = Number(rawValue);
                                                changeGridItem("ebCharges", rawValue, index)
                                            }} />
                                    </TableCell>
                                    <TableCell className="text-muted text-nowrap">
                                        <TextField className="" size="small" fullWidth sx={{ ...textFieldStyle, width: "100px" }} type="number" onKeyDown={DisableKeyUpDown}
                                            value={item?.miscellaneousCharges?.toString() || ''} onChange={(e: any) => {
                                                const rawValue = e.target.value;
                                                const numericValue = Number(rawValue);
                                                changeGridItem("miscellaneousCharges", rawValue, index)
                                            }} />
                                    </TableCell>
                                    <TableCell className="text-muted text-nowrap">
                                        {PageAccess === 'Write' && <Button className="px-3 py-1" size="small" variant="contained" color="primary" onClick={() => handleSave(item, index)} loading={index === _loading}>Save</Button>}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : !_tableLoading && (
                            <TableRow>
                                <TableCell className="fs-3 text-muted" align="center" colSpan={13}>Data Not Found</TableCell>
                            </TableRow>
                        )}
                        <SkeletonProviderTables columns={13} visible={_tableLoading} />
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
    </>)
}
