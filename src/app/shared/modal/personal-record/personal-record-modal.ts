import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ModalController, NavParams } from '@ionic/angular';
import { IActivityDocument } from '../../models/activity/activity.interface';
import { ActivityService } from '../../services';

const jsFilename = 'personal-record-modal: ';

@Component({
  selector: 'personal-record-modal',
  templateUrl: './personal-record-modal.html',
  styleUrls: ['./personal-record-modal.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class PersonalRecordModal implements OnDestroy, OnInit {
  private activityId: string;
  public logCount: number;
  private subscriptions = [];
  public primarycolor = '#fafafa';
  public secondarycolor = '#00536B';
  public activity: IActivityDocument;

  public svg: SafeHtml;
  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
    private activityService: ActivityService,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
  ) {
    const $this = this;
  }
  ionViewWillEnter() {
    this.activityId = this.navParams.get('activityId');
    this.logCount = this.navParams.get('logCount');
    const subscription = this.activityService.getActivity(this.activityId).subscribe((foundActivity) => {
      if (foundActivity) {
        this.activity = foundActivity;
        this.setSvgData();
      }
    });
    this.subscriptions.push(subscription);
  }
  async dismiss() {
    const result = 'Close';
    await this.modalController.dismiss(result);
  }
  public ngOnInit() {
    const msgHdr = jsFilename + 'ngOnInit: ';
  }

  public ngOnDestroy() {
    //
  }

  private setSvgData() {
    const $this = this;
    const iconUrl = 'assets/icon/activity-icon/' + $this.activity.name + '.svg';

    this.http.get(
      iconUrl,
      {
        responseType: 'text',
      },
    ).subscribe((data) => {
      let svgContent = data.toString();
      svgContent = svgContent.replace(/\#000000/gi, this.primarycolor);
      svgContent = svgContent.replace(/\#cccccc/gi, this.secondarycolor);
      $this.svg = $this.sanitizer.bypassSecurityTrustHtml(svgContent);
    });
  }
}
