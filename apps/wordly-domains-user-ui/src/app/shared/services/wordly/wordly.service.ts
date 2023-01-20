import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Profile } from '../../interaces/profile';

@Injectable({
  providedIn: 'root',
})
export class WordlyService {
  private http: HttpClient;
  private BASE_URL = 'https://api.wordly.domains/api/v1';

  constructor(http: HttpClient) {
    this.http = http;
  }
  fetchUserData(userId: string): Observable<Profile> {
    return this.http.get<Profile>(`${this.BASE_URL}/user/${userId}`);
  }

  updateWordPreferences(userId: string, wordPreferences: string[]) {
    return this.http.put(`${this.BASE_URL}/user/${userId}/wordPreferences`, {
      wordPreferences,
    });
  }
}