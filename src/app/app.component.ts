import { Component } from '@angular/core';
import { CandidateManagerComponent } from './candidate-manager/candidate-manager.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CandidateManagerComponent,],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'test';
 }
