export default class MenuUiReplacer extends Plugin {
    async prestart() {
        const menus = await this.getMenus();

        const playerMenus = window.customPlayerMenus = new Map;

        let customMenuGfx;
        if (menus.length) {
            customMenuGfx = await this._createCustomMenu();
        }


        for (const menu of menus) {
            const copy = JSON.parse(JSON.stringify(menu));
            copy.menuGfx = customMenuGfx;
            copy.gfx = new ig.Image(menu.gfx);
            this.createIcon(copy);
            
            if (menu.circuitIconGfx) {
                copy.circuitIconGfx = new ig.Image(menu.circuitIconGfx);
            }

            playerMenus.set(copy.name, copy);
        }

        console.log('Done setting up custom stuff.');
    }

    createIcon(config) {
        const gfx = config.gfx;
        const {offX, offY, sizeX, sizeY } = config.MapFloorButtonContainer;
        const iconGfx = new ig.ImageGui(gfx, offX, offY, sizeX, sizeY);
        config.icon = iconGfx;
        iconGfx.hook.transitions = {
            DEFAULT: {
                state: {},
                time: 0.2,
                timeFunction: KEY_SPLINES.LINEAR
            },
            HIDDEN: {
                state: {
                    alpha: 0
                },
                time: 0.2,
                timeFunction: KEY_SPLINES.LINEAR
            }
        }
    }

    getMenus() {
       return new Promise((resolve, reject) => {
            $.ajax({
                dataType: "json",
                url: "data/menu.json",
                success: (data) => {
                    resolve(data)
                },
                error: () => {
                    reject();
                }			
            });
       });
    }

    async getBaseMenuImg() {
        const img = new Image;

        await new Promise((resolve, reject) => {
			img.onload = () => {
				resolve();
			};

			img.onerror = () => {
				reject();
			};
            img.src = "media/gui/menu.png";
        });


        return img;
    }


    async _createCustomMenu() {
        const img = new ig.Image;
        const baseImage = await this.getBaseMenuImg();

        img.width = baseImage.width;
        img.height = baseImage.height;
        const settings = {
            width: baseImage.width,
            height: baseImage.height,
            clearInstructions: [{
                x: 280,
                y: 424,
                w: 16,
                h: 11
            },{
                x: 280,
                y: 472,
                w: 126,
                h: 35
            }]
        };

        const modifiedImage = await this._createTemplateImage(baseImage, settings);
        img.data = modifiedImage;
        return img;
    }


    async _createTemplateImage(baseImage, settings) {
        const canvas = document.createElement("canvas");
        
        canvas.width = settings.width;
        canvas.height = settings.height;
        const ctx = canvas.getContext("2d");

        ctx.drawImage(baseImage, 0, 0);
        
        for (const {x, y, w, h} of settings.clearInstructions) {
            ctx.clearRect(x, y, w, h);			
        }
        
        return await this.loadImage(canvas.toDataURL("image/png"));
    }

    async loadImage(src) {
		let imgData = new Image;
		

		await new Promise((resolve, reject) => {
			imgData.onload = () => {
				resolve();
			};

			imgData.onerror = () => {
				reject();
			};

			imgData.src = src;
		});
		return imgData;
	}
}