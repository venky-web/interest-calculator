import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { ToastController } from '@ionic/angular';
import { Network } from '@capacitor/network';
import {
  AdMob,
  BannerAdOptions,
  BannerAdPosition,
  BannerAdPluginEvents,
  BannerAdSize,
  InterstitialAdPluginEvents,
  AdOptions,
} from '@capacitor-community/admob';

@Injectable({
  providedIn: 'root',
})
export class AdmobService {
  //
  bannerMarginBottom: number = 60;

  private _isAdmobInitialized: boolean = false;
  private _isBannerPrepared: boolean = false;
  private _isBannerHidden: boolean = false;
  private _isInterstitialPrepared: boolean = false;

  private adFailedTimes = 0;
  private lastAdDisplayCount = 0;

  private bannerAdUnit: string;
  private interstitialAdUnit: string;

  private readonly MAX_ADS_PER_DAY = 3;
  private readonly GAP_BETWEEN_ADS_MS = 3 * 60 * 1000; // 3 minutes
  private readonly FIRST_AD_DELAY_MS = 2 * 60 * 1000; // 2 minutes
  private readonly LATE_NIGHT_HOUR = 22; // 10 PM
  private readonly LATE_NIGHT_AD_DELAY_MS = 10 * 1000; // 10 seconds

  private adLogs$ = new BehaviorSubject<any>([]);

  constructor(
    private toastCtrl: ToastController,
  ) {
    // this.initializeAdMob();
  }

  async initializeAdMob(part?: string) {
    this.updateAdLog(`Initializing Admob - ${part}`);
    const status = await Network.getStatus();
    if (!status.connected) {
      return;
    }
    await AdMob.initialize();
    // this.updateAdLog(`preparing consent form - ${part}`);
    // const consentInfo = await AdMob.requestConsentInfo({
    //   debugGeography: AdmobConsentDebugGeography.EEA,
    // });
    // this.updateAdLog(`Admob Consent Form Requested - ${part}`);
    // if (
    //   consentInfo.isConsentFormAvailable &&
    //   consentInfo.status === AdmobConsentStatus.REQUIRED
    // ) {
    //   await AdMob.showConsentForm();
    // }
    // this.updateAdLog(`Admob Consent Form Shown - ${part}`);
    this._isAdmobInitialized = true;
    this.updateAdLog(`Setup Admob Listeners - ${part}`);
    this.setupAdListeners();
    this.updateAdLog(`Initialized Admob - ${part}`);
  }

  get isAdmobInitialized() {
    return this._isAdmobInitialized;
  }

  get isBannerAdPrepared() {
    return this._isBannerPrepared;
  }

  get isInterstitialPrepared() {
    return this._isInterstitialPrepared;
  }

  get adLogSub() {
    return this.adLogs$.asObservable();
  }

  updateAdLog(message: string) {
    // this.adLogs$.next({ message: message, timestamp: new Date().toLocaleString() });
  }

  async showBannerAd(adUnitId: string) {
    const status = await Network.getStatus();
    if (!status.connected) {
      return;
    }

    if (!this._isAdmobInitialized) {
      await this.initializeAdMob('showBannerAd');
    }

    if (!adUnitId || this._isBannerPrepared) {
      return;
    }

    this.bannerAdUnit = adUnitId;
    const options: BannerAdOptions = {
      adId: this.bannerAdUnit,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: this.bannerMarginBottom && this.bannerMarginBottom < 85 ? this.bannerMarginBottom : 75,
      isTesting: true,
    };

    await AdMob.showBanner(options);
    this._isBannerPrepared = true;
    this.updateAdLog('Banner Ad Prepared');
  }

  async hideBannerAd() {
    if (!this._isBannerPrepared) {
      return;
    }
    await AdMob.hideBanner();
    this._isBannerHidden = true;
    this.updateAdLog('Banner Ad Hidden');
  }

  async resumeBannerAd(caller?: string) {
    if (!this._isBannerPrepared || !this._isBannerHidden) {
      return;
    }
    await AdMob.resumeBanner().catch((e) => console.log(e));
    this._isBannerHidden = false;
    this.updateAdLog(`Banner Ad Resumed - ${caller}`);
  }

  async removeBannerAd() {
    await AdMob.removeBanner().catch((e) => console.log(e));
    this._isBannerPrepared = false;
    this.updateAdLog('Banner Ad Removed');
  }

