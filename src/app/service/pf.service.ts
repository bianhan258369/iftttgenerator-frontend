import { Injectable, ErrorHandler } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class PFService {
  private serviceUrl = 'http://localhost:8081/api/';
  // private serviceUrl = 'http://47.52.116.116:8081/api/';

  constructor(private httpClient: HttpClient) { }

  getProblemDiagram(requirementTexts:string, ontologyPath:string) : Observable<any>{
    var url = this.serviceUrl + 'getPD?requirementTexts=' + requirementTexts + '&ontologyPath=' + ontologyPath
    url = decodeURIComponent(url);
    console.log(url)
    return this.httpClient.get<any>(url);
  }

  getScenarioDiagram(requirementTexts:string, ontologyPath:string) : Observable<any>{
    var url = this.serviceUrl + 'getSCD?requirementTexts=' + requirementTexts + '&ontologyPath=' + ontologyPath
    url = decodeURIComponent(url);
    console.log(url)
    return this.httpClient.get<any>(url);
  }

  
}
