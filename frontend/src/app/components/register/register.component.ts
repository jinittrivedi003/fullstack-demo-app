import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

function passwordMatch(group: AbstractControl): ValidationErrors | null {
  const pw = group.get('password')?.value;
  const cpw = group.get('confirmPassword')?.value;
  return pw && cpw && pw !== cpw ? { mismatch: true } : null;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  form!: FormGroup;
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  showPassword = false;
  showConfirm = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/profile']);
      return;
    }
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordMatch });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { username, email, password } = this.form.value;
    this.authService.register({ username, email, password }).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/personal-details']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }

  err(field: string): string {
    const c = this.form.get(field);
    if (!c?.touched || !c.errors) return '';
    if (c.errors['required']) return 'This field is required.';
    if (c.errors['minlength']) return `Minimum ${c.errors['minlength'].requiredLength} characters required.`;
    if (c.errors['email']) return 'Please enter a valid email address.';
    if (c.errors['pattern']) return 'Only letters, numbers, and underscores allowed.';
    return '';
  }
}
