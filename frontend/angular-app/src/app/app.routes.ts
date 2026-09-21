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
];
