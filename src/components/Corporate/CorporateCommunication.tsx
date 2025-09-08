import { ai_dashboard, communication_dashboard, talent_pool } from "@Assets";
import { CheckCircle } from "lucide-react";

// Hiring Process Section
const CorporateCommunication = () => {
  const processes = [
    {
      title: 'Smart AI Filtering: Beyond Keywords',
      text: 'Our AI understands context, evaluates transferable skills, and identifies high-potential candidates.',
      items: [
        'Semantic understanding of job requirements',
        'Cultural fit assessment based on company values',
        '98% accuracy in candidate relevance',
      ],
      img: ai_dashboard,
      alt: 'AI filtering dashboard',
      bg: 'bg-blue-50',
    },
    {
      title: 'Pre-Vetted Talent Pool Access',
      text: 'Access a database of pre-screened, high-intent candidates evaluated for skills and aspirations.',
      items: [
        'Interview Ready Candidates',
        'Communication and personality evaluations',
        'Ready-to-interview candidate pipeline',
      ],
      img: talent_pool,
      alt: 'Pre-vetted talent pool dashboard',
      bg: 'bg-green-50',
      reverse: true,
    },
    {
      title: 'End-to-End Candidate Communication',
      text: 'We handle all candidate touchpoints, ensuring no great candidate slips through.',
      items: [
        'Personalized email campaigns',
        'WhatsApp follow-ups and reminders',
        'Phone calls for high-priority candidates',
      ],
      img: communication_dashboard,
      alt: 'Candidate communication dashboard',
      bg: 'bg-blue-50',
    },
  ];

  return (
    <section id="features" className="py-12 sm:py-16">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 sm:mb-12 text-center">
        How We Transform Your Hiring Process
      </h2>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12 sm:space-y-16">
        {processes.map((process, idx) => (
          <div
            key={idx}
            className={`grid text-left grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center ${
              process.reverse ? 'md:grid-flow-dense' : ''
            } animate-slide-in-${process.reverse ? 'right' : 'left'}`}
          >
            <div className={`${process.reverse ? 'md:order-2' : ''} flex justify-center`}>
              <div className={`${process.bg} rounded-xl shadow-lg p-4`}>
                <img src={process.img} alt={process.alt} width={400} height={300} className="rounded-lg object-cover" />
              </div>
            </div>
            <div className={`${process.reverse ? 'md:order-1' : ''}`}>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">{process.title}</h3>
              <p className="text-gray-600 text-left mb-4 sm:mb-6 text-sm sm:text-base">{process.text}</p>
              <ul className="space-y-3">
                {process.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-700 text-sm sm:text-base">
                    <CheckCircle className="text-green-500 w-5 h-5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default CorporateCommunication;