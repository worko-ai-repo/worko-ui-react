import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './main.css';

import { BrowserRouter} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

// Asserting that the root element exists
ReactDOM.createRoot(document.getElementById('root')!).render(
	<BrowserRouter>
		{/* <React.StrictMode> */} {/* Enable this Only for Developer Mode which will enable some strict feature for debugging */}
			<App />
			<ToastContainer stacked  /> 	   {/* Toast Container for the application */}
		{/* </React.StrictMode> */}{/* Enable this Only for Developer Mode which will enable some strict feature for debugging */}
	</BrowserRouter>
);
