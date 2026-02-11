const axios = require("axios");
require("dotenv").config();

const MSG91_BASE_URL = "https://api.msg91.com/api/v5/widget";

/**
 * Send OTP to a mobile number using MSG91
 * @param {string} mobileNumber - 10-digit mobile number (without country code)
 * @returns {Promise<object>} - MSG91 API response
 */
async function sendSmsOTP(mobileNumber) {
    try {
        const response = await axios.post(`${MSG91_BASE_URL}/sendOtp`, {
            "widgetId": process.env.OTP_WIDGET_KEY,
            "identifier": mobileNumber
        },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'authkey': process.env.SMS_AUTH_KEY
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error("MSG91 Send OTP Error:", error);
        throw new Error(error.response?.data?.message || "Failed to send OTP");
    }
}

/**
 * Verify OTP for a mobile number using MSG91
 * @param {string} mobileNumber - 10-digit mobile number (without country code)
 * @param {string} otp - OTP entered by the user
 * @returns {Promise<object>} - MSG91 API response
 */
async function verifySmsOTP(reqId, otp) {
    try {
        const response = await axios.post(`${MSG91_BASE_URL}/verifyOtp`, {
            "widgetId": process.env.OTP_WIDGET_KEY,
            "reqId": reqId,
            "otp": otp
        },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'authkey': process.env.SMS_AUTH_KEY
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("MSG91 Verify OTP Error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Failed to verify OTP");
    }
}

module.exports = { sendSmsOTP, verifySmsOTP };
