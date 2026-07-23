import { Star } from "lucide-react";

export default function SuccessStories() {
  const successStories = [
    {
      id: 1,
      name: "Priya Sharma",
      image: "/images/A1.png",
      feedback:
        "IIT transformed my career completely! The instructors were knowledgeable and supportive.",
      rating: 5,
    },
    {
      id: 2,
      name: "Rajesh Kumar",
      image: "/images/A3.png",
      feedback:
        "Excellent hands-on training with practical projects. Very industry-relevant.",
      rating: 5,
    },
    {
      id: 3,
      name: "Neha Patel",
      image: "/images/A2.png",
      feedback:
        "Best decision I made for my IT education. Mentors guide you throughout.",
      rating: 5,
    },
    {
      id: 4,
      name: "Arjun Singh",
      image: "/images/A4.png",
      feedback:
        "I went from zero IT knowledge to landing a job at a top company.",
      rating: 5,
    },
  ];

  return (
    <section className="pt-20 bg-gradient-to-b from-white to-gray-50 overflow-hidden">

      {/* HEADING */}
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Success <span className="text-green-600">Stories</span>
        </h2>
      </div>

      {/* SLIDER WRAPPER */}
      <div className="relative w-full">

        {/* TRACK */}
        <div className="flex gap-6 w-max animate-scroll hover:[animation-play-state:paused]">

          {[...successStories, ...successStories].map((t, i) => (
            <div
              key={i}
              className="w-[280px] sm:w-[320px] flex-shrink-0 
              bg-white rounded-2xl border-2 border-gray p-5  
              shadow-xl -translate-y-2 scale-[1.03]
              hover:shadow-sm hover:translate-y-0 hover:scale-100
              transition duration-300"
            >
              {/* QUOTE */}
              <p className="text-sm text-gray-700 italic mb-4">
                “{t.feedback}”
              </p>

              {/* USER */}
              <div className="flex items-center gap-3">

                <img
                  src={t.image}
                  alt={t.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-green-500"
                />

                <div>
                  <h4 className="text-sm font-semibold text-gray-900">
                    {t.name}
                  </h4>

                  {/* STARS */}
                  <div className="flex text-yellow-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                </div>

              </div>
            </div>
          ))}

        </div>
      </div>

      {/* ANIMATION */}
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 25s linear infinite;
          will-change: transform;
        }
      `}</style>

    </section>
  );
}