ig.module("game.feature.ui-replacer.menu.gui.status.status-view-combat-arts").requires("game.feature.menu.gui.status.status-view-combat-arts").defines(function() {
    function addPlayerObserver(instance) {
        sc.Model.addObserver(sc.model.player, instance);

    }

    function removePlayerObserver(instance)  {
        sc.Model.removeObserver(sc.model.player, instance);
    }
    
    function onPlayerModelChanged(model, event) {
        if (model === sc.model.player) {
            if (event === sc.PLAYER_MSG.CONFIG_CHANGED) {
                const playerName = sc.model.player.name;
                if (customPlayerMenus.has(playerName)) {
                    this.setConfig(customPlayerMenus.get(playerName));
                } else {
                    this.setConfig(null);
                }
                
            }
        }
    }

    sc.StatusViewCombatArtsEntry.inject({
        config: null,
        init: function() {
            this.parent(...arguments);
            this.modelChanged(sc.model.player, sc.PLAYER_MSG.CONFIG_CHANGED);
        },
        setConfig(config) {
            this.config = config;
        },
        onAttach: function() {
            addPlayerObserver(this);
        },
        onDetach: function() {
            removePlayerObserver(this);
        },
        updateDrawables: function() {
            const config = this.config;

            let circuitIconGfx = this.skillIcons;
            if (config !== null) {
                if (config.circuitIconGfx) {
                    circuitIconGfx = config.circuitIconGfx;
                }
            }
            this.icon.image = circuitIconGfx;
        },
        modelChanged: onPlayerModelChanged
    });
});