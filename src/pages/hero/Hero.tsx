import { useNavigate, useSearchParams } from 'react-router-dom';
import Loader from '@Components/Loader/Loader';
import HeroIntro from '@Components/Hero/HeroIntro';
import CompaniesList from '@Components/Hero/CompaniesList';
import { useEffect } from 'react';
import PromoCard from '@Components/Hero/PromoCard';
import { worko_new } from '@Assets';
import ProductHighlight from '@Components/Hero/ProductHighlight';
import Testimonials from '@Components/Hero/Testimonials';
import HeroOutro from '@Components/Hero/HeroOutro';

const Hero = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const token = searchParams.get('token'); // This will always resolve, so it's safe.

	useEffect(() => {
		const layout = document.getElementById('MainLayout');
		if (layout) {
			layout.style.backgroundColor = '#4B7EFF'; // Set blue background for the Hero page
		}

		return () => {
			// Reset the background color when leaving the Hero page
			if (layout) {
				layout.style.backgroundColor = ''; // Or set it to a default color like '#FFFFFF'
			}
		};
	}, []);

	const isVerified = true; // Use the hook to validate the token

	if (isVerified === null) {
		// Show loader while token verification is in progress
		return <Loader />;
	}

	if (!isVerified) {
		return null; // Nothing will render as the navigation is handled in the hook
	}

	return (
		<div className="w-full bg-transparent ">
			<HeroIntro />
			<CompaniesList />
			<PromoCard />
			<div className=" lg:max-w-[1120px] bg-transparent border-0 text-2xl w-3/4 mx-auto m-10 p-5 sm:text-3xl md:text-4xl relative text-wrap font-extrabold text-white">
				Revolutionizing Your Job Hunt – Referrals, Guidance, and Career Success Simplified!
				<img src={worko_new} className="absolute top-[-12px] left-[-40px] -rotate-45" alt="worko_new" />
			</div>
			<ProductHighlight />
			<Testimonials />
			<HeroOutro />
		</div>
	);
};

export default Hero;
