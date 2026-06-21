import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { DocumentService } from '../../services/document.service';
import { User } from '../../models/models';

function passwordMatch(group: AbstractControl): ValidationErrors | null {
  const nw = group.get('newPassword')?.value;
  const cp = group.get('confirmPassword')?.value;
  return nw && cp && nw !== cp ? { mismatch: true } : null;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  isFetching = true;

  pwForm!: FormGroup;
  pwLoading = false;
  pwSuccess = '';
  pwError = '';
  showCurrent = false;
  showNew = false;
  showConfirm = false;

  dlLoading: { pdf: boolean; docx: boolean } = { pdf: false, docx: false };
  dlError = '';

  deleteLoading: { [id: string]: boolean } = {};
  deleteError = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private documentService: DocumentService
  ) {}

  ngOnInit(): void {
    this.pwForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordMatch });

    this.loadProfile();
  }

  loadProfile(): void {
    this.isFetching = true;
    this.userService.getProfile().subscribe({
      next: (u) => { this.user = u; this.isFetching = false; },
      error: () => { this.isFetching = false; }
    });
  }

  get hasDetails(): boolean {
    return !!(this.user?.personalDetails?.fullName);
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  formatSize(bytes: number): string {
    return bytes >= 1048576
      ? (bytes / 1048576).toFixed(1) + ' MB'
      : (bytes / 1024).toFixed(1) + ' KB';
  }

  changePassword(): void {
    if (this.pwForm.invalid) { this.pwForm.markAllAsTouched(); return; }
    this.pwLoading = true;
    this.pwSuccess = '';
    this.pwError = '';

    this.userService.changePassword({
      currentPassword: this.pwForm.value.currentPassword,
      newPassword: this.pwForm.value.newPassword
    }).subscribe({
      next: (res) => {
        this.pwLoading = false;
        this.pwSuccess = res.message;
        this.pwForm.reset();
      },
      error: (err) => {
        this.pwLoading = false;
        this.pwError = err.error?.message || 'Failed to change password.';
      }
    });
  }

  downloadFile(type: 'pdf' | 'docx'): void {
    this.dlLoading[type] = true;
    this.dlError = '';

    const obs = type === 'pdf'
      ? this.documentService.downloadPDF()
      : this.documentService.downloadDOCX();

    obs.subscribe({
      next: (blob) => {
        this.dlLoading[type] = false;
        const ext = type === 'pdf' ? 'pdf' : 'docx';
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `personal-details.${ext}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (err) => {
        this.dlLoading[type] = false;
        this.dlError = err.error?.message || `Failed to download ${type.toUpperCase()}.`;
      }
    });
  }

  deleteAttachment(attachmentId: string): void {
    if (!confirm('Delete this attachment? This cannot be undone.')) return;
    this.deleteLoading[attachmentId] = true;
    this.deleteError = '';

    this.userService.deleteAttachment(attachmentId).subscribe({
      next: () => {
        this.deleteLoading[attachmentId] = false;
        if (this.user?.personalDetails?.attachments) {
          this.user.personalDetails.attachments =
            this.user.personalDetails.attachments.filter(a => a._id !== attachmentId);
        }
      },
      error: (err) => {
        this.deleteLoading[attachmentId] = false;
        this.deleteError = err.error?.message || 'Failed to delete attachment.';
      }
    });
  }

  pwErr(field: string): string {
    const c = this.pwForm.get(field);
    if (!c?.touched || !c.errors) return '';
    if (c.errors['required']) return 'This field is required.';
    if (c.errors['minlength']) return `Minimum ${c.errors['minlength'].requiredLength} characters required.`;
    return '';
  }
}
