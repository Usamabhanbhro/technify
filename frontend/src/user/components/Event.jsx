import { useState } from "react";
import { Calendar, MapPin, Clock, Users, X, Send } from "lucide-react";

export default function EventsPage() {
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [joinForm, setJoinForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinStatus, setJoinStatus] = useState({ success: '', error: '' });

  // ==============================
  // 🔥 ONGOING EVENTS (Abhi Chal Rahe)
  // ==============================
  const ongoing = [
    {
      id: 1,
      title: "Full Stack Web Development Bootcamp",
      date: "1 May - 15 May 2026",
      time: "9:00 AM - 12:00 PM",
      location: "Lab 2, Hyderabad Campus",
      seats: "15/30 Seats Filled",
      image: "/images/mern.png",
      status: "Ongoing",
    },
    {
      id: 2,
      title: "Python for Data Science",
      date: "15 April - 14 May 2026",
      time: "2:00 PM - 5:00 PM",
      location: "Online (Zoom)",
      seats: "22/25 Seats Filled",
      image: "/images/ai1.png",
      status: "Ongoing",
    },
    {
      id: 3,
      title: "Networking & CCNA Training",
      date: "1 May - 7 May 2026",
      time: "10:00 AM - 1:00 PM",
      location: "Lab 4, Hyderabad Campus",
      seats: "10/20 Seats Filled",
      image: "/images/net.png",
      status: "Ongoing",
    },
  ];

  // ==============================
  // UPCOMING EVENTS (Aane Wale)
  // ==============================
  const upcoming = [
    {
      id: 4,
      title: "AI & Machine Learning Workshop",
      date: "10 July 2026",
      time: "10:00 AM - 4:00 PM",
      location: "Auditorium, Hyderabad Campus",
      seats: "50 Seats Available",
      image: "/images/ai1.png",
      badge: "Early Bird",
    },
    {
      id: 5,
      title: "Cyber Security Hands-on Training",
      date: "25 July 2026",
      time: "9:00 AM - 3:00 PM",
      location: "Online (Microsoft Teams)",
      seats: "35 Seats Available",
      image: "/images/cyber.png",
      badge: "Free Entry",
    },
    {
      id: 6,
      title: "Mobile App Development with React Native",
      date: "5 August 2026",
      time: "11:00 AM - 5:00 PM",
      location: "Lab 1, Hyderabad Campus",
      seats: "20 Seats Available",
      image: "/images/app.png",
      badge: "New",
    },
    {
      id: 7,
      title: "Office Automation & Advanced Excel",
      date: "20 August 2026",
      time: "2:00 PM - 6:00 PM",
      location: "Lab 3, Hyderabad Campus",
      seats: "40 Seats Available",
      image: "/images/office.png",
      badge: "Popular",
    },
  ];

  // ==============================
  // PAST EVENTS (Ho Chuke)
  // ==============================
  const past = [
    {
      id: 8,
      title: "Graphic Designing Masterclass",
      date: "5 May 2026",
      location: "Hyderabad Campus",
      attendees: "45 Participants",
      image: "/images/CIT.png",
      feedback: "⭐ 4.8/5",
    },
    {
      id: 9,
      title: "Ethical Hacking Seminar",
      date: "15 April 2026",
      location: "Online",
      attendees: "120 Participants",
      image: "/images/cyber.png",
      feedback: "⭐ 4.9/5",
    },
    {
      id: 10,
      title: "IoT & Smart Devices Workshop",
      date: "28 March 2026",
      location: "Lab 2, Hyderabad Campus",
      attendees: "30 Participants",
      image: "/images/net.png",
      feedback: "⭐ 4.7/5",
    },
    {
      id: 11,
      title: "Database Management with SQL",
      date: "10 March 2026",
      location: "Online (Zoom)",
      attendees: "60 Participants",
      image: "/images/office.png",
      feedback: "⭐ 4.6/5",
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ============================== */}
      {/* HERO SECTION */}
      {/* ============================== */}
      <div className="relative h-[55vh] w-full">
        <img
          src="/images/mern.png"
          alt="Events Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60 flex flex-col justify-center items-center text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Events & <span className="text-green-400">Workshops</span>
          </h1>
          <p className="text-lg text-gray-200 max-w-xl">
            Join our professional IT events and grow your career 🚀
          </p>
        </div>
      </div>

      {/* ============================== */}
      {/* ONGOING EVENTS */}
      {/* ============================== */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-8">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Ongoing Events
          </h2>
        </div>

        {/* Ongoing Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ongoing.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden border-l-4 border-green-500"
            >
              {/* Image */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover hover:scale-110 transition duration-500"
                />
                {/* Status Badge */}
                <span className="absolute top-3 right-3 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-semibold animate-pulse">
                  {event.status}
                </span>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-bold text-lg text-gray-900 mb-3">
                  {event.title}
                </h3>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Calendar size={16} className="text-green-600" />
                    {event.date}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Clock size={16} className="text-green-600" />
                    {event.time}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <MapPin size={16} className="text-green-600" />
                    {event.location}
                  </p>
                </div>

                {/* Seats Info + Button */}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Users size={14} />
                    {event.seats}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEvent(event);
                      setJoinForm({ name: '', email: '', phone: '', message: '' });
                      setJoinStatus({ success: '', error: '' });
                      setIsJoinModalOpen(true);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition"
                  >
                    Join Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================== */}
      {/* JOIN EVENT MODAL */}
      {/* ============================== */}
      {isJoinModalOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Join Event</h3>
                <p className="text-sm text-gray-600">{selectedEvent.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsJoinModalOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid gap-4 md:grid-cols-2 mb-6">
                <div className="rounded-2xl overflow-hidden bg-gray-50">
                  <img src={selectedEvent.image} alt={selectedEvent.title} className="w-full h-48 object-cover" />
                </div>
                <div className="space-y-3">
                  <div className="rounded-2xl bg-green-50 p-4">
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-semibold text-gray-900">{selectedEvent.date}</p>
                  </div>
                  <div className="rounded-2xl bg-blue-50 p-4">
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-semibold text-gray-900">{selectedEvent.time}</p>
                  </div>
                  <div className="rounded-2xl bg-yellow-50 p-4">
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-semibold text-gray-900">{selectedEvent.location}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                setJoinStatus({ success: '', error: '' });

                const trimmedName = joinForm.name.trim();
                const trimmedEmail = joinForm.email.trim();
                const trimmedPhone = joinForm.phone.trim();

                if (!trimmedName || !trimmedEmail || !trimmedPhone) {
                  setJoinStatus({ success: '', error: 'Please fill in all required fields.' });
                  return;
                }

                setJoinLoading(true);

                try {
                  const response = await fetch(`${API_BASE}/api/user/events/join`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      eventId: selectedEvent.id,
                      title: selectedEvent.title,
                      date: selectedEvent.date,
                      time: selectedEvent.time,
                      location: selectedEvent.location,
                      name: trimmedName,
                      email: trimmedEmail,
                      phone: trimmedPhone,
                      message: joinForm.message.trim(),
                    }),
                  });

                  const data = await response.json();
                  if (data.success) {
                    setJoinStatus({ success: data.message || 'Your request has been sent.', error: '' });
                    setJoinForm({ name: '', email: '', phone: '', message: '' });
                  } else {
                    setJoinStatus({ success: '', error: data.message || 'Unable to submit request.' });
                  }
                } catch (error) {
                  console.error('Join event error:', error);
                  setJoinStatus({ success: '', error: 'Unable to send request. Please try again.' });
                } finally {
                  setJoinLoading(false);
                }
              }}>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">Full Name</span>
                    <input
                      type="text"
                      name="name"
                      value={joinForm.name}
                      onChange={(e) => setJoinForm((prev) => ({ ...prev, name: e.target.value }))}
                      required
                      className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">Email Address</span>
                    <input
                      type="email"
                      name="email"
                      value={joinForm.email}
                      onChange={(e) => setJoinForm((prev) => ({ ...prev, email: e.target.value }))}
                      required
                      className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="text-sm font-medium text-gray-700">Phone Number</span>
                    <input
                      type="tel"
                      name="phone"
                      value={joinForm.phone}
                      onChange={(e) => setJoinForm((prev) => ({ ...prev, phone: e.target.value }))}
                      required
                      className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="text-sm font-medium text-gray-700">Message (Optional)</span>
                    <textarea
                      name="message"
                      value={joinForm.message}
                      onChange={(e) => setJoinForm((prev) => ({ ...prev, message: e.target.value }))}
                      rows="4"
                      className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
                    />
                  </label>
                </div>

                {joinStatus.error && (
                  <p className="mt-4 text-sm text-red-600">{joinStatus.error}</p>
                )}
                {joinStatus.success && (
                  <p className="mt-4 text-sm text-green-600">{joinStatus.success}</p>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="submit"
                    disabled={joinLoading}
                    className={`inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-white ${joinLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} transition`}
                  >
                    {joinLoading ? 'Sending...' : 'Send Request'}
                    <Send size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsJoinModalOpen(false)}
                    className="rounded-2xl border border-gray-300 bg-white px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ============================== */}
      {/* UPCOMING EVENTS */}
      {/* ============================== */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-8">
          <Calendar size={28} className="text-blue-600" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Upcoming Events
          </h2>
        </div>

        {/* Upcoming Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {upcoming.map((event) => (
            <div
              key={event.id}
              className="bg-white shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden"
            >
              {/* Image */}
              <div className="relative h-40 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover hover:scale-110 transition duration-500"
                />
                {/* Badge */}
                <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                  {event.badge}
                </span>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-2 text-sm">
                  {event.title}
                </h3>

                <div className="space-y-1.5 mb-4">
                  <p className="text-xs text-gray-600 flex items-center gap-1.5">
                    <Calendar size={13} className="text-blue-600" />
                    {event.date}
                  </p>
                  <p className="text-xs text-gray-600 flex items-center gap-1.5">
                    <Clock size={13} className="text-blue-600" />
                    {event.time}
                  </p>
                  <p className="text-xs text-gray-600 flex items-center gap-1.5">
                    <MapPin size={13} className="text-blue-600" />
                    {event.location}
                  </p>
                </div>

                {/* Seats + Button */}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">{event.seats}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEvent(event);
                      setJoinForm({ name: '', email: '', phone: '', message: '' });
                      setJoinStatus({ success: '', error: '' });
                      setIsJoinModalOpen(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
                  >
                    Register
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================== */}
      {/* PAST EVENTS */}
      {/* ============================== */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Past Events
          </h2>
        </div>

        {/* Past Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {past.map((event) => (
            <div
              key={event.id}
              className="bg-gray-100 overflow-hidden opacity-80 hover:opacity-100 transition"
            >
              {/* Image */}
              <div className="relative h-36 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover grayscale-[30%]"
                />
                {/* Feedback Badge */}
                <span className="absolute top-3 right-3 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  {event.feedback}
                </span>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-gray-700 text-sm mb-2">
                  {event.title}
                </h3>

                <div className="space-y-1.5">
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Calendar size={13} />
                    {event.date}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <MapPin size={13} />
                    {event.location}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Users size={13} />
                    {event.attendees}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}