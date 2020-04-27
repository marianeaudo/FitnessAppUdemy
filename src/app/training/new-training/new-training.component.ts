import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AngularFirestore } from 'angularfire2/firestore'
import { Observable } from 'rxjs'
import { Store } from '@ngrx/store';

import { TrainingService } from '../training.service';
import { Exercise } from '../exercise.model';
import { UIService } from 'src/app/shared/ui.service';
import * as fromTraining from '../training.reducer';
import * as fromRoot from '../../app.reducer'

@Component({
  selector: 'app-new-training',
  templateUrl: './new-training.component.html',
  styleUrls: ['./new-training.component.css']
})
export class NewTrainingComponent implements OnInit {

  exercises$: Observable<Exercise[]>;
  isLoadingExercises$: Observable<boolean>;

  constructor(private trainingService: TrainingService,
              private db: AngularFirestore,
              private uiService: UIService,
              private store: Store<{ui: fromTraining.State}>) { }

  ngOnInit(): void {
    this.isLoadingExercises$ = this.store.select(fromRoot.getIsLoading)
    this.exercises$ = this.store.select(fromTraining.getAvailableExercises);
    this.onFetchExercises();
  }

  onStartTraining(form: NgForm) {
    this.trainingService.startExercise(form.value.exercise);
  }

  onFetchExercises() {
    this.trainingService.fetchAvailableExercises();
  }

}
