import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WordlyService {
  private http: HttpClient;
  private BASE_URL = environment.production
    ? 'https://api.wordly-domains/api/v1'
    : 'http://localhost:8080/api/v1';

  constructor(http: HttpClient) {
    this.http = http;
  }
  fetchUserData(userId: string) {
    console.log('calling local wordly api');
    return this.http.get(`${this.BASE_URL}/user/${userId}`);
  }
}
