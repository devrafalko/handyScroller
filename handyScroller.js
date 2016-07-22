window.onload = function(e){
	var newScroll = new handyScroller({
			box:document.getElementById("panelContent"),
			side: "xy",
			inset:[true,true],
			scrollMargin:[true,true],
			stretch:[true,true],
			divideCorner:[true,true],
			wheelOrient:"vertical",
			wheelX:10,
			scrollStep:[2,2],
			scrollAlign:[100,-100,0,0],
			wheelToID:[false,true],
			scrollToID:[false,true],
			edgesID:[true,false],
			wheelBlockTime:150,	//set 150 as default
			parentScroll:[true,true],
			scrollHide: 2000
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
	this.wheelToID = o.wheelToID;
	this.scrollToID = o.scrollToID;
	this.edgesID = o.edgesID;
	this.wheelBlockTime = o.wheelBlockTime;
	this.pScroll = o.parentScroll;
	this.sHide = o.scrollHide;
	this.contentBox = null;
	this.wheelBox = null;
	this.contentScroll = [0,0];
	this.elements = [[null,   //Area		this.elements[0][0]
					  null,   //Padding		this.elements[0][1]
					  null],  //Button		this.elements[0][2]
					 [null,   //Area		this.elements[1][0]
					  null,   //Padding		this.elements[1][1]
					  null]]; //Button		this.elements[1][2]
	this.currentDims = [];
	this.refreshMe = null;
	this.handyIDs = [];
	this.handyIDpos =[];
	this.actID = null;
	this.scrollEv = 1;
	this.blockWheel = false;
	this.sTimeout = [null,null];
	this.constructor.prototype.objectList.push(this);
	createBoxes.call(this);
	bindPrototyped.call(this);
	validation.call(this);
	findMyIds.call(this);
	blockScroll.call(this);
	hashDetector.call(this);
	autoRefresh.call(this);
	scrSt.initScrollDetector(1);
}

handyScroller.prototype.objectList = [];
handyScroller.prototype.hashEvents = false;
handyScroller.prototype.buttonClick = null;
handyScroller.prototype.stylesXY = [["top","height","right","Y","width","scrollTop"],["left","width","bottom","X","height","scrollLeft"]];
handyScroller.prototype.currentScrollAlign = null;

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
			setDimensions.call(this,this.contentScroll[x],x,1);
		}
	}
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

