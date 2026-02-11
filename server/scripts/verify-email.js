/**
 * One-off script to verify SMTP email config.
 * Run from server folder: node scripts/verify-email.js
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "..", ".env") });
const config = require("../app.config");
const nodemailer = require("nodemailer");

const emailConfig = config.email;
if (!emailConfig?.host || !emailConfig?.user || !emailConfig?.pass) {
  console.error("Missing email config. Set EMAIL_HOST, EMAIL_USER, EMAIL_PASS in .env");
  process.exit(1);
}

// Trim password - .env often has trailing space
const pass = (emailConfig.pass || "").trim();
const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: parseInt(emailConfig.port, 10) || 587,
  secure: emailConfig.secure === true,
  auth: {
    user: emailConfig.user,
    pass: pass,
  },
  tls: { rejectUnauthorized: false },
});

transporter
  .verify()
  .then(() => {
    console.log("Email setup OK: SMTP connection verified.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Email setup FAIL:", err.message);
    process.exit(1);
  });
