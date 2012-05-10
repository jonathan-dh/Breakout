var Canvas = function($dom, options) {

	this.clear = function() {
		this.$dom.empty();
	}
	
	this.reset = function() {
		this.clear();
		
		this.$dom.css(this.options.css);
				
		this.$dom.width(this.options.width);
		this.$dom.height(this.options.height);
		
		this.paddle.setCanvas(this);
		this.balls.setCanvas(this);
		this.blocks.setCanvas(this);
		this.infozone.setCanvas(this);
		
		this.paddle.reset();
		this.balls.reset();
		this.blocks.reset();
		this.infozone.reset();
		
		this.$dom.mousemove(this.paddle.onMouseMove);
		
		this.$dom.click(this.paddle.onClick);
	}
	
	this.setPaddle = function(paddle) {
		this.paddle = paddle;
	}
	
	this.setBalls = function(balls) {
		this.balls = balls;
	}
	
	this.setBlocks = function(blocks) {
		this.blocks = blocks;
	}
	
	this.setInfozone = function(infozone) {
		this.infozone = infozone;
	}
	
	this.append = function($dom) {
		this.$dom.append($dom);
	}
	
	this.width = function(width) {
		return this.$dom.width(width);
	}
	
	this.height = function(height) {
		return this.$dom.height(height);
	}
	
	this.$dom = $dom;
	this.options = options;
	this.paddle;
	this.blockManager;
}

var Blocks = function(options) {

	this.draw = function() {
		for(var rowI = this.options.numRows; rowI; rowI--) {
			for(var colI = this.options.numColumns; colI; colI--) {
			
				var _left = Math.round(this.widthSpacing + ((colI-1) * (this.options.block.width + this.widthSpacing)));
				var _bottom = Math.round(this.heightStart + ((rowI-1) * (this.options.block.height + this.heightSpacing)));
				var _i = (((rowI-1)*this.options.numColumns+colI) - (this.options.numRows*this.options.numColumns)) * -1;
				
				var classNames = ['Block','Block', 'BlockSolid', 'BlockExplode', 'BlockBallExtra', 'BlockPaddleFire', 'BlockTough', 'BlockFaster', 'BlockSlow', 'BlockPaddleBig', 'BlockPaddleSmall'];
				var _className = classNames[Math.round(10*Math.random())];

				eval('var block = new ' + _className + '();');
				
				block.init({
					className: _className,
					i: _i,
					row: rowI,
					col: colI,
					canvas: this.canvas,
					css: $.extend(this.options.block.css, {
						position: 'absolute',
						bottom: _bottom + 'px',
						left: _left + 'px',
						width: this.options.block.width + 'px',
						height: this.options.block.height + 'px',
					}),
					pos: {
						x: _left,
						y: _bottom
					},
					width: this.options.block.width,
					height: this.options.block.height
				});
			
				this.canvas.append(block.$dom);
				
				if (block.options.className != 'BlockSolid') {
					this.blocksLeft++;
				}
				
				this.blocks[_i] = block;
				
				if (!this.blockIds[rowI])
					this.blockIds[rowI] = [];
				
				this.blockIds[rowI][colI] = _i;
			}
		}
	}
	
	
	this.reset = function() {
		this.draw();
	}
	
	this.setCanvas = function(canvas) {
		this.canvas = canvas;
		
		var widthTotalBlocks = this.options.block.width * this.options.numColumns;
		var widthLeft = this.canvas.width() - widthTotalBlocks;
		this.widthSpacing = widthLeft / (this.options.numColumns+1);

		var heightTotalBlocks = this.options.block.height * this.options.numRows;
		this.heightStart = this.options.heightStart;
		var heightLeft = (this.canvas.height() - this.heightStart) - heightTotalBlocks;
		this.heightSpacing = heightLeft / (this.options.numRows);
	}
	
	this.setTimer = function(groupName, timeout, callback){
		if (this.timers[groupName]) {
			clearTimeout(this.timers[groupName]);
		}
		
		this.timers[groupName] = setTimeout(callback, timeout);
	}
	
	this.canvas;
	this.options = options;
	
	this.blocksLeft=0;
	this.blocks = [];
	this.blockIds = [];
	this.timers = [];
};

