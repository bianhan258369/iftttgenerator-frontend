import { Injectable, ErrorHandler } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams, HttpRequest,HttpEvent} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class GenerateService {
  private serviceUrl = 'http://localhost:8081/api/';
  // private serviceUrl = 'http://47.52.116.116:8081/api/';

  constructor(private httpClient: HttpClient) { }

  transformToDrools(requirementTexts:string, ontologyPath:string) : Observable<string[]>{
    var url = this.serviceUrl + 'transform?requirementTexts=' + requirementTexts + '&ontologyPath=' + ontologyPath
    url = decodeURIComponent(url);
    return this.httpClient.get<string[]>(url);
  }

  refineRequirements(requirementTexts:string, ontologyPath:string) : Observable<any>{
    var url = this.serviceUrl + 'refine?requirementTexts=' + requirementTexts + '&ontologyPath=' + ontologyPath
    url = decodeURIComponent(url);
    return this.httpClient.get<any>(url);
  }  

  check(requirementTexts:string, ontologyPath:string) : Observable<string[]>{
    var url = this.serviceUrl + 'check?requirementTexts=' + requirementTexts + '&ontologyPath=' + ontologyPath
    url = decodeURIComponent(url);
    return this.httpClient.get<string[]>(url);
  }  
}
