ig.module('char-toolkit.menu-ui-replacer.social-menu')
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
                this.parent(...arguments);
                if (model === sc.model.player && event === sc.PLAYER_MSG.CONFIG_CHANGED) {
                    this.party.updatePartyLeader();
                }
            },
        });
    });
