// Haptic Feedback Service
// Uses Vibration API for mobile devices

class HapticService {
  private enabled: boolean = true;
  private supported: boolean = 'vibrate' in navigator;

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isSupported(): boolean {
    return this.supported;
  }

  // Light tap - for button press
  lightTap() {
    if (!this.enabled || !this.supported) return;
    navigator.vibrate(10);
  }

  // Medium tap - for selection
  mediumTap() {
    if (!this.enabled || !this.supported) return;
    navigator.vibrate(25);
  }

  // Heavy tap - for important actions
  heavyTap() {
    if (!this.enabled || !this.supported) return;
    navigator.vibrate(50);
  }

  // Success pattern - two quick pulses
  success() {
    if (!this.enabled || !this.supported) return;
    navigator.vibrate([30, 50, 30]);
  }

  // Error pattern - single longer vibration
  error() {
    if (!this.enabled || !this.supported) return;
    navigator.vibrate([100, 30, 50]);
  }

  // Warning pattern - three short pulses
  warning() {
    if (!this.enabled || !this.supported) return;
    navigator.vibrate([20, 30, 20, 30, 20]);
  }

  // Celebration pattern - ascending pulses
  celebration() {
    if (!this.enabled || !this.supported) return;
    navigator.vibrate([20, 40, 30, 40, 40, 40, 60]);
  }

  // Notification pattern
  notification() {
    if (!this.enabled || !this.supported) return;
    navigator.vibrate([50, 100, 50]);
  }

  // Selection changed
  selectionChanged() {
    if (!this.enabled || !this.supported) return;
    navigator.vibrate(15);
  }

  // Custom pattern
  custom(pattern: number | number[]) {
    if (!this.enabled || !this.supported) return;
    navigator.vibrate(pattern);
  }

  // Stop any ongoing vibration
  stop() {
    if (!this.supported) return;
    navigator.vibrate(0);
  }
}

export const hapticService = new HapticService();
