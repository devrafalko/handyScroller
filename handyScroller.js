window.onload = function(e){
	var newScroll = new handyScroller({
			box:document.getElementById("panelContent"),
			side: "xy",
			inset:[true,true],
			scrollMargin:[false,false],
			stretch:[true,true],
			divideCorner:[true,true],
			wheelOrient:"vertical",
			wheelX:10,
			scrollStep:[10,10],
			scrollAlign:[0,0,0,0]
	});

	var newScroll2 = new handyScroller({
			box:document.getElementById("innerContent"),
			side: "xy",
			stretch:[true,true],
			inset:[true,true],
			divideCorner:[true,true],
			scrollMargin:[true,true],
			wheelOrient:"horizontal",
			wheelX:30,
			scrollStep:[1,1],
			scrollAlign:[0,0,0,0]
	});

	var newScroll3 = new handyScroller({
			box:document.getElementById("newInner"),
			side: "xy",
			stretch:[false,false],
			inset:[true,true],
			divideCorner:[true,true],
			scrollMargin:[true,true],
			wheelOrient:"vertical",
			wheelX:30,
			scrollStep:[1,1],
			scrollAlign:[0,0,0,0]
	});
};

function handyScroller(o){
	this.args = o;
	this.stretch = o.stretch;
	this.divideCorner = o.divideCorner;
	this.scrollMargin = o.scrollMargin;
	this.side = o.side;
	this.scrollStep = o.scrollStep;
	this.wheelOrient = o.wheelOrient;
	this.wheelX = o.wheelX;
	this.mainBox = o.box;
	this.inset = o.inset;
	this.scrollAlign = o.scrollAlign;
	this.contentBox = null;
	this.wheelBox = null;
	this.wheelEvent = false;
	this.contentScroll = [0,0];
	this.scrollId = Date.now();
	this.elements = [[null,   //Area		this.elements[0][0]
					  null,   //Padding		this.elements[0][1]
					  null],  //Button		this.elements[0][2]
					 [null,   //Area		this.elements[1][0]
					  null,   //Padding		this.elements[1][1]
					  null]]; //Button		this.elements[1][2]
	this.wheelXY = [false,false];
	this.currentDims = [];
	this.constructor.prototype.objectList.push(this);

	createBoxes.call(this);
	validation.call(this);
	blockScroll.call(this);
	hashDetector.call(this);
	autoRefresh.call(this);
}

handyScroller.prototype.objectList = [];
handyScroller.prototype.currentId = null;
handyScroller.prototype.hashEvents = false;
handyScroller.prototype.buttonClick = null;
handyScroller.prototype.stylesXY = [["top","height","right","Y","width","scrollTop"],["left","width","bottom","X","height","scrollLeft"]];

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
	
	for(x in b){
		if(!!this.elements[x][0]){
			setDimentions.call(this,this.contentScroll[x],x,1);
		}
	}
	setWheelEvent.call(this);
}

function createBoxes(){
	this.mainBox.classList.add("handyContainer");
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
	this.scrollMargin = this.args.scrollMargin.slice();
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
				window.addEventListener("mouseup",bindedR);
				window.addEventListener("mousemove",bindedS);
				setStyles(document.body,["cursor"],["pointer"]);
				setStyles(this.contentBox,["webkitTouchCallout","webkitUserSelect","khtmlUserSelect","mozUserSelect","msUserSelect","oUserSelect","UserSelect"],["none","none","none","none","none","none","none"]);
			}
			
			function releaseMe(){
				window.removeEventListener("mouseup",bindedR);
				window.removeEventListener("mousemove",bindedS);
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
		var paddingProc = 100-(((-a+d)/this.rP(s,3,1))*100);
		setStyles(this.elements[s][0],[[this.stylesXY[s][1]]],[paddingProc+"%"]);
	}
	if(!this.inset[s]){
		setStyles(this.elements[s][0],[this.stylesXY[s][2]],[-this.rP(s,3,2)+"px"]);
	}
}

