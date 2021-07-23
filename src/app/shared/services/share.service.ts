import { Injectable, Optional, SkipSelf } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { IonicAlertService } from './ionic.alert.service';

const { Share, Clipboard } = Plugins;


@Injectable()
export class ShareService {
  constructor(
    @Optional() @SkipSelf() prior: ShareService,
    private ionicAlertService: IonicAlertService,
  ) {
    if (prior) {
      return prior;
    }
  }

  public showSharePopup(options: {
    text: string,
    url: string,
    dialogTitle: string,
    clipboardValue: string,
    clipboardConfirmText: string,
    clipboardHeader?: string,
  }) {
    const msgHdr = 'showSharePopup: ';

    console.log(msgHdr + 'options = ', options);

    // Check ifCapacitor plugin works
    if (Share) {
      Share.share({
        // title: 'Join my LogReps challenge at the following link',
        text: options.text,
        url: options.url,
        dialogTitle: options.dialogTitle,
      }).then((shareDetails) => {
        console.log('success sharing = ', shareDetails);
      }).catch((errSending) => {
        console.log('errSending = ', errSending);

        // this.ionicAlertService.presentAlert('Sorry - it looks like sharing is not available on your device');
        this.fallbackPrompt(options);
      });
    } else {
      this.fallbackPrompt(options);
    }
  }

  private fallbackPrompt(options: {
    text: string,
    url: string,
    dialogTitle: string,
    clipboardValue: string,
    clipboardConfirmText: string,
    clipboardHeader?: string,
  }) {
    let clipboardHeader = 'Share the following link via email, facebook, etc';
    if (options.clipboardHeader) {
      clipboardHeader = options.clipboardHeader;
    }

    this.ionicAlertService.presentValue({
      header: clipboardHeader,
      input: {
        name: 'name',
        value: options.clipboardValue,
      },
      buttons: {
        primary: {
          label: 'Copy to clipboard',
        },
      },
    }, () => {
      Clipboard.write({
        string: options.clipboardValue,
      });
      this.ionicAlertService.presentAlert('The link has been copied to your clipboard');
    });
  }
}
