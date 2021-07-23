import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

const jsFilename = 'DocumentEventService: ';

interface IEventData {
  action: any;
}

@Injectable()
export class DocumentEventService {
  public subjectDocumentEvent: Subject<IEventData>;

  public lastMouseMoveDate = new Date();
  public lastKeypressDate = new Date();
  public lastEventDate = new Date();

  constructor(
  ) {
    const $this = this;
    this.subjectDocumentEvent = new Subject<IEventData>();

    document.addEventListener('mousemove', () => {
      $this.triggerMouseMove();
    });

    document.addEventListener('keypress', () => {
      $this.lastKeypressDate = new Date();
      $this.lastEventDate = new Date();
      $this.subjectDocumentEvent.next({
        action: 'keypress',
      });
    });
  }

  public triggerMouseMove() {
    const $this = this;
    $this.lastMouseMoveDate = new Date();
    $this.lastEventDate = new Date();
    $this.subjectDocumentEvent.next({
      action: 'mousemove',
    });
  }

  public getTimeSinceLastMouseMove() {
    const now = new Date();
    return now.getTime() - this.lastMouseMoveDate.getTime();
  }

  public getTimeSinceLastEvent() {
    const now = new Date();
    return now.getTime() - this.lastEventDate.getTime();
  }
}