var scrSt = {	
	isInit:false,				
	hChild: null,		
	hasHanPar: null,		
	initScrollDetector:function(sT){
		if(this.isInit&&sT) return;
		this.isInit = true;
		var evA = ["mousemove","wheel"];
		var ac = ["removeEventListener","addEventListener"];
		
		for(var i in ac){
			window[ac[sT]](evA[i],this.initMe);
		}
	},
	initMe:function(){
		scrSt.initScrollDetector(0);
		scrSt.findScrollbars(event.target);
		window.addEventListener("mouseover",function(){
			scrSt.findScrollbars(event.target);
		});
	},
	findScrollbars:function(ob,hP){
		var rV = null;
		while(ob!==null){
			if(scrSt.hChild!==null&&!hP){
				if(scrSt.hChild.elem===ob){
					return;
				}
			}
			if(ob.classList.contains("handyContainer")){
				var obA = handyScroller.prototype.objectList;
				for(var i in obA){
					if(ob===obA[i].mainBox){
						rV = {elem:ob,type:1,object:obA[i]};
					}
				}
				break;
			}
			if(((ob.clientHeight!==ob.scrollHeight)||(ob.clientWidth!==ob.scrollWidth))&&!hP){
				if((ob.clientHeight!==offset(0))||(ob.clientWidth!==offset(1))){
					rV = {elem:ob,type:2};
					break;				
				}
			}
			ob = ob.parentElement;
		}
		if(!hP){
			scrSt.hChild = rV;
			if(rV.type===1){
				scrSt.onScrDetect(1);
				} else if(rV.type===2){
					scrSt.onScrDetect(0);
					scrSt.findScrollbars(rV.elem.parentElement,true);
					}
			} else {
				scrSt.hasHanPar = rV;
				}
		
			function offset(s){
				var oH = ob.offsetHeight - (gOS("border-top-width")+gOS("border-bottom-width"));
				var oW = ob.offsetWidth - (gOS("border-left-width")+gOS("border-right-width"));
				return s ? oW:oH;
					function gOS(pR){
						var obStyles = getComputedStyle(ob);
						return parseFloat(obStyles.getPropertyValue(pR));
					}			
			}
	},
	onScrDetect:function(st){
		var a = ["addEventListener","removeEventListener"];
		var eV = ["wheel","keydown"];
		var fN = [scrSt.detectDefWheel,scrSt.detectHandyWheel];
		for(var i=0;i<2;i++){
			window[a[i]](eV[0],fN[Math.abs(st-i)]);
			window[a[i]](eV[1],fN[Math.abs(st-i)]);
		}
	},
	detectDefWheel:function(){
		if(scrSt.hasHanPar===null)return;
		var el = scrSt.hChild.elem;
		switch(event.type){
			case "wheel":
				var wH = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
				if(((wH===1)&&el.scrollTop===0)||((wH===-1)&&(el.scrollTop+el.clientHeight===el.scrollHeight))){
					event.preventDefault();
				}
				break;
			case "keydown":
				var aP = scrSt.isArrowPressed();
				if(aP) event.preventDefault();
				var hS = scrSt.hasHanPar.object.scrollStep;
				var move = aP[1] === "u" || aP[1] === "l" ? -1:1;				
				var side = aP[1] === "u" || aP[1] === "d" ? 0:1;
				var step = ([el.scrollHeight,el.scrollWidth][side]-[el.clientHeight,el.clientWidth][side])*(hS[side]/100);
				step = Math.round(step) === 0 ? Math.ceil(step):Math.round(step);
				el[["scrollTop","scrollLeft"][side]] += step*move;
				break;
		}
	},
	detectHandyWheel:function(){
		var that = scrSt.hChild.object;
		switch(event.type){
			case "wheel":
				event.preventDefault();
				if(that.blockWheel) return;
				var e = that.elements;
				var s = e[0][0]&&e[1][0]? 2:e[0][0]?0:e[1][0]?1:-1;
				if(s===-1) return;
				var wO = that.wheelOrient==="vertical" ? 1:0;
				var nS = s!==2?s:((getMouse.call(that,wO)/that.rP(wO,0,1))*100)<(100-that.wheelX) ? 0:1;
				var wH = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
				moveByNav.call(that,nS,wH);				
				break;
			case "keydown":
				scrSt.isArrowPressed(function(a,b){
					event.preventDefault();
					moveByNav.call(that,a,b);
				});	
				break;
		}
		function moveByNav(s,d){
			setVisib.call(this,true,s);
			setVisib.call(this,false,s);
			if(setIDsDims.call(this,s,1)){
				findNearestId.call(this,s,d);
				this.blockWheel = true;
				var sT = this.wheelBlockTime;
				window.setTimeout(function(){
					arguments[0].blockWheel = false;
				},sT,this);
				} else {
					this.actID = null;
					setDimensions.call(this,{s:d},s,0,false,this.pScroll[s]);
					}		
		}		
	},
	isArrowPressed:function(){
		var aD = ["ArrowDown","ArrowUp","ArrowRight","ArrowLeft"," "];
		var aIE = ["Down","Up","Right","Left","Spacebar"];
		var aR = ["d","u","r","l","s"];
		for(var i=0;i<5;i++){
			if(event.key === aD[i] || event.key === aIE[i]){
				if(typeof arguments[0]==="function"){
					var a = Math.floor(i/2);
					var	b = Math.round(i/2)===(i/2) ? -1:1;
					arguments[0](a,b);
				}
				return [true,aR[i]];
			}		
		}
		return false;
	}
};

