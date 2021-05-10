var document = window.document;
var Constants = {
    PACSIZE: 32
};

/**
 * Utility functions
 */
function num(n) {
    return Math.floor(Math.random() * n);
}

/**
 * Control Panel - start/pause game, control keys for pacman, etc. 
 */
var ControlPanel = {
    pause: false,
    isPaused : function () {
        return this.pause;
    },
    paussed: function() {
        this.pause = true;
    },
    play: function() {
        this.pause = false;
    }
};

var Powerdot = {
    x: num(100),
    y: num(100),
    size: (Constants.PACSIZE / 4),
    present: false,
    
    isPresent: function() {
        return this.present;
    },
    
    create: function() {
        this.x = num(CanvasManager.canvas.width - 32) + 16;
        this.y = num(CanvasManager.canvas.height - 32) + 16;
        this.present = true;
    },
    
    draw: function() {
        if (this.isPresent()) {
            CanvasManager.drawCircle(this.x, this.y, this.size, "yellow");
        }
    },
    
    checkCollision: function(position, size) {
        if (!this.isPresent()) {
            return false;
        }
        
        var left = position.x;
        var right = position.x + size;
        var top = position.y;
        var bottom = position.y + size;
        
        // left top cornder of pacman
        if (left <= this.x && right >= this.x && top <= this.y && bottom >= this.y) {
            return true;
        }
        return false;
    }
};

/**
 * Player
 */
var Player = {
    x: num(100) + 50,
    y: num(100) + 50,
    pacmouth: 320,
    pacdir: 0,
    pacsize: Constants.PACSIZE,
    speed: 3,
    moving: true,
    moves: [],
    
    getPosition: function() {
        return {x: this.x, y: this.y};
    },
    
    isMoving: function() {
        return this.moving;
    },
    
    die: function() {
        this.x = num(100) + 50;
        this.y = num(100) + 50;
        this.pacdir = 0;
        this.dirx = this.speed;
        this.diry = 0;
        this.pacmouth = 320;
        this.moving = true;
        this.moves = [];
    },

    reachHere: function(targetX, targetY) {
        var steps = {};
        var canvasRect = CanvasManager.canvas.getBoundingClientRect();
        targetX = targetX - canvasRect.left;
        targetY = targetY - canvasRect.top;
        this.nextStep(steps, this.x, this.y, targetX, targetY);
        var next = steps.moves[steps.moves.length - 1];
        steps.moves.push({x: targetX, y: targetY, dir: next.dir, dirX: next.dirX, dirY: next.dirY});
        this.moves = steps.moves;
    },
    
    nextStep: function(steps, srcX, srcY, targetX, targetY) {
        if (!steps.moves) {
            steps.moves = [];
            // identify direction
            if (srcX < targetX) { // onleft
                steps.dirX = this.speed;
            } else {
                steps.dirX = -this.speed;
            }
            if (srcY < targetY) { // onleft
                steps.dirY = this.speed;
            } else {
                steps.dirY = -this.speed;
            }
            steps.stepsX = Math.round(Math.abs(srcX - targetX) / this.speed);
            steps.stepsY = Math.round(Math.abs(srcY - targetY) / this.speed);
            steps.counterX = 0;
            steps.counterY = 0;
        }
        var prev = (steps.moves.length == 0) ? {x: srcX, y: srcY, dir: this.pacdir, dirX: this.dirx, dirY: this.diry} : steps.moves[steps.moves.length - 1];
        var next = {};
        if(steps.counterX > steps.stepsX / 2 && steps.counterY < steps.stepsY) {
            next = {x: prev.x + 0, y: prev.y + steps.dirY, dir: (steps.dirY < 0 ? 96 : 32), dirX: 0, dirY: steps.dirY};
            steps.counterY++;
        } else {
            next = {x: prev.x + steps.dirX, y: prev.y + 0, dir: (steps.dirX < 0 ? 64 : 0), dirX: steps.dirX, dirY: 0};
            steps.counterX++;
        }
        steps.moves.push(next);
        if (steps.counterX < steps.stepsX || steps.counterY < steps.stepsY) {
            this.nextStep(steps, next.x, next.y, targetX, targetY);
        }
    },
    
    move: function() {
        if (this.moving) {
            if (this.x >= (CanvasManager.canvas.width - this.pacsize)) {
                this.x = 0;
            }
            if (this.y >= (CanvasManager.canvas.height - this.pacsize)) {
                this.y = 0;
            }
            if (this.x < 0) {
                this.x = CanvasManager.canvas.width - this.pacsize;
            }
            if (this.y < 0) {
                this.y = CanvasManager.canvas.height - this.pacsize;
            }

            this.x += this.dirx;
            this.y += this.diry;

        }
        // if automated 
        if (this.moves.length > 0) {
            this.x = this.moves[0].x;
            this.y = this.moves[0].y;
            this.moves.shift(); // remove first element
        }
    },
    
    isOnLeft: function(x) {
        return this.x < x;
    },
    
    isOnTop: function(y) {
        return this.y < y;
    },
    
    draw: function() {
        if (this.moves.length > 0) {
            // draw steps
            this.moves.forEach(function(move, index, array) {
                CanvasManager.drawCircle(move.x + Player.pacsize/2, move.y + Player.pacsize/2, 3, "blue");
            });
            this.pacdir = this.moves[0].dir;
            this.dirx = this.moves[0].dirX;
            this.diry = this.moves[0].dirY;
        }
        CanvasManager.draw(this.pacmouth, this.pacdir, 32, 32, this.x, this.y, this.pacsize, this.pacsize);
    },
    
    animate: function() {
        if (this.moving == true) {
            if (this.pacmouth == 320) {
                this.pacmouth = 352;
            } else {
                this.pacmouth = 320;
            }
        }
    },
    
    moveLeft: function() {
        this.dirx = -this.speed;
        this.diry = 0;
        this.pacdir = 64;
        this.moving = true;
    },
    
    moveUp: function() {
        this.dirx = 0;
        this.diry = -this.speed;
        this.pacdir = 96;
        this.moving = true;
    },
    
    moveRight: function() {
        this.dirx = this.speed;
        this.diry = 0;
        this.pacdir = 0;
        this.moving = true;
    },
    
    moveDown: function() {
        this.dirx = 0;
        this.diry = this.speed;
        this.pacdir = 32;
        this.moving = true;
    },
    
    checkCollision: function(position, size) {        
        var left = position.x;
        var right = position.x + size;
        var top = position.y;
        var bottom = position.y + size;
        
        var centerX = this.x + this.pacsize/2;
        var centerY = this.y + this.pacsize/2;
        // left top cornder of pacman
        if (left <= centerX && right >= centerX && top <= centerY && bottom >= centerY) {
            return true;
        }
        return false;
    }
}

