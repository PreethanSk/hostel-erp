const express = require("express");
const moment = require('moment');
const multer = require('multer');
const uploadBulkFile = multer({ dest: 'uploads/' });
const xlsx = require('xlsx');
const router = express.Router();
const db = require("../../models");

function excelDateToJSDate(value) {
    // if (!serial) return null
    // const utc_days = Math.floor(serial - 25569); // 25569 = days between Jan 1, 1900 and Jan 1, 1970
    // const utc_value = utc_days * 86400; // seconds in a day
    // const date_info = new Date(utc_value * 1000);

    // return date_info.toISOString().split('T')[0]; // returns 'YYYY-MM-DD'
     if (!value) return null;

    // 1️⃣ Excel serial number (numeric)
    if (typeof value === 'number') {
        const utc_days = value - 25569;
        const utc_value = utc_days * 86400;
        return new Date(utc_value * 1000).toISOString().split("T")[0];
    }

    // 2️⃣ DD/MM/YYYY (19/03/2004)
    if (typeof value === 'string' && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
        const [d, m, y] = value.split('/');
        const date = new Date(Number(y), Number(m) - 1, Number(d));
        return date.toISOString().split("T")[0];  // YYYY-MM-DD
    }

    // 3️⃣ DD/MMM/YYYY (e.g., 16/Jul/2022)
    if (typeof value === 'string') {
        const monthNames = {
            Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
            Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
        };

        const parts = value.split('/');
        if (parts.length === 3 && isNaN(parts[1])) {
            const [d, mon, y] = parts;
            const m = monthNames[mon.substring(0, 3)];
            const date = new Date(Number(y), m, Number(d));
            return date.toISOString().split("T")[0];
        }
    }

    return null;
}

