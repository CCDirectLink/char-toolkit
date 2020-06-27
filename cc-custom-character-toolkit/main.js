export default class CustomCharacterToolKit {
    constructor() {
        this.headGfxConfigs = [];
        this.indexes = {};
        this.configs = [];
    }

    async preload() {
        await UtilityResourceManager.addResourceListener('menu-ui-replacer', async (data) => {
            if (data.type === 'generator') {
                const generator = data.data;
                await this.addMenuConfig(await generator());
            } else {
                await this.addMenuConfig(data.data);
            }
        });

        ccmod3.resources.imagePatches.add('media/gui/severed-heads.png', (baseCanvas) => {
            if (this.headGfxConfigs.length === 0) {
                return;
            }
            const canvas = document.createElement('canvas');
            const roundedBaseImageWidth = baseCanvas.width - (baseCanvas.width % 24);


            canvas.width = roundedBaseImageWidth + this.headGfxConfigs.length * 24;
            canvas.height = 24;

            const ctx = canvas.getContext('2d');

            function drawImage(data, srcX, srcY, sizeX, sizeY, destX, destY) {
                ctx.drawImage(data, srcX, srcY, sizeX, sizeY, destX, destY, sizeX, sizeY);
            }

            drawImage(baseCanvas, 0, 0, roundedBaseImageWidth, 24, 0, 0);
            let offset = roundedBaseImageWidth;

            for (const headConfig of this.headGfxConfigs) {
                headConfig.headIdx = offset / 24;
                drawImage(headConfig['severed-head'], 0, 0, 24, 24, offset, 0);
                offset += 24;
            }

            return canvas;
        });
    }
    async prestart() {
        for (const config of this.configs) {
            if (!sc.PARTY_OPTIONS.includes(config.name)) {
                sc.PARTY_OPTIONS.push(config.name);
            }
        }
    }

    async poststart() {
        for (const config of this.configs) {
            sc.menuUiReplacer.addConfig(config);
        }
    }

    async addMenuConfig({ mod, menuConfig }) {
        const idx = this.configs.push(menuConfig) - 1;
        this.indexes[name] = idx;

        if (menuConfig.gfx) {
            menuConfig.gfx = await this.fetchImage(`/${mod.baseDirectory}assets/${menuConfig.gfx}`);
        }

        if (menuConfig.circuitIconGfx) {
            menuConfig.circuitIconGfx = await this.fetchImage(`/${mod.baseDirectory}assets/${menuConfig.circuitIconGfx}`);
        }

        if (menuConfig['severed-head']) {
            menuConfig['severed-head'] = await this.fetchImage(`/${mod.baseDirectory}assets/${menuConfig['severed-head']}`)
            this.headGfxConfigs.push(menuConfig);
        }
    }

    async fetchImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image;
            img.onload = () => resolve(img);
            img.onerror = (err) => reject(err);
            img.src = src;
        });
    }
}