var Block = function() {	

	var block = this;
	
	this.draw = function() {
		this.$dom.css($.extend(this.options.css, {
			lineHeight: this.options.height + 'px'
		}));
		this.$dom.addClass('block');

		this.drawBgGradient();
	}
	
	this.drawBgGradient = function() {
		var colR = (150*Math.random()|0);
		var colG = (150*Math.random()|0);
		var colB = (150*Math.random()|0);

		var colgr = '-webkit-gradient(linear,left bottom,left top,color-stop(0.08, rgb('
		+(colR)+','+(colG)+','+(colB)+')),color-stop(0.54, rgb('
		+(colR+50)+','+(colG+50)+','+(colB+50)+')),color-stop(0.77, rgb('
		+(colR+100)+','+(colG+100)+','+(colB+100)+')))';
		
		this.$dom.css({ background: colgr });	
	}
		
	this.onCollision = function(e, useThis) {
		var _block = useThis ? this : block;
	
		_block.remove();
		
		_block.options.canvas.blocks.blocks[_block.options.i] = false;
		_block.options.canvas.blocks.blocksLeft--;
		
		if (_block.options.canvas.blocks.blocksLeft <= 0) {
			game.gamewon();
		}
	}
	
	this.remove = function() {
		//this.$dom.remove();
		this.$dom.hide("explode", 500);
	}

	this.init = function(options) {
		this.options = options;
		this.$dom = $('<span />').first();
		
		this.pos = {
			x: this.options.pos.x,
			left: this.options.pos.x,
			right: this.options.pos.x + this.options.width,
			
			y: this.options.pos.y,
			bottom: this.options.pos.y,
			top: this.options.pos.y + this.options.height
		};
		
		this.draw();
	}
};

var BlockSolid = function(){

	this._draw = this.draw;
	this.draw = function(e) {
		this._draw();
		
		this.$dom.css({background: 'inherit'});
		this.$dom.addClass('solid');
	}
	
	this._onCollision = this.onCollision;
	this.onCollision = function(e) {
		// nothing
	}
}
BlockSolid.prototype = new Block();
BlockSolid.prototype.constructor = Block;

var BlockExplode = function(){

	this._draw = this.draw;
	this.draw = function(e) {
		this._draw();
		
		this.$dom.text('!');
	}
	
	this._onCollision = this.onCollision;
	this.onCollision = function(e) {
		this._onCollision(e, true);
		
		var blockCoords = [
			{row: this.options.row-1, col: this.options.col}, //top
			{row: this.options.row+1, col: this.options.col}, //bottom
			{row: this.options.row, col: this.options.col-1}, //right
			{row: this.options.row, col: this.options.col+1} //left
		];
		
		var block = this;
		
		$.each(blockCoords, function(i, blockCoord){
			
			if (! block.options.canvas.blocks.blockIds[blockCoord.row]) return;
			if (! block.options.canvas.blocks.blockIds[blockCoord.row][blockCoord.col]) return;
			
			var blockId = block.options.canvas.blocks.blockIds[blockCoord.row][blockCoord.col];
			var _block = block.options.canvas.blocks.blocks[blockId];
			
			if (_block) {
				_block.onCollision();
			}
		});
	}
}
BlockExplode.prototype = new Block();
BlockExplode.prototype.constructor = Block;

var BlockFaster = function(){

	this._draw = this.draw;
	this.draw = function(e) {
		this._draw();
		
		//this.$dom.text('S+');
	}
	
	this._onCollision = this.onCollision;
	this.onCollision = function(e) {
	
		var block = this;
		var balls = this.options.canvas.balls;
		
		var catchable = new Catchable({
			width: this.options.width,
			height: this.options.height/5,
			css: {
				width: this.options.width + 'px',
				height: Math.round(this.options.height/5) + 'px',
				borderRadius: Math.round(this.options.height/5) + 'px',
				backgroundColor: 'orange'
			},
			pos: {
				x: this.pos.x,
				y: this.pos.y
			},
			onCollision: function() {
				balls.setRate(balls.options.refresh.rateFast);
				
				block.options.canvas.blocks.setTimer('speed', 8000, function(){
					balls.setRate(balls.options.refresh.rateNormal);
				});	
			}
		});
	
		catchable.setCanvas(this.options.canvas);
		catchable.reset();
	
		block._onCollision(e, true);	}
}
BlockFaster.prototype = new Block();
BlockFaster.prototype.constructor = Block;

var BlockSlow = function(){

	this._draw = this.draw;
	this.draw = function(e) {
		this._draw();
		
		//this.$dom.text('S-');
	}
	
	this._onCollision = this.onCollision;
	this.onCollision = function(e) {
	
		var block = this;
		var balls = this.options.canvas.balls;
		
		var catchable = new Catchable({
			width: this.options.width,
			height: this.options.height/5,
			css: {
				width: this.options.width + 'px',
				height: Math.round(this.options.height/5) + 'px',
				borderRadius: Math.round(this.options.height/5) + 'px',
				backgroundColor: 'purple'
			},
			pos: {
				x: this.pos.x,
				y: this.pos.y
			},
			onCollision: function() {
				balls.setRate(balls.options.refresh.rateSlow);
				
				block.options.canvas.blocks.setTimer('speed', 8000, function(){
					balls.setRate(balls.options.refresh.rateNormal);
				});	
			}
		});
	
		catchable.setCanvas(this.options.canvas);
		catchable.reset();
	
		block._onCollision(e, true);
	}
}
BlockSlow.prototype = new Block();
BlockSlow.prototype.constructor = Block;

