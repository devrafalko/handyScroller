window.onload = function(){
	var newScroll = new handyScroller({
			box:document.getElementById("panelContent"),
			side: "xy",
			inset:[true,false],
			scrollMargin:[true,true],
			stretch:[false,false],
			divideCorner:[true,true],
			wheelOrient:"vertical",
			wheelX:10,
			scrollStep:[10,10]
	});
//	var newScroll2 = new handyScroller({
//			box:document.getElementById("innerContent"),
//			side: "xy",
//			stretch:[false,false],
//			inset:[true,true],
//			divideCorner:[true,true],
//			scrollMargin:[false,false],
//			wheelOrient:"horizontal",
//			wheelX:30,
//			scrollStep:[1,1]
//	});
};

function handyScroller(o){
	this.stretch = o.stretch;
	this.divideCorner = o.divideCorner;
	this.scrollMargin = o.scrollMargin;
	this.side = o.side;
	this.scrollStep = o.scrollStep;
	this.wheelOrient = o.wheelOrient;
	this.wheelX = o.wheelX;
	this.mainBox = o.box;
	this.inset = o.inset;
	this.contentBox = null;
	this.wheelBox = null;
	this.scrollId = Date.now();
	this.elements = [[null,   //Area		this.elements[0][0]
					  null,   //Padding		this.elements[0][1]
					  null],  //Button		this.elements[0][2]
					 [null,   //Area		this.elements[1][0]
					  null,   //Padding		this.elements[1][1]
					  null]]; //Button		this.elements[1][2]
	this.wheelXY = [false,false];
	createBoxes.call(this);
	validation.call(this);
	
	blockScroll.call(this);
}

handyScroller.prototype.currentId = null;
handyScroller.prototype.buttonClick = null;
handyScroller.prototype.stylesXY = [["top","height","right","Y","width","scrollTop"],["left","width","bottom","X","height","scrollLeft"]];	//DODAĆ DO OUTEROBJECT

function isFit(obj,xy){
	var margin = obj.scrollMargin[xy] && obj.elements[1-xy][0] ? obj.rP(1-xy,3,2):0;
	return ((obj.rP(xy,0,1)-margin)/obj.rP(xy,1,1))>=1;
}

function validation(){
	var x,b=[0,1];
	var s = ["y","x","xy"];
	refreshScrollMargin.call(this);
	
	for(x in b){
		this.scrollMargin[x] = !this.inset[x] ? false:this.scrollMargin[x];
		createScrollbars.call(this,x,1);
	}
	
	if((isFit(this,0)||this.side===s[1])&&(isFit(this,1)||this.side===s[0])){
		windowWheelBlock.call(this,0);
		} else {
			windowWheelBlock.call(this,1);
			}	
	
	if(this.side===s[2] && !isFit(this,0) && !isFit(this,1)){
		createWheelArea.call(this,1);
		for (x in b){
			var o = !this.inset[1-x]?1:0;
			divideMe.call(this,x,0,o);
			refreshStretch.call(this,x);
			positionContent.call(this,x);
		}
	} else {
		createWheelArea.call(this,0);
		
		for(x in b){
			if(!((this.side===s[x]||this.side===s[2])&&!isFit(this,x))){
				this.scrollMargin[x] = false;
				createScrollbars.call(this,x,0);
			}
		}
		for(x in b){
			if((this.side===s[x]||this.side===s[2])&&!isFit(this,x)){
				if(!this.inset[x]){
					this.scrollMargin[x] = false;
				}
				createScrollbars.call(this,x,1);
				divideMe.call(this,x,1,0);
				refreshStretch.call(this,x);
				positionContent.call(this,x);
			}
		}
	}
	setWheelEvent.call(this);
}

function createBoxes(){
	var isStatic = window.getComputedStyle(this.mainBox,null).getPropertyValue("position")!=="static"? ["position",null]:["position","relative"];
	var masking = document.createElement("DIV");
	this.contentBox = document.createElement("DIV");
	this.contentBox.setAttribute("class","handyBox");
	
	var innerObj = this.mainBox.childNodes;
	for(;innerObj.length!==0;){
		this.contentBox.appendChild(innerObj[0]);
	}
	masking.appendChild(this.contentBox);
	this.mainBox.appendChild(masking);
	
	setStyles(this.mainBox,["boxSizing","overflow",isStatic[0],"padding","outline","border"],["border-box","visible",isStatic[1],"0","0","0"]);
	setStyles(masking,["position","width","height","top","left","overflow","margin","outline","border","padding","boxSizing"],["relative","100%","100%","0px","0px","hidden","0","0","0","0","border-box"]);
	setStyles(this.contentBox,["position","margin","outline","border","box-sizing"],["relative","0","0","0","border-box"]);
}

