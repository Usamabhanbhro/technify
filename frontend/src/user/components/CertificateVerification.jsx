import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Search,
  User,
  BookOpen,
  Calendar,
  Loader2,
  ShieldCheck,
  ShieldX,
  Clock,
} from "lucide-react";
import { verifyCertificatePublic } from "../api/certificateApi";

export default function CertificateVerification({ id = "certificate-verification" }) {
  const [certNo, setCertNo] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    const trimmed = certNo.trim();
    if (!trimmed) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await verifyCertificatePublic(trimmed);
      setResult({
        valid: true,
        candidateName: res.certificate.candidateName,
        courseProgram: res.certificate.courseProgram,
        issueDate: res.certificate.issueDate,
        verifiedAt: new Date(),
      });
    } catch {
      setResult({
        valid: false,
        verifiedAt: new Date(),
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTimestamp = (date) => {
    if (!date) return "";
    return date.toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <section
      id={id}
      className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4 py-10"
    >
      <div className="w-full max-w-lg bg-white shadow-xl rounded-2xl p-6 border">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Certificate Verification
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Enter your certificate number to verify authenticity
        </p>

        <div className="flex items-center gap-2 border rounded-lg p-2 focus-within:border-green-500 transition">
          <Search className="text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Enter Certificate Number"
            value={certNo}
            onChange={(e) => setCertNo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            className="w-full outline-none text-sm"
          />
        </div>

        <button
          type="button"
          onClick={handleVerify}
          disabled={loading || !certNo.trim()}
          className="w-full mt-4 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Verifying...
            </>
          ) : (
            "Verify Certificate"
          )}
        </button>

        {result && (
          <div className="mt-6">
            <div className="flex items-center justify-center mb-4">
              {result.valid ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                  <ShieldCheck size={16} />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                  <ShieldX size={16} />
                  Not Verified
                </span>
              )}
            </div>

            {result.valid ? (
              <div className="space-y-4">
                <div className="text-center">
                  <CheckCircle className="mx-auto text-green-600 mb-2" size={48} />
                  <p className="font-semibold text-lg text-green-700">
                    This certificate is verified from IIT
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-green-200 space-y-3">
                  <div className="flex items-center gap-3 text-left">
                    <User size={18} className="text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Candidate Name</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {result.candidateName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-left">
                    <BookOpen size={18} className="text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Course Program</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {result.courseProgram}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-left">
                    <Calendar size={18} className="text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Issue Date</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {formatDate(result.issueDate)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-red-500 flex flex-col items-center gap-2 text-center">
                <XCircle size={48} />
                <p className="font-semibold text-lg">
                  Invalid certificate number. No record found.
                </p>
              </div>
            )}

            {result.verifiedAt && (
              <p className="mt-4 text-xs text-gray-400 text-center flex items-center justify-center gap-1">
                <Clock size={14} />
                Verified on {formatTimestamp(result.verifiedAt)}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
