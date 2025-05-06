import { useState, useEffect, useRef, FunctionComponent } from "react";
import styles from "./company.module.scss";
import { CompanyPageModeEnum } from "@Interfaces/CompanyContext.dto";
import { useCompanyContext } from "../../context/Company.context";
import { useForm } from "react-hook-form";
import { validationRules } from "@Utils/FormValidator.utils";
import httpServiceObj from "@Services/ApiHandler.service";
import { toast } from "react-toastify";
import { getToastOptions } from "@Utils/Toast.utils";
import { useLocation, useNavigate } from "react-router-dom";
import { useJobFilters } from "@Hooks/useJobFilter.hook";

const companyStaticData = {
  [CompanyPageModeEnum.JOB]: {
    title: "Create a profile and get hired instantly!",
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
    title: "Your Shortcut to Career Success – Guidance That Gets Results",
    description: `
      <ul class="list-disc pl-5 space-y-2">
        <li>From resume tweaks to mock drills, we prep you to land interview calls and crack them effortlessly. Get role-specific strategies, proven answer frameworks to transform nerve-wracking interviews into smooth, confident conversations.</li>
        <li>Need guidance for a specific company? We pair you with professionals currently working there. Learn their interview secrets, culture hacks, and red flags to avoid—straight from the source.</li>
      </ul>
    `,
  },
};
const referDetails = [
  { icon: "🎯", title: "Your Reward", description: "Receive a monetary reward for every successful hire." },
  { icon: "🌟", title: "Help Friends", description: "Connect talented candidates with their dream roles." },
  { icon: "🔄", title: "No Limits", description: "Refer as many people as you like – rewards stack up!" },
];

interface CompanyData {
  title: string;
  description: string;
}

type FormValues = {
  email: string;
};

const CompanyBanner = ({ BannerMode }: { BannerMode?: CompanyPageModeEnum }) => {
  const [activeCard, setActiveCard] = useState<"email" | "refer">("refer");
  const [activeFrame, setActiveFrame]= useState<'card'|'description'>('description');
  const [isPaused, setIsPaused] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormValues>();
  const emailValue = watch("email");

  useEffect(() => {
    // Set isPaused based on email value
    if (emailValue && emailValue.trim() !== "") {
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
            setActiveFrame(prev => prev === 'card' ? 'description' : 'card');
            // setActiveCard(prev => prev === 'email' ? 'refer' : 'email');     //@TODO: Uncomment this line to enable rotation and revert the email in the state as default val
          }
        }, 3000);
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
    setActiveCard("email");
  };

  const handleInputBlur = () => {
    // Only unpause if there's no text in the input
    if (!emailValue || !emailValue.trim()) {
      setIsPaused(false);
    }
  };

  // Register email input with custom event handlers
  const emailRegister = {
    ...register("email", validationRules.email),
    onFocus: handleInputFocus,
    onBlur: (e: any) => {
      // Call React Hook Form's blur handler
      emailRegister.onBlur(e);
      // Call our custom blur handler
      handleInputBlur();
    },
  };

  const onSubmit = async (data: FormValues) => {
    const { response, error, status } = await httpServiceObj.post(
      "/user/settings",
      {
        subscribedEmailId: data.email,
      },
      true
    );

    if (status === 409) {
      toast.error("Already Registered!", getToastOptions());
    }

    if (response) {
      // Set subscription status to true
      setIsSubscribed(true);
      // No need to pause rotation anymore as we're showing success card
      setIsPaused(false);
    } else {
      setIsSubscribed(false);
    }
  };

  let currentData: CompanyData = { title: "", description: "" };

  if (!BannerMode) {
    const { companyPageMode } = useCompanyContext();
    currentData = companyStaticData[companyPageMode] || {};
  } else {
    currentData = companyStaticData[BannerMode] || {};
  }



  return (
    <div className="sm:px-5 py-10 sm:px-auto relative w-full max-sm:h-[250px] md:min-h-[200px] bg-blue-600 text-white flex">
      <div className="mx-auto max-w-[1280px] md:p-4 flex items-center justify-between w-full">
        <div className={`${activeFrame === 'description' ? 'w-full' : 'max-md:hidden'} transition delay-200 duration-300 ease-in-out min-w-[300px] max-w-[600px] mx-auto md:mx-0 text-wrap p-2 text-left ${styles.banner_content}`}>
          <p className="w-full text-[12px] sm:text-2xl font-bold mb-2" dangerouslySetInnerHTML={{ __html: currentData.title }}></p>
          <small className="text-[9px] text-justify sm:text-xs" dangerouslySetInnerHTML={{ __html: currentData.description }}></small>
        </div>

        <div className={`${activeFrame=== 'card' ? 'max-md:w-full max-sm:scale-75 max-sm:mb-8' : 'max-md:hidden'} transition delay-200 duration-300 ease-in-out md:block h-[155px] md:max-w-[460px]`}>
          {/* Show success popup if subscribed */}
          {isSubscribed ? (
            <EmailSuccessPopup email={submittedEmail} />
          ) : (
            <>
              {/* EmailCard - shown when activeCard is 'email' */}
              <div className={`transition-opacity duration-500 ${activeCard === "email" ? "opacity-100" : "opacity-0 hidden"}`}>
                <div className="px-4 py-4 mx-auto min-h-36 max-w-80 subCard rounded-2xl bg-white text-black p-2 flex flex-col items-start justify-center gap-3">
                  <div className="text-xs text-left">
                    <p className="font-bold">📨 Email me for jobs</p>
                    <small className="text-gray-500 pl-1">Enter Your Email And Get Notified For New Jobs</small>
                  </div>
                  <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-2">
                    <div className="w-full">
                      <input type="text" className={`w-full bg-transparent px-4 py-2.5 rounded-md border outline-none text-xs ${errors.email ? "border-red-500" : ""}`} placeholder="name@gmail.com" {...emailRegister} />
                      {errors.email && <p className="text-xs text-left text-red-500 mt-1">{errors.email.message?.toString()}</p>}
                    </div>
                    <button type="submit" className="btn_secondary mx-auto font-normal py-1 px-10 bg-blue-500 text-[0.8rem] text-white">
                      Subscribe
                    </button>
                  </form>
                </div>
              </div>

              {/* ReferCard - shown when activeCard is 'refer' */}
              <div className={`transition-opacity duration-500  ${activeCard === "refer" ? "opacity-100" : "opacity-0 hidden"}`}>
                <div className="bg-white text-gray-800 shadow-lg rounded-2xl px-4 pt-4 pb-1.5 min-h-36 flex flex-col">
                  <div className="flex items-center justify-center mb-3">
                    <span className="text-lg">🤝</span>
                    <h3 className="text-xs font-bold ml-2">Refer a Friend, Earn Rewards!</h3>
                  </div>
                  <ul className="space-y-0">
                    {referDetails.map((item, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <span className="text-xs align-bottom ">{item.icon}</span>
                        <div className="text-left  ">
                          <small className=" text-xs font-semibold ">{item.title}: </small>
                          <small className=" text-xs ">{item.description}</small>
                        </div>
                      </li>
                    ))}
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
