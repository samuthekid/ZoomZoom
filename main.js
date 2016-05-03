
var iDiv = document.createElement('div');
var iImg = document.createElement('img');
var xBody = document.body;
var content = "notfound";
var old_content = "notfound";
var dist = 25;
var type = "";
var iOld = "";
var iTarget = null;
var loaded = 0;

var tw = 0;
var th = 0;

var mouse_x = 0;
var mouse_y = 0;

var window_x = window.innerWidth;
var window_y = window.innerHeight;

function initialStuff(){
	iDiv.id = 'notthat';
	iDiv.className = 'woow';
	iDiv.style.display = 'none';
	iDiv.style.position = 'fixed';
	iDiv.style.overflow = 'hidden';
	iDiv.style.left = "100px";
	iDiv.style.top = "100px";
	iDiv.style.zIndex = '10000';
	iDiv.style.pointerEvents = "none";
	xBody.appendChild(iDiv);
	iImg.id = 'notthat';
	iImg.className = 'immg';
	iImg.style.borderStyle = 'solid';
	iImg.style.borderColor = '#DDD';
	iImg.style.borderWidth = '2px';
	iImg.style.display = 'none';
	iImg.addEventListener("load", contentLoaded);
	iImg.src = '';
	iDiv.appendChild(iImg);
}

function resize(){
	window_x = window.innerWidth;
	window_y = window.innerHeight;
}

function getSource(elem){
	var url = window.location.href;
	var r = "notfound";

	if(elem.tagName == "IMG"){
		if(elem.parentElement != null){
			if(elem.parentElement.tagName == "A"){
				r = elem.parentElement.href;
			}else{
				r = elem.src;
			}
		}else{
			r = elem.src;
		}
	}else if(elem.tagName == "A"){
		r = elem.href;
	}else{
		if(elem.parentElement != null){
			if(elem.parentElement.tagName == "A"){
				r = elem.parentElement.href;
			}else{
				r = "notfound";
			}
		}else{
			r = "notfound";
		}
	}

	//console.log("url : "+url);
	//console.log("src : "+r);
	return r;
}

function urlCompose(link){
	var url = window.location.href;
	var l = link;

	if(l.indexOf("9gag.com") != -1){
		type = "IMG";
		l = "https://img-9gag-fun.9cache.com/photo/"+l.split("/gag/")[1]+"_700b.jpg";
	}else if(l.indexOf("i.imgur.com") != -1){
		// preciso tratar dos outros formatos
		type = "IMG";
		l = l;
	}else if(l.indexOf("imgur.com") != -1){
		// preciso tratar dos outros formatos
		type = "IMG";
		l = "https://i.imgur.com/"+l.split(".com/")[1]+".jpg";
	}else if(l.indexOf("youtube.com/watch?") != -1){
		type = "IFRAME";
		l = "https://youtube.com/embed/"+l.split("v=")[1].substring(0,11)+"/?autoplay=1";
	}else if(l.indexOf(".jpg") != -1 || l.indexOf(".png") != -1 || l.indexOf(".gif") != -1){
		type = "IMG";
	}else{
		l = "notfound";
	}

	if(l.indexOf("https://") == -1) l = l.replace("http://","https://");
	//console.log("link: "+l);
	return l;
}

function contentLoaded(e){
	//console.log("Content Loaded!");
	loaded = 1;
	th = e.target.height;
	tw = e.target.width;
	display();
}

function mousemove(){

	mouse_x = event.clientX;
	mouse_y = event.clientY;
	//console.log("X = "+mouse_x+" | Y = "+mouse_y);
    iTarget = document.elementFromPoint(mouse_x, mouse_y);

	if(iOld != iTarget){
		iOld = iTarget;
    	content = getSource(iTarget);
    	content = urlCompose(content);
    	console.log("New element "+iTarget.tagName+" | Type="+type+" | Content="+content);
	}

    if(content != "notfound"){
    	if(content != old_content){
	    	old_content = content;
    		console.log("New content!");

	    	if(type == "IMG"){
				iImg.src = content;
				iImg.style.display = 'block';
			}else{
				iImg.style.display = 'none';
			}
    	}
    	if(loaded == 1) display();
    }else{
    	dontdisplay();
	}
}

function display(elem){

	var rq = new Array(4);
	rq[0] = ((window_y-dist-dist)/th)<(((window_x-mouse_x)-dist-dist)/tw)?((window_y-dist-dist)/th):(((window_x-mouse_x)-dist-dist)/tw);
	rq[1] = ((window_y-dist-dist)/th)<((mouse_x-dist-dist)/tw)?((window_y-dist-dist)/th):((mouse_x-dist-dist)/tw);
	rq[2] = ((mouse_y-dist-dist)/th)<((window_x-dist-dist)/tw)?((mouse_y-dist-dist)/th):((window_x-dist-dist)/tw);
	rq[3] = (((window_y-mouse_y)-dist-dist)/th)<((window_x-dist-dist)/tw)?(((window_y-mouse_y)-dist-dist)/th):((window_x-dist-dist)/tw);

	var opt = -1;
	var tmp = 0.0;
	for(var i=0; i<rq.length; i++) { 
		if(rq[i]>tmp){
			opt = i;
			tmp = rq[i];
		}
	}

	var width = parseInt(tw*tmp);
	var height = parseInt(th*tmp);

	var left = 0;
	var top = 0;

	if(opt == 0){
		top = (mouse_y-(height/2));
		left = (mouse_x+dist);
	}else if(opt == 1){
		top = (mouse_y-(height/2));
		left = (mouse_x-dist-width);
	}else if(opt == 2){
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
		iImg.width = width;
		iImg.height = height;
	}
	iDiv.style.top = top+"px";
	iDiv.style.left = left+"px";
	iDiv.style.display = 'block';

	//console.log("RACIO = "+tmp+" | OPT = "+opt);
	//console.log("O_W: "+tw+" | O_H: "+th);
	//console.log("N_W: "+width+" | N_H: "+height);
}

function dontdisplay(){
	iImg.src = '';
	iImg.removeAttribute("width");
	iImg.removeAttribute("height");
	iImg.style.display = 'none';
	type = "";
	loaded = 0;
	tw = 0;
	th = 0;
	old_content = "notfound";
}

alert("ON");
initialStuff();
document.addEventListener("mousemove",mousemove);
window.addEventListener("resize",resize);

