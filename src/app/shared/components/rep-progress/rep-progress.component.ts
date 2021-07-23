// import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';

// const jsFilename = 'rep-icons: ';

// @Component({
//   moduleId: module.id + '',
//   selector: 'rep-progress',
//   templateUrl: './rep-progress.component.html',
//   styleUrls: ['./rep-progress.component.scss']
// })

// export class RepProgressComponent implements OnDestroy, OnInit {
//   @Input() public user: any;
//   @Input() public width = '40px';
//   @Input() public height = '40px';

//   public avatar = {
//     url: null,
//     avatarColor: null,
//     firstLetter: null,
//   };

//   private subscriptions = [];

//   constructor(
//    //
//   ) {
//     const $this = this;
//   }

//   public ngOnDestroy() {
//     this.subscriptions.forEach((subscription) => {
//       subscription.unsubscribe();
//     });
//   }

//   public ngOnInit() {
//     const msgHdr = jsFilename + 'ngOnInit: ';
//     const $this = this;

//     if (!$this.user) {
//       // console.error(msgHdr + 'unexpected no user');
//       return;
//     }
//     if ($this.user.avatar) {
//       if (($this.user.avatar.indexOf('http') >= 0) || ($this.user.avatar.indexOf('assets') >= 0)) {
//         $this.avatar.url = $this.user.avatar;
//       } else {
//         $this.avatar.url = '/api/assets/' + $this.user.avatar + '/stream?action=view';
//       }
//     } else {
//       if ($this.user.firstLetter) {
//         $this.avatar.avatarColor = $this.user.avatarColor;
//         $this.avatar.firstLetter = $this.user.firstLetter;
//       } else {
//         // const avatarDetails = $this.utilityService.getAvatarDetails(this.user);
//        // $this.avatar.avatarColor = avatarDetails.avatarColor;
//        // $this.avatar.firstLetter = avatarDetails.firstLetter;
//       }
//     }
//   }
// }
