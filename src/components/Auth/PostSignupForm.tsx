"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { set, useForm } from "react-hook-form";
import { X, Sparkles, Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import httpServiceObj from "@Services/ApiHandler.service";
import { useAppContext } from "@Context/App.context";
import { getToastOptions } from "@Utils/Toast.utils";
import { toast } from "react-toastify";

import { useNavigate } from "react-router-dom";
import secureStorage from "@Utils/SecureStorage.utils";
import { continueReferralRequestDataDto } from "@Pages/request-referral/RequestReferral";
import { SecureStorageKeyEnum } from "@Enums/SecureStorage.enum";
import { SignupMode } from "./Signup/Signup";
import { useCrossAppAuth } from "@Hooks/useCrossAppAuth.hook";
import CVParsingPopup from "@Components/Modals/CVParsingPopup";

interface FormData {
  coreSkills: string[];
  location: string[];
  noticePeriod: string;
  experience: number;
  salary: number;
  department: string[];
}

// Dummy data for suggestions (used as initial defaults)
const suggestionData = {
  coreSkills: [
    "Web Developer",
    "Java Developer",
    "React Developer",
    "UI/UX Designer",
    "Graphic Designer",
    "Spring Boot Developer",
    "Node.js Developer",
    "Python Developer",
    "Angular Developer",
    "Vue.js Developer",
    "Mobile Developer",
    "DevOps Engineer",
    "Data Scientist",
    "Machine Learning",
    "Cybersecurity",
    "Cloud Architect",
    "Database Administrator",
    "QA Engineer",
  ],
  locations: [
    "Bangalore",
    "Mumbai",
    "Delhi",
    "Hyderabad",
    "Chennai",
    "Pune",
    "Kolkata",
    "Ahmedabad",
    "Gurgaon",
    "Noida",
    "Remote Work",
    "Work from Home",
    "Hybrid",
    "Kochi",
    "Indore",
    "Jaipur",
  ],
  departments: [
    "Engineering",
    "Design",
    "Product Management",
    "Marketing",
    "Sales",
    "Human Resources",
    "Finance",
    "Operations",
    "Customer Success",
    "Data Science",
    "DevOps",
    "Quality Assurance",
    "Research & Development",
  ],
};

type ActiveField = "coreSkills" | "location" | "department" | null;
interface CvParseResponse {
  coreSkills: {
    skillName: string;
    years: number; // If years = 0, frontend should hide experience
  }[];

  userPreferredDepartments: string[];

  YOE: number; // Years of Experience
}

interface UserProfile {
  coreSkills: {
    skillName: string;
    years?: number; // if not present, default to 0
  }[];

  userPreferredlocations: string[]; // default: []
  noticePeriod: number;

  YOE?: number; // undefined if not provided or 0
  CTC: number;

  userPreferredDepartments: string[]; // default: []
}

export default function JobRecommendationForm() {
  const nav = useNavigate();
  const {
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      coreSkills: [],
      location: [],
      noticePeriod: "",
      experience: 0,
      salary: 0,
      department: [],
    },
  });

  const [activeField, setActiveField] = useState<ActiveField>("coreSkills");
  const [dynamicSuggestions, setDynamicSuggestions] =
    useState<typeof suggestionData>(suggestionData);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [noticePeriod, setNoticePeriod] = useState("");
  const [experience, setExperience] = useState(0);
  const [salary, setSalary] = useState<number | null>(null);
  const [ctcTouched, setCtcTouched] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [showMobileOverlay, setShowMobileOverlay] = useState(false);
  const [finalLoader, setFinalLoader] = useState({
    isInitial: false,
    isOpen: false,
  });
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const [skillsInputValue, setSkillsInputValue] = useState("");
  const [locationInputValue, setLocationInputValue] = useState("");
  const [departmentInputValue, setDepartmentInputValue] = useState("");

  const skillsInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const departmentInputRef = useRef<HTMLInputElement>(null);
  const suggestionBoxRef = useRef<HTMLDivElement>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { userDetails, PendingApply, setPendingApply } = useAppContext();
  const appHref = useCrossAppAuth();

  const { isLoading } = useQuery({
    queryKey: ["fetchSkills"],
    queryFn: getUserSkills,
    enabled: !!userDetails, // Disable automatic query on mount
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  async function getUserSkills() {
    try {
      if (!userDetails?.CV) {
        throw new Error("No CV found for the user.Please fill the form manually.");
      } else {
        const { response, status } = await httpServiceObj.post<CvParseResponse>(
          "/user/parseCv",
          {
            s3ResumeId: userDetails.CV,
          },
          true,
          {},
          false
        );
        if (status === 200) {
          const root = response as any;
          const parsed = (root?.data?.data || root?.data || root) as CvParseResponse;

          // Update selected skills from parsed coreSkills
          if (parsed?.coreSkills && Array.isArray(parsed.coreSkills)) {
            const parsedSkillNames = parsed.coreSkills
              .map((s) => s?.skillName)
              .filter((s): s is string => typeof s === "string" && s.trim().length > 0);
            const uniqueSkillNames = Array.from(new Set(parsedSkillNames)).slice(0, 18);

            if (uniqueSkillNames.length > 0) {
              // Replace only the skills suggestions; keep locations/departments as-is
              setDynamicSuggestions((prev) => ({
                ...prev,
                coreSkills: uniqueSkillNames,
              }));
            }
          }

          // If YOE is provided, set it
          if (typeof parsed?.YOE === "number" && parsed.YOE >= 0) {
            setExperience(parsed.YOE);
            setValue("experience", parsed.YOE);
          }

          // If preferred departments are provided, prefill selected departments
          if (
            Array.isArray(parsed?.userPreferredDepartments) &&
            parsed.userPreferredDepartments.length > 0
          ) {
            const uniqueDepartments = Array.from(new Set(parsed.userPreferredDepartments));
            // Replace department suggestions with parsed preferred departments (do not preselect)
            setDynamicSuggestions((prev) => ({
              ...prev,
              departments: uniqueDepartments,
            }));
          }

          // toast.success("User details fetched from CV", getToastOptions());
        }
      }
    } catch (err: any) {
      toast.error(err.message || err, getToastOptions());
    }
  }

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 320 && width < 1024);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleFieldFocus = (field: ActiveField) => {
    // Clear any existing blur timeout when focusing
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    setActiveField(field);
  };

  const handleFieldBlur = (e: React.FocusEvent) => {
    if (suggestionBoxRef.current && suggestionBoxRef.current.contains(e.relatedTarget as Node)) {
      return;
    }

    // Clear any existing timeout before setting a new one
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }

    blurTimeoutRef.current = setTimeout(() => {
      if (!suggestionBoxRef.current?.matches(":hover")) {
        setActiveField(null);
        setShowMobileOverlay(false);
      }
      blurTimeoutRef.current = null;
    }, 150);
  };

  // Clean up timeout on component unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, field: ActiveField) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = e.currentTarget.value.trim();

      if (value) {
        if (
          field === "coreSkills" &&
          !selectedSkills.includes(value) &&
          selectedSkills.length < 18
        ) {
          addSkill(value);
          setSkillsInputValue("");
        } else if (
          field === "location" &&
          !selectedLocations.includes(value) &&
          selectedLocations.length < 3
        ) {
          addLocation(value);
          setLocationInputValue("");
        } else if (field === "department" && !selectedDepartments.includes(value)) {
          addDepartment(value);
          setDepartmentInputValue("");
        }
      }
    }
  };

  const validateSkills = () => selectedSkills.length > 0;
  const validateLocations = () => selectedLocations.length > 0;
  const validateNoticePeriod = () => noticePeriod !== "";
  const validateDepartments = () => selectedDepartments.length > 0;
  const validateSalary = () => ctcTouched && salary !== null && salary > -1;
  const validateExperience = () => experience >= 0;

  const addSkill = (skill: string) => {
    if (!selectedSkills.includes(skill) && selectedSkills.length < 18) {
      const newSkills = [...selectedSkills, skill];
      setSelectedSkills(newSkills);
      setValue("coreSkills", newSkills);
    }
    if (skillsInputRef.current) {
      skillsInputRef.current.focus();
    }
  };

  const removeSkill = (skill: string) => {
    const newSkills = selectedSkills.filter((s) => s !== skill);
    setSelectedSkills(newSkills);
    setValue("coreSkills", newSkills);
  };

  const addLocation = (location: string) => {
    if (!selectedLocations.includes(location) && selectedLocations.length < 3) {
      const newLocations = [...selectedLocations, location];
      setSelectedLocations(newLocations);
      setValue("location", newLocations);
    }
    if (locationInputRef.current) {
      locationInputRef.current.focus();
    }
  };

  const removeLocation = (location: string) => {
    const newLocations = selectedLocations.filter((l) => l !== location);
    setSelectedLocations(newLocations);
    setValue("location", newLocations);
  };

  const addDepartment = (department: string) => {
    if (!selectedDepartments.includes(department)) {
      const newDepartments = [...selectedDepartments, department];
      setSelectedDepartments(newDepartments);
      setValue("department", newDepartments);
    }
    if (departmentInputRef.current) {
      departmentInputRef.current.focus();
    }
  };

  const removeDepartment = (department: string) => {
    const newDepartments = selectedDepartments.filter((d) => d !== department);
    setSelectedDepartments(newDepartments);
    setValue("department", newDepartments);
  };

  const getCurrentSuggestions = () => {
    switch (activeField) {
      case "coreSkills":
        return dynamicSuggestions.coreSkills.filter((skill) => !selectedSkills.includes(skill));
      case "location":
        return dynamicSuggestions.locations.filter(
          (location) => !selectedLocations.includes(location)
        );
      case "department":
        return dynamicSuggestions.departments.filter((dept) => !selectedDepartments.includes(dept));
      default:
        return [];
    }
  };

  const onSubmit = async (data: FormData) => {
    // Validate all required fields
    const isSkillsValid = validateSkills();
    const isLocationsValid = validateLocations();
    const isNoticePeriodValid = validateNoticePeriod();
    const isDepartmentsValid = validateDepartments();
    const isSalaryValid = validateSalary();

    // If any validation fails, stop submission
    if (
      !isSkillsValid ||
      !isLocationsValid ||
      !isNoticePeriodValid ||
      !isDepartmentsValid ||
      !isSalaryValid
    ) {
      toast.error("Please fill all required fields", getToastOptions());
      return;
    }

    try {
      const dataForRequest: UserProfile = {
        coreSkills: selectedSkills.map((skill) => ({ skillName: skill, years: 0 })),
        userPreferredlocations: selectedLocations,
        noticePeriod: noticePeriod ? parseInt(noticePeriod) || 0 : 0,
        YOE: experience > 0 ? experience : 0,
        CTC: salary || 0,
        userPreferredDepartments: selectedDepartments,
      };

      const { response, error, status } = await httpServiceObj.patch(
        `/user/${userDetails?.email}/paritial-cv-extract-signup`,
        dataForRequest,
        true,
        {},
        false
      );
      if (error) {
        throw new Error(error instanceof Error ? error.message : String(error));
      }
      if (response && status === 200) {
        toast.success("Profile updated successfully", getToastOptions());
        setFinalLoader({
          isInitial: false,
          isOpen: true,
        });
        // Optionally, you can redirect the user or reset the form here
      } else {
        throw new Error("Failed to update profile. Please try again.");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(errorMessage, getToastOptions());
    }
  };

  /**
   * initiateFinalRedirection
   *
   * @description This function is used to redirect the user to the final page after the signup process is completed
   */
  const initiateFinalRedirection = () => {
    // Retrieve pending referral data from context and secure storage
    let pendingReferral =
      PendingApply ||
      secureStorage.getItem<continueReferralRequestDataDto>(
        SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS
      );

    // Sync PendingApply and secureStorage
    if (
      PendingApply &&
      !secureStorage.getItem(SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS)
    ) {
      secureStorage.setItem(SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS, PendingApply);
    } else if (
      !PendingApply &&
      secureStorage.getItem(SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS)
    ) {
      setPendingApply(pendingReferral);
    }

    if (pendingReferral) {
      secureStorage.setItem(SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS, PendingApply);
      window.location.href = pendingReferral.url; // Redirect to the referral page
    } else {
      nav("/jobs", { replace: true });
    }
  };

  const handleNavigation = () => {
    toast.success("Your profile is ready! Redirecting to job matches...", getToastOptions());
    setTimeout(() => {
      initiateFinalRedirection();
    }, 1500);
  };

  const SuggestionBox = ({ className = "" }: { className?: string }) => {
    const suggestions = getCurrentSuggestions();

    if (!activeField || suggestions.length === 0) {
      return null;
    }

    return (
      <div
        className={`bg-gradient-to-b from-blue-600 to-sky-300
           rounded-lg border border-blue-200 shadow-lg ${className}`}
        ref={suggestionBoxRef}>
        <div className="p-2">
          <div className="bg-gradient-to-r from-cyan-100  p-2 rounded-full to-cyan-200 flex items-center gap-2 mb-3">
            <h3 className="font-medium flex gap-3 mx-auto text-sm text-blue-600">
              <Sparkles className="h-4 w-4  text-blue-600 fill-blue-500" />
              Worko AI's Recommendation
            </h3>
          </div>
          <div className="text-xs text-white mb-2 ml-2">
            {activeField === "coreSkills" && "Select recommended job titles"}
            {activeField === "location" && "Choose your preferred locations"}
            {activeField === "department" && "Pick your department"}
          </div>
          <div className="flex flex-wrap gap-2 bg-white p-3 rounded-lg max-h-60 overflow-y-auto">
            {suggestions.slice(0, 15).map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className="px-3 py-1 text-xs  text-gray-700 hover:text-blue-700 rounded-lg border border-gray-400 hover:bg-blue-100 hover:border-blue-300 transition-colors cursor-pointer"
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (activeField === "coreSkills") addSkill(suggestion);
                  else if (activeField === "location") addLocation(suggestion);
                  else if (activeField === "department") addDepartment(suggestion);
                }}>
                {suggestion} +
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Effect to show the loader whrn the component mounts
   */
  useEffect(() => {
    setFinalLoader({ isInitial: true, isOpen: true });
  }, [isLoading]);

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl text-left mx-auto">
        <div>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl capitalize font-semibold text-gray-900 mb-2 max-w-xl">
              Hi {userDetails?.fullName}, <span className="text-blue-600">your dream job</span> is
              waiting right away for you
            </h1>
          </div>

          {isLoading ? (
            <div className="animate-pulse space-y-6">
              <div className="h-7 w-80 bg-gray-200 rounded" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="space-y-3">
                    <div className="h-5 w-48 bg-gray-200 rounded" />
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-7 w-24 bg-gray-200 rounded" />
                      ))}
                    </div>
                    <div className="h-10 w-full bg-gray-200 rounded" />
                  </div>

                  <div className="space-y-3">
                    <div className="h-5 w-56 bg-gray-200 rounded" />
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-7 w-28 bg-gray-200 rounded" />
                      ))}
                    </div>
                    <div className="h-10 w-full bg-gray-200 rounded" />
                  </div>

                  <div className="space-y-3">
                    <div className="h-5 w-40 bg-gray-200 rounded" />
                    <div className="space-y-2 sm:w-1/2">
                      <div className="h-4 w-full bg-gray-200 rounded" />
                      <div className="h-2 w-full bg-gray-200 rounded" />
                    </div>
                  </div>

                  <div className="space-y-3 sm:w-1/2">
                    <div className="h-5 w-28 bg-gray-200 rounded" />
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-gray-200 rounded" />
                      <div className="h-2 w-full bg-gray-200 rounded" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="h-5 w-64 bg-gray-200 rounded" />
                    <div className="h-10 w-full bg-gray-200 rounded" />
                  </div>

                  <div className="h-10 w-48 bg-gray-200 rounded" />
                </div>

                <div className="lg:col-span-1">
                  <div className="sticky top-6">
                    <div className="h-72 w-full bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                setHasSubmitted(true);
                return handleSubmit(onSubmit)(e);
              }}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Core Skills */}
                  <div className="space-y-3">
                    <div className="">
                      <label htmlFor="skills" className="text-xl font-semibold text-gray-900">
                        Core Skills <span className="text-red-500">*</span>{" "}
                        <Info
                          data-tooltip-id="my-tooltip"
                          data-tooltip-content="Select at least one core skill to help us match you with relevant job opportunities."
                          className="text-gray-500 h-3 w-3 cursor-pointer inline-block"
                        />
                      </label>
                      <div className="ml-2 text-xs text-gray-500">Max 18 core skills</div>
                    </div>

                    {selectedSkills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {selectedSkills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md">
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="ml-2 hover:bg-blue-700 rounded-md p-0.5">
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {isLoading ? (
                      <div className="w-full h-10 rounded-lg bg-gray-200 animate-pulse" />
                    ) : (
                      <input
                        ref={skillsInputRef}
                        type="text"
                        value={skillsInputValue}
                        placeholder="Type here or select from recommendation"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          activeField === "coreSkills"
                            ? "border-blue-500 ring-2 ring-blue-500"
                            : "border-gray-300"
                        }`}
                        onChange={(e) => setSkillsInputValue(e.target.value)}
                        onFocus={() => handleFieldFocus("coreSkills")}
                        onBlur={handleFieldBlur}
                        onKeyDown={(e) => handleKeyDown(e, "coreSkills")}
                      />
                    )}

                    {hasSubmitted && !validateSkills() && (
                      <p className="text-sm text-red-500">Please select at least one core skill</p>
                    )}
                    {!isLoading && isTablet && activeField === "coreSkills" && (
                      <div className="mt-3">
                        <SuggestionBox />
                      </div>
                    )}
                  </div>

                  {/* Preferred Location */}
                  <div className="space-y-3">
                    <div className="">
                      <label htmlFor="skills" className="text-xl font-semibold text-gray-900">
                        Preferred Location <span className="text-red-500">*</span>{" "}
                        <Info
                          data-tooltip-id="my-tooltip"
                          data-tooltip-content="Select at least one preferred location to help us match you with relevant job opportunities."
                          className="text-gray-500 h-3 w-3 cursor-pointer inline-block"
                        />
                      </label>
                      <div className="ml-2 text-xs text-gray-500">Choose up-to 3 locations</div>
                    </div>

                    {selectedLocations.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {selectedLocations.map((location, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md">
                            {location}
                            <button
                              type="button"
                              onClick={() => removeLocation(location)}
                              className="ml-2 hover:bg-blue-700 rounded-md p-0.5">
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {isLoading ? (
                      <div className="w-full h-10 rounded-lg bg-gray-200 animate-pulse" />
                    ) : (
                      <input
                        ref={locationInputRef}
                        type="text"
                        value={locationInputValue}
                        placeholder="Type here or select from recommendation"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          activeField === "location"
                            ? "border-blue-500 ring-2 ring-blue-500"
                            : "border-gray-300"
                        }`}
                        onChange={(e) => setLocationInputValue(e.target.value)}
                        onFocus={() => handleFieldFocus("location")}
                        onBlur={handleFieldBlur}
                        onKeyDown={(e) => handleKeyDown(e, "location")}
                      />
                    )}
                    {hasSubmitted && !validateLocations() && (
                      <p className="text-sm text-red-500">Please select at least one location</p>
                    )}
                    {!isLoading && isTablet && activeField === "location" && (
                      <div className="mt-3">
                        <SuggestionBox className="" />
                      </div>
                    )}
                  </div>

                  {/* Notice Period */}
                  <div className="space-y-3">
                    <div className="">
                      <label htmlFor="skills" className="text-xl font-semibold text-gray-900">
                        Notice Period <span className="text-red-500">*</span>{" "}
                        <Info
                          data-tooltip-id="my-tooltip"
                          data-tooltip-content="Select your notice period to help us match you with relevant job opportunities."
                          className="text-gray-500 h-3 w-3 cursor-pointer inline-block"
                        />
                      </label>
                      <div className="ml-2 text-xs text-gray-500">Select your notice period</div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {[
                        "Immediately available",
                        "15 days",
                        "30 days",
                        "45 days",
                        "60 days",
                        "90 days",
                      ].map((period) => (
                        <button
                          key={period}
                          type="button"
                          className={`px-4 py-2 text-sm rounded-md border transition-colors ${
                            noticePeriod === period
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50"
                          }`}
                          onClick={() => {
                            setNoticePeriod(period);
                            setValue("noticePeriod", period);
                          }}>
                          {period}
                        </button>
                      ))}
                    </div>
                    {hasSubmitted && !validateNoticePeriod() && (
                      <p className="text-sm text-red-500">Please select a notice period</p>
                    )}
                  </div>

                  {/* Years of Experience */}
                  <div className="space-y-3">
                    <div className="">
                      <label htmlFor="skills" className="text-xl font-semibold text-gray-900">
                        Year of Experience <span className="text-red-500">*</span>
                      </label>
                    </div>

                    <div className="space-y-2 sm:w-1/2">
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>0</span>
                        <span className="font-medium text-gray-900">{experience} years</span>
                        <span>100</span>
                      </div>
                      {isLoading ? (
                        <div className="w-full h-2 rounded bg-gray-200 animate-pulse" />
                      ) : (
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={experience}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            setExperience(value);
                            setValue("experience", value);
                          }}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          style={{
                            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${experience}%, #e5e7eb ${experience}%, #e5e7eb 100%)`,
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Salary */}
                  <div className="space-y-3 sm:w-1/2">
                    <div className="">
                      <label htmlFor="skills" className="text-xl font-semibold text-gray-900">
                        Salary <span className="text-red-500">*</span>{" "}
                        <Info
                          data-tooltip-id="my-tooltip"
                          data-tooltip-content="Select your current annual CTC to help us match you with relevant job opportunities."
                          className="text-gray-500 h-3 w-3 cursor-pointer inline-block"
                        />
                      </label>
                      <div className="ml-2 text-xs text-gray-500">Current annual CTC in LPA</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>0</span>
                        <span className="font-medium text-gray-900">
                          {salary === null ? "Not set" : `${salary} Lakhs`}
                        </span>
                        <span>500</span>
                      </div>
                      {isLoading ? (
                        <div className="w-full h-2 rounded bg-gray-200 animate-pulse" />
                      ) : (
                        <input
                          type="range"
                          min="0"
                          max="500"
                          value={salary ?? 0}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            if (!ctcTouched) setCtcTouched(true);
                            setSalary(value);
                            setValue("salary", value);
                          }}
                          onMouseDown={() => setCtcTouched(true)}
                          onTouchStart={() => setCtcTouched(true)}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          style={{
                            background:
                              salary === null
                                ? "#e5e7eb"
                                : `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                                    (salary / 500) * 100
                                  }%, #e5e7eb ${(salary / 500) * 100}%, #e5e7eb 100%)`,
                          }}
                        />
                      )}
                    </div>
                    {hasSubmitted && !validateSalary() && (
                      <p className="text-sm text-red-500">
                        {!ctcTouched
                          ? "Please set your current CTC"
                          : "Please select a valid CTC amount"}
                      </p>
                    )}
                  </div>

                  {/* Preferred Department */}
                  <div className="space-y-3">
                    <div className="">
                      <label htmlFor="skills" className="text-xl font-semibold text-gray-900">
                        Preferred Department <span className="text-red-500">*</span>{" "}
                        <Info
                          data-tooltip-id="my-tooltip"
                          data-tooltip-content="Select at least one preferred department to help us match you with relevant job opportunities."
                          className="text-gray-500 h-3 w-3 cursor-pointer inline-block"
                        />
                      </label>
                    </div>

                    {selectedDepartments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {selectedDepartments.map((dept, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md">
                            {dept}
                            <button
                              type="button"
                              onClick={() => removeDepartment(dept)}
                              className="ml-2 hover:bg-blue-700 rounded-md p-0.5">
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {isLoading ? (
                      <div className="w-full h-10 rounded-lg bg-gray-200 animate-pulse" />
                    ) : (
                      <input
                        ref={departmentInputRef}
                        type="text"
                        value={departmentInputValue}
                        placeholder="Type here or select from recommendation"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          activeField === "department"
                            ? "border-blue-500 ring-2 ring-blue-500"
                            : "border-gray-300"
                        }`}
                        onChange={(e) => setDepartmentInputValue(e.target.value)}
                        onFocus={() => handleFieldFocus("department")}
                        onBlur={handleFieldBlur}
                        onKeyDown={(e) => handleKeyDown(e, "department")}
                      />
                    )}
                    {hasSubmitted && !validateDepartments() && (
                      <p className="text-sm text-red-500">Please select at least one department</p>
                    )}
                    {!isLoading && isTablet && activeField === "department" && (
                      <div className="mt-3">
                        <SuggestionBox />
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-fit btn_primary bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
                    Find me jobs
                  </button>
                </div>

                {/* Desktop Suggestion Box */}
                {!isLoading && !isMobile && !isTablet && (
                  <div className="lg:col-span-1 ">
                    <div className="relative grid grid-rows-2 h-full gap-4 ">
                      <div>
                        {/* Row 1: Core Skills */}
                        <div>{activeField === "coreSkills"  && <SuggestionBox />}</div>
                        {/* Row 2: Location */}
                        <div className="absolute top-44">
                          {activeField === "location" && <SuggestionBox />}
                        </div>
                        <div className="absolute bottom-10">
                          { activeField === "department"  && <SuggestionBox />}
                        </div>
                      </div>

                      {/* Row 3: Department */}
                    </div>
                  </div>
                )}
              </div>
            </form>
          )}
        </div>
        {isMobile && showMobileOverlay && (
          <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 max-h-[70vh] overflow-y-auto shadow-xl">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900">Suggestions</h3>
                  <button
                    type="button"
                    onClick={() => setShowMobileOverlay(false)}
                    className="p-1 hover:bg-gray-100 rounded-full">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <SuggestionBox />
              </div>
            </div>
          </div>
        )}
        {/* finalLoader &&  */}
        { finalLoader.isOpen && <CVParsingPopup isInitial={finalLoader.isInitial} onClose={() => {
          finalLoader.isInitial ? 
            setFinalLoader({isInitial:false,isOpen:false})
          : (handleNavigation(), setFinalLoader({isInitial:false,isOpen:false}))
        }} />}
      </div>
    </div>
  );
}
