import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './main.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ToastContainer } from 'react-toastify';

const client = new QueryClient(); // Creating a new QueryClient instance
// Asserting that the root element exists
ReactDOM.createRoot(document.getElementById('root')!).render(
	<>
		{/* <React.StrictMode> */} {/* Enable this Only for Developer Mode which will enable some strict feature for debugging */}
		<QueryClientProvider client={client}>
			<App />
			<ToastContainer stacked /> {/* Toast Container for the application */}
		</QueryClientProvider>
		{/* </React.StrictMode> */}
		{/* Enable this Only for Developer Mode which will enable some strict feature for debugging */}
	</>
);
