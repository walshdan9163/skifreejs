import Skier from "/src/skier.js";
import Lift from "/src/lift.js";

export default class Game {
	constructor() {
		this.skier = new Skier(this);
		this.lift = new Lift(this);
		this.mousePos = [0, 0];
		this.lastLogTime = null;
		this.treeDensity = 0.8;
		this.bumpDensity = 1.0;
		this.rockDensity = 0.1;
		this.jumpDensity = 0.05;
		this.skierTrail = [];
		this.collisionsEnabled = true;
		this.loadGameImages();
		this.populateInitialGameObjects();
	}

	loadGameImages() {
		this.tree_small = new Image();
		this.tree_small.src = "/img/tree_small.png";

		this.tree_large = new Image();
		this.tree_large.src = "/img/tree_large.png";

		this.tree_bare = new Image();
		this.tree_bare.src = "/img/tree_bare.png";

		this.boarder_bro = new Image();
		this.boarder_bro.src = "/img/boarder_bro.png";

		this.lodge = new Image();
		this.lodge.src = "/img/lodge.png";
		this.lodge.xc = 50;
		this.lodge.yc = -100;

		this.bump_small = new Image();
		this.bump_small.src = "/img/bump_small.png";

		this.bump_large = new Image();
		this.bump_large.src = "/img/bump_large.png";

		this.bump_group = new Image();
		this.bump_group.src = "/img/bump_group.png";

		this.rock = new Image();
		this.rock.src = "/img/rock.png";

		this.jump = new Image();
		this.jump.src = "/img/jump.png";
	}

	// generate game objects to put on and around screen at start of game
	populateInitialGameObjects() {
		let width = window.innerWidth;
		let height = window.innerHeight;
		let area = width * height;

		// number of game objects to generate is proportional to total screen area
		this.treeCount = Math.floor(area * (50 / 562860.0) * this.treeDensity);
		this.bumpCount = Math.floor(area * (50 / 562860.0) * this.bumpDensity);
		this.rockCount = Math.floor(area * (50 / 562860.0) * this.rockDensity);
		this.jumpCount = Math.floor(area * (50 / 562860.0) * this.jumpDensity);

		// create trees
		this.trees = [];
		for (let n = 0; n < this.treeCount; n++) {
			let x = this.randomInt(-width * 3 / 2, width * 3 / 2);
			let y = this.randomInt(-height / 3, height * 5 / 3);
			this.trees.push([x, y, false, this.randomInt(0, 3)]);
			// x-coordinate, y-coordinate, hasSkierHitThisTreeYet, treeType
		}

		// create bumps
		this.bumps = [];
		for (let n = 0; n < this.bumpCount; n++) {
			let x = this.randomInt(-width * 3 / 2, width * 3 / 2);
			let y = this.randomInt(-height / 3, height * 5 / 3);
			this.bumps.push([x, y, this.randomInt(0, 3)]);
			// x-coordinate, y-coordinate, bumpType
		}

		// create rocks
		this.rocks = [];
		for (let n = 0; n < this.rockCount; n++) {
			let x = this.randomInt(-width * 3 / 2, width * 3 / 2);
			let y = this.randomInt(-height / 3, height * 5 / 3);
			this.rocks.push([x, y, false]);
			// x-coordinate, y-coordinate, hasSkierHitThisRockYet
		}

		// create rocks
		this.jumps = [];
		for (let n = 0; n < this.jumpCount; n++) {
			let x = this.randomInt(-width * 3 / 2, width * 3 / 2);
			let y = this.randomInt(-height / 3, height * 5 / 3);
			this.jumps.push([x, y, false]);
			// x-coordinate, y-coordinate, hasSkierHitThisJumpYet
		}
	}

