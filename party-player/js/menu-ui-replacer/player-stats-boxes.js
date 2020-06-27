ig.module('menu-ui-replacer.player-stats-boxes')
    .requires(
        'game.feature.menu.gui.item.item-status-default',
        'game.feature.menu.gui.status.status-view-main',
        'game.feature.menu.gui.menu-misc',
        'menu-ui-replacer',
    )
    .defines(() => {
        function updateDrawables(renderer) {
            sc.MenuPanel.prototype.updateDrawables.call(this, renderer);

            const config = sc.menuUiReplacer.currentConfig;
            if (config != null) {
                const { gfxOffX, gfxOffY, offX, offY, sizeX, sizeY } = config.Head;
                renderer.addGfx(config.gfx, gfxOffX, gfxOffY, offX, offY, sizeX, sizeY);
            } else {
                renderer.addGfx(this.menuGfx, 0, 0, 280, 472, 126, 35);
            }

            const elementOffset = sc.model.player.currentElementMode * 24;
            renderer.addGfx(this.statusGfx, 64, 5, 104, 32 + elementOffset, 24, 24);
        }

        sc.ItemStatusDefault.inject({ updateDrawables });
        sc.StatusViewMainParameters.inject({ updateDrawables });
    });