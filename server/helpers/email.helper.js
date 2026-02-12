const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");

let emailTemplate = null; // cache the HTML
let transporter = null;   // reuse SMTP connection

// Initialize reusable resources ONCE
const initMailer = () => {
  if (!emailTemplate) {
    const filePath = path.resolve('./public', 'email-otp.html');
    emailTemplate = fs.readFileSync(filePath, 'utf8');
  }

  if (!transporter) {
    console.log("Transporter setup done.")
    const dbConfig = global.config.email;
    transporter = nodemailer.createTransport({
      host: dbConfig.host,
      port: parseInt(dbConfig.port),
      secure: parseInt(dbConfig.port) === 465 ? true : false,
      pool: true,              // ✅ use connection pooling
      maxConnections: 5,       // adjust as needed
      maxMessages: 100,        // reuse connections
      auth: {
        user: dbConfig.user,
        pass: dbConfig.pass,
      },
      tls: { rejectUnauthorized: false },
    });
  }
};

initMailer(); // make sure resources exist

module.exports.sendEmailOTP = async (_to, _otp, _message) => {
  try {
    let emailContent = emailTemplate
      .replace('{emailOTP}', _otp)
      .replace('{otpMessage}', _message);

    const mailOptions = {
      from: global.config.email.user,
      to: _to?.email,
      subject: 'HostelHost Email OTP',
      html: emailContent,
    };

    console.log("Sending OTP email with options:", {
      to: mailOptions.to,
      from: mailOptions.from,
      subject: mailOptions.subject,
    });

    const info = await transporter.sendMail(mailOptions);

    console.log("OTP email sent:", {
      to: mailOptions.to,
      messageId: info.messageId,
      response: info.response,
      envelope: info.envelope,
    });

    return { queued: true };
  } catch (error) {
    console.error('sendEmailOTP error:', error);
    return { queued: false, error: error.message };
  }
};

module.exports.sendEmailWithPDF = async (toEmail, subject, pdfBuffer, fileName) => {
  console.log(toEmail, subject, pdfBuffer, fileName);
  try {
    let mailOptions = {
      from: global.config.email.user,
      to: toEmail,
      subject: subject,
      html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Invoice Receipt</h2>
                    <p>Please find attached the receipt voucher for your payment.</p>
                    <p>Thank you for choosing HostelHost.</p>
                    <br>
                    <p>Best regards,</p>
                    <p>HostelHost Team</p>
                </div>
            `,
      attachments: [
        {
          filename: fileName,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log('Email sending error:', error);
    throw error;
  }
};

module.exports.sendAdmissionApprovedEmail = async ({
  candidate,
  branch,
  room,
  cot,
  admission,
}) => {
  try {
    if (!candidate?.email) {
      console.warn("sendAdmissionApprovedEmail: candidate email missing");
      return { queued: false, error: "Candidate email missing" };
    }

    const candidateName = candidate.name || "Candidate";
    const candidateId = candidate.candidateId || "";
    const branchName = branch?.branchName || "";
    const roomNumber = room?.roomNumber || "";
    const cotNumber = cot?.cotNumber || "";
    const dateOfAdmission = admission?.dateOfAdmission || "";


    const detailsMessage = `
      Your admission has been <strong>approved</strong>. Below are your details:<br /><br />
      <strong>Candidate ID:</strong> ${candidateId}<br />
      <strong>Name:</strong> ${candidateName}<br />
      ${branchName ? `<strong>Branch:</strong> ${branchName}<br />` : ""}
      ${roomNumber ? `<strong>Room:</strong> ${roomNumber}<br />` : ""}
      ${cotNumber ? `<strong>Cot:</strong> ${cotNumber}<br />` : ""}
      ${dateOfAdmission ? `<strong>Date of Admission:</strong> ${dateOfAdmission}<br />` : ""}
      <br />
      Please contact the hostel administration if you have any questions.
    `;

    let emailContent = (emailTemplate || "")
      .replace("{otpMessage}", detailsMessage)
      .replace("{emailOTP}", "");

    const mailOptions = {
      from: global.config.email.user,
      to: candidate.email,
      subject: "HostelHost - Admission Approved",
      html: emailContent,
    };

    console.log("Sending admission approval email with options:", {
      to: mailOptions.to,
      from: mailOptions.from,
      subject: mailOptions.subject,
      candidateId,
    });

    const info = await transporter.sendMail(mailOptions);

    console.log("Admission approved email sent:", {
      to: mailOptions.to,
      candidateId,
      messageId: info.messageId,
      response: info.response,
      envelope: info.envelope,
    });

    return { queued: true };
  } catch (error) {
    console.error("sendAdmissionApprovedEmail error:", error);
    return { queued: false, error: error.message };
  }
};