// candidate-bulk
router.post('/api/upload-bulk-data-candidate', uploadBulkFile.single('file'), async (req, res) => {
    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet]);


    let tempData = [];
    try {
        let nextNumber = 1;
        for (const row of data) {
            console.log(row, row['S.No'])
            if (row['Status'] !== 'Active') { continue }

            const candidateBody = {
                id: 0,
                candidateId: `SLHCHE${String(nextNumber++).padStart(4, '0')}` || null,
                name: row['Full Name'],
                dob: excelDateToJSDate(row['DOB\n(DD/MM/YYYY)']) || null,
                gender: row.gender || 'F',
                mobileNumber: row['Contact Number'] ? row['Contact Number']?.toString()?.split('/')?.length > 0 ? row['Contact Number']?.toString()?.split('/')[0]?.trim() : null : null,
                mobileCountryCode: '91',
                email: row['Mail Id']?.trim() || null,
                address: row['Home Address']?.trim()?.slice(0, 250) || null,
                place: null,
                city: 'Chennai',
                pincode: null,
                state: 31,
                country: 101,
                blackListed: null,
                blackListedReason: null,
                blackListedBy: null,
                profilePicture: null,
                isActive: true,
            };
            if(!candidateBody?.mobileNumber) { continue }

            console.log("candidateBody", candidateBody)
            const candidateInsert = await db.CandidateDetails.create({ ...candidateBody });
            // const candidateResult = await db.CandidateDetails.findOne({ where: { candidateId: candidateInsert?.id } });
            const candidateRefId = candidateInsert?.id || null;
            // const branchResult = await db.BranchDetails.findOne({ where: { branchName: row.branchRefId } });
            const branchRefId = 4 || null;
            const roomResult = await db.Rooms.findOne({ where: { branchId: branchRefId, roomNumber: row['Room no'] ? row['Room no'].trim() : '' } });
            const roomRefId = roomResult?.id || null;
            const cotResult = await db.Cots.findOne({ where: { roomId: roomRefId, cotNumber: row['Cot no'] ? row['Cot no'].trim() : '' } });
            const cotRefId = cotResult?.id || null;
            console.log("###", candidateRefId, branchRefId, roomRefId, cotRefId)
            if (!candidateRefId) continue
            if (!branchRefId) continue
            if (!roomRefId) continue
            if (!cotRefId) continue
            const admissionBody = {
                id: 0,
                candidateRefId: candidateInsert?.id || 0,
                branchRefId: 1 || null,
                roomRefId: roomRefId || null,
                cotRefId: cotRefId || null,
                dateOfAdmission: excelDateToJSDate(row['DOJ\n(DD/MM/YYYY)']) || null,
                dateOfNotice: null,
                admissionFee: row['Admission Fee'] || null,
                advancePaid: row['Advance Paid'] || null,
                monthlyRent: row['Room Tariff'] || null,
                lateFeeAmount: row['lateFeeAmount'] || null,
                noDayStayType: row['Stay Type(Regular/Daily)'] === 'Day Stay' ? 'Days' : 'Month',
                noDayStay: null,
                admissionStatus: 'Approved',
                paymentStatus: 'Paid',
                dues: 0,
                admittedBy: null,
                isActive: true,
            }
            console.log("admissionBody", admissionBody)
            let admissionInsert = null
            try {
                admissionInsert = await db.CandidateAdmission.create({ ...admissionBody });
            } catch (error) {
                continue
            }
            // const admissionResult = await db.CandidateAdmission.findOne({ where: { candidateId: admissionInsert?.id } });
            const admissionRefId = admissionInsert?.id || null;
            if (!admissionRefId) continue
            const contactNameMatch = `${row['Home Contact Name']?.trim()}`.match(/\(([^)]+)\)/);
            const contactStr = row['Home Contact Number']?.toString()?.split('/')?.map((mItem) => mItem?.trim()) || null
            const contact1 = contactStr?.length > 0 ? contactStr[0] : null
            const contact2 = contactStr?.length > 1 ? contactStr[1] : null
            const contactNameStr = row['Home Contact Name']?.replace(/\s*\([^)]*\)/, "")?.trim() || null
            const contactName1 = contactNameStr?.split(',').length > 0 ? contactNameStr?.split(',')[0] : null;
            const contactName2 = contactNameStr?.split(',').length > 0 ? contactNameStr?.split(',')[1] : null;
            const contactPersonBody = {
                id: 0,
                admissionRefId: admissionRefId,
                candidateRefId: candidateRefId,
                name: contactName1 || null,
                relationshipType: contactNameMatch ? contactNameMatch[1] : null,
                mobileNumber: contact1 || null,
                name2: contactName2 || null,
                relationshipType2: null,
                mobileNumber2: contact2 || null,
                localGuardianStatus: (row['Local Gaurdian Name/Address'] !== 'None' || !row['Local Gaurdian Name/Address']) ? true : false,
                guardianName: row['Local Gaurdian Name/Address']?.trim() || null,
                guardianMobileNumber: null,
                guardianRelationshipType: row['Gaurdian Relation'] || null,
                guardianAddress: row['Local Gaurdian Name/Address']?.trim() || null,
                guardianPlace: null,
                guardianCity: 'Chennai',
                guardianPincode: null,
                guardianState: 31,
                guardianCountry: 101,
                isActive: true,
            };
            console.log("contactPersonBody", contactPersonBody)
            await db.CandidateContactPersonDetails.create({ ...contactPersonBody });

            const otherDetails = {
                id: 0,
                admissionRefId: admissionRefId,
                candidateRefId: candidateRefId,
                anySpecialCareRequired: false,
                detailsOfSpecialCare: null,
                howDoTheyKnowAboutUs: row['Knowusby'] ? row['Knowusby'].trim() : null,
                enquiryBeforeVisiting: false,
                isActive: true,
            };
            console.log("otherDetails", otherDetails)
            await db.CandidateOtherDetails.create({ ...otherDetails });

            const documentDetails = {
                id: 0,
                admissionRefId: admissionRefId,
                candidateRefId: candidateRefId,
                documentName: 'Aadhaar',
                documentNumber: row['Aadhar Number'] || null,
                documentUrl: null,
                isActive: true,
            };
            console.log("documentDetails", documentDetails)
            await db.CandidateDocumentDetails.create({ ...documentDetails });
            const totalPaid = admissionBody?.monthlyRent * moment().diff(admissionBody?.dateOfAdmission, 'months')
            const paymentDetails = {
                id: 0,
                admissionRefId: admissionRefId,
                candidateRefId: candidateRefId,
                paymentOption: 'All',
                paidAmount: admissionBody?.monthlyRent || null,
                dueToPaid: null,
                admissionFeePaid: admissionBody?.admissionFee || null,
                admissionFeePending: null,
                advancePaid: admissionBody?.advancePaid || null,
                advancePending: null,
                monthlyRentPaid: admissionBody?.monthlyRent || null,
                monthlyRentPending: null,
                lateFeePaid: null,
                lateFeePending: null,
                tokenAmountPaid: null,
                tokenAmountPending: 0,
                refundPaid: null,
                refundPending: null,
                cancellationFeePaid: null,
                cancellationFeePending: null,
                ebChargePaid: null,
                ebChargePending: null,
                miscellaneousPaid: null,
                miscellaneousPending: null,
                totalPaidAmount: totalPaid || null,
                totalPendingAmount: null,
                dueDate: moment().format('YYYY-MM-DD'),
                isActive: true,
            };
            console.log("paymentDetails", paymentDetails)
            await db.CandidatePaymentDetails.create({ ...paymentDetails });
        }

        // await db.CandidateDetails.bulkCreate(tempData);

        return res.send(tempData);

    } catch (error) {
        console.log(error)
        return res.status(500).send({ error: error });
    }
});

