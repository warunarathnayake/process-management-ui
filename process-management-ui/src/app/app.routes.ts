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

  // Catch-all route
  { path: '**', redirectTo: '' }
];
