const Certificate = require('../../model/Certificate');

const normalizeCertNo = (value) =>
  String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]/g, '');

const findCertificateByCertNo = async (certNo) => {
  const trimmed = (certNo || '').trim();
  if (!trimmed) return null;

  const exact = await Certificate.findOne({ certNo: trimmed });
  if (exact) return exact;

  const normalizedInput = normalizeCertNo(trimmed);
  if (!normalizedInput) return null;

  const candidates = await Certificate.find({
    certNo: new RegExp(`^${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
  });
  if (candidates.length === 1) return candidates[0];

  const all = await Certificate.find({}, { certNo: 1 }).lean();
  const match = all.find((c) => normalizeCertNo(c.certNo) === normalizedInput);
  return match ? await Certificate.findById(match._id) : null;
};

const verifyCertificatePublic = async (req, res) => {
  try {
    const certNo = (req.params.certNo || '').trim();

    if (!certNo) {
      return res.status(400).json({
        success: false,
        message: 'Certificate number is required.',
      });
    }

    const certificate = await findCertificateByCertNo(certNo);

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
    console.error('Error verifying certificate (public):', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying certificate.',
    });
  }
};

module.exports = {
  verifyCertificatePublic,
};
