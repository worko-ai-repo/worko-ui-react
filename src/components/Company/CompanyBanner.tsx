import { useState, useEffect, useRef, FunctionComponent } from 'react';
import styles from './company.module.scss';
import { CompanyPageModeEnum } from '@Interfaces/CompanyContext.dto';
import { useCompanyContext } from '../../context/Company.context';
import { useForm } from 'react-hook-form';
import { validationRules } from '@Utils/FormValidator.utils';

const companyStaticData = {
  [CompanyPageModeEnum.JOB]: {
    title: 'Create a profile and get hired instantly!',
    description: `
      <ul class="list-disc pl-5 space-y-2">
        <li>Job hunting could be nerve-wracking, but not anymore with Worko.</li>
        <li>Here, you'll find hundreds of roles, and you can apply for the relevant ones.</li>
        <li>We'll personally review your application and give you actionable feedback.</li>
        <li>Maximize your chances of reaching and passing the interview.</li>
      </ul>
    `,
  },
  [CompanyPageModeEnum.REFERRAL]: {
    title: 'Get referred to over <span class="font-bold px-3 py-1 bg-[#57E1E1] rounded-lg">1000+</span> companies',
    description: `
      <ul class="list-disc pl-5 space-y-2">
        <li>With our referral system, your dream job is closer than you think.</li>
        <li>Submit the application for the role you want to apply for.</li>
        <li>We'll connect you with a referee (working in the same company) who'll personally refer you.</li>
        <li>Get insider coaching to nail that interview and more.</li>
      </ul>
    `,
  },
  [CompanyPageModeEnum.GUIDANCE]: {
    title: 'Your Shortcut to Career Success – Guidance That Gets Results',
    description: `
      <ul class="list-disc pl-5 space-y-2">
        <li>From resume tweaks to mock drills, we prep you to land interview calls and crack them effortlessly. Get role-specific strategies, proven answer frameworks to transform nerve-wracking interviews into smooth, confident conversations.</li>
        <li>Need guidance for a specific company? We pair you with professionals currently working there. Learn their interview secrets, culture hacks, and red flags to avoid—straight from the source.</li>
      </ul>
    `,
  },
};

interface CompanyData {
  title: string;
  description: string;
}

type FormValues = {
  email: string;
};

