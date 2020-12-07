import { Injectable, ErrorHandler } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
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



export class PFService {

  private serviceUrl = 'http://localhost:8081/api/';
  // private serviceUrl = 'http://47.52.116.116:8081/api/';

  constructor(private httpClient: HttpClient) { }

  

  getProblemDiagram(requirementTexts:string, ontologyPath:string, index) : Observable<any>{
    var url = this.serviceUrl + 'getPD?requirementTexts=' + requirementTexts + '&ontologyPath=' + ontologyPath + '&index=' + index
    url = decodeURIComponent(url);
    console.log(url)
    return this.httpClient.get<any>(url);
  }

  getSrSCD(requirementTexts:string, ontologyPath:string) : Observable<any>{
    var url = this.serviceUrl + 'getSrSCD?requirementTexts=' + requirementTexts + '&ontologyPath=' + ontologyPath
    url = decodeURIComponent(url);
    console.log(url)
    return this.httpClient.get<any>(url);
  }

  getDrSCD(triggerLists: Array<Array<string>>, actionLists: Array<Array<string>>, times:Array<string>, expectations: Array<string>, ontologyPath:string) : Observable<any>{
    var url = this.serviceUrl + 'getDrSCD';
    const body = JSON.stringify({
      "triggerLists" : triggerLists,
      "actionLists" : actionLists,
      "times" : times,
      "expectations" : expectations,
      "ontologyPath" : ontologyPath,
    })
    console.log(body)
    return this.httpClient.post(url,body,httpOptions)
  }

  getSbSCD(triggerLists: Array<Array<string>>, actionLists: Array<Array<string>>, times:Array<string>, expectations: Array<string>, ontologyPath:string) : Observable<any>{
    var url = this.serviceUrl + 'getSbSCD';
    const body = JSON.stringify({
      "triggerLists" : triggerLists,
      "actionLists" : actionLists,
      "times" : times,
      "expectations" : expectations,
      "ontologyPath" : ontologyPath,
    })
    return this.httpClient.post(url,body,httpOptions)
  }

  
}
