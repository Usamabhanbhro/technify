const nodemailer = require('nodemailer');

/**
 * Email Service for sending notifications
 * Handles student challan notifications and teacher welcome emails
 */

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // Gmail: Use App Password, not regular password
  },
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates for testing
  },
});

// Verify transporter configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email Service Error:', error.message);
    console.log('⚠️  Email notifications will be unavailable. Check your .env configuration.');
  } else {
    console.log('✅ Email Service Connected Successfully');
  }
});

/**
 * Send email helper function
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML email body
 * @returns {Promise<boolean>} - Success status
 */
const sendEmail = async (to, subject, html) => {
  try {
    // Skip email if service not configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('⚠️  Email service not configured. Skipping email to:', to);
      return false;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to}`);
    console.log('Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.error(`❌ Error sending email to ${to}:`, error.message);
    // Don't throw - allow application to continue even if email fails
    return false;
  }
};

/**
 * Send Student Challan Notification Email
 * @param {string} studentEmail - Student email address
 * @param {string} studentName - Student name
 * @param {string} challanNo - Challan number
 * @param {number} amount - Challan amount
 * @param {string} dueDate - Due date for payment
 */
const sendChallanNotification = async (studentEmail, studentName, challanNo, amount, dueDate) => {
  try {
    const subject = `Your Fee Challan #${challanNo} is Ready`;
    
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
          .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .info-box { background-color: #e8f4f8; border-left: 4px solid #3498db; padding: 15px; margin: 15px 0; }
          .info-label { font-weight: bold; color: #2c3e50; }
          .button { display: inline-block; background-color: #27ae60; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
          .button:hover { background-color: #229954; }
          .footer { background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Fee Challan Generated</h1>
          </div>
          
          <div class="content">
            <p>Dear <strong>${studentName}</strong>,</p>
            
            <p>We are pleased to inform you that your fee challan has been generated and is now available on the student portal.</p>
            
            <div class="info-box">
              <p>
                <span class="info-label">Challan Number:</span> ${challanNo}<br>
                <span class="info-label">Amount Due:</span> PKR ${amount.toLocaleString()}<br>
                <span class="info-label">Due Date:</span> ${new Date(dueDate).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ol>
              <li>Log in to your student portal account</li>
              <li>Navigate to the "Challans" section</li>
              <li>Download your fee challan (PDF)</li>
              <li>Proceed with payment at your nearest bank or online payment portal</li>
            </ol>
            
            <p>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/student/login" class="button">
                Access Student Portal
              </a>
            </p>
            
            <p><em>If you have any questions or need assistance, please contact the administration office.</em></p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© IIT-Farooque. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
    `;

    return await sendEmail(studentEmail, subject, html);
  } catch (error) {
    console.error('Error in sendChallanNotification:', error.message);
    return false;
  }
};

/**
 * Send Teacher Welcome Email with Account Credentials
 * @param {string} teacherEmail - Teacher email address
 * @param {string} teacherName - Teacher name
 * @param {string} password - Initial login password
 * @param {string} cnic - Teacher CNIC (if applicable)
 */
const sendTeacherWelcomeEmail = async (teacherEmail, teacherName, password, cnic = null) => {
  try {
    const subject = 'Welcome to IIT Team - Your Account Details';
    
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
          .header { background-color: #8e44ad; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .credentials-box { 
            background-color: #fff3cd; 
            border-left: 4px solid #ff9800; 
            padding: 15px; 
            margin: 20px 0; 
            border-radius: 3px;
            font-family: 'Courier New', monospace;
          }
          .credential-item { 
            padding: 8px 0; 
            border-bottom: 1px solid #ffeaa7;
          }
          .credential-item:last-child { border-bottom: none; }
          .label { font-weight: bold; color: #d9534f; min-width: 120px; display: inline-block; }
          .value { color: #333; word-break: break-all; }
          .button { display: inline-block; background-color: #3498db; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
          .button:hover { background-color: #2980b9; }
          .security-notice { background-color: #ffe8e8; border: 1px solid #ff6b6b; padding: 12px; border-radius: 3px; margin: 15px 0; font-size: 12px; }
          .footer { background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to IIT Team!</h1>
          </div>
          
          <div class="content">
            <p>Dear <strong>${teacherName}</strong>,</p>
            
            <p>Welcome to IIT-Farooque! Your teacher account has been successfully created. Below are your initial login credentials to access the teacher portal.</p>
            
            <div class="credentials-box">
              <div class="credential-item">
                <span class="label">Email/Username:</span>
                <span class="value">${teacherEmail}</span>
              </div>
              <div class="credential-item">
                <span class="label">Password:</span>
                <span class="value">${password}</span>
              </div>
              ${cnic ? `
              <div class="credential-item">
                <span class="label">CNIC:</span>
                <span class="value">${cnic}</span>
              </div>
              ` : ''}
            </div>
            
            <div class="security-notice">
              <strong>⚠️ Security Notice:</strong> Please change your password immediately after your first login. Do not share these credentials with anyone.
            </div>
            
            <p><strong>How to Access the Portal:</strong></p>
            <ol>
              <li>Visit the teacher login page: <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/teacher/login">${process.env.FRONTEND_URL || 'http://localhost:5173'}/teacher/login</a></li>
              <li>Enter your email and the password provided above</li>
              <li>Complete your profile information</li>
              <li>Change your password to something secure</li>
            </ol>
            
            <p><strong>Portal Features:</strong></p>
            <ul>
              <li>📚 Manage courses and curriculum</li>
              <li>📝 Upload marks and grades</li>
              <li>📋 Track student attendance</li>
              <li>❓ Create and assign quizzes</li>
              <li>📊 View student performance reports</li>
            </ul>
            
            <p>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/teacher/login" class="button">
                Login to Portal
              </a>
            </p>
            
            <p><em>If you encounter any issues logging in or have questions, please contact the IT support team.</em></p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© IIT-Farooque. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
    `;

    return await sendEmail(teacherEmail, subject, html);
  } catch (error) {
    console.error('Error in sendTeacherWelcomeEmail:', error.message);
    return false;
  }
};

/**
 * Send generic email with custom subject and HTML
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 */
const sendCustomEmail = async (to, subject, html) => {
  return await sendEmail(to, subject, html);
};

const sendEventJoinNotification = async (adminEmail, { eventTitle, date, time, location, name, email, phone, message }) => {
  try {
    if (!adminEmail) {
      console.error('Admin email address is required for event join notifications.');
      return false;
    }

    const subject = `New Event Join Request: ${eventTitle}`;
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
          .wrapper { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1f2937; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 22px; }
          .content { border: 1px solid #e5e7eb; border-top: none; padding: 20px; border-radius: 0 0 8px 8px; background: #f9fafb; }
          .section { margin-bottom: 18px; }
          .label { font-weight: bold; color: #111827; }
          .value { display: block; margin-top: 6px; color: #374151; }
          .footer { margin-top: 20px; font-size: 13px; color: #6b7280; }
          .info-box { background: white; border: 1px solid #d1d5db; padding: 16px; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1>New Event Registration Request</h1>
          </div>
          <div class="content">
            <div class="section info-box">
              <p class="label">Event:</p>
              <p class="value">${eventTitle}</p>
              <p class="label">Date:</p>
              <p class="value">${date || 'N/A'}</p>
              <p class="label">Time:</p>
              <p class="value">${time || 'N/A'}</p>
              <p class="label">Location:</p>
              <p class="value">${location || 'N/A'}</p>
            </div>

            <div class="section info-box">
              <p class="label">Participant Name:</p>
              <p class="value">${name}</p>
              <p class="label">Email:</p>
              <p class="value">${email}</p>
              <p class="label">Phone:</p>
              <p class="value">${phone}</p>
              ${message ? `<p class="label">Message:</p><p class="value">${message}</p>` : ''}
            </div>

            <div class="footer">
              <p>This notification was generated automatically by the IIT LMS event registration system.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
    `;

    return await sendEmail(adminEmail, subject, html);
  } catch (error) {
    console.error('Error in sendEventJoinNotification:', error.message);
    return false;
  }
};

module.exports = {
  sendEmail,
  sendChallanNotification,
  sendTeacherWelcomeEmail,
  sendCustomEmail,
  sendEventJoinNotification,
  transporter,
};
