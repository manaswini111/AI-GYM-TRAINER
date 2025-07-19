import React, { useState, useEffect } from 'react';
import PoseDetector from '../components/PoseDetector';
import VideoPoseDetector from '../components/VideoPoseDetector';
import WorkoutChart from '../components/WorkoutChart';
import './Dashboard.css'; // Adjust the path if necessary
export default function Dashboard() {
  const [reps, setReps] = useState(0);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* LEFT: Pose Detection */}
      <div className="w-2/3 p-6">
        <h2 className="text-2xl font-semibold text-green-400 mb-4">📹 Live Pose Detection</h2>
        <div className="bg-gray-800 rounded-xl p-4 shadow-lg">
          <PoseDetector setReps={setReps} />
          <p className="mt-4 text-lg text-yellow-400">✅ Real-time Feedback Below</p>
        </div>

        <div className="mt-10">
          <VideoPoseDetector />
        </div>
      </div>

      {/* RIGHT: Dashboard */}
      <div className="w-1/3 p-6 bg-gray-900 rounded-l-3xl flex flex-col items-center justify-start space-y-6">
        <h2 className="text-xl font-bold text-white mb-2">🏋️ Dashboard</h2>

        {/* Circular Rep Counter */}
        <div className="relative">
          <div className="w-40 h-40 rounded-full border-8 border-blue-500 flex items-center justify-center text-4xl font-bold text-white">
            {reps}
          </div>
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-sm text-blue-300">Reps</div>
        </div>

        {/* Workout Timer */}
        <div className="bg-gray-800 w-full text-center rounded-xl py-4">
          <h3 className="text-md text-gray-400">🔥 Workout Time</h3>
          <p className="text-xl font-mono text-green-400">{formatTime(time)}</p>
        </div>

        {/* Fat Burned (Static Example) */}
        <div className="bg-gray-800 w-full text-center rounded-xl py-4">
          <h3 className="text-md text-gray-400">🔥 Fat Burned</h3>
          <p className="text-xl font-mono text-pink-500">{(reps * 0.35).toFixed(1)} cal</p>
        </div>

        {/* Calories Burned (Static Example) */}
        <div className="bg-gray-800 w-full text-center rounded-xl py-4">
          <h3 className="text-md text-gray-400">⚡ Calories</h3>
          <p className="text-xl font-mono text-orange-400">{(reps * 0.7).toFixed(1)} kcal</p>
        </div>

        {/* Bar Chart */}
        <WorkoutChart />
      </div>
    </div>
  );
}

