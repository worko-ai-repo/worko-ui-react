import { useEffect } from 'react';
import { worko_new } from '@Assets';

import { lazy, Suspense } from 'react';
import MainLoader from '@Components/Loader/Loader';
import Reveal from '@Views/intersection-observer/IntersectionObs';
import { testimonials } from '@Components/Hero/data';

const HeroIntro = lazy(() => import('@Components/Hero/HeroIntro'));
const CompaniesList = lazy(() => import('@Components/Hero/CompaniesList'));
const PromoCard = lazy(() => import('@Components/Hero/PromoCard'));
const Testimonials = lazy(() => import('@Components/Hero/Testimonials'));
const ProductHighlight = lazy(() => import('@Components/Hero/ProductHighlight'));
const HeroOutro = lazy(() => import('@Components/Hero/HeroOutro'));
const Hero = () => {
	/**
	 * This useEffect hook will run when the component mounts and will set the background color of the layout to blue.
	 */
/* 	useEffect(() => {
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
	}, []); */

	return (
		<div className="w-full bg-transparent " id="locoScrollMainContainer">
			<Suspense fallback={<MainLoader />}>
				<HeroIntro />
				<CompaniesList />
				<PromoCard />
				{/* This section will always be rendered */}
				<h2 className="lg:max-w-[1120px] bg-transparent border-0 text-2xl w-3/4 mx-auto m-10 p-2 sm:text-3xl md:text-4xl relative text-wrap font-extrabold text-white">
					<Reveal CName="slide_up" threshold={0.5}>
						<img src={worko_new} className=" w-20 inline mr-2" alt="worko_new" />
						 <span>tells you exactly what worked, what didn’t, and how you can secure that coveted role.</span>
					</Reveal>
				</h2>
				<ProductHighlight />
				<Testimonials heading='TESTIMONIALS' title={`Don’t take our word for it. See what job seekers are saying about ${worko_new}`} titleImage={worko_new} testimonials={testimonials} badgeIcon='fa-md fa-solid fa-box-open' />
				<HeroOutro />
			</Suspense>
		</div>
	);
};

export default Hero;
