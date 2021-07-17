import { Injectable, ErrorHandler } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';

const  httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
}

@Injectable({
  providedIn: 'root'
})
export class HaService {

  private serviceUrl = 'http://localhost:8081/api/';
  // private serviceUrl = 'http://47.52.116.116:8081/api/';

  constructor(private httpClient: HttpClient) { }

 

  getEntityIds() : Observable<any>{
    var url = this.serviceUrl + 'getEntityIds'
    url = decodeURIComponent(url);
    return this.httpClient.get<any>(url);
  }

  writePersonalDeviceTable(entityAreas) : any{
    var url = this.serviceUrl + 'writePersonalDeviceTable'
    url = decodeURIComponent(url);
    return this.httpClient.post(url,entityAreas,httpOptions)
  }

  writeAutomations(requirementTexts:string, ontologyPath:string, index) : any{
    var url = this.serviceUrl + 'writeAutomations?requirementTexts=' + requirementTexts + '&ontologyPath=' + ontologyPath + '&index=' + index
    url = decodeURIComponent(url);
    return this.httpClient.get(url);
  }
}