/**
 * Enemy
 */
var Enemy = {
    x: 0,
    y: 0,
    speed: 3,
    moving: 0,
    eyedir: 0,
    dirx: 0,
    diry: 0,
    ghostNum: 64,
    vulnerable: false,
    recoveryCount: 0,
    vulnerableGhostNum: 384,
    vulnerableEyedir: 0,
    
    getPosition: function() {
        return {x: this.x, y: this.y};
    },
    
    makeVulnerable: function() {
        this.vulnerable = true;
        this.vulnerableGhostNum = 6 * 64;
        this.vulnerableEyedir = 0;
        this.recoveryCount = 640;
        this.speed = 2;
    },
    
    move: function() {
        if(this.moving < 0) {
            this.moving = (num(10)*3)+5+num(2);
            //enemy.speed = num(5);
            this.dirx = 0;
            this.diry = 0;
            var playerPosition = Player.getPosition();
            var distanceXvsY = Math.abs(playerPosition.x - this.x) - Math.abs(playerPosition.y - this.y);
            if ((this.vulnerable && distanceXvsY > 0) || (!this.vulnerable && distanceXvsY <= 0)) {
                if ((!this.vulnerable && Player.isOnTop(this.y)) || (this.vulnerable && !Player.isOnTop())) {
                    this.diry = -this.speed;
                    this.eyedir = 96;
                } else {
                    this.diry = this.speed;
                    this.eyedir = 32;
                }
            } else {
                if ((!this.vulnerable && Player.isOnLeft(this.x)) || (this.vulnerable && !Player.isOnLeft(this.x))) {
                    this.dirx = -this.speed;
                    this.eyedir = 64;
                } else {
                    this.dirx = this.speed;
                    this.eyedir = 0;
                }
            }
        }

        this.x += this.dirx;
        this.y += this.diry;
        this.moving--;

        if (this.x >= (CanvasManager.canvas.width - Player.pacsize)) {
            this.x = 0;
        }
        if (this.y >= (CanvasManager.canvas.height - Player.pacsize)) {
            this.y = 0;
        }
        if (this.x < 0) {
            this.x = CanvasManager.canvas.width - Player.pacsize;
        }
        if (this.y < 0) {
            this.y = CanvasManager.canvas.height - Player.pacsize;
        }
        
        if (this.vulnerable) {
            this.recoveryCount--;
        }
        if (this.recoveryCount < 0) {
            this.vulnerable = false;
            this.speed = 3;
        }
    },
    vulnerableAnimationCount: 0,
    animate: function() {
        if (this.vulnerable) {
            this.vulnerableAnimationCount++;
            if (this.recoveryCount < 128 && this.vulnerableAnimationCount % 2 == 0) {
                this.vulnerableEyedir = this.vulnerableEyedir == 0 ? 32 : 0;
            }
            if (this.vulnerableGhostNum % 64) {
                this.vulnerableGhostNum -= 32;
            } else {
                this.vulnerableGhostNum += 32;
            }
        } else {
            if (this.ghostNum % 64) {
                this.ghostNum -= 32;
            } else {
                this.ghostNum += 32;
            }
        }
    },
    
    create: function() {
        this.ghostNum = num(5) * 64;
        this.x = num(320);
        this.y = num(200);
        this.vulnerable = false;
    },
    
    isVulnerable: function() {
        return this.vulnerable;
    },
    
    die: function() {
        this.ghostNum = num(7) * 64;
        this.eyedir = 64;
    },
    
    draw: function() {
        if (!this.vulnerable) {
            CanvasManager.draw(this.ghostNum, this.eyedir, 32, 32, this.x, this.y, Constants.PACSIZE, Constants.PACSIZE);
        } else {
            CanvasManager.draw(this.vulnerableGhostNum, this.vulnerableEyedir, 32, 32, this.x, this.y, Constants.PACSIZE, Constants.PACSIZE);
        }
    },
    
    checkCollision: function(position, size) {        
        var left = position.x;
        var right = position.x + size;
        var top = position.y;
        var bottom = position.y + size;
        
        var centerX = this.x + Constants.PACSIZE/2;
        var centerY = this.y + Constants.PACSIZE/2;
        // left top cornder of pacman
        if (left <= centerX && right >= centerX && top <= centerY && bottom >= centerY) {
            return true;
        }
        return false;
    }
};

