ig.module('menu-ui-replacer')
    .requires('impact.base.impact', 'game.feature.player.player-model')
    .defines(() => {
        const MENU_FILE_PATH = 'data/menu.json';

        sc.MenuUiReplacer = ig.JsonLoadable.extend({
            cacheType: 'MenuUiReplacer',
            configs: null,
            currentConfig: null,

            init() {
                this.parent(MENU_FILE_PATH);
                this.configs = new Map();
            },

            getCacheKey() {
                return MENU_FILE_PATH;
            },

            getJsonPath() {
                return `${ig.root}${this.path}${ig.getCacheSuffix()}`;
            },

            onload(data) {
                for (const menu of data) {
                    menu.gfx = new ig.Image(menu.gfx);
                    if (menu.circuitIconGfx != null) {
                        menu.circuitIconGfx = new ig.Image(menu.circuitIconGfx);
                    }
                    this.configs.set(menu.name, menu);
                }
            },

            modelChanged(model, event) {
                if (model === sc.model.player && event === sc.PLAYER_MSG.CONFIG_CHANGED) {
                    // config can be null if it wasn't found
                    this.currentConfig = this.configs.get(sc.model.player.name);
                }
            },
        });

        sc.menuUiReplacer = new sc.MenuUiReplacer();
    });