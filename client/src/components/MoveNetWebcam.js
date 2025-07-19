import React, { useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs-core';
import * as posedetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';

export default function MoveNetWebcam({ isRunning, setReps, setFeedback }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const rafId = useRef(null);
  const directionRef = useRef('up');
  const lastFeedbackRef = useRef('Waiting...');
  const wasCorrectRef = useRef(false);

  const calculateAngle = (a, b, c) => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180) angle = 360 - angle;
    return angle;
  };

  const flipX = (kp, canvasWidth) => ({ ...kp, x: canvasWidth - kp.x });

  const drawSkeleton = (keypoints, ctx) => {
    const adjacentPairs = posedetection.util.getAdjacentPairs(
      posedetection.SupportedModels.MoveNet
    );
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const canvasWidth = ctx.canvas.width;
    const flippedKeypoints = keypoints.map((kp) => flipX(kp, canvasWidth));

    flippedKeypoints.forEach((kp) => {
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

  const drawFeedback = (ctx, text, color, knee, hip) => {
    const x = ctx.canvas.width / 2;
    const y = 40;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x - 160, 10, 320, 90);

    ctx.fillStyle = color;
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y + 15);

    if (knee && hip) {
      ctx.fillStyle = 'white';
      ctx.font = '20px Arial';
      ctx.fillText(`Knee: ${Math.round(knee)}°`, x, y + 45);
      ctx.fillText(`Hip: ${Math.round(hip)}°`, x, y + 70);
    }
  };

  const detectPose = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (
      !video ||
      !detectorRef.current ||
      video.readyState !== 4 ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      rafId.current = requestAnimationFrame(detectPose);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    try {
      const poses = await detectorRef.current.estimatePoses(video);
      if (!poses.length) {
        drawFeedback(ctx, lastFeedbackRef.current, 'gray', 0, 0);
        rafId.current = requestAnimationFrame(detectPose);
        return;
      }

      const keypoints = poses[0].keypoints;
      const canvasWidth = canvas.width;
      const flippedKeypoints = keypoints.map((kp) => flipX(kp, canvasWidth));

      drawSkeleton(keypoints, ctx);

      const r_shoulder = flippedKeypoints[6];
      const r_hip = flippedKeypoints[12];
      const r_knee = flippedKeypoints[14];
      const r_ankle = flippedKeypoints[16];

      let feedbackText = 'Waiting...';
      let color = 'gray';
      let kneeAngle = 0;
      let hipAngle = 0;

      if ([r_shoulder, r_hip, r_knee, r_ankle].every((kp) => kp.score > 0.4)) {
        kneeAngle = calculateAngle(r_hip, r_knee, r_ankle);
        hipAngle = calculateAngle(r_shoulder, r_hip, r_knee);

        if (kneeAngle <= 90 && directionRef.current === 'up') {
          directionRef.current = 'down';
          wasCorrectRef.current = false;
        }

        if (
          kneeAngle >= 150 &&
          directionRef.current === 'down' &&
          wasCorrectRef.current === false
        ) {
          directionRef.current = 'up';
          if (setReps) setReps((prev) => prev + 1);
          wasCorrectRef.current = true;
        }

        if (kneeAngle > 160 && hipAngle > 160) {
          feedbackText = '✓ CORRECT';
          color = '#22c55e';
        } else if (kneeAngle > 120 && hipAngle > 120) {
          feedbackText = '⬇ MOVE DOWN';
          color = '#facc15';
        } else {
          feedbackText = '❌ WRONG';
          color = '#ef4444';
        }

        if (setFeedback) setFeedback(feedbackText);
      } else {
        feedbackText = 'Waiting...';
        color = 'gray';
        if (setFeedback) setFeedback(feedbackText);
      }

      lastFeedbackRef.current = feedbackText;
      drawFeedback(ctx, feedbackText, color, kneeAngle, hipAngle);
    } catch (err) {
      console.error('Pose detection error:', err);
    }

    rafId.current = requestAnimationFrame(detectPose);
  };

  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.setBackend('webgl');
        await tf.ready();

        const detector = await posedetection.createDetector(
          posedetection.SupportedModels.MoveNet,
          {
            modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          }
        );
        detectorRef.current = detector;

        const stream = await navigator.mediaDevices.getUserMedia({ video: true });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();

            setTimeout(() => {
              if (isRunning) {
                rafId.current = requestAnimationFrame(detectPose);
              }
            }, 500);
          };
        }
      } catch (err) {
        console.error('Error loading model or webcam:', err);
      }
    };

    loadModel();

    return () => {
      cancelAnimationFrame(rafId.current);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
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