var BlockPaddleBig = function(){

	this._draw = this.draw;
	this.draw = function(e) {
		this._draw();
		
		//this.$dom.text('P+');
	}
	
	this._onCollision = this.onCollision;
	this.onCollision = function(e) {
	
		var block = this;
		var paddle = this.options.canvas.paddle;
		
		var catchable = new Catchable({
			width: this.options.width,
			height: this.options.height/5,
			css: {
				width: this.options.width + 'px',
				height: Math.round(this.options.height/5) + 'px',
				borderRadius: Math.round(this.options.height/5) + 'px',
				backgroundColor: 'green'
			},
			pos: {
				x: this.pos.x,
				y: this.pos.y
			},
			onCollision: function() {
				paddle.setWidth(paddle.options.widthBig);
				
				block.options.canvas.blocks.setTimer('paddleWidth', 8000, function(){
					paddle.setWidth(paddle.options.widthNormal);
				});	
			}
		});
	
		catchable.setCanvas(this.options.canvas);
		catchable.reset();
	
		block._onCollision(e, true);
	}
}
BlockPaddleBig.prototype = new Block();
BlockPaddleBig.prototype.constructor = Block;

var BlockPaddleSmall = function(){

	this._draw = this.draw;
	this.draw = function(e) {
		this._draw();
		
		//this.$dom.text('P-');
	}

	this._onCollision = this.onCollision;
	this.onCollision = function(e) {
	
		var block = this;
		var paddle = this.options.canvas.paddle;
		
		var catchable = new Catchable({
			width: this.options.width,
			height: this.options.height/5,
			css: {
				width: this.options.width + 'px',
				height: Math.round(this.options.height/5) + 'px',
				borderRadius: Math.round(this.options.height/5) + 'px',
				backgroundColor: 'red'
			},
			pos: {
				x: this.pos.x,
				y: this.pos.y
			},
			onCollision: function() {
				paddle.setWidth(paddle.options.widthSmall);
				
				block.options.canvas.blocks.setTimer('paddleWidth', 8000, function(){
					paddle.setWidth(paddle.options.widthNormal);
				});	
			}
		});
	
		catchable.setCanvas(this.options.canvas);
		catchable.reset();
	
		block._onCollision(e, true);	
	}
}
BlockPaddleSmall.prototype = new Block();
BlockPaddleSmall.prototype.constructor = Block;

var BlockBallExtra = function(){

	this._draw = this.draw;
	this.draw = function(e) {
		this._draw();
		
		this.$dom.text('EB');
	}

	this._onCollision = this.onCollision;
	this.onCollision = function(e) {
	
		var block = this;
		var balls = this.options.canvas.balls;
		
		var catchable = new Catchable({
			width: this.options.width,
			height: this.options.height/5,
			css: {
				width: this.options.width + 'px',
				height: Math.round(this.options.height/5) + 'px',
				borderRadius: Math.round(this.options.height/5) + 'px',
				backgroundColor: 'black'
			},
			pos: {
				x: this.pos.x,
				y: this.pos.y
			},
			onCollision: function() {
				balls.addBall();
			}
		});
	
		catchable.setCanvas(this.options.canvas);
		catchable.reset();
	
		block._onCollision(e, true);	
	}
}
BlockBallExtra.prototype = new Block();
BlockBallExtra.prototype.constructor = Block;

var BlockPaddleFire = function(){

	this._draw = this.draw;
	this.draw = function(e) {
		this._draw();
		
		this.$dom.text('F');
	}

	this._onCollision = this.onCollision;
	this.onCollision = function(e) {
	
		var block = this;
		var paddle = this.options.canvas.paddle;
		
		var catchable = new Catchable({
			width: this.options.width,
			height: this.options.height/5,
			css: {
				width: this.options.width + 'px',
				height: Math.round(this.options.height/5) + 'px',
				borderRadius: Math.round(this.options.height/5) + 'px',
				backgroundColor: 'cyan'
			},
			pos: {
				x: this.pos.x,
				y: this.pos.y
			},
			onCollision: function() {
				paddle.setCanFire(true);
				
				block.options.canvas.blocks.setTimer('paddleFire', 8000, function(){
					paddle.setCanFire(false);
				});	
			}
		});
	
		catchable.setCanvas(this.options.canvas);
		catchable.reset();
	
		block._onCollision(e, true);	
	}
}
BlockPaddleFire.prototype = new Block();
BlockPaddleFire.prototype.constructor = Block;

var BlockTough = function(){

	this._onCollision = this.onCollision;
	this.onCollision = function(e) {
	
		var block = this;
		
		if (block.numCollisionsBeforeBreak <= 0) {	
			block._onCollision(e, true);
		}
		else {
			block.$dom.fadeTo('slow', 1 - (1/(block.numCollisionsBeforeBreak+1)));
			block.numCollisionsBeforeBreak--;
		}
	}
	
	this.numCollisionsBeforeBreak = 2;
}
BlockTough.prototype = new Block();
BlockTough.prototype.constructor = Block;


