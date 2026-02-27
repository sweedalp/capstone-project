import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * TrainerProfileDropdown
 * Accepts either:
 *   - name + role       (AI Studio / Content Library)
 *   - userName + userEmail  (Dashboard / Course Management)
 */
const TrainerProfileDropdown = ({
  avatarUrl,
  name,
  role,
  userName,
  userEmail,
}) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ Normalise props — support both naming conventions
  const displayName = name  || userName  || localStorage.getItem('userName')  || 'Trainer';
  const displaySub  = role  || userEmail || localStorage.getItem('userEmail') || 'trainer';

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handleLogoutConfirm = () => {
    localStorage.clear();
    sessionStorage.clear();
    setShowLogoutModal(false);
    setDropdownOpen(false);
    navigate('/login');
  };

  const menuItems = [
    { icon: 'person',   label: 'My Profile',       danger: false, onClick: () => setDropdownOpen(false) },
    { icon: 'settings', label: 'Account Settings',  danger: false, onClick: () => setDropdownOpen(false) },
    { icon: 'help',     label: 'Help & Support',    danger: false, onClick: () => setDropdownOpen(false) },
    { icon: 'logout',   label: 'Logout',            danger: true,  onClick: () => { setDropdownOpen(false); setShowLogoutModal(true); } },
  ];

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(p => !p)}
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity focus:outline-none"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 leading-none">{displayName}</p>
            <p className="text-xs text-slate-500 truncate max-w-[140px]">{displaySub}</p>
          </div>
          {avatarUrl ? (
            <div
              className="size-10 rounded-full bg-slate-200 border-2 border-blue-200 overflow-hidden bg-cover bg-center flex-shrink-0"
              style={{ backgroundImage: `url('${avatarUrl}')` }}
            />
          ) : (
            <div className="size-10 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-blue-600 flex-shrink-0">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person</span>
            </div>
          )}
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-12 z-[200] bg-white border border-slate-200 rounded-xl shadow-xl w-52 py-1 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
              <p className="text-xs text-slate-500 truncate">{displaySub}</p>
            </div>
            {menuItems.map(({ icon, label, onClick, danger }) => (
              <button
                key={label}
                onClick={onClick}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-slate-50 ${danger ? 'text-rose-600 hover:bg-rose-50' : 'text-slate-700'}`}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '18px', color: danger ? '#f43f5e' : '#94a3b8' }}
                >
                  {icon}
                </span>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <div className="flex justify-center mb-4">
              <div className="size-14 bg-rose-50 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-rose-500" style={{ fontSize: '28px' }}>logout</span>
              </div>
            </div>
            <h2 className="text-lg font-bold text-slate-900 text-center mb-2">
              Are you sure you want to logout?
            </h2>
            <p className="text-sm text-slate-500 text-center mb-6">
              Any ongoing AI generations will continue in background
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="flex-1 px-4 py-2.5 bg-rose-500 text-white rounded-lg text-sm font-bold hover:bg-rose-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TrainerProfileDropdown;