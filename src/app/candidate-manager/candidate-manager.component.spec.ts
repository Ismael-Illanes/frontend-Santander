import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CandidateManagerComponent } from './candidate-manager.component';
import { CandidateService } from '../../services/CandidateService';
import { of, throwError } from 'rxjs';
import { Candidate } from '../../models/Candidate.model';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('CandidateManagerComponent', () => {
  let component: CandidateManagerComponent;
  let fixture: ComponentFixture<CandidateManagerComponent>;
  let candidateService: CandidateService;
  const mockDialog = {
    open: jest.fn().mockReturnValue({ afterClosed: () => of(null) })
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CandidateManagerComponent,
        MatPaginatorModule,
        MatTableModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: CandidateService, useValue: {
          getAllCandidates: () => of([]),
          updateCandidate: () => of({} as Candidate),
          deleteCandidate: () => of(void 0) ,
          submitCandidate: () => of({} as Candidate)
        } },
        { provide: MatDialog, useValue: mockDialog }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CandidateManagerComponent);
    component = fixture.componentInstance;
    candidateService = TestBed.inject(CandidateService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load candidates on ngOnInit', () => {
    const candidatesMock: Candidate[] = [{ name: 'John', surname: 'Doe', seniority: 'junior', years: 1, availability: true }];
    jest.spyOn(candidateService, 'getAllCandidates').mockReturnValue(of(candidatesMock));
    component.ngOnInit();
    expect(component.candidates).toEqual(candidatesMock);
    expect(component.dataSource.data).toEqual(candidatesMock);
  });

  it('should handle server error when loading candidates', () => {
    jest.spyOn(candidateService, 'getAllCandidates').mockReturnValue(throwError(() => new Error('Server error')));
    component.ngOnInit();
    expect(component.serverError).toBe(true);
    expect(component.loading).toBe(false);
  });

  it('should update dataSource when candidates are loaded', () => {
    const candidatesMock: Candidate[] = [{ name: 'John', surname: 'Doe', seniority: 'junior', years: 1, availability: true }];
    jest.spyOn(candidateService, 'getAllCandidates').mockReturnValue(of(candidatesMock));
    component.loadCandidates();
    expect(component.candidates).toEqual(candidatesMock);
    expect(component.dataSource.data).toEqual(candidatesMock);
  });

  it('should sort candidates by id', () => {
    const candidatesMock: Candidate[] = [
      { id: 2, name: 'John', surname: 'Doe', seniority: 'junior', years: 1, availability: true },
      { id: 1, name: 'Jane', surname: 'Doe', seniority: 'senior', years: 5, availability: false }
    ];
    component.candidates = candidatesMock;
    component.sortCandidates();
    expect(component.candidates[0].id).toBe(1);
    expect(component.candidates[1].id).toBe(2);
  });

  it('should open edit dialog and update candidate', () => {
    const candidate: Candidate = { id: 1, name: 'John', surname: 'Doe', seniority: 'junior', years: 1, availability: true };
    jest.spyOn(component.dialog, 'open').mockReturnValue({ afterClosed: () => of({ name: 'Jane Doe', seniority: 'senior' }) } as any);
    const updateCandidateSpy = jest.spyOn(candidateService, 'updateCandidate').mockReturnValue(of(candidate));
    const loadCandidatesSpy = jest.spyOn(component, 'loadCandidates');

    component.editCandidate(candidate);

    expect(component.dialog.open).toHaveBeenCalled();
    expect(updateCandidateSpy).toHaveBeenCalled();
  });

  it('should delete candidate and update candidate list', () => {
    const candidateId = 1;
    const candidatesMock: Candidate[] = [{ id: 1, name: 'John', surname: 'Doe', seniority: 'junior', years: 1, availability: true }];
    component.candidates = candidatesMock; // Inicializamos candidates con un candidato
    component.dataSource = new MatTableDataSource<Candidate>(candidatesMock); // Actualizamos dataSource

    const deleteCandidateSpy = jest.spyOn(candidateService, 'deleteCandidate').mockReturnValue(of(void 0));
    const updateDataSourceSpy = jest.spyOn(component, 'updateDataSource');


    component.deleteCandidate(candidateId);

    expect(deleteCandidateSpy).toHaveBeenCalledWith(candidateId);

    expect(component.candidates.length).toBe(0);
    expect(updateDataSourceSpy).toHaveBeenCalled();
  });
});
