 

class ImageLoader {
     
    static SUPPORTED_FORMATS = ['png', 'webp', 'jpg', 'jpeg', 'svg', 'gif'];

     
    static async loadImage(basePath, imgElement, formats = this.SUPPORTED_FORMATS) {
        for (const format of formats) {
            const imagePath = `${basePath}.${format}`;

            try {
                const loaded = await this.tryLoadImage(imagePath, imgElement);
                if (loaded) {
                    return true;
                }
            } catch (error) {
                 
                continue;
            }
        }

         
        this.hideImage(imgElement);
        return false;
    }

     
    static tryLoadImage(imagePath, imgElement) {
        return new Promise((resolve) => {
            const testImage = new Image();

            testImage.onload = () => {
                imgElement.src = imagePath;
                imgElement.style.display = '';
                resolve(true);
            };

            testImage.onerror = () => {
                resolve(false);
            };

            testImage.src = imagePath;
        });
    }

     
    static hideImage(imgElement) {
        imgElement.style.display = 'none';
        imgElement.removeAttribute('src');

         
         
    }

     
    static initAutoLoad() {
        document.addEventListener('DOMContentLoaded', () => {
            const autoLoadImages = document.querySelectorAll('img[data-auto-load]');

            autoLoadImages.forEach(img => {
                const basePath = img.getAttribute('data-auto-load');
                const formats = img.getAttribute('data-formats')?.split(',') || this.SUPPORTED_FORMATS;

                this.loadImage(basePath, img, formats);
            });
        });
    }

     
    static handleImageError(event) {
        const imgElement = event.target;
        this.hideImage(imgElement);
    }
}

 
ImageLoader.initAutoLoad();

 
window.ImageLoader = ImageLoader;
