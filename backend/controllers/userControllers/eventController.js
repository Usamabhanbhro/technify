const { sendEventJoinNotification } = require('../../services/emailService');

// Handle event join requests from front-end users
const joinEvent = async (req, res) => {
  try {
    const { eventId, title, date, time, location, name, email, phone, message } = req.body;

    if (!eventId || !title || !name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide event, contact name, email, and phone number.',
      });
    }

    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    if (!adminEmail) {
      return res.status(500).json({
        success: false,
        message: 'Admin email is not configured. Please contact the site administrator.',
      });
    }

    const emailSent = await sendEventJoinNotification(adminEmail, {
      eventTitle: title,
      date,
      time,
      location,
      name,
      email,
      phone,
      message,
    });

    const responseMessage = emailSent
      ? 'Your request was sent successfully. The administration will contact you soon.'
      : 'Your request was received, but email notification could not be sent at the moment.';

    return res.status(200).json({
      success: true,
      message: responseMessage,
    });
  } catch (error) {
    console.error('Error processing event join request:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while sending your event request. Please try again later.',
    });
  }
};

module.exports = {
  joinEvent,
};
