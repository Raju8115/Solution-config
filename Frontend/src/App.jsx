import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContexts';
import ProtectedRoute from './components/ProtectedRoute';
import { OfferingsCatalog } from './components/OfferingsCatalog';
import { OfferingDetail } from './components/OfferingDetail';
import { SolutionBuilder } from './components/SolutionBuilder';
import { UserProfile } from './components/UserProfile';
import { CarbonHeader } from './components/CarbonHeader';

// ADMIN IMPORTS
import { AdminLayout } from './components/AdminComponents/AdminLayout';
import { BrandList } from './components/AdminComponents/BrandList';
import { BrandForm } from './components/AdminComponents/BrandForm';
import { ProductList } from './components/AdminComponents/ProductList';
import { ProductForm } from './components/AdminComponents/ProductForm';
import { CountryList } from './components/AdminComponents/CountryList';
import { CountryForm } from './components/AdminComponents/CountryForm';
import { OfferingsList } from './components/AdminComponents/OfferingList';
import { OfferingForm } from './components/AdminComponents/OfferingForm';
import { ActivityList } from './components/AdminComponents/ActivityList';
import { ActivityForm } from './components/AdminComponents/ActivityForm';
import { PricingList } from './components/AdminComponents/PricingList';
import { PricingForm } from './components/AdminComponents/PricingForm';
import { StaffingList } from './components/AdminComponents/StaffingList';
import { StaffingForm } from './components/AdminComponents/StaffingForm';
import { WBSList } from './components/AdminComponents/WBSList';
import { WBSForm } from './components/AdminComponents/WBSForm';

const AuthenticatedLayout = ({ children }) => {
  const { logout, userRole, changeRole, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/'); // fallback safeguard
    }
  }, [isAuthenticated, navigate]);

  return (
    <>
      <CarbonHeader currentPage="catalog" />
      {children}
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Route */}
          {/* <Route path="/login" element={<LoginPage />} /> */}

          {/* Catalog - All authenticated users */}
          <Route
            path="/catalog"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <OfferingsCatalog />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          {/* Offering Detail - All authenticated users */}
          <Route
            path="/offering/:offeringId"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <OfferingDetail />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          {/* Solution Builder - Solution Architects & Admins only */}
          <Route
            path="/solution-builder"
            element={
              <ProtectedRoute requireSolutionArchitect>
                <AuthenticatedLayout>
                  <SolutionBuilder />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          {/* User Profile - All authenticated users */}
          <Route
            path="/user-profile"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <UserProfile />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes - Admins only */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AuthenticatedLayout>
                  <AdminLayout />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          >
            {/* Default redirect */}
            {/* <Route index element={<Navigate to="/admin/brands" replace />} /> */}

            {/* Brands */}
            <Route path="brands" index element={<BrandList />} />
            <Route path="brands/create" element={<BrandForm />} />
            <Route path="brands/edit/:brandId" element={<BrandForm />} />

            {/* Products */}
            <Route path="products" element={<ProductList />} />
            <Route path="products/create" element={<ProductForm />} />
            <Route path="products/edit/:productId" element={<ProductForm />} />

            {/* Countries */}
            <Route path="countries" element={<CountryList />} />
            <Route path="countries/create" element={<CountryForm />} />
            <Route path="countries/edit/:countryId" element={<CountryForm />} />

            {/* Offerings */}
            <Route path="offerings" element={<OfferingsList />} />
            <Route path="offerings/create" element={<OfferingForm />} />
            <Route path="offerings/edit/:offeringId" element={<OfferingForm />} />

            {/* Activities */}
            <Route path="activities" element={<ActivityList />} />
            <Route path="activities/create" element={<ActivityForm />} />
            <Route path="activities/edit/:activityId" element={<ActivityForm />} />

            {/* Pricing */}
            <Route path="pricing" element={<PricingList />} />
            <Route path="pricing/create" element={<PricingForm />} />
            <Route path="pricing/edit/:country/:role/:band" element={<PricingForm />} />

            {/* Staffing */}
            <Route path="staffing" element={<StaffingList />} />
            <Route path="staffing/create" element={<StaffingForm />} />
            <Route path="staffing/edit/:staffingId" element={<StaffingForm />} />

            {/* WBS */}
            <Route path="wbs" element={<WBSList />} />
            <Route path="wbs/create" element={<WBSForm />} />
            <Route path="wbs/edit/:wbsId" element={<WBSForm />} />
          </Route>

          {/* Default redirects */}
          <Route path="/" element={<Navigate to="/catalog" replace />} />
          <Route path="*" element={<Navigate to="/catalog" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
