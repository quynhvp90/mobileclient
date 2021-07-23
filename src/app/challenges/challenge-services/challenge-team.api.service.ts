import { Injectable } from '@angular/core';

import { ApiService } from '../../shared/services/api.service';
import { ExceptionService } from '../../shared/services/exception.service';
import { BroadcastService } from '../../shared/services/broadcast.service';
import { IChallengeActivitiesHydrated, IChallengeDocument, IChallengeDocumentHydrated,
  IChallengeTeam, IChallengeTeams } from '../../shared/models/challenge/challenge.interface';
import { map, catchError } from 'rxjs/operators';

import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { UserService } from 'src/app/shared/services';

@Injectable()
export class ChallengeTeamApiService {
  constructor(
    private exceptionService: ExceptionService,
    private broadcastService: BroadcastService,
    private modalController: ModalController,
    private userService: UserService,
    private apiService: ApiService) {

    this.broadcastService.state.subscribe(() => {
    });
  }

  public getTeam(foundChallenge: IChallengeDocumentHydrated, teamId: string): Observable<IChallengeTeam> {
    const $this = this;

    return this.apiService
      .get({
        resource: 'challenges/' + foundChallenge._id + '/teams/' + teamId,
      }).pipe(
        map((foundChallengeTeam: IChallengeTeam) => {
          const activities = foundChallenge.lookups.activities;
          $this.hydrateChallengeTeam(foundChallengeTeam, activities);
          $this.broadcastService.broadcast('challenge-team-update', {
            challengeRowItem: foundChallengeTeam.lookups.challengeRowItem,
          });
          return foundChallengeTeam;
        }), catchError(this.exceptionService.catchBadResponse),
    );
  }

  public joinTeam(foundChallenge: IChallengeDocument, foundChallengeTeam: IChallengeTeam) {
    const $this = this;
    return this.apiService
      .post({
        resource: 'challenges/' + foundChallenge._id + '/teams/' + foundChallengeTeam._id + '/users',
      }).pipe(
        map((res: any) => {
          $this.broadcastService.broadcast('joined-challenge-team');
          return res;
        }), catchError(this.exceptionService.catchBadResponse),
    );
  }

  public updateChallengeTeams(challengeId: string, challengeTeams: IChallengeTeams) {
    return this.apiService
      .post({
        resource: 'challenges/' + challengeId + '/teams',
        payload: challengeTeams,
      }).pipe(
        map((res: any) => {
          return res;
        }), catchError(this.exceptionService.catchBadResponse),
    );
  }

  public addChallengeTeam(challengeId: string, challengeTeam: IChallengeTeam) {
    return this.apiService
      .post({
        resource: 'challenges/' + challengeId + '/teams',
        payload: challengeTeam,
      }).pipe(
        map((createdTeam: IChallengeTeam) => {
          return createdTeam;
        }), catchError(this.exceptionService.catchBadResponse),
    );
  }

  public editChallengeTeam(challengeId: string, challengeTeam: IChallengeTeam) {
    const $this = this;
    return this.apiService
      .patch({
        resource: 'challenges/' + challengeId + '/teams/' + challengeTeam._id,
        payload: {
          name: challengeTeam.name,
          icon: challengeTeam.icon,
        },
      }).pipe(
        map(() => {
          $this.broadcastService.broadcast('challenge-team-update', {
            challengeId: challengeId,
            challengeTeam: challengeTeam,
          });
        }), catchError(this.exceptionService.catchBadResponse),
    );
  }

  public hydrateChallengeTeams(foundChallenge: IChallengeDocumentHydrated) {
    const $this = this;
    console.log('foundChallenge = ', foundChallenge);
    if (foundChallenge.teams && foundChallenge.teams.roster) {
      let activities = null;
      if (foundChallenge.lookups.activities) {
        activities = JSON.parse(JSON.stringify(foundChallenge.lookups.activities));
      }

      foundChallenge.teams.roster.forEach((foundChallengeTeam) => {
        $this.hydrateChallengeTeam(foundChallengeTeam, activities);
      });
    }
  }

  public hydrateChallengeTeam(foundChallengeTeam: IChallengeTeam, foundActivities: IChallengeActivitiesHydrated[]) {
    if (!foundChallengeTeam.lookups) {
      foundChallengeTeam.lookups = {};
    }

    let totalCount = 0;
    let totalGoal = 0;
    if (foundActivities) {
      foundChallengeTeam.lookups.activities = JSON.parse(JSON.stringify(foundActivities));
    }
    foundChallengeTeam.activities.forEach((activity) => {
      totalCount += activity.total;
      totalGoal += activity.goal;
      if (foundChallengeTeam.lookups.activities) {
        foundChallengeTeam.lookups.activities.forEach((challengeActivityLookup) => {
          if (challengeActivityLookup.logLabel === activity.activityLogLabel) {
            challengeActivityLookup.count = activity.total;
          }
        });
      }
    });

    let isMyTeam = false;
    foundChallengeTeam.users.forEach((challengeTeamUser) => {
      if (challengeTeamUser.userId === this.userService.user._id) {
        isMyTeam = true;
      }
    });

    let display = foundChallengeTeam.name;
    if (isMyTeam) {
      display += ' (your team)';
    }

    foundChallengeTeam.lookups.challengeRowItem = {
      teamId: foundChallengeTeam._id,
      avatar: foundChallengeTeam.icon,
      display: display,
      totalCount: totalCount,
      totalGoal: totalGoal,
      percentComplete: foundChallengeTeam.percentComplete,
      invitationStatus: 'accepted',
    };
  }

}
