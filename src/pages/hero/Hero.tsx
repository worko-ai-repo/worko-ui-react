import { useEffect } from 'react';
import { CTA_Banner, worko_new } from '@Assets';

import { lazy, Suspense } from 'react';
import MainLoader from '@Components/Loader/Loader';
import Reveal from '@Views/intersection-observer/IntersectionObs';
import { testimonials } from '@Components/Hero/data';
import NewHeroIntro from '@Components/Hero/NewHeroIntro';

const HeroIntro = lazy(() => import('@Components/Hero/HeroIntro'));
const CompaniesList = lazy(() => import('@Components/Hero/CompaniesList'));
const PromoCard = lazy(() => import('@Components/Hero/PromoCard'));
const NewTestimonials = lazy(() => import('@Components/Hero/NewTestimonials'));
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
				<NewHeroIntro />
				<CompaniesList />
				{/* <PromoCard /> */}
				{/* This section will always be rendered */}
				{/* <h2 className="lg:max-w-[1120px] bg-transparent border-0 text-2xl w-3/4 mx-auto m-10 p-2 sm:text-3xl md:text-4xl relative text-wrap font-extrabold text-white">
					<Reveal CName="slide_up" threshold={0.5}>
						<img src={worko_new} className=" w-20 inline mr-2" alt="worko_new" />
						 <span>tells you exactly what worked, what didn’t, and how you can secure that coveted role.</span>
					</Reveal>
				</h2> */}
				<ProductHighlight />
				<HeroOutro />
				<NewTestimonials  title={`Don’t take our word for it. See what job seekers are saying about ${worko_new}`} titleImage={worko_new} testimonials={testimonials}  className="bg-white p-1" badgeIcon='fa-md fa-solid fa-box-open' />
			</Suspense>
		</div>
	);
};

export default Hero;
