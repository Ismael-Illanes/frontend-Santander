import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Candidate } from '../models/Candidate.model';

@Injectable({
  providedIn: 'root',
})
export class CandidateService {
  private apiUrl = 'http://localhost:3005/candidates';

  constructor(private http: HttpClient) {}

  submitCandidate(candidateData: FormData): Observable<Candidate> {
    return this.http
      .post<Candidate>(`${this.apiUrl}/upload`, candidateData)
      .pipe(catchError((error) => this.handleError(error)));
  }

  getAllCandidates(): Observable<Candidate[]> {
    return this.http
      .get<Candidate[]>(this.apiUrl)
      .pipe(catchError((error) => this.handleError(error)));
  }

  deleteCandidate(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  updateCandidate(candidate: Candidate): Observable<Candidate> {
    return this.http
      .put<Candidate>(`${this.apiUrl}/${candidate.id}`, candidate)
      .pipe(catchError((error) => this.handleError(error)));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    return throwError(() => error);
  }
}
