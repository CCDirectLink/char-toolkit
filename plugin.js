import MenuUiReplacer from "./menu-ui-replacer.js";
import ExtendableHeads from "./extendable-heads.js";

export default class PartyPlayer extends Plugin {
	constructor(mod) {
		super();
		this.mod = mod;
		this.menuUIReplacer = new MenuUiReplacer;
		this.headsUi = new ExtendableHeads;
	}

	async preload() {

	}

	async postload() {

	}

	async prestart() {
		await this.menuUIReplacer.prestart();
		await this.headsUi.prestart();
	}
}
