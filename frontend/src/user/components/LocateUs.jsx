import React from 'react'

function LocateUs() {
    return (
        <section className="py-6 bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Heading */}
                <div className="text-center mb-10">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                        Locate <span className="text-green-600">Us</span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-3">
                        Visit our campus at Hyderabad Qasimabad
                    </p>
                </div>

                {/* MAP */}
                <div className="h-full rounded-2xl overflow-hidden border shadow-sm hover:shadow-xl transition duration-500">
                    <iframe
                        src="https://www.google.com/maps?q=Hyderabad%20Qasimabad&output=embed"
                        className="w-full h-full min-h-[280px] sm:min-h-[420px]"
                        loading="lazy"
                        title="location-map"
                    ></iframe>
                </div>

            </div>
        </section>
    )
}

export default LocateUs