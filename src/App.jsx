import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import SoulCircleHero from "../pages/LandingPage";
import LoginPage from "../pages/loginpage";
import SignupPage from "../pages/signuppage";
import QuestionsPage from "../pages/questionpages";
import WelcomePage from "../pages/welcome";
import DashboardPage from "../pages/dashboard";
import FeelNotesPage from "../pages/feelnotes";
import ChatroomPage from "../pages/chatroom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SoulCircleHero />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/questions" element={<QuestionsPage />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/feelnotes" element={<FeelNotesPage />} />
        <Route path="/chatroom" element={<ChatroomPage />} />
      </Routes>
    </Router>
  );
}

export default App;
