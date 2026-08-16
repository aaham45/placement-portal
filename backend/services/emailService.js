const nodemailer = require('nodemailer');

// ✅ Gmail Transporter Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// ✅ Send OTP Email (Direct function)
const sendOTPEmail = async (email, otp) => {
  const subject = 'CUTM Placement Portal - Password Reset OTP';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset OTP</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f7fc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f7fc; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; max-width: 90%;">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px 20px; text-align: center;">
                  <div style="font-size: 48px; margin-bottom: 10px;">🎓</div>
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">CUTM Placement Portal</h1>
                  <p style="color: #bfdbfe; margin: 5px 0 0 0; font-size: 14px;">Secure Password Reset</p>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding: 40px 30px; text-align: center;">
                  <h2 style="color: #1e293b; margin: 0 0 10px 0; font-size: 20px; font-weight: 600;">Forgot Your Password?</h2>
                  <p style="color: #64748b; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
                    We received a request to reset the password for your account. Use the OTP below to proceed.
                  </p>
                  <!-- OTP Box -->
                  <div style="background: #eff6ff; border: 1px solid #dbeafe; border-radius: 12px; padding: 20px; display: inline-block; margin: 10px 0 25px 0;">
                    <span style="font-size: 32px; font-weight: 800; color: #2563eb; letter-spacing: 8px;">${otp}</span>
                  </div>
                  <p style="color: #94a3b8; font-size: 13px; margin: 0;">
                    ⏱️ This OTP is valid for <strong>10 minutes</strong>.
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                    If you didn't request this, please ignore this email.
                  </p>
                  <p style="color: #94a3b8; font-size: 12px; margin: 8px 0 0 0;">
                    &copy; 2026 CUTM Placement Portal. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${email} with OTP: ${otp}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOTPEmail
};