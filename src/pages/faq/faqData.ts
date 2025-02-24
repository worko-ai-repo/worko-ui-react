// faqData.ts
export interface FAQItem {
    id: string;
    question: string;
    answer: any;
  }
  
  export const faqDataCand : FAQItem []= [
    {
      id: "how-to-request-referral",
      question: "How to request for a referral?",
      answer: [
        "Look out for relevant openings at the company's career page you are interested in.",
        "Share job URL and raise referral requests."
      ]
    },
    {
      id: "how-does-matching-work",
      question: "How does matching work?",
      answer: [
        "Based on factors such as Worko assessment score, your designation, location, and role, we carefully match your information with a select group of referrers most suitable to validate your skills for a referral.",
        "Referrers hold the discretion to decline your application. If declined, we expand your candidacy to include others within the company who might be willing to refer you."
      ]
    },
    {
      id: "Referral Completion timeline",
      question: "Referral completion timeline?",
      answer: [
        "It depends on factors such as:",
        "Your profile and experience",
        "How aggressively the company is hiring",
        "Number of available referrers for the company",
        "Referrer activity (weekends & holidays tend to be slower)"
      ]
    },
    {
      id: "platform-fee",
      question: "Why do I have to pay the platform fee to Worko?",
      answer: [
        "A nominal platform fee safeguards against spam and ensures the quality and relevance of requests.",
        "It helps keep the site running and allows onboarding of more referees."
      ]
    },
    {
      id: "successful-referral",
      question: "What is a successful referral, and what should I expect after requesting one?",
      answer: [
        "A successful referral occurs when a referrer accepts and recommends your candidacy after evaluating your profile.",
        "You can chat with your referee after they accept your referral request.",
        "Upon profile shortlisting by the hiring team, expect an interview call."
      ]
    },
    {
      id: "RequestNewCompany",
      question: "What should I do if the company of my choice is not added to the list?",
      answer: "Please write to us at findreferral@worko.ai & we will try to onboard the company and referees."
    },
    {
      id: "Increase_referrals",
      question: "If Worko rejects my referral request, then what should I do?",
      answer: "If needed, raise a referral request for more relevant jobs, and we'll connect you with an appropriate referee."
    },
    {
      id: "refree rejection when accepted by worko",
      question: "Why did the referee reject my profile when Worko approved it?",
      answer: [
        "Referee decisions are independent and subjective.",
        "Worko assesses profiles based on specific criteria, but referees may have additional considerations aligned with their team’s needs.",
        "Approval from Worko does not guarantee acceptance by a referee.",
        "Consider alternative job opportunities more closely aligned with your profile."
      ]
    },
    {
      id: "talk before requesting",
      question: "Can I talk to any of the referees before making a request?",
      answer: [
        "Currently, direct communication with referees before making a request is not possible.",
        "You can initiate a chat with the referee once your referral request is accepted.",
        "For specific queries, contact our support team."
      ]
    },
    {
      id: "worko_services",
      question: "What are different services available on Worko & how can I avail them?",
      answer: [
        "Worko provides various services such as:",
        "Job referrals",
        "Career guidance",
        "Interview handholding",
        "Mock interviews",
        "Resume review & writing",
        "To avail these services, create a profile, navigate to the service section, and follow the prompts."
      ]
    },
    {
      id: "imporve_scores",
      question: "If my matching score is low, how can I improve it?",
      answer: [
        "Update your profile with detailed information about your skills, experiences, and achievements.",
        "Stay active on the platform, explore relevant job opportunities, and seek feedback from our support team."
      ]
    },
    {
      id: "Reapply For referral",
      question: "Can I request a referral if I've already applied for a role?",
      answer: [
        "Yes! Even if you've already applied, you can still request a referral through Worko.",
        "Worko connects you with referees who can advocate for your application.",
        "Submit a referral request for the specific job, and we’ll take it from there."
      ]
    }
  ];
  

  
  export const faqDataEmp: FAQItem[] = [
    {
      id: "privacy-policy",
      question: "How does privacy work?",
      answer: "We do not share your data with anyone externally. Your information is not shared with candidates you decline."
    },
    {
      id: "official-email-requirement",
      question: "Why did we collect your official mail ID?",
      answer: "To authorise your role as a Referee for the company you are joining, we utilise your work email. This is a one-time process, and we do not use your work email for any communication."
    },
    {
      id: "referral-obligation",
      question: "Do I have to refer everyone?",
      answer: "Worko utilises a powerful AI algorithm to assess candidates, assigning a matching score for quick and informed referral decisions. Please only refer individuals whom you genuinely believe would be well-suited for the role."
    },
    {
      id: "referee-benefits",
      question: "What other benefits do I get as a Referee?",
      answer: [
        "Make the most of the rewards offered for Employee Referrals within your organisation.",
        "Earn reward points or coupons by introducing individuals from your network to Worko as Referees. (T&C apply)",
        "As a Referee, you are not subject to any charges when you seek referrals through Worko."
      ]
    },
    {
      id: "who-can-be-referee",
      question: "Who can be a Referee?",
      answer: "At Worko, we value industry expertise and believe in connecting job seekers with experienced professionals who can make well-informed decisions. Our platform exclusively onboards employees with 2+ years of overall experience."
    },
    {
      id: "payment-for-services",
      question: "How will I get paid for Career Guidance, Mock Interviews, or Interview Consultation?",
      answer: "If a candidate opts for any of these services, you will receive the pre-decided consulting fee after successful completion."
    },
    {
      id: "expertise-offered",
      question: "What services/expertise can I offer through Worko & how will I get paid?",
      answer: "On Worko, you can provide services such as resume writing, career guidance, interview handholding, and mock interviews. Set your own professional fee and get paid post-completion."
    },
    {
      id: "unpublished-jobs",
      question: "I have some unpublished jobs in my company. How can I notify Worko to find a good referral?",
      answer: "We are launching this feature soon to help you find the best referral for internal openings. Until then, please write to us at findreferral@worko.ai, and we will assist you."
    },
    {
      id: "no-referral-policy",
      question: "My company doesn't have a referral policy. How can I benefit by referring candidates?",
      answer: "Collaborate on a referral strategy for mutual benefits! Connect us with your HR head, and we'll offer benefits for candidate referrals while rewarding you when your company joins us. Additionally, create a profile, share your expertise, help others, and earn extra income."
    }
  ];
  