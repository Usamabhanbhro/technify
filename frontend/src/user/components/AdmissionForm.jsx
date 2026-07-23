import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, DollarSign, Upload } from "lucide-react";

// Payment methods constants
const PAYMENT_METHODS = {
  EasyPaisa: {
    name: 'EasyPaisa',
    accountNumber: '03001234567',
    accountHolder: 'IIT LMS Institute',
    color: 'bg-blue-50 border-blue-200'
  },
  JazzCash: {
    name: 'JazzCash',
    accountNumber: '03007654321',
    accountHolder: 'IIT LMS Institute',
    color: 'bg-purple-50 border-purple-200'
  },
  'Bank Account': {
    name: 'Bank Account',
    accountNumber: 'PK36SCBL1234567890123456',
    accountHolder: 'IIT LMS Institute',
    bankName: 'Standard Chartered Bank',
    color: 'bg-green-50 border-green-200'
  }
};

export default function AdmissionForm({ id = 'admission' }) {
  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    email: "",
    dob: "",
    qualification: "",
    cnic: "",
    address: "",
    whatsapp: "",
    course: "",
    classMode: "",
    branchId: "",
    message: "",
    portalPassword: "",
    confirmPortalPassword: "",
    photo: null,
    paymentMethod: "",
    paymentProof: null,
  });

  const [courses, setCourses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [selectedCourseFee, setSelectedCourseFee] = useState(0);
  const [paymentProofName, setPaymentProofName] = useState("");

  useEffect(() => {
    fetchCourses();
    fetchBranches();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/user/courses");
      const data = await response.json();
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchBranches = async () => {
    try {
      setFetchingData(true);
      const response = await fetch("http://localhost:5000/api/branches");
      const data = await response.json();
      if (data.success) {
        // Filter only active branches
        const activeBranches = data.branches.filter(b => b.status === 'Active');
        setBranches(activeBranches);
        setFetchError("");
      } else {
        setFetchError("Failed to load branches");
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
      setFetchError("Error loading branches. Please try again.");
    } finally {
      setFetchingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "course") {
      const selected = courses.find(c => c.title === value);
      setSelectedCourseFee(selected ? selected.courseFee : 0);
    }

    if (name === "paymentProof") {
      setFormData({
        ...formData,
        [name]: files ? files[0] : null,
      });
      setPaymentProofName(files ? files[0].name : "");
    } else {
      setFormData({
        ...formData,
        [name]: files ? files[0] : value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.classMode) {
      alert("Please select Physical or Online classes before submitting.");
      return;
    }

    if (!formData.branchId) {
      alert("Please select a branch before submitting.");
      return;
    }

    if (!formData.paymentMethod) {
      alert("Please select a payment method.");
      return;
    }

    if (!formData.paymentProof) {
      alert("Please upload payment proof.");
      return;
    }

    const pin = String(formData.portalPassword || "").replace(/\D/g, "").slice(0, 4);
    const confirm = String(formData.confirmPortalPassword || "")
      .replace(/\D/g, "")
      .slice(0, 4);

    if (!/^\d{4}$/.test(pin)) {
      alert("Please create a 4-digit password (numbers only).");
      return;
    }
    if (pin !== confirm) {
      alert("The two password fields must match.");
      return;
    }

    setLoading(true);

    const data = new FormData();
    
    // Add regular fields
    Object.keys(formData).forEach((key) => {
      if (key === "confirmPortalPassword") return;
      if (key === "portalPassword") {
        data.append("portalPassword", pin);
        return;
      }
      if (key === "photo" && !formData[key]) return;
      if (key === "paymentProof" && !formData[key]) return;
      
      if (key === "photo" || key === "paymentProof") {
        data.append(key, formData[key]);
      } else {
        data.append(key, formData[key]);
      }
    });

    try {
      const response = await fetch("http://localhost:5000/api/user/admission", {
        method: "POST",
        body: data,
      });

      const result = await response.json();

      if (result.success) {
        alert(
          "Application submitted successfully!\n\nYour payment proof has been received and will be verified by the admin.\n\nYou will receive an email notification once your payment is verified and you are enrolled in the student portal.\n\nUse your email and 4-digit password to log in after enrollment."
        );
        setFormData({
          name: "",
          fatherName: "",
          email: "",
          dob: "",
          qualification: "",
          cnic: "",
          address: "",
          whatsapp: "",
          course: "",
          classMode: "",
          branchId: "",
          message: "",
          portalPassword: "",
          confirmPortalPassword: "",
          photo: null,
          paymentMethod: "",
          paymentProof: null,
        });
        setSelectedCourseFee(0);
        setPaymentProofName("");
      } else {
        alert("Failed to submit application: " + result.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while submitting the form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectedPaymentMethod = PAYMENT_METHODS[formData.paymentMethod];

  return (
    <section id={id} className="min-h-screen bg-white flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-5xl bg-white border border-gray-200 rounded-2xl shadow-lg p-6 md:p-10">
        
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-2 text-black">
          Online Admission Form
        </h2>
        <p className="text-center text-gray-600 mb-8">Complete the form below to apply for admission</p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Personal Information Section */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">1</span>
              Personal Information
            </h3>
          </div>

          {[
            { name: "name", placeholder: "Full Name" },
            { name: "fatherName", placeholder: "Father Name" },
            { name: "email", placeholder: "Email (used for portal when enrolled)" },
            { name: "qualification", placeholder: "Qualification" },
            { name: "cnic", placeholder: "CNIC Number" },
            { name: "whatsapp", placeholder: "WhatsApp Number" },
          ].map((field, i) => (
            <input
              key={i}
              type={field.name === "email" ? "email" : "text"}
              name={field.name}
              placeholder={field.placeholder}
              value={formData[field.name]}
              onChange={handleChange}
              required
              className="w-full p-3 text-black border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-green-400 transition"
            />
          ))}

          {/* DOB */}
          <div className="flex flex-col">
            <label className="text-sm text-black mb-1">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              required
              className="w-full p-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 hover:border-green-400"
            />
          </div>

          {/* Address */}
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            required
            className="md:col-span-2 w-full p-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 hover:border-green-400"
          />

          {/* Photo Upload */}
          <div className="md:col-span-2">
            <label className="block mb-2 text-sm text-black font-semibold">Upload Picture</label>
            <input
              type="file"
              name="photo"
              accept="image/*"
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-xl file:bg-green-500 file:text-white file:border-none file:px-4 file:py-1 file:rounded-lg hover:file:bg-green-600"
            />
          </div>

          {/* Course & Branch Selection Section */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-6 flex items-center gap-2">
              <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">2</span>
              Course & Location Selection
            </h3>
          </div>

          {/* Course Selection with Fee Display */}
          <div className="md:col-span-2">
            <label className="block mb-2 text-sm text-black font-semibold">Select Course</label>
            <select
              name="course"
              value={formData.course}
              onChange={handleChange}
              required
              className="w-full p-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 hover:border-green-400"
            >
              <option value="">-- Select Course --</option>
              {courses.map((course) => (
                <option key={course._id} value={course.title}>
                  {course.title} - PKR {course.courseFee}
                </option>
              ))}
            </select>
          </div>

          {/* Class Mode Selection */}
          <div className="md:col-span-2">
            <label className="block mb-2 text-sm text-black font-semibold">Choose Class Mode</label>
            <select
              name="classMode"
              value={formData.classMode}
              onChange={handleChange}
              required
              className="w-full p-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 hover:border-green-400"
            >
              <option value="">-- Select Class Mode --</option>
              <option value="Physical">Physical Classes</option>
              <option value="Online">Online Classes</option>
            </select>
          </div>

          {/* Fee Display */}
          {selectedCourseFee > 0 && (
            <div className="md:col-span-2 bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center gap-3">
              <DollarSign className="text-green-600 flex-shrink-0" size={24} />
              <div>
                <p className="text-sm text-gray-600">Course Fee</p>
                <p className="text-2xl font-bold text-green-600">PKR {selectedCourseFee.toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* Branch Selection */}
          <div className="md:col-span-2">
            <select
              name="branchId"
              value={formData.branchId}
              onChange={handleChange}
              required
              disabled={fetchingData}
              className="w-full p-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 hover:border-green-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {fetchingData ? "Loading branches..." : "-- Select Branch --"}
              </option>
              {branches.length > 0 ? (
                branches.map((branch) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.branchName} ({branch.branchCode})
                  </option>
                ))
              ) : (
                !fetchingData && <option disabled>No active branches available</option>
              )}
            </select>
            {fetchError && <p className="text-red-500 text-sm mt-2">{fetchError}</p>}
            <p className="text-xs text-gray-500 mt-1">Select the branch where you want to apply</p>
          </div>

          {/* Message */}
          <textarea
            name="message"
            placeholder="Message (Optional)"
            value={formData.message}
            onChange={handleChange}
            rows="3"
            className="md:col-span-2 w-full p-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 hover:border-green-400"
          />

          {/* Payment Section */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-6 flex items-center gap-2">
              <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">3</span>
              Payment Information
            </h3>
          </div>

          {/* Payment Method Selection */}
          <div className="md:col-span-2">
            <label className="block mb-3 text-sm text-black font-semibold">
              Select Payment Method <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(PAYMENT_METHODS).map(([key, method]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: key })}
                  className={`p-4 border-2 rounded-lg transition ${
                    formData.paymentMethod === key
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 bg-white hover:border-green-400'
                  }`}
                >
                  <div className="font-semibold text-gray-800">{method.name}</div>
                  <div className="text-xs text-gray-600 mt-1">{method.accountNumber}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Details Display */}
          {selectedPaymentMethod && (
            <div className={`md:col-span-2 border-2 rounded-xl p-5 ${selectedPaymentMethod.color}`}>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <CheckCircle size={20} className="text-green-600" />
                {selectedPaymentMethod.name} Details
              </h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>Account Holder:</strong> {selectedPaymentMethod.accountHolder}</p>
                <p><strong>Account/Reference:</strong> <code className="bg-white px-2 py-1 rounded font-mono text-xs">{selectedPaymentMethod.accountNumber}</code></p>
                {selectedPaymentMethod.bankName && (
                  <p><strong>Bank:</strong> {selectedPaymentMethod.bankName}</p>
                )}
                <p className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                  <AlertCircle size={16} className="inline mr-1" />
                  Send payment to the above account and keep the receipt for proof.
                </p>
              </div>
            </div>
          )}

          {/* Payment Proof Upload */}
          <div className="md:col-span-2">
            <label className="block mb-2 text-sm text-black font-semibold">
              Upload Payment Proof <span className="text-red-500">* (Required)</span>
            </label>
            <p className="text-xs text-gray-600 mb-3">Upload a screenshot or photo of your payment receipt/transaction confirmation</p>
            <div className="relative">
              <input
                type="file"
                name="paymentProof"
                accept="image/*,.pdf"
                onChange={handleChange}
                required
                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 file:hidden cursor-pointer hover:border-green-400 transition"
              />
              {!formData.paymentProof && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <Upload size={24} className="text-gray-400 mb-1" />
                  <span className="text-sm text-gray-500">Click to upload payment proof</span>
                </div>
              )}
            </div>
            {paymentProofName && (
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <CheckCircle size={16} />
                {paymentProofName}
              </p>
            )}
          </div>

          {/* Portal Password Section */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-6 flex items-center gap-2">
              <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">4</span>
              Portal Credentials
            </h3>
          </div>

          <div className="md:col-span-2 rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
            <p className="text-sm font-semibold text-amber-900">
              Student Portal Password (Required)
            </p>
            <p className="text-xs text-amber-800">
              Choose a 4-digit number. You will use this with your email to sign in <strong>after</strong> your payment is verified and you are enrolled.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-black mb-1 block">4-digit password</label>
                <input
                  type="password"
                  name="portalPassword"
                  inputMode="numeric"
                  maxLength={4}
                  autoComplete="new-password"
                  placeholder="••••"
                  value={formData.portalPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      portalPassword: e.target.value.replace(/\D/g, "").slice(0, 4),
                    })
                  }
                  required
                  className="w-full p-3 text-black border border-gray-300 rounded-xl tracking-widest focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="text-xs text-black mb-1 block">Confirm 4-digit password</label>
                <input
                  type="password"
                  name="confirmPortalPassword"
                  inputMode="numeric"
                  maxLength={4}
                  autoComplete="new-password"
                  placeholder="••••"
                  value={formData.confirmPortalPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPortalPassword: e.target.value.replace(/\D/g, "").slice(0, 4),
                    })
                  }
                  required
                  className="w-full p-3 text-black border border-gray-300 rounded-xl tracking-widest focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`md:col-span-2 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} text-white py-3 rounded-xl font-semibold transition transform hover:scale-[1.02] flex items-center justify-center gap-2`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                Submit Application
              </>
            )}
          </button>

        </form>
      </div>
    </section>
  );
}