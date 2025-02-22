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
import { finalize } from 'rxjs/operators';

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
  serverError: boolean = false;
  loading: boolean = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private fb: FormBuilder,
    private candidateService: CandidateService,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    // Load candidates on component initialization.
    this.loadCandidates();
  }

  ngAfterViewInit() {
    // Set paginator after view initialization.
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  initializeForm(): void {
    // Initialize the form group.
    this.candidateForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      surname: ['', [Validators.required, Validators.maxLength(50)]],
      excelFile: [null, Validators.required],
    });
  }

  loadCandidates(): void {
    // Load candidates from the service.
    this.loading = true;
    this.candidateService
      .getAllCandidates()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data: Candidate[]) => {
          this.candidates = data;
          this.updateDataSource();
          this.serverError = false;
        },
        error: (error) => {
          this.serverError = true;
        },
      });
  }

  updateDataSource(): void {
    // Update the data source with the candidates.
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

  sortCandidates(): void {
    // Sort candidates by ID.
    this.candidates.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
  }

  onFileChange(event: any) {
    // Handle file change event.
    const file = event.target.files[0];
    if (file) {
      if (!this.isValidExcelFile(file)) {
        this.resetFileInput();
        return;
      }
      this.readExcelFile(file);
    }
  }

  isValidExcelFile(file: File): boolean {
    // Validate if the file is an Excel file.
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

  resetFileInput(): void {
    // Reset the file input.
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  readExcelFile(file: File): void {
    // Read and parse the Excel file.
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const headers: string[] = jsonData[0] as string[];
      const requiredHeaders = ['seniority', 'years', 'availability'];
      const hasValidHeaders = requiredHeaders.every((header) =>
        headers.includes(header)
      );

      if (!hasValidHeaders) {
        alert(
          'El archivo Excel debe contener los encabezados: seniority, years, availability.'
        );
        this.resetFileInput();
        return;
      }

      if (jsonData.length !== 2) {
        alert(
          'El archivo Excel debe contener solo una fila de datos además de la fila de encabezados.'
        );
        this.resetFileInput();
        return;
      }

      this.excelData = jsonData[1];
      this.candidateForm.patchValue({ excelFile: this.excelData });
    };
    reader.readAsBinaryString(file);
  }

  onSubmit() {
    // Submit the candidate form.
    if (this.candidateForm.valid) {
      const formData = this.createFormData();
      this.candidateService
        .submitCandidate(formData)
        .pipe(
          finalize(() => {
            this.loading = false;
            this.cdr.detectChanges();
          })
        )
        .subscribe({
          next: (response: Candidate) => {
            this.candidates.push(response);
            this.updateDataSource();
            this.resetForm();
          },
          error: (error) => {
            this.serverError = true;
          },
        });
    }
  }

  createFormData(): FormData {
    // Create form data for submission.
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

  resetForm(): void {
    // Reset the candidate form.
    this.candidateForm.reset();
    this.excelData = null;
    this.resetFileInput();
  }

  editCandidate(candidate: Candidate): void {
    // Open the edit candidate dialog.
    const dialogRef = this.dialog.open(CandidateEditDialogComponent, {
      width: '400px',
      data: candidate,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const updatedCandidate: Candidate = { ...candidate, ...result };
        this.candidateService
          .updateCandidate(updatedCandidate)
          .pipe(
            finalize(() => {
              this.loading = false;
              this.cdr.detectChanges();
            })
          )
          .subscribe({
            next: () => {
              this.loadCandidates();
            },
            error: (error) => {
              this.serverError = true;
            },
          });
      }
    });
  }

  deleteCandidate(id: number): void {
    // Delete a candidate by ID.
    this.candidateService
      .deleteCandidate(id)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.candidates = this.candidates.filter(
            (candidate) => candidate.id !== id
          );
          this.updateDataSource();
          this.paginator.firstPage();
        },
        error: (error) => {
          this.serverError = true;
        },
      });
  }
}
