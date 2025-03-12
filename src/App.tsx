import { RouterProvider } from 'react-router-dom';
import './App.css';
import AppRoutes from './Routes';
import { SecureStorageKeyEnum } from '@Enums/SecureStorage.enum';
import secureStorage from '@Utils/SecureStorage.utils';
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
	 /*  useEffect(() => {
		console.log(import.meta.env.APP_NAME);
	}, []); */
	return (<RouterProvider router={AppRoutes} />);
}
