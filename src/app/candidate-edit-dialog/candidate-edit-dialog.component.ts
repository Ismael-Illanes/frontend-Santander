import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Candidate } from '../../models/Candidate.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-candidate-edit-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './candidate-edit-dialog.component.html',
  styleUrls: ['./candidate-edit-dialog.component.scss']
})
export class CandidateEditDialogComponent implements OnInit {
  editForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<CandidateEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Candidate,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      name: [data.name],
      surname: [data.surname],
      seniority: [data.seniority],
      years: [data.years],
      availability: [data.availability]
    });
  }

  ngOnInit(): void {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
