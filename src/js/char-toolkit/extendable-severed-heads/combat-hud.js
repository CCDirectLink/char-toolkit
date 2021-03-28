ig.module('char-toolkit.extendable-severed-heads.combat-hud')
    .requires('game.feature.gui.hud.combat-hud')
    .defines(() => {
        sc.CombatUpperHud.inject({
            init() {
                this.parent();
                const {
                    pvp
                } = this.sub;
                const renderHeads = pvp._renderHeads;
                pvp._renderHeads = function(_renderer, _x, left, heads) {
                    if (left) heads[0] = sc.model.player.config.headIdx;
                    return renderHeads.apply(this, arguments);
                };
            },
        });
    });