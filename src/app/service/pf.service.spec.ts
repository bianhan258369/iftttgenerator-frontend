import { TestBed } from '@angular/core/testing';

import { PFService } from './pf.service';

describe('PfService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PFService = TestBed.get(PFService);
    expect(service).toBeTruthy();
  });
});
