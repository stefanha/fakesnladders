var topic = '#leedshack';
var tickManager;
var TICK_INTERVAL = Math.floor(1000 / 30);
var DICE_INTERVAL = 2000; /* milliseconds */
var allowClick = true;
var SQUARE_SIZE;

function Ladder(fromGrid, toGrid) {
    this.fromGrid = fromGrid;
    this.toGrid = toGrid;
    this.ladderWidth = 24;
    this.ladderStep = 16;
    this.lineWidth = 4;
    this.color = 'rgb(153, 51, 0)';

    this.fromGrid.registerAction(this.action());
}

Ladder.prototype.action = function() {
    var this_ = this;
    function theAction(player) {
        player.moveStraightLine(this_.toGrid);
    }
    return theAction;
}

Ladder.prototype.drawLadder = function(context, fromRect, toRect) {
    context.beginPath();
    var rect = fromRect;
    context.moveTo(
            rect.x + rect.width / 2 - this.ladderWidth / 2,
            rect.y + rect.height / 2);
    rect = toRect;
    context.lineTo(rect.x + rect.width / 2 - this.ladderWidth / 2,
            rect.y + rect.height / 2);
    rect = fromRect;
    context.moveTo(
            rect.x + rect.width / 2 + this.ladderWidth / 2,
            rect.y + rect.height / 2);
    rect = toRect;
    context.lineTo(rect.x + rect.width / 2 + this.ladderWidth / 2,
            rect.y + rect.height / 2);

    var dx = toRect.x - fromRect.x;
    var dy = toRect.y - fromRect.y;
    var length = Math.sqrt(dx * dx + dy * dy);
    var step = this.ladderStep / length;
    var stepX = (toRect.x - fromRect.x) * step;
    var stepY = (toRect.y - fromRect.y) * step;
    var x = rect.x + rect.width / 2 - this.ladderWidth / 2;
    var y = rect.y + rect.height / 2;
    var i;
    for (i = 0; i < length - this.ladderStep * 2; i += this.ladderStep) {
        x -= stepX;
        y -= stepY;
        context.moveTo(x, y);
        context.lineTo(x + this.ladderWidth, y);
    }

    context.stroke();
};

Ladder.prototype.draw = function(context) {
    context.save();
    context.lineWidth = this.lineWidth;
    context.strokeStyle = 'rgb(70, 70, 70)';
    this.drawLadder(context,
            new Rect(this.fromGrid.rect.x,
                this.fromGrid.rect.y + 3,
                this.fromGrid.rect.width,
                this.fromGrid.rect.height),
            new Rect(this.toGrid.rect.x,
                this.toGrid.rect.y + 3,
                this.toGrid.rect.width,
                this.toGrid.rect.height));
    context.strokeStyle = this.color;
    this.drawLadder(context, this.fromGrid.rect, this.toGrid.rect);
    context.restore();
};

Ladder.prototype.hit = function(p) {
};

function Player(game, id, scoreGrid, image) {
    this.game = game;
    this.id = id;
    this.scoreGrid = scoreGrid;
    this.image = image;
    this.rect = new Rect(this.scoreGrid.rect.x, this.scoreGrid.rect.y, this.scoreGrid.width, this.scoreGrid.height);
}

Player.prototype.reset = function() {
    this.scoreGrid = this.game.getGrid(0);
    this.rect = new Rect(this.scoreGrid.rect.x, this.scoreGrid.rect.y, this.scoreGrid.width, this.scoreGrid.height);
    new GameRequest().updateUserSquare(this.id, this.scoreGrid.sqNo);
}

Player.prototype.move = function(newScoreGrid) {
    var this_ = this;
    function completion() {
        newScoreGrid.doActions(this_);
    }
    if (this.rect.y == newScoreGrid.position.y) {
        this.moveStraightLine(newScoreGrid);
    } else {
        var grid;
        var i;
        for (i = this.scoreGrid.sqNo; i <= newScoreGrid.sqNo; i++) {
            grid = this.game.getGrid(i);
            if (grid.rect.y != this.scoreGrid.rect.y) {
                break;
            }
        }
        var this_ = this;
        function moveUp() {
            this_.moveStraightLine(this_.game.getGrid(i), finalMove);
        }
        function finalMove() {
            this_.moveStraightLine(newScoreGrid);
        }
        if (i != this.scoreGrid.sqNo) {
            this.moveStraightLine(this.game.getGrid(i - 1),
                    moveUp);
        }
    }
}

Player.prototype.moveStraightLine = function(newScoreGrid, myCompletion) {
    var this_ = this;
    function everythingCompletion() {
        newScoreGrid.doActions(this_);
        this_.scoreGrid = newScoreGrid;
        new GameRequest().updateUserSquare(this_.id, this_.scoreGrid.sqNo);
    }
    var completion;
    if (myCompletion != null) {
        completion = myCompletion;
    } else {
        completion = everythingCompletion;
    }
    tickManager.addAnimation(new MoveAnimation(this,
                new Point(newScoreGrid.position.x,
                    newScoreGrid.position.y), 1), completion);
};

