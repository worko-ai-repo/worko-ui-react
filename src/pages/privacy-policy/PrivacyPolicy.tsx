import React from 'react';

const privacySections = [
  {
    title: '1. Information We Collect',
    items: [
      'Personal Information: When you create an account or use Worko services, we may collect personal information such as your name, email address, contact information, and other relevant details you provide.',
      'User Content: We may collect information, including resumes, profiles, and communications, that you voluntarily share or post on Worko.',
      'Log Data and Usage Information: We automatically collect certain information when you access or use Worko, including your IP address, device information, browser type, and usage data.',
    ],
  },
  {
    title: '2. Use of Information',
    items: [
      'To provide and improve the service, personalize your experience, and fulfill your requests.',
      'To communicate with you, respond to your inquiries, and provide customer support.',
      'To analyze usage patterns, perform data analytics, and improve functionality and performance of Worko.',
      'To send you promotional materials, updates, and other relevant information about Worko, subject to your preferences and applicable laws.',
      'To enforce our Terms of Service and protect the rights, safety, and security of our users and the Company.',
    ],
  },
  {
    title: '3. Information Sharing',
    items: [
      'With your consent: We may share your information when you give us explicit permission to do so.',
      'Within the Service: Your information may be shared with other users within the platform to facilitate job referrals and connections.',
      'With trusted third-party service providers: We may engage third-party companies or individuals to perform services on our behalf. These providers are bound by confidentiality obligations.',
      'Compliance with laws: We may disclose your information to comply with legal obligations or protect the rights, property, or safety of others.',
    ],
  },
  {
    title: '4. Data Security',
    items: [
      'We implement appropriate security measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction. However, no method of transmission or storage is completely secure.',
    ],
  },
  {
    title: '5. Third-Party Links and Services',
    items: [
      'Worko may contain links to third-party websites or services not operated by the Company. We are not responsible for their privacy practices and encourage you to review their privacy policies.',
    ],
  },
  {
    title: '6. Children’s Privacy',
    items: [
      'Worko is not intended for individuals under 18. We do not knowingly collect personal information from children. If we become aware of such collection, we will delete the data promptly.',
    ],
  },
  {
    title: '7. Changes to this Policy',
    items: [
      'We may update this policy occasionally. We will notify you of material changes via our website or other communication. Continued use of the Service constitutes acceptance of the revised policy.',
    ],
  },
  {
    title: '8. Contact Us',
    items: [
      'If you have any inquiries, feel free to contact us at hello@worko.ai.',
    ],
  },
];

const PrivacyPolicy = () => {
  return (
    <section className="section-wrapper !pt-5 rounded-b-[2.5rem] pb-32 bg-white">
      <div className="pb-10 font-bold">
        <h1 className="mb-10 text-3xl sm:text-4xl md:text-5xl text-center text-[#0D0D0D]">
          Privacy Policy
        </h1>

        <p className="text-sky-500 font-semibold text-2xl sm:text-3xl text-center mb-6">
          Protecting your data and trust
        </p>

        <p className="text-center text-base sm:text-lg font-medium text-[#0D0D0D] max-w-[90vw] md:max-w-[800px] mx-auto mb-10 px-4 leading-relaxed tracking-wide">
          This Privacy Policy (“Policy”) describes how Worko (“the Company”) collects, uses, and protects the personal information of its users in connection with the services provided through our online platform, website, and related features (collectively referred to as “the Service”). By accessing or using the Service, you consent to the collection and processing of your personal information as described in this Policy.
        </p>

        <div className="space-y-10 max-w-[90vw] md:max-w-[800px] mx-auto text-[#0D0D0D] text-md font-medium leading-[1.7]">
          {privacySections.map((section, idx) => (
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

export default PrivacyPolicy;
