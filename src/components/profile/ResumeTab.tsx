import React, { useState } from 'react';
import type { Employee } from '../../types/hrms';
import { useProjectContext } from '../../context/useProjectContext';
import { Plus, Award, Code, Heart, Sparkles } from 'lucide-react';

export const ResumeTab: React.FC<{ employee: Employee; isViewOnly?: boolean }> = ({
  employee,
  isViewOnly = false,
}) => {
  const { addSkillToEmployee, addCertificationToEmployee } = useProjectContext();
  const [newSkill, setNewSkill] = useState('');
  const [newCert, setNewCert] = useState('');
  const [showSkillInput, setShowSkillInput] = useState(false);
  const [showCertInput, setShowCertInput] = useState(false);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim()) {
      addSkillToEmployee(employee.id, newSkill.trim());
      setNewSkill('');
      setShowSkillInput(false);
    }
  };

  const handleAddCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCert.trim()) {
      addCertificationToEmployee(employee.id, newCert.trim());
      setNewCert('');
      setShowCertInput(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-800 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* About */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-[28px] shadow-floating">
            <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-2 font-heading">
              <Sparkles className="w-4 h-4 text-slate-700" />
              About
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {employee.about || 'No description provided.'}
            </p>
          </div>

          {/* What I love about my job */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-[28px] shadow-floating">
            <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-2 font-heading">
              <Heart className="w-4 h-4 text-rose-500" />
              What I love about my job
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {employee.whatILove || 'Collaborating with cross-functional teams to solve high impact engineering problems.'}
            </p>
          </div>

          {/* My interests and hobbies */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-[28px] shadow-floating">
            <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider mb-2.5 font-heading">
              My interests and hobbies
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {employee.interests || 'Technology, open-source projects, and digital art.'}
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Skills */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-[28px] shadow-floating">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2 font-heading">
                <Code className="w-4 h-4 text-emerald-600" />
                Skills
              </h4>
              {!isViewOnly && (
                <button
                  onClick={() => setShowSkillInput(!showSkillInput)}
                  className="text-xs text-black hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + add Note
                </button>
              )}
            </div>

            {showSkillInput && (
              <form onSubmit={handleAddSkill} className="mb-4 flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Enter skill name..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-black"
                />
                <button
                  type="submit"
                  className="bg-black hover:bg-slate-800 text-white px-4 py-2 rounded-full text-xs font-bold shadow-xs"
                >
                  Add
                </button>
              </form>
            )}

            <div className="flex flex-wrap gap-2">
              {employee.skills.map((skill) => (
                <span
                  key={skill.id}
                  className="bg-slate-100 border border-slate-200/80 text-slate-800 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs"
                >
                  {skill.name} {skill.level ? `(${skill.level})` : ''}
                </span>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-[28px] shadow-floating">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2 font-heading">
                <Award className="w-4 h-4 text-[#9333EA]" />
                Certifications
              </h4>
              {!isViewOnly && (
                <button
                  onClick={() => setShowCertInput(!showCertInput)}
                  className="text-xs text-black hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + add Note
                </button>
              )}
            </div>

            {showCertInput && (
              <form onSubmit={handleAddCert} className="mb-4 flex gap-2">
                <input
                  type="text"
                  value={newCert}
                  onChange={(e) => setNewCert(e.target.value)}
                  placeholder="Enter certification title..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-black"
                />
                <button
                  type="submit"
                  className="bg-black hover:bg-slate-800 text-white px-4 py-2 rounded-full text-xs font-bold shadow-xs"
                >
                  Add
                </button>
              </form>
            )}

            <div className="space-y-2.5">
              {employee.certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl flex items-center justify-between text-xs font-semibold"
                >
                  <span className="font-bold text-slate-900">{cert.name}</span>
                  <span className="text-slate-500 font-mono">
                    {cert.issuer} ({cert.year})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
