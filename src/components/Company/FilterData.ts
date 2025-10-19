export type SelectType = "normal" | "multiselect";

interface FilterMetadata {
  paramKey: string;
  placeholder: string;
  selectType: SelectType;
  options: string[];
  value: any[];
}

export const filterMetaData: { jobFilter: FilterMetadata[]; referralFilter: FilterMetadata[] } = {
  jobFilter: [
    {
      paramKey: "location",
      placeholder: "Location",
      selectType: "multiselect",
      options: [], // This can be populated with suggested locations
      value: [], // This can be populated with suggested locations
    },
    /* {
      options: ["Internship", "Full Time", "Part Time"],
      value: ["INTERNSHIP", "FULL_TIME", "PART_TIME"],
      paramKey: "typeofEmployment",
      placeholder: "Employment Type",
      selectType: "normal",
    },
    {
      options: ["Remote", "Hybrid", "Onsite"],
      value: ["WFH", "HYBRID", "WFO"],
      paramKey: "workMode",
      placeholder: "Work Mode",
      selectType: "normal",
    }, */
    {
      paramKey: "coreSkills",
      placeholder: "Core Skills",
      selectType: "multiselect",
      options: [], // This can be populated with suggested skills
      value: [], // This can be populated with suggested skills
    },
    {
      paramKey: "softSkills",
      placeholder: "Soft Skills",
      selectType: "multiselect",
      options: [], // This can be populated with suggested skills
      value: [], // This can be populated with suggested skills
    },
    {
      paramKey: "technicalSkills",
      placeholder: "Technical Skills",
      selectType: "multiselect",
      options: [], // This can be populated with suggested skills
      value: [], // This can be populated with suggested skills
    },
    {
      options: [
        "0-5L",
        "5-10L",
        "10-15L",
        "15-20L",
        "20-25L",
        "25-30L",
        "30-35L",
        "35-40L",
        "40-45L",
        "45-50L",
        "50-70L",
        "70-100L",
        "100-500L",
        "500-1000L",
      ],
      value: [
        "0-5",
        "5-10",
        "10-15",
        "15-20",
        "20-25",
        "25-30",
        "30-35",
        "35-40",
        "40-45",
        "45-50",
        "50-70",
        "70-100",
        "100-500",
        "500-1000",
      ],
      paramKey: "salaryRange",
      placeholder: "Salary Range",
      selectType: "normal",
    },
    {
      options: [
        "0-1 years",
        "1-3 years",
        "3-6 years",
        "6-9 years",
        "9-12 years",
        "12-15 years",
        "15-20 years",
        "20-25 years",
        "25+ years",
      ],
      value: ["0-1", "1-3", "3-6", "6-9", "9-12", "12-15", "15-20", "20-25", "25-100"],
      paramKey: "experienceRange",
      placeholder: "Experience Range",
      selectType: "normal",
    },
    {
      placeholder: "Company",
      paramKey: "companyName",
      selectType: "multiselect",
      options: [], // This can be populated with suggested industries
      value: [],
    },
    {
      placeholder: "Job Type",
      paramKey: "dashboard",
      selectType: "normal",
      options: ["Refer a friend jobs"],
      value: ["USER"],
    },
    {
      placeholder: "Department",
      paramKey: "department",
      selectType: "multiselect",
      options: [], // This can be populated with suggested industries
      value: [],
    },
  ],
  referralFilter: [
    {
      placeholder: "Team Size",
      paramKey: "teamSize",
      selectType: "normal",
      options: ["1-10", "10-50", "50-100", "100-500", "500-1000", "1000-5000", "5000+"], // Added team size ranges
      value: ["1-10", "10-50", "50-100", "100-500", "500-1000", "1000-5000", "5000+"],
    },
    {
      placeholder: "Industry",
      paramKey: "industry",
      selectType: "multiselect",
      options: [], // This can be populated with suggested industries
      value: [],
    },
    {
      placeholder: "Company",
      paramKey: "companyName",
      selectType: "multiselect",
      options: [], // This can be populated with suggested industries
      value: [],
    },
  ],
};
