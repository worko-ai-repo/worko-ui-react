import styles from './loader.module.scss';
const Loader = () => {
	return (
		<div className={styles.loader}>
			<div className={styles.loader_text}>Loading...</div>
			<div className={styles.loader_bar}></div>
		</div>
	);
};

export default Loader;
