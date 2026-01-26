import { Routes, Route } from "react-router";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import MapPage from "./pages/Map/MapPage.jsx";
import ProfilePage from "./pages/Profile/ProfilePage.jsx";
import LeaderboardPage from "./pages/LeaderboardPage.jsx";
import ForumPage from "./pages/Forum/ForumPage.jsx";
import ChecklistPage from "./pages/Checklist/ChecklistPage.jsx";
import Register from "./pages/Register.jsx";
import SignIn from "./pages/SignIn.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import NotFound from "./pages/NotFound.jsx";
import FriendProfilePage from "./pages/FriendProfile/FriendProfilePage.jsx";

const App = () => {
  return (
    <div>
      <Toaster />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/map" element={<MapPage />} />
            <Route path="/checklist" element={<ChecklistPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/:userId" element={<FriendProfilePage />} />
            <Route path="/forum" element={<ForumPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default App;
