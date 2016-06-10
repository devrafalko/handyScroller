window.onload = function(){
	var newScroll = new handyScroller({
			box:document.getElementById("panelContent"),
			side: "xy",
			stretch:[false,true],
			inset:[false,false],
			divideCorner:[true,true],
			scrollMargin:[false,false],
			wheelOrient:"vertical",
			wheelX:10,
			scrollStep:[10,10]
	});
	var newScroll2 = new handyScroller({
			box:document.getElementById("innerContent"),
			side: "xy",
			stretch:[false,false],
			inset:[true,true],
			divideCorner:[true,true],
			scrollMargin:[false,false],
			wheelOrient:"horizontal",
			wheelX:30,
			scrollStep:[1,1]
	});
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
	this.xy = null;
	this.contentBox = null;
	this.wheelBox = null;
	this.scrollId = Date.now();
	
	this.elements = [[null,   //Area		this.elements[0][0]
					  null,   //Padding		this.elements[0][1]
					  null],  //Button		this.elements[0][2]
					 [null,   //Area		this.elements[1][0]
					  null,   //Padding		this.elements[1][1]
					  null]]; //Button		this.elements[1][2]
	
	validProperties.call(this);
	createBoxes.call(this);
	createWheelEvent.call(this);
	createScrolls.call(this);
	stretchButton.call(this);
	setScrollers.call(this);
	createWheelBox.call(this);
	blockScroll.call(this);
}

handyScroller.prototype.currentId = null;
handyScroller.prototype.buttonClick = null;
handyScroller.prototype.stylesXY = [["top","height","right","Y","width","scrollTop"],["left","width","bottom","X","height","scrollLeft"]];	//DODAĆ DO OUTEROBJECT

function validProperties(){
	if(this.side !=="xy"){
		var x = this.side==="x" ? 0:1;
		this.stretch[x] = false;
		this.divideCorner[1-x] = false;
		this.wheelOrient = null;
		this.wheelX = null;
		this.scrollStep[x] = null;
	}
	for(var x=0;x<2;x++){
		if(!this.inset[x]) {
			this.scrollMargin[x] = false;
		}
	}
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
	setStyles(this.contentBox,["position","margin","outline","border"],["relative","0","0","0"]);
}

function createWheelBox(){
	if((!isContentFit.call(this,0))&&(!isContentFit.call(this,1))&&(this.side==="xy")&&(this.wheelX!==0)){
		this.wheelBox = document.createElement("DIV");
		this.wheelBox.setAttribute("class","handyWheelBox");
		if(this.wheelOrient==="horizontal"){
			setStyles(this.wheelBox,["position","pointerEvents","bottom","height","boxSizing"],["absolute","none","0px",this.wheelX+"%","border-box"]);
			} else if(this.wheelOrient==="vertical"){
				setStyles(this.wheelBox,["position","pointerEvents","right","width","boxSizing"],["absolute","none","0px",this.wheelX+"%","border-box"]);
				}
		this.mainBox.insertBefore(this.wheelBox,this.elements[1][0]);
	}
}

function setScrollers(){
	if(this.side==="xy"){
		for(var x=0;x<2;x++){
			var outsetChip = !this.inset[1-x] ? this.rP(1-x,3,2):0;
			var scrollThick = this.divideCorner[x]&&(!isContentFit.call(this,1-x)) ? this.rP(1-x,3,2):0;
			var paddingProc = 100-(((scrollThick-outsetChip)/this.rP(x,3,1))*100);
			setStyles(this.elements[x][0],[[this.stylesXY[x][1]]],[paddingProc+"%"]);
		}
	}
	for(var x=0;x<2;x++){
		if(!this.inset[x]){
			console.log(this.inset[x]);
			setStyles(this.elements[x][0],[this.stylesXY[x][2]],[-this.rP(x,3,2)+"px"]);
		}
	}
}

function stretchButton(){
	var s = ["x","y"];
	for(var x=0;x<2;x++){
		if(isContentFit.call(this,x)||this.side===s[x]){
			setStyles(this.elements[x][0],["visibility"],["hidden"]);
			setStyles(this.elements[x][1],["cursor"],["default"]);
			this.scrollMargin[x] = false;
			this.inset[x] = true;
			} else {
				setStyles(this.elements[x][0],["visibility"],["visible"]);
				setStyles(this.elements[x][1],["cursor"],["pointer"]);
				if(this.stretch[x]){
					setStyles(this.elements[x][2],[[this.stylesXY[x][1]]],[((this.rP(x,0,1)/this.rP(x,1,1))*100) + "%"]);
					} else {
						setStyles(this.elements[x][2],[[this.stylesXY[x][1]]],[null]);
						}
				}
	}
}

function createScrolls(){
	for(var z=1;z>=0;z--){
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
			setStyles(this.elements[z][x],p[x],v[x]);
		}
		this.elements[z][1].appendChild(this.elements[z][2]);
		this.elements[z][0].appendChild(this.elements[z][1]);
		this.mainBox.appendChild(this.elements[z][0]);

		var bindedR = releaseMe.bind(this);
		var bindedS = scrollMove.bind(this);
		this.elements[z][1].addEventListener("mousedown",clickMe.bind(this,this.elements[z][1]));
		
		this.elements[z][2].ondragstart = function(e){
			 e.preventDefault();
		};
	}
	
		function clickMe(obj){
			var checkClass = obj.parentNode.getAttribute("class");
			this.xy = checkClass.charAt(checkClass.length-1)==="Y" ? 0:1;
			prepareToMove.call(this);
			scrollMove.call(this);
			prepareToMove.call(this);
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
}

