import { Component, OnDestroy } from '@angular/core';

import { ActionSheetController, AlertController, ModalController, Platform } from '@ionic/angular';
import { App as CapacitorApp, AppState } from '@capacitor/app';
import { SafeArea } from 'capacitor-plugin-safe-area';
import { ScreenOrientation, ScreenOrientationResult } from '@capacitor/screen-orientation';
import { Network } from '@capacitor/network';
import { Capacitor } from '@capacitor/core';
import { EdgeToEdge } from '@capawesome/capacitor-android-edge-to-edge-support';
import { StatusBar, Style } from '@capacitor/status-bar';

import { AdmobService } from './shared/services/admob.service';
import { environment } from 'src/environments/environment';

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

  debounceTimer: ReturnType<typeof setTimeout> | null = null;
  debounceDelay = 2000; // Delay in milliseconds

  constructor(
    private platform: Platform,
    private admobService: AdmobService,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
  ) {
    this.platform.ready().then(async () => {
      if (Capacitor.getPlatform() === 'android') {
        EdgeToEdge.enable();
        EdgeToEdge.setBackgroundColor({ color: '#fff' });
        StatusBar.setStyle({ style: Style.Default });
      }
      this.checkSafeArea();
      this.addEventListeners();
    });
  }

  async checkSafeArea() {
    const { insets } = await SafeArea.getSafeAreaInsets();
    this.admobService.bannerMarginBottom = insets.bottom + 60;
  }

  addEventListeners() {
    // Handles app state change
    CapacitorApp.addListener('appStateChange', (state: AppState) => {
      if (!state.isActive) {
        this.pauseAd('appStateChange');
      } else {
        this.resumeAd('appStateChange');
      }
      this.isAppActive = state.isActive;
    });

    // Handles hardware back button event
    CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      this.handleBackBtnEvent(canGoBack);
    });

    // Handles screen orientation change event
    ScreenOrientation.addListener('screenOrientationChange', async (orientation: ScreenOrientationResult) => {
      this.pauseAd('screenOrientationChange');
      this.resumeAd('screenOrientationChange');
    });

    // Handles network change event
    Network.addListener('networkStatusChange', async (status) => {
      if (status.connected) {
        this.resumeAd('networkStatusChange');
      } else {
        this.pauseAd('networkStatusChange');
      }
    });
  }

  async handleBackBtnEvent(canGoBack: boolean) {
    const modal = await this.modalCtrl.getTop();
    const alert = await this.alertCtrl.getTop();
    const actionSheet = await this.actionSheetCtrl.getTop();

    if (modal) {
      await modal.dismiss();
      return;
    }

    if (alert) {
      await alert.dismiss();
      return;
    }

    if (actionSheet) {
      await actionSheet.dismiss();
      return;
    }

    if (canGoBack) {
      window.history.back();
    } else {
      if (this.admobService.isBannerAdPrepared) {
        await this.admobService.removeBannerAd();
      }
      await CapacitorApp.exitApp();
    }
  }

  resumeAd(caller?: string) {
    if (this.admobService.isAdmobInitialized && this.admobService.isBannerAdPrepared) {
      console.log('Resume Ad', caller);
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }
      
      this.debounceTimer = setTimeout(() => {
        // Call resumeAd after a delay
        this.admobService.resumeBannerAd(caller);
      }, this.debounceDelay);
    }
  }

  pauseAd(caller?: string) {
    if (this.admobService.isAdmobInitialized && this.admobService.isBannerAdPrepared) {
      console.log('Pause Ad', caller);
      this.admobService.hideBannerAd();
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
    EdgeToEdge?.disable();
  }
}
