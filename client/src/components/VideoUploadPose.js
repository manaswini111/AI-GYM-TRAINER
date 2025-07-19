// src/components/VideoUploadPose.js
import React, { useRef, useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as posedetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';

export default function VideoUploadPose({ setReps, setFeedback }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const rafId = useRef(null);

  const [videoFile, setVideoFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [exercise, setExercise] = useState('squats');

  const directionRef = useRef('up');
  const wasCorrectRef = useRef(false);

  const calculateAngle = (a, b, c) => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    return angle > 180 ? 360 - angle : angle;
  };

  const drawSkeleton = (keypoints, ctx, scaleX, scaleY, offsetX, offsetY) => {
    const adjacentPairs = posedetection.util.getAdjacentPairs(
      posedetection.SupportedModels.MoveNet
    );
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    keypoints.forEach((kp) => {
      if (kp.score > 0.4) {
        ctx.beginPath();
        ctx.arc(kp.x * scaleX + offsetX, kp.y * scaleY + offsetY, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#00FF00';
        ctx.fill();
      }
    });

    adjacentPairs.forEach(([i, j]) => {
      const kp1 = keypoints[i], kp2 = keypoints[j];
      if (kp1.score > 0.4 && kp2.score > 0.4) {
        ctx.beginPath();
        ctx.moveTo(kp1.x * scaleX + offsetX, kp1.y * scaleY + offsetY);
        ctx.lineTo(kp2.x * scaleX + offsetX, kp2.y * scaleY + offsetY);
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  };

  const drawFeedback = (ctx, text, color, a1 = 0, a2 = 0) => {
    const x = ctx.canvas.width / 2;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(x - 160, 10, 320, 70);
    ctx.fillStyle = color;
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, x, 35);
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Inter, sans-serif';
    if (a1) ctx.fillText(`Angle 1: ${Math.round(a1)}°`, x, 55);
    if (a2) ctx.fillText(`Angle 2: ${Math.round(a2)}°`, x, 72);
  };

  const detectFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!video || video.paused || video.ended || !detectorRef.current) {
      rafId.current = requestAnimationFrame(detectFrame);
      return;
    }

    const poses = await detectorRef.current.estimatePoses(video);
    if (!poses.length) {
      rafId.current = requestAnimationFrame(detectFrame);
      return;
    }

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const videoAspect = videoWidth / videoHeight;
    const canvasAspect = canvasWidth / canvasHeight;

    let drawWidth, drawHeight, offsetX, offsetY;
    if (videoAspect > canvasAspect) {
      drawWidth = canvasWidth;
      drawHeight = canvasWidth / videoAspect;
      offsetX = 0;
      offsetY = (canvasHeight - drawHeight) / 2;
    } else {
      drawHeight = canvasHeight;
      drawWidth = canvasHeight * videoAspect;
      offsetX = (canvasWidth - drawWidth) / 2;
      offsetY = 0;
    }

    const scaleX = drawWidth / videoWidth;
    const scaleY = drawHeight / videoHeight;

    const keypoints = poses[0].keypoints;
    drawSkeleton(keypoints, ctx, scaleX, scaleY, offsetX, offsetY);

    switch (exercise) {
      case 'squats': detectSquat(keypoints, ctx); break;
      case 'pushups': detectPushUp(keypoints, ctx); break;
      case 'lunges': detectLunge(keypoints, ctx); break;
      case 'plank': detectPlank(keypoints, ctx); break;
      case 'jumpingjacks': detectJumpingJack(keypoints, ctx); break;
      default: drawFeedback(ctx, 'Waiting...', '#aaa');
    }

    rafId.current = requestAnimationFrame(detectFrame);
  };

  // --- EXERCISE LOGICS (from Code 1) ---
  const detectSquat = (k, ctx) => {
    const [r_shoulder, r_hip, r_knee, r_ankle] = [k[6], k[12], k[14], k[16]];
    if ([r_shoulder, r_hip, r_knee, r_ankle].every(p => p.score > 0.4)) {
      const kneeAngle = calculateAngle(r_hip, r_knee, r_ankle);
      const hipAngle = calculateAngle(r_shoulder, r_hip, r_knee);
      let feedbackText = 'Waiting...', color = 'gray';

      if (kneeAngle <= 100 && directionRef.current === 'up') {
        directionRef.current = 'down';
        wasCorrectRef.current = false;
      }

      if (kneeAngle >= 160 && directionRef.current === 'down' && !wasCorrectRef.current) {
        directionRef.current = 'up';
        setReps(prev => prev + 1);
        wasCorrectRef.current = true;
      }

      if (kneeAngle >= 80 && kneeAngle <= 100 && hipAngle >= 70 && hipAngle <= 100) {
        feedbackText = '✓ CORRECT';
        color = '#22c55e';
      } else if (kneeAngle >= 100 && hipAngle >= 100) {
        feedbackText = '⬇ MOVE DOWN';
        color = '#facc15';
      } else {
        feedbackText = '❌ WRONG';
        color = '#ef4444';
      }

      setFeedback(feedbackText);
      drawFeedback(ctx, feedbackText, color, kneeAngle, hipAngle);
    }
  };

  const detectPushUp = (k, ctx) => {
    const [r_shoulder, r_elbow, r_wrist, r_hip] = [k[6], k[8], k[10], k[12]];
    if ([r_shoulder, r_elbow, r_wrist, r_hip].every(p => p.score > 0.4)) {
      const elbowAngle = calculateAngle(r_shoulder, r_elbow, r_wrist);
      const bodyAngle = calculateAngle(r_shoulder, r_hip, k[14]);

      let feedbackText = 'Waiting...', color = 'gray';

      if (elbowAngle <= 90 && directionRef.current === 'up') {
        directionRef.current = 'down';
        wasCorrectRef.current = false;
      }

      if (elbowAngle >= 160 && directionRef.current === 'down' && !wasCorrectRef.current) {
        directionRef.current = 'up';
        setReps(prev => prev + 1);
        wasCorrectRef.current = true;
      }

      if (elbowAngle <= 90) {
        feedbackText = '⬇ LOWER';
        color = '#facc15';
      } else if (elbowAngle >= 160) {
        feedbackText = '✓ CORRECT';
        color = '#22c55e';
      } else {
        feedbackText = '❌ BAD FORM';
        color = '#ef4444';
      }

      setFeedback(feedbackText);
      drawFeedback(ctx, feedbackText, color, elbowAngle, bodyAngle);
    }
  };

  const detectLunge = (k, ctx) => {
    const [r_hip, r_knee, r_ankle] = [k[12], k[14], k[16]];
    if ([r_hip, r_knee, r_ankle].every(p => p.score > 0.4)) {
      const angle = calculateAngle(r_hip, r_knee, r_ankle);
      let feedbackText = angle < 90 ? '⬇ GO LOWER' : angle > 160 ? '✓ GOOD' : '❌ BAD FORM';
      let color = angle < 90 ? '#facc15' : angle > 160 ? '#22c55e' : '#ef4444';

      if (angle <= 100 && directionRef.current === 'up') {
        directionRef.current = 'down';
        wasCorrectRef.current = false;
      }

      if (angle >= 160 && directionRef.current === 'down' && !wasCorrectRef.current) {
        directionRef.current = 'up';
        setReps(prev => prev + 1);
        wasCorrectRef.current = true;
      }

      setFeedback(feedbackText);
      drawFeedback(ctx, feedbackText, color, angle, 0);
    }
  };

  const detectPlank = (k, ctx) => {
    const [shoulder, hip, ankle] = [k[6], k[12], k[16]];
    if ([shoulder, hip, ankle].every(p => p.score > 0.4)) {
      const angle = calculateAngle(shoulder, hip, ankle);
      const good = angle > 160;
      const feedbackText = good ? '✓ GOOD PLANK' : '❌ SAGGING';
      const color = good ? '#22c55e' : '#ef4444';
      setFeedback(feedbackText);
      drawFeedback(ctx, feedbackText, color, angle, 0);
    }
  };

  const detectJumpingJack = (k, ctx) => {
    const [r_wrist, r_shoulder, r_hip] = [k[10], k[6], k[12]];
    if ([r_wrist, r_shoulder, r_hip].every(p => p.score > 0.4)) {
      const handAbove = r_wrist.y < r_shoulder.y;
      const feetApart = Math.abs(k[16].x - k[15].x) > 100;
      const good = handAbove && feetApart;

      if (good && directionRef.current === 'in') {
        directionRef.current = 'out';
        wasCorrectRef.current = false;
      }

      if (!good && directionRef.current === 'out' && !wasCorrectRef.current) {
        directionRef.current = 'in';
        setReps(prev => prev + 1);
        wasCorrectRef.current = true;
      }

      const feedbackText = good ? '✓ GOOD' : '❌ NOT FULLY OPEN';
      const color = good ? '#22c55e' : '#ef4444';
      setFeedback(feedbackText);
      drawFeedback(ctx, feedbackText, color);
    }
  };

  const startDetection = async () => {
    if (!videoRef.current) return;
    await tf.setBackend('webgl');
    await tf.ready();
    detectorRef.current = await posedetection.createDetector(
      posedetection.SupportedModels.MoveNet,
      { modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
    );
    videoRef.current.play();
    setAnalyzing(true);
    rafId.current = requestAnimationFrame(detectFrame);
  };

  const pauseDetection = () => {
    videoRef.current.pause();
    setAnalyzing(false);
    cancelAnimationFrame(rafId.current);
  };

  useEffect(() => {
    return () => cancelAnimationFrame(rafId.current);
  }, []);

  return (
    <div className="flex flex-col items-center justify-start w-full min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 p-6 text-white font-inter">
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6">
        <select
          value={exercise}
          onChange={(e) => {
            setExercise(e.target.value);
            setReps(0);
            setFeedback('Waiting...');
            directionRef.current = 'up';
          }}
          className="px-4 py-2 rounded-md bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="squats">Squats</option>
          <option value="pushups">Push-Ups</option>
          <option value="lunges">Lunges</option>
          <option value="plank">Plank</option>
          <option value="jumpingjacks">Jumping Jacks</option>
        </select>

        {!analyzing ? (
          <button
            onClick={startDetection}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-all"
          >
            Start Analysis
          </button>
        ) : (
          <button
            onClick={pauseDetection}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md transition-all"
          >
            Pause
          </button>
        )}
      </div>

      {!videoFile && (
        <label className="mb-6 inline-block text-center">
          <span className="text-slate-300 mb-2 block">Choose a video file</span>
          <input
            type="file"
            accept="video/*"
            className="block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-white hover:file:bg-slate-600 cursor-pointer"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) setVideoFile(URL.createObjectURL(file));
            }}
          />
        </label>
      )}

      {videoFile && (
        <div className="relative w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden shadow-xl border border-slate-700">
          <video
            ref={videoRef}
            src={videoFile}
            controls
            className="w-full h-full object-contain"
            onLoadedData={() => {
              setTimeout(() => {
                if (canvasRef.current && videoRef.current) {
                  const canvas = canvasRef.current;
                  const rect = canvas.getBoundingClientRect();
                  canvas.width = rect.width;
                  canvas.height = rect.height;
                }
              }, 300);
            }}
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          />
        </div>
      )}
    </div>
  );
}