var Catchable = function(options) {
	
	this.draw = function() {
		this.$dom.css($.extend(this.options.css, {
			position: 'absolute'
		}));
		
		this.$dom.addClass('catchable');
		
		this.canvas.append(this.$dom);
		
		this.moveTo(this.pos.x, this.pos.y);
		
		this.interval = setInterval(this.onInterval, 10);
	}
	
	this.onInterval = function(e, useThis) {
		var _catchable = useThis ? this : catchable;
		
		_catchable.testCollision(_catchable.canvas.paddle, {
			x: _catchable.pos.x,
			y: _catchable.pos.y-1
		});
		
		_catchable.moveTo(null, _catchable.pos.y-1);
	}

	this.moveTo = function(x, y) {
		if (x || x === 0) {
			this.$dom.css('left', x + 'px');
			this.pos.x = x;
			
			this.pos.top.x = x + this.options.radius;
			this.pos.bottom.x = x + this.options.radius;
			this.pos.left.x = x;
			this.pos.right.x = x + this.options.radius*2;
		}
		
		if (y || y === 0) {
			this.$dom.css('bottom', y + 'px');
			this.pos.y = y;
			
			this.pos.top.y = y + this.options.radius*2;
			this.pos.bottom.y = y;
			this.pos.left.y = y + this.options.radius;
			this.pos.right.y = y + this.options.radius;
		}
	}
	
	this.testCollision = function(obj, newPos) {
		if (newPos) {
			var myPos = {
				top: {
					x: newPos.x + this.options.width/2,
					y: newPos.y + this.options.height
				},
				bottom: {
					x: newPos.x + this.options.width/2,
					y: newPos.y
				},
				left: {
					x: newPos.x,
					y: newPos.y + this.options.height/2
				},
				right: {
					x: newPos.x + this.options.width,
					y: newPos.y + this.options.height/2
				}
			}
		} else {
			var newPos = {x:this.pos.x,y:this.pos.y};
			myPos = this.pos;
		}
		
		if (myPos.bottom.y <= 0) { // bottom wall
			this.stop();
			this.remove();
		}
		
		var touchingPaddle = {
			top	: (
				myPos.bottom.y <= obj.pos.top && 
				myPos.bottom.y > obj.pos.bottom &&
				myPos.bottom.x <= obj.pos.right && 
				myPos.bottom.x >= obj.pos.left
			),
			bottom : (
				myPos.top.y >= obj.pos.bottom &&
				myPos.top.y < obj.pos.top &&
				myPos.top.x <= obj.pos.right && 
				myPos.top.x >= obj.pos.left
			),
			left : ( 
				myPos.right.x >= obj.pos.left && 
				myPos.right.x < obj.pos.right &&
				myPos.right.y <= obj.pos.top && 
				myPos.right.y >= obj.pos.bottom
			),
			right : (
				myPos.left.x <= obj.pos.right && 
				myPos.left.x > obj.pos.left &&
				myPos.left.y <= obj.pos.top && 
				myPos.left.y >= obj.pos.bottom
			)
		}
		
		if (touchingPaddle.top || touchingPaddle.left || touchingPaddle.right) {
			this.onCollision();
		}
	}
	
	this.onCollision = function() {
		this.stop();
		this.remove();
		this.options.onCollision();
	}
	
	this.remove = function() {
		//this.$dom.remove();
		this.$dom.hide("explode", 500);
	}
	
	this.stop = function() {
		clearInterval(this.interval);
	}

	this.setCanvas = function(canvas) {
		this.canvas = canvas;
	}
	
	this.reset = function() {
		this.draw();
	}

	var catchable = this;
	this.options = options;
	this.pos = {x:this.options.pos.x,y:this.options.pos.y,top:{x:0,y:0},bottom:{x:0,y:0},left:{x:0,y:0},right:{x:0,y:0}};
	this.$dom = $('<span />').first();
}

