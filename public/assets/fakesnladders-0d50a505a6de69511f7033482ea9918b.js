function Ladder(e,t){this.fromGrid=e,this.toGrid=t,this.ladderWidth=24,this.ladderStep=16,this.lineWidth=4,this.color="rgb(153, 51, 0)",this.fromGrid.registerAction(this.action())}function Player(e,t,n,r){this.game=e,this.id=t,this.scoreGrid=n,this.image=r,this.rect=new Rect(this.scoreGrid.rect.x,this.scoreGrid.rect.y,this.scoreGrid.width,this.scoreGrid.height)}function Grid(e,t,n){this.sqNo=e,this.coordinates=t,this.squareSize=SQUARE_SIZE,this.squaresToSide=n,this.position=new Point(this.coordinates.x*this.squareSize,this.coordinates.y*this.squareSize),this.rect=new Rect(this.position.x,this.position.y,this.squareSize,this.squareSize),this.actions=[]}function FakesNLadders(e,t){this.gridSize=t,this.layer=e,this.layer.addGameObject(this),this.squaresToSide=10,this.squareSize=this.gridSize/this.squaresToSide,this.playerMap={},SQUARE_SIZE=this.squareSize}function diceMove(e){var t,n,r;console.log("diceMove("+e+")");switch(e){case 6:t=0,n=0,r=0;break;case 5:t=90,n=0,r=0;break;case 4:t=90,n=0,r=90;break;case 3:t=180,n=0,r=90;break;case 2:t=180,n=90,r=90;break;case 1:t=180,n=90,r=180}document.getElementById("cube").style.webkitTransform="rotateX("+t+"deg) rotateY("+n+"deg) rotateZ("+r+"deg)",document.getElementById("cube").style.MozTransform="rotateX("+t+"deg) rotateY("+n+"deg) rotateZ("+r+"deg)",document.getElementById("cube").style.msTransform="rotateX("+t+"deg) rotateY("+n+"deg) rotateZ("+r+"deg)"}function htmlescape(e){return e.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")}function init(){function o(){r.drawImage(i,0,0),r.save(),s.draw(r),r.restore(),t.drawImage(n,0,0)}var e=document.getElementById("game"),t=e.getContext("2d"),n=document.getElementById("back-buffer"),r=n.getContext("2d"),i=document.getElementById("background"),s=new Layer;tickManager=new TickManager(o),document.addEventListener("mousedown",function(t){t.stopPropagation();var n=new Point(t.pageX-e.offsetLeft,t.pageY-e.offsetTop);s.hit(n),o()},!1);var u=new FakesNLadders(s,HEIGHT);u.init(o),o()}var topic="#leedshack",tickManager,TICK_INTERVAL=Math.floor(1e3/30),DICE_INTERVAL=2e3,allowClick=!0,SQUARE_SIZE;Ladder.prototype.action=function(){function t(t){t.moveStraightLine(e.toGrid)}var e=this;return t},Ladder.prototype.drawLadder=function(e,t,n){e.beginPath();var r=t;e.moveTo(r.x+r.width/2-this.ladderWidth/2,r.y+r.height/2),r=n,e.lineTo(r.x+r.width/2-this.ladderWidth/2,r.y+r.height/2),r=t,e.moveTo(r.x+r.width/2+this.ladderWidth/2,r.y+r.height/2),r=n,e.lineTo(r.x+r.width/2+this.ladderWidth/2,r.y+r.height/2);var i=n.x-t.x,s=n.y-t.y,o=Math.sqrt(i*i+s*s),u=this.ladderStep/o,a=(n.x-t.x)*u,f=(n.y-t.y)*u,l=r.x+r.width/2-this.ladderWidth/2,c=r.y+r.height/2,h;for(h=0;h<o-this.ladderStep*2;h+=this.ladderStep)l-=a,c-=f,e.moveTo(l,c),e.lineTo(l+this.ladderWidth,c);e.stroke()},Ladder.prototype.draw=function(e){e.save(),e.lineWidth=this.lineWidth,e.strokeStyle="rgb(70, 70, 70)",this.drawLadder(e,new Rect(this.fromGrid.rect.x,this.fromGrid.rect.y+3,this.fromGrid.rect.width,this.fromGrid.rect.height),new Rect(this.toGrid.rect.x,this.toGrid.rect.y+3,this.toGrid.rect.width,this.toGrid.rect.height)),e.strokeStyle=this.color,this.drawLadder(e,this.fromGrid.rect,this.toGrid.rect),e.restore()},Ladder.prototype.hit=function(e){},Player.prototype.reset=function(){this.scoreGrid=this.game.getGrid(0),this.rect=new Rect(this.scoreGrid.rect.x,this.scoreGrid.rect.y,this.scoreGrid.width,this.scoreGrid.height),(new GameRequest).updateUserSquare(this.id,this.scoreGrid.sqNo)},Player.prototype.move=function(e){function n(){e.doActions(t)}var t=this;if(this.rect.y==e.position.y)this.moveStraightLine(e);else{var r,i;for(i=this.scoreGrid.sqNo;i<=e.sqNo;i++){r=this.game.getGrid(i);if(r.rect.y!=this.scoreGrid.rect.y)break}var t=this;function s(){t.moveStraightLine(t.game.getGrid(i),o)}function o(){t.moveStraightLine(e)}i!=this.scoreGrid.sqNo&&this.moveStraightLine(this.game.getGrid(i-1),s)}},Player.prototype.moveStraightLine=function(e,t){function r(){e.doActions(n),n.scoreGrid=e,(new GameRequest).updateUserSquare(n.id,n.scoreGrid.sqNo)}var n=this,i;t!=null?i=t:i=r,tickManager.addAnimation(new MoveAnimation(this,new Point(e.position.x,e.position.y),1),i)},Player.prototype.draw=function(e){e.drawImage(this.image,this.rect.x+SQUARE_SIZE/2-this.image.width/2,this.rect.y+SQUARE_SIZE/2-this.image.height/2)},Player.prototype.hit=function(e){},Grid.prototype.draw=function(e){e.save(),e.font="bold 16px sans-serif",e.textBaseline="top",e.textAlign="middle",e.fillText(this.sqNo.toString(),this.position.x+3,this.position.y+3),e.restore()},Grid.prototype.hit=function(e){},Grid.prototype.registerAction=function(e){this.actions.push(e)},Grid.prototype.doActions=function(e){for(var t=0;t<this.actions.length;t++)this.actions[t](e)},FakesNLadders.prototype.init=function(e){function o(){i.updatePlayers(e)}var t=0;this.grids=[];for(var n=this.squaresToSide-1;n>=0;n--){for(var r=this.squaresToSide-1;r>=0;r--)this.grids.push(new Grid(t++,new Point(r,n),this.squaresToSide)),this.layer.addGameObject(this.grids[this.grids.length-1]);n--;for(var r=0;r<this.squaresToSide;r++)this.grids.push(new Grid(t++,new Point(r,n),this.squaresToSide)),this.layer.addGameObject(this.grids[this.grids.length-1])}this.layer.addGameObject(new Ladder(this.getGrid(3),this.getGrid(22))),this.layer.addGameObject(new Ladder(this.getGrid(25),this.getGrid(43))),this.layer.addGameObject(new Ladder(this.getGrid(40),this.getGrid(58))),this.layer.addGameObject(new Ladder(this.getGrid(81),this.getGrid(99))),this.layer.addGameObject(new Ladder(this.getGrid(55),this.getGrid(86))),this.layer.addGameObject(new Ladder(this.getGrid(49),this.getGrid(92))),this.layer.addGameObject(new Ladder(this.getGrid(12),this.getGrid(31)));var i=this,s=new GameRequest;s.getAllUsers(function(t){if(!t||!t.length)return;for(var n=0;n<t.length;n++)i.initPlayer(t[n],e)}),setInterval(o,2e3),i.dice_enable=!1,i.dice_face=1,setInterval(function(){if(!i.dice_enable||i.dice_face<=1)return;i.dice_face--,diceMove(i.dice_face)},DICE_INTERVAL)},FakesNLadders.prototype.initPlayer=function(e,t){var n=new Image;n.src=e.avatar_url,n.width=40,n.height=40,n.onload=t,this.playerMap[e.id]=new Player(this,e.id,this.getGrid(e.position),n),this.layer.addGameObject(this.playerMap[e.id]);var r=this;document.getElementById("option-a").onclick=function(){r.makeChoice("a")},document.getElementById("option-b").onclick=function(){r.makeChoice("b")},this.nextChoice()},FakesNLadders.prototype.updatePlayers=function(e){var t=this,n=new GameRequest;n.getAllUsers(function(n){if(!n||!n.length)return;for(var r=0;r<n.length;r++){var i=n[r].id,s=this.playerMap[i];if(s){var o=n[r].position;o>99?(document.getElementById("end-area").innerHTML='Player <img src="'+n[r].avatar_url+'" height="40" width="40" /> has won!',s.move(this.getGrid(99))):s.move(this.getGrid(o))}else t.initPlayer(n[r],e)}})},FakesNLadders.prototype.getGrid=function(e){return this.grids[e]},FakesNLadders.prototype.draw=function(e){e.save(),e.fillStyle="black",e.strokeRect(0,0,this.gridSize,this.gridSize),e.beginPath();for(var t=.5;t<this.gridSize;t+=this.squareSize)e.moveTo(t,0),e.lineTo(t,this.gridSize);for(var n=.5;n<this.gridSize;n+=this.squareSize)e.moveTo(0,n),e.lineTo(this.gridSize,n);e.strokeStyle="rgba(70, 70, 70, 1)",e.lineWidth=1,e.stroke(),e.restore()},FakesNLadders.prototype.hit=function(e){},FakesNLadders.prototype.nextChoice=function(){console.log("fetching next choice...");var e=this;(new GameRequest).getNewChoice(topic,function(t,n,r){console.log("next choice received:"),console.log("choice_id: "+t),console.log("option_a: "+n),console.log("option_b: "+r),e.cur_choice_id=t,document.getElementById("option-a").innerHTML="Option A<br /><br />"+htmlescape(n),document.getElementById("option-b").innerHTML="Option B<br /><br />"+htmlescape(r),e.dice_face=7,e.dice_enable=!0})},FakesNLadders.prototype.makeChoice=function(e){console.log("choice: "+e+" with choice_id "+this.cur_choice_id),document.getElementById("option-a").innerHTML="Option A",document.getElementById("option-b").innerHTML="Option B";var t=this;t.dice_enable=!1,(new GameRequest).checkChoice(this.cur_choice_id,e,function(e){function n(n,r,i){e?t.playerMap[n].move(t.getGrid(t.playerMap[n].scoreGrid.sqNo+t.dice_face)):t.playerMap[n].reset()}(new GameRequest).getCurrentUser(n),console.log("correct: "+e+" dice face:"+t.dice_face),t.nextChoice()})},window.onload=init;