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
    <div className="space-y-6 text-slate-300 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Bio & Personal */}
        <div className="space-y-6">
          {/* About */}
          <div className="bg-[#1E293B]/60 border border-slate-800 p-5 rounded-2xl">
            <h4 className="font-bold text-sm text-white uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              About
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              {employee.about || 'No description provided.'}
            </p>
          </div>

          {/* What I love about my job */}
          <div className="bg-[#1E293B]/60 border border-slate-800 p-5 rounded-2xl">
            <h4 className="font-bold text-sm text-white uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400" />
              What I love about my job
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              {employee.whatILove || 'Collaborating with cross-functional teams to solve high impact engineering problems.'}
            </p>
          </div>

          {/* My interests and hobbies */}
          <div className="bg-[#1E293B]/60 border border-slate-800 p-5 rounded-2xl">
            <h4 className="font-bold text-sm text-white uppercase tracking-wider mb-2.5">
              My interests and hobbies
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              {employee.interests || 'Technology, open-source projects, and digital art.'}
            </p>
          </div>
        </div>

        {/* Right Column: Skills & Certifications */}
        <div className="space-y-6">
          {/* Skills */}
          <div className="bg-[#1E293B]/60 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-400" />
                Skills
              </h4>
              {!isViewOnly && (
                <button
                  onClick={() => setShowSkillInput(!showSkillInput)}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + add Note
                </button>
              )}
            </div>

            {showSkillInput && (
              <form onSubmit={handleAddSkill} className="mb-3 flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Enter skill name..."
                  className="flex-1 bg-[#111827] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold"
                >
                  Add
                </button>
              </form>
            )}

            <div className="flex flex-wrap gap-2">
              {employee.skills.map((skill) => (
                <span
                  key={skill.id}
                  className="bg-slate-800 border border-slate-700 text-slate-200 px-3 py-1 rounded-xl text-xs font-medium"
                >
                  {skill.name} {skill.level ? `(${skill.level})` : ''}
                </span>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-[#1E293B]/60 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-400" />
                Certifications
              </h4>
              {!isViewOnly && (
                <button
                  onClick={() => setShowCertInput(!showCertInput)}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + add Note
                </button>
              )}
            </div>

            {showCertInput && (
              <form onSubmit={handleAddCert} className="mb-3 flex gap-2">
                <input
                  type="text"
                  value={newCert}
                  onChange={(e) => setNewCert(e.target.value)}
                  placeholder="Enter certification title..."
                  className="flex-1 bg-[#111827] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold"
                >
                  Add
                </button>
              </form>
            )}

            <div className="space-y-2">
              {employee.certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="p-3 bg-slate-800/80 border border-slate-700/60 rounded-xl flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-white">{cert.name}</span>
                  <span className="text-slate-400 font-mono">
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
