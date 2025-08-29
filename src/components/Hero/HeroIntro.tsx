import styles from "@Pages/hero/hero.module.scss";
import WorkoFrame from "./WorkoFrame";
import { useNavigate } from "react-router-dom";
import Reveal from "@Views/intersection-observer/IntersectionObs";
import { useAppContext } from "@Context/App.context";
const HeroIntro = () => {
  const navigateTo = useNavigate();

  const { isLoggedIn } = useAppContext();

  const items = [
    {
      tag: "Apply Jobs",
      href: "/jobs",
    },
    {
      tag: "GET GUIDANCE & INTERVIEW HANDHOLDING",
      href: "/guidance",
    },
    {
      tag: "Request Referral",
      href: "/referrals",
    },
    /* {
			tag: "Corporate Login",
			href: "/auth/corporate/login",
		} */
  ];

  return (
    <section className="rounded-b-[2.5rem] max-sm:pb-10 pb-52 bg-white ">
      <div className="section-wrapper max-sm:!pt-10  !pb-0 text-sm  font-bold ">
        <Reveal IsDual={false} CName="scale_up" threshold={0.5} PCName="mb-7 mx-auto text-4xl lg:text-[64px] md:w-2/3 h-auto">
          <h1 className="  text-center leading-[1.2]  ">Increase your chances of getting a job by</h1>
        </Reveal>
        <Reveal IsDual={false} CName="slide_up" threshold={0.5} PCName="mx-auto w-fit">
          <p className="font-bold text-4xl sm:text-4xl md:text-4xl lg:text-5xl text-[#005EC2] px-6 py-1 sm:px-4 sm:py-2 tracking-wide rounded-lg bg-[#6DE5E5] w-min mx-auto">10X</p>
        </Reveal>
        <h2 className="text-gray-600 max-w-[300px] sm:max-w-[500px] mx-auto  mt-5">Worko is an AI powered job search tool helping you cut through the application noise and get your dream job faster than ever. </h2>

        <div className={"flex justify-center flex-wrap align-center gap-2 w-full mt-4 hover:shadow-blue-700 cursor-pointer " + styles.hero_head_container}>
          {items.map((item, index) => (
            <div key={index} onClick={() => navigateTo(item.href)} className={"w-auto flex mx-3 items-center justify-start gap-2 px-4 rounded-2xl py-1 border-[1px] border-sky-400  hover:bg-sky-100 hover:shadow-2xl hover:shadow-sky-500 active:scale-95 "}>
              <div className="check ">
                <i className="fa-solid fa-circle-check rounded-[50%] text-sky-500 "></i>
              </div>
              <h3 className="text-xs sm:text-sm text-sky-500  w-fit  ">{item.tag}</h3>
            </div>
          ))}
        </div>
        <button className={`btn_primary mt-5 ${isLoggedIn ? "" : "animate-pulse"}`} onClick={() => navigateTo(isLoggedIn ? "/jobs" : "/auth/signup")}>
          {isLoggedIn ? "Start For Free" : "Sign Up Here"}
        </button>
      </div>
      <div className={" lg:max-w-[1120px] mt-10 mx-auto md:max-w-[80%] relative bg-gradient-to-b from-[#57E1E1] to-[#86BDF8] rounded-[34px] sm:h-[600px] w-full min-w-[300px] p-4 md:p-20 " + styles.frame_outer_container}>
        <WorkoFrame frameId="intro" />
      </div>
    </section>
  );
};

export default HeroIntro;
