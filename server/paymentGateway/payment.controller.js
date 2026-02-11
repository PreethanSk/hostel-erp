const { encryptEas } = require('./components/encryptEas');
const { decryptEas } = require('./components/decryptEas');
const { formatResponse } = require('../helpers/utility.helper');
const con = require('../app.config');
const moment = require("moment");
const db = require('../models');
const { sendInvoice, generateInvoicePDF } = require('../controllers/sendInvoice.controller');
const candidateDetailsController = require('../controllers/candidateDetails.controller');
require('dotenv').config();

const getepayPortal = async (data, config) => {
    const fetch = (await import('node-fetch')).default;

    return new Promise((resolve, reject) => {
        const JsonData = JSON.stringify(data);
        const ciphertext = encryptEas(JsonData, config["GetepayKey"], config["GetepayIV"]);
        const newCipher = ciphertext?.toUpperCase();
        const myHeaders = { "Content-Type": "application/json" };
        const raw = JSON.stringify({ mid: data?.mid, terminalId: data?.terminalId, req: newCipher, });
        const requestOptions = { method: "POST", headers: myHeaders, body: raw, redirect: "follow", };
        fetch(config["GetepayUrl"], requestOptions)
            .then((response) => response?.text())
            .then((result) => {
                const resultobj = JSON.parse(result);
                const responseurl = resultobj?.response;
                const dataitem = decryptEas(responseurl, config["GetepayKey"], config["GetepayIV"]);
                const parsedData = JSON.parse(dataitem);
                const paymentUrl = parsedData?.paymentUrl;
                resolve(paymentUrl);
            })
            .catch((error) => reject(error));
    });
};

const generateMerchantTransactionId = () => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 6);
    return `SLH${timestamp}${randomStr}`?.toUpperCase();
};

exports.gatewayPortalPage = async (req, res) => {
    try {
        const { amount, mobileNumber, name, email, admissionId, candidateId } = req.body;
        const merchantId = generateMerchantTransactionId()
        // const returnUrl = "http://localhost:14321/api/success_payment"
        const returnUrl = con.serverHost + "/api/success_payment"
        const data = {
            mid: process.env.GetepayMid,
            terminalId: process.env.GeepayTerminalId,
            amount: amount,
            merchantTransactionId: merchantId,
            transactionDate: moment(),
            udf1: mobileNumber,
            udf2: email,
            udf3: name,
            udf4: admissionId || "",
            udf5: candidateId || "",
            udf6: `<products>
                        <product>
                            <code>Code001</code>
                            <name>test</name>
                            <amount>${amount / 3}</amount>
                        </product>
                        <product>
                            <code>psp123</code>
                            <name>test</name>
                            <amount>${amount / 3}</amount>
                        </product>
                    </products>`,
            udf7: "",
            udf8: "",
            udf9: "",
            udf10: "",
            ru: returnUrl,
            callbackUrl: "https://webhook.site/4d789f98-aa5e-444e-98fc-f041a150039a",
            currency: "INR",
            paymentMode: "ALL",
            bankId: "",
            txnType: "multiple", // "multiple"
            productType: "IPG",
            txnNote: "Test Txn",
            vpa: process.env.GeepayTerminalId,
        };

        const config = {
            GetepayMid: process.env.GetepayMid,
            GeepayTerminalId: process.env.GeepayTerminalId,
            GetepayKey: process.env.GetepayKey,
            GetepayIV: process.env.GetepayIV,
            GetepayUrl: process.env.GetepayUrl,
        };

        getepayPortal(data, config)
            .then(async (paymentUrl) => {
                console.log(paymentUrl)
                const responseData = {
                    data: data,
                    config: config,
                    redirectTo: paymentUrl
                }

                // res.render("home", {
                //     data: data,
                //     config: config,
                //     getepayPortal: paymentUrl
                // });
                // res(paymentUrl);
                // res.redirect(responseData.redirectTo)
                return res.status(200).json(await formatResponse.success({ ...responseData }));
            })
            .catch((error) => {
                console.error("Error:", error);
                res.status(500).send("Internal Server Error");
            });
    } catch (error) {
        console.log(error)
        return res.status(500).json(await formatResponse.error("Something went wrong"));

    }
}

function roundToTwo(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
}

