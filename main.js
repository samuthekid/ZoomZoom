
var iDiv = document.createElement('div');
var iImg = document.createElement('img');
var iVid = document.createElement('video');
var iSrc = document.createElement('source');
var xBody = document.body;
var content = "notfound";
var dist = 10;
var type = "";
var iOld = "";
var iTarget = null;

var tw = 0;
var th = 0;

var mouse_x = 0;
var mouse_y = 0;

var window_x = window.innerWidth;
var window_y = window.innerHeight;

function initialStuff(){
	iDiv.id = 'woow';
	iDiv.className = 'woow';
	iDiv.style.display = 'none';
	iDiv.style.position = 'fixed';
	iDiv.style.overflow = 'hidden';
	iDiv.style.left = "100px";
	iDiv.style.top = "100px";
	iDiv.style.zIndex = '10000';
	xBody.appendChild(iDiv);
	iImg.id = 'immg';
	iImg.className = 'immg';
	iImg.style.borderStyle = 'solid';
	iImg.style.borderColor = '#DDD';
	iImg.style.borderWidth = '2px';
	iImg.style.display = 'none';
	iImg.src = '';
	iDiv.appendChild(iImg);
	iVid.id = 'viid';
	iVid.className = 'viid';
	iVid.style.borderStyle = 'solid;';
	iVid.style.borderColor = '#DDD;';
	iVid.style.borderWidth = '2px';
	iVid.style.display = 'none';
	iSrc.id = 'srrc';
	iSrc.className = 'srrc';
	iSrc.type = 'video/webm';
	//iVid.appendChild(iSrc);
	iDiv.appendChild(iVid);
}

function resize(){
	window_x = window.innerWidth;
	window_y = window.innerHeight;
}

function getUrl(elem){
	var url = window.location.href;

	var src = elem.src;
	var r = "notfound";
	if(url.indexOf("reddit.com") != -1){
		if(elem.tagName == "IMG"){
			type = "IMG";
			if(elem.parentElement != null){
				if(elem.parentElement.href.indexOf(".jpg") || elem.parentElement.href.indexOf(".gif") || elem.parentElement.href.indexOf(".png") || elem.parentElement.href.indexOf(".gifv")){
					r = elem.parentElement.href.replace("http", "https");
				}
			}
		}
	}else if(url.indexOf("9gag.com") != -1){
		if(elem.tagName == "IMG"){
			type = "IMG";
			r = src.replace("460s","700b");
		}else if(elem.tagName == "VIDEO"){
			type = "VIDEO";
			r = elem.childNodes[3].src;
		}
	}
	//console.log("url: "+url+" | src: "+r);
	return r;
}

function getWidth(elem){
	tw = elem.width;
	if(tw != 0 && tw != null && tw != undefined) return;
	tw = elem.style.width.substring(0,elem.style.width.length-2);
	if(tw != 0 && tw != null && tw != undefined) return;
	tw = elem.style.minWidth.substring(0,elem.style.minWidth.length-2);
}

function getHeight(elem){
	th = elem.height;
	if(th != 0 && th != null && th != undefined) return;
	th = elem.style.height.substring(0,elem.style.height.length-2);
	if(th != 0 && th != null && th != undefined) return;
	th = elem.style.minHeight.substring(0,elem.style.minHeight.length-2);
}

function mousemove(){
	mouse_x = event.clientX;
	mouse_y = event.clientY;
	//console.log("X = "+mouse_x+" | Y = "+mouse_y);
    iTarget = document.elementFromPoint(mouse_x, mouse_y);

	if(iOld != iTarget){
		iOld = iTarget;
    	content = getUrl(iTarget);
		console.log("New element! "+iTarget);
	}

    if(content != "notfound"){
    	if(type == "IMG"){
			iImg.src = content;
			iImg.style.display = 'block';
			getWidth(iImg);
    		getHeight(iImg);
		}else{
			iImg.style.display = 'none';
		}
		
		if(type == "VIDEO"){
			iSrc.src = content;
			iVid.appendChild(iSrc);
			iVid.style.display = 'block';
			getWidth(iVid);
    		getHeight(iVid);
		}else{
			iVid.style.display = 'none';
		}
    	console.log("W: "+tw+" | H: "+th);
    	display(iTarget);
    }else{
    	dontdisplay();
    }
	
}

function display(elem){
	var opt = 0;
	var rq1 = ((window_y-dist-dist)/th)<(((window_x-mouse_x)-dist-dist)/tw)?((window_y-dist-dist)/th):(((window_x-mouse_x)-dist-dist)/tw);
	var rq2 = ((window_y-dist-dist)/th)<((mouse_x-dist-dist)/tw)?((window_y-dist-dist)/th):((mouse_x-dist-dist)/tw);
	var rq3 = ((mouse_y-dist-dist)/th)<((window_x-dist-dist)/tw)?((mouse_y-dist-dist)/th):((window_x-dist-dist)/tw);
	var rq4 = (((window_y-mouse_y)-dist-dist)/th)<((window_x-dist-dist)/tw)?(((window_y-mouse_y)-dist-dist)/th):((window_x-dist-dist)/tw);

	var tmp = 0.0;

	if(rq1>tmp){
		tmp = rq1;
		opt = 1;
	}
	if(rq2>tmp){
		tmp = rq2;
		opt = 2;
	}
	if(rq3>tmp){
		tmp = rq3;
		opt = 3;
	}
	if(rq4>tmp){
		tmp = rq4;
		opt = 4;
	}

	var width = (tw*tmp);
	var height = (th*tmp);

	var left = 0;
	var top = 0;

	if(opt == 1){
		top = (mouse_y-(height/2));
		left = (mouse_x+dist);
	}else if(opt == 2){
		top = (mouse_y-(height/2));
		left = (mouse_x-dist-width);
	}else if(opt == 3){
		left = (mouse_x-(width/2));
		top = (mouse_y-dist-height);
	}else{
		left = (mouse_x-(width/2));
		top = (mouse_y+dist);
	}

	if(top<dist) top = dist;
	if(top+height>window_y-dist) top = window_y-height-dist;
	if(left<dist) left = dist;
	if(left+width>window_x-dist) left = window_x-width-dist;

	if(type == "IMG"){
		iImg.style.maxWidth = width+"px";
		iImg.style.maxHeight = height+"px";
	}else if(type == "VIDEO"){
		iVid.style.maxWidth = width+"px";
		iVid.style.maxHeight = height+"px";
		iVid.load();
		iVid.play();
	}
	iDiv.style.top = top+"px";
	iDiv.style.left = left+"px";
	iDiv.style.display = 'block';
}

function dontdisplay(){
	iImg.src = '';
	iImg.style.display = 'none';
	iVid.src = '';
	iVid.style.display = 'none';
	//iVid.removeChild(iSrc);
	iDiv.style.display = 'none';
}

initialStuff();
document.addEventListener("mousemove",mousemove);
window.addEventListener("resize",resize);

