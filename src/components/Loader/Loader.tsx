import styles from './loader.module.scss';
const MainLoader = () => {
	return (
		<div className="overflow-y-hidden fixed inset-0 flex items-center justify-center bg-black/50 w-full backdrop-blur-sm z-50  ">

			<div className={`relative mx-auto  w-52 h-52 ${styles.loader}`}>
				<div className={styles.loader_text}>Loading...</div>
				<div className={styles.loader_bar}></div>
			</div>
		</div>
	);
};

export default MainLoader;
