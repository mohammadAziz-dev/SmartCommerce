import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: Dashboard,
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./features/products/pages/product-management/product-management').then(
        (m) => m.ProductManagement,
      ),
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('./features/orders/pages/order-management/order-management').then(
        (m) => m.OrderManagement,
      ),
  },
  {
    path: 'orders/:orderId',
    loadComponent: () =>
      import('./features/orders/pages/order-detail/order-detail').then((m) => m.OrderDetail),
  },
];
