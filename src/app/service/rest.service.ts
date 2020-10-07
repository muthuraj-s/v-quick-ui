import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
@Injectable()
export class RestService {

  constructor(private httpClient: HttpClient) { }
  post(url, reqObj) {
    return this.httpClient.post(environment.apiHost + url, reqObj);
  }
  get(url) {
    return this.httpClient.get(environment.apiHost + url);
  }
}
