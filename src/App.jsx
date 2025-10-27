// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { AuthProvider } from "./app/AuthContext";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// import MainLayout from "./layouts/MainLayout";
// import Dashboard from "./pages/Dashboard";
// import NotFound from "./pages/NotFound";
// import NotAuthorized from "./pages/NotAuthorized";
// import Login from "./pages/Login";

// import ProtectedRoute from "./routes/ProtectedRoute";
// // import { UserManagement } from "./components/users/UserManagement"; // New: Import the UserManagement component
// import RolesPermissionsPage from "./pages/RolesPermissionsPage"; // New: Import the RolesPermissionsPage
// import PermissionsPage from "./pages/PermissionsPage";
// import MenuAndPageManagement from "./pages/MenuAndPageManagement";
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// // New: Create a client for React Query. This manages caching and data state.

// import '@fortawesome/fontawesome-free/css/fontawesome.min.css';
// import '@fortawesome/fontawesome-free/css/solid.min.css';
// import '@fortawesome/fontawesome-free/css/brands.min.css'; // only if you use brands

// // (optional) import '@fortawesome/fontawesome-free/css/regular.min.css';
// import { Navigate } from "react-router-dom";
// import CapacityAlertDashboard from "./pages/CapacityAlertDashboard";
// import TechnicalKAMDashboard from "./pages/TechnicalKAMDashboard";

// import PartnerInfoDashboard from "./pages/PartnerInfoDashboard";
// import PartnerActivationDashboard from "./pages/PartnerActivationDashboard";
// import IcmpAlertDashboard from "./pages/IcmpAlertDashboard";
// import ResourceMonitor from "./pages/ResourceMonitor";

// //NTTN import
// import Reports from "./pages/Reports";
// import Survey from "./pages/Survey";
// import WorkOrder from "./pages/WorkOrder";
// import BWModify from "./pages/BWModify";
// import ShiftingCapacity from "./pages/ShiftingCapacity";
// // import Users from "./pages/Users";
// import SBU from "./pages/settings/SBU";
// import Category from "./pages/settings/Category";
// import Aggregator from "./pages/settings/Aggregator";
// import NTTN from "./pages/settings/NTTN";
// import KAM from "./pages/settings/KAM";
// import LinkType from "./pages/settings/LinkType";
// import Reason from "./pages/settings/Reason";
// import Rate from "./pages/settings/Rate";
// import BwRanges from "./pages/settings/BwRanges";
// import Client from "./pages/settings/Client";

// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       // Keep data fresh for 5 minutes by default
//       staleTime: 1000 * 60 * 5,
//     },
//   },
// });

// export default function App() {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <AuthProvider>
//         <BrowserRouter>
//         <ToastContainer
//             position="top-right"
//             autoClose={5000}
//             hideProgressBar={false}
//             newestOnTop={false}
//             closeOnClick
//             rtl={false}
//             pauseOnFocusLoss
//             draggable
//             pauseOnHover
//             theme="light"
//           />
//           <Routes>

//             {/* Root decides where to go */}
//             <Route path="/" element={<Navigate to="/login" replace />} />

//             {/* Public routes */}
//             {/* Partner-Link project routes */}
//                 <Route path="dashboard" element={<Dashboard />} />
//                 <Route path="capacity-alert" element={<CapacityAlertDashboard/>} />
//                 <Route path="technical-kam" element={<TechnicalKAMDashboard/>} />
//                 <Route path="partner-form" element={<PartnerInfoDashboard/>} />
//                 <Route path="activation-form" element={<PartnerActivationDashboard/>}/>
//                 <Route path="icmp-alert" element={<IcmpAlertDashboard/>}/>
//                 <Route path="resource" element={<ResourceMonitor/>} />
//             {/* Partner-Link project routes end */}
//             {/* NTTN project routes */}
//               <Route path='/reports' element={<Reports />} />
//               <Route path='/survey' element={<Survey />} />
//               <Route path='/work-order' element={<WorkOrder />} />
//               <Route path='/bw-modify' element={<BWModify />} />
//               <Route path='/capacity-shifting' element={<ShiftingCapacity />} />
//               {/* <Route path='/users' element={<Users />} /> */}
//               {/* Nested settings routes */}
//               <Route path='/settings/sbu' element={<SBU />} />
//               <Route path='/settings/category' element={<Category />} />
//               <Route path='/settings/aggregator' element={<Aggregator />} />
//               <Route path='/settings/nttn' element={<NTTN />} />
//               <Route path='/settings/kam' element={<KAM />} />
//               <Route path='/settings/link-type' element={<LinkType />} />
//               <Route path='/settings/reason' element={<Reason />} />
//               <Route path='/settings/rate' element={<Rate />} />
//               <Route path='/settings/bwranges' element={<BwRanges />} />
//               <Route path='/settings/client' element={<Client />} />

