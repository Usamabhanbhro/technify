import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="mt-4 text-xl text-gray-600">Page not found.</p>
        <Link to="/" className="inline-block mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Go to Home
        </Link>
      </div>
    </div>
  );
}
