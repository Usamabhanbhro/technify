const Student = require('../../model/Student');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendEmail } = require('../../services/emailService');

// 1. Forgot Password - Send Reset Email
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find student by email
    const student = await Student.findOne({ email: email.toLowerCase().trim() });
    
    if (!student) {
      // Security: Don't reveal whether email exists
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link will be sent.'
      });
    }

    // Generate reset token (expires in 15 minutes)
    const resetToken = jwt.sign(
      { studentId: student._id, email: student.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '15m' }
    );

    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    // Save token and expiry to database
    student.resetPasswordToken = resetToken;
    student.resetPasswordExpiry = resetExpiry;
    await student.save();

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&type=student`;
    
    const emailTemplate = `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset for your account.</p>
      <p>Click the link below to reset your password. This link expires in 15 minutes:</p>
      <p>
        <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
          Reset Password
        </a>
      </p>
      <p>Or copy and paste this link in your browser: ${resetUrl}</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p><strong>Note:</strong> This link will expire in 15 minutes.</p>
    `;

    await sendEmail(
      student.email,
      'Password Reset Link',
      emailTemplate
    );

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link will be sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending reset email'
    });
  }
};

// 2. Verify Reset Token
const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Reset token is required'
      });
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(400).json({
          success: false,
          message: 'Reset token has expired. Please request a new one.'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token'
      });
    }

    // Find student and verify token matches and hasn't expired
    const student = await Student.findById(decoded.studentId);

    if (!student || student.resetPasswordToken !== token) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    if (new Date() > student.resetPasswordExpiry) {
      return res.status(400).json({
        success: false,
        message: 'Reset token has expired. Please request a new one.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid',
      email: student.email
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying reset token'
    });
  }
};

// 3. Reset Password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and passwords are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(400).json({
          success: false,
          message: 'Reset token has expired. Please request a new one.'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token'
      });
    }

    // Find student
    const student = await Student.findById(decoded.studentId);

    if (!student || student.resetPasswordToken !== token) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    if (new Date() > student.resetPasswordExpiry) {
      return res.status(400).json({
        success: false,
        message: 'Reset token has expired. Please request a new one.'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset fields
    student.portalPassword = hashedPassword;
    student.resetPasswordToken = undefined;
    student.resetPasswordExpiry = undefined;
    await student.save();

    // Send confirmation email
    const confirmationTemplate = `
      <h2>Password Reset Successful</h2>
      <p>Your password has been reset successfully.</p>
      <p>You can now login with your new password.</p>
      <p>If you didn't make this change, please contact support immediately.</p>
    `;

    await sendEmail(
      student.email,
      'Password Reset Successful',
      confirmationTemplate
    );

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. Please login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password'
    });
  }
};

module.exports = {
  forgotPassword,
  verifyResetToken,
  resetPassword
};
