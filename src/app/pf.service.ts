import { Injectable, ErrorHandler } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({'content-Type': 'application/json'})
};

@Injectable({
  providedIn: 'root'
})

export class PFService {
  private serviceUrl = 'http://localhost:8081/api/';

  constructor(private httpClient: HttpClient) { }

  getProblemDiagram(requirementTexts:string, ontologyPath:string) : Observable<any>{
    var url = this.serviceUrl + 'getPD?requirementTexts=' + requirementTexts + '&ontologyPath=' + ontologyPath
    url = decodeURIComponent(url);
    return this.httpClient.get<any>(url);
  }
}
