import { Routes, Route } from "react-router-dom";
import AuroraBackground from "./components/AuroraBackground";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import RequireAuth from "./components/RequireAuth";
import { AuthProvider } from "./context/AuthContext";

import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import OrdersPage from "./pages/OrdersPage";
import ProductsPage from "./pages/ProductsPage";
import ReviewsPage from "./pages/ReviewsPage";

function DashboardLayout({ children }) {
  return (
    <RequireAuth>
      <NavBar />
      {children}
    </RequireAuth>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div className="relative flex min-h-screen flex-col">
        <AuroraBackground />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <DashboardLayout>
                <MainPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/analytics"
            element={
              <DashboardLayout>
                <AnalyticsPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/orders"
            element={
              <DashboardLayout>
                <OrdersPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/products"
            element={
              <DashboardLayout>
                <ProductsPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/reviews"
            element={
              <DashboardLayout>
                <ReviewsPage />
              </DashboardLayout>
            }
          />
        </Routes>
        <Footer />
      </div>
    </AuthProvider>
  );
}
