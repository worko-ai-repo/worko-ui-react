import { ph1, ph2, ph3, ph4, student, student1 } from '@Assets';
export const dorpDown = {
	one: [
		{ title:"No more spray-and-pray job hunting ", description: 'See and apply for genuinely-fit roles with our matchmaking engine that only shows opportunities you’re truly interested in.', image: ph1 },
		{ title: 'Tap into company referrals', description: "Get direct referrals from verified employees who work at your dream companies and will boost you to the top of the pile.", image: ph2 },
		{ title: "Get personalized career guidance", description: "Get battle-tested tips every step of the way from people who have already won those challenges. You’ll get the edge you need.", image: ph3 },
		{ title: "Refer others and earn", description: "Know talented people companies can benefit from? Refer them to our platform and earn exclusive bonuses, rewards, and perks.", image: ph4 },
	],
	two: [
		{ title: "Access top talent fast", description: 'With Worko, you can connect with vetted, top-notch candidates that match your company’s needs. It will make your next hire easier than ever. ', image: ph1 },
		{ title: "Guide job seekers ", description: "Help other job seekers grow and become part of their success. Whether it’s through personalized mentorship or interview prep, you can create an impact where it matters.", image: ph2 },
		{ title: "Get actionable job search support", description: "Looking to change your job? Want guidance on getting a promotion? Confidently take your next steps with our actionable support personalized only for you. ", image: ph3 },
		{ title: "Refer candidates and earn", description: "Your referrals have real value. As an employee, recommend top talent for open roles within your company and earn rewards for all your efforts. ", image: ph4 },
	],
};

export const testimonials = [
	{
		id: 1,
		items: [
			{ icon: student1, student_name: 'Amit', student_comp: 'AMAZON', content: "I appreciated the transparency and effort at Worko. Previously, I was referred to a few jobs but didn't receive any calls. Later on, with the help of the Worko team, I was able to find the right set of jobs for me. Their support throughout the process landed me quite a few good interviews and, eventually, a job." },
			{ icon: student1, student_name: 'Neha', student_comp: 'AMAZON', content: 'Worko not only helped me secure referrals at my dream companies but also provided invaluable support during the interview process. The Interview Handholding service from a senior employee was immensely helpful and aided me greatly in my preparation' },
			{ icon: student1, student_name: 'Raj', student_comp: 'AMAZON', content:"Worko's Peer 2 Peer hiring approach is truly revolutionary. Unlike other platforms, they never bombard me with random CVs. Instead, I find top-tier candidates perfectly matched to our requirements. Not only have I earned a significant referral bonus, but my HR team is also thrilled with the quality of candidates" },
			
			
		],
	},
	{
		id: 2,
		items: [
			{ icon: student1, student_name: 'Amit', student_comp: 'AMAZON', content: "I appreciated the transparency and effort at Worko. Previously, I was referred to a few jobs but didn't receive any calls. Later on, with the help of the Worko team, I was able to find the right set of jobs for me. Their support throughout the process landed me quite a few good interviews and, eventually, a job." },
			{ icon: student1, student_name: 'Neha', student_comp: 'AMAZON', content: 'Worko not only helped me secure referrals at my dream companies but also provided invaluable support during the interview process. The Interview Handholding service from a senior employee was immensely helpful and aided me greatly in my preparation' },
			{ icon: student1, student_name: 'Raj', student_comp: 'AMAZON', content:"Worko's Peer 2 Peer hiring approach is truly revolutionary. Unlike other platforms, they never bombard me with random CVs. Instead, I find top-tier candidates perfectly matched to our requirements. Not only have I earned a significant referral bonus, but my HR team is also thrilled with the quality of candidates" },
		],
	},
];

export const EmployeeTestimonials = [
	{	id:1,
		items: [
			{ icon: student, student_name: 'Aditya Raj', student_comp: 'Flipkart', content: "Worko not only helped me secure referrals at my dream companies but also provided invaluable support during the interview process. The Interview Handholding service from a senior employee was immensely helpful and aided me greatly in my preparation" },
			{ icon: student, student_name: 'Aditya Raj', student_comp: 'Flipkart', content: 'Worko not only helped me secure referrals at my dream companies but also provided invaluable support during the interview process. The Interview Handholding service from a senior employee was immensely helpful and aided me greatly in my preparation' },
			{ icon: student, student_name: 'Aditya Raj', student_comp: 'Flipkart', content:"Worko not only helped me secure referrals at my dream companies but also provided invaluable support during the interview process. The Interview Handholding service from a senior employee was immensely helpful and aided me greatly in my preparation" },
		],
		
	},
	{
		id: 2,
		items: [
			{ icon: student, student_name: 'Vikas', student_comp: 'AMAZON', content: 'Product 6 is amazing!' },
			{ icon: student, student_name: 'Rohan', student_comp: 'AMAZON', content: 'Product 7 changed my life!' },
			{ icon: student, student_name: 'Tina', student_comp: 'AMAZON', content: 'Product 8 is the best!' },
		],
	},
]