function setWheelEvent(){
	var e = this.elements;
	var newBind = wheelScroll.bind(this);
	if(this.wheelEvent===false){
		this.mainBox.addEventListener("wheel", newBind);
		this.wheelEvent = true;
		}
	
	function wheelScroll(){
		var s = e[0][0]&&e[1][0]? 2:e[0][0]?0:e[1][0]?1:-1;
		if(this.scrollId!==this.constructor.prototype.currentId||s===-1){
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
	var newPx = pos<0 ? 0:(pos+this.rP(s,l[d][0],1))>this.rP(s,l[d][1],1)+l[d][2] ? this.rP(s,l[d][1],1)-this.rP(s,l[d][0],1)+l[d][2]:pos;
	var newProc = (newPx/(this.rP(s,l[d][3],1)))*100;
	var setUnit = !d ? [newProc,"%"]:[newPx,"px"];
	setStyles(l[d][4],[[this.stylesXY[s][0]]],[(l[d][5]*setUnit[0]) + setUnit[1]]);
	
	var total = ((this.rP(s,l[d][0],0)-this.rP(s,l[d][1],0))/(this.rP(s,l[d][1],1)+l[d][2]-this.rP(s,l[d][0],1)))*100;
	var proc = (((this.rP(s,l[1-d][3],1)-(this.rP(s,l[d][6],1)+l[1-d][2]))*total)/100);
	setStyles(l[1-d][4],[[this.stylesXY[s][0]]],[proc + "px"]);
	
	this.contentScroll[s] = d ? newPx:-proc;
}

handyScroller.prototype.rP = function(side,object,property){
	var changedAr = this.elements[side].slice();
	var props = [["top","height","width"],["left","width","height"]];
	changedAr.unshift(this.mainBox,this.contentBox,this.wheelBox);
	var obj = typeof object === "number" ? changedAr[object]:object;
	return obj.getBoundingClientRect()[props[side][property]];
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
	var c = this.mainBox.children[0];
	var scrollB = blockMe.bind(this);
	c.addEventListener("scroll",scrollB);
	function blockMe(){
		if(c.scrollLeft!==0){
		c.scrollLeft = 0;
		}
		if(c.scrollTop!==0){
		c.scrollTop = 0;
		}
	}
}

function hashDetector(){
	if(!this.hashEvents){
		this.constructor.prototype.hashEvents = true;
		window.addEventListener("click",detectClickHash);
	}

	var hash = document.getElementById(location.hash.slice(1));
	if(hash) getHashObjects(document.body,hash);
	
	function detectClickHash(e){
		if(e.target.nodeName !== "A") return;
		if(!e.target.getAttribute("href")) return;
		if(e.target.getAttribute("href").charCodeAt(0)!==35) return;
		var hashElem = document.getElementById(e.target.getAttribute("href").slice(1));
		getHashObjects(e.target,hashElem);
	}
	
	function getHashObjects(target,hash){
		var x = [target,hash];
		var nL = [[],[]];
		for(var y=1;y>=0;y--){
			while(x[y]!==null){
				if(x[y].getAttribute("class")==="handyContainer"){
					nL[y].push(x[y]);
				}
				x[y] = x[y].parentElement;
			}
			if(nL[1].length===0) return;
			nL[y].reverse();
			nL[y].forEach(getHandyObject);
		}
			function getHandyObject(curr,ind,arr){
				var objL = handyScroller.prototype.objectList;
				for(var x=0;x<objL.length;x++){
					if(curr.id===objL[x].mainBox.id){
						arr[ind] = objL[x];
						}
					}
				}
		var nnL;
		if(nL[0][0] === nL[1][0]){
			var spl=0;
			for(var bb=1;bb<nL[1].length;bb++){
				if(nL[1][bb]===nL[0][bb]){
					spl = bb;
					} else {
						break;
						}
			}
			nnL = nL[1].slice(spl);
			} else {
				nnL = nL[1].slice();
				}
		alignBoxes(nnL,hash);
	}
}

function alignBoxes(boxList,hashElem){
	for(var rr=0;rr<2;rr++){
		for(var ss=0;ss<boxList.length;ss++){
			if(boxList[ss].elements[rr][0]===null) continue;
			setDimentions.call(boxList[ss],0,rr,1);
		}
	}
	
	function cM(side,object){
		var obj = boxList[object].elements[1-side][0]; 
		return boxList[object].scrollMargin[1-side] ? fB.rP(side,obj,1):0;
	}	
	
	var fB = boxList[0];
	boxList.reverse();
	for(var xx=0;xx<2;xx++){
		var destT = fB.rP(xx,0,0)+((fB.rP(xx,0,1)-cM(xx,0))*(boxList[0].scrollAlign[xx*2]/100)) + (fB.rP(xx,hashElem,1)*(boxList[0].scrollAlign[xx*2+1]/100));
		console.log(destT);
		var vOT = hashElem;
		var vOB = hashElem;
		
		for(var x=0;x<boxList.length;x++){
			if(boxList[x].elements[xx][0]===null) continue;
			
			var move;
			var cB = boxList[x]; 
			var vT = fB.rP(xx,vOT,0);
			var vB = fB.rP(xx,vOB,0) + fB.rP(xx,vOB,1);
			
			if((x===boxList.length-1)||(destT>=cB.rP(xx,0,0)&&destT+fB.rP(xx,hashElem,1)<=(cB.rP(xx,0,0)+cB.rP(xx,0,1)))){
				move = (cB.rP(xx,0,0)-cB.rP(xx,1,0)) + (vT - destT);
				setDimentions.call(boxList[x],move,xx,1);
				} else {
					var tV = Math.abs(cB.rP(xx,0,0)-destT);
					var bV = Math.abs((cB.rP(xx,0,0)+cB.rP(xx,0,1)-cM(xx,x))-destT+fB.rP(xx,hashElem,1));
					move = tV<=bV ? vT-cB.rP(xx,1,0):(vB-cB.rP(xx,1,0))-cB.rP(xx,0,1)+cM(xx,x);
					var scr = tV<=bV ? cB.rP(xx,0,0)-vT:(cB.rP(xx,0,0)+cB.rP(xx,0,1))-vB-cM(xx,x);
					vOT = (vT+scr)<cB.rP(xx,0,0) ? boxList[x].mainBox:vOT;
					vOB = (vB+scr)>(cB.rP(xx,0,0)+cB.rP(xx,0,1)) ? boxList[x].mainBox:vOB;
					setDimentions.call(boxList[x],move,xx,1);
					}
		}
	}
}

function autoRefresh(){
	var bRM = this.refreshMe.bind(this);
	this.refreshMe = bRM;
	window.addEventListener("resize",bRM);
	if(window.MutationObserver){
		var observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mRec) {
				bRM();
			});
		});
		var target = this.contentBox;
		var target2 = this.mainBox;
		observer.observe(target, {childList:true, attributes:true, characterData:true, subtree:true});
		observer.observe(target2, {attributes:true, characterData:true});
		} else if(window.MutationEvent) {
			var eA = ["DOMAttrModified","DOMAttributeNameChanged","DOMCharacterDataModified","DOMElementNameChanged","DOMNodeInserted","DOMNodeRemoved"];
					//"DOMSubtreeModified","DOMNodeInsertedIntoDocument","DOMNodeRemovedFromDocument","onpropertychange"
			for(var i in eA){
				this.mainBox.addEventListener(eA[i],bRM);
				}
			};
}

handyScroller.prototype.refreshMe = function(){
	var m = this.mainBox.getBoundingClientRect();
	var c = this.contentBox.getBoundingClientRect();
	var n = [m.height,m.width,c.height,c.width];
	var p = this.currentDims;
	if(n[0]!==p[0]||n[1]!==p[1]||n[2]!==p[2]||n[3]!==p[3]){
		validation.call(this);
		this.currentDims = n.slice();
	}
};


function positionContent(){
	
}



function move(e,state){
	var obj = document.getElementById("ruchomyDiv");
	var style = !state ? "width":"height";
	obj.style[style] = e.target.value + "px";
}

function addBox(side){
	var s = side===0 ? "toRight":side===1 ? "toBottom":s;
	var container = document.getElementById(s);
	var newElem = document.createElement("DIV");
	newElem.className = s;
	container.appendChild(newElem);
}