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
      .pipe(catchError(this.handleError));
  }

  getAllCandidates(): Observable<Candidate[]> {
    return this.http
      .get<Candidate[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  deleteCandidate(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  updateCandidate(candidate: Candidate): Observable<Candidate> {
    return this.http
      .put<Candidate>(`${this.apiUrl}/${candidate.id}`, candidate)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` + `body was: ${error.error}`
      );
    }

    return throwError(() => 'Something bad happened; please try again later.');
  }
}
