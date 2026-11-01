import { Routes } from '@angular/router';

export const routes: Routes = [
  // Authentication Route
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(m => m.LoginComponent)
  },

  // Main Application Layout Shell with Header, Sidebar, and Footer
  {
    path: '',
    loadComponent: () =>
      import('./components/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: 'app',
        redirectTo: 'users',
        pathMatch: 'full'
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./components/administrator/user-management/user-management.component').then(m => m.UserManagementComponent)
      },
      {
        path: 'departments',
        loadComponent: () =>
          import('./components/administrator/department-management/department-management.component').then(m => m.DepartmentManagementComponent)
      },
      {
        path: 'units',
        loadComponent: () =>
          import('./components/material-management/unit/unit.component').then(m => m.UnitComponent)
      },
      {
        path: 'unit',
        redirectTo: 'units',
        pathMatch: 'full'
      },
      {
        path: 'materials',
        loadComponent: () =>
          import('./components/material-management/material/material.component').then(m => m.MaterialComponent)
      },
      {
        path: 'material',
        redirectTo: 'materials',
        pathMatch: 'full'
      },
      {
        path: 'material-categories',
        loadComponent: () =>
          import('./components/material-management/material-category/material-category.component').then(m => m.MaterialCategoryComponent)
      },
      {
        path: 'material-category',
        redirectTo: 'material-categories',
        pathMatch: 'full'
      },
      {
        path: 'suppliers',
        loadComponent: () =>
          import('./components/supplier-procurement/supplier/supplier.component').then(m => m.SupplierComponent)
      },
      {
        path: 'supplier',
        redirectTo: 'suppliers',
        pathMatch: 'full'
      },
      {
        path: 'purchase-orders',
        loadComponent: () =>
          import('./components/supplier-procurement/purchase-order/purchase-order.component').then(m => m.PurchaseOrderComponent)
      },
      {
        path: 'purchase-order',
        redirectTo: 'purchase-orders',
        pathMatch: 'full'
      },
      {
        path: 'purchase-payments',
        loadComponent: () =>
          import('./components/supplier-procurement/purchase-payment/purchase-payment.component').then(m => m.PurchasePaymentComponent)
      },
      {
        path: 'purchase-payment',
        redirectTo: 'purchase-payments',
        pathMatch: 'full'
      },
      {
        path: '',
        redirectTo: 'users',
        pathMatch: 'full'
      }
    ]
  },

  // Standalone Component Previews (Developer routes)
  {
    path: 'header',
    loadComponent: () =>
      import('./components/header/header.component').then(m => m.HeaderComponent)
  },
  {
    path: 'sidebar',
    loadComponent: () =>
      import('./components/sidebar/sidebar.component').then(m => m.SidebarComponent)
  },
  {
    path: 'footer',
    loadComponent: () =>
      import('./components/footer/footer.component').then(m => m.FooterComponent)
  },
  {
    path: 'department-management',
    loadComponent: () =>
      import('./components/administrator/department-management/department-management.component').then(m => m.DepartmentManagementComponent)
  },
  {
    path: 'unit',
    loadComponent: () =>
      import('./components/material-management/unit/unit.component').then(m => m.UnitComponent)
  },
  {
    path: 'material-category',
    loadComponent: () =>
      import('./components/material-management/material-category/material-category.component').then(m => m.MaterialCategoryComponent)
  },
  {
    path: 'material-categories',
    redirectTo: 'material-category',
    pathMatch: 'full'
  },
  {
    path: 'material',
    loadComponent: () =>
      import('./components/material-management/material/material.component').then(m => m.MaterialComponent)
  },
  {
    path: 'materials',
    redirectTo: 'material',
    pathMatch: 'full'
  },
  {
    path: 'supplier',
    loadComponent: () =>
      import('./components/supplier-procurement/supplier/supplier.component').then(m => m.SupplierComponent)
  },
  {
    path: 'purchase-order',
    loadComponent: () =>
      import('./components/supplier-procurement/purchase-order/purchase-order.component').then(m => m.PurchaseOrderComponent)
  },
  {
    path: 'purchase-payment',
    loadComponent: () =>
      import('./components/supplier-procurement/purchase-payment/purchase-payment.component').then(m => m.PurchasePaymentComponent)
  },

  // Catch-all route
  { path: '**', redirectTo: '' }
];
