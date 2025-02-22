import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateEditDialogComponent } from './candidate-edit-dialog.component';

describe('CandidateEditDialogComponent', () => {
  let component: CandidateEditDialogComponent;
  let fixture: ComponentFixture<CandidateEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateEditDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidateEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
