import  { useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { logo_text } from '@Assets';
import styles from './header.module.scss';

interface NavItem {
  label: string;
  href: string;
  subItems?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    label: 'Candidate',
    href: '#candidate',
    subItems: [
      { label: 'Job Search', href: '#job-search' },
      { label: 'Interview Tips', href: '#interview-tips' },
    ],
  },
  {
    label: 'Employee',
    href: '#employee',
    subItems: [
      { label: 'HR Solutions', href: '#hr-solutions' },
      { label: 'Training Programs', href: '#training-programs' },
    ],
  },
  { label: 'About Us', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

 const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleDropdown = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logo}>
          <img src={logo_text} alt="Logo" />
        </div>

        {/* Desktop Navigation */}
        <nav className={`${styles.nav} ${styles.desktop}`}>
          <ul className={styles.navList}>
            {navItems.map((item) => (
              <li
                key={item.label}
                className={styles.navItem}
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <a href={item.href} className={styles.navLink}>
                  {item.label}
                  {item.subItems && <ChevronDown className={styles.chevron} />}
                </a>
                {item.subItems && activeDropdown === item.label && (
                  <div className={styles.dropdown}>
                    {item.subItems.map((subItem) => (
                      <a
                        key={subItem.label}
                        href={subItem.href}
                        className={styles.dropdownItem}
                      >
                        {subItem.label}
                      </a>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
          <div className={styles.authButtons}>
            <button className="btn_t1 login">Login</button>
            <button className="btn_t1 signup">Sign-up for free</button>
          </div>
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={styles.menuButton}
        >
          {isOpen ? <X className={styles.icon} /> : <Menu className={styles.icon} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className={styles.mobileMenu}>
          {navItems.map((item) => (
            <div key={item.label} className={styles.mobileNavItem}>
              <button
                onClick={() => toggleDropdown(item.label)}
                className={styles.mobileNavLink}
              >
                {item.label}
                {item.subItems && (
                  <ChevronDown
                    className={`${styles.chevron} ${
                      activeDropdown === item.label ? styles.rotate : ''
                    }`}
                  />
                )}
              </button>
              {item.subItems && activeDropdown === item.label && (
                <div className={styles.mobileDropdown}>
                  {item.subItems.map((subItem) => (
                    <a
                      key={subItem.label}
                      href={subItem.href}
                      className={styles.mobileDropdownItem}
                    >
                      {subItem.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className={"w-[60%] mx-auto flex flex-col " +styles.mobileAuth}>
            <button className="btn_t1 mx-8 bg-gray-300 text-center flex justify-center">
              Login
            </button>
            <button className="btn_t1 signup flex justify-center mx-4">Sign Up</button>
          </div>
        </div>
      )}
    </header>
  );
};
export default Header;