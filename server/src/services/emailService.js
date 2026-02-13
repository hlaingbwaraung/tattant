/**
 * Email Service
 *
 * Reusable Nodemailer transporter for sending emails.
 * Uses SMTP credentials from .env (EMAIL_HOST, EMAIL_PORT, etc.)
 *
 * DEV MODE: If EMAIL_USER / EMAIL_PASSWORD are not set (or still
 * placeholders), the OTP is logged to the server console instead of
 * being emailed. This prevents 500 errors during local development.
 */

const nodemailer = require('nodemailer')

// Detect whether real SMTP credentials have been configured
const emailUser = process.env.EMAIL_USER || ''
const emailPass = process.env.EMAIL_PASSWORD || ''
const isEmailConfigured =
    emailUser &&
    emailPass &&
    !emailUser.includes('your-email') &&
    !emailPass.includes('your-email')

let transporter = null

if (isEmailConfigured) {
    transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT, 10) || 587,
        secure: false,
        auth: {
            user: emailUser,
            pass: emailPass
        }
    })
} else {
    console.warn(
        '⚠️  EMAIL_USER / EMAIL_PASSWORD not configured – OTP codes will be logged to the console (dev mode).'
    )
}

/**
 * Send a password-reset OTP email.
 *
 * @param {string} to    – Recipient email address
 * @param {string} otp   – 6-digit OTP code (plain text)
 * @param {string} name  – User's display name (optional)
 */
async function sendOtpEmail(to, otp, name = 'User') {
    // ---- DEV-MODE FALLBACK ------------------------------------------------
    if (!transporter) {
        console.log('╔══════════════════════════════════════════╗')
        console.log('║   📧  DEV MODE – OTP EMAIL (not sent)   ║')
        console.log('╠══════════════════════════════════════════╣')
        console.log(`║  To   : ${to}`)
        console.log(`║  Name : ${name}`)
        console.log(`║  OTP  : ${otp}`)
        console.log('╚══════════════════════════════════════════╝')
        return // resolve successfully so the flow continues
    }
    // -----------------------------------------------------------------------

    const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#ffffff;border-radius:12px;border:1px solid #eee;">
      <div style="text-align:center;margin-bottom:24px;">
        <span style="font-size:32px;">🎌</span>
        <h2 style="margin:8px 0 0;color:#1a1a2e;font-size:22px;">Tattant Password Reset</h2>
      </div>
      <p style="color:#444;font-size:15px;line-height:1.6;">Hi <strong>${name}</strong>,</p>
      <p style="color:#444;font-size:15px;line-height:1.6;">We received a request to reset your password. Use the verification code below to proceed:</p>
      <div style="text-align:center;margin:28px 0;">
        <div style="display:inline-block;background:linear-gradient(135deg,#f8f4e8,#fff8e1);border:2px solid #d4af37;border-radius:12px;padding:16px 32px;letter-spacing:8px;font-size:32px;font-weight:800;color:#1a1a2e;">${otp}</div>
      </div>
      <p style="color:#888;font-size:13px;text-align:center;">This code expires in <strong>10 minutes</strong>.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
      <p style="color:#aaa;font-size:12px;text-align:center;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `

    await transporter.sendMail({
        from: process.env.EMAIL_FROM || `"Tattant" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Your Tattant Password Reset Code',
        html
    })
}

module.exports = { sendOtpEmail, transporter }