// Admission_Table_BULK
router.post('/api/upload-bulk-data-admission', uploadBulkFile.single('file'), async (req, res) => {
    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.SheetNames[1];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet]);

    let tempData = [];

    try {
        // return res.send(data?.slice(0, 1));
        for (const row of data) {

            const candidateResult = await db.CandidateDetails.findOne({ where: { candidateId: row.candidateRefId } });
            const candidateRefId = candidateResult?.id || null;
            const branchResult = await db.BranchDetails.findOne({ where: { branchName: row.branchRefId } });
            const branchRefId = branchResult?.id || null;
            const roomResult = await db.Rooms.findOne({ where: { branchId: branchRefId, roomNumber: row.roomRefId } });
            const roomRefId = roomResult?.id || null;
            const cotResult = await db.Cots.findOne({ where: { roomId: roomRefId, cotNumber: row.cotRefId } });
            const cotRefId = cotResult?.id || null;
            if (!candidateRefId) continue
            if (!branchRefId) continue
            if (!roomRefId) continue
            if (!cotRefId) continue
            const body = {
                id: row.id || 0,
                candidateRefId: candidateRefId,
                branchRefId: branchRefId || null,
                roomRefId: roomRefId || null,
                cotRefId: cotRefId || null,
                dateOfAdmission: excelDateToJSDate(row.dateOfAdmission) || null,
                dateOfNotice: null,
                admissionFee: row.admissionFee + '',
                advancePaid: row.advancePaid + '',
                monthlyRent: row.monthlyRent + '',
                lateFeeAmount: null,
                noDayStayType: row.noDayStayType === 1 ? "Month" : "Days",
                noDayStay: row.noDayStay || 1,
                admissionStatus: row.admissionStatus,
                dues: row.dues,
                admittedBy: row.admittedBy,
                isActive: row.isActive === "YES" ? true : false,
            };

            tempData.push(body);
        }

        await db.CandidateAdmission.bulkCreate(tempData);

        return res.send(tempData);

    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
});

// PurposeOfStay-bulk
router.post('/api/upload-bulk-data-purpose-of-stay', uploadBulkFile.single('file'), async (req, res) => {
    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.SheetNames[2];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet]);

    let tempData = [];

    try {
        // return res.send(data?.slice(0, 1));
        for (const row of data) {

            const candidateResult = await db.CandidateDetails.findOne({ where: { candidateId: row.candidateRefId } });
            const candidateRefId = candidateResult?.id || null;
            const admissionResult = await db.CandidateAdmission.findOne({ where: { candidateRefId: candidateRefId } });
            const admissionRefId = admissionResult?.id || null;
            const stateResult = await db.MasterState.findOne({ where: { name: row.organizationState } });
            const stateRefId = stateResult?.id || null;
            // const cityResult = await db.MasterCity.findOne({ where: { name: row.organizationCity } });
            // const cityRefId = cityResult?.id || null;
            if (!admissionRefId) continue
            if (!candidateRefId) continue

            const body = {
                id: 0,
                admissionRefId: admissionRefId,
                candidateRefId: candidateRefId,
                mentionedPurpose: 'Others',
                reasonOfStay: row.reasonOfStay,
                organizationName: row.organizationName,
                organizationMobileNumber: row.organizationMobileNumber || null,
                organizationAddress: row.organizationAddress,
                organizationPlace: row.organizationPlace,
                organizationPincode: row.organizationPincode,
                organizationCity: row.organizationCity,
                organizationState: stateRefId,
                organizationCountry: 101,
                isActive: row.isActive === "YES" ? true : false,
            };

            tempData.push(body);
        }

        await db.CandidatePurposeOfStay.bulkCreate(tempData);

        return res.send(tempData);

    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
});

