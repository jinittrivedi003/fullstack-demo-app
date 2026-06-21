import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = `${environment.apiUrl}/profile`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<User> {
    return this.http.get<User>(this.apiUrl);
  }

  updatePersonalDetails(formData: FormData): Observable<{ message: string; user: User }> {
    return this.http.put<{ message: string; user: User }>(`${this.apiUrl}/personal-details`, formData);
  }

  changePassword(data: { currentPassword: string; newPassword: string }): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/change-password`, data);
  }

  deleteAttachment(attachmentId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/attachments/${attachmentId}`);
  }
}
