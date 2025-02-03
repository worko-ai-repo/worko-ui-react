import styles from './company.module.scss';
import { CompanyPageModeEnum } from '@Interfaces/CompanyContext.dto';
import { useCompanyContext } from '../../context/CompanyContext';

const companyStaticData = {
	[CompanyPageModeEnum.JOB]: {
		title: 'Create a profile and get hired instantly!',
		description: 'Job hunting could be nerve-wracking, but not anymore with Worko.Here, you’ll find hundreds of roles, and you can apply for the relevant ones. We’ll personally review your application and give you actionable feedback on what you can do to maximize your chances of reaching and passing the interview.',
	},
	[CompanyPageModeEnum.REFERRAL]: {
		title: 'Get referred to over <span class="font-bold px-3 py-1 bg-[#57E1E1] rounded-lg">1000+</span> companies',
		description: 'With our referral system, your dream job is closer than you think. Submit the application for the role you want to apply for. We’ll connect you with a referee (working in the same company) who’ll personally refer you. Plus, you can also get insider coaching to nail that interview and more.',
	},
};

const CompanyBanner = () => {
	const { companyPageMode } = useCompanyContext();
	const currentData = companyStaticData[companyPageMode] || {};

	return (
		<div className="px-5 py-10 sm:px-auto relative w-full min-h-[200px] bg-blue-600 text-white flex ">
			<div className="mx-auto max-w-[1280px] md:p-4 flex items-center gap-10 justify-center w-full ">
				<div className={'min-w-[300px] max-w-[600px] mx-auto md:mx-0 text-wrap p-2 text-justify  ' + styles.banner_content}>
					<p className="w-full text-xl sm:text-2xl font-bold mb-2" dangerouslySetInnerHTML={{ __html: currentData.title }}></p>

					<small className="text-[10px] sm:text-xs" dangerouslySetInnerHTML={{ __html: currentData.description }}></small>
				</div>
				{/* EmailCard */}
				<div className="emailCard hidden md:block w-full md:max-w-[400px]  ">
					<div className="px-4 py-4 mx-auto min-h-36 max-w-80 subCard rounded-2xl bg-white text-black p-2 flex flex-col items-start justify-center gap-3">
						<div className="text-xs text-left">
							<p className="font-bold">📨 Email me for jobs</p>
							<small className="text-gray-500 pl-1">Enter Your Email And Get Notified For New Jobs</small>
						</div>
						<input type="text" className="w-full bg-transparent px-4 py-2.5 rounded-xl border-[1px] border-gray-400 outline-none text-xs font-bold" placeholder="name@gmail.com" />
						<button className="btn_secondary mx-auto">Subscribe</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CompanyBanner;
