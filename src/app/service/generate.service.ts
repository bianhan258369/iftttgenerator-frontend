import { Injectable, ErrorHandler } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams, HttpRequest,HttpEvent} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import { IfThenRequirement } from '../entity/IfThenRequirement';

const  httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
}

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

  generateFunctionalRequirements(requirementTexts:string, ontologyPath:string, index, complementedRequirements:string) : Observable<any>{
    var url = this.serviceUrl + 'transform2FunctionalRequirements?requirementTexts=' + requirementTexts + '&ontologyPath=' + ontologyPath + '&index=' + index + '&complementedRequirements=' + complementedRequirements;
    url = decodeURIComponent(url);
    return this.httpClient.get<any>(url);
  }

  getReverseRequirements(requirementTexts:string, ontologyPath:string, index) : Observable<any>{
    var url = this.serviceUrl + 'gerReverse?requirementTexts=' + requirementTexts + '&ontologyPath=' + ontologyPath + '&index=' + index
    url = decodeURIComponent(url);
    return this.httpClient.get<any>(url);
  }

  getComplementedRequirements(ontologyPath:string) : Observable<any>{
    var url = this.serviceUrl + 'getComplement?ontologyPath=' + ontologyPath
    url = decodeURIComponent(url);
    return this.httpClient.get<any>(url);
  }  

  check(requirementTexts:string, ontologyPath:string, index) : Observable<any>{
    var url = this.serviceUrl + 'check?requirementTexts=' + requirementTexts + '&ontologyPath=' + ontologyPath + '&index=' + index
    url = decodeURIComponent(url);
    return this.httpClient.get<any>(url);
  }  

  solve(triggerLists: Array<Array<string>>, actionLists: Array<Array<string>>, times:Array<string>, expectations: Array<string>) : Observable<any>{
    var url = this.serviceUrl + 'solve';
    const body = JSON.stringify({
      "triggerLists" : triggerLists,
      "actionLists" : actionLists,
      "times" : times,
      "expectations" : expectations,
    })
    console.log(body)
    return this.httpClient.post(url,body,httpOptions)
  }

  z3Check(requirementTexts:string, ontologyPath:string, index) : Observable<any>{
    var url = this.serviceUrl + 'z3Check?requirementTexts=' + requirementTexts + '&ontologyPath=' + ontologyPath + '&index=' + index
    url = decodeURIComponent(url);
    return this.httpClient.get<any>(url);
  }  
}
