const cvs = document.querySelector("canvas");
const ctx = cvs.getContext("2d");
const degree = Math.PI / 180;

//game variables
let frames = 0;


//game state

const state = {
    current: 0,
    getReady: 0,
    playing: 1,
    over: 2,

}

//start button

const startBtn = {
    x: 120,
    y: 263,
    w: 83,
    h: 29
}

//event listeners





cvs.addEventListener("click", function(evt) {
    switch (state.current) {
        case state.getReady:
            state.current = state.playing;
            swooshingSound.play();
            break;
        case state.playing:
            if (bird.y - bird.radius <= 0) return;
            bird.flap();
            flapSound.play();
            break;
        case state.over:
            let rect = cvs.getBoundingClientRect();
            let clickX = evt.clientX - rect.left;
            let clickY = evt.clientY - rect.top;

            // check if start button was clicked
            if (clickX >= startBtn.x && clickX <= startBtn.x + startBtn.w && clickY >= startBtn.y && clickY <= startBtn.y + startBtn.h) {
                pipes.reset();

                score.reset();
                state.current = state.getReady;
            }
            break;
    }
});

document.addEventListener("keydown", function(evt) {
    if (evt.key === " ") {
        switch (state.current) {
            case state.getReady:
                state.current = state.playing;
                swooshingSound.play();
                break;
            case state.playing:
                bird.flap();
                flapSound.play();
                break;
            case state.over:
                pipes.reset();
                state.current = state.getReady;
                score.reset();
                break;
        }

    }
})

//load img
const sprite = new Image();
sprite.src = "img/sprite.png"


//load sound
const scoreSound = new Audio();
scoreSound.src = "audio/sfx_point.wav";

const flapSound = new Audio();
flapSound.src = "audio/sfx_flap.wav";

const hitSound = new Audio();
hitSound.src = "audio/sfx_hit.wav";

const swooshingSound = new Audio();
swooshingSound.src = "audio/sfx_swooshing.wav";

const dieSound = new Audio();
dieSound.src = "audio/sfx_die.wav";


//background
const bg = {
    sX: 0,
    sY: 0,
    w: 275,
    h: 226,
    x: 0,
    y: cvs.height - 226,

    draw: function() {
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);

        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    }

}


//foreground
const fg = {
    sX: 276,
    sY: 0,
    w: 224,
    h: 112,
    x: 0,
    y: cvs.height - 112,
    dx: 2,

    draw: function() {
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);

        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w + this.w, this.y, this.w, this.h);
    },
    update: function() {
        if (state.current === state.playing) {
            this.x = (this.x - this.dx) % (this.w / 2)
        }
    }
}


const bird = {
    animation: [
        { sX: 276, sY: 112 },
        { sX: 276, sY: 139 },
        { sX: 276, sY: 164 },
        { sX: 276, sY: 139 },
    ],
    x: 50,
    y: 150,
    w: 34,
    h: 26,

    frame: 0,
    rotation: 0,
    gravity: 0.25,
    jump: 4.6,
    speed: 0,
    radius: 12,
    draw: function() {
        let birdImg = this.animation[this.frame]

        //save state of canvas for rotatation
        ctx.save();
        //rotation
        ctx.translate(this.x, this.y)
        ctx.rotate(this.rotation)
        ctx.drawImage(sprite, birdImg.sX, birdImg.sY, this.w, this.h, -this.w / 2, -this.h / 2, this.w, this.h);
        //restore state of canvas
        ctx.restore();

    },

    flap: function() {
        this.speed = -this.jump;
    },

    update: function() {
        //const to control flapping of bird
        this.period = state.current == state.getReady ? 10 : 5;
        //change from
        this.frame += frames % this.period == 0 ? 1 : 0;
        //
        this.frame = this.frame % this.animation.length;

        if (state.current === state.getReady) {
            this.y = 150;
            this.gravity = 0.25;
            this.jump = 4.6;
            this.speed = 0;
            this.rotation = 0 * degree
        } else {
            this.speed += this.gravity;
            this.y += this.speed;
            if (this.y + this.h / 2 >= cvs.height - fg.h) {
                this.y = cvs.height - fg.h - this.h / 2
                if (state.current === state.playing) {
                    state.current = state.over
                    dieSound.play();
                }
            }
            if (this.speed >= this.jump) {
                this.rotation = 90 * degree
                this.frame = 1;
            } else {
                this.rotation = -25 * degree
            }
        }
    }
}