function createScrollbars(z,state){
	if(state&&!this.elements[z][0]){
		var e = ["Box","Area","er"];
		var p = [["position",this.stylesXY[z][0],this.stylesXY[z][2],this.stylesXY[z][1],"boxSizing"],
				 ["position","cursor","top","left","width","height","boxSizing","padding","margin"],
				 ["position"]];
		var v = [["absolute","0px","0px","100%","border-box"],
				 ["relative","pointer","0px","0px","100%","100%","border-box","0","0"],
				 ["relative"]];
		var eL = this.elements;
		for(var x=0;x<3;x++){
			eL[z][x] = document.createElement("DIV");
			eL[z][x].setAttribute("class","handyScroll"+e[x]+this.stylesXY[z][3]);
			eL[z][x].setAttribute("data-side",z);
			setStyles(eL[z][x],p[x],v[x]);
		}
		eL[z][1].appendChild(eL[z][2]);
		eL[z][0].appendChild(eL[z][1]);
		this.mainBox.appendChild(eL[z][0]);

		if(this.sHide===true||typeof this.sHide === "number"){
			var bSetScrollEvA = setScrollEv.bind(this,0);
			var bSetScrollEvB = setScrollEv.bind(this,1);
			var bVisOn = setVisib.bind(this,true,z);
			var bVisOff = setVisib.bind(this,false,z);
			eL[z][0].style.opacity = 0;
			eL[z][0].addEventListener("mouseenter",bVisOn);		
			eL[z][0].addEventListener("mouseleave",bVisOff);		
		}

		var bReleaseMe,bScrollMove,bClickMe = clickMe.bind(this,eL[z][1]);
		eL[z][1].addEventListener("mousedown",bClickMe);
		eL[z][2].addEventListener("dragstart",onDragStart);
		
		} else if(!state&&eL[z][0]) {
			eL[z][1].removeEventListener("mousedown",bClickMe);
			eL[z][2].removeEventListener("dragstart",onDragStart);
			this.mainBox.removeChild(eL[z][0]);
			eL[z] = [null,null,null];
			}

				function onDragStart(){
					 event.preventDefault();
				}

				function clickMe(obj){
					var s = Number(obj.parentNode.getAttribute("data-side"));
					var passSt = setIDsDims.call(this,s,0) ? true:false;
					bReleaseMe = releaseMe.bind(this);
					bScrollMove = scrollMove.bind(this,s,passSt);
					prepareToMove.call(this,s);
					scrollMove.call(this,s,passSt);
					prepareToMove.call(this,s);
					window.addEventListener("mouseup",bReleaseMe);
					window.addEventListener("mousemove",bScrollMove);
					handleVis.call(this,0);
					setStyles(document.body,["cursor"],["pointer"]);
					setStyles(this.contentBox,["webkitTouchCallout","webkitUserSelect","khtmlUserSelect","mozUserSelect","msUserSelect","oUserSelect","UserSelect"],["none","none","none","none","none","none","none"]);
				}

				function setScrollEv(st){
					this.scrollEv = st;
				}

				function handleVis(st){
					if(this.sHide===false) return;
					var a = ["addEventListener","removeEventListener"];
					var evS = ["mouseleave","mouseenter"];
					var fN = [[bSetScrollEvA,bSetScrollEvB],[bVisOff,bVisOn]];
					for(var i=0;i<2;i++){
						eL[z][0][a[Math.abs(st-i)]](evS[0],fN[i][0]);
						eL[z][0][a[Math.abs(st-i)]](evS[1],fN[i][1]);
					}
				}

				function releaseMe(){
					window.removeEventListener("mouseup",bReleaseMe);
					window.removeEventListener("mousemove",bScrollMove);
					handleVis.call(this,1);
					if(this.scrollEv === 0) setVisib.call(this,false,z);
					setStyles(document.body,["cursor"],["default"]);
					setStyles(this.contentBox,["webkitTouchCallout","webkitUserSelect","khtmlUserSelect","mozUserSelect","msUserSelect","oUserSelect","UserSelect"],["all","all","all","all","all","all","all"]);
				}

				function scrollMove(s,st){
					var pos = getMouse.call(this,s)+this.buttonClick;
					setDimensions.call(this,pos,s,0,st);
				}
}

