import styles from './pagenotfound.module.scss';
import { bg_plexus } from '@Assets';
const PageNotFound = () => {
	return (
		<div className={styles.main_Container}>
			<div className={styles.sub_Container}>
				<h1>404</h1>
				<h3>Page Not Found</h3>
        <p>
          Sorry, the page you're looking for doesn't exist. If you think this is a mistake, please contact us.
        </p>
        <button className='btn_secondary '>
          Go Back Home
        </button>
			</div>
			<div className={styles.vector_start}>
				<div className={styles.vector_blob}></div>
				<img src={bg_plexus} alt="header_img" />
			</div>
		</div>
	);
};

export default PageNotFound;
