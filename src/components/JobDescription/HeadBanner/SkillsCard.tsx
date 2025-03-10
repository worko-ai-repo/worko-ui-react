import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SkillsCardProps {
  department?: string;
  employmentType?: string;
  salary?: string;
  coreSkills?: string[];
  experience?: string;
}

const SkillTag = ({ label }: { label: string }) => {
  return (
    <span className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-800 inline-block relative w-32">
      <span className="truncate block max-w-[85%]">
        {label}
      </span>
    </span>
  );
};

const SkillsCard: React.FC<SkillsCardProps> = ({ 
  department, 
  employmentType, 
  salary, 
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
  
  const displaySkills = useMemo(() => {
    if (coreSkills && coreSkills.length > 0) return coreSkills;
    if (!department) return ["Not Specified"];
    return department.includes(',') ? 
      department.split(',').map(skill => skill.trim()) : 
      [department];
  }, [coreSkills, department]);
  
  const displayExperience = useMemo(() => {
    if (experience) return experience;
    if (!employmentType) return "Not Specified";
    return employmentType.includes("Senior") ? "3-4 Years" : "1-2 Years";
  }, [experience, employmentType]);
  
  const formattedSalary = useMemo(() => {
    return salary || "Not Disclosed";
  }, [salary]);

  return (
    <div className="bg-transparent lg:bg-white rounded-[20px] lg:p-6">
      {/* Desktop version */}
      <div className="hidden lg:flex text-left lg:flex-col lg:justify-between lg:h-full">
        <div>
          <h2 className="text-xl font-bold mb-4">Core skills</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {displaySkills.map((skill, index) => (
              <SkillTag key={index} label={skill} />
            ))}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-4">Experience</h2>
          <div className="mb-6">
            <SkillTag label={displayExperience} />
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-4">CTC</h2>
          <div>
            <SkillTag label={formattedSalary} />
          </div>
        </div>
      </div>

      {/* Mobile version */}
      <div className="lg:hidden w-full">
        <div className="flex flex-col gap-2">
          {/* Core Skills Section */}
          <div className="bg-white rounded-3xl p-4">
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
              <div className="flex flex-wrap gap-2 mt-4">
                {displaySkills.map((skill, index) => (
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
                <span className="text-md mr-2">{displayExperience}</span>
                <button onClick={() => toggleSection('experience')}>
                  {openSection === 'experience' ? 
                    <ChevronUp size={36} className="text-gray-400" /> : 
                    <ChevronDown size={36} className="text-gray-400" />
                  }
                </button>
              </div>
            </div>
            
            {openSection === 'experience' && (
              <div className="mt-4">
                <SkillTag label={displayExperience} />
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
              <div className="mt-4">
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