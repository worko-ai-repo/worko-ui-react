import { useNavigate } from "react-router-dom";
import WorkoFrame from "./WorkoFrame";
import styles from "./hero_component.module.scss";
const HeroOutro = () => {
  const navTo = useNavigate();
  return (
    <section className="bg-white p-1 md:p-5 md:pb-10 h-fit">
     
      <div
        className={
          " lg:max-w-[1120px]  mx-auto sm:max-w-[90%] relative bg-gradient-to-b from-[#57E1E1] to-[#86BDF8] rounded-[34px]  w-full min-w-[300px] p-4 sm:p-10 " +
          styles.frame_outer_container
        }>
          <div className="font-semibold p-4">Not only get jobs but also get referrals. </div>
        <WorkoFrame frameId="outro" />
      </div>
    </section>
  );
};

export default HeroOutro;
