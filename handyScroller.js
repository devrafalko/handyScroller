window.onload = function(){
	var newScroll = new handyScroller({
			box:document.getElementById("panelContent"),
			side: "xy",
			stretch:[true,true],
			divideCorner:[false,false],
			scrollMargin:[true,true],
			wheelOrient:"horizontally",
			wheelX:10,
			scrollStep:[1,1]
	});
	var newScroll2 = new handyScroller({
			box:document.getElementById("innerContent"),
			side: "xy",
			stretch:[false,false],
			divideCorner:[false,false],
			scrollMargin:[true,true],
			wheelOrient:"vertically",
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

	this.props = [[null,	 //boxTop			this.props[0][0]
				    null,	 //contentTop		this.props[0][1]
				    null,	 //areaTop			this.props[0][2]
				    null,	 //paddingTop		this.props[0][3]
				    null,	 //buttonTop		this.props[0][4]
				    null,	 //boxHeight		this.props[0][5]
				    null,	 //contentHeight	this.props[0][6]
				    null,	 //areaHeight		this.props[0][7]
				    null,	 //paddingHeight	this.props[0][8]
				    null],	 //buttonHeight		this.props[0][9]
				   [null,	 //boxLeft			this.props[1][0]
				    null,	 //contentLeft		this.props[1][1]
				    null,	 //areaLeft			this.props[1][2]
				    null,	 //paddingLeft		this.props[1][3]
				    null,	 //buttonLeft		this.props[1][4]
				    null,	 //boxWidth			this.props[1][5]
				    null,	 //contentWidth		this.props[1][6]
				    null,	 //areaWidth		this.props[1][7]
				    null,	 //paddingWidth		this.props[1][8]
				    null]];	 //buttonWidth		this.props[1][9]
	this.scrollThick = [null,null];
	this.scrollEv = [0,0];
	
	var x = this.side==="y"||this.side==="xy"||this.side==="yx"? 0:1;
	var y = this.side==="x"||this.side==="xy"||this.side==="yx" ? 2:1;
	
	createBoxes.call(this);
	createWheelEvent.call(this);
	for(;x<y;x++){
		this.xy = x;
		createScrolls.call(this);
		stretchButton.call(this);
		setPaddings.call(this);
	}
	createWheelBox.call(this);
	blockScroll.call(this);
}

handyScroller.prototype.currentId = null;
handyScroller.prototype.buttonClick = null;
handyScroller.prototype.stylesXY = [["top","height","right","Y","width","scrollTop"],["left","width","bottom","X","height","scrollLeft"]];

function createBoxes(){
	var innerObj = this.mainBox.childNodes;
	var isStatic = window.getComputedStyle(this.mainBox,null).getPropertyValue("position")!=="static"? ["position",null]:["position","relative"];
	setStyles(this.mainBox,["overflow",isStatic[0]],["hidden",isStatic[1]]);
	this.contentBox = document.createElement("DIV");
	this.contentBox.setAttribute("class","handyBox");
	setStyles(this.contentBox,["position"],["relative"]);
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
	
	setStyles(this.elements[this.xy][0],["position",this.stylesXY[this.xy][0],this.stylesXY[this.xy][2],this.stylesXY[this.xy][1],"boxSizing"],["absolute","0px","0px","100%","border-box"]);
	setStyles(this.elements[this.xy][1],["position","cursor","top","left","width","height","boxSizing","border","padding","margin"],["relative","pointer","0px","0px","100%","100%","border-box","0","0","0"]);
	setStyles(this.elements[this.xy][2],["position"],["relative"]);

	this.elements[this.xy][1].appendChild(this.elements[this.xy][2]);
	this.elements[this.xy][0].appendChild(this.elements[this.xy][1]);
	this.mainBox.appendChild(this.elements[this.xy][0]);

	var clickMe = clickMe.bind(this,this.elements[this.xy][1]);
	var releaseMe = releaseMe.bind(this);
	var scrollM = scrollMove.bind(this);

	this.elements[this.xy][1].addEventListener("mousedown",clickMe);
	this.refreshMe();
	
	function clickMe(obj){
		var checkClass = obj.parentNode.getAttribute("class");
		this.xy = checkClass.charAt(checkClass.length-1)==="Y" ? 0:1;
		prepareToMove.call(this);
		scrollMove.call(this);
		prepareToMove.call(this);
		document.body.addEventListener("mouseup",releaseMe);
		document.body.addEventListener("mousemove",scrollM);
		setStyles(document.body,["cursor"],["pointer"]);
		setStyles(this.contentBox,["webkitTouchCallout","webkitUserSelect","khtmlUserSelect","mozUserSelect","msUserSelect","oUserSelect","UserSelect"],["none","none","none","none","none","none","none"]);
	}

	function releaseMe(){
		document.body.removeEventListener("mouseup",releaseMe);
		document.body.removeEventListener("mousemove",scrollM);
		setStyles(document.body,["cursor"],["default"]);
		setStyles(this.contentBox,["webkitTouchCallout","webkitUserSelect","khtmlUserSelect","mozUserSelect","msUserSelect","oUserSelect","UserSelect"],["all","all","all","all","all","all","all"]);
	}
}

function createWheelBox(){
	if((!isContentFit.call(this,1))&&(this.side!=="y")&&(this.side!=="x")&&(this.wheelX!==0)){
		this.wheelBox = document.createElement("DIV");
		this.wheelBox.setAttribute("class","handyWheelBox");
		if(this.wheelOrient==="vertically"){
			setStyles(this.wheelBox,["position","pointerEvents","bottom","height"],["absolute","none","0px",this.wheelX+"%"]);
			} else {
				setStyles(this.wheelBox,["position","pointerEvents","right","width"],["absolute","none","0px",this.wheelX+"%"]);
				}
		this.mainBox.insertBefore(this.wheelBox,this.elements[0][0]);
	} else {
		this.wheelX = 0;
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
		if(this.scrollId!==this.constructor.prototype.currentId){
			return;
		}			
		
		this.xy = this.wheelOrient === "vertically" ? 0:1;
		var side = ((getMouse.call(this)/this.props[this.xy][5])*100)<(100-this.wheelX) ? 0:1;
		this.xy = this.side==="x" ? 1:this.side==="y" ? 0:side;
		if(isContentFit.call(this,this.xy)){
			return;
		}
		
		var e = window.event || e;
		var wheel = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
		var move = this.xy===0 ? ((window.innerHeight/100)*this.scrollStep[this.xy]):((window.innerWidth/100)*this.scrollStep[this.xy]);
		var pos = (this.props[this.xy][4]-this.props[this.xy][3]) - wheel*move;
		countMovements.call(this,pos);
	}
}

function getMouse(){
	var mouseXY = this.xy===0?"clientY":"clientX";
	this.refreshMe();
	var mouse = event[mouseXY]<this.props[this.xy][3] ? 0:event[mouseXY]>this.props[this.xy][3]+this.props[this.xy][8] ? this.props[this.xy][8]:event[mouseXY]-this.props[this.xy][3];
	return mouse;
}

function scrollMove(){
	var pos = getMouse.call(this)+this.buttonClick;
	countMovements.call(this,pos);
}

function blockScroll(){
	var binded = blockMe.bind(this);
	this.mainBox.addEventListener("scroll",binded);
	
	function blockMe(){
		if(this.mainBox.scrollLeft!==0){
			countScroll.call(this,1,this.mainBox.scrollLeft);
			this.mainBox.scrollLeft = 0;
		}
		if(this.mainBox.scrollTop!==0){
			countScroll.call(this,0,this.mainBox.scrollTop);
			this.mainBox.scrollTop = 0;
		}
	}
}

function countScroll(xy,scroll){
	this.xy = xy;
	this.refreshMe();
	var scrollMargin = this.xy===0 && this.scrollMargin[this.xy] ? this.scrollThick:[0,0];
	var pos = ((scroll)/(this.props[this.xy][6]+scrollMargin[this.xy]-(this.props[this.xy][5])));
	var butPx = (this.props[this.xy][8]-this.props[this.xy][9])*pos;
	countMovements.call(this,butPx);
}

function countMovements(pos){
	var newPos = pos<0 ? 0:(pos+this.props[this.xy][9])>this.props[this.xy][8] ? this.props[this.xy][8]-this.props[this.xy][9]:pos;
	var newPosProc = (newPos/this.props[this.xy][8])*100;
	setStyles(this.elements[this.xy][2],[[this.stylesXY[this.xy][0]]],[newPosProc + "%"]);
	this.refreshMe();
	var scrollMargin = this.scrollMargin[this.xy] ? this.scrollThick:[0,0];
	var scrollProc = (((this.props[this.xy][4]-this.props[this.xy][3])/(this.props[this.xy][8]-this.props[this.xy][9]))*100);
	var boxProc = -(((this.props[this.xy][6]+scrollMargin[this.xy]-this.props[this.xy][5])/this.props[this.xy][5])*scrollProc);
	setStyles(this.contentBox,[[this.stylesXY[this.xy][0]]],[boxProc + "%"]);
}

handyScroller.prototype.refreshMe = function(){
	var changedAr = this.elements[this.xy].slice();
	changedAr.unshift(this.mainBox,this.contentBox);
	for(var x=0,y=0,z=0;x<this.props[this.xy].length;x++){
		this.props[this.xy][x] = changedAr[y].getBoundingClientRect()[this.stylesXY[this.xy][z]];
		y = y===changedAr.length-1 ? 0:++y;
		z = x===(this.props[this.xy].length/2)-1 ? ++z:z;
	};
	this.scrollThick[1-this.xy] = this.elements[this.xy][0].getBoundingClientRect()[this.stylesXY[this.xy][4]];
};

function prepareToMove(){
	this.refreshMe();
	var isOnside = !this.stretch[this.xy] ? false:((getMouse.call(this)>=this.props[this.xy][4]-this.props[this.xy][3]) && (getMouse.call(this)<this.props[this.xy][4]+this.props[this.xy][9]-this.props[this.xy][3])) ? true:false;
	this.buttonClick = isOnside ? -(getMouse.call(this)-(this.props[this.xy][4]-this.props[this.xy][3])):-(this.props[this.xy][9]/2);
};


function isContentFit(xy){
	return (this.props[xy][5]/this.props[xy][6])>=1;
}

function stretchButton(){
	if(isContentFit.call(this,this.xy)){
		setStyles(this.elements[this.xy][0],["opacity"],["0"]);
		setStyles(this.elements[this.xy][1],["cursor"],["default"]);
		
		} else {
			setStyles(this.elements[this.xy][0],["opacity"],["1"]);
			setStyles(this.elements[this.xy][1],["cursor"],["pointer"]);
			if(this.stretch[this.xy]){
				setStyles(this.elements[this.xy][2],[[this.stylesXY[this.xy][1]]],[((this.props[this.xy][5]/this.props[this.xy][6])*100) + "%"]);
				this.refreshMe();
				} else {
					setStyles(this.elements[this.xy][2],[[this.stylesXY[this.xy][1]]],[null]);
					}
			}
}

function setPaddings(){
	var scrollThick = this.divideCorner[this.xy] ? this.scrollThick:[0,0];
	var paddingProc = 100-((scrollThick[this.xy]/this.props[this.xy][7])*100);
	setStyles(this.elements[this.xy][0],[[this.stylesXY[this.xy][1]]],[paddingProc+"%"]);
	this.refreshMe();
}

function setStyles(object,props,vals){
	for(var i=0;i<props.length;i++){
		object.style[props[i]] = vals[i];
	}
}