/**
 * Canvas manager
 */
var CanvasManager = {
    canvas: undefined,
    context: undefined,
    mainImage: undefined,
    
    initialize: function() {
        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext("2d");
        // set height and width
        //this.canvas.height = 480;
        //this.canvas.width = 480;
        // load pakaman.png
        this.mainImage = new Image();
        this.mainImage.ready = false;
        this.mainImage.onload = this.checkReady;
        this.mainImage.src = "packman.png";
        
        // append to document
        var containerEl = document.getElementById("container");
        containerEl.append(this.canvas);
        document.body.onresize = CanvasManager.onresize;
        
        this.onresize(null);
        
        this.canvas.onclick = this.onclick;
        if (this.canvas.touchstart) {
            this.canvas.touchstart = this.ontouch;
            this.canvas.touchmove = this.ontouch;
            this.canvas.touchend = this.ontouch;
        }
    },
    
    /** TouchEvent object: https://www.w3schools.com/jsref/obj_touchevent.asp */
    ontouch: function(e) {
        var x = e.touches[0].clientX - 16;
        var y = e.touches[0].clientY - 16;
        GameManager.herePlease(x, y);
    },
    
    onclick: function(e) {
        var x = e.clientX - 16;
        var y = e.clientY - 16;
        GameManager.herePlease(x, y);
    },
    
    onresize : function(e) {
        var containerEl = document.getElementById("container");
        var containerRect = containerEl.getBoundingClientRect();
        CanvasManager.canvas.width = containerRect.width - 40;
        CanvasManager.canvas.height = containerRect.height - 40;
    },
    
    checkReady: function() {
        CanvasManager.mainImage.ready = true;
        GameManager.playgame();
    },
    
    render: function() {
        this.context.fillStyle = "pink";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    },
    
    renderText: function(text, left, top) {
        // add text of player score
        this.context.font = "20px Verdana";
        this.context.fillStyle = "blue";
        this.context.fillText(text, left, top);
    },
    
    draw: function(left, top, width, height, targetX, targetY, targetWidth, targetHeight) {
        this.context.drawImage(this.mainImage, left, top, width, height, targetX, targetY, targetWidth, targetHeight);
    },
    
    drawCircle: function(x, y, radius, fillColor) {
        this.context.fillStyle = fillColor;
        this.context.beginPath();
        this.context.arc(x, y, radius, 0, 2 * Math.PI, true);
        this.context.closePath();
        this.context.fill();
    }
};

