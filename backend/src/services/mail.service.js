const nodemailer = require('nodemailer');
const env = require('../config/env');

// Create transporter
const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: env.smtpSecure,
  auth: {
    user: env.smtpUser,
    pass: env.smtpPass
  }
});

// Verify connection on startup
transporter.verify((error) => {
  if (error) {
    console.error('Mail service error:', error);
  } else {
    console.log('Mail service ready');
  }
});

const sendPasswordResetEmail = async (userEmail, userName, resetToken) => {
  const resetLink = `${env.clientUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(userEmail)}`;
  
  const mailOptions = {
    from: env.smtpFrom,
    to: userEmail,
    subject: 'EasyCart - Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">EasyCart</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
          <h2 style="color: #667eea; margin-top: 0;">Password Reset Request</h2>
          
          <p>Hello <strong>${userName}</strong>,</p>
          
          <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
          
          <p>To reset your password, click the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p style="font-size: 12px; color: #888;">This link will expire in 15 minutes.</p>
          
          <p style="font-size: 12px; color: #888;">
            If the button doesn't work, copy and paste this link in your browser:<br>
            <code style="background: #f0f0f0; padding: 5px; display: inline-block; word-break: break-all;">${resetLink}</code>
          </p>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #888;">
            Best regards,<br>
            <strong>EasyCart Team</strong>
          </p>
          
          <p style="font-size: 11px; color: #bbb; text-align: center; margin-top: 20px;">
            © 2024 EasyCart. All rights reserved.
          </p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

module.exports = {
  sendPasswordResetEmail
};
