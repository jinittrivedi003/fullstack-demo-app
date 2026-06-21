import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit {
  @ViewChild('captchaCanvas') captchaCanvas!: ElementRef<HTMLCanvasElement>;

  form!: FormGroup;
  captchaText = '';
  errorMessage = '';
  isLoading = false;
  showPassword = false;

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
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      captchaInput: ['', Validators.required]
    });
  }

  ngAfterViewInit(): void {
    this.generateCaptcha();
  }

  generateCaptcha(): void {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    this.captchaText = Array.from({ length: 6 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
    this.drawCaptcha();
    this.form?.get('captchaInput')?.reset('');
  }

  private drawCaptcha(): void {
    const canvas = this.captchaCanvas.nativeElement;
    const ctx = canvas.getContext('2d')!;
    canvas.width = 180;
    canvas.height = 56;

    const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    grad.addColorStop(0, '#eef2ff');
    grad.addColorStop(1, '#e0e7ff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 60; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${Math.random() * 180},${Math.random() * 180},${Math.random() * 220},0.5)`;
      ctx.fill();
    }

    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.bezierCurveTo(
        Math.random() * canvas.width, Math.random() * canvas.height,
        Math.random() * canvas.width, Math.random() * canvas.height,
        Math.random() * canvas.width, Math.random() * canvas.height
      );
      ctx.strokeStyle = `rgba(100,100,${Math.floor(150 + Math.random() * 100)},0.35)`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    this.captchaText.split('').forEach((char, i) => {
      ctx.save();
      ctx.translate(18 + i * 26, 36);
      ctx.rotate((Math.random() - 0.5) * 0.55);
      ctx.font = `bold ${20 + Math.floor(Math.random() * 5)}px Arial`;
      const r = Math.floor(Math.random() * 60);
      const g = Math.floor(Math.random() * 60);
      const b = Math.floor(100 + Math.random() * 120);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillText(char, 0, 0);
      ctx.restore();
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.form.value.captchaInput !== this.captchaText) {
      this.errorMessage = 'CAPTCHA does not match. Please try again.';
      this.generateCaptcha();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login({
      username: this.form.value.username,
      password: this.form.value.password
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/profile']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Login failed. Please try again.';
        this.generateCaptcha();
      }
    });
  }

  err(field: string): string {
    const c = this.form.get(field);
    if (!c?.touched || !c.errors) return '';
    if (c.errors['required']) return `This field is required.`;
    if (c.errors['minlength']) return `Minimum ${c.errors['minlength'].requiredLength} characters required.`;
    return '';
  }
}
