import { TestBed } from '@angular/core/testing';

import { PfService } from './pf.service';

describe('PfService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PfService = TestBed.get(PfService);
    expect(service).toBeTruthy();
  });
});