//             {/* NTTN project routes */}

//             <Route path="login" element={<Login />} />
//             <Route path="403" element={<NotAuthorized />} />
//             <Route path="*" element={<NotFound />} />

//             {/* Protected routes WITH MainLayout */}
//             <Route element={<ProtectedRoute />}>
//               <Route element={<MainLayout />}>
//                 <Route path="menu-page-management" element={<MenuAndPageManagement />} />
//                 {/* <Route path="users" element={<UserManagement />} /> */}
//                 <Route path="roles" element={<RolesPermissionsPage />} />
//                 <Route path="permissions" element={<PermissionsPage />} />

//               </Route>
//             </Route>
//           </Routes>
//         </BrowserRouter>
//       </AuthProvider>
//     </QueryClientProvider>
//   );
// }
import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./app/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Styling imports
import "@fortawesome/fontawesome-free/css/fontawesome.min.css";
import "@fortawesome/fontawesome-free/css/solid.min.css";
import "@fortawesome/fontawesome-free/css/brands.min.css";

// 1. Static Imports (Layouts, Contexts, non-page components)
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import NasInterface from "./pages/NasInterface";
import NasDropDevice from "./pages/NasDropDevice";

// 2. Lazy Imports for all Page Components
// Public Pages
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));
const NotAuthorized = lazy(() => import("./pages/NotAuthorized"));

// Partner-Link Project Routes
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CapacityAlertDashboard = lazy(() =>
  import("./pages/CapacityAlertDashboard")
);
const TechnicalKAMDashboard = lazy(() =>
  import("./pages/TechnicalKAMDashboard")
);
const PartnerInfoDashboard = lazy(() => import("./pages/PartnerInfoDashboard"));
const PartnerActivationDashboard = lazy(() =>
  import("./pages/PartnerActivationDashboard")
);
const IcmpAlertDashboard = lazy(() => import("./pages/IcmpAlertDashboard"));
const ResourceMonitor = lazy(() => import("./pages/ResourceMonitor"));

// NTTN Project Routes
const Reports = lazy(() => import("./pages/Reports"));
const Survey = lazy(() => import("./pages/Survey"));
const WorkOrder = lazy(() => import("./pages/WorkOrder"));
const BWModify = lazy(() => import("./pages/BWModify"));
const ShiftingCapacity = lazy(() => import("./pages/ShiftingCapacity"));
// const Users = lazy(() => import("./pages/Users")); // Assuming Users is a component that needs lazy loading

// Settings Pages
const SBU = lazy(() => import("./pages/settings/SBU"));
const Category = lazy(() => import("./pages/settings/Category"));
const Aggregator = lazy(() => import("./pages/settings/Aggregator"));
const NTTN = lazy(() => import("./pages/settings/NTTN"));
const KAM = lazy(() => import("./pages/settings/KAM"));
const LinkType = lazy(() => import("./pages/settings/LinkType"));
const Reason = lazy(() => import("./pages/settings/Reason"));
const Rate = lazy(() => import("./pages/settings/Rate"));
const BwRanges = lazy(() => import("./pages/settings/BwRanges"));
const Client = lazy(() => import("./pages/settings/Client"));

