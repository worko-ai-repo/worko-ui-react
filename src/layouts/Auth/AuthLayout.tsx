import Header from '@Components/Header/Header';
import { Outlet } from 'react-router-dom';
import styles from '../layout.module.scss';
import ErrorBoundary from '../../error-boundary/ErrorBoundary';
/**
 * @function Layout
 *
 * @description A layout component for nested routes
 *
 * @returns {JSX.Element} The JSX code for the Layout component
 */
function AuthLayout({ headerIncluded = true }: { headerIncluded?: boolean }): JSX.Element {
	return (
		<div id="Authlayout" className=" relative bg-gradient-to-t from-blue-700 via-blue-500 to-slate-50 ">
			{headerIncluded && <Header />}
			<main className={`flex items-center ${styles.main}`} id="main_container">
				<Outlet />
			</main>
		</div>
	);
}

export default AuthLayout;
