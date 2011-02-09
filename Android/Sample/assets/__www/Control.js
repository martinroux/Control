//TODO: this.widgets should hold ALL widgets, including constants. this.constants and this.pages can be used to keep them separated.

function Control() {
	this.widgetCount = 0;
	this.contexts = new Array();
	this.pages = new Array();
	this.currentPage = 0;
	this.console.logWidth = null;
	this.console.logHeight = null;
	this.values = [];
	this.constants = [];
	this.valuesString = "";
	this.currentTab = document.getElementById("Interfaces");
	this.tabBarHidden = false;
	this.orientation = 0;
	acc = null;
	compass = null;
	gyro = null;
	interfaceDiv = document.getElementById("selectedInterface");
    /*
	PhoneGap.exec("OSCManager.startReceiveThread");
	PhoneGap.exec("Accelerometer.setUpdateRate", 50);
	PhoneGap.exec("Gyro.setUpdateRate", 50);
	*/
	this.changeTab(this.currentTab);

	return this;
}

Control.prototype.makePages = function(_pages,width, height) {
	pages = _pages;
	this.console.logWidth = width;
	this.console.logHeight = height;
	interfaceDiv.innerHTML = "";
	interfaceDiv.style.width = this.console.logWidth + "px";
	interfaceDiv.style.height = this.console.logHeight + "px";	
	interfaceDiv.style.position = "absolute";
	interfaceDiv.style.display = "block";
	interfaceDiv.style.left = "0px";
	interfaceDiv.style.top = "0px";	
	interfaceDiv.addEventListener('touchend', control.event, false);
	interfaceDiv.addEventListener('touchstart', control.event, false);
	interfaceDiv.addEventListener('touchmove', control.event, false);
	interfaceDiv.addEventListener('touchmove', preventBehavior, false);		
}

Control.prototype.showToolbar = function() {
	this.tabBarHidden = false;
	window.uicontrols.showTabBar();
}

Control.prototype.hideToolbar = function() {
	this.tabBarHidden = true;
	window.uicontrols.hideTabBar();
}

Control.prototype.setWidgetValueWithMIDIMessage = function(midiType, midiChannel, midiNumber, value) {
	if(typeof this.constants != "undefined") {
		for(var i = 0; i < this.constants.length; i++) {
			var w = this.constants[i];
			if(w.midiType == midiType && w.channel == midiChannel && w.midiNumber == midiNumber) {
				w.setValue(value, false);
				break;
			}else{
				if(w.widgetType == "MultiButton" || w.widgetType == "MultiSlider") { // TODO: optimize so that it looks at address - last digit
					for(var j = 0; j < w.children.length; j++) {
						var child = w.children[j];
						if(child.midiType == midiType && child.channel == midiChannel && child.midiNumber == midiNumber) {
							child.setValue(value, false);
							return;
						}
					}
				}// TODO: MultiTouchXY
			}	
		}
	}
	for(var i = 0; i < this.widgets.length; i++) {
		var w = this.widgets[i];
		if(w.midiType == midiType && w.channel == midiChannel && w.midiNumber == midiNumber) { // TODO: optimize so that it looks at address - last digit
			w.setValue(value, false);
			break;
		}else{
			if(w.widgetType == "MultiButton" || w.widgetType == "MultiSlider") {
				for(var j = 0; j < w.children.length; j++) {
					var child = w.children[j];
					if(child.midiType == midiType && child.channel == midiChannel && child.midiNumber == midiNumber) {
						child.setValue(value, false);
						return;
					}
				}
			}// TODO: MultiTouchXY 
		}	
	}		
}

Control.prototype.unloadWidgets = function() {
	//console.log("unloading all widgets");
	for(var page = 0; page < control.pages.length; page++) {
		for(var j = 0; j < control.pages[page].length; j++) {
			var widget = control.pages[page][j];
			if(typeof widget.unload != "undefined") {
				console.log("unloading " + widget.name);
				widget.unload();
			}
			widget = null;
		}
	}
}

Control.prototype.loadConstants = function(_constants) {
	if(_constants != null) {
		constants = _constants;

		this.constants = [];
		for(var i = 0; i < constants.length; i++) {
			var w = constants[i];
			var _w = this.makeWidget(w);						
			this.constants.push(_w);
			eval("this.addConstantWidget(" + w.name + ");"); // PROBLEM
		}
	}
}
	
Control.prototype.makeWidget = function(w) {
	var _w;
	//console.log("start " + w.type);
	if(w.type != "Accelerometer" && w.type != "Compass" && w.type != "Gyro") {
		_w = eval(w.name + " = new " + w.type + "(interfaceDiv,w);");
	
		if(_w.init != null) { 
			_w.init();
		}
	}else{
		if (w.type == "Accelerometer") {
            //acc = null;
            _w = eval(w.name + " = new ControlAccelerometer(w);");
            acc = _w;
		}else if(w.type == "Compass") {
            //compass = null;
            _w = eval(w.name + " = new ControlCompass(w);");
            compass = _w;
		}else if(w.type == "Gyro") {
            //gyro = null;
            _w = eval(w.name + " = new ControlGyro(w);");
            gyro = _w;
		}
        _w.start();        
	}
	_w.widgetID = this.widgetCount++;
	_w.name = w.name;
	
	return _w;
}

Control.prototype.loadWidgets = function() {
	console.log("loading start of widgets");
	this.widgets = new Array();
	this.pages = new Array();
	for(var currentPage = 0; currentPage < pages.length; currentPage++) {
		this.pages.push(new Array());
        var page = pages[currentPage];
		for(var i=0; i < page.length; i++) {
			var w = page[i];
			var _w = this.makeWidget(w);
			this.widgets.push(_w);
			console.log("pushing " + _w.name);
			eval("this.addWidget(" + w.name + ", currentPage);"); // PROBLEM
		}
	}
}

