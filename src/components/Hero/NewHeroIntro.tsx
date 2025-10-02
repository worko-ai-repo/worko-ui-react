import React, { useState, useRef, useEffect } from "react";
import Reveal from "@Views/intersection-observer/IntersectionObs";
import {
  cloudUpload,
  dash_lines,
  Referral,
  lightening,
  Job,
  Home,
  time,
  Filter,
  Support,
} from "@Assets";
import { floatingStats } from "./data";
import { toast } from "react-toastify";
import { getToastOptions } from "@Utils/Toast.utils";
import LatestJobOpportunities from "./LatestJobOpportunities";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@Context/App.context";
import JobListDropdown, { DropDownSelectedJobData } from "./JobListDropdown";

interface JobCategories {
  name: string;
  count: number;
}

export default function SmoothHeroIntro() {
  const statIcons: Record<string, string> = {
    Referral,
    lightening,
    Job,
    Home,
    time,
    Filter,
    Support,
  };
  const nav = useNavigate();
  const { setTempCvFile, isLoggedIn } = useAppContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [dragActive, setDragActive] = useState(false);
  // jobs section moved to LatestJobOpportunities
  const floatingRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imgError, setImgError] = useState(false);
  const uri = import.meta.env.APP_JOBS_API_URI || "https://jobs.worko.ai";

  // --- Floating animation ---
  useEffect(() => {
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      if (animationFrameId) cancelAnimationFrame(animationFrameId);

      animationFrameId = requestAnimationFrame(() => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;

        const xPercent = (clientX - innerWidth / 2) / (innerWidth / 2);
        const yPercent = (clientY - innerHeight / 2) / (innerHeight / 2);

        floatingRefs.current.forEach((ref, index) => {
          if (ref) {
            const multiplier = 20 + index * 10;
            const moveX = -xPercent * multiplier;
            const moveY = -yPercent * multiplier;
            ref.style.transform = `translate(${moveX}px, ${moveY}px) rotate(12deg)`;
          }
        });
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // --- Resume Upload (both drag-drop & button) ---
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed", getToastOptions({}));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB", getToastOptions({}));
      return;
    }
    setTempCvFile(file);
    nav("/auth/signup");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed", getToastOptions({}));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB", getToastOptions({}));
      return;
    }
    setTempCvFile(file);
    nav("/auth/signup");
  };

  // jobs list moved to LatestJobOpportunities component

  return (
    <div
      ref={containerRef}
      className=" min-h-screen bg-white relative rounded-b-[40px] overflow-hidden">
      {floatingStats.map((stat, index) => (
        <Reveal
          key={index}
          IsDual={false}
          CName="scale_up"
          threshold={0.5}
          PCName="mb-7 mx-auto text-4xl lg:text-[64px] h-auto">
          <div
            ref={(el) => (floatingRefs.current[index] = el)}
            className={`max-lg:hidden bg-white absolute ${stat.position} text-white rounded-lg text-sm font-semibold shadow-lg transition-all duration-300 ease-out w-28  flex flex-col justify-center items-center overflow-hidden cursor-default z-50`}
            style={{ transform: `rotate(${Math.random() * 45}deg)` }}>
            <div className="flex items-center w-[90%] gap-1">
              {/* {stat.icon && (
                <img
                  src={statIcons[stat.icon as keyof typeof statIcons]}
                  alt=""
                  className="w-2 h-2 shrink-0"
                />
              )} */}
              <div className="text-[12px] font-semibold leading-tight text-center px-1 ">
                {stat.text}
              </div>
            </div>
            <div className="text-[7px] font-normal text-gray-100 mt-0.5 px-1 leading-3 text-center ">
              {stat.subText}
            </div>
          </div>
        </Reveal>
      ))}

      <div className="container section-wrapper mx-auto px-4 py-0">
        <img src={dash_lines} className=" bg-repeat z-0 absolute  " alt="" />

        {/* Hero Text */}
        <div className="text-center mb-12">
          <div className="section-wrapper max-sm:!pt-10  !pb-0 text-sm  font-bold ">
            <Reveal
              IsDual={false}
              CName="scale_up"
              threshold={0.5}
              PCName="mb-7 mx-auto text-4xl lg:text-[64px] md:w-2/3 h-auto">
              <h1 className="  text-center leading-[1.2]  ">
                Increase your chances of getting a job by
              </h1>
            </Reveal>
            <Reveal IsDual={false} CName="slide_up" threshold={0.5} PCName="mx-auto w-fit">
              <p className="font-bold text-4xl sm:text-4xl md:text-4xl lg:text-5xl text-[#005EC2] px-6 py-1 sm:px-4 sm:py-2 tracking-wide rounded-lg bg-[#6DE5E5] w-min mx-auto">
                10X
              </p>
            </Reveal>
            <h2 className="text-gray-600 max-w-[300px] sm:max-w-[500px] mx-auto mb-8  mt-5">
              Preparing yourself for success in the interview.
            </h2>
          </div>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <JobListDropdown
              onSelect={(job: DropDownSelectedJobData) => {
                const encodedTitle = encodeURI(job.jobTitle);
                nav(`/jobs/${encodedTitle}/${job.id}`);
              }}
            />
          </div>

          {/* Upload CV */}
          {!isLoggedIn && (
            <div className="max-w-2xl mx-auto relative  ">
              <div className="border-2  border-gray bg-[#F0F4FF] z-10 rounded-lg">
                <div className="p-8 relative ">
                  <div className="text-center">
                    <div className="absolute top-0 left-0 right-0 bg-cyan-100 text-cyan-700 px-4 py-2 rounded-lg text-sm font-medium mb-6 inline-block">
                      Upload your cv for instant job matches
                    </div>

                    <div
                      className={` flex justify-end max-sm:justify-center border rounded-xl mt-8 p-8 ${
                        dragActive ? "border-dashed border-blue-500 bg-blue-100" : "border-none"
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}>
                      <img
                        src={cloudUpload}
                        alt="Upload Cv"
                        className=" h-60 absolute top-5 left-14 max-sm:hidden "
                      />
                      <div>
                        <p className="text-gray-600 mb-4">Drop & drag your resume or</p>
                        <button
                          className=" hover:bg-blue-600 btn_primary text-white px-6 py-3 rounded-lg flex items-center mx-auto"
                          onClick={() => fileInputRef.current?.click()}>
                          Upload Resume
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="application/pdf"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Latest Job Opportunities */}
        <div className="flex  max-w-[100%]  sm:p-12 flex-col lg:flex-row gap-8 relative">
          <LatestJobOpportunities IsCompanyModemode={false} />
        </div>
      </div>
    </div>
  );
}
