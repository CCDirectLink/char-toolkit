import './extendable-heads.js';

ig.module('menu-ui-replacer')
  .requires('impact.base.impact')
  .defines(() => {
    const MENU_FILE_PATH = 'data/menu.json';

    sc.MenuUiReplacer = ig.JsonLoadable.extend({
      cacheType: 'MenuUiReplacer',
      baseMenuGfx: new ig.Image('media/gui/menu.png'),
      patchedMenuGfx: null,
      customMenus: null,

      init() {
        this.parent(MENU_FILE_PATH);
        this.customMenus = new Map();
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

          const { offX, offY, sizeX, sizeY } = menu.MapFloorButtonContainer;
          menu.MapFloorButtonContainer = new ig.ImageGui(
            menu.gfx,
            offX,
            offY,
            sizeX,
            sizeY,
          );
          menu.MapFloorButtonContainer.hook.transitions = {
            DEFAULT: {
              state: {},
              time: 0.2,
              timeFunction: KEY_SPLINES.LINEAR,
            },
            HIDDEN: {
              state: { alpha: 0 },
              time: 0.2,
              timeFunction: KEY_SPLINES.LINEAR,
            },
          };

          if (menu.circuitIconGfx != null) {
            menu.circuitIconGfx = new ig.Image(menu.circuitIconGfx);
          }

          this.customMenus.set(menu.name, menu);
        }

        if (data.length > 0) this.baseMenuGfx.addLoadListener(this);
      },

      onLoadableComplete(success, loadable) {
        if (!(success && loadable === this.baseMenuGfx)) return;

        this._createPatchedMenuGfx();
      },

      _createPatchedMenuGfx() {
        const canvas = document.createElement('canvas');

        const baseGfx = this.baseMenuGfx;
        canvas.width = baseGfx.width;
        canvas.height = baseGfx.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(baseGfx.data, 0, 0);
        ctx.clearRect(280, 424, 16, 11);
        ctx.clearRect(280, 472, 126, 35);

        const patchedGfx = new ig.Image();
        patchedGfx.width = canvas.width;
        patchedGfx.height = canvas.height;
        patchedGfx.data = canvas;
        this.patchedMenuGfx = patchedGfx;
      },
    });

    sc.menuUiReplacer = new sc.MenuUiReplacer();
  });

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
      const config = sc.menuUiReplacer.customMenus.get(sc.model.player.name);
      this.setConfig(config);
    }
  }
}

ig.module('menu-ui-replacer.main-menu')
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
        const currentConfig = sc.menuUiReplacer.customMenus.get(
          sc.model.player.name,
        );
        const old = this.gfx;
        if (currentConfig) {
          this.gfx = sc.menuUiReplacer.patchedMenuGfx;
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
          const config = sc.menuUiReplacer.customMenus.get(
            sc.model.player.name,
          );
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
          this.leaIcon = this.config.MapFloorButtonContainer;
          this.leaIcon.doStateTransition('HIDDEN', true);
        } else {
          this.leaIcon = this.originalCopy;
        }
        this._createButtons(true);
      },
      modelChanged: onPlayerModelChanged,
    });

    function customStatusDrawables(renderer) {
      const currentConfig = sc.menuUiReplacer.customMenus.get(
        sc.model.player.name,
      );
      if (currentConfig) {
        const old = this.menuGfx;
        this.menuGfx = sc.menuUiReplacer.patchedMenuGfx;
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

ig.module('menu-ui-replacer.circuit-icons')
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

ig.module('menu-ui-replacer.status-view-combat-arts')
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
