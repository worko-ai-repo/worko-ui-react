import { useEffect, useRef, useState } from "react";
import Reveal from "@Views/intersection-observer/IntersectionObs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CTA_Banner } from "@Assets";

interface TestimonialItem {
  icon: string;
  student_name: string;
  student_comp: string;
  content: string;
}

interface TestimonialGroup {
  id: number | string;
  items: TestimonialItem[];
}

interface TestimonialsProps {
  heading?: string;
  title: string;
  titleImage?: string;
  testimonials: TestimonialGroup[];
  badgeIcon?: string;
  className?: string;
}

const NewTestimonials: React.FC<TestimonialsProps> = ({
  heading,
  title,
  titleImage,
  testimonials,
  badgeIcon,
  className = "",
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const firstCardRef = useRef<HTMLDivElement | null>(null);
  const [cardWidth, setCardWidth] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const handlePrev = (): void => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1));
  };

  const handleNext = (): void => {
    setCurrentIndex((prevIndex) => (prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1));
  };

  // Flattened items for the no-heading variant (show all cards in a scroll row)
  const flatItems = testimonials.reduce<
    {
      id: string;
      item: TestimonialItem;
    }[]
  >((acc, group, groupIdx) => {
    group.items.forEach((itm, itmIdx) => {
      acc.push({ id: `${group.id}-${groupIdx}-${itmIdx}` as string, item: itm });
    });
    return acc;
  }, []);

  useEffect(() => {
    const update = () => {
      setIsMobile(window.innerWidth < 640);
      if (firstCardRef.current) {
        const rect = firstCardRef.current.getBoundingClientRect();
        // Include a gap estimate (16px) to match the tailwind gap-4 spacing
        setCardWidth(rect.width + 16);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const handleScrollPrev = (): void => {
    if (!scrollRef.current) return;
    const amount = isMobile && cardWidth > 0 ? cardWidth : scrollRef.current.clientWidth;
    scrollRef.current.scrollBy({ left: -amount, behavior: "smooth" });
  };

  const handleScrollNext = (): void => {
    if (!scrollRef.current) return;
    const amount = isMobile && cardWidth > 0 ? cardWidth : scrollRef.current.clientWidth;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  const renderContent = () => {
    const words = title.split(" ");

    return (
      <span className="flex items-center  justify-center w-full flex-wrap gap-2">
        {words.map((word, index) => {
          if (word.toLowerCase().includes(".webp")) {
            return (
              <img
                key={index}
                src={titleImage}
                alt="content"
                className="inline-block h-12 object-contain my-auto"
              />
            );
          }

          return (
            <span key={index} className="inline-block">
              {word}
            </span>
          );
        })}
      </span>
    );
  };

  return (
    <div className={`bg-transparent p-1 relative md:p-5 ${className}`}>
      <div className="no-scrl-web relative section-wrapper max-sm:!pt-8 min-h-96 !p-1 md:p-5 mx-auto font-bold text-[10px]">
        {/* Header Badge */}
        {heading && (
          <h2 className="flex gap-2 mb-5 w-fit mx-auto justify-between items-center border-[0.8px] border-blue-600 shadow-sm shadow-blue-500 rounded-full text-blue-600 bg-white px-2 py-1">
            <i className={`text-blue-500 rounded-[50%] bg-blue-900 p-1.5 ${badgeIcon}`}></i>
            {heading}
          </h2>
        )}

        {/* Carousel */}
        <div className="relative mt-6 flex flex-col items-center text-center">
          {/* Heading */}
          {heading && (
            <Reveal CName="scale_up" threshold={0.5}>
              <p
                className="text-2xl sm:w-[60%] mx-auto p-5 sm:text-3xl md:text-5xl relative text-wrap font-bold text-white"
                style={{ lineHeight: "1.2" }}>
                {renderContent()}
              </p>
            </Reveal>
          )}
          {/* Main Card Carousel */}
          {heading ? (
            <div className="flex mt-8 justify-center items-center w-full">
              <button
                onClick={handlePrev}
                className="absolute top-[50%] md:text-[64px] left-0 p-2 text-4xl text-white rounded-full z-10"
                type="button"
                aria-label="Previous testimonial">
                <i className="fa-solid fa-chevron-left"></i>
              </button>

              <div className="overflow-hidden w-full p-2">
                <div
                  className="flex  transition-transform duration-500"
                  style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                  {testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="flex-shrink-0 w-full">
                      {/* Sub-Cards_main */}
                      <div className="flex mx-auto  justify-center md:w-[80%] gap-4 flex-wrap">
                        {testimonial.items.map((item, index) => (
                          <div
                            key={`${testimonial.id}-${index}`}
                            className="px-4 py-8 bg-slate-100 text-black rounded-3xl shadow-md w-[250px] flex flex-col items-center">
                            {/* Card Header */}
                            <div className="flex items-center justify-start w-full gap-2 mb-2">
                              <img
                                src={item.icon}
                                alt={`${item.student_name}'s avatar`}
                                className="w-6 h-6 rounded-full"
                              />
                              <div className="flex flex-col justify-start items-start">
                                <p className="text-sm font-bold">{item.student_name}</p>
                                <small className="text-gray-500">{item.student_comp}</small>
                              </div>
                            </div>

                            {/* Card Content */}
                            <div className="text-[8] font-normal w-full text-justify">
                              {item.content}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleNext}
                className="absolute top-[50%] md:text-[64px] right-0 p-2 text-4xl text-white rounded-full z-10"
                type="button"
                aria-label="Next testimonial">
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          ) : (
            <div className="relative w-full mt-6">
              <div
                ref={scrollRef}
                className="flex no-scrl-web  w-full overflow-x-auto scroll-smooth p-1 no-scrollbar gap-4 px-2 snap-x snap-mandatory">
                {flatItems.map(({ id, item }, idx) => (
                  <div
                    key={id}
                    ref={idx === 0 ? firstCardRef : null}
                    className="snap-start flex-shrink-0 w-[90%] sm:w-[250px] px-4 py-8 bg-slate-100 text-black rounded-3xl shadow-md flex flex-col items-center">
                    <div className="flex items-center justify-start w-full gap-2 mb-2">
                      <img
                        src={item.icon}
                        alt={`${item.student_name}'s avatar`}
                        className="w-6 h-6 rounded-full"
                      />
                      <div className="flex flex-col justify-start items-start">
                        <p className="text-sm font-bold">{item.student_name}</p>
                        <small className="text-gray-500">{item.student_comp}</small>
                      </div>
                    </div>
                    <div className="text-[8] font-normal w-full text-justify">{item.content}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-3 mt-3">
                <button
                  onClick={handleScrollPrev}
                  className="rounded-full bg-gray-100 hover:bg-gray-200 p-2">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleScrollNext}
                  className="rounded-full bg-blue-500 hover:bg-blue-600 p-2 text-white">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="relative top-12 left-0 right-0 z-0">
        <section
          className="worko-card-bg sm:w-[70vw] mx-auto overflow-hidden rounded-[48px] p-6 md:p-10 lg:p-16 min-h-[240px] sm:min-h-[300px]  relative"
          style={{
        backgroundImage: `url(${CTA_Banner})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
          }}
          aria-label="Match your CV with Worko AI promotion">
          <div className="absolute inset-0  rounded-[48px]"></div>
          <div className="relative z-10 mx-auto flex max-w-[1000px] flex-col items-center md:items-center justify-between gap-8 md:gap-4 md:flex-row">
        <div className="w-full md:flex-1">
          <h2 className="text-pretty text-center md:text-left text-4xl font-semibold leading-[1.05] text-white sm:text-5xl md:text-5xl lg:text-5xl">
            {"Match Your Cv"} <br className="hidden sm:block" />
            {"With Worko AI"}
          </h2>
        </div>

        <div className="w-full md:flex-1 max-w-xl md:max-w-[520px] text-center md:text-left">
          <p className="text-white/90 text-base leading-relaxed sm:text-lg md:text-xl">
            {"Get a job that suits you , Increase your chances"}{" "}
            <br className="hidden md:block" />
            {"to get a job by 10 times"}
          </p>

          <button
            type="button"
            onClick={() => window.location.href = '/auth/signup?mode=CAND'}
            className="mt-6 inline-flex h-14 w-full md:w-auto items-center justify-center rounded-full bg-white px-8 text-lg font-semibold text-[#0b1220] shadow-sm transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
            Get A Job
          </button>
        </div>
          </div>
        </section>
      </div>

    </div>
  );
};

export default NewTestimonials;
