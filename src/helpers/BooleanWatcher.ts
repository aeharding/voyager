type BooleanChangeListener = (newValue: boolean) => void;

export default class BooleanWatcher {
  private value: boolean;
  private listeners: Set<BooleanChangeListener>;

  constructor(initialValue = false) {
    this.value = initialValue;
    this.listeners = new Set<BooleanChangeListener>();
  }

  setValue(newValue: boolean) {
    if (this.value !== newValue) {
      this.value = newValue;
      this.notifyListeners();
    }
  }

  getValue(): boolean {
    return this.value;
  }

  addEventListener(listener: BooleanChangeListener) {
    this.listeners.add(listener);
  }

  removeEventListener(listener: BooleanChangeListener) {
    this.listeners.delete(listener);
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      listener(this.value);
    }
  }
}