	// spawn a new object of the given type in a random location offscreen
	spawnNewGameObjectOffScreen(type) {
		let x = this.randomInt(-this.gameWidth * 3 / 2, this.gameWidth * 3 / 2);
		let y = this.randomInt(-this.gameHeight / 3, this.gameHeight * 5 / 3);

		// if game object would be visible, spawn it nearby offscreen instead
		if (x > -this.gameWidth / 2 && x < this.gameWidth / 2 && 
			y > -this.gameHeight / 3 && y < this.gameHeight * 2 / 3) {
				let flip = this.randomInt(0, 5);
				if (flip == 0) {
					x -= this.gameWidth;
				} else if (flip == 1) {
					x -= this.gameWidth;
					y += this.gameHeight;
				} else if (flip == 2) {
					y += this.gameHeight;
				} else if (flip == 3) {
					x += this.gameWidth;
					y += this.gameHeight;
				} else {
					x += this.gameWidth;
				}
			}

		if (type == 'bump') {
			return [x, y, this.randomInt(0, 3)];
		} else if (type == 'tree') {
			return [x, y, false, this.randomInt(0, 3)];
		} else if (type == 'rock' || type == 'jump') {
			return [x, y, false];
		}
	}

	// adapt game to the size of the window
	resize(newWidth, newHeight) {
		this.gameWidth = newWidth;
		this.gameHeight = newHeight;

		this.skier.x = this.gameWidth / 2;
		this.skier.y = this.gameHeight / 3;

		this.adaptGameObjectCountToScreenSize();
	}

	adaptGameObjectCountToScreenSize() {
		this.treeCount = Math.floor(this.gameWidth * this.gameHeight * (50 / 562860.0) * this.treeDensity);

		// trim excess offscreen trees
		if (this.trees.length > this.treeCount) {
			for (let i = 0; i < this.trees.length; i++) {
				let x = this.trees[i][0];
				let y = this.trees[i][1];

				// remove the tree if it is offscreen
				if (!(x > -this.gameWidth / 2 && x < this.gameWidth / 2 && 
					y > -this.gameHeight / 3 && y < this.gameHeight * 2 / 3)) {
						this.trees.splice(i, 1);
				}
			}
		// add some new trees offscreen
		} else if (this.trees.length < this.treeCount) {
			let diff = this.treeCount - this.trees.length;
			for (let n = 0; n < diff; n++) {
				this.trees.push(this.spawnNewGameObjectOffScreen('tree'));
			}
		}

		this.bumpCount = Math.floor(this.gameWidth * this.gameHeight * (50 / 562860.0) * this.bumpDensity);

		// trim excess offscreen bumps
		if (this.bumps.length > this.bumpCount) {
			for (let i = 0; i < this.bumps.length; i++) {
				let x = this.bumps[i][0];
				let y = this.bumps[i][1];

				// remove the bump if it is offscreen
				if (!(x > -this.gameWidth / 2 && x < this.gameWidth / 2 && 
					y > -this.gameHeight / 3 && y < this.gameHeight * 2 / 3)) {
						this.bumps.splice(i, 1);
				}
			}
		// add some new bumps offscreen
		} else if (this.bumps.length < this.bumpCount) {
			let diff = this.bumpCount - this.bumps.length;
			for (let n = 0; n < diff; n++) {
				this.bumps.push(this.spawnNewGameObjectOffScreen('bump'));
			}
		}

		this.rockCount = Math.floor(this.gameWidth * this.gameHeight * (50 / 562860.0) * this.rockDensity);

		// trim excess offscreen rocks
		if (this.rocks.length > this.rockCount) {
			for (let i = 0; i < this.rocks.length; i++) {
				let x = this.rocks[i][0];
				let y = this.rocks[i][1];

				// remove the rock if it is offscreen
				if (!(x > -this.gameWidth / 2 && x < this.gameWidth / 2 && 
					y > -this.gameHeight / 3 && y < this.gameHeight * 2 / 3)) {
						this.rocks.splice(i, 1);
				}
			}
		// add some new rocks offscreen
		} else if (this.rocks.length < this.rockCount) {
			let diff = this.rockCount - this.rocks.length;
			for (let n = 0; n < diff; n++) {
				this.rocks.push(this.spawnNewGameObjectOffScreen('rock'));
			}
		}

		this.jumpCount = Math.floor(this.gameWidth * this.gameHeight * (50 / 562860.0) * this.jumpDensity);

		// trim excess offscreen jumps
		if (this.jumps.length > this.jumpCount) {
			for (let i = 0; i < this.jumps.length; i++) {
				let x = this.jumps[i][0];
				let y = this.jumps[i][1];

				// remove the jump if it is offscreen
				if (!(x > -this.gameWidth / 2 && x < this.gameWidth / 2 && 
					y > -this.gameHeight / 3 && y < this.gameHeight * 2 / 3)) {
						this.jumps.splice(i, 1);
				}
			}
		// add some new jumps offscreen
		} else if (this.jumps.length < this.jumpCount) {
			let diff = this.jumpCount - this.jumps.length;
			for (let n = 0; n < diff; n++) {
				this.jumps.push(this.spawnNewGameObjectOffScreen('jump'));
			}
		}
	}
	
