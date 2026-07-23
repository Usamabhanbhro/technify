const Certificate = require('../../model/Certificate');

const createCertificate = async (req, res) => {
  try {
    const { certNo, candidateName, courseName, issueDate } = req.body;

    if (!certNo?.trim() || !candidateName?.trim() || !courseName?.trim() || !issueDate) {
      return res.status(400).json({
        success: false,
        message: 'Certificate number, candidate name, course program, and issue date are required.',
      });
    }

    const parsedIssueDate = new Date(issueDate);
    if (Number.isNaN(parsedIssueDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid issue date.',
      });
    }

    const newCertificate = new Certificate({
      certNo: certNo.trim(),
      studentName: candidateName.trim(),
      courseName: courseName.trim(),
      issueDate: parsedIssueDate,
    });

    await newCertificate.save();

    res.status(201).json({
      success: true,
      message: 'Certificate saved successfully.',
      certificate: newCertificate,
    });
  } catch (error) {
    console.error('Error creating certificate:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Certificate number must be unique.',
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while saving certificate.',
    });
  }
};

const getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find().sort({ issueDate: -1 });
    res.status(200).json({
      success: true,
      certificates,
    });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching certificates.',
    });
  }
};

const deleteCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCert = await Certificate.findByIdAndDelete(id);

    if (!deletedCert) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Certificate deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting certificate.',
    });
  }
};

const verifyCertificate = async (req, res) => {
  try {
    const { certNo } = req.params;
    const certificate = await Certificate.findOne({ certNo: certNo.trim() });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Invalid certificate number. No record found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'This certificate is verified from IIT.',
      certificate: {
        certNo: certificate.certNo,
        candidateName: certificate.studentName,
        courseProgram: certificate.courseName,
        issueDate: certificate.issueDate,
      },
    });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying certificate.',
    });
  }
};

module.exports = {
  createCertificate,
  getAllCertificates,
  deleteCertificate,
  verifyCertificate,
};
