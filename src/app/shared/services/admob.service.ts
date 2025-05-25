import { Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { AdMob, BannerAdOptions, BannerAdPosition, BannerAdPluginEvents, AdmobConsentStatus, AdmobConsentDebugGeography, BannerAdSize } from '@capacitor-community/admob';

@Injectable({
  providedIn: 'root'
})
export class AdmobService {
  //
  isAdsDisplayed: boolean = false;

  constructor(private toastCtrl: ToastController, private alertCtrl: AlertController) {
    // this.initializeAdMob();
  }

  async initializeAdMob() {
    await AdMob.initialize();

    const consentInfo = await AdMob.requestConsentInfo({
      debugGeography: AdmobConsentDebugGeography.EEA,
    });

    if (consentInfo.isConsentFormAvailable && consentInfo.status === AdmobConsentStatus.REQUIRED) {
      await AdMob.showConsentForm();
    }
  }

  async showBannerAd(tab: string, adUnitId: string, margin: number = 60) {
    const options: BannerAdOptions = {
      adId: adUnitId, // Test Ad Unit ID
      adSize: BannerAdSize.BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: margin,
      isTesting: true,
    };

    AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
      // console.log('Banner ad loaded');
    });
    
    AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (err) => {
      // console.warn(`Banner Failed in ${tab}:`, err);
      this.isAdsDisplayed = false;
    });
    
    AdMob.addListener(BannerAdPluginEvents.Opened, () => {
      // console.log(`Banner Clicked in ${tab}`);
    });
    await AdMob.showBanner(options);
    this.isAdsDisplayed = true;
    // await this.showToast(margin);
  }

  async hideBannerAd() {
    await AdMob.hideBanner();
  }

  async resumeBannerAd() {
    await AdMob.resumeBanner().catch(e => console.log(e));
  }

  async removeBannerAd() {
    await AdMob.removeBanner().catch(e => console.log(e));
    this.isAdsDisplayed = false;
  }

  async showToast(height?: number) {
    const toast = await this.toastCtrl.create({
      header: 'Ad loaded successfully' + (height ? ` at ${height}px` : ''),
      position: 'top',
      color: 'success',
      duration: 3000,
    });
    await toast.present();
  }
}
