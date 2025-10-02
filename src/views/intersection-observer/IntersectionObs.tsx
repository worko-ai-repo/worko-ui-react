import React, { useEffect, useRef, useState } from 'react';
import './intersectionObs.scss';

type AnimationType = 'fade' | 'cascade' | 'slide_up' | 'scale_up' | 'pulse_scale'; // Extendable list
type SubClassAnimation = 'fade' | 'slide' | 'zoom' | 'rotate'; // Extendable list

interface RevealProps {
	children: React.ReactNode;
	needLazyLoad?: boolean; // Toggle Lazy Loading (remove from DOM)
	needAnimation?: boolean; // Toggle Animation
	IsDual?: boolean; // Enable secondary animation
	CName: AnimationType; // Primary animation class
	SubCName?: SubClassAnimation; // Optional secondary animation
	threshold?: number; // IntersectionObserver threshold
	PCName?: string; // Optional PCName
}

const Reveal: React.FC<RevealProps> = ({ children, needLazyLoad = false, needAnimation = true, IsDual, CName, SubCName, threshold = 0.1 ,PCName = 'fit'}) => {
	const [isVisible, setIsVisible] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	/**
	 * This useEffect hook will run when the component mounts and will create an IntersectionObserver
	 * to observe the target element. When the element is visible, the state will be updated to true.
	 */
	useEffect(() => {
		const observer = new IntersectionObserver(
			// The callback function takes an array of entries that intersect with the root element (in this case, the viewport).
			([entry]) => {
				// Loop through the entries and check if the target element is visible.
				// console.log('Observed:', entry.isIntersecting); // Debug log
				if (entry.isIntersecting) {
					setIsVisible(true); // Update the state to true when visible
					observer.unobserve(entry.target); // Stop observing once visible
				}
			},
			{ threshold } // Set the threshold to 20% visibility
		);

		if (ref.current) observer.observe(ref.current);

		return () => observer.disconnect();
	}, [threshold]);

	// If lazy loading is enabled, render an empty div until it's visible
	if (needLazyLoad && !isVisible) return <div ref={ref} style={{ height: 0, width: '100%' }} />;

	/**
	 * The component will render a div with a ref that will be observed by the IntersectionObserver. And it will add custom class animation to the children.
	 */

	return (
		<div
			ref={ref}
			className={`reveal-container ${PCName} `}
			style={{
				opacity: isVisible ? 1 : 0,
				transition: needAnimation ? 'opacity 0.5s ease-in-out' : 'none',
			}}>
			<div className={`animate ${CName} ${isVisible ? 'visibleCname' : 'opacity-0'}`}>{children}</div>
			{IsDual && SubCName && <div className={`sub-animate ${SubCName} ${isVisible ? 'visibleCname' : 'opacity-0'}`} />}
		</div>
	);
};

export default Reveal;
