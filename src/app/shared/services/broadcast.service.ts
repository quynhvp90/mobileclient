import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

export interface IResetMessage {
  message: string;
}

export interface IUniversalmessage {
  name: string;
  message: any;
}

@Injectable()
export class BroadcastService {
  public state;
  public subjectUniversal;

  private subject;

  constructor() {
    this.subject = new Subject<IResetMessage>();
    this.state = this.subject;

    this.subjectUniversal = new Subject<IUniversalmessage>();
  }

  public broadcast(name: string, message?: any) {
    this.subjectUniversal.next({ name, message });
  }
}
