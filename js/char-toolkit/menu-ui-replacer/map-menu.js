ig.module('char-toolkit.menu-ui-replacer.map-menu')
    .requires(
        'game.feature.menu.gui.map.map-worldmap',
        'game.feature.menu.gui.map.map-misc',
        'game.feature.player.player-model',
        'char-toolkit.menu-ui-replacer',
    )
    .defines(() => {
        sc.AreaButton.inject({
            updateDrawables(renderer) {
                const config = sc.menuUiReplacer.currentConfig;
                if (config == null) return this.parent(renderer);

                const { activeArea } = this;
                this.activeArea = false;
                this.parent(renderer);
                this.activeArea = activeArea;

                if (activeArea) {
                    renderer.addGfx(this.gfx, 1, 2, 304, 440, 3, 3);

                    const gfx = config.gfx;
                    const { gfxOffX, gfxOffY, offX, offY, sizeX, sizeY } = config.AreaButton;
                    renderer.addGfx(gfx, gfxOffX, gfxOffY, offX, offY, sizeX, sizeY);
                }
            },
        });

        sc.MapFloorButtonContainer.inject({
            originalCopy: null,

            init(...args) {
                this.parent(...args);
                this.leaIconOriginal = this.leaIcon;
                this._updateLeaIcon();
            },

            addObservers(...args) {
                this.parent(...args);
                sc.Model.addObserver(sc.model.player, this);
            },

            removeObservers(...args) {
                this.parent(...args);
                sc.Model.removeObserver(sc.model.player, this);
            },

            modelChanged(model, event) {
                this.parent(...arguments);
                if (model === sc.model.player && event === sc.PLAYER_MSG.CONFIG_CHANGED) {
                    this._updateLeaIcon();
                }
            },

            _updateLeaIcon() {
                this.leaIcon.doStateTransition('HIDDEN', true);

                const config = sc.menuUiReplacer.currentConfig;
                if (config != null) {
                    const { offX, offY, sizeX, sizeY } = config.MapFloorButtonContainer;
                    this.leaIcon = new ig.ImageGui(config.gfx, offX, offY, sizeX, sizeY);
                    this.leaIcon.hook.transitions = this.leaIconOriginal.hook.transitions;
                } else {
                    this.leaIcon = this.leaIconOriginal;
                }

                this._createButtons(true);
            },
        });
    });