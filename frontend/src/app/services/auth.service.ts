import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { AuthResponse, User } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    if (this.getToken()) {
      this.loadCurrentUser().subscribe({ error: () => this.logout() });
    }
  }

  register(data: { username: string; email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, data).pipe(
      tap(res => this.storeSession(res))
    );
  }

  login(credentials: { username: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(res => this.storeSession(res))
    );
  }

  loadCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/me`).pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }

  private storeSession(res: AuthResponse): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    // Immediately push user into the subject so navbar reacts without waiting for loadCurrentUser()
    this.currentUserSubject.next({
      _id: res.user.id,
      username: res.user.username,
      email: res.user.email,
      personalDetails: { fullName: '', dateOfBirth: '', email: '', mobileNumber: '', address: '', attachments: [] },
      createdAt: new Date().toISOString()
    });
    // Then fetch full profile in background to hydrate personalDetails
    this.loadCurrentUser().subscribe();
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
