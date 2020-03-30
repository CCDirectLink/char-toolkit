ig.module("replacer.game.feature.menu.gui.main-menu").requires("game.feature.menu.gui.main-menu").defines(function() {
    

    function onPlayerModelChanged(model, event) {
        if (model === sc.model.player) {
            if (event === sc.PLAYER_MSG.CONFIG_CHANGED) {
                console.log('Player model changed!');
                const playerName = sc.model.player.name;
                if (customPlayerMenus.has(playerName)) {
                    this.setConfig(customPlayerMenus.get(playerName));
                } else {
                    this.setConfig(null);
                }
                
            }
        }
    }

    function addPlayerObserver(instance) {

        console.log('Added observer for this', instance);
        sc.Model.addObserver(sc.model.player, instance);

    }

    function removePlayerObserver(instance)  {
        sc.Model.removeObserver(sc.model.player, instance);
    }

    sc.MainMenu.LeaLarge.inject({
        config: null,
        

        init: function() {
            this.parent(...arguments);

            addPlayerObserver(this);
        },

        setConfig: function(config) {
            this.config = config;
        },

        updateDrawables: function(a) {
            if (this.config !== null) {
                const gfx = this.config.gfx;
                const {gfxOffX, gfxOffY, offX, offY, sizeX, sizeY } = this.config.Large;
                a.addDraw().setGfx(gfx, gfxOffX, gfxOffY, offX, offY, sizeX, sizeY)
                return;
            }
            this.parent(a);
        },

        modelChanged: onPlayerModelChanged
    });

    sc.MainMenu.LeaSmall.inject({
        config: null,

        init: function() {
            this.parent(...arguments);

            addPlayerObserver(this);
        },

        setConfig: function(config) {
            this.config = config;
        },

        updateDrawables: function(a) {
            if (this.config !== null) {
                const gfx = this.config.gfx;
                const {gfxOffX, gfxOffY, offX, offY, sizeX, sizeY } = this.config.Small;
                a.addDraw().setGfx(gfx, gfxOffX, gfxOffY, offX, offY, sizeX, sizeY)
                return;
            }
            this.parent(a);
        },
        modelChanged: onPlayerModelChanged
    });

    sc.AreaButton.inject({
        updateDrawables: function(a) {
            const currentConfig = customPlayerMenus.get(sc.model.player.name);
            const old = this.gfx;
            if (currentConfig) {
                this.gfx = currentConfig.menuGfx;
            }

            this.parent(a);
            if (currentConfig && this.activeArea) {
                const gfx = currentConfig.gfx;
                const {gfxOffX, gfxOffY, offX, offY, sizeX, sizeY } = currentConfig.AreaButton;
                a.addGfx(gfx, gfxOffX, gfxOffY, offX, offY, sizeX, sizeY);
            }
            this.gfx = old;
        }
    });

    // just patch leaIcon
    sc.MapFloorButtonContainer.inject({
        config: null,

        originalCopy: null,
        init: function() {
            this.parent(...arguments);
            this.originalCopy = this.leaIcon;

            addPlayerObserver(this);

            if (sc.model.player.name !== "Lea") {
                const config = customPlayerMenus.get(sc.model.player.name);
                if (config) {
                    this.setConfig(config);
                }
            }
        },

        addObservers() {
            this.parent();
            addPlayerObserver(this);
        },
        removeObservers() {
            removePlayerObserver(this);
        },

        setConfig: function(config) {
            this.config = config;
            this.updateIcon();
        },
        
        updateIcon: function() {
            if (this.config !== null) {
                this.leaIcon.doStateTransition("HIDDEN", true);
                this.leaIcon = this.config.icon;
                this.leaIcon.doStateTransition("HIDDEN", true);
            } else {
                this.leaIcon = this.originalCopy;
            }
            this._createButtons(true);
        },
        modelChanged: onPlayerModelChanged
    });


    function customStatusDrawables(a) {
        const currentConfig = customPlayerMenus.get(sc.model.player.name);
        if (currentConfig) {
            const old = this.menuGfx;
            this.menuGfx = currentConfig.menuGfx;
            ig.BoxGui.prototype.updateDrawables.apply(this, arguments);
            const gfx = currentConfig.gfx;
            const {gfxOffX, gfxOffY, offX, offY, sizeX, sizeY } = currentConfig.Head;
            a.addGfx(gfx, gfxOffX, gfxOffY, offX, offY, sizeX, sizeY);
            a.addGfx(this.statusGfx, 64, 5, 104, 32 + sc.model.player.currentElementMode * 24, 24, 24);
            this.menuGfx = old;
        } else {
            this.parent(a);
        }   
    }

    sc.ItemStatusDefault.inject({
        updateDrawables: customStatusDrawables
    });

    sc.StatusViewMainParameters.inject({
    	updateDrawables: customStatusDrawables
    });


    sc.SocialPartyBox.inject({
        updatePartyLeader: function() {
            const oldLeader = this.members[0];
            oldLeader.hide(true);

            this.removeChildGui(oldLeader);
            this.members[0] = null;

            const newLeader = new sc.SocialPartyMember(true, sc.model.player);
            if (this.isHidden) {
                newLeader.hide(true);
            } else {
                newLeader.show(true);
            }
            
            this.members[0] = newLeader;
            this.insertChildGui(newLeader);
        },

        show: function() {
            this.parent(...arguments);
            this.isHidden = false;
        },
        hide: function() {
            this.parent(...arguments);
            this.isHidden = true;
        }
    });

    sc.SocialMenu.inject({
        addObservers: function() {
            this.parent();
            addPlayerObserver(this);
        }, 
        removeObservers: function() {
            this.parent();
            removePlayerObserver(this);
        },
        modelChanged: function(object, event) {

            if (sc.model.player === object) {
                this.party.updatePartyLeader();
            } else {
                this.parent(...arguments);
            }
        }
    });
});