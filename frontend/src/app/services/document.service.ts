import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private apiUrl = `${environment.apiUrl}/documents`;

  constructor(private http: HttpClient) {}

  downloadPDF(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/pdf`, { responseType: 'blob' });
  }

  downloadDOCX(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/docx`, { responseType: 'blob' });
  }
}
