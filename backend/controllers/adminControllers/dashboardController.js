const Student = require('../../model/Student');
const Certificate = require('../../model/Certificate');
const FeeChallan = require('../../model/FeeChallan');
const Teacher = require('../../model/Teacher');
const Attendance = require('../../model/Attendance');

// Get Dashboard Analytics and Finance
const getDashboardStats = async (req, res) => {
  try {
    // Student Statistics
    const totalEnrollment = await Student.countDocuments();
    const totalPassout = await Student.countDocuments({ status: 'Passout' });
    const totalDropout = await Student.countDocuments({ status: 'Dropout' });
    const currentEnrollment = await Student.countDocuments({ status: 'Enrolled' });
    const notEnrolled = await Student.countDocuments({ status: 'Not Enrolled' });
    const totalCertificateIssued = await Certificate.countDocuments();

    // Teacher Statistics
    const totalTeachers = await Teacher.countDocuments();

    // Fee Statistics
    const paidChallans = await FeeChallan.aggregate([
      { $match: { status: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const paidAmount = paidChallans.length > 0 ? paidChallans[0].total : 0;
    const paidCount = await FeeChallan.countDocuments({ status: 'Paid' });

    const unpaidChallans = await FeeChallan.aggregate([
      { $match: { status: 'Unpaid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const unpaidAmount = unpaidChallans.length > 0 ? unpaidChallans[0].total : 0;
    const unpaidCount = await FeeChallan.countDocuments({ status: 'Unpaid' });

    // Attendance Statistics
    const attendanceStats = await Attendance.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const presentCount = attendanceStats.find(s => s._id === 'Present')?.count || 0;
    const absentCount = attendanceStats.find(s => s._id === 'Absent')?.count || 0;
    const totalAttendance = presentCount + absentCount;
    const presentPercentage = totalAttendance > 0 ? ((presentCount / totalAttendance) * 100).toFixed(2) : 0;
    const absentPercentage = totalAttendance > 0 ? ((absentCount / totalAttendance) * 100).toFixed(2) : 0;

    // Monthly Revenue (Current Month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const feesThisMonth = await FeeChallan.find({
      status: 'Paid',
      paidAt: { $gte: startOfMonth },
    });
    const thisMonthRevenue = feesThisMonth.reduce(
      (acc, curr) => acc + (curr.amount || 0) + (curr.fine || 0),
      0
    );

    // Student Distribution
    const studentDistribution = [
      { name: 'Enrolled', value: currentEnrollment },
      { name: 'In Process', value: notEnrolled },
      { name: 'Dropout', value: totalDropout },
      { name: 'Passout', value: totalPassout }
    ];

    res.status(200).json({
      success: true,
      analytics: {
        totalEnrollment,
        totalPassout,
        totalDropout,
        currentEnrollment,
        notEnrolled,
        totalCertificateIssued,
        totalTeachers
      },
      finance: {
        paidAmount,
        paidCount,
        unpaidAmount,
        unpaidCount,
        thisMonthRevenue,
        paymentPercentage: totalEnrollment > 0 ? ((paidCount / totalEnrollment) * 100).toFixed(2) : 0
      },
      attendance: {
        presentCount,
        absentCount,
        presentPercentage: parseFloat(presentPercentage),
        absentPercentage: parseFloat(absentPercentage),
        totalAttendance
      },
      studentDistribution
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard stats"
    });
  }
};

module.exports = {
  getDashboardStats
};