function refreshScrollMargin(){
	for(var x=0;x<2;x++){
		this.scrollMargin[x] = this.constructor.arguments[0].scrollMargin[x];
	}
}

function createWheelArea(state){
	if (state&&!this.wheelBox){
		this.wheelBox = document.createElement("DIV");
		this.wheelBox.setAttribute("class","handyWheelBox");
		var s = this.wheelOrient === "horizontal"? ["bottom","height"]:["right","width"];
		setStyles(this.wheelBox,["position","pointerEvents","boxSizing",s[0],s[1]],["absolute","none","border-box","0px",this.wheelX+"%"]);
		this.mainBox.insertBefore(this.wheelBox,this.elements[1][0]);
		} else if(!state&&this.wheelBox){
				this.mainBox.removeChild(this.wheelBox);
				this.wheelBox = null;
			}
}

function windowWheelBlock(state){
	var binded = mouseOverMe.bind(this);
	this.mainBox.addEventListener("mouseover",binded,true);
	this.mainBox.addEventListener("mouseout", mouseOutMe,true);
	
	function mouseOverMe(){
		if(state){
			window.onwheel=function(){return false;};
			window.onmousewheel=function(){return false;};
			this.constructor.prototype.currentId = this.scrollId;
			}
		}	
	function mouseOutMe(){
		window.onwheel=null;
		window.onmousewheel=null;		
	}
}

function createScrollbars(z,state){
	if(state&&!this.elements[z][0]){

		var e = ["Box","Area","er"];
		var p = [["position",this.stylesXY[z][0],this.stylesXY[z][2],this.stylesXY[z][1],"boxSizing"],
				 ["position","cursor","top","left","width","height","boxSizing","padding","margin"],
				 ["position"]];
		var v = [["absolute","0px","0px","100%","border-box"],
				 ["relative","pointer","0px","0px","100%","100%","border-box","0","0"],
				 ["relative"]];
		for(var x=0;x<3;x++){
			this.elements[z][x] = document.createElement("DIV");
			this.elements[z][x].setAttribute("class","handyScroll"+e[x]+this.stylesXY[z][3]);
			this.elements[z][x].setAttribute("data-side",z);
			setStyles(this.elements[z][x],p[x],v[x]);
		}
		this.elements[z][1].appendChild(this.elements[z][2]);
		this.elements[z][0].appendChild(this.elements[z][1]);
		this.mainBox.appendChild(this.elements[z][0]);
		
		var bindedR,bindedS,bindedC = clickMe.bind(this,this.elements[z][1]);
		
		this.elements[z][1].addEventListener("mousedown",bindedC);
		this.elements[z][2].ondragstart = function(e){
			 e.preventDefault();
		};
		} else if(!state&&this.elements[z][0]) {
			this.elements[z][1].removeEventListener("mousedown",bindedC);
			this.elements[z][2].ondragstart = null;
			this.mainBox.removeChild(this.elements[z][0]);
			this.elements[z] = [null,null,null];
			}
	
			function clickMe(obj){
				var s = Number(obj.parentNode.getAttribute("data-side"));
				bindedR = releaseMe.bind(this);
				bindedS = scrollMove.bind(this,s);
				prepareToMove.call(this,s);
				scrollMove.call(this,s);
				prepareToMove.call(this,s);
				document.body.addEventListener("mouseup",bindedR);
				document.body.addEventListener("mousemove",bindedS);
				setStyles(document.body,["cursor"],["pointer"]);
				setStyles(this.contentBox,["webkitTouchCallout","webkitUserSelect","khtmlUserSelect","mozUserSelect","msUserSelect","oUserSelect","UserSelect"],["none","none","none","none","none","none","none"]);
			}

			function releaseMe(){
				document.body.removeEventListener("mouseup",bindedR);
				document.body.removeEventListener("mousemove",bindedS);
				setStyles(document.body,["cursor"],["default"]);
				setStyles(this.contentBox,["webkitTouchCallout","webkitUserSelect","khtmlUserSelect","mozUserSelect","msUserSelect","oUserSelect","UserSelect"],["all","all","all","all","all","all","all"]);
			}
			
			function scrollMove(s){
				var pos = getMouse.call(this,s)+this.buttonClick;
				setDimentions.call(this,pos,s,0);
			}	
}

function divideMe(s,b,c){
	if(!b){
		var	a = c?this.rP(1-s,3,2):0;
		var d = this.divideCorner[s]?this.rP(1-s,3,2):0;
		console.log(a,d);
		var paddingProc = 100-(((-a+d)/this.rP(s,3,1))*100);
		setStyles(this.elements[s][0],[[this.stylesXY[s][1]]],[paddingProc+"%"]);
	}
	if(!this.inset[s]){
		setStyles(this.elements[s][0],[this.stylesXY[s][2]],[-this.rP(s,3,2)+"px"]);
	}
}