var Missile = function(options) {

	this.draw = function() {
		this.$dom.css($.extend(this.options.css, {
			position: 'absolute',
			width: this.options.width + 'px',
			height: this.options.height + 'px',
			backgroundColor: 'brown'
		}));
	
		this.moveTo(this.pos.x, this.pos.y);
		
		this.canvas.append(this.$dom);
	
		this.interval = setInterval(this.onInterval, 10);
	}
	
	this.moveTo = function(x, y) {
		if (x || x === 0) {
			this.$dom.css('left', x + 'px');
			this.pos.x = x;
			
			this.pos.top.x = x + this.options.width/2;
			this.pos.bottom.x = x + this.options.width/2;
			this.pos.left.x = x;
			this.pos.right.x = x + this.options.width;
		}
		
		if (y || y === 0) {
			this.$dom.css('bottom', y + 'px');
			this.pos.y = y;
			
			this.pos.top.y = y + this.options.height;
			this.pos.bottom.y = y;
			this.pos.left.y = y + this.options.height/2;
			this.pos.right.y = y + this.options.height/2;
		}
	}
	
	this.setCanvas = function(canvas) {
		this.canvas = canvas;
	}
	
	this.init = function() {
		this.draw();
	}
	
	this.stop = function() {
		if (this.interval)
			clearInterval(this.interval);
	}
	
	this.remove = function() {
		this.$dom.remove();
	}
	
	this.onInterval = function() {
	
		if (missile.pos.top.y >= missile.canvas.options.height) { // top wall
			missile.stop();
			missile.remove();
		}
	
		$.each(missile.canvas.blocks.blocks, function(i, block){
			if (block) {
				if (missile.testCollision(block)) {
					missile.stop();
					missile.remove();
				}
			}
		});
		
		missile.moveTo(null, missile.pos.y+3);
	}
	
	this.testCollision = function(obj, newPos) {
		if (newPos) {
			var myPos = {
				top: {
					x: newPos.x + this.options.width/2,
					y: newPos.y + this.options.height
				},
				bottom: {
					x: newPos.x + this.options.width/2,
					y: newPos.y
				},
				left: {
					x: newPos.x,
					y: newPos.y + this.options.height/2
				},
				right: {
					x: newPos.x + this.options.width,
					y: newPos.y + this.options.height/2
				}
			}
		} else {
			var newPos = {x:this.pos.x,y:this.pos.y};
			myPos = this.pos;
		}
		
		if (myPos.bottom.y <= 0) { // bottom wall
			this.stop();
			this.remove();
		}
		
		var touchingPaddle = {
			top	: (
				myPos.bottom.y <= obj.pos.top && 
				myPos.bottom.y > obj.pos.bottom &&
				myPos.bottom.x <= obj.pos.right && 
				myPos.bottom.x >= obj.pos.left
			),
			bottom : (
				myPos.top.y >= obj.pos.bottom &&
				myPos.top.y < obj.pos.top &&
				myPos.top.x <= obj.pos.right && 
				myPos.top.x >= obj.pos.left
			),
			left : ( 
				myPos.right.x >= obj.pos.left && 
				myPos.right.x < obj.pos.right &&
				myPos.right.y <= obj.pos.top && 
				myPos.right.y >= obj.pos.bottom
			),
			right : (
				myPos.left.x <= obj.pos.right && 
				myPos.left.x > obj.pos.left &&
				myPos.left.y <= obj.pos.top && 
				myPos.left.y >= obj.pos.bottom
			)
		}
		
		if (touchingPaddle.top || touchingPaddle.left || touchingPaddle.right) {
			if (obj.onCollision)
				obj.onCollision();
			
			return true;
		}
		
		return false;
	}

	this.$dom = $('<span />').first();
	this.options = options;
	this.pos = {x:this.options.pos.x,y:this.options.pos.y,top:{x:0,y:0},bottom:{x:0,y:0},left:{x:0,y:0},right:{x:0,y:0}};
	var missile = this;
}

var Balls = function(options) {

	this.addBall = function() {
		var ball = new Ball( $.extend(true, {}, this.options) );
		ball.setCanvas(this.canvas)
		ball.reset();
		
		var i = this.balls.push(ball);
		
		ball.setIndex(i - 1);
	}
	
	this.hasBallsLeft = function() {
		var ballCount = 0;
		$.each(this.balls, function(i, ball){
			if (ball) {
				ballCount++;
			}
		});
		
		return ballCount ? true : false;
	}
	
	this.remove = function() {
		$.each(this.balls, function(i, ball){
			if (ball) {
				ball.remove();
			}
		});
	}
	
	this.stop = function() {
		$.each(this.balls, function(i, ball){
			if (ball) {
				ball.stop();
			}
		});
	}
	
	this.setRate = function(rate) {
		$.each(this.balls, function(i, ball){
			if (ball) {
				ball.setRate(rate);
			}
		});
	}
	
	this.setCanvas = function(canvas) {
		this.canvas = canvas;
	}
	
	this.reset = function() {
		this.remove();
		this.addBall();
	}

	this.options = options;
	this.balls = [];
}

