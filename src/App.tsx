import { RouterProvider } from 'react-router-dom';
import './App.css';
import AppRoutes from './Routes';
import { useEffect } from 'react';

export default function App() {

/* 	useEffect(() => {
		Object.keys(SecureStorageKeyEnum).forEach((key) => {
		  const value = secureStorage.getItem(SecureStorageKeyEnum[key as keyof typeof SecureStorageKeyEnum]);
	  
		  //  Convert objects to JSON string before logging
		  const formattedValue = typeof value === "object" ? JSON.stringify(value, null, 2) : value;
	  
		  console.log(`Key: ${SecureStorageKeyEnum[key as keyof typeof SecureStorageKeyEnum]} | Value: ${formattedValue}`);
		});
	  }, []); */
	  useEffect(() => {
		console.info(import.meta.env.APP_NAME);
		const isStaging = import.meta.env.APP_MODE === "STAGING";
		console.log("Vite Config: isStaging =", isStaging);
	}, []);
	
	
	return (
		<RouterProvider router={AppRoutes} />
	);
}
