import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

const id = Math.random() * 10;

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  public isLoading = false;
  constructor(
    private loadingController: LoadingController,
  )
  { }

  async showLoader(options?: {
    message?: string,
    spinner?: string,
  }) {
    this.isLoading = true;

    return await this.loadingController.create(<any> options).then((loader) => {
      loader.present().then(() => {
        console.log(id + ': loading presented');
        if (!this.isLoading) {
          loader.dismiss().then(() => console.log(id + ': abort loading'));
        }
      });
    });
  }

  async hideLoader() {
    this.isLoading = false;
    return await this.loadingController.dismiss().then(() => console.log(id + ': loading dismissed'));
  }
}
