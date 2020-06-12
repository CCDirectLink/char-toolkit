import MenuUiReplacer from "./menu-ui-replacer.js";

export default class PartyPlayer extends Plugin {
	constructor(mod) {
		super();
		this.mod = mod;
		this.menuUIReplacer = new MenuUiReplacer;
	}

	async preload() {

	}

	async postload() {

	}

	async prestart() {
		await this.menuUIReplacer.prestart();
	}
}
