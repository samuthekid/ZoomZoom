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
	target : null,

	// preview links
	previewLinks: 0,

	// distance to window borders
	dist: 25,

	// media type
	type: "",
	old_media: "",
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
				"reddit.com/?",
				"reddit.com/user/"],

	// key presses
	keyboardPress: function(e){
		if(this.loaded == 0) return false;
		var code = e.keyCode;
		var prevent = true;
		//alert(code);
		

		// SPACE --- play/pause --- scroll down img --- load iframe/video --- unfix iframe/video
		if(code == 32){
			if(this.type == "VID"){
				if(this.iVid.paused){
					this.iVid.play();
				}else{
					$.notify("Paused", "info");
					this.iVid.pause();
				}
			}else if(this.type == "IMG"){
				if(this.full_size == 1 && this.scrollable == 1){
					this.scrollable_x -=this.scrollable_delta;
					$("#iDiv").animate({
						top: "-="+this.scrollable_delta,
						}, 200, function(){});
				}
				if(this.media.includes("thumbnail.ws/output/")){
					this.type = "FRA";
					this.old_url = "notfound";
					this.old_media = "";
					iDesc.innerText = "";
					iCnt.innerText = "";
					this.fixed = 1;
					$.notify("Loading page", "info");
					this.loadContent(this.url,this.url);
				}
			}else if(this.type == "YOU" && this.media.includes("i.ytimg.com/vi/")){
				this.cleanUp();
				iDesc.innerText = "";
				iCnt.innerText = "";
				this.fixed = 1;
				var parts = this.getVars(this.media);
				var link = "https://www.youtube.com/embed/"+this.media.substring(23,34)+(parts.t?"?start="+parts.t:"");
				$.notify("Loading video", "info");
				this.loadContent(link,this.url);
			}else if(this.type == "YOU" && this.media.includes("youtube.com/embed")){
				this.fixed = 0;
				this.mouseOut();
			}else if(this.type == "FRA"){
				this.fixed = 0;
				this.mouseOut();
			}


		// V --- real/adapted size
		}else if(code == 118){
			this.full_size = 1-this.full_size;
			this.scrollable_x = 0;
			if(this.full_size == 1) $.notify("Real size", "info");
			else $.notify("Adapted size", "info");
			this.display();


		// B --- scroll up img
		}else if(code == 98){
			if(this.type == "IMG" && this.full_size == 1 && this.scrollable == 1){
				this.scrollable_x +=this.scrollable_delta;
				$("#iDiv").animate({
					top: "+="+this.scrollable_delta,
					}, 200, function(){});
			}


		// F --- fix/unfix
		}else if(code == 102){
			this.fixed = 1-this.fixed;
			if(this.fixed == 0){
				$.notify("Unfixed", "info");
				this.mouseOut();
			}else{
				$.notify("Fixed", "info");
			}


		// N --- previous item in gallery
		}else if(code == 110){
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
			this.formatFinder(tmp,this.url);


		// M --- next item in gallery
		}else if(code == 109){
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
			this.formatFinder(tmp,this.url);


		// D --- toggle description
		}else if(code == 100){
			if(iDesc.innerText == "") return false;
			if(iDesc.style.display == "block") iDesc.style.display = "none";
			else iDesc.style.display = "block";
			$.notify("Description hidden", "info");


		// T --- open in new tab
		}else if(code == 116){
			window.open(this.media, '_blank');


		// S --- save content
		}else if(code == 115){
			var name = this.media.split("/");
			name = name[name.length-1];	
			var a = $("<a>").attr("href", this.media).attr("download", name).appendTo("body");
			a[0].click();
			a.remove();
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
		$(document).on('mouseover', 'a', this.mouseOverLink.bind(this));
		$(document).on('mouseout', 'a', this.mouseOut.bind(this));
		// adds the events to all imgs
		$(document).on('mouseover', 'img', this.mouseOverOther.bind(this));
		$(document).on('mouseout', 'img', this.mouseOut.bind(this));
		// adds the events to all videos
		$(document).on('mouseover', 'video', this.mouseOverOther.bind(this));
		$(document).on('mouseout', 'video', this.mouseOut.bind(this));
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
		iLoad.style.zIndex = '99997';
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
		iDiv.style.zIndex = '99995';
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
		iDesc.zIndex = '99996';
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
		iCnt.zIndex = '99996';
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

	// GOES TO FormatFinder
	handler9gag: function(med,url){
		var that = this;
		var id = med.split("/gag/")[1];
		var id = id.split("?")[0];
		//console.log("9GAG HANDLER "+id);
		if(id == null || id == "") return false;
		var img = "http://img-9gag-fun.9cache.com/photo/"+id+"_700b.jpg";
		var vid = "http://img-9gag-fun.9cache.com/photo/"+id+"_460sv.mp4";
		$.get(vid)
			.done(function(){
				that.formatFinder(vid,url);
			}).fail(function(){
				that.formatFinder(img,url);
			})
	},

	// GOES TO FormatFinder
	handlerImgur: function(med,url,tt){
		var that = this;
		var id = "";
		var parts = med.split("/");
		$.each(parts, function(i,x){
			if(x.includes("imgur.com")){
				if(parts[i+1] == "a" || parts[i+1] == "gallery") id = parts[i+2];
				else id = parts[i+1];
			}
		});
		if(id.includes(".")) id = id.split(".")[0];
		var apiEndPoint = "https://api.imgur.com/3/";
		//console.log("IMGUR HANDLER "+id);
		if(id != ""){
			if(med.includes("/a/") || med.includes("/gallery/")){
				if(med.includes("/a/")) apiEndPoint+="album/";
				else if(med.includes("/gallery/")) apiEndPoint+="gallery/";
				$.ajax({
					url: apiEndPoint+id,
					headers: {'Authorization': 'Client-ID 3c97f149c982123',},
					success: function(res){
						if(res.data.images){
							// more than 1 img
							$.each(res.data.images, function(i,x){that.gallery.push(x);});
							that.gallery_i = 0;
							if(res.data.gifv) med = that.gallery[0].gifv;
							else if(res.data.mp4) med = that.gallery[0].mp4;
							else med = that.gallery[0].link;
							if(that.gallery[0].title) iDesc.innerText = that.gallery[0].title;
							if(that.gallery[0].description) iDesc.innerText += " - " + that.gallery[0].description;
							if(that.gallery.length > 1) iCnt.innerText = that.gallery_i+1+"/"+that.gallery.length;
						}else{
							// just 1 img
							if(res.data.gifv) med = res.data.gifv;
							else if(res.data.mp4) med = res.data.mp4;
							else med = res.data.link;
							if(res.data.title) iDesc.innerText = res.data.title;
							if(res.data.description) iDesc.innerText += " - " + res.data.description;
						}
						that.formatFinder(med,url);
					},
					error: function(res){
						if(tt<3){
							if(med.includes("/a/")){
								med = med.replace("/a/","/gallery/");
							}else if(med.includes("/gallery/")){
								med = med.replace("/gallery/","/a/");
							}
							that.handlerImgur(med,url,tt+1);
						}else{
							med = "igiveup";
							that.formatFinder(med,url);
						}
					},
				});
			}else{
				$.ajax({
					url: apiEndPoint+"image/"+id,
					headers: {'Authorization': 'Client-ID 3c97f149c982123',},
					success: function(res){
						if(res.data.gifv) med = res.data.gifv;
						else if(res.data.mp4) med = res.data.mp4;
						else med = res.data.link;
						if(res.data.title) iDesc.innerText = res.data.title;
						if(res.data.description) iDesc.innerText += " - " + res.data.description;
						that.formatFinder(med,url);
					}
				});
			}
		}
	},

	// GOES TO FormatFinder
	handlerGfycat: function(med,url){
		var that = this;
		var id = "";
		var parts = med.split("/");
		$.each(parts, function(i,x){
			if(x.includes("gfycat.com")){
				if(parts[i+1] != null){
					id = parts[i+1];
				}
			}
		});
		//console.log("GFYCAT HANDLER "+id);
		if(id != ""){
			$.ajax({
				url: "http://gfycat.com/cajax/get/"+id,
				success: function(res){
					if(res.gfyItem.mp4Url) med = res.gfyItem.mp4Url;
					else med = "igiveup";
					that.formatFinder(med,url);
				},
				error: function(res){
					that.formatFinder("igiveup",url);
				}
			});
			
		}
	},

	// GOES TO FormatFinder
	handlerYoutube: function(med,url){
		this.type = "YOU";
		var id = "";
		var vars = this.getVars(med);
		if(med.includes("youtube.com")){
			if(vars.v) id = vars.v;
		}else if(med.includes("youtu.be")){
			id = med.split("/")[3].split("?")[0];
		}
		//console.log("YOUTUBE HANDLER "+id);
		if(id == "" || id.length != 11) med = "igiveup";
		else med = "https://i.ytimg.com/vi/"+id+"/mqdefault.jpg"+(vars.t?"?t="+vars.t:"");
		this.formatFinder(med,url);
	},

	// GOES TO FormatFinder AND LinkDistributor
	handlerReddit: function(med,url){
		var that = this;
		var parts = med.split("/");
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
		//console.log("REDDIT HANDLER "+final);
		$.ajax({
			url: final,
			success: function(res){
				if(res[0].data.children[0].data.url) med = res[0].data.children[0].data.url;
				else med = "igiveup";
				if(med.includes(that.url) || that.url.includes(med)) that.handlerRedditComments(med,url);
				else that.linkDistributor(med,url);
			},
			error: function(res){
				that.formatFinder("igiveup",url);
			}
		});
	},

	// GOES TO LoadContent
	handlerRedditComments: function(med,url){
		this.type = "FRA";
		this.loadContent(med,url);
	},

	// GOES TO LoadContent
	handlerVidMe: function(med,url){
		this.type = "FRA";
		med = med.replace("vid.me/","vid.me/e/");
		this.loadContent(med,url);
	},

	// GOES TO LinkDistributor
	handlerGoogleImgs: function(med,url){
		this.type = "IMG";
		var vars = this.getVars(med);
		med = vars.imgurl;
		med = decodeURIComponent(med);
		console.log(med);
		this.linkDistributor(med,url);
	},

	// GOES TO LinkDistributor
	handlerPreview: function(med,url){
		var that = this;
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
					med = res.screenshotUrl;
					iDesc.innerText = "Press [SPACE] to PREVIEW the website!";
				}
				else med = "igiveup";
				that.linkDistributor(med,url);
			},
			error: function(res){
				that.linkDistributor("igiveup",url);
			}
		});
	},

	// mouse over image with href
	mouseOverOther: function(e){
		e.target = $(e.target).closest("A")[0];
		this.mouseOverLink(e);
		return false;
	},

	// mouse over link
	mouseOverLink: function(e){
		if(this.fixed == 1) return false;
		if(e.target.href == null || e.target.href === "" || 
			e.target.href === window.location+"#" || e.target.href.includes("javascript:")){
			//console.log("Can't find or invalid target or href...");
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
		if(url == this.old_url && this.type != ""){
			console.log("SAME CONTENT!");
			this.loadContent(this.media,this.url);
		}else{
			this.old_url = url;

			this.cleanUp();
			this.type = "";
			this.scrollable_x = 0;
			this.gallery_i = 0;
			this.gallery = [];
			this.target = e.target;
			this.media = "";
			iDesc.innerText = "";
			iCnt.innerText = "";
			
			this.linkDistributor(url,url);
		}
	},

	// Chooses an option depending on the link
	linkDistributor: function(med,url){

		// mouse already out!
		if(this.unload == 1) return false;
		// another request has already passed here!
		if(url != this.url) return false;
		// debug here? nothing logged...
		if(med == "igiveup") return false;

		console.log("MEDIA="+med+" | OLD_MEDIA="+this.old_media);

		if(med != this.old_media){

			this.old_media = med;

			// APIs
			// filter the links that need to go through an API
			if(med.toLowerCase().includes("imgur.com/")){
				this.handlerImgur(med,url,0);
			
			}else if(med.toLowerCase().includes("reddit.com/") && med.toLowerCase().includes("/comments/")){
				this.old_url = "notfound"; // forces to reload between content and comments
				this.old_media = ""; // this too
				if(this.target.dataset.eventAction != "comments") this.handlerReddit(med,url);
				else this.handlerRedditComments(med,url);
			
			}else if(med.toLowerCase().includes("gfycat.com/")){
				this.handlerGfycat(med,url);
			
			}else if(med.toLowerCase().includes("9gag.com/")){
				this.handler9gag(med,url);
			
			}else if(med.toLowerCase().includes("vid.me/")){
				this.handlerVidMe(med,url);
			
			}else if(med.toLowerCase().includes("youtube.com/") || med.toLowerCase().includes("youtu.be/")){
				this.handlerYoutube(med,url);
			
			}else if(med.toLowerCase().includes("google.") && med.toLowerCase().includes("/imgres?")){
				this.handlerGoogleImgs(med,url);

			}else{
				this.formatFinder(med,url);
			}

		}else{
			this.formatFinder(med,url);
		}
	},

	// Find the format for the media link
	formatFinder: function(med,url){

		// mouse already out!
		if(this.unload == 1) return false;
		// another request has already passed here!
		if(url != this.url) return false;
		// debug here? nothing logged...
		if(med == "igiveup") return false;

		iLoad.style.display = 'block';

		// Media Types
		if(med.toLowerCase().includes("i.ytimg.com/vi/")){
			this.type = "YOU";
			iDesc.innerText = "Press [SPACE] to LOAD and FIX the video!";
			this.loadContent(med,url);
		
		}else if(med.toLowerCase().includes("i.reddituploads.com")){
			this.type = "IMG";
			this.loadContent(med,url);
		
		}else if(med.toLowerCase().includes(".gifv")
		 	|| med.toLowerCase().includes(".mp4") 
		 	|| med.toLowerCase().includes(".webm")){
			med = med.replace(".gifv",".mp4");
			this.type = "VID";
			this.loadContent(med,url);
		
		}else if(med.toLowerCase().includes(".jpeg") 
			|| med.toLowerCase().includes(".jpg") 
			|| med.toLowerCase().includes(".png") 
			|| med.toLowerCase().includes(".gif")){
			this.type = "IMG";
			this.loadContent(med,url);
		
		}else{
			if(this.previewLinks == 1){
				this.type = "FRA";
				this.handlerPreview(med,url);
			}else iLoad.style.display = 'none';
		}

	},

	// loads media content (media = media link; url = website)
	loadContent: function(media, url){

		// mouse already out!
		if(this.unload == 1) return false;
		// another request has already passed here!
		if(url != this.url) return false;
		// debug here? nothing logged...
		if(media == "igiveup") return false;

		console.log("TYPE="+this.type+" | MEDIA="+media+" | URL="+this.url);

		//media = media.replace("http://","https://");
		this.media = media;

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

		// mouse already out!
		if(this.unload == 1) return false;
		// another request has already passed here!
		if(e.target.src != this.media) return false;

		console.log("TYPE="+this.type+" | Content Loaded! "+e.target.src);

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
				this.tw = this.video_x;
				this.th = this.video_y;
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

		iDiv.style.top = top+this.scrollable_x+"px";
		iDiv.style.left = left+"px";
		iDiv.style.display = 'block';

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
				this.iFra.width = width;
				this.iFra.height = height;
				break;
		}

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

		$("body").focus();
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