Player.prototype.draw = function(context) {
    context.drawImage(this.image,
            this.rect.x + SQUARE_SIZE / 2 - this.image.width / 2,
            this.rect.y + SQUARE_SIZE / 2 - this.image.height / 2);
};

Player.prototype.hit = function(p) {
};

function Grid(sqNo, coordinates, squaresToSide) {
    this.sqNo = sqNo;
    this.coordinates = coordinates;
    this.squareSize = SQUARE_SIZE;
    this.squaresToSide = squaresToSide;
    this.position = new Point(this.coordinates.x * this.squareSize,
        this.coordinates.y * this.squareSize);
    this.rect = new Rect(this.position.x, this.position.y,
            this.squareSize, this.squareSize);
    this.actions = [];
}

Grid.prototype.draw = function(context) {
    context.save();
    // grid numbering (centered, alternating direction)
    context.font = "bold 16px sans-serif";
    context.textBaseline = 'top';
    context.textAlign = 'middle'; // left is the same??
    context.fillText(this.sqNo.toString(),
        this.position.x + 3,
        this.position.y + 3);
    context.restore();
};

Grid.prototype.hit = function(context) {
};

Grid.prototype.registerAction = function(action) {
    this.actions.push(action);
};

Grid.prototype.doActions = function(player) {
    for (var i = 0; i < this.actions.length; i++) {
        this.actions[i](player);
    }
}

function FakesNLadders(layer, gridSize) {
    this.gridSize = gridSize;
    this.layer = layer;
    this.layer.addGameObject(this);
    this.squaresToSide = 10;
    this.squareSize = this.gridSize / this.squaresToSide;
    this.playerMap = {};
    SQUARE_SIZE = this.squareSize;
}

FakesNLadders.prototype.init = function(redraw) {
    var sqNo = 0;
    this.grids = [];

    for (var y = this.squaresToSide - 1; y >= 0; y--) {
        for (var x = this.squaresToSide - 1; x >= 0; x--) {
            this.grids.push(new Grid(sqNo++, new Point(x, y),
                        this.squaresToSide));
            this.layer.addGameObject(this.grids[this.grids.length - 1]);
        }
        y--;
        for (var x = 0; x < this.squaresToSide; x++) {
            this.grids.push(new Grid(sqNo++, new Point(x, y),
                        this.squaresToSide));
            this.layer.addGameObject(this.grids[this.grids.length - 1]);
        }
    }

    this.layer.addGameObject(new Ladder(this.getGrid(3), this.getGrid(22)));
    this.layer.addGameObject(new Ladder(this.getGrid(25), this.getGrid(43)));
    this.layer.addGameObject(new Ladder(this.getGrid(40), this.getGrid(58)));
    this.layer.addGameObject(new Ladder(this.getGrid(81), this.getGrid(99)));
    this.layer.addGameObject(new Ladder(this.getGrid(55), this.getGrid(86)));
    this.layer.addGameObject(new Ladder(this.getGrid(49), this.getGrid(92)));
    this.layer.addGameObject(new Ladder(this.getGrid(12), this.getGrid(31)));
    
    // init players
    var this_ = this;
    var request = new GameRequest();
    request.getAllUsers(function(userList) {
        if(!userList || !userList.length) {
            return;
        }
            
        for(var i = 0; i < userList.length; i++) {
            this_.initPlayer(userList[i], redraw);
        }
    });
    
    // start player update loop
    function playerUpdateLoop(currentUserId) {
        return function() {
            this_.updatePlayers(redraw, currentUserId);
        }
    }
    new GameRequest().getCurrentUser(function(currentUserId, avatarUrl, position) {
        setInterval(playerUpdateLoop(currentUserId), 2000);
    });

    this_.dice_enable = false;
    this_.dice_face = 1;
    setInterval(function() {
        if (!this_.dice_enable || this_.dice_face <= 1) {
            return;
        }
        this_.dice_face--;
        diceMove(this_.dice_face);
    }, DICE_INTERVAL);
}

FakesNLadders.prototype.initPlayer = function(userInfo, redraw) {
    var playerImage = new Image();
    playerImage.src = userInfo.avatar_url;
    playerImage.width = 40;
    playerImage.height = 40;
    playerImage.onload = redraw;

    this.playerMap[userInfo.id] = new Player(this, userInfo.id, this.getGrid(userInfo.position), playerImage);
    this.layer.addGameObject(this.playerMap[userInfo.id]);

    var this_ = this;
    document.getElementById('option-a').onclick = function() {
        this_.makeChoice('a');
    };
    document.getElementById('option-b').onclick = function() {
        this_.makeChoice('b');
    };

    this.nextChoice();
}

FakesNLadders.prototype.updatePlayers = function(redraw, currentUserId) {
    var this_ = this;
    var request = new GameRequest();
    request.getAllUsers(function(userList) {
        if(!userList || !userList.length) {
            return;
        }
        
        for(var i = 0; i < userList.length; i++) {
            var playerId = userList[i].id;
            var player = this.playerMap[playerId];
            if (playerId == currentUserId) {
                continue;
            }
            
            if(player) {
                var newSquare = userList[i].position;
                
                // check for winners
                if(newSquare > 99) {
                    document.getElementById('end-area').innerHTML = 'Player <img src="'+userList[i].avatar_url+'" height="40" width="40" /> has won!';
                    player.move(this.getGrid(99));
                } else {
                    player.move(this.getGrid(newSquare));
                }
            } else {
                this_.initPlayer(userList[i], redraw);
            }
        }
    });
}

FakesNLadders.prototype.getGrid = function(score) {
    return this.grids[score];
}

FakesNLadders.prototype.draw = function(context) {
    context.save();
    context.fillStyle = 'black';
    context.strokeRect(0, 0, this.gridSize, this.gridSize);

    context.beginPath();
    // grid squares
    for (var x = 0.5; x < this.gridSize; x += this.squareSize) {    
        context.moveTo(x, 0);
        context.lineTo(x, this.gridSize);
    }

    for (var y = 0.5; y < this.gridSize; y += this.squareSize) {    
        context.moveTo(0, y);
        context.lineTo(this.gridSize, y);
    }

    context.strokeStyle = 'rgba(70, 70, 70, 1)';
    context.lineWidth = 1;
    context.stroke();
    context.restore();
}

FakesNLadders.prototype.hit = function(p) {
}

function diceMove(face) {
	var x,y,z;
    console.log('diceMove(' + face + ')');
	switch (face) {
		case 6:
			x = 0; y = 0; z = 0;
			break;
		case 5:
			x = 90; y = 0; z = 0;
			break;
		case 4:
			x = 90; y = 0; z = 90;
			break;
		case 3:
			x = 180; y = 0; z = 90;
			break;
		case 2:
			x = 180; y = 90; z = 90;
			break;
		case 1:
			x = 180; y = 90; z = 180;
			break;
	}
	document.getElementById('cube').style.webkitTransform = "rotateX("+x+"deg) rotateY("+y+"deg) rotateZ("+z+"deg)";
	document.getElementById('cube').style.MozTransform = "rotateX("+x+"deg) rotateY("+y+"deg) rotateZ("+z+"deg)";
	document.getElementById('cube').style.msTransform = "rotateX("+x+"deg) rotateY("+y+"deg) rotateZ("+z+"deg)";
}

function htmlescape(s) {
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;');
}

FakesNLadders.prototype.nextChoice = function() {
    console.log('fetching next choice...');
    var this_ = this;
    new GameRequest().getNewChoice(topic, function(choice_id, option_a, option_b) {
        console.log('next choice received:');
        console.log('choice_id: ' + choice_id);
        console.log('option_a: ' + option_a);
        console.log('option_b: ' + option_b);
        this_.cur_choice_id = choice_id;
        document.getElementById('option-a').innerHTML = 'Option A<br /><br />' + htmlescape(option_a);
        document.getElementById('option-b').innerHTML = 'Option B<br /><br />' + htmlescape(option_b);
        this_.dice_face = 7;
        this_.dice_enable = true;
    });
}

FakesNLadders.prototype.makeChoice = function(choice) {
    console.log('choice: ' + choice + ' with choice_id ' + this.cur_choice_id);
    document.getElementById('option-a').innerHTML = 'Option A';
    document.getElementById('option-b').innerHTML = 'Option B';
    var this_ = this;

    this_.dice_enable = false;
    new GameRequest().checkChoice(this.cur_choice_id, choice, function(correct) {
        function afterChoice(userId, avatarUrl, position) {
            if (correct) {
                this_.playerMap[userId].move(this_.getGrid(this_.playerMap[userId].scoreGrid.sqNo + this_.dice_face));
            } else {
                this_.playerMap[userId].reset();
            }
        }
        new GameRequest().getCurrentUser(afterChoice);
        console.log('correct: ' + correct + ' dice face:' + this_.dice_face);
        this_.nextChoice();
    });
}

function init() {
    var game = document.getElementById('game');
    var gameContext = game.getContext('2d');
    var backBuffer = document.getElementById('back-buffer');
    var context = backBuffer.getContext('2d');

    var background = document.getElementById('background');

    var gameLayer = new Layer();

    function redraw() {
        context.drawImage(background, 0, 0);

        context.save();
        gameLayer.draw(context);
        context.restore();

        gameContext.drawImage(backBuffer, 0, 0);
    }

    tickManager = new TickManager(redraw);

    document.addEventListener('mousedown',
            function(mouseEvent) {
                mouseEvent.stopPropagation();
                var point = new Point(
                    mouseEvent.pageX - game.offsetLeft,
                    mouseEvent.pageY - game.offsetTop);
                gameLayer.hit(point);
                redraw();
            }, false);

    var fakesNLadders = new FakesNLadders(gameLayer, HEIGHT);
    fakesNLadders.init(redraw);
    redraw();
}

window.onload = init;
