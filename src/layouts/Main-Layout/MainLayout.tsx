import Header from '@Components/Header/Header';
import Footer from '@Components/Footer/Footer';
import { Outlet } from 'react-router-dom';
import styles from '../layout.module.scss';
/**
 * @function MainLayout
 *
 * @description A MainLayout component for nested routes
 *
 * @returns {JSX.Element} The JSX code for the MainLayout component
 */
function MainLayout(): JSX.Element {
	return (
		<div id="MainLayout" className='bg-white'>
			<Header />
                <main className={styles.main} id='main_container'>
                    <Outlet />
                </main>
			<Footer />
		</div>
	);
}

export default MainLayout;
