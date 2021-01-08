export default class Skier{
	constructor(game) {
		this.game = game;
		this.x = game.gameWidth / 2;
		this.y = game.gameHeight / 3;
		this.xv = 0;
		this.yv = 0;
		this.accelX = 5;
		this.accelY = 5;
		this.decel = -5;
		this.loadSkierImages();
		this.currentImage = this.skier_left;
		this.isStopped = true;
		this.isCrashed = false;
		this.isJumping = false;
		this.jumpOffset = 0;
		this.jumpV = 0;
		this.jumpVInit = 1;
		this.jumpGravity = .015;
	}

	loadSkierImages() {
		this.skier_left = new Image();
		this.skier_left.src = "/img/skier_left.png";
		this.skier_left_down = new Image();
		this.skier_left_down.src = "/img/skier_left_down.png";
		this.skier_down_left = new Image();
		this.skier_down_left.src = "/img/skier_down_left.png";
		this.skier_down = new Image();
		this.skier_down.src = "/img/skier_down.png";
		this.skier_down_right = new Image();
		this.skier_down_right.src = "/img/skier_down_right.png";
		this.skier_right_down = new Image();
		this.skier_right_down.src = "/img/skier_right_down.png";
		this.skier_right = new Image();
		this.skier_right.src = "/img/skier_right.png";
		this.skier_jump_down = new Image();
		this.skier_jump_down.src = "/img/skier_jump_down.png";
		this.skier_jump_left = new Image();
		this.skier_jump_left.src = "/img/skier_jump_left.png";
		this.skier_jump_right = new Image();
		this.skier_jump_right.src = "/img/skier_jump_right.png";
		this.skier_falling = new Image();
		this.skier_falling.src = "/img/skier_falling.png";
		this.skier_sit = new Image();
		this.skier_sit.src = "/img/skier_sit.png";
		this.skier_shadow = new Image();
		this.skier_shadow.src = "/img/skier_shadow.png";
	}

	draw(ctx) {
		ctx.drawImage(this.currentImage, this.x, this.y - this.jumpOffset);

		if (this.isJumping) {
			//ctx.drawImage(this.skier_shadow, this.x + 3, this.y + 25);
		}
	}
}