	update(step) {
		this.skier.update(this.crunchSomeNumbas());
		this.lift.update(step);
		this.updateGameObjects();

		// scale the number of game objects to the size of the screen
		if (this.treeCount != this.trees.length || this.bumpCount != this.bumps.length || 
			this.rockCount != this.rocks.length || this.jumpCount != this.jumps.length) {
			this.adaptGameObjectCountToScreenSize();
		}

		// update position of game objects based on speed/direction of skier
		this.updatePosition(this.trees, step);
		this.updatePosition(this.bumps, step);
		this.updatePosition(this.rocks, step);
		this.updatePosition(this.jumps, step);
		this.updatePosition(this.skierTrail, step);

		// update position of lodge
		//this.lodge.xc -= this.skier.xv * step;
		//this.lodge.yc -= this.skier.yv * step;
	}

	updatePosition(gameObjectList, step) {
		for (let i = 0; i < gameObjectList.length; i++) {
			gameObjectList[i][0] -= this.skier.xv * step;
			gameObjectList[i][1] -= this.skier.yv * step;
		}
	}

	updateGameObjects() {
		for (let i = 0; i < this.trees.length; i++) {
			let treeX = this.trees[i][0];
			let treeY = this.trees[i][1];
			let hitThisTreeAlready = this.trees[i][2];

			// recycle uphill offscreen trees once they are passed
			if (this.skier.y - treeY > this.gameHeight * (2 / 3) + 50) {
				this.trees[i] = this.spawnNewGameObjectOffScreen('tree');
			}

			// if the skier hits a tree they haven't hit already, set isCrashed to true
			if (this.isCollidingWithSkier(treeX + 6, treeY + 24, 16, 7) && this.skier.jumpOffset < this.tree_small.height) {
				if (this.collisionsEnabled && !hitThisTreeAlready) {
					this.skier.isCrashed = true;
					this.trees[i][2] = true;
				}
			}
		}

		// recycle bumps once they are passed
		for (let i = 0; i < this.bumps.length; i++) {
			if (this.skier.y - this.bumps[i][1] > this.gameHeight * (2 / 3) + 50) {
				this.bumps[i] = this.spawnNewGameObjectOffScreen('bump');
			}
		}

		for (let i = 0; i < this.rocks.length; i++) {
			let rockX = this.rocks[i][0];
			let rockY = this.rocks[i][1];
			let hitThisRockAlready = this.rocks[i][2];

			// recycle uphill offscreen rocks once they are passed
			if (this.skier.y - rockY > this.gameHeight * (2 / 3) + 50) {
				this.rocks[i] = this.spawnNewGameObjectOffScreen('rock');
			}

			// if the skier hits a rock they haven't hit already, set isCrashed to true
			if (this.isCollidingWithSkier(rockX, rockY, this.rock.width, this.rock.height) && this.skier.jumpOffset < this.rock.height) {
				if (this.collisionsEnabled && !hitThisRockAlready) {
					this.skier.isCrashed = true;
					this.rocks[i][2] = true;
				}
			}
		}

		for (let i = 0; i < this.jumps.length; i++) {
			let jumpX = this.jumps[i][0];
			let jumpY = this.jumps[i][1];
			let hitThisJumpAlready = this.jumps[i][2];

			// recycle uphill offscreen jumps once they are passed
			if (this.skier.y - jumpY > this.gameHeight * (2 / 3) + 50) {
				this.jumps[i] = this.spawnNewGameObjectOffScreen('jump');
			}

			// if the skier hits a jump they haven't hit already, mark it as hit and make the skier jump
			if (this.isCollidingWithSkier(jumpX, jumpY, 32, 8) && !this.skier.isJumping) {
				if (this.collisionsEnabled && !hitThisJumpAlready) {
					this.skier.isJumping = true;
					this.skier.jumpV = this.skier.jumpVInit * 2;
				}
			}
		}

		// delete skier trail if offscreen
		for (let i = 0; i < this.skierTrail.length; i++) {
			let y = this.skierTrail[i][1];
			if (this.skier.y - y > this.gameHeight * (2 / 3) + 50) {
				this.skierTrail.splice(i, 1);
			}
		}
	}

