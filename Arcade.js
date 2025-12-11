javascript:(function(){
/* Neon Arcade Deluxe - All 6 games fully implemented */
(function(){
    // --- page base styling ---
    function initBody(){
        document.body.innerHTML='';
        document.body.style.margin='0';
        document.body.style.height='100vh';
        document.body.style.display='flex';
        document.body.style.flexDirection='column';
        document.body.style.justifyContent='center';
        document.body.style.alignItems='center';
        document.body.style.background='#090909';
        document.body.style.fontFamily='Arial, sans-serif';
        document.body.style.userSelect='none';
        document.body.style.color='#0ff';
    }
    initBody();

    // --- global cleanup/settings ---
    var activeTimers = [];
    var activeKeydown = null;
    var activeKeyup = null;
    function stopAll(){
        while(activeTimers.length) clearInterval(activeTimers.shift());
        if(activeKeydown) { document.removeEventListener('keydown', activeKeydown); activeKeydown = null; }
        if(activeKeyup) { document.removeEventListener('keyup', activeKeyup); activeKeyup = null; }
        document.onkeydown = null; document.onkeyup = null;
    }

    // --- UI helpers ---
    function createNeonButton(text, onClick){
        var btn = document.createElement('button');
        btn.textContent = text;
        btn.style.padding = '14px 34px';
        btn.style.fontSize = '20px';
        btn.style.fontWeight = '700';
        btn.style.color = '#0ff';
        btn.style.background = '#000';
        btn.style.border = '3px solid #0ff';
        btn.style.borderRadius = '12px';
        btn.style.cursor = 'pointer';
        btn.style.margin = '10px';
        btn.style.lineHeight = '1.2';
        btn.style.textAlign = 'center';
        btn.onmouseenter = function(){ btn.style.transform = 'scale(1.06)'; btn.style.boxShadow = '0 0 18px #0ff,0 0 36px #0ff inset'; };
        btn.onmouseleave = function(){ btn.style.transform = 'scale(1)'; btn.style.boxShadow = 'none'; };
        btn.onclick = function(){ stopAll(); onClick(); };
        return btn;
    }

    // --- Main menu ---
    function launchMenu(){
        stopAll();
        initBody();
        var title = document.createElement('h1');
        title.textContent = '🎮 Neon Arcade Deluxe 🎮';
        title.style.color = '#0ff';
        title.style.margin = '0 0 18px 0';
        title.style.fontSize = '30px';
        title.style.lineHeight = '1.2';
        title.style.textAlign = 'center';
        document.body.appendChild(title);

        var games = [
            {name:'Tic Tac Toe', fn: launchTicTacToe},
            {name:'Snake', fn: launchSnake},
            {name:'Pong', fn: launchPong},
            {name:'Asteroids', fn: launchAsteroids},
            {name:'Space Invaders', fn: launchSpaceInvaders},
            {name:'Platformer', fn: launchPlatformer}
        ];

        games.forEach(function(g){
            document.body.appendChild(createNeonButton(g.name, g.fn));
        });
    }

    /* ---------------------- TIC TAC TOE ---------------------- */
    function launchTicTacToe(){
        stopAll();
        initBody();
        var board = Array(9).fill(null);
        var human = 'X', ai = 'O', gameOver=false;

        var back = createNeonButton('Back', launchMenu);
        back.style.marginBottom = '12px';
        document.body.appendChild(back);

        var grid = document.createElement('div');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(3,110px)';
        grid.style.gridTemplateRows = 'repeat(3,110px)';
        grid.style.gap = '12px';
        grid.style.position = 'relative';
        document.body.appendChild(grid);

        var replay = createNeonButton('Replay', resetGame);
        replay.style.marginTop = '14px';
        document.body.appendChild(replay);

        var cells = [];
        var line = document.createElement('div');
        line.style.position = 'absolute';
        line.style.background = '#0ff';
        line.style.transition = 'all .45s ease';
        line.style.borderRadius = '5px';
        line.style.transformOrigin = 'top left';
        line.style.pointerEvents = 'none';
        line.style.display = 'none';
        grid.appendChild(line);

        for(let i=0;i<9;i++){
            let cell = document.createElement('div');
            cell.style.width='110px'; cell.style.height='110px'; cell.style.background='#000';
            cell.style.borderRadius='14px'; cell.style.boxShadow='0 0 14px #0ff,0 0 26px #0ff inset';
            cell.style.display='flex'; cell.style.justifyContent='center'; cell.style.alignItems='center';
            cell.style.fontSize='56px'; cell.style.color='#0ff'; cell.style.cursor='pointer';
            (function(idx, el){
                el.addEventListener('mouseenter', function(){ el.style.transform='scale(1.06)'; el.style.boxShadow='0 0 26px #0ff,0 0 42px #0ff inset'; });
                el.addEventListener('mouseleave', function(){ el.style.transform='scale(1)'; el.style.boxShadow='0 0 14px #0ff,0 0 26px #0ff inset'; });
                el.addEventListener('click', function(){
                    if(!board[idx] && !gameOver){
                        board[idx] = human;
                        render();
                        if(!gameOver){
                            setTimeout(function(){ board[bestMove()] = ai; render(); }, 200);
                        }
                    }
                });
            })(i,cell);
            cells.push(cell);
            grid.appendChild(cell);
        }

        function checkWinnerRaw(b){
            var lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
            for(var j=0;j<lines.length;j++){
                var a = lines[j][0], b1 = lines[j][1], c = lines[j][2];
                if(b[a] && b[a]===b[b1] && b[a]===b[c]) return {winner:b[a], line:[a,b1,c]};
            }
            if(!b.includes(null)) return {winner:'Draw', line:null};
            return null;
        }
        function checkWinner(b){
            var res = checkWinnerRaw(b);
            if(res && res.winner!=='Draw'){ drawLine(res.line[0],res.line[1],res.line[2]); gameOver=true; }
            else if(res && res.winner==='Draw'){ gameOver=true; }
            return res ? res.winner : null;
        }
        function drawLine(a,b,c){
            var r1 = cells[a].getBoundingClientRect();
            var r3 = cells[c].getBoundingClientRect();
            var g = grid.getBoundingClientRect();
            var x1 = r1.left - g.left + r1.width/2;
            var y1 = r1.top - g.top + r1.height/2;
            var x2 = r3.left - g.left + r3.width/2;
            var y2 = r3.top - g.top + r3.height/2;
            var dx = x2-x1, dy = y2-y1;
            var len = Math.sqrt(dx*dx + dy*dy);
            line.style.width = len+'px';
            line.style.height = '6px';
            line.style.left = x1+'px';
            line.style.top = y1+'px';
            line.style.transform = 'rotate('+Math.atan2(dy,dx)+'rad)';
            line.style.display = 'block';
        }
        function bestMove(){
            for(var i=0;i<9;i++){ if(!board[i]){ board[i]=ai; var r = checkWinnerRaw(board); if(r && r.winner===ai){ board[i]=null; return i; } board[i]=null; } }
            for(var i=0;i<9;i++){ if(!board[i]){ board[i]=human; var r2 = checkWinnerRaw(board); if(r2 && r2.winner===human){ board[i]=null; return i; } board[i]=null; } }
            var available = board.map(function(v,i){ return v===null?i:null; }).filter(function(v){ return v!==null; });
            return available[Math.floor(Math.random()*available.length)];
        }
        function render(){ for(var i=0;i<9;i++) cells[i].textContent = board[i] || ''; checkWinner(board); }
        function resetGame(){ board = Array(9).fill(null); gameOver=false; line.style.display='none'; cells.forEach(function(c){ c.textContent=''; }); }
        render();
    }

    /* ---------------------- SNAKE ---------------------- */
    function launchSnake(){
        stopAll();
        initBody();
        var back = createNeonButton('Back', launchMenu); back.style.marginBottom='8px'; document.body.appendChild(back);
        var wrapper = document.createElement('div'); wrapper.style.display='flex'; wrapper.style.flexDirection='column'; wrapper.style.alignItems='center'; document.body.appendChild(wrapper);
        var canvas = document.createElement('canvas'); canvas.width = 420; canvas.height = 420; canvas.style.background='#000'; canvas.style.marginTop='8px'; wrapper.appendChild(canvas);
        var ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top'; ctx.textAlign = 'left';

        var snake = [{x:8,y:8}];
        var dir = {x:1,y:0};
        var food = {x:12,y:12};
        var gameOver = false;
        var gridSize = 20;

        function placeFood(){
            food = { x: Math.floor(Math.random()*(canvas.width/gridSize)), y: Math.floor(Math.random()*(canvas.height/gridSize)) };
        }

        function keydownSnake(e){
            if(e.key === 'ArrowUp' && dir.y !== 1) dir = {x:0,y:-1};
            if(e.key === 'ArrowDown' && dir.y !== -1) dir = {x:0,y:1};
            if(e.key === 'ArrowLeft' && dir.x !== 1) dir = {x:-1,y:0};
            if(e.key === 'ArrowRight' && dir.x !== -1) dir = {x:1,y:0};
        }

        activeKeydown = keydownSnake;
        document.addEventListener('keydown', activeKeydown);

        function draw(){
            if(gameOver) return;
            ctx.fillStyle = '#000'; ctx.fillRect(0,0,canvas.width,canvas.height);
            var head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
            if(head.x<0 || head.y<0 || head.x>=canvas.width/gridSize || head.y>=canvas.height/gridSize || snake.some(function(s){ return s.x===head.x && s.y===head.y; })){
                gameOver = true; return;
            }
            snake.unshift(head);
            if(head.x===food.x && head.y===food.y){ placeFood(); } else { snake.pop(); }
            ctx.fillStyle = '#0ff';
            ctx.fillRect(food.x*gridSize, food.y*gridSize, gridSize, gridSize);
            snake.forEach(function(s){ ctx.fillRect(s.x*gridSize, s.y*gridSize, gridSize, gridSize); });
        }

        placeFood();
        activeTimers.push(setInterval(draw, 100));
    }

    /* ---------------------- PONG ---------------------- */
    function launchPong(){
        stopAll();
        initBody();
        var back = createNeonButton('Back', launchMenu); back.style.marginBottom='8px'; document.body.appendChild(back);
        var wrapper = document.createElement('div'); wrapper.style.display='flex'; wrapper.style.flexDirection='column'; wrapper.style.alignItems='center'; document.body.appendChild(wrapper);
        var canvas = document.createElement('canvas'); canvas.width = 560; canvas.height = 360; canvas.style.background='#000'; canvas.style.marginTop='8px'; wrapper.appendChild(canvas);
        var ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top'; ctx.textAlign = 'center';

        var paddleH = 70, paddleW = 10;
        var playerY = (canvas.height - paddleH)/2;
        var aiY = (canvas.height - paddleH)/2;
        var playerVel = 0;
        var ball = { x: canvas.width/2, y: canvas.height/2, vx: 5, vy: 3 };
        var playerScore = 0, aiScore = 0;

        function keydownPong(e){
            if(e.key === 'ArrowUp') playerVel = -7;
            if(e.key === 'ArrowDown') playerVel = 7;
        }
        function keyupPong(e){
            if(e.key === 'ArrowUp' || e.key === 'ArrowDown') playerVel = 0;
        }
        activeKeydown = keydownPong;
        activeKeyup = keyupPong;
        document.addEventListener('keydown', activeKeydown);
        document.addEventListener('keyup', activeKeyup);

        function draw(){
            ctx.fillStyle = '#000'; ctx.fillRect(0,0,canvas.width,canvas.height);
            // player smooth
            playerY += playerVel;
            if(playerY < 0) playerY = 0;
            if(playerY > canvas.height - paddleH) playerY = canvas.height - paddleH;
            // ball
            ball.x += ball.vx; ball.y += ball.vy;
            if(ball.y < 0 || ball.y > canvas.height - 10) ball.vy *= -1;
            // collisions
            if(ball.x < 20 && ball.y > playerY && ball.y < playerY + paddleH){
                ball.vx = Math.abs(ball.vx);
                var diff = (ball.y - (playerY + paddleH/2)) / (paddleH/2);
                ball.vy += diff * 1.2;
            }
            if(ball.x > canvas.width - 30 && ball.y > aiY && ball.y < aiY + paddleH){
                ball.vx = -Math.abs(ball.vx);
                var diff2 = (ball.y - (aiY + paddleH/2)) / (paddleH/2);
                ball.vy += diff2 * 1.1;
            }
            // scoring
            if(ball.x < 0){ aiScore++; ball = { x: canvas.width/2, y: canvas.height/2, vx: 5, vy: 3 }; }
            if(ball.x > canvas.width){ playerScore++; ball = { x: canvas.width/2, y: canvas.height/2, vx: -5, vy: 3 }; }
            // AI
            if(ball.y > aiY + paddleH/2) aiY += 3; else aiY -= 3;
            if(aiY < 0) aiY = 0; if(aiY > canvas.height - paddleH) aiY = canvas.height - paddleH;
            // draw
            ctx.fillStyle = '#0ff';
            ctx.fillRect(12, playerY, paddleW, paddleH);
            ctx.fillRect(canvas.width - 22, aiY, paddleW, paddleH);
            ctx.fillRect(ball.x, ball.y, 10, 10);
            // scores (centered)
            ctx.fillStyle = '#0ff'; ctx.font = '24px Arial';
            ctx.fillText(playerScore, canvas.width/4, 8);
            ctx.fillText(aiScore, 3*canvas.width/4, 8);
        }

        activeTimers.push(setInterval(draw, 20));
    }

    /* ---------------------- ASTEROIDS ---------------------- */
    function launchAsteroids(){
        stopAll();
        initBody();
        var back = createNeonButton('Back', launchMenu); back.style.marginBottom='8px'; document.body.appendChild(back);
        var wrapper = document.createElement('div'); wrapper.style.display='flex'; wrapper.style.flexDirection='column'; wrapper.style.alignItems='center'; document.body.appendChild(wrapper);
        var canvas = document.createElement('canvas'); canvas.width = 560; canvas.height = 360; canvas.style.background='#000'; canvas.style.marginTop='8px'; wrapper.appendChild(canvas);
        var ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top'; ctx.textAlign = 'left';

        var ship = { x: canvas.width/2, y: canvas.height/2, angle: -Math.PI/2, vx:0, vy:0 };
        var bullets = [];
        var asteroids = [];
        var maxBullets = 6;
        var canShoot = true;
        var shootCooldown = 160;

        function spawnAst(x,y,r){
            asteroids.push({
                x: x !== undefined ? x : Math.random()*canvas.width,
                y: y !== undefined ? y : Math.random()*canvas.height,
                vx: (Math.random()-0.5)*1.6,
                vy: (Math.random()-0.5)*1.6,
                r: r !== undefined ? r : 18 + Math.random()*22
            });
        }
        for(var i=0;i<6;i++) spawnAst();

        function keydownA(e){
            if(e.key === 'ArrowLeft') keysA.left = true;
            if(e.key === 'ArrowRight') keysA.right = true;
            if(e.key === 'ArrowUp') keysA.up = true;
            if(e.key === ' ' || e.key === 'Spacebar' || e.code === 'Space'){ keysA.space = true; attemptShoot(); }
        }
        function keyupA(e){
            if(e.key === 'ArrowLeft') keysA.left = false;
            if(e.key === 'ArrowRight') keysA.right = false;
            if(e.key === 'ArrowUp') keysA.up = false;
            if(e.key === ' ' || e.key === 'Spacebar' || e.code === 'Space') keysA.space = false;
        }
        var keysA = { left:false, right:false, up:false, space:false };
        activeKeydown = keydownA; activeKeyup = keyupA;
        document.addEventListener('keydown', activeKeydown);
        document.addEventListener('keyup', activeKeyup);

        function attemptShoot(){
            if(!canShoot) return;
            if(bullets.length >= maxBullets) return;
            var speed = 6.5;
            var bx = ship.x + Math.cos(ship.angle)*14;
            var by = ship.y + Math.sin(ship.angle)*14;
            bullets.push({ x: bx, y: by, vx: ship.vx + Math.cos(ship.angle)*speed, vy: ship.vy + Math.sin(ship.angle)*speed, life: 1400 });
            canShoot = false;
            setTimeout(function(){ canShoot = true; }, shootCooldown);
        }

        function updateAst(){
            if(keysA.left) ship.angle -= 0.06;
            if(keysA.right) ship.angle += 0.06;
            if(keysA.up){ ship.vx += Math.cos(ship.angle)*0.12; ship.vy += Math.sin(ship.angle)*0.12; }

            ship.vx *= 0.995; ship.vy *= 0.995;
            ship.x += ship.vx; ship.y += ship.vy;
            if(ship.x < 0) ship.x += canvas.width;
            if(ship.x > canvas.width) ship.x -= canvas.width;
            if(ship.y < 0) ship.y += canvas.height;
            if(ship.y > canvas.height) ship.y -= canvas.height;

            for(var i=bullets.length-1;i>=0;i--){
                var b = bullets[i];
                b.x += b.vx; b.y += b.vy;
                b.life -= 20;
                if(b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height || b.life <= 0) bullets.splice(i,1);
            }

            for(var j=0;j<asteroids.length;j++){
                var a = asteroids[j];
                a.x += a.vx; a.y += a.vy;
                if(a.x < 0) a.x += canvas.width;
                if(a.x > canvas.width) a.x -= canvas.width;
                if(a.y < 0) a.y += canvas.height;
                if(a.y > canvas.height) a.y -= canvas.height;
            }

            // bullets vs asteroids
            for(var i=asteroids.length-1;i>=0;i--){
                var a = asteroids[i];
                for(var j=bullets.length-1;j>=0;j--){
                    var b = bullets[j];
                    var dx = b.x - a.x, dy = b.y - a.y;
                    if(Math.sqrt(dx*dx + dy*dy) < a.r){
                        bullets.splice(j,1);
                        var oldR = a.r;
                        asteroids.splice(i,1);
                        if(oldR > 12){
                            spawnAst(a.x + 6, a.y + 6, oldR*0.6);
                            spawnAst(a.x - 6, a.y - 6, oldR*0.6);
                        }
                        break;
                    }
                }
            }

            // ship collision
            for(var k=0;k<asteroids.length;k++){
                var a = asteroids[k];
                var dx = ship.x - a.x, dy = ship.y - a.y;
                if(Math.sqrt(dx*dx + dy*dy) < a.r + 8){
                    ship.x = canvas.width/2; ship.y = canvas.height/2; ship.vx = 0; ship.vy = 0;
                }
            }

            if(asteroids.length < 4) spawnAst();
        }

        function drawAst(){
            ctx.fillStyle = '#000'; ctx.fillRect(0,0,canvas.width,canvas.height);
            ctx.strokeStyle = '#0ff';
            for(var i=0;i<asteroids.length;i++){
                var a = asteroids[i];
                ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI*2); ctx.stroke();
            }
            ctx.fillStyle = '#0ff';
            for(var j=0;j<bullets.length;j++){ var b = bullets[j]; ctx.fillRect(b.x-2, b.y-2, 4,4); }
            ctx.save(); ctx.translate(ship.x, ship.y); ctx.rotate(ship.angle); ctx.strokeStyle = '#0ff';
            ctx.beginPath(); ctx.moveTo(12,0); ctx.lineTo(-10,-8); ctx.lineTo(-6,0); ctx.lineTo(-10,8); ctx.closePath(); ctx.stroke(); ctx.restore();
            // HUD
            ctx.fillStyle = '#0ff'; ctx.font = '16px Arial'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
            ctx.fillText('Asteroids: ' + asteroids.length, 8, 8);
            ctx.fillText('Bullets: ' + bullets.length, 8, 26);
        }

        activeTimers.push(setInterval(function(){ updateAst(); drawAst(); }, 24));
    }

    /* ---------------------- SPACE INVADERS ---------------------- */
    function launchSpaceInvaders(){
        stopAll();
        initBody();
        var back = createNeonButton('Back', launchMenu); back.style.marginBottom='8px'; document.body.appendChild(back);
        var wrapper = document.createElement('div'); wrapper.style.display='flex'; wrapper.style.flexDirection='column'; wrapper.style.alignItems='center'; document.body.appendChild(wrapper);
        var canvas = document.createElement('canvas'); canvas.width = 560; canvas.height = 360; canvas.style.background='#000'; canvas.style.marginTop='8px'; wrapper.appendChild(canvas);
        var ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top'; ctx.textAlign = 'left';

        var player = { x: canvas.width/2 - 14, y: canvas.height - 36, w: 28, h: 16 };
        var bullets = [];
        var aliens = [];
        var cols = 9, rows = 3;
        for(var r=0;r<rows;r++){ for(var c=0;c<cols;c++){ aliens.push({ x: 36 + c*46, y: 36 + r*34, alive:true }); } }
        var keysSI = { left:false, right:false, space:false };
        var alienDir = 1, alienSpeed = 0.45;

        function kdSI(e){
            if(e.key === 'ArrowLeft') keysSI.left = true;
            if(e.key === 'ArrowRight') keysSI.right = true;
            if(e.key === ' ' || e.key === 'Spacebar' || e.code === 'Space'){
                keysSI.space = true;
                if(bullets.length < 3){
                    bullets.push({ x: player.x + player.w/2, y: player.y, vy: -6 });
                }
            }
        }
        function kuSI(e){
            if(e.key === 'ArrowLeft') keysSI.left = false;
            if(e.key === 'ArrowRight') keysSI.right = false;
            if(e.key === ' ' || e.key === 'Spacebar' || e.code === 'Space') keysSI.space = false;
        }
        activeKeydown = kdSI; activeKeyup = kuSI;
        document.addEventListener('keydown', activeKeydown);
        document.addEventListener('keyup', activeKeyup);

        function updateSI(){
            if(keysSI.left) player.x -= 4;
            if(keysSI.right) player.x += 4;
            if(player.x < 4) player.x = 4;
            if(player.x > canvas.width - player.w - 4) player.x = canvas.width - player.w - 4;

            for(var i=bullets.length-1;i>=0;i--){
                bullets[i].y += bullets[i].vy;
                if(bullets[i].y < 0) bullets.splice(i,1);
            }

            var hitR = false, hitL = false;
            for(var j=0;j<aliens.length;j++){
                if(!aliens[j].alive) continue;
                aliens[j].x += alienDir * alienSpeed;
                if(aliens[j].x + 30 >= canvas.width - 8) hitR = true;
                if(aliens[j].x <= 8) hitLeft = true;
            }
            if(hitR || hitL){
                alienDir *= -1;
                for(var k=0;k<aliens.length;k++){ if(!aliens[k].alive) continue; aliens[k].y += 20; }
            }

            for(var aI=aliens.length-1;aI>=0;aI--){
                var a = aliens[aI];
                if(!a.alive) continue;
                for(var bI=bullets.length-1;bI>=0;bI--){
                    var b = bullets[bI];
                    if(b.x > a.x && b.x < a.x + 30 && b.y > a.y && b.y < a.y + 20){
                        a.alive = false;
                        bullets.splice(bI,1);
                        break;
                    }
                }
            }
        }

        function drawSI(){
            ctx.fillStyle = '#000'; ctx.fillRect(0,0,canvas.width,canvas.height);
            // player
            ctx.strokeStyle = '#0ff';
            ctx.beginPath(); ctx.moveTo(player.x, player.y + player.h); ctx.lineTo(player.x + player.w/2, player.y); ctx.lineTo(player.x + player.w, player.y + player.h); ctx.stroke();
            // bullets
            ctx.fillStyle = '#0ff';
            for(var i=0;i<bullets.length;i++) ctx.fillRect(bullets[i].x - 2, bullets[i].y - 8, 4, 8);
            // aliens
            ctx.strokeStyle = '#0ff';
            for(var j=0;j<aliens.length;j++){ var al = aliens[j]; if(!al.alive) continue; ctx.strokeRect(al.x, al.y, 30, 20); }
            // HUD
            ctx.fillStyle = '#0ff'; ctx.font = '16px Arial'; ctx.textAlign = 'left'; ctx.fillText('Aliens: ' + aliens.filter(function(a){return a.alive;}).length, 8, 8);
        }

        activeTimers.push(setInterval(function(){ updateSI(); drawSI(); }, 24));
    }

    /* ---------------------- PLATFORMER ---------------------- */
    function launchPlatformer(){
        stopAll();
        initBody();
        var back = createNeonButton('Back', launchMenu); back.style.marginBottom='8px'; document.body.appendChild(back);
        var wrapper = document.createElement('div'); wrapper.style.display='flex'; wrapper.style.flexDirection='column'; wrapper.style.alignItems='center'; document.body.appendChild(wrapper);
        var canvas = document.createElement('canvas'); canvas.width = 720; canvas.height = 380; canvas.style.background='#000'; canvas.style.marginTop='8px'; wrapper.appendChild(canvas);
        var ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top'; ctx.textAlign = 'left';

        var gravity = 0.6;
        var player = { x:60, y:260, w:22, h:30, vx:0, vy:0, onGround:false, facing:1 };
        var keysP = { left:false, right:false, jump:false };
        var platforms = [
            {x:0,y:340,w:720,h:40},
            {x:120,y:280,w:120,h:14},
            {x:280,y:220,w:120,h:14},
            {x:460,y:160,w:120,h:14},
            {x:620,y:240,w:80,h:14},
            {x:360,y:320,w:140,h:14}
        ];
        var coins = [ {x:150,y:248,collected:false},{x:320,y:188,collected:false},{x:500,y:128,collected:false},{x:660,y:208,collected:false},{x:420,y:288,collected:false} ];
        var enemies = [ {x:240,y:192,w:22,h:18,vx:1.2,dir:1,range:[240,360]}, {x:540,y:128,w:22,h:18,vx:1,dir:1,range:[460,620]} ];
        var score = 0;
        var jumpPower = -11;

        function kdP(e){
            if(e.key === 'ArrowLeft') keysP.left = true;
            if(e.key === 'ArrowRight') keysP.right = true;
            if(e.key === ' ' || e.key === 'Spacebar' || e.code === 'Space') keysP.jump = true;
        }
        function kuP(e){
            if(e.key === 'ArrowLeft') keysP.left = false;
            if(e.key === 'ArrowRight') keysP.right = false;
            if(e.key === ' ' || e.key === 'Spacebar' || e.code === 'Space') keysP.jump = false;
        }
        activeKeydown = kdP; activeKeyup = kuP;
        document.addEventListener('keydown', activeKeydown);
        document.addEventListener('keyup', activeKeyup);

        function rectsOverlap(a,b){ return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }

        function updatePlatformer(){
            if(keysP.left){ player.vx -= 0.9; player.facing = -1; }
            if(keysP.right){ player.vx += 0.9; player.facing = 1; }
            player.vx *= 0.82;
            player.vy += gravity;
            if(keysP.jump && player.onGround){ player.vy = jumpPower; player.onGround = false; }

            if(player.vx > 7) player.vx = 7; if(player.vx < -7) player.vx = -7;
            if(player.vy > 20) player.vy = 20;

            player.x += player.vx;
            var pBox = { x: player.x, y: player.y, w: player.w, h: player.h };
            for(var i=0;i<platforms.length;i++){
                var pl = platforms[i];
                var r = {x:pl.x,y:pl.y,w:pl.w,h:pl.h};
                if(rectsOverlap(pBox, r)){
                    if(player.vx > 0){ player.x = pl.x - player.w - 0.01; player.vx = 0; }
                    else if(player.vx < 0){ player.x = pl.x + pl.w + 0.01; player.vx = 0; }
                    pBox.x = player.x;
                }
            }

            player.y += player.vy; player.onGround = false;
            pBox.y = player.y;
            for(var j=0;j<platforms.length;j++){
                var pl2 = platforms[j];
                var rr = {x:pl2.x,y:pl2.y,w:pl2.w,h:pl2.h};
                if(rectsOverlap(pBox, rr)){
                    if(player.vy > 0){ player.y = pl2.y - player.h; player.vy = 0; player.onGround = true; }
                    else if(player.vy < 0){ player.y = pl2.y + pl2.h; player.vy = 0; }
                    pBox.y = player.y;
                }
            }

            for(var c=0;c<coins.length;c++){
                if(!coins[c].collected){
                    var coinBox = { x: coins[c].x - 8, y: coins[c].y - 8, w:16, h:16 };
                    if(rectsOverlap({x:player.x,y:player.y,w:player.w,h:player.h}, coinBox)){
                        coins[c].collected = true; score += 10;
                    }
                }
            }

            for(var eI=0;eI<enemies.length;eI++){
                var en = enemies[eI];
                en.x += en.vx * en.dir;
                if(en.x < en.range[0]) en.dir = 1;
                if(en.x > en.range[1]) en.dir = -1;
                if(rectsOverlap({x:player.x,y:player.y,w:player.w,h:player.h}, {x:en.x,y:en.y,w:en.w,h:en.h})){
                    player.x = 60; player.y = 260; player.vx = 0; player.vy = 0; score = Math.max(0, score - 20);
                }
            }
        }

        function drawPlatformer(){
            ctx.fillStyle='#000'; ctx.fillRect(0,0,canvas.width,canvas.height);
            for(var i=0;i<platforms.length;i++){
                var pl = platforms[i];
                ctx.fillStyle = '#001'; ctx.fillRect(pl.x,pl.y,pl.w,pl.h);
                ctx.strokeStyle = '#0ff'; ctx.lineWidth = 2; ctx.strokeRect(pl.x,pl.y,pl.w,pl.h);
            }
            for(var c=0;c<coins.length;c++){
                if(coins[c].collected) continue;
                ctx.fillStyle = '#0ff'; ctx.beginPath(); ctx.arc(coins[c].x, coins[c].y, 6, 0, Math.PI*2); ctx.fill();
            }
            for(var ei=0; ei<enemies.length; ei++){
                var en = enemies[ei];
                ctx.fillStyle = '#000'; ctx.fillRect(en.x, en.y, en.w, en.h);
                ctx.strokeStyle = '#f0f'; ctx.lineWidth = 2; ctx.strokeRect(en.x, en.y, en.w, en.h);
            }
            ctx.save(); ctx.translate(player.x + player.w/2, player.y + player.h/2);
            ctx.fillStyle = '#000'; ctx.fillRect(-player.w/2, -player.h/2, player.w, player.h);
            ctx.strokeStyle = '#0ff'; ctx.lineWidth = 2; ctx.strokeRect(-player.w/2, -player.h/2, player.w, player.h);
            ctx.fillStyle = '#0ff'; ctx.fillRect(player.facing>0?6:-10, -4, 4,4);
            ctx.restore();
            ctx.fillStyle = '#0ff'; ctx.font = '18px Arial'; ctx.fillText('Score: ' + score, 12, 8);
            ctx.fillText('Coins: ' + coins.filter(function(c){ return c.collected; }).length + '/' + coins.length, 12, 28);
        }

        activeTimers.push(setInterval(function(){ updatePlatformer(); drawPlatformer(); }, 24));
    }

    // start
    launchMenu();
})();
})(); 