var Ball = function(options) {

	this.draw = function() {
		this.$dom.css($.extend(this.options.css, {
			position: 'absolute',
			borderRadius: this.options.radius,
			width: this.options.radius*2,
			height: this.options.radius*2
		}));
		
		this.$dom.addClass('ball');
		
		this.canvas.append(this.$dom);
	}

	this.onInterval = function() {

		var newPos = {
			x: ball.pos.x + ball.options.slope.x,
			y: ball.pos.y + ball.options.slope.y,
		}
						
		//touching left wall
		if (newPos.x < ball.minX) {
			newPos.x = ball.minX;
			ball.options.slope.x *= -1;
		}
		
		//touching right wall
		if (newPos.x > ball.maxX) {
			newPos.x = ball.maxX;
			ball.options.slope.x *= -1;
		}
		
		//touching bottom wall
		if (newPos.y < ball.minY) {
			
			//to never lose, do this instead
			//newPos.y = ball.minY;
			//ball.options.slope.y *= -1;
			
			ball.stop();
			ball.remove();
			
			if (! ball.canvas.balls.hasBallsLeft()) {
				game.gameover();
			}
		}
		
		//touching top wall
		if (newPos.y > ball.maxY) {
			newPos.y = ball.maxY;
			ball.options.slope.y *= -1;
		}
	
		//paddle?
		newPos = ball.testCollision(ball.canvas.paddle, newPos);
		
		$.each(ball.canvas.blocks.blocks, function(i, block){
			if (block) {
				newPos = ball.testCollision(block, newPos);
			}
		});
		
		ball.moveTo(newPos.x, newPos.y);
	}
	
	this.testCollision = function(obj, newPos) {
		if (newPos) {
			var ballPos = {
				top: {
					x: newPos.x + this.options.radius,
					y: newPos.y + this.options.radius*2
				},
				bottom: {
					x: newPos.x + this.options.radius,
					y: newPos.y
				},
				left: {
					x: newPos.x,
					y: newPos.y + this.options.radius
				},
				right: {
					x: newPos.x + this.options.radius*2,
					y: newPos.y + this.options.radius
				}
			}
		} else {
			var newPos = {x:this.pos.x,y:this.pos.y};
			ballPos = this.pos;
		}
		
		var touchingPaddle = {
			top	: (
				ballPos.bottom.y <= obj.pos.top && 
				ballPos.bottom.y > obj.pos.bottom &&
				ballPos.bottom.x <= obj.pos.right && 
				ballPos.bottom.x >= obj.pos.left && 
				this.options.slope.y<0
			),
			bottom : (
				ballPos.top.y >= obj.pos.bottom &&
				ballPos.top.y < obj.pos.top &&
				ballPos.top.x <= obj.pos.right && 
				ballPos.top.x >= obj.pos.left &&  
				this.options.slope.y>0
			),
			left : ( 
				ballPos.right.x >= obj.pos.left && 
				ballPos.right.x < obj.pos.right &&
				ballPos.right.y <= obj.pos.top && 
				ballPos.right.y >= obj.pos.bottom && 
				this.options.slope.x>0
			),
			right : (
				ballPos.left.x <= obj.pos.right && 
				ballPos.left.x > obj.pos.left &&
				ballPos.left.y <= obj.pos.top && 
				ballPos.left.y >= obj.pos.bottom && 
				this.options.slope.x<0
			)
		}
		
		var isCollision = false;
		if (touchingPaddle.left) {
			newPos.x = obj.pos.left - this.options.width;
			this.options.slope.x *= -1;
			isCollision = true;
		}
		else if(touchingPaddle.right) {
			newPos.x = obj.pos.right;
			this.options.slope.x *= -1;
			isCollision = true;
		}
		
		if (touchingPaddle.top) {
			newPos.y = obj.pos.top;
			this.options.slope.y *= -1;
			
			// change x slope depending on where collision occurs
			var da = obj.pos.x + obj.options.width/2; //
			var db = da - ballPos.bottom.x;
			var dc = (100 / (obj.options.width / db) * 2) / 50; // make between -2 and 2
			var dd = dc * -1;
			var de = Math.round(dd);
			
			this.options.slope.x += de;
			
			isCollision = true;
		}
		else if(touchingPaddle.bottom) {
			newPos.y = obj.pos.bottom - this.options.height;
			this.options.slope.y *= -1;
			isCollision = true;
		}
		
		if (isCollision && obj.onCollision) obj.onCollision({
			target: obj
		});
		
		return newPos;
	}

	this.moveTo = function(x, y) {
		if (x || x === 0) {
			this.$dom.css('left', x + 'px');
			this.pos.x = x;
			
			this.pos.top.x = x + this.options.radius;
			this.pos.bottom.x = x + this.options.radius;
			this.pos.left.x = x;
			this.pos.right.x = x + this.options.radius*2;
		}
		
		if (y || y === 0) {
			this.$dom.css('bottom', y + 'px');
			this.pos.y = y;
			
			this.pos.top.y = y + this.options.radius*2;
			this.pos.bottom.y = y;
			this.pos.left.y = y + this.options.radius;
			this.pos.right.y = y + this.options.radius;
		}
	}
	
	this.setRate = function(rate) {
		this.options.refresh.rate = rate;
		
		this.stop();
		this.interval = setInterval(this.onInterval, this.options.refresh.rate);
	}

	this.reset = function() {
	
		this.stop();
		this.remove();
	
		this.draw();
	
		this.minX = 0;
		this.maxX = this.canvas.width() - this.$dom.width();
		this.minY = 0;
		this.maxY = this.canvas.height() - this.$dom.height();
		
		this.moveTo(
			this.canvas.paddle.pos.x + this.canvas.paddle.options.width/2 - this.options.radius,
			this.canvas.paddle.pos.y + this.canvas.paddle.options.height
		);
		
		this.setRate(this.options.refresh.rate);
	}

	this.stop = function() {
		if (this.interval)
			clearInterval(this.interval);
	}
	
	this.remove = function() {
		this.$dom.remove();
		//this.$dom.hide('explode', 1000);
		this.canvas.balls.balls[this.index] = false;
	}

	this.setCanvas = function(canvas) {
		this.canvas = canvas;
	}
	
	this.setIndex = function(i) {
		this.index = i;
	}

	this.canvas;
	this.index;
	this.pos = {x:0,y:0,top:{x:0,y:0},bottom:{x:0,y:0},left:{x:0,y:0},right:{x:0,y:0}};
	this.$dom = $('<span />').first();
	var ball = this;
	ball.options = $.extend(options, {});
}

