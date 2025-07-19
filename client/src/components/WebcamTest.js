import React, { useRef, useEffect, useState } from 'react';

export default function WebcamTest() {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err) {
        console.error('Webcam error:', err);
        setError(err.message);
      }
    };

    init();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="p-4">
      {error ? (
        <p className="text-red-500 font-bold">❌ Error: {error}</p>
      ) : (
        <video
          ref={videoRef}
          className="w-full rounded-xl border-4 border-green-500"
          autoPlay
          muted
          playsInline
        />
      )}
    </div>
  );
}