function setWheelEvent(){
	var e = this.elements;
	var s = e[0][0]&&e[1][0]? 2:e[0][0]?0:e[1][0]?1:-1;
	var binded = wheelScroll.bind(this,s);
	if(s>=0){
		this.mainBox.addEventListener("wheel", binded);
		} else {
			this.mainBox.removeEventListener("wheel", binded);
		}
				
	function wheelScroll(s){
		if(this.scrollId!==this.constructor.prototype.currentId){
			return;
		}
		var or = this.wheelOrient==="vertical" ? 1:0;
		var c = s!==2?s:((getMouse.call(this,or)/this.rP(or,0,1))*100)<(100-this.wheelX) ? 0:1;
		var wheel = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
		var move = ((this.rP(c,4,1)-this.rP(c,5,1))*(this.scrollStep[c]/100)*wheel);
		var pos = (this.rP(c,5,0)-this.rP(c,4,0)) - move;
		setDimentions.call(this,pos,c,0);
	}
}

function refreshStretch(s){
	if(this.stretch[s]){
		setStyles(this.elements[s][2],[[this.stylesXY[s][1]]],[((this.rP(s,0,1)/this.rP(s,1,1))*100) + "%"]);
		} else {
			setStyles(this.elements[s][2],[[this.stylesXY[s][1]]],[null]);
			}
}

function getMouse(s){
	var mouseXY = s===0?"clientY":"clientX";
	var mouse = event[mouseXY]<this.rP(s,3,0) ? 0:event[mouseXY]>this.rP(s,3,0)+this.rP(s,3,1) ? this.rP(s,3,1):event[mouseXY]-this.rP(s,3,0);
	return mouse;		
}

function prepareToMove(s){
	var isOnside = !this.stretch[s] ? false:((getMouse.call(this,s)>=this.rP(s,5,0)-this.rP(s,4,0)) && (getMouse.call(this,s)<this.rP(s,5,0)+this.rP(s,5,1)-this.rP(s,4,0))) ? true:false;
	this.buttonClick = isOnside ? -(getMouse.call(this,s)-(this.rP(s,5,0)-this.rP(s,4,0))):-(this.rP(s,5,1)/2);
};

function setDimentions(pos,s,d){
	var o = [retMarg(this,s),this.elements[s][2],this.contentBox];
	var l = [[5,4,0,4,o[1],1,1,o[2]],[0,1,o[0],0,o[2],-1,5,o[1]]];
	var newPos = pos<0 ? 0:(pos+this.rP(s,l[d][0],1))>this.rP(s,l[d][1],1)+l[d][2] ? this.rP(s,l[d][1],1)-this.rP(s,l[d][0],1)+l[d][2]:pos;
	var newPosProc = (newPos/(this.rP(s,l[d][3],1)))*100;
	setStyles(l[d][4],[[this.stylesXY[s][0]]],[(l[d][5]*newPosProc) + "%"]);
	
	var total = ((this.rP(s,l[d][0],0)-this.rP(s,l[d][1],0))/(this.rP(s,l[d][1],1)+l[d][2]-this.rP(s,l[d][0],1)))*100;
	var proc = (((this.rP(s,l[1-d][3],1)-(this.rP(s,l[d][6],1)+l[1-d][2]))*total)/this.rP(s,l[1-d][3],1));
	setStyles(l[1-d][4],[[this.stylesXY[s][0]]],[proc + "%"]);
}

handyScroller.prototype.rP = function(side,object,property){
	var changedAr = this.elements[side].slice();
	var props = [["top","height","width"],["left","width","height"]];
	changedAr.unshift(this.mainBox,this.contentBox,this.wheelBox);
	return changedAr[object].getBoundingClientRect()[props[side][property]];
};

function setStyles(object,props,vals){
	for(var i=0;i<props.length;i++){
		object.style[props[i]] = vals[i];
	}
}

function retMarg(obj,s){
	return obj.scrollMargin[1-s] ? obj.rP(1-s,3,2):0;
}

function blockScroll(){
	var binded = blockMe.bind(this);
	var c = this.mainBox.children[0];
	c.addEventListener("scroll",binded);
	
	function blockMe(){
		if(c.scrollLeft!==0){
			b.call(this,1,c.scrollLeft);
			c.scrollLeft = 0;
		}
		if(c.scrollTop!==0){
			b.call(this,0,c.scrollTop);
			c.scrollTop = 0;
		}
	}
	function b(s,scroll){
		var pos = ((scroll)/(this.rP(s,1,1)-(this.rP(s,0,1))));
		console.log(this.rP(s,5,1));
		var butPx = (this.rP(s,4,1)-this.rP(s,5,1))*pos;							
		setDimentions.call(this,butPx,s,0);
	}
}

function positionContent(){
	
}