	isCollidingWithSkier(objectX, objectY, objectWidth, objectHeight) {
		let rect1 = {x: 2, y: 24, width: 10, height: 2};
		let rect2 = {x: objectX, y: objectY, width: objectWidth, height: objectHeight};

		if (rect1.x < rect2.x + rect2.width &&
			rect1.x + rect1.width > rect2.x &&
			rect1.y < rect2.y + rect2.height &&
			rect1.y + rect1.height > rect2.y) {
				return true;
		 }
		 return false;
	}

	// do sum mathz
	crunchSomeNumbas() {
		let mouseDiffX = -(this.mousePos[0] - ((this.gameWidth / 2) + 8));
		let mouseDiffY = -(this.mousePos[1] - ((this.gameHeight / 3) + 32));
		let mouseAtanDegrees = this.degrees(Math.atan(mouseDiffY / mouseDiffX));
		let mouseAngle = 0, mouseDiffXVector = 0, mouseDiffYVector = 0;

		if (mouseDiffX > 0) {
			mouseAngle = mouseAtanDegrees;
			mouseDiffXVector = -Math.cos(this.radians(mouseAngle));
			mouseDiffYVector = -Math.sin(this.radians(mouseAngle));
		} else if (mouseDiffX < 0) {
			if (mouseDiffY > 0) {
				mouseAngle = 180 + mouseAtanDegrees;
			} else if (mouseDiffY < 0) {
				mouseAngle = -180 + mouseAtanDegrees;
			}
			mouseDiffXVector = -Math.cos(this.radians(mouseAngle));
			mouseDiffYVector = -Math.sin(this.radians(mouseAngle));
		} else if (mouseDiffX == 0) {
			if (mouseDiffY > 0) {
				mouseAngle = -90;
			} else {
				mouseAngle = 90
			}
			mouseDiffXVector = Math.cos(this.radians(mouseAngle));
			mouseDiffYVector = Math.sin(this.radians(mouseAngle));
		} else if (mouseDiffY == 0) {
			mouseAngle = 180;
			mouseDiffXVector = Math.cos(this.radians(mouseAngle));
			mouseDiffYVector = Math.sin(this.radians(mouseAngle));
		}

		let vAtanDegrees = this.degrees(Math.atan(this.skier.yv / this.skier.xv));
		let vAngle = 0, xvVector = 0, yvVector = 0;

		if (this.skier.xv > 0) {
			vAngle = vAtanDegrees;
			xvVector = -Math.cos(this.radians(vAngle));
			yvVector = -Math.sin(this.radians(vAngle));
		} else if (this.skier.xv < 0) {
			if (this.skier.yv > 0) {
				vAngle = 180 + vAtanDegrees;
			} else if (this.skier.yv < 0) {
				vAngle = -180 + vAtanDegrees;
			}
			xvVector = -Math.cos(this.radians(vAngle));
			yvVector = -Math.sin(this.radians(vAngle));
		} else if (this.skier.xv == 0) {
			if (this.skier.yv > 0) {
				vAngle = -90;
			} else {
				vAngle = 90
			}
			xvVector = Math.cos(this.radians(vAngle));
			yvVector = Math.sin(this.radians(vAngle));
		} else if (this.skier.yv == 0) {
			vAngle = 180;
			xvVector = Math.cos(this.radians(vAngle));
			yvVector = Math.sin(this.radians(vAngle));
		}

		return [mouseAngle, [mouseDiffXVector, mouseDiffYVector], [xvVector, yvVector]];
	}

