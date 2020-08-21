export default class CustomCharacterToolKit {
    constructor() {
        this.headGfxConfigs = [];
        this.indexes = {};
        this.configs = [];
    }

    async registerResourceListeners() {
        await UtilityResourceManager.addResourceListener('custom-character-config', async (data) => {
            if (data.type === 'generator') {
                const generator = data.data;
                await this.addConfig(await generator());
            } else {
                await this.addConfig(data.data);
            }
        });
    }

    async preload() {
        ccmod.resources.imagePatches.add('media/gui/severed-heads.png', (baseCanvas) => {
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
            if (config.player && !sc.PARTY_OPTIONS.includes(config.name)) {
                sc.PARTY_OPTIONS.push(config.name);
            }
        }
    }

    async poststart() {
        for (const config of this.configs) {
            sc.menuUiReplacer.addConfig(config);
        }
    }

    async addConfig({
        mod,
        config
    }) {
        const idx = this.configs.push(config) - 1;
        this.indexes[name] = idx;

        // assume that there is a player entry
        if (config.player == null) {
            config.player = true;
        }

        if (config.gfx) {
            config.gfx = await this.fetchImage(`/${mod.baseDirectory}assets/${config.gfx}`);
        }

        if (config.circuitIconGfx) {
            config.circuitIconGfx = await this.fetchImage(`/${mod.baseDirectory}assets/${config.circuitIconGfx}`);
        }

        if (config['severed-head']) {
            config['severed-head'] = await this.fetchImage(`/${mod.baseDirectory}assets/${config['severed-head']}`)
            this.headGfxConfigs.push(config);
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