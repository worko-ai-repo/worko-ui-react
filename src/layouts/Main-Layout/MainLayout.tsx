import { Outlet } from 'react-router-dom';
import styles from '../layout.module.scss';

import Header from '@Components/Header/Header';
import Footer from '@Components/Footer/Footer';
import SmoothScroll from '@Views/scroll/SmoothScroll';
import ScrollToTop from '@Utils/ScrollToTop.utils';

/**
 * @function MainLayout
 *
 * @description A MainLayout component for nested routes
 *
 * @returns {JSX.Element} The JSX code for the MainLayout component
 */
function MainLayout(): JSX.Element {
	return (
		<div id="MainLayout" className="bg-white">
			<Header />
			<SmoothScroll>
				<ScrollToTop />
				<main className={styles.main} id="main_container">
					<Outlet />
				</main>
			</SmoothScroll>
			<Footer />
		</div>
	);
}

export default MainLayout;
