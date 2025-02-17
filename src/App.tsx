import { RouterProvider } from 'react-router-dom';
import './App.css';
import AppRoutes from './Routes';
import { AppProvider } from '@Context/Main.context';


export default function App() {
/* 	Object.keys(SecureStorageKeyEnum).forEach((key) => {
		const value = secureStorage.getItem(SecureStorageKeyEnum[key as keyof typeof SecureStorageKeyEnum]);
		console.log(`Key: ${SecureStorageKeyEnum[key as keyof typeof SecureStorageKeyEnum]} | Value: ${value}`);
	  }); */
	return (
		<AppProvider>
			<RouterProvider router={AppRoutes} />
		</AppProvider>
	);
}
