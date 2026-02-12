import { useState } from "react";
import search from '../../assets/images/iconamoon_search-light.png';
import sort from '../../assets/images/hugeicons_sort-by-up-01.png';
import download from '../../assets/images/solar_download-outline.png';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import addNew from '../../assets/images/basil_add-outline.png';


export default function Index() {
    const [list] = useState([]);
    const [editComplaint] = useState(0);

    return (<>
        <div className="">
            <div className="px-4 d-flex flex-wrap align-items-center justify-content-between py-4">
                <div className="d-flex align-items-center flex-wrap">
                    <div className="px-3"><span className="Header-name">Announcements</span></div>
                </div>
                <div className="d-flex flex-wrap">
                    <div className="px-2  line-item"><span>Branch</span></div>
                    <div className="px-4  line-item"><select className='slectComplaint' style={{ border: "none", borderBottom: "1px solid #6D6D6D", width: "120px" }}>
                        <option>select</option>
                    </select></div>
                    <div className=" line-item d-flex align-items-center cursorPointer" >
                        <img src={addNew} className='addnew' />
                    </div>
                    <div className="px-2 d-flex flex-wrap align-items-center cursorPointer" style={{ color: "#000000", fontSize: "16px" }}><span>Add New</span></div>
                    <div className="px-4"><img src={search} /></div>
                    <div className="px-4"><img src={sort} /></div>
                    <div className="px-4"><img src={download} /></div>
                </div>
            </div>

            {editComplaint == 0 && (
                <div className="px-3">
                    <div className="px-2">
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650, border: 'none' }} aria-label="simple table" style={{ borderLeft: "1px solid white", borderRight: "solid 1px white" }}>
                                <TableHead>
                                    <TableRow className="px-2" style={{ backgroundColor: "#FAFAFA", border: '1px solid #D2D2D2' }}>
                                        <TableCell className="fw-bold"><span>S.No</span></TableCell>
                                        <TableCell className="fw-bold" align="center"><span>Date</span></TableCell>
                                        <TableCell className="fw-bold" align="center"><span>Branch</span></TableCell>
                                        <TableCell className="fw-bold" align="center"><span>Title</span></TableCell>
                                        <TableCell className="fw-bold" align="center"><span>Email</span></TableCell>
                                        <TableCell className="fw-bold" align="center"><span>Branch</span></TableCell>
                                        <TableCell className="fw-bold" align="center"><span>Room Number</span></TableCell>
                                        <TableCell className="fw-bold" align="center"><span>Admission Date</span></TableCell>
                                        <TableCell className="fw-bold" align="center"><span>Vacate Date</span></TableCell>
                                        <TableCell className="fw-bold" align="center"><span>Candidate Feedback</span></TableCell>
                                        <TableCell className="fw-bold" align="center"><span>Manager Feedback</span></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {list && list.length > 0 ? (
                                        list.map((item: any, index) => (
                                            <TableRow key={index} style={{ borderBottom: '1px solid #D2D2D2' }}>
                                                <TableCell align="left">{index + 1}</TableCell>
                                                <TableCell className="text-muted bolder text-nowrap" align="center">{item?.no}</TableCell>
                                                <TableCell className="text-muted bolder" align="center">{""}</TableCell>
                                                <TableCell className="text-muted bolder" align="center">{""}</TableCell>
                                                <TableCell className="text-muted bolder" align="center">{""}</TableCell>
                                                <TableCell className="text-muted bolder" align="center">{""}</TableCell>
                                                <TableCell className="text-muted bolder" align="center">{""}</TableCell>
                                                <TableCell className="text-muted bolder" align="center">{""}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={11} align="center">
                                                <h3 className="text-muted">Data Not Found</h3>
                                            </TableCell>
                                        </TableRow>
                                    )}

                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                </div>
            )}
            <div>
            </div>
        </div>
    </>)
}