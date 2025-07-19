import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SmartDashboard({
  reps,
  setReps,
  feedback,
  time,
  setTime,
  isRunning,
  setIsRunning,
}) {
  const navigate = useNavigate();

  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    } else if (!isRunning && interval !== null) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, setTime]);

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const calories = (reps * 0.5).toFixed(1);
  const progress = Math.min(reps / 20, 1);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-md mx-auto">
        <div className="flex flex-col space-y-6 text-white h-full">
          {/* Reps Card */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-slate-700/50 p-8 flex flex-col items-center">
            <p className="text-lg font-medium text-slate-300 mb-3 tracking-wide">Reps Completed</p>
            <div className="relative w-40 h-40 mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="#334155" strokeWidth="8" fill="none" />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="url(#gradient1)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 70}
                  strokeDashoffset={(1 - progress) * 2 * Math.PI * 70}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-out"
                />
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-blue-400">
                {reps}
              </div>
            </div>
          </div>

          {/* Feedback */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-slate-700/50 p-6 text-center">
            <p className="text-lg font-medium text-slate-300 mb-3 tracking-wide">Posture Feedback</p>
            <p className="text-xl font-semibold text-amber-400">{feedback}</p>
          </div>

          {/* Calories */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-slate-700/50 p-6 text-center">
            <p className="text-lg font-medium text-slate-300 mb-3 tracking-wide">Calories Burned</p>
            <p className="text-4xl font-bold text-emerald-400">
              {calories} <span className="text-lg text-slate-400">kcal</span>
            </p>
          </div>

          {/* Timer */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-slate-700/50 p-6 text-center">
            <p className="text-lg font-medium text-slate-300 mb-3 tracking-wide">Workout Timer</p>
            <p className="text-4xl font-bold text-indigo-400 mb-6 font-mono">{formatTime(time)}</p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setIsRunning(true)}
                disabled={isRunning}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isRunning
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-green-500/25 transform hover:scale-105'
                }`}
              >
                Start
              </button>
              <button
                onClick={() => setIsRunning(false)}
                disabled={!isRunning}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  !isRunning
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg hover:shadow-orange-500/25 transform hover:scale-105'
                }`}
              >
                Pause
              </button>
              <button
                onClick={() => {
                  setIsRunning(false);
                  setTime(0);
                  setReps(0);
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-slate-500/25 transform hover:scale-105"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Logout */}
          <div className="pt-6 border-t border-slate-700/60">
            <button
              onClick={handleLogout}
              className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-red-500/25 transform hover:scale-105"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
