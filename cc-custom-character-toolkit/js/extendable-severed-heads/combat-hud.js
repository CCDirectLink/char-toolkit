ig.module('extendable-severed-heads.save-slot-gui-party')
    .requires('extendable-severed-heads', 'game.feature.menu.gui.save.save-misc')
    .defines(() => {
        sc.SaveSlotParty.inject({
            setParty(save) {
                this.party[0] = sc.party.models[save.player.playerConfig].getHeadIdx();
                return this.parent.apply(this, arguments);
            },
        });
    });