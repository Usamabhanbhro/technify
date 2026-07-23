import { Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-10">

          {/* Logo + About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/images/logo.png"
                alt="IIT Logo"
           className="h-10 sm:h-12 w-auto object-contain bg-white p-1 rounded-t-[40px]  rounded-b-none"
              />
              <h3 className="text-lg font-bold leading-tight">
                Institute Of <br />
                <span className="text-green-500">Information Technology</span>
              </h3>
            </div>

            <p className="text-white text-sm leading-relaxed">
              Empowering students with modern IT education, practical skills,
              and industry-level training for a successful future.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-5 text-green-400">
              Quick Links
            </h4>

            <ul className="space-y-3 text-sm">
              {["Home", "About Us", "Courses", "Admission", "LMS"].map((item, i) => (
                <li key={i}>
                  <a
                    href="#"
                    className="text-white hover:text-green-400 transition duration-300 hover:translate-x-1 inline-block"
                  >
                    → {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-5 text-green-400">
              Contact
            </h4>

            <div className="space-y-4 text-sm">

              <div className="flex items-center gap-3 text-white hover:text-green-400 transition">
                <Phone size={18} />
                <span>+92 342 0372875</span>
              </div>

              <div className="flex items-center gap-3 text-white hover:text-green-400 transition">
                <Mail size={18} />
                <span>appex110@gmail.com</span>
              </div>

              <div className="flex items-start gap-3 text-white hover:text-green-400 transition">
                <MapPin size={18} className="mt-1" />
                <span>
                  Hyderabad Qasimabad, Ali Place near LUMS Library
                </span>
              </div>

            </div>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-lg font-semibold mb-5 text-green-400">
              Follow Us
            </h4>

            <div className="flex gap-4">
              {["f", "𝕏", "in", "📷"].map((icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-green-500 hover:scale-110 transition duration-300"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom */}
        <div className="border-t border-white  text-center py-6">
          <p className="text-white text-sm">
            © 2026 <span className="text-green-500">Institute Of Information Technology</span>
          </p>
        </div>

      </div>
    </footer>
  );
}