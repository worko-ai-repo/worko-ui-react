import React from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';

const ContactUs = () => {
    return (
        <section className="section-wrapper !pt-5 rounded-b-[2.5rem] pb-32 bg-white">
            <div className="pb-10 font-bold">
                <h1 className="mb-10 text-center text-3xl sm:text-4xl md:text-5xl text-[#0D0D0D]">
                    Contact Us
                </h1>

                <p className="text-sky-500 font-semibold text-3xl mb-6 text-center">
                    We'd love to hear from you!
                </p>

                <div className="tracking-wider leading-[1.5] text-md font-medium text-[#0D0D0D] max-w-[90vw] md:max-w-[780px] mx-auto text-center space-y-10">
                    <div>
                        <MapPin className="mx-auto text-sky-500 mb-2" />
                        <p>
                            <span className="block font-semibold">Tenet Concepts Private Limited</span>
                            1083, Sobha Primrose,<br />
                            Bellandur, Bangalore, Karnataka 560103, India.
                        </p>
                    </div>

                    <div>
                        <Mail className="mx-auto text-sky-500 mb-2" />
                        <a href="mailto:hello@worko.ai" className="hover:underline">
                            hello@worko.ai
                        </a>
                    </div>

                    <div>
                        <Phone className="mx-auto text-sky-500 mb-2" />
                        <a href="tel:+919811929282" className="hover:underline">
                            +91 98119 29282
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactUs;
