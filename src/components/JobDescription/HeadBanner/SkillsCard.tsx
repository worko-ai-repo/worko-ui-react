import React, { useState, useRef } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SkillsCardProps {
  department?: string;
  employmentType?: string;
  salary?: string;
  showSalary?: boolean;
  coreSkills?: string[];
  experience?: string;
}

interface SkillTagProps {
  label: string;
  className?: string;
}

const SkillTag: React.FC<SkillTagProps> = ({ label, className = "" }) => {
  return (
    <span className={`${className} px-2 py-2 bg-gray-100 cursor-pointer rounded-full text-sm text-gray-800 inline-block relative w-32`}>
      <span 
        data-tooltip-id="my-tooltip" 
        data-tooltip-content={label}  
        className="truncate block max-w-[82%]"
      >
        {(label ?? 'Label').charAt(0).toUpperCase() + (label ?? 'Label').slice(1).toLowerCase()}
      </span>
    </span>
  );
};

interface MoreSkillsTagProps {
  remainingSkills: string[];
}

const MoreSkillsTag: React.FC<MoreSkillsTagProps> = ({ remainingSkills }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative">
      <span 
        className="px-2 py-2 bg-gray-100 max-w-[30px] cursor-pointer rounded-full text-sm text-gray-800 hidden lg:inline-block relative w-32"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span className="truncate block max-w-[82%]">...</span>
      </span>
      
      {showTooltip && (
        <div 
          ref={tooltipRef}
          className="absolute z-50 bg-white shadow-lg rounded-lg p-4 w-64 right-0 top-full mt-2"
          style={{ pointerEvents: 'none' }}
        >
          <div className="grid grid-cols-2 gap-2">
            {remainingSkills.map((skill, index) => (
              <div key={index} className="px-2 py-1 bg-gray-100 rounded-3xl text-xs text-gray-800 truncate">
                {skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase()}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SkillsCard: React.FC<SkillsCardProps> = ({ 
  department, 
  employmentType, 
  salary,
  showSalary, 
  coreSkills, 
  experience 
}) => {
  const [openSection, setOpenSection] = useState<string | null>(null);
  
  const toggleSection = (section: string) => {
    if (openSection === section) {
      setOpenSection(null);
    } else {
      setOpenSection(section);
    }
  };
  
  const displaySkills = (): string[] => {
    if (coreSkills && coreSkills.length > 0) return coreSkills;
    if (!department) return ["Not Specified"];
    return department.includes(',') ? 
      department.split(',').map(skill => skill.trim()) : 
      [department];
  };
  
  const displayExperience = (): string => {
    if (experience) return experience;
    if (!employmentType) return "Not Specified";
    return employmentType.includes("Senior") ? "3-4 Years" : "1-2 Years";
  };
  
  const formattedSalary = (showSalary ? salary :"Not Disclosed" ) ?? "Not Disclosed";
  
  // Get the skills to display
  const skills = displaySkills();

  // Limit skills to display and prepare remaining skills for desktop
  const visibleSkills = skills.slice(0, 8);
  const remainingSkills = skills.length > 8 ? skills.slice(8) : [];

  return (
    <div className="bg-transparent lg:bg-white rounded-[20px] lg:p-6 h-full w-full">
      {/* Desktop version */}
      <div className="hidden lg:flex text-left lg:flex-col lg:justify-between lg:h-full">
        <div>
          <h2 className="text-xl font-bold mb-2">Core skills</h2>
          <div className="grid grid-cols-3 gap-2 w-full">
            {visibleSkills.map((skill, index) => (
              <SkillTag className="w-full" key={index} label={skill} />
            ))}
            {remainingSkills.length > 0 && (
              <MoreSkillsTag remainingSkills={remainingSkills} />
            )}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl mt-2 font-bold mb-4">Experience</h2>
          <div className="mb-4">
            <SkillTag label={displayExperience()} />
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-2">CTC</h2>
          <div>
            <SkillTag label={formattedSalary} />
          </div>
        </div>
      </div>

      {/* Mobile version */}
      <div className="lg:hidden w-full">
        <div className="flex flex-col gap-2">
          {/* Core Skills Section */}
          <div className="bg-white  rounded-3xl p-4">
            <div className="flex h-[15px] justify-between items-center">
              <h2 className="text-xl font-bold">Core skills</h2>
              <button onClick={() => toggleSection('coreSkills')}>
                {openSection === 'coreSkills' ? 
                  <ChevronUp size={36} className="text-gray-400" /> : 
                  <ChevronDown size={36} className="text-gray-400" />
                }
              </button>
            </div>
            
            {openSection === 'coreSkills' && (
              <div className="flex justify-start flex-wrap cursor-pointer gap-2 mt-4">
                {/* Display ALL skills in mobile view (visibleSkills + remainingSkills) */}
                {skills.map((skill, index) => (
                  <SkillTag key={index} label={skill} />
                ))}
              </div>
            )}
          </div>
          
          {/* Experience Section */}
          <div className="bg-white rounded-3xl p-4">
            <div className="flex h-[15px] justify-between items-center">
              <h2 className="text-xl font-bold">Experience</h2>
              <div className="flex items-center">
                <span className="text-md mr-2">{displayExperience()}</span>
                <button onClick={() => toggleSection('experience')}>
                  {openSection === 'experience' ? 
                    <ChevronUp size={36} className="text-gray-400" /> : 
                    <ChevronDown size={36} className="text-gray-400" />
                  }
                </button>
              </div>
            </div>
            
            {openSection === 'experience' && (
              <div className="flex justify-start flex-wrap cursor-pointer gap-2 mt-4">
                <SkillTag label={displayExperience()} />
              </div>
            )}
          </div>
          
          {/* CTC Section */}
          <div className="bg-white rounded-3xl p-4">
            <div className="flex h-[15px] justify-between items-center">
              <h2 className="text-xl font-bold">CTC</h2>
              <div className="flex items-center">
                <span className="text-md mr-2">{formattedSalary}</span>
                <button onClick={() => toggleSection('ctc')}>
                  {openSection === 'ctc' ? 
                    <ChevronUp size={36} className="text-gray-400" /> : 
                    <ChevronDown size={36} className="text-gray-400" />
                  }
                </button>
              </div>
            </div>
            
            {openSection === 'ctc' && (
              <div className="flex justify-start flex-wrap cursor-pointer gap-2 mt-4">
                <SkillTag label={formattedSalary} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsCard;