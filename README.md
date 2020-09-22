# char-toolkit

Allow mods to add characters as party members or players.

Note: This mod was previously known as "party-player"

Note: No support will be provided if you do not download the mod from the [releases](https://github.com/CCDirectLink/char-toolkit/releases) page.

# API Documentation

This uses the utility-resource-organizer mod to receive party member/player
configuration.  It uses the `"custom-character-config"` key name.

Custom characters configurations must be sent during the
`registerResourceGenerators` or `preload` phase.  This mods accepts both
data resources and generator resources, the latter being called without any
argument.  The caller should wait for the completion of `addResourceData`
or `addResourceGenerator` to make sure it terminates before the end of the
`preload` phase, otherwise the behavior is undefined.

The configuration of a character obeys this schema:
```
{
	mod: Mod,
	config: {
		name: string,
		player: true | false | undefined,
		"severed-head": RelativeAssetPath | undefined,
		gfx: RelativeAssetPath,
		circuitIconGfx: RelativeAssetPath | undefined
		Small: { gfxOffX, gfxOffY, offX, offY, sizeX, sizeY },
		Large: { gfxOffX, gfxOffY, offX, offY, sizeX, sizeY },
		AreaButton: { gfxOffX, gfxOffY, offX, offY, sizeX, sizeY },
		MapFloorButtonContainer: { offX, offY, sizeX, sizeY },
		Head: { gfxOffX, gfxOffY, offX, offY, sizeX, sizeY },
	}
}
```

`mod` must contain the Mod object used by the modloader.  It can be fetched
from the constructor of your `main` class, or through
`window.modloader.get(your_mod_id)`, the former being preferred.

The `config` can contains these fields:

- `name`: Mandatory.  Must contain the internal name of your character, as used
  in your mod.  It should be unique enough to not conflict with
  other mods or with official game characters. It must match the name parameter
  of `SWITCH_PLAYER_CONFIG` or `ADD_PARTY_MEMBER` or similar.
  You should also add a `data/players/${name.toLowerCase()}.json` as an json
  asset loadable by the game.
- `player`: if true (the default), then add this character to
  `sc.PARTY_OPTIONS`, allowing it to be spawned as a party member.  This does
  not automatically add it to the Party/Social menu.
- `severed-head`: Must point to a 24x24 image or canvas (other pixels are
  ignored) used to patch the `media/gui/severed-heads.png` which is used to
  display current party members/players in save files, in the game UI or during
  PvP combat.
- `gfx`: Mandatory. Must be a path relative to your mod's `assets/` directory.
  Note that this mod ignore the `assetsDir` option in your `ccmod.json`, so the
  `assets/` directory MUST be present.  It must point to an image file that
  contains five parts, which are described below.  These parts replace some
  sprites from `media/gui/menu.png` when your character is the current player.
  For reference, the original sprites in `media/gui/menu.png` are:

  | Image part              | Size    | Source offset | Destination Offset |
  | :---------------------  | :-----: | :-----------: | :----------------: |
  | Large                   | 138x380 | x=173, y=0    |      x=0, y=0      |
  | Small                   |  97x263 | x=311, y=0    |      x=0, y=0      |
  | AreaButton              |  16x11  | x=280, y=424  |    x=-11, y=-8     |
  | MapFloorButtonContainer |  34x20  | x=280, y=388  |  (not supported)   |
  | Head                    | 126x35  | x=280, y=472  |      x=0, y=0      |

- `circuitIconGfx`: Optional.  Must be a path relative to your mod's `assets/`
  directory, to a image file that will replace `media/gui/circuit.png` when
  your character is the current player.

The next five options specifies where are the parts in `gfx` and whether to
apply a destination offset to them.
Each of them must be objects, with the following mandatory fields:
```
{
	gfxOffX: number, // not supported in MapFloorButtonContainer
	gfxOffY: number, // not supported in MapFloorButtonContainer
	offX: number,
	offY: number,
	sizeX: number,
	sizeY: number
}
```
The {offX, offY, sizeX, sizeY} members defines a rectangle from the `gfx` image
while `gfxOffX` and `gfxOffY` are offsets on the destination canvas,
relative to the current position of the GUI drawing cursor.

- `Large`: Mandatory.  A large picture of your character, displayed in the
  Character menu.
- `Small`: Mandatory. A smaller picture of the outline of your character,
  displayed in the Equipment menu, among others.
- `AreaButton`: Mandatory. A very small icon with the head of your character,
  which is used to indicate the current area in the World Map.
- `MapFloorButtonContainer`: Mandatory. A very small icon with the head of your
  character inside a position marker, which is displayed next to the current
  floor button.  This option does not support destination offsets (`gfxOffX`
  and `gfxOffY`).
- `Head`: Mandatory. An icon with the head of your character, along with a
  template used to display elements.  It is used in the Status menu, among
  other places.

# Contact Events

To add events when contacting your character in the social/party menu, simply
add a patch for `database.json` to insert your common events into
`commonEvents`.

However, without the help of this mod, your `SOCIAL_ACTION.CONTACT` event
would be ignored by the game, because it relies on the iteration order of the
`commonEvents` object.  If the game iterates on `nobody-contact` catch-all
before iterating on your contact event, then the game will select it and ignore
your event.

This mod will automatically fix the iteration order, under the condition
that the name of your contact event (i.e. the property name that you add
to `commonEvents`) ends with `-contact`.
