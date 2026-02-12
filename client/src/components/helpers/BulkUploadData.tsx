import { CloudUploadRounded, DriveFolderUpload } from "@mui/icons-material"
import { Button, styled } from "@mui/material"
import { MutableRefObject, useRef, useState } from "react"
import CustomDialogue from "./CustomDialogue"
import * as XLSX from 'xlsx';
import { CustomAlert } from '../../services/HelperService';
import Swal from 'sweetalert2';
import moment from "moment";

const Input = styled('input')({ display: 'none' });

interface BulkType {
    label: string;
    templateArr: {
        header: string[],
        bodyType: string[]
    };
    onBulkUpload?: (rows: any[]) => Promise<{ success: number, error: number, validationResults?: any, errors?: any[], errorDetails?: string }>;
    hideTemplate?: boolean;
}

export default function BulkUploadData({ label, templateArr, onBulkUpload, hideTemplate }: BulkType) {
    const refDocument = useRef() as MutableRefObject<HTMLInputElement>;
    const [_file, _setFile] = useState<any>(null)
    const [_previewData, _setPreviewData] = useState<any>([])
    const [_uploadPopup, _setUploadPopup] = useState(false)
    const [_loading, _setLoading] = useState(false)
    const [_dragOver, _setDragOver] = useState(false);

    const handleDragOver = (e: any) => {
        e.preventDefault();
        _setDragOver(true);
    };

    const handleDragLeave = () => {
        _setDragOver(false);
    };

    const handleDrop = (e: any) => {
        e.preventDefault();
        _setDragOver(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            handleFileChange(droppedFile);
        }
    };

    const handleDownloadTemplate = () => {
        let sampleData: any[] = [];

        // Generate sample data based on label
        const sampleRow: any = {};
        templateArr.header.forEach((header, index) => {
            const headerLower = header.toLowerCase();
            const bodyType = templateArr.bodyType[index];
            
            if (headerLower.includes('date') || headerLower.includes('dob')) {
                sampleRow[header] = '1990-01-01';
            } else if (headerLower.includes('email')) {
                sampleRow[header] = 'example@email.com';
            } else if (headerLower.includes('mobile') || headerLower.includes('phone')) {
                sampleRow[header] = '1234567890';
            } else if (headerLower.includes('active') || headerLower.includes('status')) {
                sampleRow[header] = 'true';
            } else if (bodyType === 'number' || headerLower.includes('refid') || headerLower.includes('id')) {
                sampleRow[header] = '1';
            } else {
                sampleRow[header] = 'Sample Data';
            }
        });
        sampleData = [sampleRow];

        const worksheet = XLSX.utils.json_to_sheet(sampleData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

        XLSX.writeFile(workbook, `${label}_Template.xlsx`);
    }

    const handleClose = () => {
        _setUploadPopup(false)
    }

    const handleBulkUpload = () => {
        _setUploadPopup(true)
    }

    const handleClear = () => {
        _setLoading(false);
        _setPreviewData([]);
        _setFile(null);
        if (refDocument.current) {
            refDocument.current.value = '';
        }
    }

    const handleFileChange = (uploadedFile: any) => {
        _setFile(uploadedFile);
        const fileExtension = uploadedFile?.name.split(".")?.pop().toLowerCase();
        const reader = new FileReader();

        reader.onload = (event: any) => {
            if (fileExtension === "xlsx" || fileExtension === "xls") {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: "array", cellDates: false });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                
               
                const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
                const headerRow: any = {};
                for (let col = range.s.c; col <= range.e.c; col++) {
                    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
                    const cell = worksheet[cellAddress];
                    if (cell && cell.v) {
                        headerRow[cell.v] = col;
                    }
                }
                
                
                const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { raw: true, defval: null });

                
                const normalized = jsonData.map((row, rowIndex) => {
                    const newRow: any = {};
                    for (const key in row) {
                        const val = row[key];
                        const keyLower = key.toLowerCase();
                        
                       
                        const headerIndex = templateArr.header.findIndex((h: string) => h === key);
                        const bodyType = headerIndex >= 0 ? templateArr.bodyType[headerIndex] : null;
                        
                        
                        if (bodyType === 'number' || (keyLower.includes('refid') || keyLower.includes('id'))) {
                           
                            const cellCol = headerRow[key] !== undefined ? headerRow[key] : headerIndex;
                            const cellAddress = XLSX.utils.encode_cell({ r: rowIndex + 1, c: cellCol });
                            const cell = worksheet[cellAddress];
                            
                            
                            let rawValue = cell && cell.v !== undefined ? cell.v : val;
                            
                            
                            if (cell && typeof cell.v === 'number') {
                                newRow[key] = cell.v.toString();
                            } else if (rawValue !== null && rawValue !== undefined && rawValue !== '') {
                               
                                if (typeof rawValue === 'number') {
                                    newRow[key] = rawValue.toString();
                                } else if (typeof rawValue === 'string') {
                                   
                                    const datePattern = /^\d{4}-\d{2}-\d{2}/;
                                    if (datePattern.test(rawValue)) {
                                       
                                        const date = moment(rawValue);
                                        if (date.isValid()) {
                                          
                                            let excelSerial = 0;
                                            if (date.isBefore(moment('1900-03-01'))) {
                                                
                                                excelSerial = date.diff(moment('1899-12-30'), 'days');
                                            } else {
                                                
                                                excelSerial = date.diff(moment('1900-01-01'), 'days') + 1;
                                            }
                                            
                                           
                                            if (excelSerial >= 1 && excelSerial <= 100000 && date.year() >= 1899 && date.year() <= 2100) {
                                               
                                                newRow[key] = excelSerial.toString();
                                            } else {
                                               
                                                const numVal = Number(rawValue);
                                                newRow[key] = !isNaN(numVal) ? numVal.toString() : rawValue.toString();
                                            }
                                        } else {
                                           
                                            const numVal = Number(rawValue);
                                            newRow[key] = !isNaN(numVal) ? numVal.toString() : rawValue.toString();
                                        }
                                    } else {
                                       
                                        const numVal = Number(rawValue);
                                        newRow[key] = !isNaN(numVal) ? numVal.toString() : rawValue.toString();
                                    }
                                } else {
                                   
                                    const numVal = Number(rawValue);
                                    newRow[key] = !isNaN(numVal) ? numVal.toString() : rawValue.toString();
                                }
                            } else {
                                newRow[key] = rawValue;
                            }
                        } else if (keyLower.includes('date') || keyLower.includes('dob') || bodyType === 'date') {
                            if (val) {
                               
                                let date: moment.Moment;
                                if (typeof val === 'number' && val > 0) {
                                   
                                    date = moment('1899-12-30').add(val, 'days');
                                } else {
                                    date = moment(val);
                                }
                                newRow[key] = date.isValid() ? date.format("YYYY-MM-DD") : val;
                            } else {
                                newRow[key] = val;
                            }
                        } else if (bodyType === 'boolean') {
                            
                            if (typeof val === 'boolean') {
                                newRow[key] = val;
                            } else if (typeof val === 'string') {
                                const lowerVal = val.toLowerCase().trim();
                                newRow[key] = lowerVal === 'true' || lowerVal === '1' || lowerVal === 'yes';
                            } else {
                                newRow[key] = Boolean(val);
                            }
                        } else {
                            newRow[key] = val;
                        }
                    }
                    return newRow;
                });

                _setPreviewData(normalized);
            } else if (fileExtension === "csv" || fileExtension === "txt") {
                const text = event.target.result;
                const lines = text.split("\n").filter((line: string) => line.trim() !== "");
                const headers = lines[0].split(",").map((h: any) => h.trim());

                const data = lines.slice(1).map((line: any) => {
                    const values = line.split(",").map((v: any) => v.trim());
                    const row: any = {};
                    headers.forEach((h: any, i: number) => {
                        if (h.toLowerCase().includes('date') || h.toLowerCase().includes('dob')) {
                            if (values[i]) {
                                const date = moment(values[i]);
                                row[h] = date.isValid() ? date.format("YYYY-MM-DD") : values[i];
                            } else {
                                row[h] = values[i];
                            }
                        } else {
                            row[h] = values[i];
                        }
                    });
                    return row;
                });

                _setPreviewData(data);
            } else {
                CustomAlert('error', 'Unsupported file type. Please upload .xlsx, .xls, .csv, or .txt files.');
            }
        };

        if (fileExtension === "xlsx" || fileExtension === "xls") {
            reader.readAsArrayBuffer(uploadedFile);
        } else {
            reader.readAsText(uploadedFile);
        }
    };

    const handleInsertBulkUpload = async () => {
        if (!_previewData || _previewData.length === 0) {
            CustomAlert('warning', 'No data to upload');
            return;
        }
        if (!onBulkUpload) {
            CustomAlert('error', 'Bulk upload not implemented for this table');
            return;
        }
        _setLoading(true);
        try {
            const result = await onBulkUpload(_previewData);

            if (result.validationResults) {
                const { invalidMeterIds = [], invalidCustomerIds = [], duplicateEntries = [] } = result.validationResults;
                const totalErrors = invalidMeterIds.length + invalidCustomerIds.length + duplicateEntries.length;

                let errorMessage = `Upload failed: ${totalErrors} validation error${totalErrors > 1 ? 's' : ''} found.\n\n`;

                if (invalidMeterIds.length > 0) {
                    const uniqueReasons = [...new Set(invalidMeterIds.map((err: any) => err.reason))];
                    errorMessage += `• ${invalidMeterIds.length} invalid meter${invalidMeterIds.length > 1 ? 's' : ''}: ${uniqueReasons.join(', ')}\n`;
                }

                if (invalidCustomerIds.length > 0) {
                    errorMessage += `• ${invalidCustomerIds.length} invalid customer${invalidCustomerIds.length > 1 ? 's' : ''}\n`;
                }

                if (duplicateEntries.length > 0) {
                    const uniqueReasons = [...new Set(duplicateEntries.map((err: any) => err.reason))];
                    errorMessage += `• ${duplicateEntries.length} duplicate${duplicateEntries.length > 1 ? 's' : ''}: ${uniqueReasons[0]}${uniqueReasons.length > 1 ? '...' : ''}\n`;
                }

                errorMessage += `\nPlease fix the issues and try again.`;

                Swal.fire({
                    toast: true,
                    position: 'bottom-right',
                    icon: 'error',
                    title: errorMessage,
                    showConfirmButton: false,
                    timer: undefined,
                    timerProgressBar: false,
                    showCloseButton: true,
                    customClass: {
                        popup: 'toast-popup',
                        title: 'toast-title',
                    }
                });
            }

            if (result.success > 0) {
                if (result.error === 0 && (!result.errors || result.errors.length === 0)) {
                    CustomAlert('success', `${result.success} records uploaded successfully!`);
                    _setUploadPopup(false);
                    _setPreviewData([]);
                    _setFile(null);
                } else {
                    
                    let warningMessage = `${result.success} records succeeded`;
                    if (result.error > 0) {
                        warningMessage += `, ${result.error} records failed`;
                    }
                    warningMessage += '.';
                    
                    
                    if (result.errors && result.errors.length > 0) {
                        const errorCount = Math.min(result.errors.length, 5);
                        let errorDetails = '\n\nErrors found:\n';
                        result.errors.slice(0, errorCount).forEach((error: any, index: number) => {
                            errorDetails += `${index + 1}. Row ${error.row}: ${error.error}\n`;
                        });
                        if (result.errors.length > 5) {
                            errorDetails += `\n... and ${result.errors.length - 5} more errors`;
                        }
                        
                        Swal.fire({
                            icon: 'warning',
                            title: 'Partial Upload Success',
                            html: `<div style="text-align: left;">
                                <p><strong>${warningMessage}</strong></p>
                                <pre style="white-space: pre-wrap; font-size: 12px; background: #f5f5f5; padding: 10px; border-radius: 4px; max-height: 300px; overflow-y: auto;">${errorDetails}</pre>
                                <p style="margin-top: 10px; font-size: 12px;">Please review the errors and fix them in your file, then upload again.</p>
                            </div>`,
                            confirmButtonText: 'OK',
                            width: '600px'
                        });
                    } else {
                        CustomAlert('warning', `${warningMessage} Please check the data and try again.`);
                    }
                }
            } else if (result.validationResults) {
                console.log('Validation errors detected, showing validation dialog');
            } else if (result.error > 0 || (result.errors && result.errors.length > 0)) {
                
                let errorMessage = 'All records failed to upload.';
                if (result.errors && result.errors.length > 0) {
                    const errorCount = Math.min(result.errors.length, 10);
                    let errorDetails = '\n\nErrors:\n';
                    result.errors.slice(0, errorCount).forEach((error: any, index: number) => {
                        errorDetails += `${index + 1}. Row ${error.row}: ${error.error}\n`;
                    });
                    if (result.errors.length > 10) {
                        errorDetails += `\n... and ${result.errors.length - 10} more errors`;
                    }
                    
                    Swal.fire({
                        icon: 'error',
                        title: 'Upload Failed',
                        html: `<div style="text-align: left;">
                            <p><strong>${errorMessage}</strong></p>
                            <pre style="white-space: pre-wrap; font-size: 12px; background: #f5f5f5; padding: 10px; border-radius: 4px; max-height: 300px; overflow-y: auto;">${errorDetails}</pre>
                            <p style="margin-top: 10px; font-size: 12px;">Please fix the errors in your file and try uploading again.</p>
                        </div>`,
                        confirmButtonText: 'OK',
                        width: '600px'
                    });
                } else {
                    CustomAlert('error', errorMessage);
                }
            }
        } catch (err: any) {
            console.error('Bulk upload error:', err);

            let errorMessage = 'Bulk upload failed. Please try again.';
            let errorTitle = 'Upload Error';
            let errorDetails = '';

            
            if (err?.response) {
                
                const status = err.response.status;
                const data = err.response.data;

                if (status === 400) {
                    errorTitle = 'Validation Error';
                    errorMessage = data?.error || data?.msg || 'Invalid data provided. Please check your file and try again.';
                    
                    
                    if (data?.result?.errors && Array.isArray(data.result.errors)) {
                        const errors = data.result.errors;
                        const errorCount = Math.min(errors.length, 10);
                        errorDetails = `\n\nFound ${errors.length} error(s):\n`;
                        errors.slice(0, errorCount).forEach((error: any, index: number) => {
                            errorDetails += `${index + 1}. Row ${error.row}: ${error.error}\n`;
                        });
                        if (errors.length > 10) {
                            errorDetails += `\n... and ${errors.length - 10} more errors`;
                        }
                    }
                } else if (status === 401) {
                    errorTitle = 'Authentication Error';
                    errorMessage = 'Your session has expired. Please refresh the page and login again.';
                } else if (status === 403) {
                    errorTitle = 'Access Denied';
                    errorMessage = 'You do not have permission to perform this action.';
                } else if (status === 413) {
                    errorTitle = 'File Too Large';
                    errorMessage = 'The file you are trying to upload is too large. Please reduce the file size and try again.';
                } else if (status === 500) {
                    errorTitle = 'Server Error';
                    errorMessage = data?.error || data?.msg || 'A server error occurred. Please try again later or contact support.';
                } else {
                    errorMessage = data?.error || data?.msg || `Server returned error (${status}). Please try again.`;
                }
            } else if (err?.code === 'ECONNABORTED' || err?.message?.includes('timeout')) {
                errorTitle = 'Request Timeout';
                errorMessage = 'The request took too long to complete. Please check your internet connection and try again.';
            } else if (err?.code === 'NETWORK_ERROR' || err?.message?.includes('Network Error')) {
                errorTitle = 'Network Error';
                errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
            } else if (err?.message) {
                errorMessage = err.message;
            } else if (typeof err === 'string') {
                errorMessage = err;
            }

           
            Swal.fire({
                icon: 'error',
                title: errorTitle,
                html: `<div style="text-align: left;">
                    <p><strong>${errorMessage}</strong></p>
                    ${errorDetails ? `<pre style="white-space: pre-wrap; font-size: 12px; background: #f5f5f5; padding: 10px; border-radius: 4px; max-height: 300px; overflow-y: auto;">${errorDetails}</pre>` : ''}
                    <p style="margin-top: 15px; font-size: 12px; color: #666;">
                        <strong>What you can do:</strong><br/>
                        • Check your internet connection<br/>
                        • Verify the data format matches the template<br/>
                        • Try uploading a smaller batch of data<br/>
                        • Contact support if the problem persists
                    </p>
                </div>`,
                confirmButtonText: 'OK',
                width: '600px'
            });
        } finally {
            _setLoading(false);
        }
    };

    return <>
        <Button size="small" className='rounded text-capitalize fs-6' variant='outlined' onClick={handleBulkUpload}><DriveFolderUpload /> &nbsp; Bulk Upload</Button>
        <CustomDialogue displaySize="md" title={label} dialogueFlag={_uploadPopup} onCloseClick={handleClose}
            mainContent={<div className="my-2 row">
                <div className="py-4">
                    {!_previewData || _previewData.length === 0 ? (
                        <div className={`rounded--1 borderLight ${_dragOver ? 'drag-over' : ''}`} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
                            <Button className={`w-100 text-capitalize ${_dragOver ? 'drag-over' : 'text-muted'}`} component="label">
                                <div className="text-center w-100 py-4">
                                    <CloudUploadRounded sx={{ fontSize: "4rem" }} />
                                    <div className='fs-6 mt-3'>Drag file here or browse for file upload</div>
                                    <div className='fs-7 mt-2 text-muted'>Supported formats: .xlsx, .csv, .txt</div>
                                </div>
                                <Input style={{ visibility: "hidden" }} accept={".xlsx,.csv,.txt"} type="file"
                                    ref={refDocument} onChange={(event: any) => handleFileChange(event.target.files[0])} />
                            </Button>
                        </div>
                    ) : (
                        <div>
                            <div className="mb-3">
                                <h6>Preview Data ({_previewData.length} records)</h6>
                                <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    <table className="table table-sm table-bordered">
                                        <thead className="table-light">
                                            <tr>
                                                {templateArr.header.map((header: string, index: number) => (
                                                    <th key={index} className="text-nowrap">{header}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {_previewData.slice(0, 10).map((row: any, index: number) => (
                                                <tr key={index}>
                                                    {templateArr.header.map((header: string, headerIndex: number) => (
                                                        <td key={headerIndex} className="text-nowrap">{row[header] || ''}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {_previewData.length > 10 && (
                                        <div className="text-muted text-center mt-2">
                                            Showing first 10 records of {_previewData.length} total records
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="text-center">
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => {
                                        _setPreviewData([]);
                                        _setFile(null);
                                        if (refDocument.current) {
                                            refDocument.current.value = '';
                                        }
                                    }}
                                >Upload Different File</Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>}
            actionContent={
                <div className="w-100 d-flex align-items-center flex-wrap justify-content-center">
                    <div className="px-2">
                        <Button variant="outlined" className="border-1 rounded text-capitalize bg-white px-3"
                            color="error" onClick={handleClear}>Clear</Button>
                    </div>
                    {!hideTemplate && (
                        <div className="px-2">
                            <Button variant="outlined" className="border-1 rounded text-capitalize bg-white px-3"
                                color="secondary" onClick={handleDownloadTemplate}>Download Template</Button>
                        </div>
                    )}
                    <div className="px-2">
                        <Button variant="contained" className="border-1 rounded text-capitalize px-3" disabled={_loading || !_previewData.length}
                            color="primary" onClick={handleInsertBulkUpload}>{_loading ? 'Uploading...' : 'Upload'}</Button>
                    </div>
                </div>
            } />

    </>
}