	// convert radians to degrees
	degrees(radians) {
		return (radians * 180) / Math.PI;
	}

	// convert degrees to radians
	radians(degrees) {
		return (degrees * Math.PI) / 180;
	}

	// minimum is inclusive and maximum is exclusive
	randomInt(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min) + min); 
	}

	// get the current time (high precision)
	timestamp() {
		return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
	}

	// render the current state of the game
	draw(ctx) {
		// clear and fill with background color
		ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
		ctx.fillStyle = "#FFFFFF";
		ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);

		// draw bumps
		for (let i = 0; i < this.bumps.length; i++) {
			let type = this.bumps[i][2];
			let img = this.bump_group;
			if (type == 0) {
				img = this.bump_small;
			} else if (type == 1) {
				img = this.bump_large;
			}

			ctx.drawImage(img, this.skier.x + this.bumps[i][0], this.skier.y + this.bumps[i][1]);
		}

		// draw skier trail
		for (let i = 0; i < this.skierTrail.length; i++) {
			ctx.fillStyle = "#DDDDDD";
			ctx.fillRect(this.skier.x + this.skierTrail[i][0], this.skier.y + this.skierTrail[i][1], 2, 1);
			ctx.fillRect(this.skier.x + this.skierTrail[i][0] + 8, this.skier.y + this.skierTrail[i][1], 2, 1);
		}

		// draw jumps
		for (let i = 0; i < this.jumps.length; i++) {
			ctx.drawImage(this.jump, this.skier.x + this.jumps[i][0], this.skier.y + this.jumps[i][1]);
		}

		// draw rocks
		for (let i = 0; i < this.rocks.length; i++) {
			ctx.drawImage(this.rock, this.skier.x + this.rocks[i][0], this.skier.y + this.rocks[i][1]);
		}

		// draw trees above skier
		for (let i = 0; i < this.trees.length; i++) {
			if (this.trees[i][1] < -2) {
				let type = this.trees[i][3];
				let img = this.tree_small;
				if (type == 0) {
					img = this.tree_bare;
				} else if (type == 1) {
					img = this.tree_small;
				}

				ctx.drawImage(img, this.skier.x + this.trees[i][0], this.skier.y + this.trees[i][1]);
			}
		}

		// draw lift towers above skier
		this.lift.drawTowersAbovePlayer(ctx);

		// draw skier
		this.skier.draw(ctx);
		
		// draw trees below skier
		for (let i = 0; i < this.trees.length; i++) {
			if (this.trees[i][1] >= -2) {
				let type = this.trees[i][3];
				let img = this.tree_small;
				if (type == 0) {
					img = this.tree_bare;
				} else if (type == 1) {
					img = this.tree_small;
				}

				ctx.drawImage(img, this.skier.x + this.trees[i][0], this.skier.y + this.trees[i][1]);
			}
		}

		// draw lift chairs
		this.lift.drawChairs(ctx);

		// draw lift cables
		this.lift.drawCables(ctx);

		// draw lift towers below skier
		this.lift.drawTowersBelowPlayer(ctx);

		this.lift.drawTowerTops(ctx);

		// draw lodge
		//ctx.drawImage(this.lodge, this.skier.x + this.lodge.xc, this.skier.y + this.lodge.yc);
	}

	log(toLog) {
		if (this.lastLogTime == null) {
			this.lastLogTime = this.timestamp();
		}
		
		if (this.timestamp() - this.lastLogTime > 500) {
			console.log(toLog);
			this.lastLogTime = null;
		}
	}
}