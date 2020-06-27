ig.module('menu-ui-replacer')
    .requires('impact.base.impact', 'game.feature.player.player-model')
    .defines(() => {

        function convertToIgImageFromImage(img) {
            const igImage = new ig.Image;
            igImage.data = img;
            igImage.path = new URL(img.src).pathname;
            igImage.onload();
            return igImage;
        }

        sc.MenuUiReplacer = ig.Class.extend({
            configs: null,
            currentConfig: null,
            init() {
                this.configs = new Map;
            },
            addConfig(config) {
                config.gfx = convertToIgImageFromImage(config.gfx);
                if (config.circuitIconGfx) {
                    config.circuitIconGfx = convertToIgImageFromImage(config.circuitIconGfx);
                }
                this.configs.set(config.name, config);
            },
            modelChanged(model, event) {
                if (model === sc.model.player && event === sc.PLAYER_MSG.CONFIG_CHANGED) {
                    // config can be null if it wasn't found
                    this.currentConfig = this.configs.get(sc.model.player.name);
                }
            }
        });

        sc.PlayerConfig.inject({
            init: function(name) {
                this.parent.apply(this, arguments);
                this.setupExtendableHeads();
            },
            setupExtendableHeads() {
                const name = this.name;
                let originalValue = 0;
                Object.defineProperty(this, 'headIdx', {
                    set(value) {
                        originalValue = value;
                    },
                    get() {
                        if (sc.menuUiReplacer.configs.has(name)) {
                            const config = sc.menuUiReplacer.configs.get(name);
                            if (config.headIdx) {
                                return config.headIdx;
                            }
                        }
                        return originalValue;
                    },
                    configurable: false
                });
            }
        });
        ig.addGameAddon(function() {
            return sc.menuUiReplacer = new sc.MenuUiReplacer;
        });
    });