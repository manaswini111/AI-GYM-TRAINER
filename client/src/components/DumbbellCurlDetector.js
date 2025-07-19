import React, { useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs-core';
import * as posedetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';

export default function DumbbellCurlWebcam({ isRunning, setReps, setFeedback, setCalories }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const rafId = useRef(null);
  const directionRef = useRef('down');
  const lastFeedbackRef = useRef('Waiting...');

  const calculateAngle = (a, b, c) => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180) angle = 360 - angle;
    return angle;
  };

  const flipX = (kp, canvasWidth) => ({ ...kp, x: canvasWidth - kp.x });

  const drawSkeleton = (keypoints, ctx) => {
    const adjacentPairs = posedetection.util.getAdjacentPairs(posedetection.SupportedModels.MoveNet);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const canvasWidth = ctx.canvas.width;
    const flippedKeypoints = keypoints.map(kp => flipX(kp, canvasWidth));

    flippedKeypoints.forEach(kp => {
      if (kp.score > 0.4) {
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = '#00FF00';
        ctx.fill();
      }
    });

    adjacentPairs.forEach(([i, j]) => {
      const kp1 = flippedKeypoints[i];
      const kp2 = flippedKeypoints[j];
      if (kp1.score > 0.4 && kp2.score > 0.4) {
        ctx.beginPath();
        ctx.moveTo(kp1.x, kp1.y);
        ctx.lineTo(kp2.x, kp2.y);
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  };

  const drawFeedback = (ctx, text, color, angle) => {
    const x = ctx.canvas.width / 2;
    const y = 40;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x - 160, 10, 320, 80);

    ctx.fillStyle = color;
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y + 15);

    if (angle !== null) {
      ctx.fillStyle = 'white';
      ctx.font = '20px Arial';
      ctx.fillText(`Angle: ${Math.round(angle)}°`, x, y + 45);
    }
  };

  const detectPose = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const poses = await detectorRef.current.estimatePoses(video);
    if (!poses.length) {
      drawFeedback(ctx, lastFeedbackRef.current, 'gray', null);
      rafId.current = requestAnimationFrame(detectPose);
      return;
    }

    const keypoints = poses[0].keypoints;
    const canvasWidth = canvas.width;
    const flippedKeypoints = keypoints.map(kp => flipX(kp, canvasWidth));

    drawSkeleton(keypoints, ctx);

    const shoulder = flippedKeypoints[6];
    const elbow = flippedKeypoints[8];
    const wrist = flippedKeypoints[10];

    let feedbackText = 'Waiting...';
    let color = 'gray';
    let angle = 0;

    if ([shoulder, elbow, wrist].every(kp => kp.score > 0.4)) {
      angle = calculateAngle(shoulder, elbow, wrist);

      if (angle < 40) {
        feedbackText = '✓ CURL COMPLETE';
        color = '#22c55e';
        if (directionRef.current === 'down') {
          directionRef.current = 'up';
        }
      } else if (angle >= 140 && directionRef.current === 'up') {
        directionRef.current = 'down';
        if (setReps) setReps(prev => prev + 1);
        if (setCalories) setCalories(prev => parseFloat((prev + 0.2).toFixed(2)));
      } else if (angle < 100) {
        feedbackText = '⬆ MOVE UP';
        color = '#facc15';
      } else {
        feedbackText = '⬇ EXTEND FULLY';
        color = '#ef4444';
      }
    }

    lastFeedbackRef.current = feedbackText;
    if (setFeedback) setFeedback(feedbackText);
    drawFeedback(ctx, feedbackText, color, angle);

    rafId.current = requestAnimationFrame(detectPose);
  };

  useEffect(() => {
    const loadModel = async () => {
      await tf.setBackend('webgl');
      await tf.ready();

      const detector = await posedetection.createDetector(posedetection.SupportedModels.MoveNet, {
        modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      });
      detectorRef.current = detector;

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = videoRef.current;
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play();
        if (isRunning) rafId.current = requestAnimationFrame(detectPose);
      };
    };

    loadModel();

    return () => {
      cancelAnimationFrame(rafId.current);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (isRunning) {
      rafId.current = requestAnimationFrame(detectPose);
    } else {
      cancelAnimationFrame(rafId.current);
    }
  }, [isRunning]);

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        className="w-full h-full object-cover rounded-xl"
        style={{ transform: 'scaleX(-1)' }}
        autoPlay
        muted
        playsInline
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />
    </div>
  );
}
