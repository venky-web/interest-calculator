import { Component, OnDestroy, OnInit } from '@angular/core';

import { Network } from '@capacitor/network';
import { Platform, ToastController } from '@ionic/angular';

import { AdmobService } from '../shared/services/admob.service';
import { environment } from 'src/environments/environment';

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

  constructor(
    private admobService: AdmobService,
    private toastCtrl: ToastController,
    private platform: Platform,
  ) {
    this.interstitialAdUnit = 'ca-app-pub-3940256099942544/1033173712'; // Test Interstitial Ad Unit ID
    this.bannerAdUnit = 'ca-app-pub-3940256099942544/6300978111'; // Test Banner Ad Unit ID
    // Enable for deployment
    // this.interstitialAdUnit = environment.interestCalInterstitialAdUnitId; // Live Interstitial Ad Unit ID
    // this.bannerAdUnit = environment.interestCalBannerAdUnitId; // Live Banner Ad Unit ID
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
    const plaform = await this.platform.ready();
    console.log(plaform);
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
      await this.admobService.prepareInterstitialAd(this.interstitialAdUnit);
    }
    await this.toggleTimeout(timer);
  }

  async toggleTimeout(timer: number) {
    this.admobService.updateAdLog(`Toggle Timeout - ${timer}`);
    if (timer > 0) {
      this.checkForInterstitial();
      // Set Timeout
      this.adTimeout = setTimeout(async () => {
        // Hide Banner Ad
        await this.admobService.hideBannerAd();

        // Show Interstitial
        await this.admobService.showInterstitialAd();

        // Resume Banner Ad
        await this.admobService.resumeBannerAd();

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

  checkForInterstitial() {
    // Prepare Interstitial if not prepared
    if (!this.admobService.isInterstitialPrepared) {
      setTimeout(() => {
        if (!this.admobService.isInterstitialPrepared) {
          this.admobService.prepareInterstitialAd(this.interstitialAdUnit);
        }
      }, 15 * 1000);
    }
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

  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      color: color,
      position: 'top',
      duration: 2000,
    });
    await toast.present();
  }
}