//pipes

const pipes = {
    position: [],

    top: {
        sX: 553,
        sY: 0
    },
    bottom: {
        sX: 502,
        sY: 0
    },

    w: 53,
    h: 400,
    gap: 85,
    maxYPos: -150,
    dx: 2,

    draw: function() {
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];

            let topYPos = p.y;
            let bottomYPos = p.y + this.h + this.gap;

            // top pipe
            ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, p.x, topYPos, this.w, this.h);

            // bottom pipe
            ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottomYPos, this.w, this.h);
        }
    },

    update: function() {
        if (state.current !== state.playing) return;

        if (frames % 100 == 0) {
            this.position.push({
                x: cvs.width,
                y: this.maxYPos * (Math.random() + 1)
            });
        }

        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];

            // collision detection
            let bottomYpos = p.y + this.h + this.gap;

            // for top pipe
            if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > p.y && bird.y - bird.radius < p.y + this.h) {
                state.current = state.over
                hitSound.play();
            }
            //for bottom pipe
            if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > bottomYpos && bird.y - bird.radius < bottomYpos + this.h) {
                state.current = state.over
                hitSound.play();
            }

            //move pipe
            p.x -= this.dx;

            //if pipes go beyond the canvas 
            if (p.x + this.w <= 0) {
                this.position.shift();
                score.value += 1;
                scoreSound.play();
                score.best = Math.max(score.value, score.best);
                localStorage.setItem("best", score.best);
            }
        }
    },
    reset: function() {
        this.position = [];
    }

}


//get ready message

const getReady = {
    sX: 0,
    sY: 228,
    w: 173,
    h: 152,
    x: cvs.width / 2 - 173 / 2,
    y: 80,

    draw: function() {
        if (state.current === state.getReady) {
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }
}


//game over message
const gameOver = {
    sX: 175,
    sY: 228,
    w: 225,
    h: 202,
    x: cvs.width / 2 - 225 / 2,
    y: 90,

    draw: function() {
        if (state.current === state.over) {
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
            // SCORE VALUE
            ctx.fillStyle = "#FFF";
            ctx.strokeStyle = "#000";
            ctx.font = "25px Teko";
            ctx.fillText(score.value, 225, 186);
            ctx.strokeText(score.value, 225, 186);
            // BEST SCORE
            ctx.fillText(score.best, 225, 228);
            ctx.strokeText(score.best, 225, 228);
        }
    }
}

//score
const score = {
    best: parseInt(localStorage.getItem("best")) || 0,
    value: 0,

    draw: function() {
        ctx.fillStyle = "#FFF";
        ctx.strokeStyle = "#000";

        if (state.current == state.playing) {
            ctx.lineWidth = 2;
            ctx.font = "35px Teko";
            ctx.fillText(this.value, cvs.width / 2, 50);
            ctx.strokeText(this.value, cvs.width / 2, 50);

        } 
    },

    reset: function() {
        this.value = 0;
    }
}

const medal = {
    sX: 359,
    sY: 157,
    x: 90,
    y: 175,
    width: 45,
    height: 45,

    draw: function() {
        if (state.current == state.over && score.value <= 10) {
            ctx.drawImage(sprite, this.sX, this.sY, this.width, this.height, this.x, this.y, this.width, this.height);
        }
        else if (state.current == state.over && score.value <= 20) {
            ctx.drawImage(sprite, this.sX, this.sY - 46, this.width, this.height, this.x, this.y, this.width, this.height);
        }
        else if (state.current == state.over && score.value <= 30) {
            ctx.drawImage(sprite, this.sX - 48, this.sY, this.width, this.height, this.x, this.y, this.width, this.height);
        }
        else if (state.current == state.over && score.value <= 40) {
            ctx.drawImage(sprite, this.sX - 48, this.sY - 46, this.width, this.height, this.x, this.y, this.width, this.height);
        }
    }
}

//draw
function draw() {
    if (document.querySelector(".night").checked === true) {
        ctx.fillStyle = "#383e56"
    } else {
        ctx.fillStyle = "#70c5ce"
    }
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    bg.draw();
    fg.draw();
    pipes.draw();
    bird.draw();
    score.draw();
    getReady.draw();
    gameOver.draw();
    medal.draw();

}

//update
function update() {
    bird.update();
    fg.update();
    pipes.update();
}

//loop
function loop() {
    update();
    draw();
    frames++

    requestAnimationFrame(loop)

}

loop();