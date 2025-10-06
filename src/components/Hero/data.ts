import {
  mini_Frame_3,
  mini_Frame_4,
  mini_Frame_5,
  mini_Frame_6,
  ph1,
  ph2,
  ph3,
  ph4,
  ss_guidance,
  ss_job,
  ss_ref,
  student,
  student1,
  cloudUpload,
	dash_lines,
	Referral,
	lightning_white,
	Job,
	Home,
	time_white,
	filter_white,
	Support,
	Bulk_CV,
	film,
} from "@Assets";
export const dorpDown = {
  one: [
    {
      title: "No more spray-and-pray job hunting ",
      description:
        "See and apply for genuinely-fit roles with our matchmaking engine that only shows opportunities you’re truly interested in.",
      image: ph1,
      bigimg: ss_job,
    },
    {
      title: "Tap into company referrals",
      description:
        "Get direct referrals from verified employees who work at your dream companies and will boost you to the top of the pile.",
      image: ph2,
      bigimg: ss_ref,
    },
    {
      title: "Get personalized career guidance",
      description:
        "Get battle-tested tips every step of the way from people who have already won those challenges. You’ll get the edge you need.",
      image: ph3,
      bigimg: ss_guidance,
    },
    {
      title: "Refer others and earn",
      description:
        "Know talented people companies can benefit from? Refer them to our platform and earn exclusive bonuses, rewards, and perks.",
      image: ph4,
      bigimg: mini_Frame_5,
    },
  ],
  two: [
    {
      title: "Access top talent fast",
      description:
        "With Worko, you can connect with vetted, top-notch candidates that match your company’s needs. It will make your next hire easier than ever. ",
      image: ph1,
      bigimg: mini_Frame_6,
    },
    {
      title: "Guide job seekers ",
      description:
        "Help other job seekers grow and become part of their success. Whether it’s through personalized mentorship or interview prep, you can create an impact where it matters.",
      image: ph2,
      bigimg: mini_Frame_3,
    },
    {
      title: "Get actionable job search support",
      description:
        "Looking to change your job? Want guidance on getting a promotion? Confidently take your next steps with our actionable support personalized only for you. ",
      image: ph3,
      bigimg: mini_Frame_4,
    },
    {
      title: "Refer candidates and earn",
      description:
        "Your referrals have real value. As an employee, recommend top talent for open roles within your company and earn rewards for all your efforts. ",
      image: ph4,
      bigimg: mini_Frame_5,
    },
  ],
};

export const testimonials = [
  {
    id: 1,
    items: [
      {
        icon: student1,
        student_name: "Amit",
        student_comp: "AMAZON",
        content:
          "I really valued the transparency and dedication of the Worko team. Before, I struggled to get traction in my job search, but Worko changed that. They guided me to opportunities that matched my skills and experience, providing support every step of the way. Thanks to their efforts, I landed several strong interviews and ultimately secured a great job.",
      },
      {
        icon: student1,
        student_name: "Neha",
        student_comp: "Rapido",
        content:
          "Worko not only helped me secure referrals at my dream companies but also provided invaluable support during the interview process. The Interview Handholding service from a senior employee was immensely helpful and aided me greatly in my preparation",
      },
      {
        icon: student1,
        student_name: "Raj",
        student_comp: "Phonepe",
        content:
          "Worko turned my job search around completely. Their referral system opened doors to companies I'd only dreamed of working for, and their interview prep was spot on tailored advice that helped me nail tough questions. With their guidance, I went from no callbacks to securing a fantastic position in phonepe.",
      },
    ],
  },
  {
    id: 2,
    items: [
      {
        icon: student1,
        student_name: "Rahul",
        student_comp: "SWIGGY",
        content:
          "Worko is awesome. My buddy referred me, and I found jobs that fit me right away. They helped me practice for interviews, so I wasn't nervous. I landed a job I really like because of them.",
      },
      {
        icon: student1,
        student_name: "Rohan",
        student_comp: "NU REPUBLIC",
        content:
          "Worko made my job search a breeze. Their team took the time to understand my skills and career goals, connecting me with opportunities I wouldn't have found on my own. With their support, I landed a role that's a perfect fit for me—hands down the best job-hunting experience I've had",
      },
      {
        icon: student1,
        student_name: "Ajay",
        student_comp: "GOOGLE",
        content:
          "Worko's interview guidance was a total game-changer for me. They didn't just find me job openings—they coached me through the entire interview process, from prep to follow-up. Their tips gave me the confidence I needed, and I landed my dream job after acing the interviews they set up!",
      },
    ],
  },
];

