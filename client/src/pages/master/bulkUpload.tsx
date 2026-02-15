import { useState } from 'react';
import { Button, FormControl, MenuItem, Select, Box, Chip } from '@mui/material';
import { Download } from 'lucide-react';
import BulkUploadData from '../../components/helpers/BulkUploadData';
import { CustomAlert } from '../../services/HelperService';
import { bulkUploadCandidateDetails, bulkUploadCots, bulkUploadRooms, bulkUploadVacate, bulkUploadUsers } from '../../models';
import * as XLSX from 'xlsx';
import PageHeader from '../../components/shared/PageHeader';
import { gray } from '../../theme';

export default function BulkUpload({ PageAccess }: any) {
  const [selectedTable, setSelectedTable] = useState<string>('CANDIDATE_DETAILS');

  const tableTemplates: any = {
    CANDIDATE_DETAILS: {
      header: ['name', 'mobileNumber', 'email', 'dob', 'gender', 'mobileCountryCode', 'address', 'place', 'city', 'pincode', 'state', 'country', 'isActive'],
      bodyType: ['string', 'string', 'string', 'date', 'string', 'string', 'string', 'string', 'string', 'string', 'string', 'string', 'boolean'],
    },
    COTS: {
      header: ['roomId', 'cotTypeId', 'cotNumber', 'rentAmount', 'advanceAmount', 'perDayRent', 'isActive'],
      bodyType: ['number', 'number', 'string', 'string', 'string', 'string', 'boolean'],
    },
    ROOMS: {
      header: ['branchId', 'roomTypeId', 'sharingTypeId', 'bathroomTypeId', 'roomSize', 'roomNumber', 'floorNumber', 'numberOfCots', 'oneDayStay', 'admissionFee', 'advanceAmount', 'lateFeeAmount', 'isActive', 'notes'],
      bodyType: ['number', 'number', 'number', 'number', 'string', 'string', 'string', 'string', 'boolean', 'string', 'string', 'string', 'boolean', 'string'],
    },
    VACATE: {
      header: ['candidateRefId', 'branchRefId', 'admissionRefId', 'vacateType', 'vacateStatus', 'damageRemarks', 'payableAdvancePaid', 'payableAdmissionFee', 'payableMonthlyRent', 'payablePenalty', 'payableDuePending', 'dateOfNoticeGiven', 'proposedVacatingDate', 'actualVacatingDate', 'isActive'],
      bodyType: ['number', 'number', 'number', 'string', 'string', 'string', 'string', 'string', 'string', 'string', 'string', 'date', 'date', 'date', 'boolean'],
    },
    Users: {
      header: ['firstName', 'middleName', 'lastName', 'emailAddress', 'mobileNumber', 'userRoleId', 'branchId', 'isActive'],
      bodyType: ['string', 'string', 'string', 'string', 'string', 'number', 'number', 'boolean'],
    },
  };

  const handleBulkUpload = async (rows: any[]) => {
    try {
      let response: any;

      switch (selectedTable) {
        case 'CANDIDATE_DETAILS':
          response = await bulkUploadCandidateDetails({ data: rows });
          break;
        case 'COTS':
          response = await bulkUploadCots({ data: rows });
          break;
        case 'ROOMS':
          response = await bulkUploadRooms({ data: rows });
          break;
        case 'VACATE':
          response = await bulkUploadVacate({ data: rows });
          break;
        case 'Users':
          response = await bulkUploadUsers({ data: rows });
          break;
        default:
          CustomAlert('error', 'Invalid table selected');
          return { success: 0, error: rows.length };
      }

      if (response?.data?.status === 'success') {
        const result = response.data.result;
        const summary = result.summary || {};
        const errors = result.errors || [];

        if (errors.length > 0) {
          return {
            success: summary.success || 0,
            error: summary.error || 0,
            errors,
            errorDetails: `Found ${errors.length} error(s) in the uploaded data.`,
          };
        }

        return { success: summary.success || 0, error: summary.error || 0 };
      } else {
        const errorMsg = response?.data?.error || response?.data?.msg || 'Upload failed';
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('Bulk upload error:', error);
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

    const worksheet = XLSX.utils.json_to_sheet([sampleRow]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    XLSX.writeFile(workbook, `${selectedTable}_Template.xlsx`);
  };

  const currentTemplate = tableTemplates[selectedTable] || tableTemplates.CANDIDATE_DETAILS;

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader title="Bulk Upload" description="Import data from Excel files" />

      <Box sx={{ mb: 3 }}>
        <Box sx={{ fontSize: '12px', fontWeight: 500, color: gray[700], mb: 0.75 }}>Select Table</Box>
        <FormControl sx={{ minWidth: 300 }}>
          <Select
            size="small"
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
          >
            <MenuItem value="CANDIDATE_DETAILS">Candidate Details</MenuItem>
            <MenuItem value="COTS">Cots</MenuItem>
            <MenuItem value="ROOMS">Rooms</MenuItem>
            <MenuItem value="VACATE">Vacate</MenuItem>
            <MenuItem value="Users">Users</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ backgroundColor: gray[50], border: `1px solid ${gray[200]}`, borderRadius: 2, p: 3, mb: 3 }}>
        <Box sx={{ fontWeight: 600, fontSize: '16px', mb: 2 }}>{selectedTable} Bulk Upload</Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Download size={16} />}
            onClick={handleDownloadTemplate}
            sx={{ textTransform: 'none' }}
          >
            Download Template
          </Button>
          <BulkUploadData
            label={`${selectedTable} Bulk Upload`}
            templateArr={currentTemplate}
            onBulkUpload={handleBulkUpload}
            hideTemplate={true}
          />
        </Box>
      </Box>

      <Box>
        <Box sx={{ fontWeight: 600, fontSize: '14px', mb: 1.5 }}>Template Columns for {selectedTable}:</Box>
        <Box sx={{ backgroundColor: gray[50], border: `1px solid ${gray[200]}`, borderRadius: 2, p: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {currentTemplate.header.map((col: string, index: number) => (
            <Chip key={index} label={col} size="small" />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