function createWheelEvent(){
	var wheelMe = wheelScroll.bind(this);
	var bOver = mouseOverMe.bind(this);
	this.mainBox.addEventListener("wheel", wheelMe);
	this.mainBox.addEventListener("mouseover",bOver,true);
	this.mainBox.addEventListener("mouseout", mouseOutMe,true);
	
	function mouseOverMe(){
		window.onwheel=function(){return false;};
		window.onmousewheel=function(){return false;};
		this.constructor.prototype.currentId = this.scrollId;
	}
	
	function mouseOutMe(){
		window.onwheel=null;
		window.onmousewheel=null;		
	}
	
	function wheelScroll(){
		if(this.scrollId!==this.constructor.prototype.currentId || (isContentFit.call(this,0) && isContentFit.call(this,1))){
			return;
		}
		this.xy = (this.wheelOrient==="vertical") ? 1:0;
		this.xy = (this.side==="x"||isContentFit.call(this,0)) ? 1:(this.side==="y"||isContentFit.call(this,1)) ? 0:((getMouse.call(this)/this.rP(this.xy,0,1))*100)<(100-this.wheelX) ? 0:1;
		var wheel = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
		var move = ((this.rP(this.xy,4,1)-this.rP(this.xy,5,1))*(this.scrollStep[this.xy]/100)*wheel);
		var pos = (this.rP(this.xy,5,0)-this.rP(this.xy,4,0)) - move; 
		countMovements.call(this,pos);
	}
}

function getMouse(){
	var mouseXY = this.xy===0?"clientY":"clientX";
	var mouse = event[mouseXY]<this.rP(this.xy,3,0) ? 0:event[mouseXY]>this.rP(this.xy,3,0)+this.rP(this.xy,3,1) ? this.rP(this.xy,3,1):event[mouseXY]-this.rP(this.xy,3,0);
	return mouse;		
}

function scrollMove(){
	var pos = getMouse.call(this)+this.buttonClick;
	countMovements.call(this,pos);
}

function prepareToMove(){
	var isOnside = !this.stretch[this.xy] ? false:((getMouse.call(this)>=this.rP(this.xy,5,0)-this.rP(this.xy,4,0)) && (getMouse.call(this)<this.rP(this.xy,5,0)+this.rP(this.xy,5,1)-this.rP(this.xy,4,0))) ? true:false;
	this.buttonClick = isOnside ? -(getMouse.call(this)-(this.rP(this.xy,5,0)-this.rP(this.xy,4,0))):-(this.rP(this.xy,5,1)/2);
};

function blockScroll(){
	var binded = blockMe.bind(this);
	var cont = this.mainBox.children[0];
	cont.addEventListener("scroll",binded);
	function blockMe(){
		console.log("wywołuję");
		if(cont.scrollLeft!==0){
			countScroll.call(this,1,cont.scrollLeft);
			cont.scrollLeft = 0;
		}
		if(cont.scrollTop!==0){
			countScroll.call(this,0,cont.scrollTop);
			cont.scrollTop = 0;
		}
	}
}

function countScroll(xy,scroll){
	this.xy = xy;
	var margin = 0;
	var pos = ((scroll)/(this.rP(this.xy,1,1)-(this.rP(this.xy,0,1)-margin)));
	var butPx = (this.rP(this.xy,4,1)-this.rP(this.xy,5,1))*pos;							
	countMovements.call(this,butPx);
}

function countMovements(pos){
	var newPos = pos<0 ? 0:(pos+this.rP(this.xy,5,1))>this.rP(this.xy,4,1) ? this.rP(this.xy,4,1)-this.rP(this.xy,5,1):pos;
	var newPosProc = (newPos/this.rP(this.xy,4,1))*100;
	setStyles(this.elements[this.xy][2],[[this.stylesXY[this.xy][0]]],[newPosProc + "%"]);
	var scrollProc = (((this.rP(this.xy,5,0)-this.rP(this.xy,4,0))/(this.rP(this.xy,4,1)-this.rP(this.xy,5,1)))*100);
	var boxProc = (((this.rP(this.xy,0,1)-(this.rP(this.xy,1,1)+retMarg(this)))*scrollProc)/this.rP(this.xy,0,1));
	setStyles(this.contentBox,[[this.stylesXY[this.xy][0]]],[boxProc + "%"]);
}

handyScroller.prototype.rP = function(side,object,property){
	var changedAr = this.elements[side].slice();
	var props = [["top","height","width"],["left","width","height"]];
	changedAr.unshift(this.mainBox,this.contentBox,this.wheelBox);
	return changedAr[object].getBoundingClientRect()[props[side][property]];
};


function isContentFit(xy){
	var margin = this.scrollMargin[xy] ? this.rP(1-xy,3,2):0;
	return ((this.rP(xy,0,1)-margin)/this.rP(xy,1,1))>=1;
}

function setStyles(object,props,vals){
	for(var i=0;i<props.length;i++){
		object.style[props[i]] = vals[i];
	}
}

function retMarg(obj){
	return obj.scrollMargin[1-obj.xy] ? obj.rP(1-obj.xy,3,2):0;
}