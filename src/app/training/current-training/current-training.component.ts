import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';

import { StopStrainingComponent } from './stop-training.component';
import { TrainingService } from '../training.service';
import * as fromTraining from '../training.reducer'
import { Exercise } from '../exercise.model';

@Component({
  selector: 'app-current-training',
  templateUrl: './current-training.component.html',
  styleUrls: ['./current-training.component.css']
})
export class CurrentTrainingComponent implements OnInit, OnDestroy {

  progress: number = 0;
  timer;
  private dialogSubscription: Subscription;
  private storeSubscription: Subscription;

  constructor(private dialog: MatDialog, private trainingService: TrainingService, private store: Store<fromTraining.State>) { }

  ngOnInit(): void {
    this.startOrResumeTimer();
  }

  startOrResumeTimer() {
    this.storeSubscription = this.store.select(fromTraining.getActiveTraining).pipe(take(1)).subscribe((exercise: Exercise) => {
      const step = exercise.duration / 100 * 1000;
    this.timer = setInterval(() => {
      this.progress +=1;
      if(this.progress >= 100) {
        this.trainingService.completeExercise();
        clearInterval(this.timer);
      }
    }, step);
    });

  }

  onStop() {
    clearInterval(this.timer);
    const dialogRef = this.dialog.open(StopStrainingComponent, {data: {
      progress: this.progress
    }});

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
          this.trainingService.cancelExercise(this.progress);
      } else {
        this.startOrResumeTimer();
      }
    });
  }

  ngOnDestroy() {
    if (this.dialogSubscription) {
      this.dialogSubscription.unsubscribe();
    }
    if (this.storeSubscription) {
      this.storeSubscription.unsubscribe();
    }
  }

}
