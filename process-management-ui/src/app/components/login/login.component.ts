import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading  = signal(false);
  errorMsg   = signal('');
  showPass   = signal(false);

  // Particle dots for background
  particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    left: Math.random() * 100,
    top:  Math.random() * 100,
    delay: Math.random() * 4,
    duration: Math.random() * 6 + 6,
  }));

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  get email()    { return this.loginForm.get('email')!; }
  get password() { return this.loginForm.get('password')!; }

  togglePassword(): void { this.showPass.update(v => !v); }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMsg.set('');

    try {
      // Simulate login delay
      await new Promise(resolve => setTimeout(resolve, 800));
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.errorMsg.set(err.message || 'Invalid credentials. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
