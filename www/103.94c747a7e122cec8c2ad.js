(window.webpackJsonp=window.webpackJsonp||[]).push([[103],{Ij2M:function(n,e,t){"use strict";t.r(e);var o=t("CcnG"),l=function(){},i=t("7/AN"),a=t("on/2"),s=t("tTYc"),r=t("4P46"),c=t("tiYG"),u=t("Th+j"),d=t("qClq"),p=t("LZe2"),m=t("DRNH"),h=t("0Sk5"),b=t("dNpj"),g=t("CDu5"),f=t("mZ7j"),v=t("os0Y"),C=t("Vvn8"),R=t("GeSC"),M=t("IVGI"),S=t("5tdw"),y=t("BXv0"),I=t("6lpc"),N=t("lK7U"),w=t("v3Ef"),O=t("fB67"),P=t("JA7S"),L=t("Zs19"),Z=t("h662"),_=t("pMnS"),D=t("oBZk"),k=t("ZZ/e"),A=(t("ZF+8"),t("Vx+w")),E=t("AytR"),F=t("nm5K"),x=(t("Ubbs"),function(){function n(n,e,t,o,l,i,a,s){this.apiService=n,this.platform=e,this.broadcastService=t,this.modalController=o,this.globalService=l,this.ionicAlertService=i,this.shareService=a,this.userService=s,this.version=A.a.version,this.apiVersion="tbd",this.apiEndpoint=E.a.api,this.subscribed=!1,this.isCapacitor=!1,this.notHasLicense=!0,this.subscriptions=[],this.isLocalDev="http://localhost:4000"===E.a.api,this.foundUser=null,this.ionicConfig={deployChannel:"",isBeta:!1,downloadProgress:0,downloadStarted:!1,updateAvailable:!1,updateSnapshot:"",msg:""};this.foundUser=this.userService.user}return n.prototype.ngOnInit=function(){var n=this,e=this;this.apiService.get({resource:"v1/version"}).subscribe((function(n){console.log("res = ",n),e.apiVersion=n.toString()}));var t=this.userService.getCurrentUser().subscribe((function(n){console.log("getCurrentUser: res = ",n)}));this.subscriptions.push(t),t=this.broadcastService.subjectUniversal.subscribe((function(n){n.name})),this.subscriptions.push(t),this.platform.ready().then((function(){n.isCapacitor=n.platform.is("capacitor")}))},n.prototype.ngOnDestroy=function(){this.subscriptions.forEach((function(n){n.unsubscribe()}))},n}()),j=t("B7fh"),T=t("6GTT"),U=t("ctYg"),B=t("hoyf"),Y=t("kmKP"),G=[[".tab3[_ngcontent-%COMP%]   .well[_ngcontent-%COMP%]{background:#fff;padding:8px;margin:8px;border:1px solid #ccc;border-radius:5px}.tab3[_ngcontent-%COMP%]   .well[_ngcontent-%COMP%]   .title[_ngcontent-%COMP%]{font-size:20px;font-weight:700;margin-bottom:10px}"]],V=o["\u0275crt"]({encapsulation:0,styles:G,data:{}});function q(n){return o["\u0275vid"](0,[(n()(),o["\u0275eld"](0,0,null,null,6,"ion-header",[["class","activity-list-header"]],null,null,null,D.eb,D.n)),o["\u0275did"](1,49152,null,0,k.B,[o.ChangeDetectorRef,o.ElementRef,o.NgZone],null,null),(n()(),o["\u0275eld"](2,0,null,0,4,"ion-toolbar",[["class","top-toolbar"]],null,null,null,D.Hb,D.Q)),o["\u0275did"](3,49152,null,0,k.Cb,[o.ChangeDetectorRef,o.ElementRef,o.NgZone],null,null),(n()(),o["\u0275eld"](4,0,null,0,2,"ion-title",[["style","width: 100%; text-align: center;"]],null,null,null,D.Fb,D.O)),o["\u0275did"](5,49152,null,0,k.Ab,[o.ChangeDetectorRef,o.ElementRef,o.NgZone],null,null),(n()(),o["\u0275ted"](-1,0,[" Settings "])),(n()(),o["\u0275eld"](7,0,null,null,1,"ion-content",[["class","tab3"],["style","--background: #e6ebf1;"]],null,null,null,D.bb,D.k)),o["\u0275did"](8,49152,null,0,k.u,[o.ChangeDetectorRef,o.ElementRef,o.NgZone],null,null)],null,null)}var K=o["\u0275ccf"]("app-settings",x,(function(n){return o["\u0275vid"](0,[(n()(),o["\u0275eld"](0,0,null,null,1,"app-settings",[],null,null,null,q,V)),o["\u0275did"](1,245760,null,0,x,[F.a,k.Lb,j.a,k.Ib,T.a,U.a,B.a,Y.a],null,null)],(function(n,e){n(e,1,0)}),null)}),{},{},[]),z=t("Ip0R"),H=t("gIcY"),J=t("dK0e"),Q=t("LkPl"),X=t("ECMn"),W=t("PCNd"),$=t("ZYCi");t.d(e,"SettingsPageModuleNgFactory",(function(){return nn}));var nn=o["\u0275cmf"](l,[],(function(n){return o["\u0275mod"]([o["\u0275mpd"](512,o.ComponentFactoryResolver,o["\u0275CodegenComponentFactoryResolver"],[[8,[i.a,a.a,s.a,r.a,c.a,u.a,d.a,p.a,m.a,h.a,b.a,g.a,f.a,v.a,C.a,R.a,M.a,S.a,y.a,I.a,N.a,w.a,O.b,P.b,L.a,Z.a,_.a,K]],[3,o.ComponentFactoryResolver],o.NgModuleRef]),o["\u0275mpd"](4608,z.NgLocalization,z.NgLocaleLocalization,[o.LOCALE_ID,[2,z["\u0275angular_packages_common_common_a"]]]),o["\u0275mpd"](4608,k.c,k.c,[o.NgZone,o.ApplicationRef]),o["\u0275mpd"](4608,k.Ib,k.Ib,[k.c,o.ComponentFactoryResolver,o.Injector]),o["\u0275mpd"](4608,k.Mb,k.Mb,[k.c,o.ComponentFactoryResolver,o.Injector]),o["\u0275mpd"](4608,H.r,H.r,[]),o["\u0275mpd"](4608,H.d,H.d,[]),o["\u0275mpd"](4608,J.h,J.h,[o.PLATFORM_ID]),o["\u0275mpd"](4608,J.a,J.a,[o.PLATFORM_ID]),o["\u0275mpd"](4608,J.b,J.b,[o.PLATFORM_ID,J.h,J.a]),o["\u0275mpd"](4608,J.g,J.g,[J.e,J.d,J.b,J.h]),o["\u0275mpd"](4608,J.f,J.f,[J.e,J.d,J.b,J.h]),o["\u0275mpd"](1073742336,z.CommonModule,z.CommonModule,[]),o["\u0275mpd"](1073742336,k.Eb,k.Eb,[]),o["\u0275mpd"](1073742336,H.q,H.q,[]),o["\u0275mpd"](1073742336,H.g,H.g,[]),o["\u0275mpd"](1073742336,H.o,H.o,[]),o["\u0275mpd"](1073742336,J.c,J.c,[]),o["\u0275mpd"](1073742336,Q.a,Q.a,[]),o["\u0275mpd"](1073742336,X.Ng2OdometerModule,X.Ng2OdometerModule,[]),o["\u0275mpd"](1073742336,W.a,W.a,[]),o["\u0275mpd"](1073742336,$.o,$.o,[[2,$.t],[2,$.m]]),o["\u0275mpd"](1073742336,l,l,[]),o["\u0275mpd"](256,J.e,void 0,[]),o["\u0275mpd"](256,J.d,void 0,[]),o["\u0275mpd"](256,H.s,"never",[]),o["\u0275mpd"](1024,$.k,(function(){return[[{path:"",component:x}]]}),[])])}))}}]);