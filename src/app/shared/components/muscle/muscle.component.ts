import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import * as $ from 'jquery';
import {
  ActivityLogService,
  BroadcastService,
  ActivityService,
  UserService } from '../../../shared/services';

const jsFilename = 'muscle: ';

@Component({
  selector: 'muscle',
  templateUrl: './muscle.component.html',
  styleUrls: ['./muscle.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class MuscleComponent implements OnDestroy, OnInit {
  @Input() public muscles = '';
  @Input() public mode = ''; // view
  @Output() public pathsSelected: EventEmitter<string> = new EventEmitter<string>();

  public svg: SafeHtml;
  public selectedPath = [];
  public displayPaths = '';
  private subscriptions = [];

  constructor(
    private sanitizer: DomSanitizer,
    private broadcastService: BroadcastService,
    private http: HttpClient) {

  }
  ngAfterViewInit() {
    //
  }
  ngOnInit() {
    this.setSvgData();
    const subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      if (msg.name === 'updatedMuscles') {
        this.muscles =  msg.message.muscles;
        this.mode = msg.message.mode;
        console.log(msg.message);
        this.initSelectedMuscles();
      }
    });
    this.subscriptions.push(subscription);
  }

  private initSelectedMuscles () {
    if (this.muscles && this.muscles.length > 0) {
      this.selectedPath = this.muscles.split(',');
      // hightlight selected paths
      this.selectedPath.forEach((pathName) => {
        this.enterPathName(pathName);
      });
    } else {
      $('path').css('opacity', '0.3'); // all path disable
    }
  }

  private setSvgData() {
    const $this = this;
    const iconUrl = '/assets/data/muscle-groups.svg';

    this.http.get(
      iconUrl,
      {
        responseType: 'text',
      },
    ).subscribe((data) => {
      const svgContent = data.toString();
      this.svg = this.sanitizer.bypassSecurityTrustHtml(svgContent);
      setTimeout(() => {
        $('path').css('opacity', '0.3'); // all path disable
        this.initSelectedMuscles();
        $('path').click((data) => {
          if (this.mode === 'view') {
            return;
          }
          const pathName = data.target.className.animVal;
          console.log(data.target.className.animVal);
          if (!pathName || pathName.length === 0) {
            return;
          }
          // add to selected paths
          if (this.selectedPath.indexOf(pathName) < 0) {
            this.selectedPath.push(pathName);
            this.displayPaths = this.selectedPath.join(',');
            this.pathsSelected.emit(this.displayPaths);
            $this.enterPathName(pathName);

          } else if (this.selectedPath.indexOf(pathName) >= 0) {  // remove to selected paths

            const index = this.selectedPath.indexOf(pathName);
            this.selectedPath.splice(index, 1);
            this.displayPaths = this.selectedPath.join(',');
            this.pathsSelected.emit(this.displayPaths);
            $this.leavePathName(pathName);
          }
        });

        $('path').on({
          mouseenter: function (data) {
            if ($this.mode === 'view') {
              return;
            }
            const pathName = data.target.className.animVal;
            if (!pathName || pathName.length === 0) {
              return;
            }
            $this.enterPathName(pathName);
          },
          mouseleave: function (data) {
            if ($this.mode === 'view') {
              return;
            }
            const pathName = data.target.className.animVal;
            if (!pathName || pathName.length === 0) {
              return;
            }
            $this.leavePathName(pathName);
          },
        });
      }, 100);
    });
  }
  //
  private enterPathName (pathName: string) {
    const specialChar = '.';
    $(specialChar + pathName).css('opacity', '1');
  }
  private leavePathName (pathName: string) {
    if (this.selectedPath.indexOf(pathName) >= 0) {
      return; // in selected path
    }
    const specialChar = '.';
    $(specialChar + pathName).css('opacity', '0.3');
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

}