const CompanyBanner = ({ BannerMode }: { BannerMode?: CompanyPageModeEnum }) => {
  const [activeCard, setActiveCard] = useState<'email' | 'refer'>('email');
  const [isPaused, setIsPaused] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormValues>();
  const emailValue = watch('email');
  
  useEffect(() => {
    // Set isPaused based on email value
    if (emailValue && emailValue.trim() !== '') {
      setIsPaused(true);
    } else {
      // Only unpause if no value and not focused
      const emailInput = document.querySelector('input[name="email"]');
      if (emailInput !== document.activeElement) {
        setIsPaused(false);
      }
    }
  }, [emailValue]);
  
  useEffect(() => {
    // Only set up rotation if not subscribed
    if (!isSubscribed) {
      // Function to start the rotation
      const startRotation = () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        
        intervalRef.current = setInterval(() => {
          if (!isPaused) {
            setActiveCard(prev => prev === 'email' ? 'refer' : 'email');
          }
        }, 5000);
      };
      
      // Start the rotation initially
      startRotation();
    } else {
      // Clear interval when subscribed
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    
    // Clean up the interval when component unmounts
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, isSubscribed]);
  
  const handleInputFocus = () => {
    setIsPaused(true);
    // Force the email card to be active when input is focused
    setActiveCard('email');
  };
  
  const handleInputBlur = () => {
    // Only unpause if there's no text in the input
    if (!emailValue || !emailValue.trim()) {
      setIsPaused(false);
    }
  };
  
  // Register email input with custom event handlers
  const emailRegister = {
    ...register('email', validationRules.email),
    onFocus: handleInputFocus,
    onBlur: (e: any) => {
      // Call React Hook Form's blur handler
      emailRegister.onBlur(e);
      // Call our custom blur handler
      handleInputBlur();
    }
  };
  
  const onSubmit = (data: FormValues) => {
    console.log('Email submitted:', data.email);
    // Store the submitted email
    setSubmittedEmail(data.email);
    // Set subscription status to true
    setIsSubscribed(true);
    // No need to pause rotation anymore as we're showing success card
    setIsPaused(false);
    // No need for rotation as we'll just show the success card
  };
  
  let currentData: CompanyData = { title: '', description: '' };

  if (!BannerMode) {
    const { companyPageMode } = useCompanyContext();
    currentData = companyStaticData[companyPageMode] || {};
  } else {
    currentData = companyStaticData[BannerMode] || {};
  }

  return (
    <div className="sm:px-5 py-10 sm:px-auto relative w-full min-h-[200px] bg-blue-600 text-white flex">
      <div className="mx-auto max-w-[1280px] md:p-4 flex items-center justify-between w-full">
        <div className={`min-w-[300px] max-w-[600px] mx-auto md:mx-0 text-wrap p-2 text-justify ${styles.banner_content}`}>
          <p className="w-full text-xl sm:text-2xl font-bold mb-2" dangerouslySetInnerHTML={{ __html: currentData.title }}></p>
          <small className="text-[10px] sm:text-xs" dangerouslySetInnerHTML={{ __html: currentData.description }}></small>
        </div>

        <div className="hidden md:block w-full md:max-w-[400px]">
          {/* Show success popup if subscribed */}
          {isSubscribed ? (
            <EmailSuccessPopup email={submittedEmail} />
          ) : (
            <>
              {/* EmailCard - shown when activeCard is 'email' */}
              <div className={`transition-opacity duration-500 ${activeCard === 'email' ? 'opacity-100' : 'opacity-0 hidden'}`}>
                <div className="px-4 py-4 mx-auto min-h-36 max-w-80 subCard rounded-2xl bg-white text-black p-2 flex flex-col items-start justify-center gap-3">
                  <div className="text-xs text-left">
                    <p className="font-bold">📨 Email me for jobs</p>
                    <small className="text-gray-500 pl-1">Enter Your Email And Get Notified For New Jobs</small>
                  </div>
                  <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-2">
                    <div className="w-full">
                      <input 
                        type="text" 
                        className={`w-full bg-transparent px-4 py-2.5 rounded-md border outline-none text-xs ${errors.email ? 'border-red-500' : ''}`} 
                        placeholder="name@gmail.com"
                        {...emailRegister}
                      />
                      {errors.email && (
                        <p className="text-xs text-left text-red-500 mt-1">{errors.email.message?.toString()}</p>
                      )}
                    </div>
                    <button 
                      type="submit" 
                      className="btn_secondary mx-auto font-normal py-1 px-10 bg-blue-500 text-[0.8rem] text-white"
                    >
                      Subscribe
                    </button>
                  </form>
                </div>
              </div>

              {/* ReferCard - shown when activeCard is 'refer' */}
              <div className={`transition-opacity duration-500 ${activeCard === 'refer' ? 'opacity-100' : 'opacity-0 hidden'}`}>
                <div className="px-6 min-h-36 subCard rounded-2xl bg-white text-black p-2 flex flex-col items-start justify-start">
                  <div className="text-md text-center justify-center font-bold flex items-center gap-3 w-full">
                    <span>🤝</span>
                    <span className="font-poppins">Refer a Friend, Earn Rewards!</span>
                  </div>
                  
                  <ul className="w-full list-disc">
                    <li className="flex items-start">
                      <span className="text-lg">🎯</span>
                      <div className='text-left ml-2'>
                        <span className="font-gilroy-semibold text-xs">Your Reward:</span>
                        <span className="font-gilroy-medium text-left text-xs"> Receive a monetary reward for every successful hire.</span>
                      </div>
                    </li>
                    
                    <li className="flex items-start ">
                      <span className="text-lg">🌟</span>
                      <div className='text-left ml-2'>
                        <span className="font-gilroy-semibold text-xs">Help Friends:</span>
                        <span className="font-gilroy-medium text-xs"> Connect talented candidates with their dream roles.</span>
                      </div>
                    </li>
                    
                    <li className="flex items-start">
                      <span className="text-lg">🔄</span>
                      <div className='text-left ml-2'>
                        <span className="font-gilroy-semibold text-xs">No Limits:</span>
                        <span className="font-gilroy-medium text-xs"> Refer as many people as you like – rewards stack up!</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};


interface EmailSuccessPopupProps {
  email: string;
}

const EmailSuccessPopup: FunctionComponent<EmailSuccessPopupProps> = ({ email }) => {
  return (
     
      <div className="px-4 py-4 mx-auto min-h-36 subCard rounded-2xl bg-white text-black p-2 flex flex-col items-center justify-center gap-3">
        <div className="text-center w-full mb-2">
          <p className="font-bold text-blue-600 text-lg">🎉 You're All Set!</p>
          <p className="text-blue-600 font-medium text-sm">{email}</p>
        </div>
        
        <div className="text-center text-xs text-gray-500 flex items-top justify-top gap-1">
          <span className="text-lg">🤖</span>
          <div>
            <p>Our AI will review your CV and send you curated job</p>
            <p>matches tailored to your profile to boost your success.</p>
          </div>
        </div>
      </div>
    
    
  );
};

export default CompanyBanner;