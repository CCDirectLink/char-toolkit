ig.module("game.feature.ui-replacer.menu.gui.circuit-icons").requires("game.feature.menu.gui.circuit.circuit-effect-display").defines(function() {
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

    function addPlayerObserver(instance) {
        sc.Model.addObserver(sc.model.player, instance);

    }

    function removePlayerObserver(instance)  {
        sc.Model.removeObserver(sc.model.player, instance);
    }


    sc.CircuitTreeDetail.Node.inject({
        config: null,
        init: function() {
            this.parent(...arguments);
            this.modelChanged(sc.model.player, sc.PLAYER_MSG.CONFIG_CHANGED);
        },
        onAttach: function() {
            addPlayerObserver(this);
        },
        onDetach: function() {
            removePlayerObserver(this);
        },
        setConfig: function(config) {
            this.config = config;
        },
        updateDrawables: function(renderer) {
            let original = this.icons;

            if (this.config !== null && this.config.circuitIconGfx) {
                this.icons = this.config.circuitIconGfx;
            }

            this.parent(renderer);
            this.icons = original;
        },
        modelChanged: onPlayerModelChanged
    });

    sc.CircuitSwapBranchesInfoBox.Skill.inject({
        config: null,
        init: function() {
            this.parent(...arguments);
            this.modelChanged(sc.model.player, sc.PLAYER_MSG.CONFIG_CHANGED);
        },
        onAttach: function() {
            addPlayerObserver(this);
        },
        onDetach: function() {
            removePlayerObserver(this);
        },
        setConfig: function(config) {
            this.config = config;
        },
        updateDrawables: function(renderer) {
            let original = this.icons;

            if (this.config !== null && this.config.circuitIconGfx) {
                this.icons = this.config.circuitIconGfx;
                return;
            }
            
            this.parent(renderer);
            
            this.icons = original;
        },
        modelChanged: function(model, event) {
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
    });
});
