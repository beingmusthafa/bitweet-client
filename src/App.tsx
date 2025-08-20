import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/global/ProtectedRoute";
import ProfilePage from "./pages/ProfilePage";
import PeoplePage from "./pages/PeoplePage";
import FeedPage from "./pages/FeedPage";
import NotificationsPage from "./pages/NotificationsPage";
import AudioRoomPage from "./pages/AudioRoomPage";
import AudioRoomDetailPage from "./pages/AudioRoomDetailPage";
import MainLayout from "./components/global/MainLayout";

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/profile" replace />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="people" element={<PeoplePage />} />
            <Route path="feed" element={<FeedPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="audioroom" element={<AudioRoomPage />} />
            <Route path="audioroom/:roomId" element={<AudioRoomDetailPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/profile" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}
