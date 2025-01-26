import { Instagram, Linkedin, X, Youtube } from 'lucide-react';
import styles from './footer.module.scss';
import { logo_text_bright } from '@Assets';

const Footer = () => {
	return (
		<div>
			{/* Footer */}
			<footer className="bg-[#161616] rounded-t-[2.5rem]  text-white py-16">
				<div className="max-w-6xl mx-auto px-6">
					<div className="grid grid-cols-[repeat(auto-fit,_minmax(250px,_1fr))] gap-8">
						<div className="footer_content one text-left flex flex-col gap-4 w-min ">
							<img src={logo_text_bright} alt="Worko Logo" className="w-[130px] h-auto p-0 mt-0" />

							<div className={styles.label_and_buttons}>
								<p className="text-white-400 mb-1 w-56">Explore Endless Career Opportunities</p>
								<button className="btn_find_job mb-4 w-3/4">Find Job</button>
							</div>

							<div className={styles.label_and_buttons}>
								<p className="mb-0">Discover Top Talent For Your Team</p>
								<button className="btn_hire_talent mt-0">Hire Candidate</button>
							</div>

							<div className="flex space-x-8 mt-4">
								<i className="fa-brands fa-xl hover:text-gray-600 cursor-pointer  fa-x-twitter"></i>
								<i className="fa-brands fa-xl hover:text-gray-600 cursor-pointer  fa-instagram"></i>
								<i className="fa-brands fa-xl hover:text-gray-600 cursor-pointer  fa-linkedin"></i>
								<i className="fa-brands fa-xl hover:text-gray-600 cursor-pointer  fa-youtube"></i>
							</div>
						</div>
						{/* flex justify-evenly flex-wrap justify-item-start gap-5 text-left */}
						<div className="footer_content tw text-left grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							<div>
								<h3 className="font-semibold mb-4">For Companies</h3>
								<ul className={'space-y-2  text-gray-400 ' + styles.footer_list}>
									<li>Hire Talent</li>
									<li>AI Resume Screening</li>
									<li>Find Candidates</li>
									<li>Pricing</li>
								</ul>
							</div>
							<div>
								<h3 className="font-semibold mb-4">For Candidates</h3>
								<ul className={'space-y-2  text-gray-400 ' + styles.footer_list} >
									<li>Browse Jobs</li>
									<li>Resume Builder</li>
									<li>Career Resources</li>
									<li>Refer & Earn</li>
								</ul>
							</div>
							<div className="grow ">
							<ul className={'space-y-2 text-gray-400 ' + styles.footer_list}>
									<li>Our story</li>
									<li>Contact us</li>
									<li>Privacy policy</li>
									<li>Terms of use</li> 
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