exports.updatePaymentStatus = async (req, res) => {
    try {
        const { candidateId, admissionId, paidAmount, paymentMode, onAccountOf, paymentResponse } = req.body;
        console.log("####", paymentResponse)
        const admission = await db.CandidateAdmission.findByPk(admissionId);
        if (!admission) {
            return res.status(404).json(await formatResponse.error("Admission Id not found"));
        }
        if (admission?.paymentStatus === 'Paid') {
            return res.status(200).json(await formatResponse.success("Payment already done"));
        }

        const candidateData = await db.CandidatePaymentDetails.findOne({
            where: {
                candidateRefId: Number(candidateId),
                admissionRefId: Number(admissionId)
            }
        });

        const paymentOrder = [
            { admissionKey: 'admissionFee', paidKey: 'admissionFeePaid', pendingKey: 'admissionFeePending' },
            { admissionKey: 'advancePaid', paidKey: 'advancePaid', pendingKey: 'advancePending' },
            { admissionKey: 'monthlyRent', paidKey: 'monthlyRentPaid', pendingKey: 'monthlyRentPending' },
            { admissionKey: 'lateFeeAmount', paidKey: 'lateFeePaid', pendingKey: 'lateFeePending' },
            { admissionKey: 'tokenAmount', paidKey: 'tokenAmountPaid', pendingKey: 'tokenAmountPending' },
            { admissionKey: 'cancellationFee', paidKey: 'cancellationFeePaid', pendingKey: 'cancellationFeePending' },
            { admissionKey: 'refundAmount', paidKey: 'refundPaid', pendingKey: 'refundPending' },
            { admissionKey: 'ebCharges', paidKey: 'ebChargePaid', pendingKey: 'ebChargePending' },
            { admissionKey: 'miscellaneousCharges', paidKey: 'miscellaneousPaid', pendingKey: 'miscellaneousPending' },
        ];

        const updatedPayment = { ...candidateData.get({ plain: true }) };
        let paidNow = Number(candidateData?.paidAmount || '0') + Number(paidAmount || '0');
        // const dueToPaid = Number(candidateData?.dueToPaid || '0') - Number(paidAmount || '0');
        let remainingAmount = Number(paidAmount || '0');
        if (!Number(updatedPayment?.admissionFeePaid || "0")) {
            remainingAmount += Number(updatedPayment.tokenAmountPaid || '0')
            paidNow += Number(updatedPayment.tokenAmountPaid || '0')
        }

        for (const { paidKey, pendingKey } of paymentOrder) {
            const pending = Number(updatedPayment[pendingKey]) || 0;
            if (pending > 0 && remainingAmount > 0) {
                const appliedAmount = Math.min(remainingAmount, pending);
                updatedPayment[paidKey] = roundToTwo(Number(updatedPayment[paidKey] || 0) + appliedAmount);
                updatedPayment[pendingKey] = roundToTwo(pending - appliedAmount);
                remainingAmount -= appliedAmount;
            }

            if (remainingAmount <= 0) break;
        }

        // 2️⃣ Recalculate pending from admission amounts - updated paid values
        let totalPending = 0;

        for (const { pendingKey } of paymentOrder) {
            // let admissionAmount = Number(admission[admissionKey] || 0);

            // // Apply adjusted monthly rent if needed
            // if (admissionKey === 'monthlyRent' && admission.noDayStayType === 'Month' && admission.dateOfAdmission) {
            //     const dateOfAdmission = moment(admission.dateOfAdmission, 'YYYY-MM-DD');
            //     const endOfMonth = moment(dateOfAdmission).endOf('month');
            //     const stayDays = endOfMonth.diff(dateOfAdmission, 'days') + 1;
            //     const daysInMonth = dateOfAdmission.daysInMonth();

            //     const perDayRent = admissionAmount / daysInMonth;
            //     admissionAmount = parseFloat((perDayRent * stayDays).toFixed(2));
            // }
            // const paidAmount = Number(updatedPayment[paidKey] || 0);
            // const newPending = admissionAmount - paidAmount;

            // updatedPayment[pendingKey] = newPending > 0 ? roundToTwo(newPending) : 0;
            totalPending += roundToTwo(Number(updatedPayment[pendingKey] || '0'));
        }

        updatedPayment.totalPaidAmount = roundToTwo((Number(paidNow)));
        updatedPayment.totalPendingAmount = roundToTwo(totalPending);
        updatedPayment.paidAmount = roundToTwo((Number(paidNow))) < 0 ? '0' : roundToTwo((Number(paidNow)));
        updatedPayment.dueToPaid = roundToTwo(totalPending) < 0 ? '0' : roundToTwo(totalPending)?.toString();

        await db.CandidatePaymentDetails.update(updatedPayment, {
            where: {
                candidateRefId: Number(candidateId),
                admissionRefId: Number(admissionId),
            }
        });

        const admissionBody = {
            dues: updatedPayment.totalPendingAmount,
            paymentStatus: updatedPayment.totalPendingAmount <= 0 ? 'Paid' : 'Partially Paid',
        }


        const newSchedule = await db.CandidatePaymentSchedule.create({
            admissionRefId: admissionId,
            candidateRefId: candidateId,
            scheduledDate: candidateData?.dueDate,
            amountDue: admissionBody?.dues,
            amountPaid: roundToTwo(Number(paidAmount || '0')),
            status: admissionBody?.paymentStatus === "Paid" ? 'paid' : 'partial',
            paymentResponse: JSON.stringify(paymentResponse),
            isActive: true
        })

        const scheduleId = newSchedule.id;
        // const candidatePayment = {
        //     paidAmount: paidNow < 0 ? '0' : paidNow?.toString(),
        //     dueToPaid: updatedPayment.totalPendingAmount < 0 ? '0' : updatedPayment.totalPendingAmount?.toString(),
        // }

        console.log("####", candidateId, admissionId)
        if (updatedPayment.totalPendingAmount <= 0) {
            await db.CandidatePaymentSchedule.update(
                {
                    status: 'paid',
                    paymentDate: moment().format('YYYY-MM-DD'),
                    amountPaid: roundToTwo(Number(paidAmount || '0')),
                    amountDue: 0
                },
                {
                    where: {
                        candidateRefId: Number(candidateId),
                        admissionRefId: Number(admissionId),
                        status: { [db.Sequelize.Op.ne]: 'paid' }
                    }
                }
            );
        }
        const request = {
            query: {
                id: scheduleId,
                sendMail: true
            }
        };

        const response = {
            status: (code) => ({
                json: (data) => console.log("Response:", code, data)
            })
        };
        await generateInvoicePDF(request, response)
        

        return res.status(200).json(await formatResponse.success('Updated Successfully'));
    } catch (error) {
        console.log(error)
        return res.status(500).json(await formatResponse.error('Something went wrong'));
    }
}