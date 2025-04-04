import './main.css';
import App from './App.tsx';
import ReactDOM from 'react-dom/client';
import { Tooltip } from 'react-tooltip';
import { ToastContainer } from 'react-toastify';
import { AppProvider } from '@Context/App.context.tsx';
import ErrorBoundary from './error-boundary/ErrorBoundary.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const client = new QueryClient(); // Creating a new QueryClient instance

ReactDOM.createRoot(document.getElementById('root')!).render(
	<>
		{/* <React.StrictMode> */} {/* Enable this Only for Developer Mode */}
		<QueryClientProvider client={client}>
			<ErrorBoundary>
				{/* fallback error boundary component */}
				<AppProvider>
					<App />
					<Tooltip id="my-tooltip" className='z-50' />
					<ToastContainer stacked /> {/* Toast Container for the application */}
				</AppProvider>
			</ErrorBoundary>
		</QueryClientProvider>
		{/* </React.StrictMode> */}
	</>
);
