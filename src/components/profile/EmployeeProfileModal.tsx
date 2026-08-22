import React, { useState } from 'react';
import { useProjectContext } from '../../context/useProjectContext';
import { X, Mail, Phone, MapPin, Building2, UserCheck, Shield, Camera, Upload, Check, Eye } from 'lucide-react';
import { ResumeTab } from './ResumeTab';
import { PrivateInfoTab } from './PrivateInfoTab';
import { SalaryInfoTab } from './SalaryInfoTab';
import { SecurityTab } from './SecurityTab';

export const EmployeeProfileModal: React.FC = () => {
  const {
    isProfileModalOpen,
    closeProfileModal,
    selectedProfileEmployee,
    currentRole,
    isProfileViewOnly,
    updateEmployeeRecord,
    addToast,
  } = useProjectContext();

  const [activeTab, setActiveTab] = useState<'resume' | 'private' | 'salary' | 'security'>('resume');

  // Photo Management Modal State
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');

  if (!isProfileModalOpen || !selectedProfileEmployee) return null;

  const emp = selectedProfileEmployee;
  const canViewSalary = currentRole === 'admin';

  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = () => {
    const newAvatar = photoPreview || customPhotoUrl.trim();
    if (!newAvatar) return;

    updateEmployeeRecord(emp.id, { avatar: newAvatar });
    setIsPhotoModalOpen(false);
    setPhotoPreview(null);
    setCustomPhotoUrl('');
    addToast('success', 'Profile photo updated successfully!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 font-sans overflow-y-auto">
      <div className="bg-white border border-slate-200/80 rounded-[36px] w-full max-w-4xl max-h-[90vh] shadow-floating-lg overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200 relative">
        
        {/* Top Header Overlay */}
        <div className="bg-slate-50/70 border-b border-slate-200/80 p-6 sm:p-8 relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <button
            onClick={closeProfileModal}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-900 rounded-full bg-white hover:bg-slate-100 border border-slate-200/60 transition cursor-pointer shadow-xs"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Profile Basic Info & Avatar with Photo Edit Badge */}
          <div className="flex items-center gap-5">
            <div className="relative group">
              <img
                src={emp.avatar}
                alt={emp.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md cursor-pointer group-hover:opacity-90 transition duration-200"
                onClick={() => {
                  setPhotoPreview(emp.avatar);
                  setIsPhotoModalOpen(true);
                }}
              />
              
              {!isProfileViewOnly && (
                <button
                  type="button"
                  onClick={() => {
                    setPhotoPreview(emp.avatar);
                    setIsPhotoModalOpen(true);
                  }}
                  className="absolute bottom-0 right-0 p-2 bg-black hover:bg-slate-800 text-white rounded-full border-2 border-white shadow-md transition cursor-pointer"
                  title="View, Add or Edit Profile Photo"
                >
                  <Camera className="w-3.5 h-3.5 text-yellow-300" />
                </button>
              )}
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
                  {emp.name}
                </h2>
                <span className="font-mono text-xs text-slate-900 bg-[#FEF08A] border border-yellow-300 px-3 py-1 rounded-full font-bold shadow-xs">
                  {emp.loginId}
                </span>
                {isProfileViewOnly && (
                  <span className="text-[10px] uppercase font-bold bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-300">
                    View Only
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">{emp.jobTitle}</p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                <div className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{emp.company}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">Dept:</span>
                  <span className="font-bold text-slate-700">{emp.department}</span>
                </div>
                <div className="flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Manager: {emp.manager}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Specs Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 text-xs space-y-2 min-w-[220px] shadow-xs">
            <div className="flex items-center gap-2.5 text-slate-700 truncate">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate font-semibold">{emp.email}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700 truncate">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate font-semibold">{emp.mobile}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate font-semibold">{emp.location}</span>
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="bg-white px-8 border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('resume')}
            className={`py-4 px-5 text-xs font-bold uppercase tracking-wider border-b-2 transition cursor-pointer ${
              activeTab === 'resume'
                ? 'border-black text-black'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Resume
          </button>
          <button
            onClick={() => setActiveTab('private')}
            className={`py-4 px-5 text-xs font-bold uppercase tracking-wider border-b-2 transition cursor-pointer ${
              activeTab === 'private'
                ? 'border-black text-black'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Private Info
          </button>

          {canViewSalary && (
            <button
              onClick={() => setActiveTab('salary')}
              className={`py-4 px-5 text-xs font-bold uppercase tracking-wider border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'salary'
                  ? 'border-black text-black'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-[#9333EA]" />
              Salary Info (Admin Only)
            </button>
          )}

          <button
            onClick={() => setActiveTab('security')}
            className={`py-4 px-5 text-xs font-bold uppercase tracking-wider border-b-2 transition cursor-pointer ${
              activeTab === 'security'
                ? 'border-black text-black'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Security
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-8 overflow-y-auto flex-1 max-h-[60vh]">
          {activeTab === 'resume' && <ResumeTab employee={emp} isViewOnly={isProfileViewOnly} />}
          {activeTab === 'private' && <PrivateInfoTab employee={emp} />}
          {activeTab === 'salary' && canViewSalary && <SalaryInfoTab employee={emp} />}
          {activeTab === 'security' && <SecurityTab employee={emp} />}
        </div>
      </div>

      {/* MODAL: VIEW, ADD & EDIT PROFILE PHOTO */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/80 rounded-[32px] w-full max-w-md shadow-floating-lg p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-lg text-slate-900 font-heading flex items-center gap-2">
                <Camera className="w-5 h-5 text-slate-700" />
                Profile Photo Management
              </h3>
              <button
                onClick={() => setIsPhotoModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Photo Preview Frame */}
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-slate-200 shadow-md">
                <img
                  src={photoPreview || customPhotoUrl || emp.avatar}
                  alt={emp.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> High Resolution Preview
              </span>
            </div>

            {/* Upload File Input */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Upload Photo File
                </label>
                <label className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 border-dashed rounded-full py-3 px-4 text-slate-700 font-bold cursor-pointer transition">
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span>Choose Image File...</span>
                  <input type="file" accept="image/*" onChange={handlePhotoFileUpload} className="hidden" />
                </label>
              </div>

              <div className="text-center text-slate-400 text-[10px] font-bold">OR</div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Image Web URL
                </label>
                <input
                  type="text"
                  value={customPhotoUrl}
                  onChange={(e) => setCustomPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-white border border-slate-200 rounded-full py-2.5 px-4 text-xs text-slate-900 focus:outline-none focus:border-black shadow-floating"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-full text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePhoto}
                className="px-5 py-2 bg-black hover:bg-slate-800 text-white font-bold rounded-full text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 text-yellow-300" />
                Save Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
