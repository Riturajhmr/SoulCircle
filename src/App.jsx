import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

import SoulCircleHero from "../pages/landingpage";
import LoginPage from "../pages/loginpage";
import SignupPage from "../pages/signuppage";
import QuestionsPage from "../pages/questionpages";
import DashboardPage from "../pages/dashboard";
import ProfilePage from "../pages/profile";
import FeelNotesPage from "../pages/feelnotes";
import ChatroomPage from "../pages/chatroom";
import MoodTrackerPage from "../pages/moodtracker";
import DMsPage from "../pages/dms";
import SupportCircles from "../pages/supportsCircles";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
            <Route path="/" element={<SoulCircleHero />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/questions" element={<QuestionsPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/feelnotes" element={<FeelNotesPage />} />
            <Route path="/chatroom" element={<ChatroomPage />} />
            <Route path="/moodtracker" element={<MoodTrackerPage />} />
            <Route path="/dms" element={<DMsPage />} />
            <Route path="/supportcircles" element={<SupportCircles />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