// Protected Pages
const UserManagement = lazy(() => import("./components/users/UserManagement"));
const RolesPermissionsPage = lazy(() => import("./pages/RolesPermissionsPage"));
const PermissionsPage = lazy(() => import("./pages/PermissionsPage"));
const MenuAndPageManagement = lazy(() =>
  import("./pages/MenuAndPageManagement")
);

const NasInterfacePage = lazy(() => import("./pages/NasInterface"));
const NasDropDevicePage = lazy(() => import("./pages/NasDropDevice"));

// React Query Client Setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Keep data fresh for 5 minutes by default
      staleTime: 1000 * 60 * 5,
    },
  },
});

/**
 * Loading fallback component for lazy-loaded routes.
 * A simple element is used here, but a complex spinner is often preferred.
 */
const LoadingFallback = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh", // Takes up the full height of the viewport
      width: "100vw", // Takes up the full width of the viewport
      position: "fixed", // Fixed position ensures it covers the whole screen
      top: 0,
      left: 0,
      backgroundColor: "rgba(255, 255, 255, 0.8)", // Semi-transparent background
      zIndex: 9999, // Ensure it's on top of everything
    }}>
    {/* Pure CSS Spinner */}
    <style>
      {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spinner {
          border: 4px solid #f3f3f3; /* Light grey */
          border-top: 4px solid #3498db; /* Blue */
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }
      `}
    </style>
    <div className='spinner'></div>
  </div>
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <ToastContainer
            position='top-right'
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme='light'
          />
          {/* 3. Wrap all Routes in Suspense */}
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Root decides where to go */}
              <Route path='/' element={<Navigate to='/login' replace />} />

              {/* Public routes */}

              <Route path='login' element={<Login />} />
              <Route path='403' element={<NotAuthorized />} />
              <Route path='*' element={<NotFound />} />

              {/* Protected routes WITH MainLayout */}
              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  {/* Partner-Link project routes */}
                  <Route path='dashboard' element={<Dashboard />} />
                  <Route
                    path='capacity-alert'
                    element={<CapacityAlertDashboard />}
                  />
                  <Route
                    path='technical-kam'
                    element={<TechnicalKAMDashboard />}
                  />
                  <Route
                    path='partner-form'
                    element={<PartnerInfoDashboard />}
                  />
                  <Route
                    path='activation-form'
                    element={<PartnerActivationDashboard />}
                  />
                  <Route path='icmp-alert' element={<IcmpAlertDashboard />} />
                  <Route path='resource' element={<ResourceMonitor />} />
                  <Route path='nas-interface' element={<NasInterface />} />
                  <Route path='nas-drop-device' element={<NasDropDevice />} />
                  {/* Partner-Link project routes end */}

                  {/* NTTN project routes */}
                  <Route path='/reports' element={<Reports />} />
                  <Route path='/survey' element={<Survey />} />
                  <Route path='/work-order' element={<WorkOrder />} />
                  <Route path='/bw-modify' element={<BWModify />} />
                  <Route
                    path='/capacity-shifting'
                    element={<ShiftingCapacity />}
                  />
                  {/* <Route path='/users' element={<Users />} /> */}

                  {/* Nested settings routes */}
                  <Route path='/settings/sbu' element={<SBU />} />
                  <Route path='/settings/category' element={<Category />} />
                  <Route path='/settings/aggregator' element={<Aggregator />} />
                  <Route path='/settings/nttn' element={<NTTN />} />
                  <Route path='/settings/kam' element={<KAM />} />
                  <Route path='/settings/link-type' element={<LinkType />} />
                  <Route path='/settings/reason' element={<Reason />} />
                  <Route path='/settings/rate' element={<Rate />} />
                  <Route path='/settings/bwranges' element={<BwRanges />} />
                  <Route path='/settings/client' element={<Client />} />

                  {/* NTTN project routes */}
                  <Route
                    path='page-management'
                    element={<MenuAndPageManagement />}
                  />
                  <Route path='users' element={<UserManagement />} />
                  <Route path='roles' element={<RolesPermissionsPage />} />
                  <Route path='permissions' element={<PermissionsPage />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
