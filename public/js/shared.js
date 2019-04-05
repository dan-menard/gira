class Loader {
  constructor() {
    this.loadingInterval = null;
    this.bodyTag = document.querySelector('body');
  }

  startLoading() {
    this.loadingInterval = setInterval(() => {
      const currentClassName = this.bodyTag.className;

      switch (currentClassName) {
        case 'one':
          this.bodyTag.className = 'two';
          break;
        case 'two':
          this.bodyTag.className = 'three';
          break;
        case 'three':
          this.bodyTag.className = 'one';
          break;
      }

    }, 400);
  }

  stopLoading() {
    clearInterval(this.loadingInterval);
  }
}
