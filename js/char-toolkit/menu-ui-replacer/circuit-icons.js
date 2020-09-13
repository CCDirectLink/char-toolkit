ig.module('char-toolkit.menu-ui-replacer.circuit-icons')
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