const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // or use SMTP: host, port, auth
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send password reset email
async function sendPasswordResetEmail(userEmail, resetToken, userName) {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&email=${userEmail}`;
    
    const mailOptions = {
        from: `"IntervAI" <${process.env.EMAIL_FROM}>`,
        to: userEmail,
        subject: 'Reset Your IntervAI Password',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #14b8a6;">Reset Your Password</h2>
                <p>Hello ${userName || 'User'},</p>
                <p>We received a request to reset your password. Click the button below to create a new password:</p>
                <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #14b8a6, #8b5cf6); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0;">
                    Reset Password
                </a>
                <p>Or copy this link: <a href="${resetUrl}">${resetUrl}</a></p>
                <p>This link will expire in <strong>1 hour</strong>.</p>
                <p>If you didn't request this, please ignore this email.</p>
                <hr>
                <p style="color: #666; font-size: 12px;">IntervAI - AI-Powered Interview Practice</p>
            </div>
        `,
        text: `Reset your password: ${resetUrl}\n\nThis link expires in 1 hour.`
    };
    
    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Reset email sent to ${userEmail}`);
        return true;
    } catch (error) {
        console.error('Email send error:', error);
        return false;
    }
}

module.exports = { sendPasswordResetEmail };