import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '../shell/AppShell';
import { LoginPage } from '../../features/auth/LoginPage';
import { RequireAuth } from '../../features/auth/RequireAuth';
import { OverviewPage } from '../../features/overview/pages/OverviewPage';
import { LiveTrackingPage } from '../../features/tracking/pages/LiveTrackingPage';
import { TripTrackingPage } from '../../features/tracking/pages/TripTrackingPage';
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
import { AdminTeamPage } from '../../features/admin/pages/AdminTeamPage';
import { AdminMemberDetailsPage } from '../../features/admin/pages/AdminMemberDetailsPage';
import { RolesPermissionsPage } from '../../features/admin/pages/RolesPermissionsPage';
import { AuditTrailPage } from '../../features/admin/pages/AuditTrailPage';
import { SettlementsPage } from '../../features/settlements/pages/SettlementsPage';
import { CarrierSettlementsPage } from '../../features/carrier-settlements/pages/CarrierSettlementsPage';
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
import { DriverDetailsPage } from '../../features/fleet/pages/DriverDetailsPage';
import { CityDetailsPage } from '../../features/geo/pages/CityDetailsPage';
import { StationDetailsPage } from '../../features/geo/pages/StationDetailsPage';
import { AmenityDetailsPage } from '../../features/geo/pages/AmenityDetailsPage';
import { RouteDetailsPage } from '../../features/network/pages/RouteDetailsPage';
import { CouponDetailsPage } from '../../features/coupons/pages/CouponDetailsPage';
import { RefundDetailsPage } from '../../features/refunds/pages/RefundDetailsPage';
import { SettlementDetailsPage } from '../../features/settlements/pages/SettlementDetailsPage';
import { CarrierSettlementDetailsPage } from '../../features/carrier-settlements/pages/CarrierSettlementDetailsPage';

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
      // Live tracking (driver GPS, polled)
      {
        path: 'tracking',
        element: <LiveTrackingPage />,
      },
      {
        path: 'tracking/trips/:tripId',
        element: <TripTrackingPage />,
      },
      // Legacy fixture route: tracking is per trip now (a vehicle id cannot be mapped to its live trip).
      {
        path: 'tracking/vehicles/:vehicleId',
        element: <Navigate to="/tracking" replace />,
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
      { path: 'marketing/coupons/:id', element: <CouponDetailsPage /> },
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
      { path: 'network/routes/:id', element: <RouteDetailsPage /> },
      { path: 'network/trips', element: <TripsListPage /> },
      { path: 'network/trips/:id', element: <TripDetailPage /> },
      // geo + fleet
      { path: 'network/cities', element: <CitiesPage /> },
      { path: 'network/cities/:id', element: <CityDetailsPage /> },
      { path: 'network/stations', element: <StationsPage /> },
      { path: 'network/stations/:id', element: <StationDetailsPage /> },
      { path: 'network/amenities', element: <AmenitiesPage /> },
      { path: 'network/amenities/:id', element: <AmenityDetailsPage /> },
      { path: 'fleet/vehicles', element: <VehiclesListPage /> },
      { path: 'fleet/vehicles/new', element: <VehicleFormPage /> },
      { path: 'fleet/vehicles/:id', element: <FleetVehicleDetailsPage /> },
      { path: 'fleet/vehicles/:id/edit', element: <VehicleFormPage /> },
      { path: 'fleet/drivers', element: <DriversListPage /> },
      { path: 'fleet/drivers/:id', element: <DriverDetailsPage /> },
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
      { path: 'financials/settlements/:id', element: <SettlementDetailsPage /> },
      {
        path: 'financials/carrier-settlements',
        element: <CarrierSettlementsPage />,
      },
      { path: 'financials/carrier-settlements/:id', element: <CarrierSettlementDetailsPage /> },
      {
        path: 'refunds/queue',
        element: <RefundsQueuePage />,
      },
      {
        path: 'refunds/policies',
        element: <CancellationPoliciesPage />,
      },
      { path: 'refunds/:id', element: <RefundDetailsPage /> },
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
      { path: 'admin/roles/:id', element: <RolesPermissionsPage /> },
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
