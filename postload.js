import './extendable-heads.js';

function addPlayerObserver(instance) {
  sc.Model.addObserver(sc.model.player, instance);
}

function removePlayerObserver(instance) {
  sc.Model.removeObserver(sc.model.player, instance);
}

function onPlayerModelChanged(model, event) {
  if (model === sc.model.player) {
    if (event === sc.PLAYER_MSG.CONFIG_CHANGED) {
      // config can be null if it wasn't found
      const config = customPlayerMenus.get(sc.model.player.name);
      this.setConfig(config);
    }
  }
}

ig.module('game.feature.ui-replacer.menu.gui.main-menu')
  .requires('game.feature.menu.gui.main-menu')
  .defines(() => {
    sc.MainMenu.LeaLarge.inject({
      config: null,

      init(...args) {
        this.parent(...args);
        addPlayerObserver(this);
      },

      setConfig(config) {
        this.config = config;
      },

      updateDrawables(renderer) {
        if (this.config == null) return this.parent(renderer);

        const gfx = this.config.gfx;
        const {
          gfxOffX,
          gfxOffY,
          offX,
          offY,
          sizeX,
          sizeY,
        } = this.config.Large;
        renderer
          .addDraw()
          .setGfx(gfx, gfxOffX, gfxOffY, offX, offY, sizeX, sizeY);
      },

      modelChanged: onPlayerModelChanged,
    });

    sc.MainMenu.LeaSmall.inject({
      config: null,

      init(...args) {
        this.parent(...args);
        addPlayerObserver(this);
      },

      setConfig(config) {
        this.config = config;
      },

      updateDrawables(renderer) {
        if (this.config == null) return this.parent(renderer);

        const gfx = this.config.gfx;
        const {
          gfxOffX,
          gfxOffY,
          offX,
          offY,
          sizeX,
          sizeY,
        } = this.config.Small;
        renderer
          .addDraw()
          .setGfx(gfx, gfxOffX, gfxOffY, offX, offY, sizeX, sizeY);
      },

      modelChanged: onPlayerModelChanged,
    });

    sc.AreaButton.inject({
      updateDrawables(renderer) {
        const currentConfig = customPlayerMenus.get(sc.model.player.name);
        const old = this.gfx;
        if (currentConfig) {
          this.gfx = currentConfig.menuGfx;
        }

        this.parent(renderer);
        if (currentConfig && this.activeArea) {
          const gfx = currentConfig.gfx;
          const {
            gfxOffX,
            gfxOffY,
            offX,
            offY,
            sizeX,
            sizeY,
          } = currentConfig.AreaButton;
          renderer.addGfx(gfx, gfxOffX, gfxOffY, offX, offY, sizeX, sizeY);
        }
        this.gfx = old;
      },
    });

    // just patch leaIcon
    sc.MapFloorButtonContainer.inject({
      config: null,

      originalCopy: null,
      init() {
        this.parent(...arguments);
        this.originalCopy = this.leaIcon;

        addPlayerObserver(this);

        if (sc.model.player.name !== 'Lea') {
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

      setConfig(config) {
        this.config = config;
        this.updateIcon();
      },

      updateIcon() {
        if (this.config != null) {
          this.leaIcon.doStateTransition('HIDDEN', true);
          this.leaIcon = this.config.icon;
          this.leaIcon.doStateTransition('HIDDEN', true);
        } else {
          this.leaIcon = this.originalCopy;
        }
        this._createButtons(true);
      },
      modelChanged: onPlayerModelChanged,
    });

    function customStatusDrawables(renderer) {
      const currentConfig = customPlayerMenus.get(sc.model.player.name);
      if (currentConfig) {
        const old = this.menuGfx;
        this.menuGfx = currentConfig.menuGfx;
        ig.BoxGui.prototype.updateDrawables.apply(this, arguments);
        const gfx = currentConfig.gfx;
        const {
          gfxOffX,
          gfxOffY,
          offX,
          offY,
          sizeX,
          sizeY,
        } = currentConfig.Head;
        renderer.addGfx(gfx, gfxOffX, gfxOffY, offX, offY, sizeX, sizeY);
        renderer.addGfx(
          this.statusGfx,
          64,
          5,
          104,
          32 + sc.model.player.currentElementMode * 24,
          24,
          24,
        );
        this.menuGfx = old;
      } else {
        this.parent(renderer);
      }
    }

    sc.ItemStatusDefault.inject({
      updateDrawables: customStatusDrawables,
    });

    sc.StatusViewMainParameters.inject({
      updateDrawables: customStatusDrawables,
    });

    sc.SocialPartyBox.inject({
      updatePartyLeader() {
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
        addPlayerObserver(this);
      },

      removeObservers() {
        this.parent();
        removePlayerObserver(this);
      },

      modelChanged(instance, event) {
        if (sc.model.player === instance) {
          this.party.updatePartyLeader();
        } else {
          this.parent(...arguments);
        }
      },
    });
  });

ig.module('game.feature.ui-replacer.menu.gui.circuit-icons')
  .requires('game.feature.menu.gui.circuit.circuit-effect-display')
  .defines(() => {
    sc.CircuitTreeDetail.Node.inject({
      config: null,

      init(...args) {
        this.parent(...args);
        this.modelChanged(sc.model.player, sc.PLAYER_MSG.CONFIG_CHANGED);
      },

      onAttach() {
        addPlayerObserver(this);
      },

      onDetach() {
        removePlayerObserver(this);
      },

      setConfig(config) {
        this.config = config;
      },

      updateDrawables(renderer) {
        let original = this.icons;

        if (this.config !== null && this.config.circuitIconGfx) {
          this.icons = this.config.circuitIconGfx;
        }

        this.parent(renderer);
        this.icons = original;
      },

      modelChanged: onPlayerModelChanged,
    });

    sc.CircuitSwapBranchesInfoBox.Skill.inject({
      config: null,

      init(...args) {
        this.parent(...args);
        this.modelChanged(sc.model.player, sc.PLAYER_MSG.CONFIG_CHANGED);
      },

      onAttach() {
        addPlayerObserver(this);
      },

      onDetach() {
        removePlayerObserver(this);
      },

      setConfig(config) {
        this.config = config;
      },

      updateDrawables(renderer) {
        let original = this.icons;

        if (this.config !== null && this.config.circuitIconGfx) {
          this.icons = this.config.circuitIconGfx;
          return;
        }

        this.parent(renderer);

        this.icons = original;
      },

      modelChanged: onPlayerModelChanged,
    });
  });

ig.module('game.feature.ui-replacer.menu.gui.status.status-view-combat-arts')
  .requires('game.feature.menu.gui.status.status-view-combat-arts')
  .defines(() => {
    sc.StatusViewCombatArtsEntry.inject({
      config: null,

      init(...args) {
        this.parent(...args);
        this.modelChanged(sc.model.player, sc.PLAYER_MSG.CONFIG_CHANGED);
      },

      setConfig(config) {
        this.config = config;
      },

      onAttach() {
        addPlayerObserver(this);
      },

      onDetach() {
        removePlayerObserver(this);
      },

      updateDrawables() {
        let circuitIconGfx = this.skillIcons;
        if (this.config != null && this.config.circuitIconGfx != null) {
          circuitIconGfx = this.config.circuitIconGfx;
        }
        this.icon.image = circuitIconGfx;
      },

      modelChanged: onPlayerModelChanged,
    });
  });
