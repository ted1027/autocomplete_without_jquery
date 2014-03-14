
/** auto complete method **/

var autocomplete = function(){
	var autocomplete = function(id, data, options){
		'use strict';
		this.data = [];
		this.$this = document.getElementById(id);
		this.$this.classList.add('auto-complete');
		this.$this.innerHTML = '<ul class="tag-cover"></ul><ul style="display:none;" class="chosen-selector"></ul>';
		this.$this.thisobj = this;
		this.$this.addEventListener("click", this.mainCoverClickHandler, false);
		
		this.$tagCover = this.$this.getElementsByClassName('tag-cover')[0];	//fake input
		this.$chosenSelector = this.$this.getElementsByClassName('chosen-selector')[0];	//fake comboBox 
		
		this.$input;	
		
		this.selectPosition = -1;	//current selected option position.
		this.activeList = [];	//list options which matched to key word.
		this.lastValue = null;	//last time matched keyword.
		
		this.setData(data);
		
		this.initSearchElement();
		this.hideSelector();
		this.selectorTimeout = -1;	//selector hide timeout value.
	}

	autocomplete.prototype = {
		setData: function(data){	//set combobox data
			this.data = data;
			this.initChoice();
		},
		getResult: function(){	//get result
			var result = [];
			var chosen = this.$tagCover.getElementsByClassName('chosen-tag');
			for(var i = 0, len = chosen.length; i < len ; i++)
				result.push({
					value: chosen[i].firstChild.attributes['data-index'].value,
					name: chosen[i].firstChild.innerHTML
				});
			return result;
		},
		initChoice: function(){		//initialize combobox options by data
			var html = "";
			for(var i = 0, len = this.data.length ; i < len ; i++){
				html += "<li style='' class='chosen-ele' data-index='" + i + "'>" + this.data[i].name + "</li>";
			}
			
			this.$chosenSelector.innerHTML = html;
			var eles = this.$chosenSelector.getElementsByClassName('chosen-ele');
			for(var i = 0, len = eles.length ; i < len ; i++){
				var itm = eles[i];
				itm.thisobj = this;
				itm.addEventListener("click", this.choiceClickHandler, false);
			}
			this.refreshChosen('');
		},
		initSearchElement: function(){	   //initialize search input
			var li = document.createElement("li");
			li.innerHTML = "<input>";
			this.$tagCover.appendChild(li);
			this.$input = li.getElementsByTagName('input')[0];
			this.$input.thisobj = this;
			this.$input.addEventListener("blur", this.inputBlurHandler, false);
			this.$input.addEventListener("focus", this.inputFocusHandler, false);
			this.$input.addEventListener("keydown", this.inputKeyDownHandler, false);
			this.$input.addEventListener("keyup", this.inputKeyUpHandler, false);
		},
		hideSelector: function(bool){
			if (bool === false){
				clearTimeout(this.selectorTimeout);
				this.$chosenSelector.style.display = "block";
			}
			else
				this.$chosenSelector.style.display = "none";
		},
		search: function(n){
			var r = this.ternaryTree.search(n);
			console.log(r);
		},
		addTagElement: function(tag){	//add a match input tag.
			var li = document.createElement("li");
			li.classList.add('chosen-tag');
			li.innerHTML = "<span data-index='" + tag.value + "'>" + tag.name + "</span><a class='chosen-close'></a>";
			this.$tagCover.insertBefore(li, this.$tagCover.lastChild);
			li.getElementsByTagName('a')[0].addEventListener("click", this.tagClickHandler, false);
		},
		resetChoice: function(){
			this.$chosenSelector.scrollTop = 0;
			this.selectPosition = -1;
			this.activeList = [];
		},
		resetAll: function(){
			this.resetChoice();
			this.hideSelector();
			this.lastValue = null;
			this.refreshChosen("");
			this.$input.value = "";
		},
		refreshChosen: function(value){	//refresh option by key word.
			var showflag = false;
			if (value)
				value = value.toLowerCase();
			
			if (this.lastValue === value)	//prevent match contents if same key word
				return false;
			
			this.lastValue = value;
			this.resetChoice();
			//console.time(1);
			for(var i = 0, len = this.data.length ; i < len ; i++){
				var ele = this.$chosenSelector.childNodes[i];
				var word = this.data[i].name.toLowerCase();
				ele.classList.remove('chosen');
				
				if (word.indexOf(value) !== -1){
					ele.style.display = "list-item";
					this.activeList.push(ele);
					if (!showflag)
						ele.classList.add('chosen');
					this.selectPosition = 0;
					showflag = true;
				}
				else
					ele.style.display = "none";
			}
			//console.timeEnd(1);
			
			if (showflag)
				this.hideSelector(false);
		},
		//relocate combobox scroll position
		scrollRelocate: function(isUp){
			var diff = this.selectPosition - Math.floor( this.$chosenSelector.scrollTop / 25 );
			if (!isUp && (diff > 3 || diff < 0))
				this.$chosenSelector.scrollTop = (this.selectPosition - 3) * 25;
			else if (isUp && (diff > 3 || diff < 0))
				this.$chosenSelector.scrollTop = (this.selectPosition) * 25;
		},
		inputKeyDownHandler: function(e){
			var thisobj = this.thisobj;
			switch(e.keyCode){
				case 13:	//enter
					var ele = thisobj.activeList[thisobj.selectPosition];
					if (ele){
						var itm = thisobj.data[parseInt(ele.attributes['data-index'].value, 10)];
						thisobj.addTagElement(itm);
						thisobj.resetAll();
					}
					e.preventDefault();
					break;
				case 38:	//up
				case 40:	//down
					var oldEle = thisobj.activeList[thisobj.selectPosition],
					newPosition = (e.keyCode == 38) ? thisobj.selectPosition - 1 : thisobj.selectPosition + 1,
					newEle = thisobj.activeList[newPosition];
					
					if (newPosition <= -1){
						thisobj.hideSelector();
						thisobj.selectPosition = -1;
					}
					else{
						thisobj.hideSelector(false);
						if (newEle){
							if (oldEle)
								oldEle.classList.remove('chosen');
							newEle.classList.add('chosen');
							thisobj.selectPosition = newPosition;
						}
					}
					
					if (e.keyCode == 38)
						thisobj.scrollRelocate(true);
					else
						thisobj.scrollRelocate(false);
					
					
					e.preventDefault();
					break;
			}
		},
		inputKeyUpHandler: function(e){
			var thisobj = this.thisobj;
			switch(e.keyCode){
				case 13:	//enter
				case 38:	//up
				case 40:	//down
					break;
				default:
					thisobj.refreshChosen(e.target.value);
					break;
			}
		},
		inputFocusHandler: function(e){
			var thisobj = this.thisobj;
			thisobj.hideSelector(false);
		},
		inputBlurHandler: function(e){
			var thisobj = this.thisobj;
			//blur will trigger faster then click, so wait 200ms.
			thisobj.selectorTimeout = setTimeout(function(){
				thisobj.hideSelector();
			}, 200);
		},
		tagClickHandler: function(e){
			e.target.parentNode.remove();
			e.stopPropagation();
		},
		choiceClickHandler: function(e){
			var thisobj = this.thisobj;
			var n = parseInt(e.target.attributes['data-index'].value, 10);
			thisobj.addTagElement(thisobj.data[n]);
			thisobj.resetAll();
			e.stopPropagation();
			thisobj.$input.focus();
		},
		mainCoverClickHandler: function(e){
			var thisobj = this.thisobj;
			if(e.target == thisobj.$tagCover)
				thisobj.$input.focus();
		}
	}
	
	return autocomplete;
}();

