import GaugeComponent from '@Components/Company/Gauge';
import React from 'react';

type MessageType = 'zeroReferral' | 'profileCompletion' | 'AlreadyRequested' | 'RequestAccepted' | 'RequestRejected' | 'Error_250' | 'Error_251' | 'Max_tries';

const messages = {
    zeroReferral: {
        titleColor: 'text-red-500',
        message: `<p>You have exhausted all your referral credits.</p>
                  <p>You can increase your referral count by subscribing to our plans.</p>
                  <p>For more information, kindly visit the <a href="/faq" class="underline text-blue-400">FAQ page</a>.</p>`,
        buttonText: 'Subscribe Now'
    },
    profileCompletion: {
        titleColor: 'text-yellow-400',
        message: `<p>To proceed with your request, please complete your candidate profile and upload your CV.</p>
                  <p>A complete profile increases your chances of getting referred.</p>`,
        buttonText: "Complete Now"
    },
    AlreadyRequested: {
        titleColor: 'text-blue-500',
        message: `<p>Sorry we cannot proceed as you have already raised a request for this application.</p>`,
        buttonText: "Okay"
    },
    RequestAccepted: {
        titleColor: 'text-green-500',
        message: `<p>You are a good match for the job. We are sending your CV to the best suitable Referee who can refer you. To see the status of your application please visit your dashboard</p>`,
        buttonText: "View Status"
    },
    RequestRejected: {
        titleColor: 'text-red-500',
        message: `<p>We regret to inform you that we are unable to proceed with this request.</p>
                  <p>Your profile and experience may not align well with the job requirement.</p>
                  <p>If you need expert advice, like a CV review or career guidance, feel free to reach out to us at <a href="mailto:Guidance@worko.ai" class="underline text-blue-400">Guidance@worko.ai</a>.</p>
                  <p>We're here to assist you in any way we can.</p>`,
        buttonText: "View Feedback"
    },
    Error_250: {
        titleColor: 'text-red-500',
        message: `<p>Apologies, we couldn't find your CV to match with the job description.</p>
                  <ul class="list-disc pl-5">
                    <li>Please ensure your CV is uploaded correctly.</li>
                    <li>You can try again after some time.</li>
                  </ul>`,
        buttonText: "Close"
    },
    Error_251: {
        titleColor: 'text-red-500',
        message: `<p>The job description provided is not valid.</p>
                  <p>Please enter a valid job description to proceed.</p>`,
        buttonText: "Close"
    },
    Max_tries: {
        titleColor: 'text-red-500',
        message: `<p>Looks like some error has occurred while requesting your application.</p>
                  <p>Please try again after some time.</p>`,
        buttonText: "Back to Home"
    }
};

const RequestReferralMessage = ({ Type, onClose, gaugeEnabled = false, gaugeScore = 0 }: { Type: keyof typeof messages; onClose: () => void; gaugeEnabled?: boolean; gaugeScore?: number }) => {
    const { titleColor, message, buttonText } = messages[Type] || {
        titleColor: 'white',
        message: `<p>Something went wrong.</p>`,
        buttonText: "Close"
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
            <div className={`min-w-[300px] p-6 rounded-3xl bg-blue-800 backdrop-blur-[10px] border border-white/10 shadow-md shadow-black flex flex-col items-center gap-6`}>
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
