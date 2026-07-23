import { useState } from "react";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message Sent");
    setFormData({ name: "", subject: "", message: "" });
  };

  return (
    <section className="py-10 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Get In <span className="text-green-600">Touch</span>
          </h2>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            Send us a message anytime
          </p>
        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-1 gap-8 items-stretch">

          

          {/* (FORM) */}
          <div className="h-full flex">

            <div className="w-full bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-2xl transition duration-500 flex flex-col justify-center">

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Name */}
                <div className="relative">
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="peer w-full px-4 pt-6 pb-2 border rounded-lg focus:outline-none focus:border-green-500"
                  />
                  <label className="absolute left-4 top-2 text-sm text-gray-500">
                    Your Name
                  </label>
                </div>

                {/* Subject */}
                <div className="relative">
                  <input
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="peer w-full px-4 pt-6 pb-2 border rounded-lg focus:outline-none focus:border-green-500"
                  />
                  <label className="absolute left-4 top-2 text-sm text-gray-500">
                    Subject
                  </label>
                </div>

                {/* Message */}
                <div className="relative">
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    required
                    className="peer w-full px-4 pt-6 pb-2 border rounded-lg resize-none focus:outline-none focus:border-green-500"
                  ></textarea>
                  <label className="absolute left-4 top-2 text-sm text-gray-500">
                    Message
                  </label>
                </div>

                {/* Button */}
                <button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 hover:shadow-lg transition"
                >
                  Send Message
                </button>

              </form>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}