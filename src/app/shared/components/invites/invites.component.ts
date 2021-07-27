import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { BroadcastService, ContactService, UserService, WorkoutService } from '../../../shared/services';
import { IContactDocument } from '../../models/contact/contact.interface';

const jsFilename = 'invites: ';

@Component({
  selector: 'invites',
  templateUrl: './invites.component.html',
  styleUrls: ['./invites.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class InvitesComponent implements OnDestroy, OnInit {
  private subscriptions = [];

  public listInvite = [];

  public loadingInvitation = true;

  constructor(
    private broadcastService: BroadcastService,
    private contactService: ContactService,
  ) {
    const $this = this;
  }

  public ngOnInit() {
    const msgHdr = jsFilename + 'ngOnInit: ';
    const $this = this;

    const subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      if (msg.name === 'login') {
        this.getNewInvite();
      } else if (msg.name === 'update-invite-cache') {
        this.updateInviteCache();
      } else if (msg.name === 'update-invites') {
        this.getNewInvite();
      }
    });
    this.subscriptions.push(subscription);

    this.getNewInvite();
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  private getNewInvite() {
    const msgHdr = jsFilename + 'getNewInvite: ';
    const $this = this;
    const inviteFilter = {
      isSearchNewInvite: true,
    };
    const subscription = this.contactService.getConnections(null, inviteFilter).subscribe((data) => {
      $this.listInvite = data;
      $this.contactService.listInvites = data;
      $this.broadcastService.broadcast('update-invite-cache');
    });
    this.subscriptions.push(subscription);

  }

  public updateInviteCache() {
    const $this = this;
    $this.listInvite = $this.contactService.listInvites;
  }

  public updateInvitation(contact: IContactDocument, payload: any) {
    const subscription = this.contactService.updateContact(contact._id, payload).subscribe((result) => {
      if (result) {
        this.getNewInvite(); // reload
      }
    });
  }

  public denyInvite(contact: IContactDocument) {
    this.updateInvitation(contact, {
      invitationDeny: true,
    });
  }

  public acceptInvite(contact: IContactDocument) {
    this.updateInvitation(contact, {
      invitationAccepted: true,
    });
  }

}
