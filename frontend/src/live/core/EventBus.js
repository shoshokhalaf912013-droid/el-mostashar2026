class EventBus {
  constructor() {
    this.events = {};
    this.globalListeners = [];
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }

    this.events[event].push(callback);
  }

  onAll(callback) {
    this.globalListeners.push(callback);
  }

  emit(event, data) {
    console.log(`📡 EVENT EMITTED: ${event}`, data);

    // global listeners (debug)
    this.globalListeners.forEach(cb => cb(event, data));

    if (this.events[event]) {
      this.events[event].forEach(cb => cb(data));
    }
  }

  off(event, callback) {
    if (!this.events[event]) return;

    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }
}

export default new EventBus();