export const EmployeeTestimonials = [
  {
    id: 1,
    items: [
      {
        icon: student,
        student_name: "Aditya Raj",
        student_comp: "Flipkart",
        content:
          "Worko's platform makes referring others a breeze. I can trust that the jobs I recommend are a perfect fit for my contacts, and they always thank me for pointing them to such solid opportunities.",
      },
      {
        icon: student,
        student_name: "Rishav",
        student_comp: "Amazon",
        content:
          "Referring someone through Worko took me less than five minutes. The platform is so user-friendly, and I was thrilled when my referral landed the job and I got a bonus!",
      },
      {
        icon: student,
        student_name: "Aditi",
        student_comp: "Makemytrip",
        content:
          "As an employee, I use Worko to refer talent to my company. My HR team loves the high-quality hires, and I love the extra cash I get for helping out!",
      },
    ],
  },
  {
    id: 2,
    items: [
      {
        icon: student,
        student_name: "Vikas",
        student_comp: "Google",
        content:
          "Worko makes me the go-to person in my network for job connections. I've referred several friends to roles that fit them perfectly, and the gratitude plus the bonuses—keeps me coming back!",
      },
      {
        icon: student,
        student_name: "Rohan",
        student_comp: "Swiggy",
        content:
          "Using Worko to refer people has boosted my reputation in my circle. Everyone knows I'm the one who connects them to great jobs, and the referral bonuses are a sweet perk on top",
      },
      {
        icon: student,
        student_name: "Tina",
        student_comp: "Accenture",
        content:
          "I've referred a handful of people through Worko, and every time, the results are spot-on. They get hired quickly, my company gets talent, and I get a payout—it's a reliable system I can count on!",
      },
    ],
  },
];
export const floatingStats = [
  {
    text: "Earn by Referring",
    subText: "Cash rewards when your friend gets hired.",
    position: "top-[7rem] left-[6rem]",
    icon: Referral,
  },
  {
    text: "Insider Guidance",
    subText: "Get tips from employees inside the company — know what interviews are really like.",
    position: "top-[10rem] left-[13rem]",
    icon: Support,
  },
  {
    text: "5000+ Active Jobs",
    subText: "Real jobs, real interviews, real offers.",
    position: "top-[14rem] left-[6rem]",
    icon: Job,
  },
  {
    text: "One Interview, Many Opportunities",
    subText: "Record once, Get expert feedback & multiply your chances of selection.",
    position: "top-[17rem] left-[13rem]",
    icon: film,
  },
  {
    text: "300+ Companies+",
    subText: "Only active, vetted companies.",
    position: "top-[7rem] right-[6rem]",
    icon: Home,
  },
  {
    text: "Know Where You Stand",
    subText: "Live updates on every application.",
    position: "top-[10rem] right-[13rem]",
    icon: time_white,
  },
  {
    text: "Right Jobs, Right Now",
    subText: "Stop guessing, start matching.",
    position: "top-[14rem] right-[6rem]",
    icon: Bulk_CV,
  },
  {
	text: "Real‑Time Alerts",
    subText: "Real-time status + feedback on every application. No more silence.",
    position: "top-[17rem] right-[13rem]",
    icon: lightning_white,
  },
];
