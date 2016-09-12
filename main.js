var zz = {

	// elements to show media
	xBody: null,
	iDiv: null,
	iImg: null,
	iVid: null,
	iFra: null,

	// atual url and last url
	old_url: "notfound",
	url: "notfound",

	// distance to window borders
	dist: 25,

	// media type
	type: "",
	media: "",
	gallery: [],
	gallery_i: 0,

	// options -> save settings -> soon
	full_size: 0,
	fixed: 0,

	// scroll options to larger images
	scrollable: 0,
	scrollable_x: 0,
	scrollable_delta: 350,

	// media loaded?
	loaded: 0,
	unload: 0,

	// window size
	window_x: window.innerWidth,
	window_y: window.innerHeight,

	// mouse coordinates
	mouse_x: 0,
	mouse_y: 0,

	// ???
	tw: 0,
	th: 0,

	// default video size
	video_x: 1280,
	video_y: 720,

	// black list
	blackList: ["reddit.com/domain/",
				"reddit.com/user/"],

	// key presses
	keyboardPress: function(e){
		if(this.loaded == 0) return false;
		var code = e.keyCode;
		var prevent = true;
		//alert(code);
		
		if(code == 32){ // SPACE
			if(this.type == "VID"){
				if(this.iVid.paused) this.iVid.play();
				else this.iVid.pause();
			}else if(this.type == "IMG"){
				if(this.full_size == 1 && this.scrollable == 1){
					this.scrollable_x -=this.scrollable_delta;
					$("#iDiv").animate({
						top: "-="+this.scrollable_delta,
						}, 200, function(){});
				}
				if(this.media.includes("thumbnail.ws/output/")){
					//browser.tabs.create({url:this.url});
					window.location = this.url;
				}
			}else if(this.type == "YOU" && this.media.includes("i.ytimg.com/vi/")){
				this.cleanUp();
				iDesc.innerText = "";
				iCnt.innerText = "";
				this.loadContent("https://www.youtube.com/embed/"+this.media.substring(23,34),this.url);
				this.fixed = 1;
			}else if(this.type == "YOU" && this.media.includes("youtube.com/embed")){
				this.fixed = 0;
				this.mouseOut();
			}else if(this.type == "FRA"){
				this.fixed = 0;
				this.mouseOut();
			}
		}else if(code == 118){ // V
			this.full_size = 1-this.full_size;
			this.scrollable_x = 0;
			this.display();
		}else if(code == 98){ // B
			if(this.type == "IMG" && this.full_size == 1 && this.scrollable == 1){
				this.scrollable_x +=this.scrollable_delta;
				$("#iDiv").animate({
					top: "+="+this.scrollable_delta,
					}, 200, function(){});
			}

		}else if(code == 102){ // F
			this.fixed = 1-this.fixed;
			if(this.fixed == 0) this.mouseOut();
		
		}else if(code == 110){ // N
			if(this.gallery.length < 2) return false;
			this.gallery_i-=1;
			if(this.gallery_i < 0) this.gallery_i += this.gallery.length;
			this.scrollable_x = 0;
			this.cleanUp();
			iCnt.innerText = this.gallery_i+1+"/"+this.gallery.length;
			var tmp = this.gallery[this.gallery_i];
			iDesc.innerText = ((tmp.title)?tmp.title:"")+((tmp.description)?" - "+tmp.description:"");
			if(tmp.mp4) tmp = tmp.mp4;
			else tmp = tmp.link;
			this.loadContent(tmp,this.url);
		
		}else if(code == 109){ // M
			if(this.gallery.length < 2) return false;
			this.gallery_i+=1;
			this.gallery_i%=this.gallery.length;
			this.scrollable_x = 0;
			this.cleanUp();
			iCnt.innerText = this.gallery_i+1+"/"+this.gallery.length;
			var tmp = this.gallery[this.gallery_i];
			iDesc.innerText = ((tmp.title)?tmp.title:"")+((tmp.description)?" - "+tmp.description:"");
			if(tmp.mp4) tmp = tmp.mp4;
			else tmp = tmp.link;
			this.loadContent(tmp,this.url);
		}else if(code == 100){ // D
			if(iDesc.innerText == "") return false;
			if(iDesc.style.display == "block") iDesc.style.display = "none";
			else iDesc.style.display = "block";
		}

		if(prevent) e.preventDefault();
		return false;
	},

	// NOT WORKING
	scrollImage: function(e){
		if(this.loaded == 0) return false;
		// scroll only if is a big image and full_size is 1
		// scrollable defined in display()
		//console.log(type+" - "+this.full_size+" - "+this.scrollable);
		if(this.type == "IMG" && this.full_size == 1 && this.scrollable == 1){
			this.scrollable_x +=10;
			this.display();
			e.preventDefault();
			e.stopPropagation();
			return false;
		}
	},

	// create a <img>
	addImage: function(src){
		this.iImg = document.createElement('img');
		this.iImg.id = "iImg";
		this.iImg.src = src;
		this.iImg.style.display = 'none';
		
		this.iImg.addEventListener("load", this.contentLoaded.bind(this));
		iDiv.appendChild(this.iImg);
	},

	// create a <video>
	addVideo: function(src){
		this.iVid = document.createElement('video');
		this.iVid.id = "iVid";
		this.iVid.src = src;
		this.iVid.style.display = 'none';

		this.iVid.setAttribute("loop", "");
		this.iVid.setAttribute("autoplay", "");
		this.iVid.setAttribute("controls", "");
		
		this.iVid.addEventListener("loadeddata", this.contentLoaded.bind(this));
		iDiv.appendChild(this.iVid);
		
		this.iVid.load();
	},

	// create a <iframe>
	addIframe: function(src){
		this.iFra = document.createElement('iframe');
		this.iFra.id = "iFra";
		this.iFra.src = src;
		this.iFra.style.display = 'none';

		this.iFra.setAttribute("autoplay", "");
		this.iFra.setAttribute("allowfullscreen", "");
		
		this.iFra.addEventListener("load", this.contentLoaded.bind(this));
		iDiv.appendChild(this.iFra);
	},

	// add events and create elements to show media
	initiate: function(){
		console.log("INITIATE");

		// adds the events to all links
		$("a").mouseover(this.mouseOverLink.bind(this));
		$("a").mouseout(this.mouseOut.bind(this));
		// adds the event to all imgs
		$("img").mouseover(this.mouseOverImg.bind(this));
		// function to update window size
		window.addEventListener("resize", this.resizeWindow.bind(this));
		// function to update mouse position
		window.addEventListener("mousemove", this.moveMouse.bind(this));
		// function to change options
		window.addEventListener("keypress", this.keyboardPress.bind(this));
		// function to scroll larger images -> cant prevent page to scroll...
		//$(window).scroll(this.scrollImage.bind(this));

		xBody = document.body;

		iLoad = document.createElement('img');
		iLoad.id = 'iLoad';
		iLoad.width = 24;
		iLoad.width = 24;
		iLoad.style.position = 'fixed';
		iLoad.style.top = 10;
		iLoad.style.left = 10;
		iLoad.style.display = 'none';
		iLoad.src = browser.extension.getURL("loading.gif");

		xBody.appendChild(iLoad);

		iDiv = document.createElement('div');
		iDiv.id = 'iDiv';
		iDiv.style.display = 'none';
		iDiv.style.borderStyle = 'solid';
		iDiv.style.borderColor = '#DDD';
		iDiv.style.borderWidth = '2px';
		iDiv.style.overflow = 'hidden';
		iDiv.style.position = 'fixed';
		iDiv.style.zIndex = '9999';
		//iDiv.style.pointerEvents = 'none';

		xBody.appendChild(iDiv);

		iDesc = document.createElement('span');
		iDesc.id = 'iDesc';
		iDesc.style.display = 'none';
		iDesc.style.position = 'absolute';
		iDesc.style.bottom = '0px';
		iDesc.style.left = '0px';
		iDesc.style.padding = '5px';
		iDesc.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
		iDesc.style.color = '#fff';
		iDesc.zIndex = '9999';
		iDesc.style.fontFamily = 'Tahoma';
		iDesc.style.fontSize = '150%';

		iDiv.appendChild(iDesc);

		iCnt = document.createElement('span');
		iCnt.id = 'iCnt';
		iCnt.style.display = 'none';
		iCnt.style.position = 'absolute';
		iCnt.style.top = '0px';
		iCnt.style.right = '0px';
		iCnt.style.padding = '5px';
		iCnt.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
		iCnt.style.color = '#fff';
		iCnt.zIndex = '9999';
		iCnt.style.fontFamily = 'Tahoma';
		iCnt.style.fontSize = '150%';

		iDiv.appendChild(iCnt);

	},

	// update window size
	resizeWindow: function(e){
		this.window_x = window.innerWidth;
		this.window_y = window.innerHeight;
	},

	// update mouse position
	moveMouse: function(e){
		this.mouse_x = e.clientX;
		this.mouse_y = e.clientY;
		if(this.loaded == 0){
			iLoad.style.left = this.mouse_x+15+"px";
			iLoad.style.top = this.mouse_y+15+"px";
		}else if(this.loaded == 1 && this.fixed == 0){
			this.display();
		}
	},

	handler9gag: function(url){
		var site = url;
		console.log("9GAG HANDLER "+url);
		//type = "IMG"; ou gif!!!
		// TEMP SOLUTION
		var media = "https://img-9gag-fun.9cache.com/photo/"+url.split("/gag/")[1]+"_700b.jpg";
		this.loadContent(media,site);
	},

	handlerImgur: function(url,tt){
		var that = this;
		var site = url;
		var id = "";
		var parts = url.split("/");
		$.each(parts, function(i,x){
			if(x.includes("imgur.com")){
				if(parts[i+1] == "a" || parts[i+1] == "gallery") id = parts[i+2];
				else id = parts[i+1];
			}
		});
		if(id.includes(".")) id = id.split(".")[0];
		var apiEndPoint = "https://api.imgur.com/3/";
		console.log("IMGUR HANDLER "+id);
		if(id != ""){
			if(url.includes("/a/") || url.includes("/gallery/")){
				if(url.includes("/a/")) apiEndPoint+="album/";
				else if(url.includes("/gallery/")) apiEndPoint+="gallery/";
				$.ajax({
					url: apiEndPoint+id,
					headers: {'Authorization': 'Client-ID 3c97f149c982123',},
					success: function(res){
						if(res.data.images){
							// more than 1 img
							$.each(res.data.images, function(i,x){that.gallery.push(x);});
							that.gallery_i = 0;
							if(that.gallery[0].mp4) url = that.gallery[0].mp4;
							else url = that.gallery[0].link;
							if(that.gallery[0].title) iDesc.innerText = that.gallery[0].title;
							if(that.gallery[0].description) iDesc.innerText += " - " + that.gallery[0].description;
							if(that.gallery.length > 1) iCnt.innerText = that.gallery_i+1+"/"+that.gallery.length;
						}else{
							// just 1 img
							if(res.data.mp4) url = res.data.mp4;
							else url = res.data.link;
							if(res.data.title) iDesc.innerText = res.data.title;
							if(res.data.description) iDesc.innerText += " - " + res.data.description;
						}
						that.loadContent(url,site);
					},
					error: function(res){
						if(tt<3){
							if(url.includes("/a/")){
								url = url.replace("/a/","/gallery/");
							}else if(url.includes("/gallery/")){
								url = url.replace("/gallery/","/a/");
							}
							url = that.handlerImgur(url,tt+1);
						}else{
							url = "igiveup";
						}
						that.loadContent(url,site);
					},
				});
			}else{
				$.ajax({
					url: apiEndPoint+"image/"+id,
					headers: {'Authorization': 'Client-ID 3c97f149c982123',},
					success: function(res){
						if(res.data.mp4) url = res.data.mp4;
						else url = res.data.link;
						if(res.data.title) iDesc.innerText = res.data.title;
						if(res.data.description) iDesc.innerText += " - " + res.data.description;
						that.loadContent(url,site);
					}
				});
			}
		}
	},

	handlerGfycat: function(url){
		var that = this;
		var site = url;
		var id = "";
		var parts = url.split("/");
		$.each(parts, function(i,x){
			if(x.includes("gfycat.com")){
				if(parts[i+1] != null){
					id = parts[i+1];
				}
			}
		});
		console.log("GFYCAT HANDLER "+id);
		if(id != ""){
			$.ajax({
				url: "http://gfycat.com/cajax/get/"+id,
				success: function(res){
					if(res.gfyItem.mp4Url) url = res.gfyItem.mp4Url;
					else url = "igiveup";
					that.loadContent(url,site);
				},
				error: function(res){
					that.loadContent("igiveup",site);
				}
			});
			
		}
	},

	handlerYoutube: function(url){
		var id = "";
		var site = url;
		var vars = this.getVars(url);
		if(url.includes("youtube.com")){
			if(vars.v) id = vars.v;
		}else if(url.includes("youtu.be")){
			id = url.split("/")[3];
		}
		console.log("YOUTUBE HANDLER "+id);
		if(id == "" || id.length != 11) url = "igiveup";
		else url = "https://i.ytimg.com/vi/"+id+"/mqdefault.jpg";
		iDesc.innerText = "Press [SPACE] to LOAD and FIX the video!";
		this.loadContent(url,site);
	},

	handlerReddit: function(url){
		var that = this;
		var site = url;
		var parts = url.split("/");
		var final = "";
		var done = 0;
		$.each(parts, function(i,x){
			if(done == 0){
				final += x+"/";
				if(x == "comments"){
					final += parts[i+1]+"/.json";
					done = 1;
				}
			}
		});
		console.log("REDDIT HANDLER "+final);
		$.ajax({
			url: final,
			success: function(res){
				if(res[0].data.children[0].data.url) url = res[0].data.children[0].data.url;
				else url = "igiveup";
				if(url == that.url) that.type = "FRA";
				that.loadContent(url,site);
			},
			error: function(res){
				that.loadContent("igiveup",site);
			}
		});
	},

	handlerRedditComments: function(url){
		this.type = "FRA";
		this.loadContent(url,url);
	},

	handlerPreview: function(url){
		var that = this;
		var site = url;
		$.ajax({
			url: "https://thumbnail.ws/get/thumbnail",
			data: {
				url: url,
				output: 'file',
				width: 600,
				fullpage: false,
				mobile: false,
				delay: 0,
				format: "JPEG"},
			success: function(res){
				if(res.screenshotUrl){
					url = res.screenshotUrl;
					iDesc.innerText = "Press [SPACE] to OPEN the website!";
				}
				else url = "igiveup";
				that.loadContent(url,site);
			},
			error: function(res){
				that.loadContent("igiveup",site);
			}
		});
	},

	// find format of link
	formatFinder: function(url){
		console.log("FORMAT FINDER");
		if(url.includes("i.ytimg.com/vi/")){
			this.type = "YOU";
		}else if(url.includes(".gifv") || url.includes(".mp4") || url.includes(".webm")){
			url = url.replace(".gifv",".mp4");
			this.type = "VID";
		}else if(url.includes(".jpeg") || url.includes(".jpg") || url.includes(".png") || url.includes(".gif")){
			this.type = "IMG";
		}
		return url;
	},

	// mouse over image with href
	mouseOverImg: function(e){
		e.target = $(e.target).closest("A")[0];
		this.mouseOverLink(e);
		return false;
	},

	// mouse over link
	mouseOverLink: function(e){
		if(this.fixed == 1) return false;
		if(e.target.href == null || e.target.href === "" || 
			e.target.href === window.location+"#" || e.target.href.includes("javascript:")){
			console.log("Can't find or invalid target or href...");
			return false;
		}

		this.unload = 0;

		var url = e.target.href;
		this.url = url;
		var blackListed = 0;

		// black list !!!
		$.each(this.blackList, function(i,x){
			//console.log(url+" --- "+x+" === "+url.includes(x));
			if(url.includes(x)) blackListed = 1;
		});
		if(blackListed == 1) return false;

		// updates only if is a different url
		if(url == this.old_url){
			console.log("SAME CONTENT!");
			this.loadContent(this.media,this.url);
		}else{
			this.old_url = url;

			this.cleanUp();
			this.type = "";
			this.scrollable_x = 0;
			this.gallery_i = 0;
			this.gallery = [];
			iDesc.innerText = "";
			iCnt.innerText = "";

			// show loading gif
			iLoad.style.display = 'block';
			
			this.linkDistributor(e,url);
		}
	},

	linkDistributor: function(e,url){
		// choose option depending on the link
		if(url.includes("imgur.com")){
			this.handlerImgur(url,0);
		
		}else if(url.includes("i.reddituploads.com") || url.includes("i.redd.it")){
			// TMP solution... not sure if is always an img
			this.type = "IMG";
			this.loadContent(url,url);
		
		}else if(url.includes("reddit.com/") && url.includes("/comments/")){
			this.old_url = "notfound";
			if(e.target.dataset.eventAction != "comments") this.handlerReddit(url);
			else this.handlerRedditComments(url);
		
		}else if(url.includes("gfycat.com")){
			this.handlerGfycat(url);
		
		}else if(url.includes("9gag.com")){
			this.handler9gag(url);
		
		}else if(url.includes("youtube.com") || url.includes("youtu.be")){
			this.type = "YOU";
			this.handlerYoutube(url);
		
		}else{
			this.handlerPreview(url);
		}
	},

	// loads media content (final = media link; url = website)
	loadContent: function(media, url){

		if(url != this.url){
			console.error("Another request just arrived... Late!");
			return false;
		}
		this.media = media;
		if(media == "igiveup") return false; // debug here? nothing logged...
		if(this.unload == 1){
			console.log("Mouse out! Unloaded!");
			return false;
		}

		media = media.replace("http://","https://");
		media = this.formatFinder(media);
		console.log("TYPE="+this.type+" | URL="+this.url+" | MEDIA="+media);

		if(this.type != "") iLoad.style.display = 'block';
		this.cleanUp();

		switch(this.type){

			case "IMG":
				this.addImage(media);
				break;

			case "VID":
				this.addVideo(media);
				break;

			case "YOU":
				if(this.media.includes("i.ytimg.com/vi/")) this.addImage(media);
				else this.addIframe(media);
				break;

			case "FRA":
				this.addIframe(media);
				break;

			default:
				console.log("Unknown [type]... I don't know what to do...");
				iLoad.style.display = 'none';
				break;
		}

	},

	// when media is loaded, get sizes
	contentLoaded: function(e){
		console.log("TYPE="+this.type+" | Content Loaded! "+e.target.src);
		if(this.unload == 1){
			console.log("Mouse out! Unloaded!");
			return false;
		}

		if(iDesc.innerText == "") iDesc.style.display = 'none';
		else iDesc.style.display = 'block';
		if(iCnt.innerText == "") iCnt.style.display = 'none';
		else iCnt.style.display = 'block';

		switch(this.type){

			case "IMG":
				this.th = this.iImg.height;
				this.tw = this.iImg.width;
				break;
			
			case "VID":
				this.tw = this.iVid.videoWidth;
				this.th = this.iVid.videoHeight;
				break;

			case "YOU":
				if(this.media.includes("i.ytimg.com/vi/")){
					this.th = this.iImg.height;
					this.tw = this.iImg.width;
				}else{
					this.tw = this.video_x;
					this.th = this.video_y;
				}
				break;

			case "FRA":
				this.fixed = 1;
				this.th = this.video_x;
				this.tw = this.video_y;
				break;
		};

		this.display();
	},

	// with mouse position, window size and media size, calculate where to show
	display: function(){
		//console.log("DISPLAY");
		
		iLoad.style.display = 'none';
		this.loaded = 1;

		var th = this.th;
		var tw = this.tw;
		var dist = this.dist;
		var window_x = this.window_x;
		var window_y = this.window_y;
		var mouse_x = this.mouse_x;
		var mouse_y = this.mouse_y;

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

		var width = 0;
		var height = 0;

		if(this.full_size == 1){
			// original size
			var rat = (tw*1.0)/(th*1.0);
			if(tw>this.window_x-dist-dist){
				width = this.window_x-dist-dist;
				height = width/rat;
			}else{
				width = tw;
				height = th;
			}
		}else{
			// adaptive size
			width = parseInt(tw*tmp);
			height = parseInt(th*tmp);
		}

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

		if(top+height>window_y-dist) top = window_y-height-dist;
		if(top<dist) top = dist;
		if(left+width>window_x-dist) left = window_x-width-dist;
		if(left<dist) left = dist;

		switch(this.type){

			case "IMG":
				this.iImg.style.display = 'block';
				this.iImg.width = width;
				this.iImg.height = height;
				if(height > window_y-dist-dist){
					this.scrollable = 1;
				}
				break;

			case "VID":
				this.iVid.style.display = 'block';
				this.iVid.width = width;
				this.iVid.height = height;
				this.iVid.play();
				break;

			case "YOU":
				if(this.media.includes("i.ytimg.com/vi/")){
					this.iImg.style.display = 'block';
					this.iImg.width = width;
					this.iImg.height = height;
				}else{
					this.iFra.style.display = 'block';
					this.iFra.width = width;
					this.iFra.height = height;
				}
				break;

			case "FRA":
				this.iFra.style.display = 'block';
				this.iFra.width = this.video_x;
				this.iFra.height = this.video_y;
				break;
		}

		iDiv.style.top = top+this.scrollable_x+"px";
		iDiv.style.left = left+"px";
		iDiv.style.display = 'block';

		//console.log("RACIO = "+tmp+" | OPT = "+opt);
		//console.log("O_W: "+tw+" | O_H: "+th);
		//console.log("N_W: "+width+" | N_H: "+height);
		//console.log("TOP: "+top+" | LEFT: "+left);
	},

	// clean up stuff
	mouseOut: function(e){
		if(this.fixed == 1) return false;

		//console.log("---------------------- LIMPANDO! ----------------------");

		this.unload = 1;
		this.loaded = 0;
		this.scrollable = 0;
		iLoad.style.display = 'none';

		//console.log(this.iImg+" "+this.iVid+" "+this.iFra);
		this.cleanUp();
		//console.log(this.iImg+" "+this.iVid+" "+this.iFra);

		iDiv.style.display = 'none';

		console.log("---------------------- LIMPO! ----------------------");
	},

	// delete elements
	cleanUp: function(){
		$.each($(iDiv).children(),function(i,x){
			if(x.id != "iDesc" && x.id != "iCnt") iDiv.removeChild(x);
		});
		if(this.iImg != null) this.iImg = null;
		if(this.iVid != null) this.iVid = null;
		if(this.iFra != null) this.iFra = null;
	},

	// get link vars
	getVars: function(link) {
		var vars = {};
		var parts = link.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
			vars[key] = value;
		});
		return vars;
	},

}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////
//////////////////////////////// START HERE //
//////////////////////////////////////////////

// prepare everything...
$(document).ready(function(){
	// ext stuff
	zz.initiate();

});

///////////////////////////////////////////////////////////////////////////////////////////////////////////
