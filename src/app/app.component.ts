import { Component } from '@angular/core';
import { CandidateManagerComponent } from './candidate-manager/candidate-manager.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CandidateManagerComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent { }
