import { Route, Routes, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import MainLoader from '@Components/Loader/Loader';
import { AppProvider } from '@Context/App.context';
import DashboardLayout from '@Layouts/Dashboard/DashboardLayout';

const PageNotFound = lazy(() => import('@Pages/errors/404/PageNotFound'));
const CorporateDashboard = lazy(() => import('@Components/Dashboard/CorporateDashboard'));

const Dashboard = () => {
    return (
        <AppProvider>
            <Suspense fallback={<MainLoader />}>
                <Routes>
                    <Route path="/corporate" element={<DashboardLayout />}>
                        {/* Redirect /corporate to /corporate/home */}
                        <Route index element={<Navigate to="home" replace />} />

                        <Route path="home" element={<CorporateDashboard />} />
                        <Route path="jobs" element={<CorporateDashboard />} />
                        <Route path="applicants" element={<CorporateDashboard />} />
                        <Route path="bulk-cv-check" element={<CorporateDashboard />} />
                        <Route path="invites" element={<CorporateDashboard />} />
                        <Route path="referrals" element={<CorporateDashboard />} />
                        <Route path="support" element={<CorporateDashboard />} />
                        <Route path="*" element={<PageNotFound />} />
                    </Route>

                    <Route path="*" element={<PageNotFound />} />
                </Routes>
            </Suspense>
        </AppProvider>
    );
};

export default Dashboard;
