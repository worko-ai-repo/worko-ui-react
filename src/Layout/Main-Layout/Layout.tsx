import Header from '@Components/Header/Header';
import Footer from '@Components/Footer/Footer';
import { Outlet } from 'react-router-dom';
import styles from './layout.module.scss';
/**
 * @function Layout
 *
 * @description A layout component for nested routes
 *
 * @returns {JSX.Element} The JSX code for the Layout component
 */
function Layout(): JSX.Element {
	return (
		<div id="layout" className='bg-white'>
			<Header />
                <main className={styles.main} id='main_container'>
                    <Outlet />
                </main>
			<Footer />
		</div>
	);
}

export default Layout;
