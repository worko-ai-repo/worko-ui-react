import './App.css'
import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./Layout/Main-Layout/Layout";
import { AppProvider } from "./context/MainContext";
import PageNotFound from "@Pages/errors/404/PageNotFound";
import Loader from '@Components/Loader/Loader';

// Lazy Load Components
const Hero = lazy(() => import("@Pages/hero/Hero"));
const MockInterview = lazy(() => import("@Pages/mock-interview/MockInterview"));
const Company = lazy(() => import("@Pages/company/Company"));

// Router Configuration in JSON format
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AppProvider>
        <Layout />
      </AppProvider>
    ),
    children: [
      { index: true, element: <Suspense fallback={<Loader />}><Hero /></Suspense> },
      { path: "mock-interview", element: <Suspense fallback={<Loader />}><MockInterview /></Suspense> },
      { path: "job/*", element: <Suspense fallback={<Loader />}><Company /></Suspense> },
      { path: "referral/*", element: <Suspense fallback={<Loader />}><Company /></Suspense> },
    ],
  },
  { path: "*", element: <PageNotFound /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
