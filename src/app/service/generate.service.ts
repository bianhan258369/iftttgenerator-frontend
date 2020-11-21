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

  chooseScenario(scenario:string) : Observable<any>{
    var url = this.serviceUrl + 'chooseScenario?scenario=' + scenario
    url = decodeURIComponent(url);
    return this.httpClient.get<any>(url);
  }

  transform(requirementTexts:string, ontologyPath:string, type:string, index) : Observable<any>{
    var url = this.serviceUrl + 'transform2' + type + '?requirementTexts=' + requirementTexts + '&ontologyPath=' + ontologyPath + '&index=' + index
    url = decodeURIComponent(url);
    return this.httpClient.get<string[]>(url);
  }

  complementRequirements(requirementTexts:string, ontologyPath:string, index) : Observable<any>{
    var url = this.serviceUrl + 'complement?requirementTexts=' + requirementTexts + '&ontologyPath=' + ontologyPath + '&index=' + index
    url = decodeURIComponent(url);
    return this.httpClient.get<any>(url);
  }  

  check(requirementTexts:string, ontologyPath:string, index) : Observable<string[]>{
    var url = this.serviceUrl + 'check?requirementTexts=' + requirementTexts + '&ontologyPath=' + ontologyPath + '&index=' + index
    url = decodeURIComponent(url);
    return this.httpClient.get<string[]>(url);
  }  

  z3Check(requirementTexts:string, ontologyPath:string, index) : Observable<any>{
    var url = this.serviceUrl + 'z3Check?requirementTexts=' + requirementTexts + '&ontologyPath=' + ontologyPath + '&index=' + index
    url = decodeURIComponent(url);
    return this.httpClient.get<any>(url);
  }  
}
