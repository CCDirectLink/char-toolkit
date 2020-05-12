export class ImageUtils {
    static async createImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image;
            img.onload = function () {
                resolve(img);
            }
            img.onerror = function () {
                reject();
            }
            img.src = src;
        });
    }

    static async loadImage(src) {
        return await new Promise((resolve, reject) => {
            const img = new ig.Image(src);
            img.addLoadListener({
                onLoadableComplete: function (loaded, image) {
                    // replace image
                    if (loaded) {
                        image.decreaseRef();
                        if (!image.failed) {
                            resolve(img.data);

                        } else {
                            reject();
                        }

                    }
                }
            });
        });
    }
}