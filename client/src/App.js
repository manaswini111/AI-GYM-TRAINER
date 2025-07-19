import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import AuthPage from './components/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';
import MoveNetWebcam from './components/MoveNetWebcam';
import DumbbellCurlDetector from './components/DumbbellCurlDetector';
import VideoUploadPose from './components/VideoUploadPose';
import SmartDashboard from './components/SmartDashboard';
import { ArrowLeftCircle } from 'lucide-react';

function MainTrainer() {
  const [mode, setMode] = useState(null);
  const [exercise, setExercise] = useState('squats');
  const [reps, setReps] = useState(0);
  const [feedback, setFeedback] = useState('Waiting...');
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);

  const renderDetector = () => {
    if (mode === 'webcam') {
      if (exercise === 'squats') {
        return (
          <MoveNetWebcam
            isRunning={isRunning}
            setReps={setReps}
            setFeedback={setFeedback}
          />
        );
      } else if (exercise === 'dumbbell') {
        return (
          <DumbbellCurlDetector
            isRunning={isRunning}
            setReps={setReps}
            setFeedback={setFeedback}
          />
        );
      }
    } else if (mode === 'upload') {
      return (
        <VideoUploadPose
          isRunning={isRunning}
          setReps={setReps}
          setFeedback={setFeedback}
        />
      );
    }
    return null;
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
      {/* Left Side */}
      <div className="w-3/4 relative flex flex-col overflow-hidden">

        {/* Back Arrow Button */}
        {mode && (
          <button
            onClick={() => {
              setMode(null);
              setReps(0);
              setFeedback('Waiting...');
              setIsRunning(false);
              setTime(0);
            }}
            className="absolute top-4 left-4 z-50 group"
            title="Back to Mode Selection"
          >
            <div className="bg-white/10 backdrop-blur-md border border-purple-400 text-purple-400 p-2 rounded-full shadow-lg transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white">
              <ArrowLeftCircle size={32} />
            </div>
          </button>
        )}

        {/* Mode Selection */}
        {!mode ? (
          <div className="flex flex-col items-center justify-center h-full space-y-10 bg-black/30 backdrop-blur-xl p-8 rounded-lg shadow-inner">
            <h2 className="text-4xl font-extrabold text-purple-400">Choose Detection Mode</h2>
            <div className="flex space-x-6">
              <button
                onClick={() => setMode('webcam')}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transform hover:scale-105 transition duration-300"
              >
                Webcam Detection
              </button>
              <button
                onClick={() => setMode('upload')}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg transform hover:scale-105 transition duration-300"
              >
                Upload Video
              </button>
            </div>
          </div>
        ) : (
          <>
            {mode === 'webcam' && (
              <div className="p-4 bg-gray-900 border-b border-gray-700 flex items-center justify-between">
                <label className="text-lg font-semibold text-purple-300">Choose Exercise:</label>
                <select
                  value={exercise}
                  onChange={(e) => {
                    setReps(0);
                    setFeedback('Waiting...');
                    setExercise(e.target.value);
                    setIsRunning(false);
                    setTime(0);
                  }}
                  className="p-2 rounded-lg bg-gray-800 text-white border border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="squats">Squats</option>
                  <option value="dumbbell">Dumbbell Curls</option>
                </select>
              </div>
            )}
            <div className="flex-grow overflow-hidden flex items-center justify-center bg-black">
              {renderDetector()}
            </div>
          </>
        )}
      </div>

      {/* Right Side Dashboard */}
      <div className="w-1/4 bg-gray-900 border-l border-purple-700 p-4 overflow-y-auto shadow-inner">
        <SmartDashboard
          reps={reps}
          setReps={setReps}
          feedback={feedback}
          time={time}
          setTime={setTime}
          isRunning={isRunning}
          setIsRunning={setIsRunning}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route
        path="/trainer"
        element={
          <ProtectedRoute>
            <MainTrainer />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
