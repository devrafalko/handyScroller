window.onload = function(){
	var newScroll = new handyScroller({
			box:document.getElementById("panelContent"),
			side: "xy",
			stretch:true,
			divideCorner:true,
			wheelX:30,
			scrollStep:[1,1]
	});
};

function handyScroller(o){
	this.stretch = o.stretch;
	this.buttonClick = null;
	this.divideCorner = o.divideCorner;
	this.side = o.side;
	this.xy = null;
	this.scrollStep = o.scrollStep;
	this.wheelX = o.wheelX;
	this.stylesXY = [["top","height","right","Y","width"],["left","width","bottom","X","height"]];
	this.mainBox = o.box;
	this.contentBox = null;
	this.wheelBox = null;
	this.elements = [[null,  //0: Area		this.elementsY[0]
					  null,  //1: Padding	this.elementsY[1]
					  null], //2: Button	this.elementsY[2]
					 [null,  //0: Area		this.elementsX[0]
					  null,  //1: Padding	this.elementsX[1]
					  null]]; //2: Button	this.elementsX[2]

	this.props = [[null,	 //0: boxTop			this.propsY[0]
				    null,	 //1: contentTop		this.propsY[1]
				    null,	 //2: areaTop			this.propsY[2]
				    null,	 //3: paddingTop		this.propsY[3]
				    null,	 //4: buttonTop			this.propsY[4]
				    null,	 //5: boxHeight			this.propsY[5]
				    null,	 //6: contentHeight		this.propsY[6]
				    null,	 //7: areaHeight		this.propsY[7]
				    null,	 //8: paddingHeight		this.propsY[8]
				    null],	 //9: buttonHeight		this.propsY[9]
				   [null,	 //0: boxLeft			this.propsX[0]
				    null,	 //1: contentLeft		this.propsX[1]
				    null,	 //2: areaLeft			this.propsX[2]
				    null,	 //3: paddingLeft		this.propsX[3]
				    null,	 //4: buttonLeft		this.propsX[4]
				    null,	 //5: boxWidth			this.propsX[5]
				    null,	 //6: contentWidth		this.propsX[6]
				    null,	 //7: areaWidth			this.propsX[7]
				    null,	 //8: paddingWidth		this.propsX[8]
				    null]];	 //9: buttonWidth		this.propsX[9]
	this.scrollThick = [null,null];
	var x = this.side==="y"||this.side==="xy"||this.side==="yx"? 0:1;
	var y = this.side==="x"||this.side==="xy"||this.side==="yx" ? 2:1;
	
	createBoxes.call(this);
	createWheelEvent.call(this);
	for(;x<y;x++){
		this.xy = x;
		createScrolls.call(this);
		this.refreshMe();
		this.stretchButton();
		this.setPaddings();
	}
	createWheelBox.call(this);
}

function createBoxes(){
	var innerObj = this.mainBox.children;
	var isStatic = window.getComputedStyle(this.mainBox,null).getPropertyValue("position")!=="static"? "":"position:relative;";

	this.mainBox.style = "overflow:hidden;"+isStatic;
	
	this.contentBox = document.createElement("DIV");
	this.contentBox.setAttribute("class","handyBox");
	this.contentBox.style = "position:relative";
	for(;innerObj.length!==0;){
		this.contentBox.appendChild(innerObj[0]);
	}
	this.mainBox.appendChild(this.contentBox);
}

function createScrolls(){
	this.elements[this.xy][0] = document.createElement("DIV");
	this.elements[this.xy][1] = document.createElement("DIV");
	this.elements[this.xy][2] = document.createElement("DIV");

	this.elements[this.xy][0].setAttribute("class","handyScrollBox"+this.stylesXY[this.xy][3]);
	this.elements[this.xy][1].setAttribute("class","handyScrollArea"+this.stylesXY[this.xy][3]);
	this.elements[this.xy][2].setAttribute("class","handyScroller"+this.stylesXY[this.xy][3]);
	this.elements[this.xy][0].style = "position:absolute;"+this.stylesXY[this.xy][0]+":0px;"+this.stylesXY[this.xy][2]+":0px;"+this.stylesXY[this.xy][1]+":100%;box-sizing:border-box";
	this.elements[this.xy][1].style= "position:relative;cursor:pointer;top:0px;left:0px;width:100%;height:100%;box-sizing:border-box;border:0;padding:0;margin:0";
	this.elements[this.xy][2].style = "position:relative";

	this.elements[this.xy][1].appendChild(this.elements[this.xy][2]);
	this.elements[this.xy][0].appendChild(this.elements[this.xy][1]);
	this.mainBox.appendChild(this.elements[this.xy][0]);

	var clickMe = clickMe.bind(this,this.elements[this.xy][1]);
	var releaseMe = releaseMe.bind(this);
	var scrollMove = this.scrollMove.bind(this);

	this.elements[this.xy][1].addEventListener("mousedown",clickMe);

	function clickMe(obj){
		var checkClass = obj.parentNode.getAttribute("class");
		this.xy = checkClass.charAt(checkClass.length-1)==="Y" ? 0:1;
		this.refreshMe();
		this.prepareToMove();
		this.scrollMove();
		this.refreshMe();
		this.prepareToMove();
		document.body.addEventListener("mouseup",releaseMe);
		document.body.addEventListener("mousemove",scrollMove);
		document.body.style.cursor = "pointer";
	}

	function releaseMe(){
		document.body.removeEventListener("mouseup",releaseMe);
		document.body.removeEventListener("mousemove",scrollMove);
		document.body.style.cursor = "default";
	}
}