// contact_person_bulk
router.post('/api/upload-bulk-data-contact-person', uploadBulkFile.single('file'), async (req, res) => {
    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.SheetNames[3];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet]);

    let tempData = [];

    try {
        // return res.send(data?.slice(0, 1));
        for (const row of data) {

            const candidateResult = await db.CandidateDetails.findOne({ where: { candidateId: row.candidateRefId } });
            const candidateRefId = candidateResult?.id || null;
            const admissionResult = await db.CandidateAdmission.findOne({ where: { candidateRefId: candidateRefId } });
            const admissionRefId = admissionResult?.id || null;
            const stateResult = await db.MasterState.findOne({ where: { name: row.guardianState === "TamilNadu" ? "Tamil Nadu" : row.guardianState || "" } });
            const stateRefId = stateResult?.id || null;
            // const cityResult = await db.MasterCity.findOne({ where: { name: row?.guardianCity || "" } });
            // const cityRefId = cityResult?.id || null;
            if (!admissionRefId) continue
            if (!candidateRefId) continue

            const body = {
                id: 0,
                admissionRefId: admissionRefId,
                candidateRefId: candidateRefId,
                name: row?.name || null,
                relationshipType: row?.relationshipType || null,
                mobileNumber: row?.mobileNumber || null,
                name2: row?.name2 || null,
                relationshipType2: row?.relationshipType2 || null,
                mobileNumber2: row?.mobileNumber2 || null,
                localGuardianStatus: row?.localGuardianStatus || false,
                guardianName: row?.guardianName || null,
                guardianMobileNumber: row?.guardianMobileNumber || null,
                guardianRelationshipType: row?.guardianRelationshipType || null,
                guardianAddress: row?.guardianAddress || null,
                guardianPlace: row?.guardianPlace || null,
                guardianCity: row?.guardianCity || null,
                guardianPincode: row?.guardianPincode || null,
                guardianState: stateRefId || null,
                guardianCountry: 101,
                isActive: row?.isActive === "YES" ? true : false,
            };

            tempData.push(body);
        }

        await db.CandidateContactPersonDetails.bulkCreate(tempData);

        return res.send(tempData);

    } catch (error) {
        return res.status(500).send({
            error: error.message,
            stack: error.stack
        });
    }
});


// payment_details_bulk
router.post('/api/upload-bulk-data-payment-details', uploadBulkFile.single('file'), async (req, res) => {
    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.SheetNames[4];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet]);

    let tempData = [];

    try {
        // return res.send(data?.slice(0, 1));
        for (const row of data?.slice(2)) {

            const candidateResult = await db.CandidateDetails.findOne({ where: { candidateId: row.candidateRefId } });
            const candidateRefId = candidateResult?.id || null;
            const admissionResult = await db.CandidateAdmission.findOne({ where: { candidateRefId: candidateRefId } });
            const admissionRefId = admissionResult?.id || null;

            if (!admissionRefId) continue
            if (!candidateRefId) continue

            const body = {
                id: 0,
                admissionRefId: admissionRefId,
                candidateRefId: candidateRefId,
                paymentOption: row?.paymentOption || null,
                paidAmount: row?.paidAmount || null,
                dueToPaid: row?.dueToPaid || null,
                dueDate: excelDateToJSDate(row?.dueDate),
                isActive: row?.isActive === "YES" ? true : false,
            };

            tempData.push(body);
        }

        await db.CandidatePaymentDetails.bulkCreate(tempData);

        return res.send(tempData);

    } catch (error) {
        return res.status(500).send({
            error: error.message,
            stack: error.stack
        });
    }
});


// other_details_bulk
router.post('/api/upload-bulk-data-other-details', uploadBulkFile.single('file'), async (req, res) => {
    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.SheetNames[5];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet]);

    let tempData = [];

    try {
        // return res.send(data?.slice(0, 1));
        for (const row of data) {

            const candidateResult = await db.CandidateDetails.findOne({ where: { candidateId: row.candidateRefId } });
            const candidateRefId = candidateResult?.id || null;
            const admissionResult = await db.CandidateAdmission.findOne({ where: { candidateRefId: candidateRefId } });
            const admissionRefId = admissionResult?.id || null;

            if (!admissionRefId) continue
            if (!candidateRefId) continue

            const body = {
                id: 0,
                admissionRefId: admissionRefId,
                candidateRefId: candidateRefId,
                anySpecialCareRequired: row?.anySpecialCareRequired === 'Yes' ? true : false,
                detailsOfSpecialCare: row?.detailsOfSpecialCare,
                howDoTheyKnowAboutUs: row?.howDoTheyKnowAboutUs,
                enquiryBeforeVisiting: row?.enquiryBeforeVisiting === "Yes" ? true : false,
                isActive: row?.isActive === "YES" ? true : false,
            };

            tempData.push(body);
        }

        await db.CandidateOtherDetails.bulkCreate(tempData);

        return res.send(tempData);

    } catch (error) {
        return res.status(500).send({
            error: error.message,
            stack: error.stack
        });
    }
});


