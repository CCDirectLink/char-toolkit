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

ig.module('menu-ui-replacer.main-menu')
    .requires('game.feature.menu.gui.main-menu', 'menu-ui-replacer')
    .defines(() => {
        sc.MainMenu.LeaLarge.inject({
            updateDrawables(renderer) {
                const config = sc.menuUiReplacer.currentConfig;
                if (config == null) return this.parent(renderer);

                const gfx = config.gfx;
                const { gfxOffX, gfxOffY, offX, offY, sizeX, sizeY } = config.Large;
                renderer.addDraw().setGfx(gfx, gfxOffX, gfxOffY, offX, offY, sizeX, sizeY);
            },
        });

        sc.MainMenu.LeaSmall.inject({
            updateDrawables(renderer) {
                const config = sc.menuUiReplacer.currentConfig;
                if (config == null) return this.parent(renderer);

                const gfx = config.gfx;
                const { gfxOffX, gfxOffY, offX, offY, sizeX, sizeY } = config.Small;
                renderer.addDraw().setGfx(gfx, gfxOffX, gfxOffY, offX, offY, sizeX, sizeY);
            },
        });
    });

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

ig.module('menu-ui-replacer.map-menu')
    .requires(
        'game.feature.menu.gui.map.map-worldmap',
        'game.feature.menu.gui.map.map-misc',
        'game.feature.player.player-model',
        'menu-ui-replacer',
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
                this.parent(model, event);
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

ig.module('menu-ui-replacer.social-menu')
    .requires('game.feature.menu.gui.social.social-misc')
    .defines(() => {
        sc.SocialPartyBox.inject({
            updatePartyLeader() {
                const oldLeader = this.members[0];
                oldLeader.hide(true);
                this.removeChildGui(oldLeader);

                const newLeader = new sc.SocialPartyMember(true, sc.model.player);
                if (this.isHidden) {
                    newLeader.hide(true);
                } else {
                    newLeader.show(true);
                }

                this.members[0] = newLeader;
                this.insertChildGui(newLeader);
            },

            show(...args) {
                this.parent(...args);
                this.isHidden = false;
            },

            hide(...args) {
                this.parent(...args);
                this.isHidden = true;
            },
        });

        sc.SocialMenu.inject({
            addObservers() {
                this.parent();
                sc.Model.addObserver(sc.model.player, this);
            },

            removeObservers() {
                this.parent();
                sc.Model.removeObserver(sc.model.player, this);
            },

            modelChanged(model, event) {
                this.parent(model, event);
                if (model === sc.model.player && event === sc.PLAYER_MSG.CONFIG_CHANGED) {
                    this.party.updatePartyLeader();
                }
            },
        });
    });

ig.module('menu-ui-replacer.circuit-icons')
    .requires('game.feature.menu.gui.circuit.circuit-effect-display')
    .defines(() => {
        function updateDrawables(renderer) {
            const originalIcons = this.icons;

            const config = sc.menuUiReplacer.currentConfig;
            if (config != null && config.circuitIconGfx != null) {
                this.icons = config.circuitIconGfx;
            }

            this.parent(renderer);
            this.icons = originalIcons;
        }

        sc.CircuitTreeDetail.Node.inject({ updateDrawables });
        sc.CircuitSwapBranchesInfoBox.Skill.inject({ updateDrawables });
    });

ig.module('menu-ui-replacer.status-menu')
    .requires('game.feature.menu.gui.status.status-view-combat-arts')
    .defines(() => {
        sc.StatusViewCombatArtsEntry.inject({
            updateDrawables(renderer) {
                const config = sc.menuUiReplacer.currentConfig;
                this.icon.image =
                    config != null && config.circuitIconGfx != null
                        ? config.circuitIconGfx
                        : this.skillIcons;

                this.parent(renderer);
            },
        });
    });
