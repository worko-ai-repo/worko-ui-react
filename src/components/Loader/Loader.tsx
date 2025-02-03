import styles from './loader.module.scss';
const MainLoader = () => {
	return (
		<div className="relative flex h-[100vh] w-full   ">
			<div className={`relative mx-auto top-[35%] w-52 h-52 ${styles.loader}`}>
				<div className={styles.loader_text}>Loading...</div>
				<div className={styles.loader_bar}></div>
			</div>
		</div>
	);
};

export default MainLoader;