var Paddle = function(options) {
	
	this.draw = function() {
	
		this.$dom.css($.extend(this.options.css, {
			position: 'absolute'
		}));

		this.$dom.addClass('paddle');
		
		this.canvas.append(this.$dom);
		
		this.$dom.width(this.options.width);
		this.$dom.height(this.options.height);
		
		this.moveTo(this.pos.x, this.pos.y);
	}
	
	this.moveTo = function(x, y) {
		if (x < 0)
			x = 0;
				
		if (x || x === 0) {		
			if (x > this.maxX)
				x = this.maxX;

			this.$dom.css('left', x + 'px');
			this.pos.x = x;
			this.pos.left = x;
			this.pos.right = x + this.options.width;
		}
		
		if (y || y === 0) {
			this.$dom.css('bottom', y + 'px');
			this.pos.y = y;
			this.pos.bottom = y;
			this.pos.top = y + this.options.height;
		}
	}
	
	this.onClick = function() {
		if (paddle.canFire) {
			var missile = new Missile({
				css: {},
				width: 3,
				height: 6,
				pos: {
					x: paddle.pos.x + paddle.halfWidth,
					y: paddle.pos.top
				}
			});
			missile.setCanvas(paddle.canvas);
			missile.init();
		}
	}
	
	this.setCanFire = function(canFire) {
		this.canFire = canFire;
		
		if (canFire) {
			this.$dom.addClass('fire');
		} else {
			this.$dom.removeClass('fire');
		}
	}
	
	this.onMouseMove = function(e) {

		var newX = (e.target == this) ?
			e.layerX : //move on canvas
			e.layerX + e.target.offsetLeft; //move on paddle or ball
		
		newX -= paddle.halfWidth; // center mouse under paddle
				
		paddle.moveTo(newX);
		
		$.each(paddle.canvas.balls.balls, function(i, ball){
			if (ball) {
				newPos = ball.testCollision(paddle);
				ball.moveTo(newPos.x, newPos.y);
			}
		});
	}
	
	this.setCanvas = function(canvas) {
		this.canvas = canvas;
	}
	
	this.setWidth = function(width) {
		if (width) {
			var widthDiff = width - this.options.width;
				
			this.options.width = width;
		
			this.halfWidth = this.options.width/2;
		
			this.minX = 0;
			this.maxX = this.canvas.width() - this.options.width;
		
			this.$dom.width(this.options.width);
		
			this.pos.x -= (widthDiff/2);
		
			this.moveTo(this.pos.x, this.pos.y);
		}
	}
	
	this.reset = function(doNotRemove) {
		if (!doNotRemove)
			this.$dom.remove();
		
		this.halfWidth = this.options.width/2;
		
		this.minX = 0;
		this.maxX = this.canvas.width() - this.options.width;
		
		this.draw();
	}
	
	var paddle = this;
	this.canvas;
	this.options = options;
	this.pos = {x:this.options.posStart.x,y:this.options.posStart.y,top:0,bottom:0,left:0,right:0};
	this.$dom = $('<div />').first();
}

var Timer = function(options) {

	this.draw = function() {
		this.$dom.css(this.options.css);
		
		//this.$dom.width(this.options.width);
		//this.$dom.height(this.options.height);
		
		this.setSeconds(this.seconds);
		
		this.infozone.$dom.append(this.$dom);
		
		this.interval = setInterval(this.onInterval, 1000);
	}	

	this.onInterval = function() {
		timer.seconds++;
		timer.setSeconds(timer.seconds);
	}

	this.setSeconds = function(seconds) {
		timer.seconds = seconds;

		var minutes = Math.floor(timer.seconds / 60);
		var seconds = timer.seconds - (minutes*60);
		
		if (minutes < 10) minutes = '0' + minutes;
		if (seconds < 10) seconds = '0' + seconds;
		
		timer.$dom.text('Time: ' + minutes + ':' + seconds);
	}

	this.stop = function() {
		if (this.interval)
			clearInterval(this.interval);
	}
	
	this.remove = function() {
		this.$dom.remove();
	}

	this.reset = function() {
		this.stop();
		this.remove();
		
		this.draw();
	}

	this.setInfozone = function(infozone) {
		this.infozone = infozone;
	}

	this.infozone;
	this.options = options;
	this.$dom = $('<div />').first();
	this.seconds = 0;
	var timer = this;
}

