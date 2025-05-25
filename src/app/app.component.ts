import { Component, OnDestroy } from '@angular/core';

import { ActionSheetController, AlertController, ModalController, Platform } from '@ionic/angular';
import { App as CapacitorApp, AppState } from '@capacitor/app';
import { SafeArea } from 'capacitor-plugin-safe-area';
import { ScreenOrientation, ScreenOrientationResult } from '@capacitor/screen-orientation';
import { Network } from '@capacitor/network';

import { AdmobService } from './shared/services/admob.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnDestroy {
  //
  isAppActive: boolean;
  isShowAdsCalled: boolean;

  constructor(
    private platform: Platform,
    private admobService: AdmobService,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
  ) {
    this.platform.ready().then(async () => {
      this.admobService.initializeAdMob();
      this.checkSafeArea();
      this.addEventListeners();
      this.showAds();
    });
  }

  checkSafeArea() {
    SafeArea.getSafeAreaInsets().then(({ insets }) => {
      // if (!document.body.style.getPropertyValue('--ion-safe-area-top')) {
      //   document.body.style.setProperty("--ion-safe-area-top", `${insets.top}px`);
      // }
      // if (!document.body.style.getPropertyValue('--ion-safe-area-right')) {
      //   document.body.style.setProperty("--ion-safe-area-right", `${insets.right}px`);
      // }
      // const bottomSafeArea = document.body.style.getPropertyValue('--ion-safe-area-bottom');
      // if (!bottomSafeArea) {
      //   document.body.style.setProperty("--ion-safe-area-bottom", `${insets.bottom}px`);
      // }
      // if (!document.body.style.getPropertyValue('--ion-safe-area-left')) {
      //   document.body.style.setProperty("--ion-safe-area-left", `${insets.left}px`);
      // }
    });

    SafeArea.getStatusBarHeight().then(({ statusBarHeight }) => {
      if (!document.body.style.getPropertyValue('--ion-safe-area-top')) {
        document.body.style.setProperty("--ion-safe-area-top", `${statusBarHeight}px`);
      }
    });

    // SafeArea.addListener('safeAreaChanged', ({ insets }) => {
    //   console.log('Safe area changed:', insets);
    // });
  }

  async showAds() {
    const status = await Network.getStatus();
    if (!status.connected) {
      return;
    }
    // const tabBar = document.querySelector('ion-tab-bar');
    // const tabBarProps = tabBar?.getBoundingClientRect();
    setTimeout(() => {
      // const adUnitId = environment.interestCalBannerAdUnitId;
      const adUnitId = 'ca-app-pub-3940256099942544/6300978111'; // Test Ad Unit ID
      this.admobService.showBannerAd('interest-calculator', adUnitId);
      this.isShowAdsCalled = true;
    }, 2000);
  }

  addEventListeners() {
    // Handles app state change
    CapacitorApp.addListener('appStateChange', (state: AppState) => {
      if (this.isShowAdsCalled && this.admobService.isAdsDisplayed) {
        if (!state.isActive) {
          this.admobService?.hideBannerAd();
        } else {
          setTimeout(() => {
            this.admobService.resumeBannerAd();
          }, 5000);
        }
      }
      this.isAppActive = state.isActive;
    });
    // Handles hardware back button event
    CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      this.handleBackBtnEvent(canGoBack);
    });
    // Handles screen orientation change event
    ScreenOrientation.addListener('screenOrientationChange', async (orientation: ScreenOrientationResult) => {
      if (this.isShowAdsCalled && this.admobService.isAdsDisplayed) {
        this.admobService.hideBannerAd();
        setTimeout(() => {
          this.admobService.resumeBannerAd();
        }, 5000);
      }
    });
    // Handles network change event
    Network.addListener('networkStatusChange', async (status) => {
       if (this.isShowAdsCalled && this.admobService.isAdsDisplayed) {
         if (status.connected) {
           this.admobService.resumeBannerAd();
         } else {
           this.admobService.hideBannerAd();
         }
       }
    });
  }

  async handleBackBtnEvent(canGoBack: boolean) {
    const modal = await this.modalCtrl.getTop();
    const alert = await this.alertCtrl.getTop();
    const actionSheet = await this.actionSheetCtrl.getTop();

    if (modal) {
      modal.dismiss();
      return;
    }

    if (alert) {
      alert.dismiss();
      return;
    }

    if (actionSheet) {
      actionSheet.dismiss();
      return;
    }

    if (canGoBack) {
      window.history.back();
    } else {
      CapacitorApp.exitApp();
    }
  }

  ngOnDestroy() {
    this.admobService?.hideBannerAd();
    this.admobService?.removeBannerAd();
    // Removing listeners
    CapacitorApp?.removeAllListeners();
    ScreenOrientation?.removeAllListeners();
    SafeArea?.removeAllListeners();
    Network?.removeAllListeners();
  }
}
