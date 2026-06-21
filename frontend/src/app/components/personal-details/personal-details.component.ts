import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User } from '../../models/models';

@Component({
  selector: 'app-personal-details',
  templateUrl: './personal-details.component.html',
  styleUrls: ['./personal-details.component.css']
})
export class PersonalDetailsComponent implements OnInit {
  form!: FormGroup;
  selectedFiles: File[] = [];
  fileErrors: string[] = [];
  isLoading = false;
  isFetching = true;
  successMessage = '';
  errorMessage = '';
  existingUser: User | null = null;
  today = new Date().toISOString().split('T')[0];

  readonly MAX_FILE_SIZE = 5 * 1024 * 1024;
  readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

  constructor(private fb: FormBuilder, private userService: UserService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      dateOfBirth: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobileNumber: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]{7,15}$/)]],
      address: ['', [Validators.required, Validators.minLength(5)]]
    });

    this.userService.getProfile().subscribe({
      next: (user) => {
        this.existingUser = user;
        if (user.personalDetails?.fullName) {
          const pd = user.personalDetails;
          this.form.patchValue({
            fullName: pd.fullName,
            dateOfBirth: pd.dateOfBirth ? pd.dateOfBirth.split('T')[0] : '',
            email: pd.email,
            mobileNumber: pd.mobileNumber,
            address: pd.address
          });
        }
        this.isFetching = false;
      },
      error: () => { this.isFetching = false; }
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    this.fileErrors = [];
    this.selectedFiles = [];
    Array.from(input.files).forEach(file => {
      if (!this.ALLOWED_TYPES.includes(file.type)) {
        this.fileErrors.push(`"${file.name}" is not allowed. Only JPG, PNG, PDF accepted.`);
        return;
      }
      if (file.size > this.MAX_FILE_SIZE) {
        this.fileErrors.push(`"${file.name}" exceeds the 5 MB size limit.`);
        return;
      }
      this.selectedFiles.push(file);
    });
    input.value = '';
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  formatSize(bytes: number): string {
    return (bytes / 1024).toFixed(1) + ' KB';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const fd = new FormData();
    fd.append('fullName', this.form.value.fullName);
    fd.append('dateOfBirth', this.form.value.dateOfBirth);
    fd.append('email', this.form.value.email);
    fd.append('mobileNumber', this.form.value.mobileNumber);
    fd.append('address', this.form.value.address);
    this.selectedFiles.forEach(f => fd.append('attachments', f, f.name));

    this.userService.updatePersonalDetails(fd).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = res.message;
        this.existingUser = res.user;
        this.selectedFiles = [];
        this.fileErrors = [];
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to save. Please try again.';
      }
    });
  }

  err(field: string): string {
    const c = this.form.get(field);
    if (!c?.touched || !c.errors) return '';
    if (c.errors['required']) return 'This field is required.';
    if (c.errors['minlength']) return `Minimum ${c.errors['minlength'].requiredLength} characters required.`;
    if (c.errors['email']) return 'Please enter a valid email address.';
    if (c.errors['pattern']) return 'Please enter a valid mobile number.';
    return '';
  }
}
