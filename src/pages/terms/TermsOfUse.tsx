import React from 'react';

const terms = [
    {
        title: '1. Account Creation and Eligibility',
        items: [
            'To access and use the Service, you must create an account and provide accurate, complete, and up-to-date information.',
            'You must be at least 18 years old or have reached the age of majority in your jurisdiction to use the Service.',
            'You are responsible for maintaining the confidentiality of your account credentials and are solely responsible for any activities that occur under your account.',
        ],
    },
    {
        title: '2. Use of the Service',
        items: [
            'The Service provided by Worko is intended for the purpose of facilitating job referrals and connections between job seekers and employees.',
            'You agree to use the Service in compliance with all applicable laws, regulations, and these Terms.',
            'You shall not use the Service for any unlawful, fraudulent, or unauthorized purposes. You shall not engage in any activity that could disrupt or interfere with the functionality or security of the Service.',
            'The content, information, and materials available through the Service are for general informational purposes only. We do not guarantee the accuracy, completeness, or reliability of such content.',
        ],
    },
    {
        title: '3. Referrals and Communications',
        items: [
            'As a user of Worko, you may refer candidates for job opportunities and communicate with other users within the platform. You are solely responsible for the referrals you make and the content of your communications.',
            'By making referrals, you confirm that you have obtained the necessary consent from the referred candidates and that the information provided is accurate to the best of your knowledge.',
            'Worko does not guarantee the acceptance of referrals by referees or the outcome of any job applications resulting from referrals made through Worko.',
        ],
    },
    {
        title: '4. Intellectual Property Rights',
        items: [
            'All intellectual property rights related to the Service, including but not limited to trademarks, logos, software, and content, are owned by or licensed to the Company.',
            'You may not reproduce, modify, distribute, or create derivative works of any intellectual property belonging to the Company without prior written consent.',
        ],
    },
    {
        title: '5. Privacy',
        items: [
            'Your privacy is important to us. The collection, use, and disclosure of your personal information are subject to our Privacy Policy, which forms an integral part of these Terms.',
        ],
    },
    {
        title: '6. Termination',
        items: [
            'Worko may suspend or terminate your access to the Service, in whole or in part, at any time and for any reason, without prior notice.',
            'Upon termination, all rights granted to you under these Terms will cease, and you must immediately cease all use of the Service.',
        ],
    },
    {
        title: '7. Disclaimer of Warranties and Limitation of Liability',
        items: [
            'The Service is provided on an “as-is” and “as-available” basis. Worko does not make any warranties or representations regarding the Service’s accuracy, reliability, or availability.',
            'To the maximum extent allowed by law, the Company shall not be held liable for any direct, indirect, incidental, consequential, or punitive damages.',
        ],
    },
];

const TermsOfUse = () => {
    return (
        <section className="section-wrapper !pt-5 rounded-b-[2.5rem] pb-32 bg-white">
            <div className="pb-10 font-bold">
                <h1 className="mb-10 text-3xl sm:text-4xl md:text-5xl text-center text-[#0D0D0D]">
                    Terms of Service
                </h1>

                <p className="text-sky-500 font-semibold text-2xl sm:text-3xl text-center mb-6">
                    Legal and User Commitments
                </p>

                <p className="text-center text-base sm:text-lg font-medium text-[#0D0D0D] max-w-[90vw] md:max-w-[800px] mx-auto mb-10 px-4 leading-relaxed tracking-wide">
                    These Terms of Service (“Terms”) govern your use of the services provided by Worko (“the Company”), including but not limited to our online platform, website, and related features (collectively referred to as “the Service”). By accessing or using the Service, you agree to be bound by these Terms.
                </p>

                <div className="space-y-10 max-w-[90vw] md:max-w-[800px] mx-auto text-[#0D0D0D] text-md font-medium leading-[1.7]">
                    {terms.map((section, idx) => (
                        <div key={idx}>
                            <h2 className="text-lg font-bold mb-4 text-sky-600">{section.title}</h2>
                            <ul className="list-decimal list-inside space-y-2 pl-4">
                                {section.items.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};


export default TermsOfUse;
