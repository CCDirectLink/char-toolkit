import { ImageUtils } from "./image/utils.js";

export default class ExtendableHeads extends Plugin {
	async prestart() {

		// Image loaded successfully
		const oldImage = await ImageUtils.loadImage("media/gui/severed-heads.png");

		const { headIdx } = await this.getHeadIdx();
		let imgs = [oldImage];


		// assume each image is 24x24
		for (let index = 0; index < headIdx.length; ++index) {
			const head = headIdx[index];
			try {
				imgs.push((await ImageUtils.loadImage(head.img)));
			} catch (e) {
				headIdx.splice(index, 1);
				--index;
				console.log(`Cound not load head of "${head.id}"`);
				console.log(e);
			}
		}

		const newImage = await this.mergeImages(imgs);
		const dim = this.getTotalDim([newImage]);


		const startIndex = this.calcStartIndex(dim, headIdx);





		const customIdx = {};

		for (let index = 0; index < headIdx.length; ++index) {
			const head = headIdx[index];
			customIdx[head.id] = startIndex + index;
		}
		sc.PlayerConfig.inject({
			onload: function (config) {
				if (!config.jsonTEMPLATES) {
					const id = config.character;
					if (id in customIdx) {

						config.headIdx = customIdx[id];
					}
				}
				this.parent(config);
			}
		});

		sc.SaveSlotParty.inject({
			setParty: function ({ player }) {
				try {
					this.party[0] = sc.party.models[player.playerConfig].getHeadIdx();
				} catch (e) { }

				return this.parent.apply(this, arguments);
			}
		});


		sc.CombatUpperHud.inject({
			init: function () {
				this.parent();
				const pvp = this.sub.pvp;
				const old = pvp._renderHeads;
				pvp._renderHeads = function (renderer, x, flip, idxArr) {
					if (flip) {
						idxArr[0] = sc.model.player.config.headIdx;
					}
					return old.apply(this, arguments);
				}
			}
		});

		const img = new ig.Image("media/gui/severed-heads.png");
		img.addLoadListener({
			onLoadableComplete: function (loaded, image) {
				// replace image
				if (loaded) {
					if (!image.failed) {
						image.width = newImage.width;
						image.height = newImage.height;

						image.data = newImage;
					}

				}
			}
		});

	}


	getTotalDim(imgs) {
		let dim = {
			x: 0,
			y: 0
		};
		for (const img of imgs) {
			dim.x += img.width;
			dim.y = Math.max(dim.y, img.height);
		}
		return dim;
	}
	async mergeImages(imgs) {
		const canvas = document.createElement("canvas");


		// preset canvas

		// normalize the width

		// calculate the true width

		let width = 0;
		const xPos = [];
		for (const img of imgs) {
			xPos.push(width);
			const remainder = (24 - (img.width % 24));
			if (remainder % 24 === 0) {
				width += img.width;
			} else {
				// round up
				width += img.width + remainder;
			}
		}

		canvas.width = width;
		canvas.height = 24;
		const ctx = canvas.getContext("2d");

		// want to go by a factor of 24
		// go one by one
		for (const img of imgs) {
			ctx.drawImage(img, xPos.shift(), 0);
		}
		return await ImageUtils.createImage(canvas.toDataURL("image/png"));
	}

	calcStartIndex(dim, extraImgs) {
		// assume each head is 24x24
		return (dim.x - (extraImgs.length * 24)) / 24;
	}

	getHeadIdx() {
		return new Promise((resolve, reject) => {
			$.ajax({
				dataType: "json",
				url: "data/players/headIdx.json",
				success: (data) => {
					resolve(data)
				},
				error: () => {
					reject();
				}
			})
		});
	}
}