import GaugeComponent from '@Components/Company/Gauge';
import React from 'react';

type MessageType = 'zeroReferral' | 'profileCompletion' | 'AlreadyRequested' | 'RequestAccepted' | 'RequestRejected' | 'Error_250' | 'Error_251' | 'Max_tries';

const messages = {
    zeroReferral: { titleColor: 'text-red-500',  title: "No Referrals Left", message: "You have exhausted all your referral credits. You can increase your referral count by subscribing to our plans. For more information, kindly visit the FAQ page.", buttonText: 'Subscribe Now' },
    profileCompletion: { titleColor: 'text-yellow-400',  title: "Low Profile Scores", message: "To proceed with your referral request, please complete your candidate profile and upload your CV. A complete profile increases your chances of getting referred.", buttonText: "Complete Now" },
    AlreadyRequested: { titleColor: 'text-blue-500',  title: "Already Requested", message: "You have already requested a referral for this job.", buttonText: "Okay" },
    RequestAccepted: { titleColor: 'text-green-500',  title: "Request Accepted", message: "Your referral request has been accepted!", buttonText: "Go to dashboard!" },
    RequestRejected: { titleColor: 'text-red-500',  title: "Request Rejected", message: "Your referral request was not approved.For more details please click the button down below", buttonText: "View Feedback" },
    Error_250: { titleColor: 'text-red-500',  title: "Something Went Wrong!", message: "<p>Apologies, we couldn't find your CV to match with the job description.</p><ul><li>Please ensure your CV is uploaded correctly.</li><li>You can try again after some time.</li></ul>", buttonText: "Close" },
    Error_251: { titleColor: 'text-red-500',  title: "Something Went Wrong!", message: "The job description provided is not valid. Please enter a valid job description to proceed.", buttonText: "Close" },
    Max_tries: { titleColor: 'text-red-500',  title: "Something Went Wrong!", message: "Looks like some error has occurred while requesting your application. Please try again after some time.", buttonText: "Back to home" },
};

const RequestReferralMessage = ({ Type, onClose, gaugeEnabled = false, gaugeScore = 0 }: { Type: keyof typeof messages; onClose: () => void; gaugeEnabled?: boolean; gaugeScore?: number }) => {
    const { titleColor, title, message, buttonText } = messages[Type] || { titleColor: 'white', title: "Unknown", message: "Something went wrong.", buttonText: "Close" };

    return (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
            <div className={`min-w-[300px] p-6 rounded-3xl bg-blue-800 backdrop-blur-[10px] border border-white/10 shadow-md shadow-black flex flex-col items-center gap-6`}>
                <h2 className={`text-3xl font-semibold ${titleColor} text-center`}>{title}</h2>
                {gaugeEnabled && (
                    <div className="w-[150px] text-center">
                        <GaugeComponent score={gaugeScore} strokeWidth={12} />
                        <p className="text-white text-2xl font-semibold mt-2">Your Scores</p>
                    </div>
                )}
                <div className="text-white text-center sm:max-w-[500px]" dangerouslySetInnerHTML={{ __html: message }}></div>
                <button onClick={onClose} className="min-w-32 text-white border px-3 py-2 rounded-lg border-white hover:bg-white/20 transition">
                    {buttonText}
                </button>
            </div>
        </div>
    );
};

export default RequestReferralMessage;
