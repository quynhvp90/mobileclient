import { Injectable, Optional, SkipSelf } from '@angular/core';

const jsFilename = 'utility.service: ';

@Injectable()
export class UtilityService {
  constructor(
    @Optional() @SkipSelf() prior: UtilityService) {

    if (prior) { return prior; }
  }

  public isValidEmail(email): boolean {
    // tslint:disable
    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    // tslint:enable

    return re.test(email);
  }

  public stripLabelSpecialChars(label: string) {
    return label.replace(/\:|\&|\(|\)|\{|\}|\<|\>|\s|\t/gi, '-').toLowerCase();
  }

  public stripHTML(html: string) {
    if (html && html.length > 0) {
      return html.replace(/<[^>]*>/g, '');
    }
  }

  public minToHHMMSS(minsNum: number, alwaysIncludeHours: boolean) {
    let hours: any = Math.floor(minsNum / 60);
    let minutes: any = Math.floor((minsNum - ((hours * 3600)) / 60));
    let seconds: any = Math.floor((minsNum * 60) - (hours * 3600) - (minutes * 60));

    // Appends 0 when unit is less than 10
    if (hours  < 10) { hours = '0' + hours; }
    if (minutes  < 10) { minutes = '0' + minutes; }
    if (seconds  < 10) { seconds = '0' + seconds; }
    if (hours === '00' && !alwaysIncludeHours) {
      return minutes + ':' + seconds;
    }

    return hours + ':' + minutes + ':' + seconds;
  }

  public msToHHMMSS(ms: number, alwaysIncludeHours: boolean) {
    // 1- Convert to seconds:
    let seconds: any = ms / 1000;
    // 2- Extract hours:
    let hours: any = Math.round(seconds / 3600); // 3,600 seconds in 1 hour
    seconds = seconds % 3600; // seconds remaining after extracting hours
    // 3- Extract minutes:
    let minutes: any = Math.round(seconds / 60); // 60 seconds in 1 minute
    // 4- Keep only seconds not extracted to minutes:
    seconds = seconds % 60;
    if (hours  < 10) { hours = '0' + hours; }
    if (minutes  < 10) { minutes = '0' + minutes; }
    if (seconds  < 10) { seconds = '0' + seconds; }

    if (hours === '00' && !alwaysIncludeHours) {
      return minutes + ':' + seconds;
    }

    return hours + ':' + minutes + ':' + seconds;
  }
}
