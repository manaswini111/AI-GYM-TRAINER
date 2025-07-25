# 💪 AI-GYM-TRAINER – Your Intelligent, Real-Time In-Browser Fitness Coach

**AI-GYM-TRAINER** is a browser-based AI fitness trainer that delivers **real-time posture correction, rep counting, and feedback** using pose estimation models—all without the need for any backend server. Built entirely with modern web technologies, this app helps users perform exercises safely and efficiently, whether through a webcam or by uploading pre-recorded videos.

---

## 🧠 Key Features

### 1. **Webcam Mode (Live AI Trainer)**

* Real-time **squat detection** and form analysis using **MediaPipe BlazePose**
* Smart **canvas-based feedback overlay**: Displays labels like `✓ CORRECT`, `MOVE DOWN`, `LEFT`, `WRONG`
* Integrated **dashboard UI** showing:

  * Circular rep counter
  * Calorie tracker
  * Workout timer
  * Start/Reset controls
* Built-in **AI chatbot** for motivational guidance and exercise tips via **Chatbase**

### 2. **Video Upload Mode (Multi-Exercise Analysis)**

* Upload pre-recorded workout videos for in-browser analysis
* Supports a variety of exercises:

  * Squats
  * Push-ups
  * Lunges
  * Jumping Jacks
  * Planks
* Provides automatic rep counting and visual form correction directly on the video

---

## 🛠️ Tech Stack

* **React.js** – Frontend UI development
* **Tailwind CSS** – Styling and responsive layout
* **TensorFlow\.js** – Running ML models directly in the browser
* **MediaPipe BlazePose** – Real-time pose detection and body keypoint tracking
* **Canvas API** – Drawing pose skeletons and feedback overlays
* **Chatbase** – AI chatbot integration for motivation and interaction
* **HTML5 File Input** – Enables offline video analysis and rep detection

---

## 🧩 Domains Covered

* **Computer Vision**: The core of the project—using pose detection and body movement analysis to interpret user exercises in real time.
* **Deep Learning**: BlazePose is built on deep learning models, deployed using TensorFlow\.js for client-side inference.
* **Artificial Intelligence**: The application mimics an intelligent trainer that responds in real time to the user's form and movements, including motivational chatbot responses.
* **Natural Language Processing**: Implemented via Chatbase to engage users through a conversational interface.
* **Data Science**: Tracks reps, calories, and session performance, helping users improve over time.

---

## 🚀 How to Run

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/AI-GYM-TRAINER.git
   cd AI-GYM-TRAINER
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

4. Open your browser and go to `http://localhost:3000`

---

## 🙌 Acknowledgements

* [TensorFlow.js](https://www.tensorflow.org/js)
* [MediaPipe BlazePose](https://google.github.io/mediapipe/solutions/pose.html)
* [Chatbase](https://www.chatbase.co/)
* [React](https://reactjs.org/)
* [Tailwind CSS](https://tailwindcss.com/)

---

## 📌 License

This project is licensed under the MIT License.

---

Let me know if you want this customized with badges, screenshots, or even a dark theme preview banner babe 🌟



