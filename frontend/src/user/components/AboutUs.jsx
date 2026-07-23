export default function AboutUs() {
  return (
    <section
      id="about"
      className="py-10 bg-gradient-to-b from-gray-50 to-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <h2 className="text-4xl font-bold text-center mb-12 mt-10 text-gray-900">
          About <span className="text-green-600">Us</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* LEFT CONTENT */}
          <div className="space-y-6">

            <p className="text-lg text-gray-600 leading-relaxed transition duration-300 hover:text-gray-800 hover:translate-x-1">
              Welcome to the Institute of Information Technology (IIT), where we empower the next generation
              of IT professionals. With over a decade of excellence, we have trained thousands of students
              who are now working in leading companies worldwide.
            </p>

            <p className="text-lg text-gray-600 leading-relaxed transition duration-300 hover:text-gray-800 hover:translate-x-1">
              Our institution is committed to providing industry-relevant education combined with hands-on
              practical experience. Our expert instructors bring real-world knowledge and experience to every classroom.
            </p>

            <div className="space-y-3">

              <h3 className="text-xl font-semibold text-gray-800">
                Why Choose IIT?
              </h3>

              <ul className="space-y-2">
                {[
                  "Industry-expert instructors with 10+ years experience",
                  "Hands-on practical training with latest tools",
                  "100% job placement assistance",
                  "International certification programs",
                  "Flexible learning schedules",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center space-x-3 text-gray-600 transition duration-300 hover:text-green-600 hover:translate-x-2 cursor-pointer"
                  >
                    <span className="text-green-500 font-bold text-lg">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

            </div>
          </div>

          {/* RIGHT VIDEO (PROFESSIONAL CARD) */}
          <div>

            <div className="group relative rounded-2xl overflow-hidden shadow-xl border border-gray-200 transition duration-500 hover:shadow-2xl hover:scale-[1.03]">

              {/* Video */}
              <video
                className="w-full h-64 sm:h-72 md:h-96 object-cover"
                muted
                loop
                autoPlay
                playsInline
              >
                <source src="/videos/video1.mp4" type="video/mp4" />
              </video>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

              {/* Play Icon UI */}
              {/* <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/40 group-hover:scale-110 transition duration-300">
                  <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1"></div>
                </div>
              </div> */}

              {/* Bottom Text */}
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-lg font-semibold">IIT Campus Overview</h3>
                <p className="text-sm text-white/70">Learn • Build • Grow</p>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}