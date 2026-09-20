import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  template: `
    <div class="dashboard-layout min-vh-100 bg-body-tertiary">
      <app-header></app-header>
      <main class="container-fluid p-4">
        <div class="row g-4">
          <div class="col-12">
            <div class="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h4 class="fw-bold mb-1 text-dark">Welcome to Business Process Management System</h4>
              <p class="text-secondary mb-0">System dashboard is ready.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class DashboardComponent {}
