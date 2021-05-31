'use strict';

// キャンバス設定

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let w = canvas.width = window.innerWidth - 20;
let h = canvas.height = w * (9/16);

// オフスクリーン設定

const offcan = document.createElement('canvas');
const offctx = offcan.getContext('2d');

const offcan2 = document.createElement('canvas');
const offctx2 = offcan2.getContext('2d');

const offcan3 = document.createElement('canvas');
const offctx3 = offcan3.getContext('2d');

const os = offcan.width = offcan.height
         = offcan2.width = offcan2.height
         = offcan3.width = offcan3.height
         = 5000;

// 変数

let bx = random(1000,4000);
let by = random(600,4400);
let bs = 25;

let mouseX = w/2;
let mouseY = h/2;

let drX = 0;
let drY = 0;

let r;
let g;
let b;

let feeds = [];

let mScore = 0;

let lc = 0;

// マウス座標取得

canvas.onmousemove
= function(e){
    mouseX = e.offsetX;
    mouseY = e.offsetY;
}

// ランダム

function random(min,max){
    const num = Math.floor(Math.random()*(max + 1 - min)) + min;
    return num;
}

// 背景の描画

function background(){
    offctx.beginPath();
    offctx.fillStyle = 'black';
    offctx.fillRect(0, 0, os, os);
    offctx.closePath();
    
    for (let op = 0; op <= os; op += 25) {
        offctx.beginPath();
        offctx.strokeStyle = 'white';
        offctx.lineWidth = 0.3;
        offctx.moveTo(op, 0);
        offctx.lineTo(op, os);
        offctx.moveTo(0, op);
        offctx.lineTo(os, op);
        offctx.stroke();
        offctx.closePath();
    }
}

// 移動速度

function speed(){
    let rate;
    let vx = mouseX - w/2;
    let vy = mouseY - h/2;
    let md = Math.sqrt(vx * vx + vy * vy);

    if(md > 100){
        rate = 100/md;
        vx *= rate;
        vy *= rate;
    }
    
    bx += vx/(bs/2);
    by += vy/(bs/2);

    // ワールド制限

    if(bx < 1000 || bx > 4000){
        bx -= vx/bs;
    }
    if(by < 600 || by > 4400){
        by -= vy/bs;
    }
}

// 餌

function feed(){
    class Feed {
        constructor(x, y){
            this.x = x;
            this.y = y;
        }
        draw(){
            r = Math.random();
            g = Math.random();
            b = Math.random();
            color();
            offctx2.beginPath();
            offctx2.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
            offctx2.arc(this.x, this.y, 10, 0, 2 * Math.PI);
            offctx2.fill();
            offctx2.closePath();
        }
    }
    
    if(lc % 10 === 0){
        let feed = new Feed(
            random(1000,4000),
            random(600,4400)
        );
        feeds.push(feed);
        feed.draw();
    }
}

// 餌の色

function color(){
    let choice = random(0,2);
    
    switch(choice){
        case 0:
            if(r >= 0.5){
                r = 255;
            }
            else{
                r = 0;
            }
            g = Math.floor(g * 256);
            b = 255 - g;
            break;
            
        case 1:
            if(g >= 0.5){
                g = 255;
            }
            else{
                g = 0;
            }
            r = Math.floor(r * 256);
            b = 255 - r;
            break;
            
        case 2:
            if(b >= 0.5){
                b = 255;
            }
            else{
                b = 0;
            }
            r = Math.floor(r * 256);
            g = 255 - r;
            break;
    }
}

// 食べる

function eat(){
    for(let i = 0; i < feeds.length; i++){
        const dx = bx - feeds[i].x;
        const dy = by - feeds[i].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if(distance + 5 < bs){
            offctx2.clearRect(feeds[i].x - 11, feeds[i].y - 11, 22, 22);
            feeds.splice(i,1);
            bs += 0.5;
        }
    }
}

// ボールの描画

function ball(){
    if(bs > 175){
        bs -= bs/30000;
    }
    
    offctx3.beginPath();
    offctx3.clearRect(bx - (bs + 10), by - (bs + 10), bs * 2 + 20, bs * 2 + 20);
    offctx3.fillStyle = 'red';
    offctx3.arc(bx, by, bs, 0, 2 * Math.PI);
    offctx3.fill();
    offctx3.strokeStyle = 'rgb(185,0,0)';
    offctx3.lineWidth = 5;
    offctx3.stroke();
    offctx3.closePath();
}

// 描画範囲

function range(){
    drX = (bs - 25) * 2;
    drY = drX * (9/16);
}

// スコア

function score(){
    let score = Math.floor((bs-25)*2);
    
    if(mScore < score){
        mScore = score;
    }

    ctx.fillStyle = 'white';
    ctx.font = "24px serif";
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText('score:' + score, w-10, 10);
    ctx.fillStyle = 'yellow';
    ctx.fillText('max score:' + mScore, w-10, 40);

    lc++;
}

// ループ

function loop(){
    speed();
    feed();
    eat();
    ball();
    range();

    ctx.drawImage(offcan, bx-(w/2) - drX, by-(h/2) - drY, w + drX * 2, h + drY * 2, 0, 0, w, h);
    ctx.drawImage(offcan2, bx-(w/2) - drX, by-(h/2) - drY, w + drX * 2, h + drY * 2, 0, 0, w, h);
    ctx.drawImage(offcan3, bx-(w/2) - drX, by-(h/2) - drY, w + drX * 2, h + drY * 2, 0, 0, w, h);
    
    score();

    requestAnimationFrame(loop);
}

// 実行

background();
loop();

// リサイズ時処理

window.addEventListener('resize',() => {
    w = canvas.width = window.innerWidth - 20;
    h = canvas.height = w * (9/16);
});
