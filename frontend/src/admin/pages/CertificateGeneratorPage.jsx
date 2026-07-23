import { useEffect, useState } from 'react';
import { Award, Loader2, Trash2 } from 'lucide-react';
import {
  createCertificate,
  fetchCertificates,
  deleteCertificate,
} from '../api/certificateApi';

export default function CertificateGeneratorPage() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCerts, setFetchingCerts] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    certNo: '',
    candidateName: '',
    courseName: '',
    issueDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = () => {
    setFetchingCerts(true);
    fetchCertificates()
      .then((res) => setCertificates(res.certificates || []))
      .catch((err) => console.error(err))
      .finally(() => setFetchingCerts(false));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await createCertificate({
        certNo: form.certNo.trim(),
        candidateName: form.candidateName.trim(),
        courseName: form.courseName.trim(),
        issueDate: form.issueDate,
      });
      setSuccess(res.message || 'Certificate saved successfully.');
      setForm({
        certNo: '',
        candidateName: '',
        courseName: '',
        issueDate: new Date().toISOString().split('T')[0],
      });
      loadCertificates();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Failed to save certificate'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) return;

    try {
      await deleteCertificate(id);
      loadCertificates();
    } catch {
      alert('Failed to delete certificate');
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <Award className="text-yellow-600" size={32} />
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Certificate Management</h1>
          <p className="text-slate-500 text-sm">
            Create and manage certificate records for public verification.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5"
      >
        <h2 className="text-lg font-semibold text-slate-800">Certificate Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Certificate Number *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. IIT-2024-0001"
              value={form.certNo}
              onChange={(e) => setForm({ ...form, certNo: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Candidate Name *
            </label>
            <input
              type="text"
              required
              placeholder="Full name of candidate"
              value={form.candidateName}
              onChange={(e) => setForm({ ...form, candidateName: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Course Program *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Web Development"
              value={form.courseName}
              onChange={(e) => setForm({ ...form, courseName: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Issue Date *
            </label>
            <input
              type="date"
              required
              value={form.issueDate}
              onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {success && (
          <p className="text-green-700 text-sm bg-green-50 border border-green-100 rounded-lg px-3 py-2">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : null}
          {loading ? 'Saving…' : 'Save Certificate'}
        </button>
      </form>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-800">Saved Certificates</h2>
          <span className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
            Total: {certificates.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-600">
                <th className="py-3 px-4">Cert No.</th>
                <th className="py-3 px-4">Candidate Name</th>
                <th className="py-3 px-4">Course Program</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {fetchingCerts ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">
                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                    Loading certificates...
                  </td>
                </tr>
              ) : certificates.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500">
                    No certificates saved yet.
                  </td>
                </tr>
              ) : (
                certificates.map((cert) => (
                  <tr key={cert._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-blue-600">{cert.certNo}</td>
                    <td className="py-3 px-4 font-medium">{cert.studentName}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                        {cert.courseName}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(cert.issueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(cert._id)}
                        className="text-slate-400 hover:text-red-600 transition-colors p-1"
                        title="Delete certificate"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
