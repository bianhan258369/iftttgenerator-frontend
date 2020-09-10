import { Injectable } from '@angular/core';
import {HttpClient,HttpParams, HttpHeaders, HttpRequest, HttpEvent} from '@angular/common/http';
import {Observable} from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor(private httpClient: HttpClient) { }

  uploadFile(file: File): Observable<HttpEvent<any>> {
    let formData = new FormData();
    formData.append('uploadedFile', file);
    let params = new HttpParams();
    const options = {
      params: params,
      reportProgress: true,
    };
    const req = new HttpRequest('POST', 'http://localhost:8081/api/upload', formData, options);
    return this.httpClient.request(req);
  }
}