/**
 * Game manager
 */
var GameManager = {
    score: 0,
    gscore: 0,
    ghost: false,
    keyclick: {},
    renderCount: 0,
    
    initialize: function() {
        CanvasManager.initialize();
        this.registerKeyCapture();
    },
    
    registerKeyCapture: function() {
        
        document.addEventListener("keydown", function (event) {
            GameManager.keyclick[event.keyCode] = true;
            GameManager.move(GameManager.keyclick);
        }, false);

        document.addEventListener("keyup", function (event) {
            delete GameManager.keyclick[event.keyCode];
        }, false);
        
    },
    
    herePlease: function(x, y) {
        Player.reachHere(x, y);
    },
    
    playgame: function() {
        GameManager.render();
        requestAnimationFrame(GameManager.playgame);
    },
    
    pause: function(timeInMillis) {
        ControlPanel.paussed();
        window.setTimeout(function() {
            ControlPanel.play();
        }, timeInMillis);
    }, 
    
    render: function() {
        if (ControlPanel.isPaused()) {
            return ;
        }
        // fill canvas with background
        CanvasManager.render();
        
        if(!Powerdot.isPresent()) {
            Powerdot.create();
        }

        if(!this.ghost) {
            Enemy.create();
            this.ghost = true;
        }
        
        if(Powerdot.checkCollision(Player.getPosition(), Player.pacsize)) {
            Powerdot.present = false;
            Enemy.makeVulnerable();
            this.pause(250);
        }
        if(Enemy.isVulnerable() && Player.checkCollision(Enemy.getPosition(), Constants.PACSIZE)) {
            Enemy.die();
            this.ghost = false;
            this.score++;
            this.pause(1000);
        } else if(!Enemy.isVulnerable() && Enemy.checkCollision(Player.getPosition(), Constants.PACSIZE)) {
            Player.die();
            this.gscore++;
            this.pause(1000);
        }

        Powerdot.draw();
        Player.move();
        Enemy.move();

        if ((this.renderCount++) % 8 == 0) {
            Enemy.animate();
            Player.animate();
        }
        
        CanvasManager.renderText("Pacman: " + this.score + " vs Ghost: " + this.gscore, 5, 20);

        // draw player
        Player.draw();
        // draw enemy
        Enemy.draw();
        
        if (this.renderCount > 32) {
            this.renderCount = 0;
        }
    },

    move: function(keyclick) {
        //  alert("Keycode: " + JSON.stringify(keyclick));
        if (27 in keyclick) {
            ControlPanel.paussed();
        } else if (32 in keyclick) {
            ControlPanel.play();
        } else if (37 in keyclick) {
            Player.moveLeft();
        } else if (38 in keyclick) {
            Player.moveUp();
        } else if (39 in keyclick) {
            Player.moveRight();
        } else if (40 in keyclick) {
            Player.moveDown();
        }
    }

};

GameManager.initialize();
