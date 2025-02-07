import { RouterProvider } from 'react-router-dom';
import './App.css';
import AppRoutes from './Routes';
import { AppProvider } from '@Context/Main.context';

export default function App() {
	return (
		<AppProvider>
			<RouterProvider router={AppRoutes} />
		</AppProvider>
	);
}
