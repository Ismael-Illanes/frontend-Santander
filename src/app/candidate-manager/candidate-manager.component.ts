import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CandidateService } from '../../services/CandidateService';
import { Candidate } from '../../models/Candidate.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import * as XLSX from 'xlsx';
import { MatDialog } from '@angular/material/dialog';
import { CandidateEditDialogComponent } from '../candidate-edit-dialog/candidate-edit-dialog.component';

@Component({
  selector: 'app-candidate-manager',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
  ],
  templateUrl: './candidate-manager.component.html',
  styleUrls: ['./candidate-manager.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CandidateManagerComponent implements OnInit, AfterViewInit {
  candidateForm!: FormGroup;
  candidates: Candidate[] = [];
  dataSource = new MatTableDataSource<Candidate>([]);
  displayedColumns: string[] = [
    'name',
    'surname',
    'seniority',
    'years',
    'availability',
  ];
  displayedColumnsWithActions: string[] = [...this.displayedColumns, 'actions'];
  excelData: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Constructor: injects dependencies and initializes the form.
  constructor(
    private fb: FormBuilder,
    private candidateService: CandidateService,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog
  ) {
    this.initializeForm();
  }

  // ngOnInit: loads candidates when the component initializes.
  ngOnInit(): void {
    this.loadCandidates();
  }

  // ngAfterViewInit: assigns the paginator to the dataSource after the view is rendered.
  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  // Initializes the reactive form.
  initializeForm(): void {
    this.candidateForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      excelFile: [null, Validators.required],
    });
  }

  // Loads candidates from the backend.
  loadCandidates(): void {
    this.candidateService.getAllCandidates().subscribe((data: Candidate[]) => {
      console.log('Candidates loaded:', data);
      this.candidates = data;
      this.updateDataSource();
    });
  }

  // Updates the table dataSource and assigns the paginator.
  updateDataSource(): void {
    console.log('Updating dataSource:', this.candidates);
    this.sortCandidates();
    this.dataSource = new MatTableDataSource<Candidate>(this.candidates);
    setTimeout(() => {
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
        this.paginator.firstPage();
      }
    }, 0);
    this.cdr.detectChanges();
  }

  // Sorts candidates by their id.
  sortCandidates(): void {
    this.candidates.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
  }

  // Handles the change event in the file input.
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (!this.isValidExcelFile(file)) {
        this.resetFileInput();
        return;
      }
      this.readExcelFile(file);
    }
  }

  // Validates that the file is an Excel (.xlsx).
  isValidExcelFile(file: File): boolean {
    if (
      file.type !==
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      alert('Please select only Excel files (.xlsx).');
      this.candidateForm.get('excelFile')?.setValue(null);
      return false;
    }
    return true;
  }

  // Resets the file input.
  resetFileInput(): void {
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  // Reads and processes the content of the Excel file.
  readExcelFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      if (jsonData.length > 1) {
        this.excelData = jsonData[1];
        this.candidateForm.patchValue({ excelFile: this.excelData });
      }
    };
    reader.readAsBinaryString(file);
  }

  // Submits the form and updates the candidate list.
  onSubmit() {
    if (this.candidateForm.valid) {
      const formData = this.createFormData();
      this.candidateService
        .submitCandidate(formData)
        .subscribe((response: Candidate) => {
          this.candidates.push(response);
          this.updateDataSource();
          this.resetForm();
        });
    }
  }

  // Creates a FormData object from the form values.
  createFormData(): FormData {
    const formValues = this.candidateForm.value;
    const formData = new FormData();
    formData.append('name', formValues.name);
    formData.append('surname', formValues.surname);
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      formData.append('file', fileInput.files[0]);
    }
    return formData;
  }

  // Resets the form and the file input.
  resetForm(): void {
    this.candidateForm.reset();
    this.excelData = null;
    this.resetFileInput();
  }

  // Opens a dialog to edit a candidate.
  editCandidate(candidate: Candidate): void {
    const dialogRef = this.dialog.open(CandidateEditDialogComponent, {
      width: '400px',
      data: candidate,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const updatedCandidate: Candidate = { ...candidate, ...result };
        this.candidateService
          .updateCandidate(updatedCandidate)
          .subscribe(() => {
            this.loadCandidates();
          });
      }
    });
  }

  // Deletes a candidate and updates the table.
  deleteCandidate(id: number): void {
    this.candidateService.deleteCandidate(id).subscribe(() => {
      this.candidates = this.candidates.filter(
        (candidate) => candidate.id !== id
      );
      this.updateDataSource();
      this.paginator.firstPage();
    });
  }
}
