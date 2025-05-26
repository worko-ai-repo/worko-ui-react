import { Instagram, Linkedin, X, Youtube } from 'lucide-react';
import styles from './footer.module.scss';
import { logo_text_bright } from '@Assets';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
	const NavTo = useNavigate()
	return (
		<div>
			{/* Footer */}
			<footer className="bg-[#161616] rounded-t-[2.5rem]  text-white py-16">
				<div className="max-w-6xl mx-auto px-6">
					<div className="grid grid-cols-[repeat(auto-fit,_minmax(250px,_1fr))] gap-8">
						<div className="footer_content one text-left flex flex-col gap-4 w-min ">
							<button onClick={()=>{NavTo('/')}} className="w-[130px]">
								<img src={logo_text_bright} alt="Worko Logo" className="w-[130px] h-auto p-0 mt-0" />
							</button>

							<div className={styles.label_and_buttons}>
								<p className="text-white-400 mb-1 w-56">Explore Endless Career Opportunities</p>
								<button onClick={()=>{NavTo('/jobs')}} className="btn_find_job mb-4 w-3/4">Find Job</button>
							</div>

							<div className={styles.label_and_buttons}>
								<p className="mb-0">Discover Top Talent For Your Team</p>
								<button onClick={()=>{NavTo('/corporate')}} className="btn_hire_talent mt-0">Hire Candidate</button>
							</div>

							<div className="flex space-x-8 mt-4">
								<i className="fa-brands fa-xl hover:text-gray-600 cursor-pointer  fa-x-twitter"
									onClick={() => window.open('https://x.com/WorkoAI', '_blank')}
								></i>
								<i 
									className="fa-brands fa-xl hover:text-gray-600 cursor-pointer fa-instagram" 
									onClick={() => window.open('https://www.instagram.com/worko_ai?igsh=em8wZ28xbG4xZWZy&utm_source=qr', '_blank')}
								></i>
								<i className="fa-brands fa-xl hover:text-gray-600 cursor-pointer  fa-linkedin"
									onClick={() => window.open('https://www.linkedin.com/company/worko/', '_blank')}
								></i>
							</div>
						</div>
						{/* flex justify-evenly flex-wrap justify-item-start gap-5 text-left */}
						<div className="footer_content tw text-left grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							<div>
								<h3 className="font-semibold mb-4">For Companies</h3>
								<ul className={'space-y-2  text-gray-400 ' + styles.footer_list}>
									<li onClick={()=>{NavTo('/corporate')}}>Hire Talent</li>
									{/* <li onClick={() => NavTo('/corporate#corporate-communication')} >AI Resume Screening</li>						 */}
									<li onClick={()=>{NavTo('/corporate#corporatePlans')}}>Pricing</li>
								</ul>
							</div>
							<div>
								<h3 className="font-semibold mb-4">For Candidates</h3>
								<ul className={'space-y-2  text-gray-400 ' + styles.footer_list} >
									<li onClick={()=>{NavTo('/jobs')}}>Browse jobs & Apply via AI</li>
									<li onClick={()=>{NavTo('/referrals')}}>Request a referral</li>
									<li onClick={()=>{NavTo('/guidance')}}>Request interview guidance</li>
								</ul>
							</div>
							<div className="grow ">
							<ul className={'space-y-2 text-gray-400 ' + styles.footer_list}>
									<li onClick={()=>{NavTo('/about')}}>Our story</li>
									<li onClick={()=>{NavTo('/contact-us')}}>Contact us</li>
									<li onClick={()=>{NavTo('/privacy-policy')}}>Privacy policy</li>
									<li onClick={()=>{NavTo('/terms')}}>Terms of use</li>
									<li onClick={()=>{NavTo('/faq')}}>FAQ</li>  
								</ul>
							</div>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
};

export default Footer;