// branch_details_bulk
router.post('/api/upload-bulk-data-branch', uploadBulkFile.single('file'), async (req, res) => {
    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet]);

    let tempData = [];

    try {
        for (const row of data) {
            const body = {
                id: row.id || 0,
                branchCode: row.Branchid,
                branchName: row.branchName?.trim(),
                contactPerson: row.contactPerson?.trim(),
                branchAddress: row.branchAddress,
                numberOfRooms: row.numberOfRooms,
                numberOfCots: row.numberOfCots,
                isActive: row.isActive || false,
                mobileNumber: row.mobileNumber,
                city: "",//row.city,
                pincode: row.pincode,
                state: 31,//row.state,
                country: 101,//row.country,
                notes: row.notes,
                totalCots: row.totalCots,
            };
            tempData.push(body);
        }

        await db.BranchDetails.bulkCreate(tempData);

        return res.send(tempData);
    } catch (error) {
        return res.status(500).send({
            error: error.message,
            stack: error.stack
        });
    }
});

// rooms_bulk
router.post('/api/upload-bulk-data-rooms', uploadBulkFile.single('file'), async (req, res) => {
    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet]);

    let tempData = [];

    try {
        for (const row of data) {
            const branchResult = await db.BranchDetails.findOne({ where: { branchCode: row.branchId } });
            const branchRefId = branchResult?.id || null;
            const [roomResult] = await db.MasterRoomTypes.findOrCreate({ where: { type: row.Roomtype, isActive: true } });
            const roomRefId = roomResult?.id || null;
            const [sharingResult] = await db.MasterSharingTypes.findOrCreate({ where: { type: row.sharingTypeId, isActive: true } });
            const sharingRefId = sharingResult?.id || null;
            const [bathroomResult] = await db.MasterBathroomType.findOrCreate({ where: { type: row.bathroomTypeId, isActive: true } });
            const bathroomRefId = bathroomResult?.id || null;
            // console.log(roomRefId, roomResult)
            if (!branchRefId) continue
            if (!roomRefId) continue
            if (!sharingRefId) continue
            if (!bathroomRefId) continue

            const body = {
                id: row.id || 0,
                branchId: branchRefId,
                roomTypeId: roomRefId,
                sharingTypeId: sharingRefId,
                bathroomTypeId: bathroomRefId,
                roomNumber: row["Room Name"]?.trim(),
                floorNumber: row.floorNumber?.toString()?.trim(),
                roomSize: row.roomSize?.toString()?.trim(),
                numberOfCots: row.numberOfCots,
                oneDayStay: row.oneDayStay ? true : false,
                admissionFee: row.admissionFee,
                advanceAmount: row.advanceAmount,
                lateFeeAmount: row.lateFeeAmount,
                isActive: row.isActive || false,
                notes: row.notes || null,
            };
            tempData.push(body);
        }

        await db.Rooms.bulkCreate(tempData);

        return res.send(tempData);
    } catch (error) {
        return res.status(500).send({
            error: error.message,
            stack: error.stack
        });
    }
})

// cots_bulk
router.post('/api/upload-bulk-data-cots', uploadBulkFile.single('file'), async (req, res) => {
    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet]);

    let tempData = [];

    try {
        let count = 1
        for (const row of data) {
            const branchResult = await db.BranchDetails.findOne({ where: { branchCode: row.branchId?.toString()?.trim() } });
            const branchRefId = branchResult?.id || null;
            const roomResult = await db.Rooms.findOne({ where: { roomNumber: row['Room Name']?.trim(), branchId: branchRefId } });
            const roomRefId = roomResult?.id || null;
            const [cotTypeResult] = await db.MasterCotTypes.findOrCreate({ where: { type: row.cotTypeId?.toString()?.trim() } });
            const cotTypeRefId = cotTypeResult?.id || null;
            console.log(count++, row.branchId, roomRefId, "@@@", row?.cotNumber)
            if (!roomRefId) continue
            console.log(count)

            const body = {
                id: row.id || 0,
                roomId: roomRefId,
                cotTypeId: cotTypeRefId,
                cotNumber: row.cotNumber?.toString()?.trim(),
                rentAmount: row.rentAmount?.toString()?.trim(),
                advanceAmount: row.advanceAmount?.toString()?.trim(),
                perDayRent: row.perDayRent?.toString()?.trim(),
                cotPhotos: null,
                isActive: true,
            };

            tempData.push(body);
        }

        await db.Cots.bulkCreate(tempData);

        return res.send(tempData);
    } catch (error) {
        return res.status(500).send({
            error: error.message,
            stack: error.stack
        });
    }
});

module.exports = router;