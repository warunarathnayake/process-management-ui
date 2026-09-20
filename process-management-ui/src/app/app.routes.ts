import { Routes } from '@angular/router';

export const routes: Routes = [
  // Default redirect to login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Login page
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(m => m.LoginComponent)
  },

  // Header standalone demo/preview route
  {
    path: 'header',
    loadComponent: () =>
      import('./components/header/header.component').then(m => m.HeaderComponent)
  },

  // Main Dashboard route (which embeds the Header)
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },

  // Catch-all
  { path: '**', redirectTo: 'login' }
];
