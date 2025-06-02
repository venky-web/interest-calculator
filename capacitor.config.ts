import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vigital.vorks.interestbookandcalculator',
  appName: 'Interest Book & Calculator',
  webDir: 'www',
  plugins: {
    // SafeArea: {
    //   enabled: true,
    //   customColorsForSystemBars: true,
    //   statusBarColor: '#94369b',
    //   statusBarContent: 'light',
    //   navigationBarColor: '#ffffff',
    //   navigationBarContent: 'light',
    // },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
