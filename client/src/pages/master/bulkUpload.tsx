import { useState } from "react";
import { Button, FormControl, MenuItem, Select } from "@mui/material";
import { Download } from "@mui/icons-material";
import BulkUploadData from "../../components/helpers/BulkUploadData";
import { CustomAlert } from "../../services/HelperService";
import { bulkUploadCandidateDetails, bulkUploadCots, bulkUploadRooms, bulkUploadVacate, bulkUploadUsers } from "../../models";
import * as XLSX from 'xlsx';

export default function BulkUpload({ PageAccess }: any) {
  const [selectedTable, setSelectedTable] = useState<string>("CANDIDATE_DETAILS");

  // Define template headers for each table
  const tableTemplates: any = {
    CANDIDATE_DETAILS: {
      header: [
        "name",
        "mobileNumber",
        "email",
        "dob",
        "gender",
        "mobileCountryCode",
        "address",
        "place",
        "city",
        "pincode",
        "state",
        "country",
        "isActive"
      ],
      bodyType: [
        "string",
        "string",
        "string",
        "date",
        "string",
        "string",
        "string",
        "string",
        "string",
        "string",
        "string",
        "string",
        "boolean"
      ]
    },
    COTS: {
      header: [
        "roomId",
        "cotTypeId",
        "cotNumber",
        "rentAmount",
        "advanceAmount",
        "perDayRent",
        "isActive"
      ],
      bodyType: [
        "number",
        "number",
        "string",
        "string",
        "string",
        "string",
        "boolean"
      ]
    },
    ROOMS: {
      header: [
        "branchId",
        "roomTypeId",
        "sharingTypeId",
        "bathroomTypeId",
        "roomSize",
        "roomNumber",
        "floorNumber",
        "numberOfCots",
        "oneDayStay",
        "admissionFee",
        "advanceAmount",
        "lateFeeAmount",
        "isActive",
        "notes"
      ],
      bodyType: [
        "number",
        "number",
        "number",
        "number",
        "string",
        "string",
        "string",
        "string",
        "boolean",
        "string",
        "string",
        "string",
        "boolean",
        "string"
      ]
    },
    VACATE: {
      header: [
        "candidateRefId",
        "branchRefId",
        "admissionRefId",
        "vacateType",
        "vacateStatus",
        "damageRemarks",
        "payableAdvancePaid",
        "payableAdmissionFee",
        "payableMonthlyRent",
        "payablePenalty",
        "payableDuePending",
        "dateOfNoticeGiven",
        "proposedVacatingDate",
        "actualVacatingDate",
        "isActive"
      ],
      bodyType: [
        "number",
        "number",
        "number",
        "string",
        "string",
        "string",
        "string",
        "string",
        "string",
        "string",
        "string",
        "date",
        "date",
        "date",
        "boolean"
      ]
    },
    Users: {
      header: [
        "firstName",
        "middleName",
        "lastName",
        "emailAddress",
        "mobileNumber",
        "userRoleId",
        "branchId",
        "isActive"
      ],
      bodyType: [
        "string",
        "string",
        "string",
        "string",
        "string",
        "number",
        "number",
        "boolean"
      ]
    }
  };

  const handleBulkUpload = async (rows: any[]) => {
    try {
      let response: any;

      switch (selectedTable) {
        case "CANDIDATE_DETAILS":
          response = await bulkUploadCandidateDetails({ data: rows });
          break;
        case "COTS":
          response = await bulkUploadCots({ data: rows });
          break;
        case "ROOMS":
          response = await bulkUploadRooms({ data: rows });
          break;
        case "VACATE":
          response = await bulkUploadVacate({ data: rows });
          break;
        case "Users":
          response = await bulkUploadUsers({ data: rows });
          break;
        default:
          CustomAlert('error', 'Invalid table selected');
          return { success: 0, error: rows.length };
      }

      if (response?.data?.status === "success") {
        const result = response.data.result;
        const summary = result.summary || {};
        const errors = result.errors || [];
        
        // If there are errors, include them in the result
        if (errors.length > 0) {
          return {
            success: summary.success || 0,
            error: summary.error || 0,
            errors: errors,
            errorDetails: `Found ${errors.length} error(s) in the uploaded data.`
          };
        }
        
        return {
          success: summary.success || 0,
          error: summary.error || 0,
        };
      } else {
        
        const errorMsg = response?.data?.error || response?.data?.msg || "Upload failed";
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error("Bulk upload error:", error);
      
      
      if (error?.response) {
        const apiError = new Error(error.response?.data?.error || error.response?.data?.msg || error.message);
        (apiError as any).response = error.response;
        throw apiError;
      }
      
      throw error;
    }
  };

  const handleDownloadTemplate = () => {
    const currentTemplate = tableTemplates[selectedTable] || tableTemplates.CANDIDATE_DETAILS;
    let sampleData: any[] = [];

    
    const sampleRow: any = {};
    currentTemplate.header.forEach((header: string, index: number) => {
      const headerLower = header.toLowerCase();
      const bodyType = currentTemplate.bodyType[index];
      
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

    XLSX.writeFile(workbook, `${selectedTable}_Template.xlsx`);
  };

  const currentTemplate = tableTemplates[selectedTable] || tableTemplates.CANDIDATE_DETAILS;

  return (
    <div className="container-fluid py-3">
      <div className="bg-white rounded p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0">Bulk Upload</h4>
        </div>

        <div className="row mb-4">
          <div className="col-md-6">
            <div className="text-muted fs14 mb-2">Select Table</div>
            <FormControl fullWidth>
              <Select
                size="small"
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                style={{ backgroundColor: "#F3F3F3" }}
              >
                <MenuItem value="CANDIDATE_DETAILS">Candidate Details</MenuItem>
                <MenuItem value="COTS">Cots</MenuItem>
                <MenuItem value="ROOMS">Rooms</MenuItem>
                <MenuItem value="VACATE">Vacate</MenuItem>
                <MenuItem value="Users">Users</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>

        <div className="bg-light rounded p-4">
          <h5 className="mb-3">{selectedTable} Bulk Upload</h5>
          <div className="d-flex gap-2 mb-3">
            <Button
              variant="outlined"
              size="small"
              startIcon={<Download />}
              onClick={handleDownloadTemplate}
              className="text-capitalize"
            >
              Download Template
            </Button>
            <BulkUploadData
              label={`${selectedTable} Bulk Upload`}
              templateArr={currentTemplate}
              onBulkUpload={handleBulkUpload}
              hideTemplate={true}
            />
          </div>
        </div>

        <div className="mt-4">
          <h6>Template Columns for {selectedTable}:</h6>
          <div className="bg-light p-3 rounded">
            <div className="d-flex flex-wrap gap-2">
              {currentTemplate.header.map((col: string, index: number) => (
                <span key={index} className="badge bg-secondary">
                  {col}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

