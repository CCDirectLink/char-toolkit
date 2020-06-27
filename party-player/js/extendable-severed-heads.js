ig.module('extendable-severed-heads')
    .requires('impact.base.impact', 'game.feature.player.player-config')
    .defines(() => {
        const HEAD_INDEXES_FILE_PATH = 'data/players/headIdx.json';

        sc.ExtendableSeveredHeads = ig.JsonLoadable.extend({
            cacheType: 'ExtendableSeveredHeads',
            indexes: {},
            customIds: [],
            baseImage: null,
            customImages: [],
            loadCollector: null,

            init() {
                this.parent(HEAD_INDEXES_FILE_PATH);
            },

            getCacheKey() {
                return HEAD_INDEXES_FILE_PATH;
            },

            getJsonPath() {
                return `${ig.root}${this.path}${ig.getCacheSuffix()}`;
            },

            onload(data) {
                this.loadCollector = new ig.LoadCollector(this);

                this.baseImage = new ig.Image('media/gui/severed-heads.png');
                for (const head of data.headIdx) {
                    this.customIds.push(head.id);
                    this.customImages.push(new ig.Image(head.img));
                }

                this.loadCollector.finalizeLoadableFetching();
            },

            onCacheCleared() {
                this.baseImage.decreaseRef();
                for (const img of this.customImages) img.decreaseRef();
            },

            onLoadableComplete(success, loadable) {
                if (!(success && loadable === this.loadCollector)) return;

                if (this.baseImage.failed) return;
                for (const img of this.customImages) {
                    if (img.failed) return;
                }

                this._assignCustomIndexes();
                this._patchBaseImage();
            },

            _assignCustomIndexes() {
                const startIndex = Math.floor(this.baseImage.width / 24);
                for (let i = 0; i < this.customIds.length; i++) {
                    const id = this.customIds[i];
                    this.indexes[id] = startIndex + i;
                }
            },

            _patchBaseImage() {
                const canvas = document.createElement('canvas');

                const baseImg = this.baseImage;
                if (baseImg.height !== 24) {
                    throw new Error(
                        "extended-severed-heads: height of the base image isn't 24. please ask the maintainers to fix this mod ASAP!",
                    );
                }
                const roundedBaseImageWidth = baseImg.width - (baseImg.width % 24);

                canvas.width = roundedBaseImageWidth + this.customImages.length * 24;
                canvas.height = 24;

                const ctx = canvas.getContext('2d');

                function drawImage(data, srcX, srcY, sizeX, sizeY, destX, destY) {
                    ctx.drawImage(data, srcX, srcY, sizeX, sizeY, destX, destY, sizeX, sizeY);
                }

                drawImage(baseImg.data, 0, 0, roundedBaseImageWidth, 24, 0, 0);
                let offset = roundedBaseImageWidth;
                for (const img of this.customImages) {
                    drawImage(img.data, 0, 0, 24, 24, offset, 0);
                    offset += 24;
                }

                this.baseImage.data = canvas;
            },
        });

        sc.extendableSeveredHeads = new sc.ExtendableSeveredHeads();

        sc.PlayerConfig.inject({
            onload() {
                let result = this.parent.apply(this, arguments);

                sc.extendableSeveredHeads.addLoadListener({
                    onLoadableComplete: (success, loadable) => {
                        if (!success) return;
                        const id = this.character.name;
                        const {
                            indexes
                        } = loadable;
                        if (id in indexes) this.headIdx = indexes[id];
                    },
                });

                return result;
            },
        });
    });