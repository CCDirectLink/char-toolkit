ig.module('char-toolkit.menu-ui-replacer.main-menu')
    .requires('game.feature.menu.gui.main-menu', 'char-toolkit.menu-ui-replacer')
    .defines(() => {
        sc.MainMenu.LeaLarge.inject({
            updateDrawables(renderer) {
                const config = sc.menuUiReplacer.currentConfig;
                if (config == null) return this.parent(renderer);

                const gfx = config.gfx;
                const {
                    gfxOffX,
                    gfxOffY,
                    offX,
                    offY,
                    sizeX,
                    sizeY
                } = config.Large;
                renderer.addDraw().setGfx(gfx, gfxOffX, gfxOffY, offX, offY, sizeX, sizeY);
            },
        });

        sc.MainMenu.LeaSmall.inject({
            updateDrawables(renderer) {
                const config = sc.menuUiReplacer.currentConfig;
                if (config == null) return this.parent(renderer);

                const gfx = config.gfx;
                const {
                    gfxOffX,
                    gfxOffY,
                    offX,
                    offY,
                    sizeX,
                    sizeY
                } = config.Small;
                renderer.addDraw().setGfx(gfx, gfxOffX, gfxOffY, offX, offY, sizeX, sizeY);
            },
        });
    });