function createWheelBox(){
	if((!this.isContentFit(1))&&(this.side!=="y")){
		this.wheelBox = document.createElement("DIV");
		this.wheelBox.setAttribute("class","handyWheelBox");
		this.wheelBox.style = "position:absolute;right:0px;width:"+this.wheelX+"%;";
		this.mainBox.appendChild(this.wheelBox);
	}	
}

function createWheelEvent(){
	var wheelMe = wheelScroll.bind(this);	
	this.mainBox.addEventListener("wheel", wheelMe);
	this.mainBox.addEventListener("mouseover", mouseOverMe);
	this.mainBox.addEventListener("mouseout", mouseOutMe);
	
	function mouseOverMe(){
		window.onwheel=function(){return false;};
		window.onmousewheel=function(){return false;};
	}
	
	function mouseOutMe(){
		window.onwheel=null;
		window.onmousewheel=null;		
	}
	
	function wheelScroll(){
		this.xy = 1;
		var side = ((this.getMouse()/this.props[1][5])*100)<(100-this.wheelX) ? 0:1;
		this.xy = side;
		
		if(this.isContentFit(this.xy)){
			return;
		}
		
		var e = window.event || e;
		var wheel = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
		var move = this.xy===0 ? ((window.innerHeight/100)*this.scrollStep[this.xy]):((window.innerWidth/100)*this.scrollStep[this.xy]);
		var pos = (this.props[this.xy][4]-this.props[this.xy][3]) - wheel*move;
		
		countMovements.call(this,pos);
	}
}

handyScroller.prototype.scrollMove = function(){
	var pos = this.getMouse()+this.buttonClick;
	countMovements.call(this,pos);
};

function countMovements(pos){
	var newPos = pos<0 ? 0:(pos+this.props[this.xy][9])>this.props[this.xy][8] ? this.props[this.xy][8]-this.props[this.xy][9]:pos;
	var newPosProc = (newPos/this.props[this.xy][8])*100;
	this.elements[this.xy][2].style[this.stylesXY[this.xy][0]] = newPosProc + "%";
	this.refreshMe();
	
	var scrollProc = (((this.props[this.xy][4]-this.props[this.xy][3])/(this.props[this.xy][8]-this.props[this.xy][9]))*100);
	var boxProc = -(((this.props[this.xy][6]-this.props[this.xy][5])/this.props[this.xy][5])*scrollProc);
	this.contentBox.style[this.stylesXY[this.xy][0]] = boxProc + "%";
}

handyScroller.prototype.refreshMe = function(){
	var changedAr = this.elements[this.xy].slice();
	changedAr.unshift(this.mainBox,this.contentBox);
	for(var x=0,y=0,z=0;x<this.props[this.xy].length;x++){
		this.props[this.xy][x] = changedAr[y].getBoundingClientRect()[this.stylesXY[this.xy][z]];
		y = y===changedAr.length-1 ? 0:++y;
		z = x===(this.props[this.xy].length/2)-1 ? ++z:z;
	};
	this.scrollThick[this.xy] = this.elements[this.xy][0].getBoundingClientRect()[this.stylesXY[this.xy][4]];
};

handyScroller.prototype.prepareToMove = function(){
	var isOnside = !this.stretch ? false:((this.getMouse()>=this.props[this.xy][4]-this.props[this.xy][3]) && (this.getMouse()<this.props[this.xy][4]+this.props[this.xy][9]-this.props[this.xy][3])) ? true:false;
	this.buttonClick = isOnside ? -(this.getMouse()-(this.props[this.xy][4]-this.props[this.xy][3])):-(this.props[this.xy][9]/2);
};

handyScroller.prototype.getMouse = function(){
	var mouseXY = this.xy===0?"clientY":"clientX";
	var mouse = event[mouseXY]<this.props[this.xy][3] ? 0:event[mouseXY]>this.props[this.xy][3]+this.props[this.xy][8] ? this.props[this.xy][8]:event[mouseXY]-this.props[this.xy][3];
	return mouse;
};

handyScroller.prototype.isContentFit = function(xy){
	return (this.props[xy][5]/this.props[xy][6])>=1;
};

handyScroller.prototype.stretchButton = function(){
	if(this.isContentFit(this.xy)){
		this.elements[this.xy][0].style.opacity = "0";
		this.elements[this.xy][1].style.cursor = "default";
		} else {
			this.elements[this.xy][0].style.opacity = "1";
			this.elements[this.xy][1].style.cursor = "pointer";
			if(this.stretch){
				this.elements[this.xy][2].style[this.stylesXY[this.xy][1]] = ((this.props[this.xy][5]/this.props[this.xy][6])*100) + "%";
				} else {
					this.elements[this.xy][2].style[this.stylesXY[this.xy][1]] = null;
					}
			}
};

handyScroller.prototype.setPaddings = function(){
	this.scrollThick = this.divideCorner ? this.scrollThick:[0,0];
	var paddingProc = 100-((this.scrollThick[this.xy]/this.props[this.xy][7])*100);
	this.elements[this.xy][0].style[this.stylesXY[this.xy][1]] = paddingProc+"%";
};