function setVisib(val,side){
	var nV = val ? 1:0;
	var eL = this.elements;
	if(val===true){
		clearTimeout(this.sTimeout[side]);
		this.sTimeout[side] === null;
	}

	if((val===true)||((val===false)&&(this.sHide===0||this.sHide===true))){
			eL[side][0].style.opacity = nV;
		}else if((val===false)&&(typeof this.sHide==="number")&&(this.sHide>0)){
			hScrollVisibTimeout = setTimeout(function(){
				eL[side][0].style.opacity = nV;
				},this.sHide);
			this.sTimeout[side] = hScrollVisibTimeout;
			}
}

function findMyIds(){
	var s = this.side;
	var sID = this.scrollToID,wID = this.wheelToID;
		if((s==="xy"&&!sID[0]&&!sID[1]&&!wID[0]&&!wID[1])||(s==="y"&&!sID[0]&&!wID[0])||(s==="x"&&!sID[1]&&!wID[1])){
			this.handyIDs = [];
			return;
		}
	var hBs = this.contentBox.querySelectorAll(".handyContainer");
	var iE = this.contentBox.querySelectorAll("[data-handyID]");
	var aE = [];
		if(!iE.length) {
			this.handyIDs = [];
			return;
		}
	for(var i=0; i!==iE.length; aE.push(iE[i++]));
	if(hBs.length){
		for(var ii=0;ii<hBs.length;ii++){
			for(var iii=0;iii<aE.length;iii++){
				if(hBs[ii].contains(aE[iii])&&aE[iii]!==hBs[ii]){
					aE.splice(iii,1);
					iii--;
				}
			}
		}
	}

	for(var i=0;i<aE.length;i++){
		if(checkStyleVal(aE[i],"display") === "none"){
			aE.splice(i,1);
			i--;
		}
	}

		if(!aE.length) {
			this.handyIDs = [];
			return;
		}

	var tb = [],uTb = [];
	for(var i=0;i<aE.length;i++){
		var args = aE[i].getAttribute("data-handyID").split(",");
		for(var ii=0;ii<5;ii++){
			args[ii] = parseFloat(args[ii]);
		}
		var nOb = {obj:aE[i],coords:args,tab:args.splice(4,1)[0]};
		
		if(isNaN(nOb.tab)){
			uTb.push(nOb);
			} else{
				tb.push(nOb);
				}
	}

	tb.sort(function(a,b){
		return a.tab-b.tab;
	});
	this.handyIDs = tb.concat(uTb).slice();
}

function setIDsDims(x,evObj){
	if((this.edgesID[x] && !this.handyIDs.length)||(!this.edgesID[x] && this.handyIDs.length<2)) return false;
	if(![this.scrollToID,this.wheelToID][evObj][x]) return false;

	var res = [];
	for(var i=0;i<this.handyIDs.length;i++){
		var mV = (this.rP(x,0,1)*(this.handyIDs[i].coords[x*2]/100)) + (this.rP(x,this.handyIDs[i].obj,1)*(this.handyIDs[i].coords[x*2+1]/100));
		res.push(this.rP(x,this.handyIDs[i].obj,0)-this.rP(x,1,0)-mV);
	}

	if(this.edgesID[x]){
		res.unshift(0);
		res.push((this.rP(x,1,1)+retMarg(this,x))-this.rP(x,0,1));
	}

	this.handyIDpos = res.slice();
	var unQ = [];
	for(var i=0;i<this.handyIDpos.length;i++){
		if(!unQ.some(function(c){
			return c===this.valueOf();
			},this.handyIDpos[i])){
				unQ.push(this.handyIDpos[i]);
		}
	}
	if((!this.edgesID[x]&&unQ.length<2)||(this.edgesID[x]&&unQ.length<3)){ 
		return false;
		} else {
			return true;
			}
}

