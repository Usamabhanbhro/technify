import { useState } from "react";
import { CheckCircle } from "lucide-react";

const PAYMENT_METHODS = {
  Jazzcash: {
    label: "JazzCash",
    details: [
      { label: "Send to", value: "JazzCash" },
      { label: "Account", value: "0300-1234567" },
      { label: "Holder", value: "IIT LMS Institute" },
    ],
    color: "bg-purple-50 border-purple-200",
  },
  Easypaisa: {
    label: "EasyPaisa",
    details: [
      { label: "Send to", value: "EasyPaisa" },
      { label: "Account", value: "0300-1234567" },
      { label: "Holder", value: "IIT LMS Institute" },
    ],
    color: "bg-blue-50 border-blue-200",
  },
  Bank: {
    label: "Bank Account",
    details: [
      { label: "Bank", value: "Meezan Bank" },
      { label: "Account", value: "123456789" },
      { label: "Holder", value: "IIT LMS Institute" },
    ],
    color: "bg-green-50 border-green-200",
  },
  Card: {
    label: "Card",
    details: [
      { label: "Info", value: "Card payment integration required" },
    ],
    color: "bg-yellow-50 border-yellow-200",
  },
};

export default function DonateUs() {
  const [amount, setAmount] = useState(1000);
  const [custom, setCustom] = useState("");
  const [method, setMethod] = useState("Jazzcash");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [screenshotName, setScreenshotName] = useState("");

  const [user, setUser] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const presetAmounts = [500, 1000, 2000, 5000];

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Please upload JPEG, PNG, GIF, or PDF.');
        setPaymentScreenshot(null);
        setScreenshotName("");
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size exceeds 10MB limit.');
        setPaymentScreenshot(null);
        setScreenshotName("");
        return;
      }
      setPaymentScreenshot(file);
      setScreenshotName(file.name);
      setError("");
    }
  };

  const handleSubmit = async () => {
    // Validate payment screenshot is required
    if (!paymentScreenshot) {
      setError('Payment screenshot is mandatory. Please upload your payment proof.');
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append('name', user.name || 'Anonymous Donor');
      formData.append('email', user.email || 'anonymous@donation.local');
      formData.append('phone', user.phone || '');
      formData.append('amount', amount);
      formData.append('paymentMethod', method);
      formData.append('paymentScreenshot', paymentScreenshot);

      const response = await fetch('http://localhost:5000/api/donations/submit', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setStep(3);
        // Reset form
        setUser({ name: "", phone: "", email: "" });
        setPaymentScreenshot(null);
        setScreenshotName("");
        setAmount(1000);
        setCustom("");
      } else {
        setError(result.message || 'Error submitting donation. Please try again.');
      }
    } catch (err) {
      console.error('Donation submission error:', err);
      setError('An error occurred while submitting your donation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4">
      {/* HEADER */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900">
          Donate & Help People
        </h1>
        <p className="text-gray-600 mt-2">
          100% transparent and secure donation system
        </p>
      </div>

      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        {/* STEP 1 */}
        {step === 1 && (
          <>
            {/* CAMPAIGN */}
            <h3 className="font-semibold mb-1">Campaign</h3>
            <p className="text-gray-700 bg-gray-100 px-4 py-2 rounded-lg inline-block mb-5 font-medium">
              Education Support
            </p>

            {/* AMOUNT */}
            <h3 className="font-semibold mb-3">Amount</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {presetAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    setAmount(amt);
                    setCustom("");
                  }}
                  className={`py-2 rounded-lg border ${
                    amount === amt
                      ? "bg-green-600 text-white"
                      : "hover:bg-green-50"
                  }`}
                >
                  Rs {amt}
                </button>
              ))}
            </div>

            <input
              type="number"
              placeholder="Custom amount"
              value={custom}
              onChange={(e) => {
                setCustom(e.target.value);
                setAmount(Number(e.target.value));
              }}
              className="w-full border rounded-lg px-3 py-2 mb-5"
            />

            <button
              onClick={() => setStep(2)}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold"
            >
              Continue
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            {/* USER INFO */}
            <h3 className="font-semibold mb-3">Your Details (Optional)</h3>

            <input
              placeholder="Full Name (Optional)"
              className="w-full border p-3 rounded-lg mb-3"
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
            />
            <input
              placeholder="Email Address (Optional)"
              type="email"
              className="w-full border p-3 rounded-lg mb-3"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
            />
            <input
              placeholder="Phone Number (Optional)"
              className="w-full border p-3 rounded-lg mb-5"
              value={user.phone}
              onChange={(e) => setUser({ ...user, phone: e.target.value })}
            />

            {/* PAYMENT */}
            <h3 className="font-semibold mb-3">Donate Payment Method</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {Object.entries(PAYMENT_METHODS).map(([key, payment]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMethod(key)}
                  className={`p-4 border-2 rounded-xl text-left transition shadow-sm ${
                    method === key
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-green-300'
                  }`}
                >
                  <div className="text-base font-semibold text-gray-900">
                    {payment.label}
                  </div>
                  <div className="text-sm text-gray-600 mt-2 space-y-1">
                    {payment.details.map((detail) => (
                      <p key={detail.label}>
                        <span className="font-medium text-gray-800">{detail.label}:</span>{' '}
                        {detail.value}
                      </p>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            <div className={`border-2 rounded-xl p-5 ${PAYMENT_METHODS[method].color}`}>
              <h4 className="font-semibold text-gray-800 mb-3">{PAYMENT_METHODS[method].label} Details</h4>
              <div className="space-y-2 text-sm text-gray-700">
                {PAYMENT_METHODS[method].details.map((detail) => (
                  <p key={detail.label}>
                    <span className="font-medium">{detail.label}:</span>{' '}
                    {detail.value}
                  </p>
                ))}
              </div>
            </div>

            {/* PAYMENT SCREENSHOT UPLOAD */}
            <h3 className="font-semibold mt-6 mb-3">Upload Payment Receipt/Screenshot *</h3>
            <p className="text-sm text-gray-600 mb-3">Upload a screenshot or photo of your payment receipt or transaction confirmation</p>

            <div className="relative mb-4">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-xl focus:outline-none cursor-pointer hover:border-green-400 transition"
              />
              {!paymentScreenshot && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <svg className="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-sm text-gray-500">Click to upload</span>
                </div>
              )}
            </div>

            {screenshotName && (
              <p className="text-sm text-green-600 mb-4 flex items-center gap-2">
                <CheckCircle size={16} />
                {screenshotName}
              </p>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => {
                  setStep(1);
                  setError("");
                }}
                className="w-1/3 border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`w-2/3 text-white py-3 rounded-xl font-semibold transition ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {loading ? 'Processing...' : 'Confirm Donation'}
              </button>
            </div>
          </>
        )}

        {/* STEP 3 SUCCESS */}
        {step === 3 && (
          <div className="text-center py-10">
            <CheckCircle size={50} className="text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">
              Thank You for Your Donation!
            </h2>
            <p className="text-gray-600 mt-2">
              Your donation of Rs {amount} for <strong>Education Support</strong> has been recorded.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}