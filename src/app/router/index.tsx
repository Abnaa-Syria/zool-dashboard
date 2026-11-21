import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '../shell/AppShell';
import { LoginPage } from '../../features/auth/LoginPage';
import { RequireAuth } from '../../features/auth/RequireAuth';
import { OverviewPage } from '../../features/overview/pages/OverviewPage';
import { LiveTrackingPage } from '../../features/tracking/pages/LiveTrackingPage';
import { VehicleDetailsPage } from '../../features/tracking/pages/VehicleDetailsPage';
import { BookingsListPage } from '../../features/bookings/pages/BookingsListPage';
import { BookingDetailsPage } from '../../features/bookings/pages/BookingDetailsPage';
import { BookingActivityPage } from '../../features/bookings/pages/BookingActivityPage';
import { CarriersListPage } from '../../features/carriers/pages/CarriersListPage';
import { CarrierDetailsPage } from '../../features/carriers/pages/CarrierDetailsPage';
import { BrokersListPage } from '../../features/brokers/pages/BrokersListPage';
import { BrokerDetailsPage } from '../../features/brokers/pages/BrokerDetailsPage';
import { TravelersListPage } from '../../features/travelers/pages/TravelersListPage';
import { TravelerDetailsPage } from '../../features/travelers/pages/TravelerDetailsPage';
import { WalletsOverviewPage } from '../../features/financials/pages/WalletsOverviewPage';
import { TopUpQueuePage } from '../../features/financials/pages/TopUpQueuePage';
import { FinancialReportsPage } from '../../features/reports/pages/FinancialReportsPage';
import { RefundsQueuePage } from '../../features/refunds/pages/RefundsQueuePage';
import { CancellationPoliciesPage } from '../../features/refunds/pages/CancellationPoliciesPage';
import { DisputeDossierPage } from '../../features/refunds/pages/DisputeDossierPage';
import { AdminTeamPage } from '../../features/admin/pages/AdminTeamPage';
import { AdminMemberDetailsPage } from '../../features/admin/pages/AdminMemberDetailsPage';
import { RolesPermissionsPage } from '../../features/admin/pages/RolesPermissionsPage';
import { AuditTrailPage } from '../../features/admin/pages/AuditTrailPage';
import { SettlementsPage } from '../../features/settlements/pages/SettlementsPage';
import { GeneralSettingsPage } from '../../features/admin/pages/GeneralSettingsPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/overview" replace />,
      },
      {
        path: 'overview',
        element: <OverviewPage />,
      },
      // Operations Modules - Live Fleet GIS Tracking Module
      {
        path: 'tracking',
        element: <LiveTrackingPage />,
      },
      {
        path: 'tracking/vehicles/:vehicleId',
        element: <VehicleDetailsPage />,
      },
      // Operations Modules - Bookings & Tickets Milestone
      {
        path: 'bookings',
        element: <BookingsListPage />,
      },
      {
        path: 'bookings/:id',
        element: <BookingDetailsPage />,
      },
      {
        path: 'bookings/:id/activity',
        element: <BookingActivityPage />,
      },
      // Transport Carriers Management Module
      {
        path: 'companies',
        element: <CarriersListPage />,
      },
      {
        path: 'companies/:id',
        element: <CarrierDetailsPage />,
      },
      // Broker Offices & Travel Agencies Module
      {
        path: 'brokers',
        element: <BrokersListPage />,
      },
      {
        path: 'brokers/:id',
        element: <BrokerDetailsPage />,
      },
      {
        path: 'travelers',
        element: <TravelersListPage />,
      },
      {
        path: 'travelers/:id',
        element: <TravelerDetailsPage />,
      },
      // Financial Modules - wallets, top-up review, commission settlements (live API)
      {
        path: 'financials/wallets',
        element: <WalletsOverviewPage />,
      },
      {
        path: 'financials/topup-queue',
        element: <TopUpQueuePage />,
      },
      {
        path: 'financials/settlements',
        element: <SettlementsPage />,
      },
      {
        path: 'refunds/queue',
        element: <RefundsQueuePage />,
      },
      {
        path: 'refunds/policies',
        element: <CancellationPoliciesPage />,
      },
      {
        path: 'refunds/disputes/:ticketId',
        element: <DisputeDossierPage />,
      },
      {
        path: 'reports',
        element: <FinancialReportsPage />,
      },
      // System Administration Modules
      {
        path: 'admin/team',
        element: <AdminTeamPage />,
      },
      {
        path: 'admin/team/:id',
        element: <AdminMemberDetailsPage />,
      },
      {
        path: 'admin/roles',
        element: <RolesPermissionsPage />,
      },
      {
        path: 'admin/audit',
        element: <AuditTrailPage />,
      },
      {
        path: 'admin/settings',
        element: <GeneralSettingsPage />,
      },
      {
        path: '*',
        element: <Navigate to="/overview" replace />,
      },
    ],
  },
]);