function findNearestId(s,wS){
	var c = false;
	for(var i=0;i<this.handyIDpos.length;i++){
		var cA = this.contentScroll[s],cB = this.handyIDpos[i];
		if((wS===1&&cB<cA)||(wS===-1&&cB>cA)) {
			var f = c===false ? Number.POSITIVE_INFINITY:Math.abs(cA-this.handyIDpos[c]);
			if(Math.abs(cA-cB)<f){
				c = i;
			}					
		}
	}
	if(c===false){
		if(this.wheelToID[s]==="repeat"){
			c = wS === 1 ? this.handyIDpos.length-1:0;
			} else {
				return;
				}
			}
	this.actID = c;
	setDimensions.call(this,this.handyIDpos[c],s,1,this.scrollToID[s]);			
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

function refreshStretch(s){
	if(this.stretch[s]){
		setStyles(this.elements[s][2],[[this.stylesXY[s][1]]],[((this.rP(s,0,1)/this.rP(s,1,1))*100) + "%"]);
		} else {
			setStyles(this.elements[s][2],[[this.stylesXY[s][1]]],[null]);
			}
}

function getMouse(s){
	var mXY = s===0?"clientY":"clientX";
	var mouse = event[mXY]<this.rP(s,3,0) ? 0:event[mXY]>this.rP(s,3,0)+this.rP(s,3,1) ? this.rP(s,3,1):event[mXY]-this.rP(s,3,0);
	return mouse;	
}

function prepareToMove(s){
	var onSide = !this.stretch[s] ? false:((getMouse.call(this,s)>=this.rP(s,5,0)-this.rP(s,4,0)) && (getMouse.call(this,s)<this.rP(s,5,0)+this.rP(s,5,1)-this.rP(s,4,0))) ? true:false;
	this.buttonClick = onSide ? -(getMouse.call(this,s)-(this.rP(s,5,0)-this.rP(s,4,0))):-(this.rP(s,5,1)/2);
};

function setDimensions(pos,s,d,sep,wP){
		if(typeof pos === "object"){
			var sD = pos;
			var mV = ((this.rP(s,4,1)-this.rP(s,5,1))*(this.scrollStep[s]/100)*pos.s);
			pos = (this.rP(s,5,0)-this.rP(s,4,0)) - mV;			
		}

		var nRet;
		var o = [retMarg(this,s),this.elements[s][2],this.contentBox];
		var l = [[5,4,0,4,o[1],1,1,o[2]],[0,1,o[0],0,o[2],-1,5,o[1]]];
		var max = this.rP(s,l[d][1],1)-this.rP(s,l[d][0],1)+l[d][2];
		var nPx = pos<0 ? 0:(pos+this.rP(s,l[d][0],1))>this.rP(s,l[d][1],1)+l[d][2] ? max:pos;

		if((nPx===0||nPx===max)&&wP){
			scrSt.findScrollbars(this.mainBox.parentElement,true);
			if(scrSt.hasHanPar) {
				setDimensions.call(scrSt.hasHanPar.object,sD,s,d,sep,wP);
			}
		}

		var nPr = (nPx/(this.rP(s,l[d][3],1)))*100;
		var sU = !d ? [nPr,"%"]:[nPx,"px"];
		setStyles(l[d][4],[[this.stylesXY[s][0]]],[(l[d][5]*sU[0]) + sU[1]]);
		if(sep){
			if(!d){
				var sPr = (nPx/(this.rP(s,l[d][3],1)-this.rP(s,l[0][0],1)))*100;
				var idS = 100/(this.handyIDpos.length-1);
				nRet = -this.handyIDpos[Math.floor((sPr+(idS/2))/idS)];				
				} else {
					nRet = (((this.rP(s,4,1) - this.rP(s,5,1))/(this.handyIDpos.length-1))*this.actID);
					}
			} else {
				var total = ((this.rP(s,l[d][0],0)-this.rP(s,l[d][1],0))/(this.rP(s,l[d][1],1)+l[d][2]-this.rP(s,l[d][0],1)))*100;
				nRet = (((this.rP(s,l[1-d][3],1)-(this.rP(s,l[d][6],1)+l[1-d][2]))*total)/100);
				}
		this.contentScroll[s] = d ? nPx:-nRet;
		setStyles(l[1-d][4],[[this.stylesXY[s][0]]],[nRet + "px"]);
}

handyScroller.prototype.rP = function(s,o,p){
	var nO = this.elements[s].slice();
	var nP = [["top","height","width","bottom"],["left","width","height","right"]];
	nO.unshift(this.mainBox,this.contentBox,this.wheelBox);
	var obj = typeof o === "number" ? nO[o]:o;
	return obj.getBoundingClientRect()[nP[s][p]];
};


function setStyles(o,p,v){
	for(var i=0;i<p.length;i++){
		o.style[p[i]] = v[i];
	}
}

function retMarg(o,s){
	return o.scrollMargin[1-s] ? o.rP(1-s,3,2):0;
}

function blockScroll(){
	var c = this.mainBox.children[0];
	var bBlockMe = blockMe.bind(this);
	c.addEventListener("scroll",bBlockMe);
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

	var cH = document.getElementById(location.hash.slice(1));
	if(cH) getHashObjects(document.body,cH);

	function detectClickHash(e){
		if(e.target.nodeName !== "A") return;
		if(!e.target.getAttribute("href")) return;
		if(e.target.getAttribute("href").charCodeAt(0)!==35) return;
		var hashElem = document.getElementById(e.target.getAttribute("href").slice(1));
		getHashObjects(e.target,hashElem);
	}
}

function getHashObjects(tG,hS){
	var nN, x = [tG,hS], nL = [[],[]];
	for(var i=1;i>=0;i--){
		while(x[i]!==null){
			if(x[i].getAttribute("class")==="handyContainer"){
				nL[i].push(x[i]);
			}
			x[i] = x[i].parentElement;
		}
		if(nL[1].length===0) return;
		nL[i].reverse();
		nL[i].forEach(getHandyObject);
	}
		function getHandyObject(cR,iN,aR){
			var oL = handyScroller.prototype.objectList;
			for(var i=0;i<oL.length;i++){
				if(cR.id===oL[i].mainBox.id){
					aR[iN] = oL[i];
					}
				}
			}
	if(nL[0][0] === nL[1][0]){
		var sP=0;
		for(var i=1;i<nL[1].length;i++){
			if(nL[1][i]===nL[0][i]){
				sP = i;
				} else {
					break;
					}
		}
		nN = nL[1].slice(sP);
		} else {
			nN = nL[1].slice();
			}
	alignBoxes(nN,hS);
}

function alignBoxes(bL,hE){
	for(var i=0;i<2;i++){
		for(var ss=0;ss<bL.length;ss++){
			if(bL[ss].elements[i][0]===null) continue;
			setDimensions.call(bL[ss],0,i,1);
		}
	}

	var fB = bL[0];
	bL.reverse();
	var gA = handyScroller.prototype.currentScrollAlign === null ? bL[0].scrollAlign.slice():handyScroller.prototype.currentScrollAlign.slice();
	handyScroller.prototype.currentScrollAlign = null;

	for(var i=0;i<2;i++){
		var vOT = hE, vOB = hE,	destT = fB.rP(i,0,0)+((fB.rP(i,0,1)-cM(i,0))*(gA[i*2]/100)) + (fB.rP(i,hE,1)*(gA[i*2+1]/100));
		for(var ii=0;ii<bL.length;ii++){
			if(bL[ii].elements[i][0]===null) continue;
			var mV,	cB = bL[ii], vT = fB.rP(i,vOT,0), vB = fB.rP(i,vOB,0) + fB.rP(i,vOB,1);

			if((ii===bL.length-1)||(destT>=cB.rP(i,0,0)&&destT+fB.rP(i,hE,1)<=(cB.rP(i,0,0)+cB.rP(i,0,1)))){
				mV = (cB.rP(i,0,0)-cB.rP(i,1,0)) + (vT - destT);
				setDimensions.call(bL[ii],mV,i,1);
				} else {
					var tV = Math.abs(cB.rP(i,0,0)-destT);
					var bV = Math.abs((cB.rP(i,0,0)+cB.rP(i,0,1)-cM(i,ii))-destT+fB.rP(i,hE,1));
					mV = tV<=bV ? vT-cB.rP(i,1,0):(vB-cB.rP(i,1,0))-cB.rP(i,0,1)+cM(i,ii);
					var scr = tV<=bV ? cB.rP(i,0,0)-vT:(cB.rP(i,0,0)+cB.rP(i,0,1))-vB-cM(i,ii);
					vOT = (vT+scr)<cB.rP(i,0,0) ? bL[ii].mainBox:vOT;
					vOB = (vB+scr)>(cB.rP(i,0,0)+cB.rP(i,0,1)) ? bL[ii].mainBox:vOB;
					setDimensions.call(bL[ii],mV,i,1);
					}
		}
	}

	function cM(s,o){
		var nO = bL[o].elements[1-s][0]; 
		return bL[o].scrollMargin[1-s] ? fB.rP(s,nO,1):0;
	}		
}

function autoRefresh(){
	var that = this;
	var bFindMyIds = findMyIds.bind(this);
	window.addEventListener("resize",this.refreshMe);
	if(window.MutationObserver){
		var oB = new MutationObserver(function(mT) {
			mT.forEach(function(mR) {
				that.refreshMe();
				if((mR.addedNodes.length||mR.removedNodes.length)||condIdFinder(mR,0)){
					bFindMyIds();
				}
			});
		});
		var tA = this.contentBox;
		var tB = this.mainBox;
		oB.observe(tA, {childList:true, attributes:true, characterData:true, subtree:true});
		oB.observe(tB, {attributes:true, characterData:true});
		} else if(window.MutationEvent) {
			var eA = ["DOMAttrModified","DOMAttributeNameChanged","DOMCharacterDataModified","DOMElementNameChanged","DOMNodeInserted","DOMNodeRemoved"];
			var eB = ["DOMNodeInserted","DOMNodeRemoved","DOMAttrModified"];
					//"DOMSubtreeModified","DOMNodeInsertedIntoDocument","DOMNodeRemovedFromDocument","onpropertychange"
			for(var i in eA){
				this.mainBox.addEventListener(eA[i],this.refreshMe);
				}
			for(var i in eB){
				this.mainBox.addEventListener(eB[i],function(e){
					if(condIdFinder(e,1)) bFindMyIds();
				});
				}
			};

	function condIdFinder(obj,brwsr){
		var attr = brwsr === 0 ? "attributeName":"attrName";

		if(obj.target.hasAttribute("data-handyID")){
			if(obj[attr]==="style"){
				if(checkStyleVal(obj.target,"display")==="none"){
					return true;
				}
			}
		}
		return false;
	}			
}

function checkStyleVal(o,p){
	return window.getComputedStyle(o).getPropertyValue(p);
}

function bindPrototyped(){
	this.refreshMe = this.protoRefreshMe.bind(this);
	this.moveToID = this.protoMoveToID.bind(this);
	this.moveToPx = this.protoMoveTo.bind(this,1);
	this.moveToProc = this.protoMoveTo.bind(this,0);
}

handyScroller.prototype.protoRefreshMe = function(){
	var m = this.mainBox.getBoundingClientRect();
	var c = this.contentBox.getBoundingClientRect();
	var n = [m.height,m.width,c.height,c.width];
	var p = this.currentDims;
	if(n[0]!==p[0]||n[1]!==p[1]||n[2]!==p[2]||n[3]!==p[3]){
		validation.call(this);
		this.currentDims = n.slice();
	}
};

handyScroller.prototype.protoMoveToID = function(iD,yT,yH,xL,xW){
	var iE = document.getElementById(iD);
	if(!iE) return;
	handyScroller.prototype.currentScrollAlign = [yT,yH,xL,xW];
	getHashObjects(this.mainBox,iE);	
};

handyScroller.prototype.protoMoveTo = function(u,y,x){
	var s = [y,x];
	for(var i=0;i<2;i++){
		if(s[i]===null||this.elements[i][0]===null) continue;
		var nD = u ? s[i]:((this.rP(i,1,1)+retMarg(this,i))-this.rP(i,0,1))*(s[i]/100);
		this.contentScroll[i] = nD;
		setDimensions.call(this,nD,i,1);
	}
};

function positionContent(){

}
