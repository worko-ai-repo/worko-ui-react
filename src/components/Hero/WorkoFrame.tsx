import { useEffect, useState } from 'react';
import { job_frame, ref_frame } from '@Assets';
import styles from './hero_component.module.scss';

const WorkoFrame = ({ frameId }: { frameId: string }) => {
  const [activeFrame, setActiveFrame] = useState<'jobs' | 'referrals'>('jobs');

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFrame((prev) => (prev === 'jobs' ? 'referrals' : 'jobs'));
    }, 3000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const handleToggle = (frame: 'jobs' | 'referrals') => {
    setActiveFrame(frame);
  };

  return (
    <div className="flex justify-center items-center sm:scale-y-85">
      <div className={`rounded-3xl p-5 h-full  ${frameId === 'outro' ? 'lg:translate-y-0': ''} ${styles.frame_inner_container}`}>
        <div className={"bg-white rounded-3xl h-auto relative md:mx-0 lg:mx-5 " + styles.frame_main_content}>
          {/* Blue Header */}
          <div className="rounded-t-3xl w-full bg-blue-600 h-[60px]" />

          {/* Toggle Container */}
          <div className="absolute left-1/2 -translate-x-1/2 scale-50 sm:scale-90 top-[40px] w-full max-w-[200px] z-10">
            <div className="group relative flex w-full rounded-lg border-3 border-white bg-white shadow-md p-1">
              {/* Sliding Background */}
              <div
                className={`absolute inset-y-1 w-[calc(50%-4px)] rounded-md bg-blue-500 transition-all duration-300 ease-in-out ${
                  activeFrame === 'referrals' ? 'translate-x-[100%]' : 'translate-x-0'
                }`}
              />

              {/* Jobs Toggle */}
              <div className="relative flex-1">
                <input
                  type="radio"
                  id={`jobs-${frameId}`}
                  name={`toggle-${frameId}`}
                  value="jobs"
                  checked={activeFrame === 'jobs'}
                  onChange={() => handleToggle('jobs')}
                  className="peer absolute opacity-0 w-full h-auto cursor-pointer"
                />
                <label
                  htmlFor={`jobs-${frameId}`}
                  className="relative block w-full text-center px-4 py-1 text-sm font-medium cursor-pointer transition-colors duration-200"
                >
                  <span className={activeFrame === 'jobs' ? 'text-white' : 'text-gray-600 hover:text-gray-800'}>
                    Jobs
                  </span>
                </label>
              </div>

              {/* Referrals Toggle */}
              <div className="relative flex-1">
                <input
                  type="radio"
                  id={`referrals-${frameId}`}
                  name={`toggle-${frameId}`}
                  value="referrals"
                  checked={activeFrame === 'referrals'}
                  onChange={() => handleToggle('referrals')}
                  className="peer absolute opacity-0 w-full h-full cursor-pointer"
                />
                <label
                  htmlFor={`referrals-${frameId}`}
                  className="relative block w-full text-center px-4 py-1 text-sm font-medium cursor-pointer transition-colors duration-200"
                >
                  <span className={activeFrame === 'referrals' ? 'text-white' : 'text-gray-600 hover:text-gray-800'}>
                    Referrals
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="h-auto">
            <div className=" rounded-2xl  lg:h-[600px] max-h-[600px] sm:min-w-[500px] lg:min-w-[900px] p-4 md:p-10 ">
              <img
                fetchPriority="high" 
                src={activeFrame === 'jobs' ? job_frame : ref_frame}
                alt="job_frame"
                className="mx-auto max-h-[600px] md:min-w-[500px] sm:h-[100%] object-contain "
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoFrame;
