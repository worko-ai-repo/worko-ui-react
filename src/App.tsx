import './App.css';
import Layout from './Layout/Layout';
import { Route, Routes } from 'react-router-dom';
import { Hero, MockInterview, PageNotFound } from '@Routes';

import { useEffect } from 'react';
import { AppProvider } from './context/MainContext';
import Employee from '@Pages/employee/Employee';


/**
 * @function App
 *
 * @description The main component of the application
 *
 * @returns {JSX.Element} The JSX code for the App component
 */
function App(): JSX.Element {
	useEffect(() => {
		console.log(import.meta.env);
	}, []);

	 return (
		<Routes>
		  {/* Wrap only the parts that need the context */}
		  <Route path="/" element={<AppProvider> <Layout /> </AppProvider>}>
		  	<Route index element={<Hero />} />
			<Route path="/mock-interview" element={<MockInterview />} />
			<Route path="/emp" element={<Employee />} />
		  </Route>
		  {/* PageNotFound route remains outside the context provider */}
		  <Route path="/*" element={<PageNotFound />} />
		</Routes>
	  );
}

export default App;
