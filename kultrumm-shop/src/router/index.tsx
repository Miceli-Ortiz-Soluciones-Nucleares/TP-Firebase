import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
import { ProtectedRoute } from '../components/layout/ProtectedRoute'
import { CatalogPage } from '../components/catalog/CatalogPage'
import { CartPage } from '../components/cart/CartPage'
import { OrderConfirmationPage } from '../components/checkout/OrderConfirmationPage'
import { LoginPage } from '../components/admin/LoginPage'
import { AdminProductsPage } from '../components/admin/AdminProductsPage'
import { AdminOrdersPage } from '../components/admin/AdminOrdersPage'
import { AdminDashboardPage } from '../components/admin/AdminDashboardPage'
import { NotFoundPage } from '../components/ui/NotFoundPage'

const RootLayout = () => (
  <div className="flex min-h-screen flex-col bg-[#121212]">
    <Header />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
)

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true,              element: <CatalogPage /> },
      { path: 'carrito',          element: <CartPage /> },
      { path: 'orden/:id',        element: <OrderConfirmationPage /> },
      { path: 'login',            element: <LoginPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'admin',           element: <AdminProductsPage /> },
          { path: 'admin/compras',   element: <AdminOrdersPage /> },
          { path: 'admin/dashboard', element: <AdminDashboardPage /> },
        ],
      },
      { path: '*',                element: <NotFoundPage /> },
    ],
  },
])

export const AppRouter = () => <RouterProvider router={router} />
