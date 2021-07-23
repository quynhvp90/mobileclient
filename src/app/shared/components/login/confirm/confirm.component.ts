// import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
// import { Router, ActivatedRoute, Params } from '@angular/router';
// // import { AlertService } from '../../../shared/services/alert.service';
// // import { AuthenticationService } from '../../../shared/services/authentication.service';

// @Component({
//   selector: 'app-login-confirm',
//   templateUrl: './confirm.component.html',
//   encapsulation: ViewEncapsulation.None,
// })
// export class LoginConfirmComponent implements OnInit {

//   loading = false;

//   constructor(
//     private router: Router,
//     private route: ActivatedRoute,
//     // private alertService: AlertService,
//     // private authenticationService: AuthenticationService,
//   ) { }

//   ngOnInit(): void {

//     this.route.queryParams.subscribe((params: Params) => {
//       const activity = params['activity'];
//       const token = params['token'];
//       const uid = params['uid'];
//       // console.log('params = ', params);

//       this.loading = true;
//       // this.authenticationService.confirm(activity, token, uid).subscribe((user) => {
//       //   this.loading = false;
//       //   console.log('login user = ', user);
//       // });
//     });

//   }

// }
