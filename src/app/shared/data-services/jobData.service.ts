import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, finalize, map, share } from 'rxjs/operators';
import { IJobUserStats } from 'src/app/job/job-shared/interfaces/job.interface';
import { isNullOrUndefined } from 'util';
import { IOrganizationDocument } from '../models/organization/organization.interface';
const jsFilename = 'JobDataService: ';

@Injectable({
  providedIn: 'root',
})
export class JobDataService {
  public job = null;
  public jobs: IJobUserStats[];
  public isLoading = false;

  constructor(
    // private http: HttpClient,
    // private exceptionService: ExceptionService,
    // private apiService: ApiService,
    // private globalService: GlobalService,
    // private spinnerService: SpinnerService,
    // private broadcastService: BroadcastService,
    // private userService: UserService,
    // private organizationService: OrganizationService,
  ) {
  }

  //////// Organization /////////////////
  public setJob(objJob) {
    this.job = objJob;
  }
  public getJob() {
    if (isNullOrUndefined(this.job)) {
      return null;
    }
    return this.job;
  }
  //////// List Organization /////////////////
  public setJobs(objJobs) {
    this.jobs = objJobs;
  }
  public setJobsByData(res) {
    if (!res) {
      this.setJobs([]);
      return;
    }
    const jobsToReview = [];
    res.userStats.forEach((stats) => {
      stats.countQualifield = stats.applicationStats.applicantsInQualifiedRequiringAction;
      if ((stats.jobCountHomework && stats.jobCountHomework > 0)
        || (stats.jobCountInterview && stats.jobCountInterview > 0)) {
        jobsToReview.push(stats);
      }
    });
    this.setJobs(jobsToReview);
  }
  public getJobs() {
    if (isNullOrUndefined(this.jobs)) {
      return null;
    }
    return this.jobs;
  }
}
