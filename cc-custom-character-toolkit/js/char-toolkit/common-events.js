ig.module("char-toolkit.common-events").requires("game.feature.common-event.common-event").defines(function() {
    sc.CommonEvents.inject({
        _loadCommonEvents: function() {
            // let it do its thing
            this.parent();
            // going to find the indexOf no-contact
            const socialActions = this.eventsByType["SOCIAL_ACTION"];
            let i = 0;
            for (i = 0; i < socialActions.length; i++) {
                if (socialActions[i].name === "nobody-contact") {
                    break;
                }
            }
            let noContactIndex = i;
            // we have the index now find all the -contact and splice it
            ++i;
            for (; i < socialActions.length; i++) {
                if (socialActions[i].name.endsWith("-contact")) {
                    socialActions.splice(noContactIndex, 0, socialActions.splice(i, 1).pop());
                    noContactIndex++;
                }
            }
        }
    });
});