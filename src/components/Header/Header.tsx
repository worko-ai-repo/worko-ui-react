import { useEffect, useState, useRef } from 'react';
import { Menu, X, ChevronDown, LogOut, User } from 'lucide-react';
import { coin, logo_text } from '@Assets';
import styles from './header.module.scss';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@Context/App.context';
import CognitoServiceObj from '@Utils/Cognito.utils';
import { AuthLoginForGeneralUserDto } from '@Interfaces/Auth.dto';

interface NavItem {
	label: string;
	href: string;
	subItems?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
	{
		label: 'For Candidate',
		href: '',
		subItems: [
			{ label: 'Job Portal', href: '/jobs' },
			{ label: 'Request Referral', href: '/referrals' },
		],
	},
	{ label: 'For Employee', href: '/for-employee' },
	{ label: 'For Corporate', href: '/for-corporate' },
	{ label: 'Blog', href: '/blogs' },
	{ label: 'About Us', href: '/about' },
];

const Header = () => {
	
	const navigateTo = useNavigate();
	const { isLoggedIn, userDetails, setUpdateCheck } = useAppContext() as { isLoggedIn: boolean; userDetails: Partial<AuthLoginForGeneralUserDto>; setUpdateCheck: React.Dispatch<React.SetStateAction<boolean>> };
	const [isOpen, setIsOpen] = useState(false);
	const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
	const headerRef = useRef<HTMLElement>(null);

	const toggleDropdown = (label: string) => {
		setActiveDropdown(activeDropdown === label ? null : label);
	};

	useEffect(() => {
		console.info('isLoginChanged');
	}, [isLoggedIn]);

	// Effect to handle click outside of header to close mobile menu
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (isOpen && headerRef.current && !headerRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		// Add event listener when the mobile menu is open
		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		// Clean up the event listener when component unmounts or menu closes
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen]);

	return (
		<header className={styles.header} ref={headerRef}>
			<div className={styles.container}>
				{/* Logo */}
				<div className={`cursor-pointer ${styles.logo}`} onClick={() =>{ navigateTo('/'); setUpdateCheck(true);}}>
					<img src={logo_text} alt="Logo" />
				</div>

				{/* Desktop Navigation */}
				<nav className={`${styles.nav} ${styles.desktop}`}>
					<ul className={styles.navList}>
						{navItems.map(item => (
							<li key={item.label} className={styles.navItem} onMouseEnter={() => setActiveDropdown(item.label)} onMouseLeave={() => setActiveDropdown(null)}>
								<a href={item.href} className={styles.navLink}>
									{item.label}
									{item.subItems && <ChevronDown className={styles.chevron} />}
								</a>
								{item.subItems && activeDropdown === item.label && (
									<div className={styles.dropdown}>
										{item.subItems.map(subItem => (
											<a key={subItem.label} href={subItem.href} className={styles.dropdownItem}>
												{subItem.label}
											</a>
										))}
									</div>
								)}
							</li>
						))}
					</ul>
				</nav>

				<div className={`min-w-fit ${styles.loggedInMenu} ${styles.desktop}`}>
					{isLoggedIn ? (
						<div className="group relative">
							<div className="flex items-center justify-start gap-4 cursor-pointer px-4 py-2 rounded-lg max-h-[55px] group-hover:bg-[#79bff848]">
								<div className={styles.userDetails} onClick={() => navigateTo('/profile')}>
									{userDetails?.profileImageAwsS3SignedUrl ? <img className="border-[1px] border-gray-400 p-0.2 w-[35px] h-[35px] object-cover rounded-full" src={userDetails?.profileImageAwsS3SignedUrl} /> : <User className="text-gray-400 border-[1px] border-gray-400 p-0.2 w-[35px] h-[35px] object-cover rounded-full" />}
								</div>
								<i className="fa-solid fa-chevron-down cursor-pointer" onClick={() => CognitoServiceObj.handleSignOut()}></i>
							</div>

							{/* userNav */}
							<div className="absolute top-14 right-0 min-w-[250px] bg-white rounded-md p-2 shadow-[4.0px_8.0px_8.0px_rgba(0,0,0,0.38)] thin_border h-0 opacity-0 overflow-hidden transition-all duration-500 group-hover:opacity-100 group-hover:h-[550%] z-30 ">
								<ul className={`mt-2 text-left p-2 ${styles.loggedInDrop}`}>
									<li className="flex items-center justify-between  rounded-lg bg-white ">
										<div className="flex items-center justify-start w-full gap-2 ">
											{/* Avatar */}
											<div className="h-8 w-8 rounded-full border border-gray-400 bg-gray-100 overflow-hidden">{userDetails?.profileImageAwsS3SignedUrl ? <img className="border-[1px] border-gray-400 p-0.2 w-[35px] h-[35px] object-cover rounded-full" src={userDetails?.profileImageAwsS3SignedUrl} /> : <User className="text-gray-400 border-[1px] border-gray-400 p-0.2 w-[35px] h-[35px] object-cover rounded-full" />}</div>

											{/* User Info */}
											<div className="flex flex-col justify-start items-start flex-1  ">
												<h5 className="text-md mb-1 w-full font-semibold text-gray-900 capitalize ">{userDetails?.name || 'user'}</h5>
												<div className="flex items-center justify-between w-full">
													<span className="text-sm font-bold  text-gray-500 max-w-[100px] truncate">
														<img src={coin} className="inline mr-1 object-contain" />
														{userDetails?.referralCount || 0}
													</span>
													{/* Change Link */}
													<a className="cursor-pointer self-end font-medium text-sm text-blue-500 hover:underline " href="/profile/edit/preferences">
														+ Referrals
													</a>
												</div>
											</div>
										</div>
									</li>

									<hr className="mt-4 mb-1 " />

									{/* Basic Edits */}
									<li className="hover:!bg-transparent">
										<span className="text-sm font-semibold text-gray-400 text-left cursor-default  ">Personal</span>
									</li>
									<li>
										<a href="/profile/edit/personal" className="text-sm font-medium text-gray-800 hover:text-blue-600">
											Edit Profile
										</a>
									</li>
									<li>
										<a href="/profile/edit/preferences" className="text-sm font-medium text-gray-800 hover:text-blue-600">
											Referrals
										</a>
									</li>
									<hr className="mt-2" />
									{/* Basic Edits */}
									<li className="hover:!bg-transparent">
										<span className="text-sm font-semibold text-gray-400 text-left cursor-default">Actions</span>
									</li>
									{/* <li>
										<a href="/faq" className="text-sm font-medium text-gray-800 hover:text-blue-600">
											Help
										</a>
									</li> */}
									<li>
										<a
											onClick={() => {
												CognitoServiceObj.handleSignOut();
												setUpdateCheck(prev => !prev);
											}}
											className="text-sm font-medium text-gray-800 hover:text-blue-600">
											Logout
										</a>
									</li>
								</ul>
							</div>
						</div>
					) : (
						<div className="flex justify-center w-full items-center ">
							<button className="btn_t1 login" onClick={() => navigateTo('/auth/login')}>
								Login
							</button>
							<button className="btn_t1 signup" onClick={() => navigateTo('/auth/signup')}>
								Sign-up for free
							</button>
						</div>
					)}
				</div>

				{/* Mobile menu button */}
				<button onClick={() => setIsOpen(!isOpen)} className={styles.menuButton}>
					{isOpen ? <X className={styles.icon} /> : <Menu className={styles.icon} />}
				</button>
			</div>

			{/* Mobile Navigation */}
			{isOpen && (
				<div className={`absolute z-50 w-full transition-all ease-in-out duration-300 ${styles.mobileMenu}`}>
					{isLoggedIn && (
						<div className="flex flex-col items-start justify-start gap-4 p-2">
							<div className="flex justify-between items-center w-full">
								<span className="flex-1 flex items-center">
									{userDetails?.profileImageAwsS3SignedUrl ? <img className="w-8 h-8 object-cover rounded-lg border border-gray-400" src={userDetails?.profileImageAwsS3SignedUrl} alt="User Avatar" /> : <User className="w-8 h-8 object-cover rounded-lg border border-gray-400" />}
									<h4 className="text-lg font-semibold capitalize px-2 ">{userDetails?.name || 'user'}</h4>
								</span>
								<LogOut
									className="cursor-pointer text-red-500 self-center "
									onClick={() => {
										CognitoServiceObj.handleSignOut();
										setUpdateCheck(prev => !prev);
									}}
								/>
							</div>
							<span className="text-sm text-gray-600 flex items-center">
								<img src={coin} className="inline mr-1 object-contain" />
								{userDetails?.referralCount || 0} Referrals Left
							</span>
							<div className="dashboard" onClick={() => navigateTo('/profile')}>
								Dashboard
							</div>
						</div>
					)}
					<nav className="flex flex-col p-2 bg-white ">
						{navItems.map(item => (
							<div key={item.label} className={styles.mobileNavItem}>
								<button onClick={() => toggleDropdown(item.label)} className={styles.mobileNavLink}>
									{item.label}
									{item.subItems && <ChevronDown className={`${styles.chevron} ${activeDropdown === item.label ? styles.rotate : ''}`} />}
								</button>
								{item.subItems && activeDropdown === item.label && (
									<div className={styles.mobileDropdown}>
										{item.subItems.map(subItem => (
											<a key={subItem.label} href={subItem.href} className={styles.mobileDropdownItem}>
												{subItem.label}
											</a>
										))}
									</div>
								)}
							</div>
						))}
					</nav>
					{!isLoggedIn && (
						<div className="flex flex-col items-center p-4 w-[300px] mx-auto ">
							<button className="btn_t1 login !bg-gray-200 scale-95 w-full mb-2" onClick={() => navigateTo('/auth/login')}>
								Login
							</button>
							<button className="btn_primary signup w-full" onClick={() => navigateTo('/auth/signup')}>
								Sign Up
							</button>
						</div>
					)}
				</div>
			)}
		</header>
	);
};
export default Header;