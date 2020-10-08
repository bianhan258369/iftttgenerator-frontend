import { Injectable, ErrorHandler } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SimulationService {
  private serviceUrl = 'http://localhost:8081/api/';
  // private serviceUrl = 'http://47.52.116.116:8081/api/';

  constructor(private httpClient: HttpClient) { }

  simulation(requirementTexts:string, ontologyPath:string, index) : any{
    var url = this.serviceUrl + 'onenetSimulation?requirementTexts=' + requirementTexts  + '&ontologyPath=' + ontologyPath + '&index=' + index
    url = decodeURIComponent(url);
    return this.httpClient.get(url);
  }
}
