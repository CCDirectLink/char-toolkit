ig.module('char-toolkit.menu-ui-replacer.status-menu')
    .requires('game.feature.menu.gui.status.status-view-combat-arts')
    .defines(() => {
        sc.StatusViewCombatArtsEntry.inject({
            updateDrawables(renderer) {
                const config = sc.menuUiReplacer.currentConfig;
                this.icon.image =
                    config != null && config.circuitIconGfx != null ?
                    config.circuitIconGfx :
                    this.skillIcons;

                this.parent(renderer);
            },
        });
    });