var InfoZone = function(options) {

	this.draw = function() {
		this.$dom.css(this.options.css);
		
		this.$dom.width(this.options.width);
		this.$dom.height(this.options.height);
		
		this.canvas.append(this.$dom);
	}	

	this.reset = function() {
		this.draw();
	}

	this.setCanvas = function(canvas) {
		this.canvas = canvas;
	}

	this.canvas;
	this.options = options;
	this.$dom = $('<div />').first();
}

var Game = function(options) {

	this.reset = function() {
		this.options.canvas.reset();
		this.options.canvas.$dom.fadeIn();
	}
	
	this.gameover = function() {
		//this.options.balls.stop();
		//$('#container').fadeOut();
		this.timer.stop();
		alert("Game over!");
	}
	
	this.gamewon = function() {
		this.timer.stop();
		this.options.balls.stop();
		//this.options.canvas.$dom.fadeOut();
		alert("You win!");
	}

	this.options = options;
	
	this.options.canvas.setPaddle(this.options.paddle);
	this.options.canvas.setBalls(this.options.balls);
	this.options.canvas.setBlocks(this.options.blocks);
	this.options.canvas.setInfozone(this.options.infozone);
	
	this.reset();
	
	
	/* Timer */
	this.timer = new Timer(this.options.infozone.options.itemOptions);
	this.timer.setInfozone(this.options.canvas.infozone);
	this.timer.reset();
}


var game = new Game({
	canvas: new Canvas($('#main').first(), {
		width: 480,
		height: 360,
		css: {
			position: 'relative'
		}
	}),
	blocks: new Blocks({
		numRows: 5,
		numColumns: 10,
		heightStart: 200,
		block: {
			width: 40,
			height: 25,
			css: {
				
			}
		}
	}),
	paddle: new Paddle({
		width: 120,
		widthNormal: 120,
		widthBig: 220,
		widthSmall: 70,
		height: 10,
		posStart: {
			x :180,
			y: 20
		},
		css: {
		}
	}),
	balls: new Balls({
		radius: 8,
		refresh: {
			rate: 18,
			rateNormal: 18,
			rateFast: 12,
			rateSlow: 28
		},
		slope: {
			x: 1,
			y: 3
		},
		css: {
			//backgroundColor: "#000000"
		}
	}),
	infozone: new InfoZone({
		itemOptions: {
			css: {
				borderStyle: 'solid',
				borderColor: '#999',
				borderWidth: '1px 1px 1px 0',
				borderRadius: '0 5px 5px 0',
				padding: '5px 5px 5px 10px'
			}
		},
		css: {
			position: 'absolute',
			top: 10,
			bottom: 10,
			right: 0,
			marginRight: '-120px'
		},
		width: 120,
		height: 330
	})
});


var bgs = [
	'http://webwall.files.wordpress.com/2009/02/hot-girls-wallpapers-55.jpg',
	'http://www.gunaxin.com/wp-content/gallery/random-hot-girls/hot-girls-sexy-girls-100.jpg',
	'http://hotgirlzone.com/wp-content/gallery/rihanna/hot-girls-rihanna-14.jpg',
	'http://www.wallpaperscraze.com/albums/Hot%20Wallpapers/Sexy-Celeb-Wallpaper-032.jpg',
	'http://img210.imageshack.us/img210/1143/labawsps3hotgirlsfullhd.jpg',
	'http://img29.imageshack.us/img29/7067/81342983.jpg',
	'http://wallpapers.skins.be/elisha-cuthbert/elisha-cuthbert-1024x768-20997.jpg',
	'http://3ddigitalwallpapers.com/wp-content/uploads//2009/01/adriana_lima_widescreen_91200864917am989.jpg',
	'http://www.babble.com/CS/blogs/famecrawler/2009/03/claudia_schiffer_sexy-mom-milf--naked-boobs-sheer-top.jpg',
	'http://www.flash-screen.com/free-wallpaper/uploads/200701/imgs/1169729315_1024x768_naked-jessica-simpson.jpg',
	'http://theideagirlsays.files.wordpress.com/2009/12/britney-spears-sexy-photos-attracts-fans1.jpg',
	'http://3.bp.blogspot.com/-ohJczUgm5BI/TVWcawFAt1I/AAAAAAAAAaE/Gl9fqrfjdMw/s1600/FreeHD.Blogspot.Com+-+Hot+%25289%2529.jpg',
	'http://193.105.21.101/image/18608/sexy_naked_blonde_1_4000x2580.jpg',
	'http://11even.net/wp-content/uploads/2009/09/olivia-wilde-nude-bikini-eleven.jpg'
];

$(document).bind('keypress', function(e){
	if(e.keyCode==115) { // press "s"
		$('#container').css({
			backgroundImage: 'url('+ bgs[Math.round((bgs.length-1)*Math.random())] +')'
		});
	}
});