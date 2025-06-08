import { Component, OnDestroy, OnInit } from '@angular/core';

import { Network } from '@capacitor/network';
// import { ToastController } from '@ionic/angular';

import { AdmobService } from '../shared/services/admob.service';
import { environment } from 'src/environments/environment';
import { Device } from '@capacitor/device';
import { SafeArea } from 'capacitor-plugin-safe-area';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: false,
})
export class TabsPage implements OnInit, OnDestroy {
  //
  adTimeout: any;

  interstitialAdUnit: string;
  bannerAdUnit: string;

  debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private admobService: AdmobService,
    // private toastCtrl: ToastController
  ) {
    this.getDeviceData();
    this.interstitialAdUnit = environment.interestCalInterstitialAdUnitId;
    this.bannerAdUnit = environment.interestCalBannerAdUnitId;
  }

  ngOnInit(): void {
    setTimeout(() => {
      if (!this.admobService.isAdmobInitialized) {
        this.admobService.initializeAdMob('tabs - OnInit');
      }
    }, 30 * 1000); // Check if Admob is initialized in 30 seconds else initialize
  }

  ngOnDestroy(): void {
    this.clearAdTimer();
    if (this.admobService.isBannerAdPrepared) {
      this.admobService.removeBannerAd();
    }
  }

  async ionViewWillEnter() {
    await this.initializeAdMob();
  }

  async ionViewWillLeave() {
    await this.admobService.removeBannerAd();
    this.clearAdTimer();
  }

  async initializeAdMob() {
    if (!this.admobService.isAdmobInitialized) {
      await this.admobService.initializeAdMob('tabs - ionViewWillEnter');
    }
    await this.showAds();
    const timer = this.admobService.getInterstitialTimer();
    if (timer > 0) {
      // Preparing Interstitial
      // await this.admobService.prepareInterstitialAd(this.interstitialAdUnit);
      this.prepareInterstitial(timer);
    }
    await this.toggleTimeout(timer);
  }

  async toggleTimeout(timer: number) {
    this.admobService.updateAdLog(`Toggle Timeout - ${timer}`);
    if (timer > 0) {
      this.checkForInterstitial(timer);
      // Set Timeout
      this.adTimeout = setTimeout(async () => {
        // Hide Banner Ad
        await this.admobService.hideBannerAd();

        // Show Interstitial
        await this.admobService.showInterstitialAd();

        // Resume Banner Ad
        await this.admobService.resumeBannerAd('toggleTimeout');

        // Get Next Timer
        timer = this.admobService.getInterstitialTimer();
        this.toggleTimeout(timer);
      }, timer);
    } else {
      // Clear Timeout
      this.clearAdTimer();
      this.admobService.updateAdLog('Clear Timeout');
    }
  }

  checkForInterstitial(interstitialTimer: number) {
    // Prepare Interstitial if not prepared
    if (!this.admobService.isInterstitialPrepared) {
      setTimeout(() => {
        if (!this.admobService.isInterstitialPrepared) {
          // await this.admobService.prepareInterstitialAd(this.interstitialAdUnit);
          this.prepareInterstitial(interstitialTimer);
        }
      }, 15 * 1000);
    }
  }

  prepareInterstitial(debounceDelay = 1000) {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    if (debounceDelay > 2 * 60 * 1000) { // 2 minutes
      debounceDelay = debounceDelay - (1 * 60 * 1000); // Total time - 1 minute
    } else {
      debounceDelay = 30 * 1000; // 30 seconds
    }
    
    this.debounceTimer = setTimeout(() => {
      // Call prepareInterstitial after a delay
      this.admobService.prepareInterstitialAd(this.interstitialAdUnit);
    }, debounceDelay);
  }

  async showAds() {
    const status = await Network.getStatus();
    if (!status.connected) {
      return;
    }
    setTimeout(() => {
      this.admobService.showBannerAd(this.bannerAdUnit);
    }, 2 * 1000);
  }

  clearAdTimer() {
    if (this.adTimeout) {
      clearTimeout(this.adTimeout);
    }
  }

  async getDeviceData() {
    const {androidSDKVersion, operatingSystem} = await Device.getInfo();
    // const batteryInfo = await Device.getBatteryInfo();
    if (!androidSDKVersion) {
      return;
    }
    this.admobService.androidSDKVersion = androidSDKVersion;
    this.admobService.operatingSystem = operatingSystem;
    if (androidSDKVersion < 35) {
      const { insets } = await SafeArea.getSafeAreaInsets();
      const ionHeaders = document.getElementsByTagName('ion-header') as unknown as any[];
      if (ionHeaders) {
        const paddingTop = insets.top > 0 ? `${insets.top}px` : '24px';
        ionHeaders.forEach(element => {
          element.style.setProperty('padding-top', paddingTop);
        });
      }
    }
  }

  async showToast(message: string, color: string) {
    // const toast = await this.toastCtrl.create({
    //   message: message,
    //   color: color,
    //   position: 'top',
    //   duration: 2000,
    // });
    // await toast.present();
  }
}
