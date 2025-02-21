import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Candidate } from '../models/Candidate.model';

@Injectable({
  providedIn: 'root'
})
export class CandidateService {
  private apiUrl = 'http://localhost:3005/candidates';

  constructor(private http: HttpClient) {}

  submitCandidate(candidateData: FormData): Observable<Candidate> {
    return this.http.post<Candidate>(`${this.apiUrl}/upload`, candidateData);
  }

  getAllCandidates(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(this.apiUrl);
  }
}
