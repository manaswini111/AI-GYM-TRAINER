🏋️‍♀️ AI Gym Trainer (Frontend Only)
An intelligent, real-time fitness trainer that works seamlessly in your browser. Using your webcam for live workouts or uploading workout videos, this app tracks posture, counts reps, and guides you with real-time AI pose detection feedback—all without any backend setup!

🚀 Live Demo
👉 Try the Live App
(Add your deployment link here)

✨ Key Features
🎥 1. Webcam Mode (Live AI Trainer)
Real-time squat detection powered by MediaPipe BlazePose via TensorFlow.js

Smart canvas-based visual feedback displaying:

✓ CORRECT

MOVE DOWN

LEFT

RIGHT

WRONG

Live rep counter, calories burned, and workout timer

Stylish, user-friendly dashboard featuring:

🌀 Circular rep counter

🔥 Calorie tracker

⏱️ Timer

🎮 Start/Reset controls

💬 Motivational chatbot powered by Chatbase

📼 2. Video Upload Mode (Multi-Exercise Analysis)
Upload any recorded workout video and get automatic, in-browser feedback and rep counts for exercises like:

🏃‍♂️ Jumping Jacks

🤸 Lunges

💪 Push-ups

🧘 Planks

🏋️‍♀️ Squats

Ideal for reviewing past workouts or training offline, with zero data leaving your browser!

🧠 Tech Stack
Technology	Purpose
React.js	Building interactive and responsive UI
TensorFlow.js	Running ML models directly in the browser
MediaPipe BlazePose	Accurate, efficient pose estimation
Tailwind CSS	Clean, modern styling and layout
Canvas API	Drawing pose skeleton visualizations & feedback
Chatbase	Conversational AI chatbot for motivation & tips
HTML5 File Input	Enable video file uploads for offline analysis
🔒 100% frontend-only — no backend or server required!

📂 Project Structure
text
/client
  ├── public              # Static assets and HTML
  ├── src
  │   ├── components     # React components (dashboard, video player, chatbot)
  │   ├── pages          # Different app views (webcam, upload, stats)
  │   ├── styles         # Tailwind CSS integration and custom styles
  │   └── utils          # Helper functions, pose detection logic
  ├── package.json       # Frontend dependencies and scripts
  └── README.md          # This documentation
💡 How to Use
Open the app in Chrome or Firefox (recommended browsers).

Choose Webcam Mode to start real-time posture tracking or Upload Video Mode to analyze a past workout.

Follow the live feedback and improve your form with helpful chatbot tips.

Track progress with reps count, calories burned, and workout timer on the dashboard.

🙌 Contribution
Contributions are welcome!
Feel free to fork the repo, add new features or fixes, and open pull requests.

📜 License
Specify your license here (e.g., MIT License).

Built with React, AI pose detection, and a passion for fitness.
Keep training smart and safe! 💪

If you want, I can also help create a README for the full stack version or backend too.
