import { Injectable } from '@angular/core';
import { IJobUserStats } from 'src/app/job/job-shared/interfaces/job.interface';
const jsFilename = 'JobDataService: ';

@Injectable({
  providedIn: 'root',
})
export class JobDataService {
  public job = null;
  public jobs: IJobUserStats[] = [];

  constructor(
  ) {
  }

  public setJob(objJob) {
    this.job = objJob;
  }
  public getJob() {
    return this.job;
  }

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
    return this.jobs;
  }
}
