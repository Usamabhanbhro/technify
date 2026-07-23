const Donation = require('../../model/Donation');
const emailService = require('../../services/emailService');
const notificationController = require('../adminControllers/notificationController');
const path = require('path');

/**
 * Submit Donation with Payment Proof
 */
exports.submitDonation = async (req, res) => {
  try {
    const { name, email, phone, amount, paymentMethod } = req.body;

    // Validate required fields (only amount and paymentMethod are required)
    if (!amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Please provide amount and payment method',
      });
    }

    // Check if payment screenshot is uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Payment screenshot is mandatory. Please upload your payment proof.',
      });
    }

    // Create donation record (donor details are optional)
    const donation = new Donation({
      donor: {
        name: name || 'Anonymous Donor',
        email: email || 'anonymous@donation.local',
        phone: phone || '',
      },
      amount: parseFloat(amount),
      paymentMethod,
      paymentScreenshot: {
        filename: req.file.filename,
        path: req.file.path,
      },
      campaign: 'Education Support',
      status: 'Pending',
    });

    await donation.save();

    // Create notification for admin
    try {
      await notificationController.createNotification({
        type: 'Donation',
        title: `New Donation from ${name || 'Anonymous'}`,
        message: `A new donation of Rs ${parseFloat(amount).toLocaleString()} has been submitted for verification.`,
        relatedTo: donation._id,
        relatedType: 'Donation',
        sender: {
          name: name || 'Anonymous Donor',
          email: email || 'anonymous@donation.local',
        },
        status: 'Unread',
        priority: parseFloat(amount) > 5000 ? 'High' : 'Medium',
        details: {
          amount: parseFloat(amount),
          paymentMethod,
          paymentScreenshot: req.file.filename,
          donorName: name || 'Anonymous Donor',
          donorEmail: email || 'Not Provided',
        },
      });
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Continue even if notification creation fails
    }

    // Send confirmation email only if email is provided
    if (email && email !== 'anonymous@donation.local') {
      const donorName = name || 'Donor';
      const donorEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
            .header { background-color: #27ae60; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .info-box { background-color: #e8f4f8; border-left: 4px solid #27ae60; padding: 15px; margin: 15px 0; }
            .info-label { font-weight: bold; color: #2c3e50; }
            .footer { background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Thank You for Your Donation!</h1>
            </div>
            
            <div class="content">
              <p>Dear <strong>${donorName}</strong>,</p>
              <p>We have received your generous donation and would like to express our heartfelt gratitude.</p>
              
              <div class="info-box">
                <p><span class="info-label">Donation Amount:</span> Rs ${parseFloat(amount).toLocaleString()}</p>
                <p><span class="info-label">Campaign:</span> Education Support</p>
                <p><span class="info-label">Payment Method:</span> ${paymentMethod}</p>
                <p><span class="info-label">Submission Date:</span> ${new Date().toLocaleDateString()}</p>
              </div>

              <p>Your donation is currently under verification. You will receive an email confirmation once your payment has been verified by our team.</p>

              <p>Your contribution will help us support education and make a positive impact in society.</p>

              <p>If you have any questions, please feel free to contact us.</p>

              <p>Warm regards,<br><strong>IIT LMS Team</strong></p>
            </div>

            <div class="footer">
              <p>This is an automated email. Please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} IIT LMS Institute. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
      `;

      await emailService.sendEmail(
        email,
        'Donation Submission Received - IIT LMS',
        donorEmailHtml
      );
    }

    // Send admin notification with donation details
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@iitlms.com';
    const donorName = name || 'Anonymous Donor';
    const donorEmail = email || 'Not Provided';
    const donorPhone = phone || 'Not Provided';

    const adminEmailHtml = `
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
          .info-box { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; }
          .info-label { font-weight: bold; color: #2c3e50; }
          .button { display: inline-block; background-color: #3498db; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
          .button:hover { background-color: #2980b9; }
          .footer { background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
          .label { font-weight: bold; background-color: #ecf0f1; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Donation Submitted</h1>
          </div>
          
          <div class="content">
            <p>A new donation has been received and requires verification.</p>
            
            <div class="info-box">
              <table>
                <tr>
                  <td class="label">Donor Name:</td>
                  <td>${donorName}</td>
                </tr>
                <tr>
                  <td class="label">Email:</td>
                  <td>${donorEmail}</td>
                </tr>
                <tr>
                  <td class="label">Phone:</td>
                  <td>${donorPhone}</td>
                </tr>
                <tr>
                  <td class="label">Amount:</td>
                  <td>Rs ${parseFloat(amount).toLocaleString()}</td>
                </tr>
                <tr>
                  <td class="label">Payment Method:</td>
                  <td>${paymentMethod}</td>
                </tr>
                <tr>
                  <td class="label">Submission Time:</td>
                  <td>${new Date().toLocaleString()}</td>
                </tr>
                <tr>
                  <td class="label">Status:</td>
                  <td><strong>Pending Verification</strong></td>
                </tr>
              </table>
            </div>

            <p>Payment screenshot has been uploaded and saved in the system for verification.</p>
            <p>Please verify the payment and update the status accordingly.</p>
          </div>

          <div class="footer">
            <p>This is an automated email notification from the IIT LMS Donation System.</p>
          </div>
        </div>
      </body>
    </html>
    `;

    await emailService.sendEmail(
      adminEmail,
      `New Donation Received: Rs ${parseFloat(amount).toLocaleString()} from ${donorName}`,
      adminEmailHtml
    );

    res.status(201).json({
      success: true,
      message: 'Donation submitted successfully! A confirmation email has been sent if you provided an email address.',
      donation: donation._id,
    });
  } catch (error) {
    console.error('Error submitting donation:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing donation. Please try again.',
      error: error.message,
    });
  }
};

/**
 * Get All Donations (Admin)
 */
exports.getDonations = async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      donations,
    });
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching donations',
      error: error.message,
    });
  }
};

/**
 * Get Donation by ID
 */
exports.getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found',
      });
    }
    res.json({
      success: true,
      donation,
    });
  } catch (error) {
    console.error('Error fetching donation:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching donation',
      error: error.message,
    });
  }
};

/**
 * Verify/Update Donation Status (Admin)
 */
exports.updateDonationStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const adminEmail = req.user?.email || 'admin@iitlms.com';

    if (!['Pending', 'Verified', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be Pending, Verified, or Rejected',
      });
    }

    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      {
        status,
        notes,
        verifiedAt: status === 'Verified' ? new Date() : null,
        verifiedBy: status === 'Verified' ? adminEmail : null,
      },
      { new: true }
    );

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found',
      });
    }

    // Send status update email to donor
    const statusEmails = {
      Verified: {
        subject: 'Your Donation Has Been Verified - IIT LMS',
        html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif;">
            <h2 style="color: #27ae60;">Thank You - Your Donation Has Been Verified!</h2>
            <p>Dear ${donation.donor.name},</p>
            <p>We are pleased to inform you that your donation of <strong>Rs ${donation.amount.toLocaleString()}</strong> has been verified successfully.</p>
            <p>Your contribution will help us continue supporting education and making a difference in society.</p>
            <p>Warm regards,<br><strong>IIT LMS Team</strong></p>
          </body>
        </html>
        `,
      },
      Rejected: {
        subject: 'Your Donation Requires Attention - IIT LMS',
        html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif;">
            <h2 style="color: #e74c3c;">Donation Status Update</h2>
            <p>Dear ${donation.donor.name},</p>
            <p>We have reviewed your donation of <strong>Rs ${donation.amount.toLocaleString()}</strong>, but there was an issue with the payment verification.</p>
            <p>${notes || 'Please contact us for more information.'}</p>
            <p>Please feel free to contact us if you have any questions.</p>
            <p>Warm regards,<br><strong>IIT LMS Team</strong></p>
          </body>
        </html>
        `,
      },
    };

    if (statusEmails[status]) {
      const { subject, html } = statusEmails[status];
      await emailService.sendEmail(donation.donor.email, subject, html);
    }

    res.json({
      success: true,
      message: `Donation status updated to ${status}`,
      donation,
    });
  } catch (error) {
    console.error('Error updating donation status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating donation status',
      error: error.message,
    });
  }
};
