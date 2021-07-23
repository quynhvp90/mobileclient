import { Injectable, Optional, SkipSelf } from '@angular/core';
import { Animation } from '@ionic/core';

const jsFilename = 'animation.service: ';
let animateExit = true;

@Injectable()
export class AnimationService {
  public animateExit = true;

  constructor() {
  }

  public animateOff() {
    console.log('animate off');
    animateExit = false;
    this.animateExit = false;
  }

  public animateOn() {
    animateExit = true;
    this.animateExit = true;
  }

  public enterFromRight(animation: Animation, baseEl: HTMLElement): Promise<Animation> {
    const baseAnimation = new animation();

    const backdropAnimation = new animation();
    backdropAnimation.addElement(baseEl.querySelector('ion-backdrop'));

    const wrapperAnimation = new animation();
    wrapperAnimation.addElement(baseEl.querySelector('.modal-wrapper'));

    wrapperAnimation.beforeStyles({ opacity: 1 })
      .fromTo('translateX', '100%', '0%');

    backdropAnimation.fromTo('opacity', 0.01, 0.4);

    return Promise.resolve(baseAnimation
      .addElement(baseEl)
      .easing('cubic-bezier(0.36,0.66,0.04,1)')
      .duration(250)
      .beforeAddClass('show-modal')
      .add(backdropAnimation)
      .add(wrapperAnimation));

  }

  public leaveToRight(animation: Animation, baseEl: HTMLElement): Promise<Animation> {
    const $this = this;
    console.log('leavingToRight');
    console.log('$this = ', $this);
    console.log('animateExit - ', animateExit);
    // console.log('$this.animateExit = ', $this.animateExit);
    if (!animateExit) {
      return Promise.resolve(new animation());
    }

    const baseAnimation = new animation();

    const backdropAnimation = new animation();
    backdropAnimation.addElement(baseEl.querySelector('ion-backdrop'));

    const wrapperAnimation = new animation();
    const wrapperEl = baseEl.querySelector('.modal-wrapper');
    wrapperAnimation.addElement(wrapperEl);
    const wrapperElRect = wrapperEl!.getBoundingClientRect();

    wrapperAnimation.beforeStyles({ opacity: 1 })
      .fromTo('translateX', '0%', `${window.innerWidth - wrapperElRect.left}px`);

    backdropAnimation.fromTo('opacity', 0.4, 0.0);

    return Promise.resolve(baseAnimation
      .addElement(baseEl)
      .easing('ease-out')
      .duration(250)
      .add(backdropAnimation)
      .add(wrapperAnimation));
  }

  public leaveToLeft(animation: Animation, baseEl: HTMLElement): Promise<Animation> {
    const baseAnimation = new animation();

    const backdropAnimation = new animation();
    backdropAnimation.addElement(baseEl.querySelector('ion-backdrop'));

    const wrapperAnimation = new animation();
    const wrapperEl = baseEl.querySelector('.modal-wrapper');
    wrapperAnimation.addElement(wrapperEl);
    const wrapperElRect = wrapperEl!.getBoundingClientRect();

    wrapperAnimation.beforeStyles({ opacity: 1 })
      .fromTo('translateX', '0%', `${(window.innerWidth - wrapperElRect.left) * -1}px`);

    backdropAnimation.fromTo('opacity', 0.4, 0.0);

    return Promise.resolve(baseAnimation
      .addElement(baseEl)
      .easing('ease-out')
      .duration(250)
      .add(backdropAnimation)
      .add(wrapperAnimation));
  }
}
