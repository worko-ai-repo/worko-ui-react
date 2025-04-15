
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import httpServiceObj from '@Services/ApiHandler.service';
import CorporateConnectForm from './CorporateConnectForm';
import MessageModal from '@Components/Modals/MessageModal';
import { toast } from 'react-toastify';
import { getToastOptions } from '@Utils/Toast.utils';


const CorporateConnect = () => {
  const nav = useNavigate();
  const [modalData, setModalData] = useState<{
    type: 'none' | 'error' | 'warning' | 'success' | 'info';
    heading?: { message: string; type: 'error' | 'warning' | 'success' | 'info' };
    message: string;
    buttons?: { label: string; action: () => void; type?: 'primary' | 'danger' | 'warning' | 'success' }[];
  } | null>(null);

	/**
	 * handleFormSubmit
	 *
	 * @param data
	 * @returns
	 */
	async function handleFormSubmit(formData: any): Promise<void> {
		const constructPayload = {
			userFullName: formData.name,
			userEmail: formData.email,
			contactNumber: formData.phone,
			isContactNumberVerified: true,
			companyName: formData.company,
			userDesignation: formData.designation,
			userMessage: formData.message,
			pricingPlan: formData.pricingPlan, // Add the selected plan to the payload
		};
		const { response: dbResponse, error: dbError, status } = await httpServiceObj.post<any>('/corporate', constructPayload, true);
		if (status === 409) {
			toast.warn('You have already submitted the form. Our team will reach out to you shortly.',getToastOptions());
			return;
		}
		if (dbError) {
			toast.error('Something went wrong. Please try again later.',getToastOptions());
			return;
		} else {
			setModalData({
				type: 'success',
				heading: { message: 'Form Submitted', type: 'success' },
				message: 'Our team will reach out to you shortly to discuss how we can help streamline your hiring process and promote P2P hiring within your organization.',
				buttons: [{ label: 'Back to Home', action: () => nav('/') }],
			});
		}
	}

  return (
    <div id="Authlayout" className="min-h-screen flex justify-center items-center w-full bg-gradient-to-t from-blue-700 via-blue-500 to-slate-50 px-4 py-10 ">
      <div className="w-full max-w-[90vw] lg:max-w-[1200px] flex flex-col lg:flex-row items-center justify-center gap-6 z-20">
        {/* Left Side Text (Hidden on small screens) */}
        <div className="corporate_text hidden lg:block w-full lg:w-1/2">
          <p className="text-left text-3xl lg:text-4xl tracking-wide mb-3 font-semibold text-white">
            Find & hire the right talent with us
          </p>
          <ul className="list-disc text-left">
            <li className="text-white text-base lg:text-lg">Multi Level AI Powered talent matching for precision</li>
            <li className="text-white text-base lg:text-lg">Access the fastest growing relevant talent pool</li>
            <li className="text-white text-base lg:text-lg">Optimize hiring efficiency with 80% less effort.</li>
          </ul>
        </div>


        {/* Right Side Form */}
        <div className="min-h-[500px] w-full lg:w-3/2 px-6 sm:px-10 py-8 flex justify-center rounded-3xl bg-white shadow-md">
          <CorporateConnectForm handleFormSubmit={handleFormSubmit} />
        </div>
      </div>

      {/* Modal */}
      {modalData && <MessageModal {...modalData} onClose={() => setModalData(null)} showCloseButton={false} />}
    </div>
  );
};

export default CorporateConnect;