Control.prototype.getValues = function() {
	/*var str = "";
	for(var i = 0; i < this.values.length; i++) {
		var _widgetOutputs = this.values[i];
		str += this.widgets[i].address + ":"; // TODO: This needs to be abstracted somehow to accomodate wireless MIDI
		for(var j = 0; j < _widgetOutputs.length; j++) {
			str += _widgetOutputs[j];
			if(j != _widgetOutputs.length - 1) {
				str += ",";
			}
		}
		if(i != this.values.length - 1) {
			str += "|";
		}
	}
	return str;
	*/
	return control.valuesString;
}

Control.prototype.clearValuesString = function() {
	control.valuesString = "";
}

Control.prototype.addConstantWidget = function(widget) {
	if(widget.show != null)
		widget.show();
	
	if(widget.draw != null)
		widget.draw();
		
	eval(widget.oninit);
}

Control.prototype.addWidget = function(widget, page) {
	console.log("adding " + widget.name);
	this.pages[page].push(widget);
	if(page == this.currentPage) {
		if(widget.show != null) {
			widget.show();
			console.log("showing " + widget.name);			
		}
		if(widget.draw != null) {
			console.log("drawing " + widget.name);			
			widget.draw();
		}
	}else{
		if(widget.hide != null)
			widget.hide();
	}
	console.log("init " + widget.name);
	eval(widget.oninit);
	//widget.oninit();
}


Control.prototype.removeWidget = function(widgetID) {
	shouldRefresh = false;
	
	for(i in this.widgets) {
		widget = this.widgets[i];
		if(widget.id == widgetID) {
			this.widgets.splice(i,1);
			shouldRefresh = true;
			break;
		}
	}
	
	if(shouldRefresh) {
		this.refresh();
	}
}

Control.prototype.refresh = function() {
	//this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

	for(i in control.widgets) {
		widget = control.widgets[i];
		//console.log("widget " + widget.widgetID + " not redrawing");
	  
		//if(widget.shouldDraw) {
			widget.draw();
			//widget.shouldDraw = false;
		//}
	}
}

Control.prototype.onRotation = function(event) {
	// console.log(event.orientation);

	control.orientation = event.orientation;
	
	if(loadedInterfaceName != null) {
		control.unloadWidgets();
		if(event.orientation == 0 || event.orientation == 180) {
			control.makePages(pages, console.log.width, console.log.height);
		}else{
			control.makePages(pages, console.log.height, console.log.width);
		}
		control.loadConstants(constants);
		control.loadWidgets();	// LOAD WIDGETS IS THE PROBLEM	
	}
}


Control.prototype.event = function(event) {
  // REMEMBER : IN EVENT METHODS TRIGGERED FROM THE WEBVIEW "THIS" REFERS TO THE HTML OBJECT THAT GENERATED THE EVENT
	var page = control.currentPage;
	//console.log("length = " + control.pages[page].length);
	for(var i = 0; i < control.pages[page].length; i++) {
		var widget = control.pages[page][i];
		//console.log("widget event for " + widget.name);
		widget.event(event);
	}
	
	for(var i = 0; i < control.constants.length; i++) {
		var widget = control.constants[i];
		widget.event(event);
	}
}

Control.prototype.drawWidgetsOnPage = function(page) {
	for(i in this.pages[page]) {
		var w = this.pages[page][i];
		w.draw();
	}
}

Control.prototype.changeTab = function(tab) {
    var oldTab = this.currentTab;
    
    this.currentTab.style.display = "none";
    this.currentTab = tab;
    
    this.currentTab.style.display = "block";    
    
    if(this.currentTab.id == "selectedInterface") {
	  interfaceScroller
      this.tabBarHidden = true;
      control.hideToolbar();
    }else{
      //document.getElementById("selectedInterface").style.display = "none";
      if(this.tabBarHidden) {
        this.tabBarHidden = false;	  
        control.showToolbar();
      }
	  if(oldTab.id == "selectedInterface") {
		control.unloadWidgets();
		document.getElementById("Interfaces").style.height = "100%";
	  }
    }
    
    //TODO : make it work to change from landscape selected interface to portrait main menus
    /*if(typeof oldTab != "undefined") {
        if(oldTab.id == "selectedInterface" && this.currentTab.id != "selectedInterface") {
            var interface = document.getElementById("selectedInterface");
            document.removeChild(interface);
            for(var i = 0; i < this.pages[this.currentPage].length; i++) {
                var w = this.pages[this.currentPage][i];
                console.log("hiding");
                w.hide();
            }
            //document.getElementById("selectedInterface").style.display = "none";
        }
    }*/
    if(this.currentTab.id == "Interfaces") {
        //interfaceManager.createInterfaceListWithStoredInterfaces();
    }
}

Control.prototype.changePage = function(newPage) {
	if(typeof newPage === 'string') {
		if(newPage === 'next') {
		  newPage = this.currentPage + 1;
		}else if(newPage === 'previous') {
		  newPage = this.currentPage - 1;
		}
	}
  
	if(newPage < this.pages.length && newPage >= 0) {
		for(var i = 0; i < this.pages[this.currentPage].length; i++) {
			var w = this.pages[this.currentPage][i];
			if(typeof w.hide != "undefined")
				w.hide();
		}

		this.currentPage = newPage;

		for(var i = 0; i < this.pages[this.currentPage].length; i++) {
			var w = this.pages[this.currentPage][i];
			//console.log("name: " + w.name + " || page : " + this.currentPage);
			if(typeof w.show != "undefined")							
				w.show();
			if(typeof w.draw != "undefined")				
				w.draw();
		}
	}
}