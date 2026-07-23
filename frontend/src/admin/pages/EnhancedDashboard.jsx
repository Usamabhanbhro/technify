import { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  UserMinus,
  FileBadge,
  TrendingUp,
  UserPlus,
  DollarSign,
  Activity,
  Clock
} from 'lucide-react';

// Recharts components - Import after installation
// import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b'];

const EnhancedDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState([]);
  const [branchStats, setBranchStats] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchTeachers();
    fetchBranchStatistics();

    // Set up real-time updates (every 30 seconds)
    const interval = setInterval(() => {
      fetchStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchBranchStatistics = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/branches/statistics/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setBranchStats(data.statistics);
    } catch (error) {
      console.error('Error fetching branch statistics:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('http://localhost:5000/api/admin/teachers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setTeachers(data.teachers);
    } catch (err) {
      console.error('Error fetching teachers:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats || !stats.analytics) {
    return (
      <div className="flex justify-center items-center h-96 text-red-500">
        <p>Error loading dashboard. Please try again.</p>
      </div>
    );
  }

  // Animated Counter Component
  const StatCard = ({ icon: Icon, label, value, color, trend }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
      if (value === 0) {
        setDisplayValue(0);
        return;
      }

      let currentValue = 0;
      const increment = Math.ceil(value / 20);
      const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(currentValue);
        }
      }, 30);

      return () => clearInterval(timer);
    }, [value]);

    return (
      <div className={`${color} bg-opacity-10 border border-opacity-20 rounded-2xl p-6 hover:shadow-lg transition-all duration-300`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={20} className={color.replace('bg-', 'text-')} />
              <p className="text-sm font-semibold text-gray-600">{label}</p>
            </div>
            <h3 className="text-4xl font-bold text-gray-800">{displayValue}</h3>
            {trend && (
              <p className={`text-sm mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
              </p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${color} text-white`}>
            <Icon size={24} />
          </div>
        </div>
      </div>
    );
  };

  // Summary Cards
  const summaryCards = [
    { icon: Users, label: 'Total Students', value: stats.analytics.totalEnrollment, color: 'bg-blue-500', trend: 5 },
    { icon: UserCheck, label: 'Enrolled Students', value: stats.analytics.currentEnrollment, color: 'bg-green-500', trend: 8 },
    { icon: UserMinus, label: 'Dropout Students', value: stats.analytics.totalDropout, color: 'bg-red-500', trend: -2 },
    { icon: Clock, label: 'In Process', value: stats.analytics.notEnrolled, color: 'bg-yellow-500', trend: 3 },
    { icon: DollarSign, label: 'Fee Paid Students', value: stats.finance.paidCount, color: 'bg-emerald-500', trend: 12 },
    { icon: UserPlus, label: 'Total Teachers', value: stats.analytics.totalTeachers, color: 'bg-purple-500', trend: 0 },
  ];

  return (
    <div className="space-y-8 bg-gray-50 p-6 rounded-2xl">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Dashboard Analytics</h1>
        <p className="text-gray-600 mt-2">Real-time insights into your institution</p>
      </div>

      {/* Summary Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {summaryCards.map((card, i) => (
          <StatCard key={i} {...card} />
        ))}
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Analytics */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Attendance Analytics</h2>
              <p className="text-sm text-gray-500">Real-time attendance status</p>
            </div>
            <Activity size={24} className="text-blue-500" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-xl border border-blue-100">
              <div>
                <p className="text-sm text-gray-600">Total Present</p>
                <h3 className="text-3xl font-bold text-blue-600">{stats.attendance.presentCount}</h3>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-600">{stats.attendance.presentPercentage}%</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-transparent rounded-xl border border-red-100">
              <div>
                <p className="text-sm text-gray-600">Total Absent</p>
                <h3 className="text-3xl font-bold text-red-600">{stats.attendance.absentCount}</h3>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-red-600">{stats.attendance.absentPercentage}%</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500"
                  style={{ width: `${stats.attendance.presentPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">Attendance Rate: {stats.attendance.presentPercentage}%</p>
            </div>
          </div>
        </div>

        {/* Fee Analytics */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Fee Analytics</h2>
              <p className="text-sm text-gray-500">Payment collection status</p>
            </div>
            <DollarSign size={24} className="text-green-500" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-transparent rounded-xl border border-green-100">
              <div>
                <p className="text-sm text-gray-600">Amount Paid</p>
                <h3 className="text-2xl font-bold text-green-600">Rs. {(stats.finance.paidAmount / 1000).toFixed(1)}K</h3>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Count</p>
                <p className="text-2xl font-bold text-green-600">{stats.finance.paidCount}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-transparent rounded-xl border border-yellow-100">
              <div>
                <p className="text-sm text-gray-600">Amount Pending</p>
                <h3 className="text-2xl font-bold text-yellow-600">Rs. {(stats.finance.unpaidAmount / 1000).toFixed(1)}K</h3>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Count</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.finance.unpaidCount}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-2">Payment Collection Rate</p>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-full transition-all duration-500"
                  style={{ width: `${stats.finance.paymentPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">{stats.finance.paymentPercentage}% Collection Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Student Distribution */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Student Status Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.studentDistribution && stats.studentDistribution.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 transition">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-gray-700">{item.name}</p>
                <span className={`text-2xl font-bold ${COLORS[idx]}`} style={{ color: COLORS[idx] }}>
                  {item.value}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(item.value / stats.analytics.totalEnrollment) * 100}%`, backgroundColor: COLORS[idx] }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {((item.value / stats.analytics.totalEnrollment) * 100).toFixed(1)}% of total
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Branch Statistics */}
      {branchStats.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Branch-wise Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {branchStats.slice(0, 6).map((branch) => (
              <div key={branch.branchId} className="p-4 rounded-xl border border-gray-200 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-gray-800">{branch.branchName}</h3>
                    <p className="text-xs text-gray-500">{branch.branchCode}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    branch.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {branch.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Students:</span>
                    <span className="font-bold">{branch.totalStudents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Enrolled:</span>
                    <span className="font-bold text-green-600">{branch.enrolledStudents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Teachers:</span>
                    <span className="font-bold text-blue-600">{branch.totalTeachers}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Note */}
      <div className="text-center text-sm text-gray-500 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <p>📊 Dashboard updates automatically every 30 seconds • Last updated: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
