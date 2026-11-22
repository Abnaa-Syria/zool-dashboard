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
import { CustomersListPage } from '../../features/customers/pages/CustomersListPage';
import { CustomerDetailsPage } from '../../features/customers/pages/CustomerDetailsPage';
import { CouponsListPage } from '../../features/coupons/pages/CouponsListPage';
import { ContentPagesListPage } from '../../features/content/pages/ContentPagesListPage';
import { ContentEditorPage } from '../../features/content/pages/ContentEditorPage';
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
import { RoutesListPage } from '../../features/network/pages/RoutesListPage';
import { TripsListPage } from '../../features/network/pages/TripsListPage';
import { TripDetailPage } from '../../features/network/pages/TripDetailPage';
// geo + fleet
import { CitiesPage } from '../../features/geo/pages/CitiesPage';
import { StationsPage } from '../../features/geo/pages/StationsPage';
import { AmenitiesPage } from '../../features/geo/pages/AmenitiesPage';
import { VehiclesListPage } from '../../features/fleet/pages/VehiclesListPage';
import { VehicleFormPage } from '../../features/fleet/pages/VehicleFormPage';
import { FleetVehicleDetailsPage } from '../../features/fleet/pages/FleetVehicleDetailsPage';
import { DriversListPage } from '../../features/fleet/pages/DriversListPage';

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
      // customers + coupons + content
      {
        path: 'travelers',
        element: <CustomersListPage />,
      },
      {
        path: 'travelers/:id',
        element: <CustomerDetailsPage />,
      },
      {
        path: 'marketing/coupons',
        element: <CouponsListPage />,
      },
      {
        path: 'content',
        element: <ContentPagesListPage />,
      },
      {
        path: 'content/:slug',
        element: <ContentEditorPage />,
      },
      // network routes + trips
      { path: 'network/routes', element: <RoutesListPage /> },
      { path: 'network/trips', element: <TripsListPage /> },
      { path: 'network/trips/:id', element: <TripDetailPage /> },
      // geo + fleet
      { path: 'network/cities', element: <CitiesPage /> },
      { path: 'network/stations', element: <StationsPage /> },
      { path: 'network/amenities', element: <AmenitiesPage /> },
      { path: 'fleet/vehicles', element: <VehiclesListPage /> },
      { path: 'fleet/vehicles/new', element: <VehicleFormPage /> },
      { path: 'fleet/vehicles/:id', element: <FleetVehicleDetailsPage /> },
      { path: 'fleet/vehicles/:id/edit', element: <VehicleFormPage /> },
      { path: 'fleet/drivers', element: <DriversListPage /> },
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
