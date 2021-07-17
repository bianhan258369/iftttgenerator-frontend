import { TestBed } from '@angular/core/testing';

import { HaService } from './ha.service';

describe('HaService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HaService = TestBed.get(HaService);
    expect(service).toBeTruthy();
  });
});
