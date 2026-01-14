type CameraListener = () => void;

class CameraLifecycle {
  private beforeOpen: CameraListener[] = [];
  private afterClose: CameraListener[] = [];

  onBeforeOpen(cb: CameraListener) {
    this.beforeOpen.push(cb);
    return () =>
      (this.beforeOpen = this.beforeOpen.filter((l) => l !== cb));
  }

  onAfterClose(cb: CameraListener) {
    this.afterClose.push(cb);
    return () =>
      (this.afterClose = this.afterClose.filter((l) => l !== cb));
  }

  notifyBeforeOpen() {
    this.beforeOpen.forEach((l) => l());
  }

  notifyAfterClose() {
    this.afterClose.forEach((l) => l());
  }
}

export const cameraLifecycle = new CameraLifecycle();