  private setupAdListeners() {
    // Interstitial Ad Listeners
    AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
      // this.prepareInterstitialAd(this.interstitialAdUnit); // Preload the next ad
    });

    // Banner Ad Listeners
    AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
      this.adFailedTimes = 0;
    });

    AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (err) => {
      this.adFailedTimes = this.adFailedTimes + 1;
      if (this.adFailedTimes < 3) {
        this.showBannerAd(this.bannerAdUnit);
      }
      this._isBannerPrepared = false;
    });

    AdMob.addListener(BannerAdPluginEvents.Opened, () => {
      this.adFailedTimes = 0;
    });
  }

  // Timer for Interstitial Ads
  getInterstitialTimer() {
    this.lastAdDisplayCount = this.getLastAdDisplayCount();
    if (this.lastAdDisplayCount >= this.MAX_ADS_PER_DAY) {
      return 0;
    }
    // Check for first ad
    if (this.lastAdDisplayCount === 0) {
      if (this.isAfter10PM()) {
        return this.LATE_NIGHT_AD_DELAY_MS;
      }
      return this.FIRST_AD_DELAY_MS;
    }
    return this.GAP_BETWEEN_ADS_MS * (this.lastAdDisplayCount  + 1);
  }

  async prepareInterstitialAd(adUnitId: string) {
    if (!adUnitId || this._isInterstitialPrepared || this.lastAdDisplayCount >= this.MAX_ADS_PER_DAY) {
      return;
    }

    const status = await Network.getStatus();
    if (!status.connected) {
      return;
    }

    if (!this._isAdmobInitialized) {
      await this.initializeAdMob('prepareInterstitialAd');
    }
    const options: AdOptions = {
      adId: adUnitId,
      isTesting: true, // Set to false in production
    };

    try {
      await AdMob.prepareInterstitial(options);
      this._isInterstitialPrepared = true;
      // console.log('Interstitial ad prepared successfully', new Date().toLocaleString());
      this.updateAdLog('Interstitial Ad Prepared');
    } catch (error) {
      this.showToast('Error preparing interstitial ad', 'danger');
      this.updateAdLog('Error preparing interstitial ad');
    }
  }

  async showInterstitialAd() {
    if (!this._isInterstitialPrepared || this.lastAdDisplayCount >= this.MAX_ADS_PER_DAY) {
      return;
    }

    const status = await Network.getStatus();
    if (!status.connected) {
      return;
    }

    try {
      await AdMob.showInterstitial();
      this.incrementAdDisplayCount();
      this._isInterstitialPrepared = false;
      // console.log('Interstitial ad shown successfully', new Date().toLocaleString());
      this.updateAdLog('Interstitial Ad Shown');
    } catch (error) {
      this.showToast('Error showing interstitial ad', 'danger');
      this.updateAdLog('Error showing interstitial ad');
    }
  }

  // Helper functions
  private async incrementAdDisplayCount() {
    this.lastAdDisplayCount += 1;
    localStorage.setItem('lastAdDisplayCount', this.lastAdDisplayCount.toString());
    localStorage.setItem('lastAdDisplayDate', new Date().toLocaleDateString());
    this.updateAdLog(`Ad Display Count Incremented to ${this.lastAdDisplayCount}`);
  }

  private getLastAdDisplayCount(): number {
    const lastAdDisplayDate = localStorage.getItem('lastAdDisplayDate');
    if (!lastAdDisplayDate || lastAdDisplayDate !== new Date().toLocaleDateString()) {
      localStorage.setItem('lastAdDisplayCount', '0');
      localStorage.setItem('lastAdDisplayDate', new Date().toLocaleDateString());
      return 0;
    }
    const lastAdDisplayCount = Number(localStorage.getItem('lastAdDisplayCount'));
    if (!lastAdDisplayCount) {
      localStorage.setItem('lastAdDisplayCount', '0');
      localStorage.setItem('lastAdDisplayDate', new Date().toLocaleDateString());
      return 0;
    }
    return lastAdDisplayCount;
  }

  private isAfter10PM(): boolean {
    return new Date().getHours() >= this.LATE_NIGHT_HOUR;
  }

  private async showToast(header: string, color: string) {
    // const toast = await this.toastCtrl.create({
    //   header: header,
    //   position: 'top',
    //   color: color || 'primary',
    //   duration: 3000,
    // });
    // await toast.present();
  }
}
