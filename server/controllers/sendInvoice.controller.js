global.ReadableStream = require('web-streams-polyfill/ponyfill').ReadableStream;
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { formatResponse } = require("../helpers/utility.helper");
const { sendEmailWithPDF } = require('../helpers/email.helper');
const db = require('../models');
const { Op } = require('sequelize');


const numberToWords = (amount) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    const convertLessThanOneThousand = (num) => {
        if (num === 0) return '';

        if (num < 10) return ones[num];
        if (num < 20) return teens[num - 10];
        if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
        return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' and ' + convertLessThanOneThousand(num % 100) : '');
    };

    const convert = (num) => {
        if (num === 0) return 'Zero';
        if (num < 1000) return convertLessThanOneThousand(num);
        if (num < 100000) return convertLessThanOneThousand(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + convertLessThanOneThousand(num % 1000) : '');
        if (num < 10000000) return convertLessThanOneThousand(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 !== 0 ? ' ' + convert(Math.floor(num / 1000) % 100) + ' Thousand' + (num % 1000 !== 0 ? ' ' + convertLessThanOneThousand(num % 1000) : '') : '');
        return convertLessThanOneThousand(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 !== 0 ? ' ' + convert(num % 10000000) : '');
    };

    const rupees = Math.floor(amount);
    const paise = Math.round((amount - rupees) * 100);

    let result = convert(rupees) + ' Rupees';
    if (paise > 0) {
        result += ' and ' + convert(paise) + ' Paise';
    }
    result += ' Only';

    return result;
};


const generatePDF = async (htmlContent) => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        return await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            }
        });
    }
    catch (err) { console.log(err) }
    finally {
        await browser.close();
    }
};

exports.generateInvoicePDF = async (req, res) => {
    try {
        const { id, sendMail } = req.query;

        if (!id) {
            return res.status(400).json(await formatResponse.error("Missing required fields"));
        }
        const [[paymentDetail]] = await db.sequelize.query(
            `SELECT cps.*, cd.name, cd.email, br.branchAddress, ca.noDayStayType, br.branchName, rm.roomNumber
            FROM CANDIDATE_PAYMENT_SCHEDULE cps
            LEFT JOIN CANDIDATE_DETAILS cd ON cps.candidateRefId = cd.id
            LEFT JOIN CANDIDATE_ADMISSION ca ON cps.admissionRefId = ca.id
            LEFT JOIN BRANCH_DETAILS br ON br.id = ca.branchRefId
            LEFT JOIN ROOMS rm ON rm.id = ca.roomRefId
            WHERE cps.id = ${id}`);
        if (!paymentDetail) {
            return res.status(400).json(await formatResponse.error("No payment details available"));
        }

        const formattedDate = paymentDetail?.updatedAt ? moment(paymentDetail?.updatedAt).format('DD-MMM-YYYY') : '';
        const amountInWords = numberToWords(parseFloat(paymentDetail?.amountPaid));

        const formattedAmount = parseFloat(paymentDetail?.amountPaid).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        const templatePath = path.resolve('./config', 'invoiceTemplate.html');
        let htmlContent = fs.readFileSync(templatePath, 'utf8');

        htmlContent = htmlContent.replace('#branchAddress', paymentDetail?.branchAddress || 'NO: 23/27, Sadayappan Street, Mandhaveli');
        htmlContent = htmlContent.replace('#receiptNo', moment(paymentDetail?.updatedAt).valueOf());
        htmlContent = htmlContent.replace('#receiptDate', formattedDate);
        htmlContent = htmlContent.replace('#paymentMode', 'Online');
        htmlContent = htmlContent.replace('#name', paymentDetail?.name?.charAt(0)?.toUpperCase() + paymentDetail?.name?.slice(1));
        htmlContent = htmlContent.replace('#paidFor', (paymentDetail?.noDayStayType === 'Month' ? moment(paymentDetail?.scheduleDate)?.format("MMMM YYYY") : moment(paymentDetail?.scheduleDate)?.format('DD-MM-YYYY')));
        htmlContent = htmlContent.replace('#branchName', paymentDetail?.branchName);
        htmlContent = htmlContent.replace('#roomNumber', paymentDetail?.roomNumber);
        htmlContent = htmlContent.replace('#amountInWords', `INR ${amountInWords}`);
        htmlContent = htmlContent.replace('#amount', formattedAmount);

        const pdfBuffer = await generatePDF(htmlContent);

        if (sendMail) {
            sendEmailWithPDF(paymentDetail?.email,
                `Receipt Voucher - ${moment(paymentDetail.updatedAt).format('DD_MM_YYYY')} - HostelHives`,
                pdfBuffer,
                `Receipt_${moment(paymentDetail.updatedAt).format('DD_MM_YYYY')}_${paymentDetail.name.replace(/\s+/g, '_')}.pdf`)
            return res.end();
        }
        res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="Receipt_${moment(paymentDetail.updatedAt).format('DD_MM_YYYY')}_${paymentDetail.name.replace(/\s+/g, '_')}.pdf"`,
            'Content-Length': pdfBuffer.length,
            'Content-Encoding': 'identity'
        });

        return res.end(pdfBuffer);
    } catch (error) {
        console.log('Generate PDF error:', error);
        return res.status(400).json(await formatResponse.error(error.message || 'Failed to generate PDF'));
    }
};

exports.getCandidateTransactionList = async (req, res) => {
    const { candidateId } = req.query;
    if (!candidateId) {
        return res.status(400).json(await formatResponse.error("Candidate Id required"));
    }

    const [response] = await db.sequelize.query(`SELECT cps.*, cd.name, ca.branchRefId, ca.dateOfAdmission, ca.roomRefId, ca.cotRefId,
        bd.branchName, rm.roomNumber, ct.cotNumber
        FROM CANDIDATE_PAYMENT_SCHEDULE cps
        LEFT JOIN CANDIDATE_DETAILS cd ON cps.candidateRefId = cd.id
        LEFT JOIN CANDIDATE_ADMISSION ca ON cps.admissionRefId = ca.id
        LEFT JOIN BRANCH_DETAILS bd ON ca.branchRefId = bd.id
        LEFT JOIN ROOMS rm ON ca.roomRefId = rm.id
        LEFT JOIN COTS ct ON ca.cotRefId = ct.id
        WHERE cps.candidateRefId = ${candidateId} and (status='paid' or status='partial')
        ORDER BY cps.id desc
        `)
    return res.status(200).json(await formatResponse.success(response));
}


