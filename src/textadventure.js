function TextAdventure(containerId, options, locationsData, victoryConditions, startingInventory){

  // properties and gamedata of the Text Adventure
  this.locations = {};
  this.newGameLocations = JSON.stringify(locationsData);      // copy of the initial locations object to use when restarting
  this.newStartingInventory = JSON.stringify(startingInventory);  // copy of initial starting inventory to use when restarting
  this.victoryConditions = victoryConditions;
  this.options = options;
  this.player;
  this.extensions;

  // game essential variables
  this.usedObjects = [];   // Stores list of used objects so victory conditions can be checked
  this.promptMode = false; // sets the game in prompt mode when needed
  this.currentPrompt = []; // references to the current prompt (prompts can be nested)
  this.gameVictory = false;

  // UI elements
  this.container;
  this.containername = containerId;
  this.outputContainer;
  this.inputField;
  this.tutorialMessages = [];
  this.tutorialMessageCount = 0;

  // some helper variables and objects
  this.firstMessageDisplayed = false;
  this.timer;
  this.timerInterval = 10;
  this.typedCommands = [];
  this.typedCommandsIndex = 0;
  this.storage;
  this.canStore = false;
  

  this.debug("***** LOADING GAME *****");
  this.debug("Initializing text adventure");
  

  // set height to undefined if it isn't a number:
  if(this.options.height!==undefined && typeof this.options.height !== "number") {
    this.options.height = undefined;
  }

  // detect local storage capabilities
  try {
    // try setting up local storage
    this.storage = window.localStorage;
    var x = '__storage_test__';
    this.storage.setItem(x, x);
    this.storage.removeItem(x);
    this.canStore = true;
    
    this.debug("Browser is localStorage capable");

    // extending storage with functions to set and get JSON objects
    // (needed because localStorage.setItem only supports strings)
    Storage.prototype.setObject = function(key, value) {
      this.setItem(key, JSON.stringify(value));
    };
    Storage.prototype.getObject = function(key) {
      return JSON.parse(this.getItem(key));
    };
  } catch(e) {
    // try did not work: set canStore flag to false
    this.canStore = false;
  }


  // assign tutorial messages either from the options or the defaults:
  if(this.options.tutorial_messages !== undefined) {
    this.tutorialMessages = this.options.tutorial_messages;
  } else {
    this.tutorialMessages = ["To play, type an instruction or command followed by the RETURN key.",
      "Have a look in your inventory to see what you are currently carrying.",
      "If you are stuck, examine your current location or an object for hints.",
      "Use the UP and DOWN arrow keys to view previously typed instructions."];
  }
  

  // get the container element from the DOM 
  this.container = document.getElementById(containerId);

  // set up the game container:
  this.debug("Preparing container with game elements");
  this.container.innerHTML = "";

  // container for the output of the game
  this.outputContainer = document.createElement("div");
  this.outputContainer.className = "dal-ta-output";

  // append container for output to dom
  this.container.appendChild(this.outputContainer);

  // container for the input field
  var inputContainer = document.createElement("div");
  inputContainer.className = "dal-ta-input";

  // create field and set properties
  this.inputField = document.createElement("input");
  this.inputField.type = "text";
  this.inputField.name = "dal-ta-inputfield";
  this.inputField.placeholder = this.tutorialMessages[this.tutorialMessageCount];
  this.inputField.autofocus = true;
  this.inputField.focus();

  // add the event handler
  this.inputField.addEventListener("keypress", function(e){
    if(e.keyCode===13) {
      // User hit enter, sending the command to the parser
      this.parseCommand(e.target.value);
      // empty the input field
      this.inputField.value="";
    }
  }.bind(this), true);

  this.inputField.addEventListener("keydown", function(e){
    // up arrow = 38
    // down arrow = 40
    if(e.keyCode===38) {
      // user hit up arrow key: show previously typed commands:
      this.showTypedCommand(-1);
    }

    if(e.keyCode===40) {
      // user hit down arrow: show next command in queue
      this.showTypedCommand(1);
    }
  }.bind(this), true);

  // append input to container
  inputContainer.appendChild(this.inputField);
  // append container for input to dom
  this.container.appendChild(inputContainer);

  // set height of the text adventure container and its elements
  // check if a height was passed as option
  if(this.options.height!==undefined) {
    this.container.style.height = this.options.height+"px";
    this.outputContainer.style.height = (this.options.height - inputContainer.clientHeight)+"px";
  }

  // start the game (needs to be in a separate function so we can restart the game later)
  this.start();
}




TextAdventure.prototype.start = function() {
  
  // print title and description (and help, if wanted)
  this.printLine("<h2>"+ this.options.title +"</h2>", "title");
  this.printLine(this.options.description, "description");

  // display the help information as initial message
  if(this.options.show_help) {
    this.displayHelp();
  }

  // check for existing saves:
  if(this.canStore && this.storage.getItem("TA_CURRENTLOCATION")!==null) {
    this.debug("Local save found, resuming save.");
    this.printLine("... Resuming game from previous save", "info");
    
    // save found, loading in saved locations object
    this.locations = this.storage.getObject("TA_LOCATIONS");
    // Initialize player with saved inventory and starting location
    this.player = new Player(this.storage.getObject("TA_INVENTORY"), this.storage.getItem("TA_CURRENTLOCATION"));

    // fill up the used objects array with all objects in the game that are flagged as used
    for(var location in this.locations) {
      for(var obj in this.locations[location].objects) {
        if(this.locations[location].objects[obj].is_used) {
          this.usedObjects.push(obj);
        }
      }
    }

  } else {
    this.debug("No local save available, setting up new game");
    // no save available, loading in new locations
    this.locations = JSON.parse(this.newGameLocations);
    // Initialize player with starting inventory and location
    console.log(this.locations);
    console.log(this.locations.startlocation);
    this.player = new Player(JSON.parse(this.newStartingInventory), this.locations.startlocation);
  }

  this.checkForVictory();

  // when a save has been loaded, it's good to check for victory on init.
  if(!this.gameVictory) {
    // print the current location text:
    console.log(this.locations["start"]);
    console.log(this.player);
    this.printLine(this.locations[this.player.getLocation()].text_on_visit);
    // mark this location as visited (although it might already be)
    this.locations[this.player.getLocation()].visited = true;
    // clear all prompts (fix for bug when closing and reopening game)
    this.currentPrompt = [];
    // check if the location has a prompt
    this.checkForPrompt("this.locations." + this.player.getLocation() + ".prompts");
  }
};



/*
  Parse incoming commands
  ---
  command  command received from the input field
*/
TextAdventure.prototype.parseCommand = function(command) {
  var actionTaken = false;

  this.debug("***** COMMAND *****");
  this.debug("Received command : "+ command);

  // convert the entire command into lower case
  command = command.toLowerCase().trim();

  // check if the game is in prompt mode
  if(this.promptMode) {
    this.debug("Game in prompt mode.")
    this.debug("Checking input against valid prompt responses."); 
    // load up the current response
    var responseObj = {};
    var validResponseFound = false;
    var nextPromptToCheck = "";
    // load up the current prompt:
    var promptObj = eval(this.getCurrentPrompt()[0] + "." + this.getCurrentPrompt()[1]);
    // loop through possible responses:
    for(var response in promptObj.responses) {
      // only do this if a matching prompt answer hasn't already been found:
      if(!actionTaken) {
        this.debug("Checking response: "+ response);
        // load up this response:
        responseObj = promptObj.responses[response];
        // compare input from player with valid commands in the response object, if match, execute this prompt
        var found = false;
        var i = 0;
        // loop through possible inputs on this response: 
        while(!found && i<responseObj.valid_commands.length) {
          if(command === responseObj.valid_commands[i]) {
            found = true;
          }
          i++;
        }
        if(found) {
          this.debug("Proper response found");
          // command found: execute!
          this.printLine(responseObj.response_text);
          actionTaken = true;
          this.promptMode = false;
          // response trigger: 
          this.trigger(responseObj, "response_trigger");
          // indicate that this prompt has been shown in case it shouldn't be repeated
          eval(this.getCurrentPrompt()[0] + "." + this.getCurrentPrompt()[1]).has_prompted = true;
          // indicate that this response has been chosen so we can check for it later 
          eval(this.getCurrentPrompt()[0] + "." + this.getCurrentPrompt()[1]).responses[response].is_chosen = true;
          // check if this response should give the player an object:
          if(responseObj.receive_object !== undefined && responseObj.receive_object !== "") {
            this.debug("Receiving object "+ responseObj.receive_object);
            this.player.addItemToInventory(responseObj.receive_object, this.locations[this.player.getLocation()].objects[responseObj.receive_object]);
            this.printLine(this.locations[this.player.getLocation()].objects[responseObj.receive_object].text_on_pickup);
          }
          // check if this prompt should relocate the player to a new location
          if(responseObj.goto_location !== undefined && responseObj.goto_location !== "") {
            // when moving, reset all prompts
            this.resetPrompts();
            nextPromptToCheck = "";
            // and move
            this.moveToLocation(responseObj.goto_location);
          } else {
            // check for the next prompt
            nextPromptToCheck = this.getCurrentPrompt()[0] + "." + this.getCurrentPrompt()[1] +".responses."+response+".prompts";
            this.checkForPrompt(nextPromptToCheck); 
            this.prepareNextTurn(command, actionTaken);
          }
        }
      }
    }
    
    if(!actionTaken) {
      // the command didn't trigger a valid response
      this.printLine("This wasn't a valid response.", "error");
    } else {
      // check for further prompts:
    }



  } else {
    // not in prompt mode: continuing in regular mode

    var matchLength = 0;

    if(command === "help") {
      // display help
      this.displayHelp();

    } else if(command === "inventory") {
      // display inventory
      this.displayInventory();

    } else if(command === "look around") {
      // display location description
      this.printLine(this.locations[this.player.getLocation()].description);

    } else if(command.search(/^(pick up|take|grab)\s/) !== -1) {
      // pick up command
      // get the length of what was matched
      matchLength = command.match(/^(pick up|take|grab)\s/)[0].length;
      // use the length to determine what is being picked up, discarding "the" if it's there
      var pickedupObject = command.substring(matchLength).replace("the ", "");
      // proceed with picking it up: 
      actionTaken = this.validatePickup(pickedupObject);

    } else if(command.search(/^(examine|look at)\s/) !== -1) {
      // examine command
      // get the length of what was matched
      matchLength = command.match(/^(examine|look at)\s/)[0].length;
      // use the length to determine what is being picked up, discarding "the" if it's there
      var examinedObject = command.substring(matchLength).replace("the ", "");
      // examine the object
      this.validateExamine(examinedObject);

    } else if(command.search(/^(go|move)\s/) !== -1) {
      // go command
      // get the length of what was matched
      matchLength = command.match(/^((?:go|move)(?:\sto)?)\s/)[0].length;
      // use the length to determine what is being picked up, discarding "the" if it's there
      var direction = command.substring(matchLength).replace("the ", "");
      // move to this direction 
      actionTaken = this.validateMoveDirection(direction);

    } else if(command.search(/^(use)\s/) !== -1) {
      // use command
      // tests for which version of the command: 
      var test1 = /^(?:use)\s(.*)(?:\son\s)(.*)/;
      var test2 = /^(?:use)\s(.*)/;
      var results = [];
      // test the first version:
      if(command.search(test1) !== -1) {
        // command is "use x on y":
        results = command.match(test1);
        actionTaken = this.validateUse(results[1].replace("the ", ""), results[2].replace("the ", ""));
      } else {
        // command is just use x:
        results = command.match(test2);
        actionTaken = this.validateUse(results[1].replace("the ", ""), "");
      }
    } else {
      // invalid command
      this.printLine("That instruction wasn't understood.", "error");
    }

  }

  this.prepareNextTurn(command, actionTaken);

};



/* 
  Some functionality to be executed after each typed commands: 
  ---
  command       the command that was typed (for saving in commands list)
  actionTaken   boolean to indicate if the command resulted in an action
*/
TextAdventure.prototype.prepareNextTurn = function(command, actionTaken) {
  
  // tutorial messages:
  // increase message count and print out tutorial placeholders based on it
  this.tutorialMessageCount++;
  if(this.tutorialMessageCount < this.tutorialMessages.length) {
    this.inputField.placeholder = this.tutorialMessages[this.tutorialMessageCount];
  } else {
    this.inputField.placeholder = "";
  }

  // inputted command list
  // add typed in command to list of commands:
  this.typedCommands.push(command);
  this.typedCommandsIndex = this.typedCommands.length;

  // in this turn, an action has been taken that requires a save and check for victory
  if(actionTaken) {
    if(this.canStore) {
      this.debug("Actionable turn, saving progress");
      this.saveProgress();
    }
    this.debug("Actionable turn, checking for victory");
    // only check for victory when there isn't an active prompt...
    this.checkForVictory();
  } else {
    this.debug("Not an actionable turn, no need to save or check for victory");
  }
};



/*
  Validate if a given direction is valid
  ---
  d   Direction of the move 
      This should correspond with a direction set in the game data JSON for this location
*/
TextAdventure.prototype.validateMoveDirection = function(d){
  this.debug("Testing direction "+ d +" for validity");
  var valid = false;
  var dirObj, dirId, locationId, locationName;
  var l = "";
  // check all possible directions in the current location
  for(var direction in this.locations[this.player.getLocation()].directions) {
    if(direction===d) {
      valid = true;
      dirId = direction;
    } else {
      // if no match, check if player has entered the actual name of the location instead
      locationId = this.locations[this.player.getLocation()].directions[direction].location;
      locationName = this.locations[locationId].name;
      if(locationName.toLowerCase() === d) {
        valid = true;
        dirId = direction;
      }
    }
  }
  // move:
  if(valid) {
    if(!this.resolvedDependency(dirId)) {
      this.debug("Access to this location is blocked");
      this.printLine(this.locations[this.player.getLocation()].directions[dirId].text_on_error, "error");
      return false;
    } else {
      moveToLocation(this.locations[this.player.getLocation()].directions[dirId].location);
      return true;
    }
  } else {
    printLine("That is not a possible direction.", "error");
    return false;
  }
};
  
  

/* 
Move the game to a new location: 
---
newLocation   the location to move to
*/
TextAdventure.prototype.moveToLocation = function(newLocation) {
  this.debug("Moving to location "+ newLocation);
  // set the new location for the player
  this.player.setLocation(newLocation);
  // print the entry text
  this.printLine(this.locations[this.player.getLocation()].text_on_visit);
  // check for a trigger
  this.trigger(this.locations[this.player.getLocation()], "visit_trigger");
  // mark this location as visited
  this.locations[this.player.getLocation()].visited = true;
  // check for prompt on new location: 
  this.checkForPrompt("this.locations." + this.player.getLocation() + ".prompts");
};



/* 
  Validate if specified objects can be used
  ---
  o   Object 1: the object being used.
  ou  Object 2: the object which Object 1 is being used on
*/
TextAdventure.prototype.validateUse = function(o, ou) {
  this.debug("Testing objects for valid use: "+ o +", "+ ou);
  var validObject = false;
  var validObjectUse = false;
  var obj, objId, objOnUse, objOnUseId;

  // find the first object: 
  var foundObject1 = this.isObjectAvailable(o);
  // is it object available
  if(foundObject1 !== false) {
    objId = foundObject1[0];
    obj = foundObject1[1];
    
    // is there a second object?
    if(ou!=="") {
      // SECOND OBJECT:

      // check if the 2nd specified object is available
      var foundObject2 = this.isObjectAvailable(ou);
      if(foundObject2 !== false) {
        objOnUseId = foundObject2[0];
        objOnUse = foundObject2[1];

        // can the object be used on the second object
        if(obj.can_use_on_object === objOnUseId) {
          // check dependencies for both objects
          if(this.resolvedDependency(o) && this.resolvedDependency(ou)) {
            // dependencies are resolved
            // object can be used on second object
            this.debug(o + " and " + ou + "can be used together.");
            this.printLine(obj.text_on_use_object_on);
            this.locations[this.player.getLocation()].objects[objOnUseId].is_used = true;
            if(obj.remove_after_use) {
              this.player.deleteItemFromInventory(objId);
            }
            // keep track of used objects (by id) in an array
            this.usedObjects.push(objId);
            // should custom code be executed?
            this.trigger(obj, "use_trigger");
            return true;
          } else {
            // which dependency needs to be resolved?
            if(!this.resolvedDependency(objId)) {
              this.debug(o +" has an unresolved dependency");
              this.printLine(obj.text_on_error);
            } else if(!this.resolvedDependency(objOnUseId)) {
              this.debug(ou +" has an unresolved dependency");
              this.printLine(objOnUse.text_on_error);
            }
            return false;
          }
        } else {
          this.debug(o +" can not be used on "+ ou);
          this.printLine("Can't use the "+ o +" that way.", "error");
          return false;
        }

      } else {
        // second object can't be found: 
        this.printLine(ou + " isn't here to use", "error");
      }
      
      
    } else {
      // can object be used
      if(obj.can_use) {
        // check dependency;
        if(this.resolvedDependency(o)) {
          // dependency resolved, object can be used
          // use object and see if it needs to be removed
          this.printLine(obj.text_on_use);
          this.locations[this.player.getLocation()].objects[objId].is_used = true;
          if(obj.remove_after_use) {
            this.player.deleteItemFromInventory(objId);
          }
          // keep track of used objects (by id) in an array
          this.usedObjects.push(objId);
          // should custom code be executed?
          this.trigger(obj, "use_trigger");
          return true;
        } else {
          // dependency needs to be resolved:
          this.printLine(obj.text_on_error);
          return false;
        }
      } else {
        if(obj.can_use_on_object!==false) {
          this.debug(o +" can not be used by itself");
          this.printLine("The "+ o +" can't be used that way.", "error");
        } else {
          this.debug(o + "can not be used at all");
          this.printLine("The "+ o +" can't be used.", "error");
        }
        return false;
      }
    }
  } else {
    this.printLine("There's no "+ o + " to use", "error");
    return false;
  }
};



/*
  Validates if an object can be examined
  ---
  q   The object to be examined
*/
TextAdventure.prototype.validateExamine = function(q) {
  this.debug("Testing "+ q +" for examine");
  // check object availability
  var obj = this.isObjectAvailable(q);
  // is it a valid object ?
  if(obj !== false) {
    this.printLine(obj[1].description);
    this.trigger(obj, "examine_trigger");
  } else {
    this.printLine(q + " is not something you can examine.", "error");
  }
};



/* 
  Checks if an object can be picked up
  ---
  o   The object to be picked up
*/
TextAdventure.prototype.validatePickup = function(o) {
  
  this.debug("Testing object "+ o +" for picking up.");

  // is the object to pick up available?
  var foundObject = this.isObjectAvailable(o);

  if(foundObject===false) {
    // object wasn't found:
    printLine(o +" can not be picked up.", "error");

  } else {

    var objectID = foundObject[0];
    var obj = foundObject[1];

    if(obj.can_pickup) {
      // object can be picked
      if(obj.picked_up) {
        // but has been picked up already
        this.printLine("You have already picked up the "+ o, "error");
        return false;
      } else if(!this.resolvedDependency(objectID)) {
        // but depends on a another object which isn't yet met  
        this.printLine(obj.text_on_error);
        return false;
      } else {
        // can definitely be picked up:
        // add to inventory
        this.player.addItemToInventory(objectID, obj);
        // indicate the object is picked up
        this.locations[this.player.getLocation()].objects[objectID].picked_up = true;
        // output message
        this.printLine("You put the "+ obj.name +" in your inventory");
        this.trigger(obj, "pickup_trigger");
        return true;
      }

    } else {
      // object exists but can't be picked up
      this.printLine("You can't pick up the "+ o, "error");
      return false;
    }

  }
};



/* 
  Check for victory conditions:
  This function takes the list of victory conditons passed to the game earlier and checks if they are met
*/
TextAdventure.prototype.checkForVictory = function() {
  var objId = "";
  
  this.debug("***** VICTORY CONDITIONS CHECK *****");
  
  // check for location:
  if(this.victoryConditions.conditions.in_location==="" || this.victoryConditions.conditions.in_location===this.player.getLocation()) {
    // check for picked up objects
    for (var i=0; i<this.victoryConditions.conditions.have_objects.length; i++) {
      objId = this.victoryConditions.conditions.have_objects[i];
      if(!this.player.inInventory(objId)) {
        this.debug("Victory conditions not met: have object "+ objId);
        return false;
      }
    }
    
    var foundObj = false;
    // check for used objects
    for(i=0; i<this.victoryConditions.conditions.used_objects.length; i++) {
      // loop through used objects list:
      objId = this.victoryConditions.conditions.used_objects[i];
      for(var j=0; j<this.usedObjects.length; j++) {
        if(objId===this.usedObjects[j]) {
          foundObj = true;
        }
      }
      
      if(!foundObj) {
        this.debug("Victory conditions not met: used object "+ objId);
        return false;
      }
    }

    var loc = "";
    var locVisited = false;
    // check for visited locations: 
    for(i=0; i<this.victoryConditions.conditions.visited_locations.length; i++) {
      // get the name of this location
      loc = this.victoryConditions.conditions.visited_locations[i];
      // see if visited flag is set for this location:
      if(this.locations[loc].visited !== undefined) {
        if(this.locations[loc].visited !== true) {
          this.debug("Victory conditions not me: location "+ loc +" not visited");
          return false;
        }
      } else {
        this.debug("Victory conditions not me: location "+ loc +" not visited");
        return false;
      }
    }

    // check for responses:
    // are there any set? 
    if(this.victoryConditions.conditions.has_responded.length > 0) {
      // there are responses to check:   
      var responseIDs = [];
      var responseString = "";
      var responseObj = {};
      for(i=0; i<this.victoryConditions.conditions.has_responded.length; i++) {
        /* 
        Each condition in the conditions array is shaped up as "location.prompt_id.response_id".
        prompt_id.response_id could be repeated several times for nested prompts.
        Split the condition string into an array using the "." character 
        Index 0 is always the location: locations.arrayIndexValue
        Uneven array index becomes: .prompts.arrayIndexValue
        Even array index becomes: .responses.arrayIndexValue
        */
        responseIDs = this.victoryConditions.conditions.has_responded[i].split(".");
        responseString = "this.locations."+ responseIDs[0];
        // 2. loop through resulting array:
        for(var j=1; j<responseIDs.length; j++) {
          // 3. if uneven add .prompt., otherwise add .responses.
          if(j%2 === 1) {
            responseString += ".prompts." + responseIDs[j];
          } else {
            responseString += ".responses." + responseIDs[j];
          }
          // 
        }
        // ealuate the whole string into an object
        responseObj = eval(responseString);
        if(responseObj === undefined) {
          // condition couldn't be found, probably an error in the game data:
          this.debug("Condition "+ this.victoryConditions.conditions.has_responded[i] +" could not be found. Verify your game data.");
          return false;
        } else if(responseObj.is_chosen !== undefined) {
          // there is an is_chosen flag on this response
          if(responseObj.is_chosen === false) {
            // it's false (technically this should never happen!), so the response has not been triggered yet
            this.debug("Condition "+ this.victoryConditions.conditions.has_responded[i] + " not met");
            return false;
          } 
        } else {
          // there is no is_chosen flag, so the response has not been triggered yet
          this.debug("Condition "+ this.victoryConditions.conditions.has_responded[i] + " not met");
          return false;
        }

        
      }
    }

    // all checks have passed without exiting the fucntion: VICTORY!
    this.printLine(this.victoryConditions.victory_text, "victory");
    this.inputField.disabled = true;
    this.gameVictory = true;

    // check for the victory trigger: 
    this.trigger(this.victoryConditions, "victory_trigger");

  } else {
    this.debug("Victory conditions not met: in location "+ this.victoryConditions.conditions.in_location);
    return false;
  }
};



/*
  Check for prompt: shows prompt is available
  ---
  promptRef   reference to the prompt to be checked
*/
TextAdventure.prototype.checkForPrompt = function(promptRef) {
  // check if player location has a prompt:
  this.debug("***** PROMPTS *****");
  if(eval(promptRef) === undefined) {
    this.debug("No pompt found");
    // no prompt found on this object, check follow-ups
    this.debug("Checking for for follow-up prompts");
    // loop through the previous prompt-objects to see if there are other prompts to show
    while(this.currentPrompt.length > 0) {
      if(!this.checkForPrompt(this.getCurrentPrompt()[0])) {
        this.removeLastPrompt();
        return false;
      } else {
        return true;
      }
    }

  } else {
    // load up this prompt
    var promptObj = eval(promptRef);
    // loop through the prompts found here:
    for(var prompt in promptObj) {
      // check if there's a previous prompt
      var promptCheck = "";
      if(this.getCurrentPrompt().length > 0) {
        promptCheck = this.getCurrentPrompt()[1];
      } 
        // check if this prompt matches the previous one (if so, don't do anything)
        if(prompt === promptCheck) {
          this.debug(prompt + " has just been shown.");
        } else {     
          var conditionsMet = true; 
          // check for a condition to show this
          if(promptObj[prompt].prompt_conditions !== undefined) {
            // there are conditions to show this prompt, check for proper responses: 
            this.debug(prompt +" has conditions. Checking if they are met.");
            var responseIDs = [];
            var responseString = "";
            var responseObj = {};
            for(var i=0; i<promptObj[prompt].prompt_conditions.length; i++) {
              /* 
              Each condition in the conditions array is shaped up as "location.prompt_id.response_id".
              prompt_id.response_id could be repeated several times for nested prompts.
              Split the condition string into an array using the "." character 
              Index 0 is always the location: locations.arrayIndexValue
              Uneven array index becomes: .prompts.arrayIndexValue
              Even array index becomes: .responses.arrayIndexValue
              */
              responseIDs = promptObj[prompt].prompt_conditions[i].split(".");
              responseString = "this.locations."+ responseIDs[0];
              // 2. loop through resulting array:
              for(var j=1; j<responseIDs.length; j++) {
                // 3. if uneven add .prompt., otherwise add .responses.
                if(j%2 === 1) {
                  responseString += ".prompts." + responseIDs[j];
                } else {
                  responseString += ".responses." + responseIDs[j];
                }
                // 
              }
              // ealuate the whole string into an object
              responseObj = eval(responseString);
              if(responseObj === undefined) {
                // condition couldn't be found, probably an error in the game data:
                this.debug("Condition "+ promptObj[prompt].prompt_conditions[i] +" could not be found. Verify your game data.");
                conditionsMet = false;
              } else if(responseObj.is_chosen !== undefined) {
                // there is an is_chosen flag on this response
                if(responseObj.is_chosen === false) {
                  // it's false (technically this should never happen!), so the response has not been triggered yet
                  conditionsMet = false;
                  this.debug("Condition "+ promptObj[prompt].prompt_conditions[i] + " not met");
                } 
              } else {
                // there is no is_chosen flag, so the response has not been triggered yet
                conditionsMet = false;
                this.debug("Condition "+ promptObj[prompt].prompt_conditions[i] + " not met");
              }

              
            }
          }

          /*
          check if all requirements for showing this prompt are met: 
          1. the prompt hasn't been shown before, and all conditions for showing it are met
          2. the prompt has been shown before, but can be repeated, and all conditions for showing it are met
          */
        if((!promptObj[prompt].has_prompted && conditionsMet) || (promptObj[prompt].has_prompted && promptObj[prompt].can_repeat && conditionsMet)) {
          this.debug("Showable prompt found: "+ prompt);
          // set game to prompt-mode
          this.promptMode = true;
          // add this prompt to the current prompt array for rechecking later
          this.currentPrompt.push([promptRef, prompt]);
          // print the prompt
          this.printLine(promptObj[prompt].prompt_text, "prompt");
          return true;
        } else {
          this.debug("Prompt "+ prompt +" can't be shown");
        }

      }  
    } 
    
    return false;
  }
};



/* 
  Looks at the current prompt array and retrieves the object based on it
*/
 TextAdventure.prototype.getCurrentPrompt = function() {
  if(this.currentPrompt.length === 0) {
    return [];
  } else {
    return this.currentPrompt[this.currentPrompt.length-1];
  }
};



/* 
  Removes the last prompt from the currenprompts array
*/
TextAdventure.prototype.removeLastPrompt = function() {
  this.currentPrompt.pop();
};



/* 
  clears all prompts
*/
TextAdventure.prototype.resetPrompts = function() {
  this.currentPrompt = [];
};



/* 
  Checks if an object is available in the player inventory or in the current location
  Returns false if no object is available
  Rerturns an array containing the object ID and object itself when available
  ---
  o   Object name or id to be checked for availability
*/
TextAdventure.prototype.isObjectAvailable = function(o) {
  var objectId = "";
  if(this.player.inInventory(o)) {
    debug(o +" found in inventory.");
    objectId = this.player.getItemIDFromInventory(o);
    return [objectId, this.player.getItemFromInventory(objectId)];
  } else {
    for(objectId in this.locations[this.player.getLocation()].objects) {
      if(objectId === o || this.locations[this.player.getLocation()].objects[objectId].name.toLowerCase() === o) {
        this.debug(o +" found in location.");
        return [objectId, this.locations[this.player.getLocation()].objects[objectId]];
      }
    }
  }
  this.debug(o +" not found.");
  return false;
};



/* 
  Find an object in the locations object, returns the id of object if found, returns false if not found
  ---
  o   The object to find
  ---
  NOTE: could possibly be done in the isObjectAvailable function
*/
TextAdventure.prototype.findObjectInLocation = function(o) {
  for(var object in this.locations[this.player.getLocation()].objects) {
    if(this.locations[l].objects[object].name===o) {
      return object;
    }
  }
  return false;
};



/* 
  Checks if there is an object dependency on the query and if it is fulfilled
  Returns true if dependency is resolved, false if there is a dependency to resolve
  --
  oId   The id of the object or direction to check
*/ 
TextAdventure.prototype.resolvedDependency = function(oId) {
  this.debug("**** DEPENDENCY TEST ****");
  this.debug("Testing "+ oId +" for dependencies.");
  var obj, objId, objDep;

  var foundObject = isObjectAvailable(oId);

  // is it a direction or an object:
  if(foundObject !== false){
    // is the object in the inventory?
    objID = foundObject[0];
    obj = foundObject[1];

    if(obj.depends_on!=="") {
      // there is!
      // get the object to check if it has been used
      objDep = this.locations[this.player.getLocation()].objects[obj.depends_on];
      if(objDep.is_used) {
        this.debug("Has dependency, is resolved.");
        return true;
      } else {
        this.debug("Has dependency, is not resolved.");
        return false;
      }
    } else {
      this.debug("Hasn't got a dependency.");
      return true;
    }
  } else {
    // the query is a direction
    if(this.locations[this.player.getLocation()].directions[oId].depends_on!=="") {
      // there is a dependency!
      // get the object to check if it has been used
      oD = this.locations[this.player.getLocation()].objects[this.locations[this.player.getLocation()].directions[oId].depends_on];
      if(oD.is_used) {
        this.debug("Has dependency, is resolved.");
        return true;
      } else {
        this.debug("Has dependency, is not resolved.");
        return false;
      }
    } else {
      this.debug("Hasn't got a dependency.");
      return true;
    }
  }
};



/*
  Save progress in local storage
*/ 
TextAdventure.prototype.saveProgress = function(){
  if(this.canStore) {
    this.storage.setObject("TA_LOCATIONS", this.locations);
    this.storage.setObject("TA_INVENTORY", this.player.getInventory());
    this.storage.setItem("TA_CURRENTLOCATION", this.player.getLocation());
  }
};



/*
  Restart the game by reloading all game data
*/
TextAdventure.prototype.restart = function() {
  // reset some important variables
  this.usedObjects = [];  
  this.promptMode = false;
  this.gameVictory = false;
  this.currentPrompt = [];
  this.firstMessageDisplayed = false;
  this.typedCommands = [];
  this.typedCommandsIndex = 0;
  this.player = {};

  // clear save in localstorage
  if(this.canStore) {
    this.storage.removeItem("TA_LOCATIONS");
    this.storage.removeItem("TA_INVENTORY");
    this.storage.removeItem("TA_CURRENTLOCATION");
  }

  this.inputField.disabled = false;

  // restart:
  this.start();
};



/*
  Trigger function checks if a trigger is available in game data and executes the trigger if it is found
  ---
  obj   The object to check the trigger on
  trig  The trigger type
*/
TextAdventure.prototype.trigger = function(obj, trig) {
  if(obj[trig]!==undefined) {
    this.debug("Trigger "+ trig +" found");
    if(obj[trig].function_call !== undefined && obj[trig].function_call !== "")
    this.extensions[obj[trig].function_call](obj[trig].function_parameters, this);
  }
};



/*
  Shows the help information and command list
*/
TextAdventure.prototype.displayHelp = function() {
  this.debug("Displaying help");
  var helpText = "<p>Explore all locations, collect items and solve puzzles to beat the game. Here is a list of instructions you can use to get started:</p>";
  var commandlist = {
    "help": {
      description: "Displays this information"
    },
    "inventory": {
      description: "Displays the items in your character's inventory"
    },
    "look around": {
      description: "Take a look at your current location."
    },
    "go": {
      description: "Go in a specific direction (or to a specific location or object)"
    },
    "pick up": {
      description: "Pick up an object and put it in your inventory"
    },
    "examine": {
      description: "Take a closer look at an object in your inventory or in your current location."
    },
    "use": {
      description: "Use an object in your inventory or location (on a specific object)"
    }
  };
  helpText += this.buildDefinitionList(commandlist);
  this.printLine(helpText, "help");
};



/* 
  Shows all items in the inventory
*/ 
TextAdventure.prototype.displayInventory = function() {
  this.debug("Displaying the inventory");
  var inventoryText = "<h2>Inventory</h2>";
  inventoryText += buildDefinitionList(this.player.getInventory());
  this.printLine(inventoryText, "inventory");
};



/* 
  Prints a line to the output container
  ---
  textToPrint    text to write out
  classToPrint   class to be added to the containing element (e.g. "error")
*/
TextAdventure.prototype.printLine = function(textToPrint, classToPrint) {
  // only do this if there is text to print (sometimes there might not be a text) 
  if(textToPrint !== undefined && textToPrint !== "") {
    // create new div 
    var item = document.createElement("div");
    // add item class
    item.className = "dal-ta-output-item";
    // see if a class is passed and needs to be added to the 
    if(classToPrint!==undefined) {
      item.className += " "+ classToPrint;
    }

    // replace markdown style markup with actual markup
    // check if the markup is present,
    // if it loop through the string to replace markup with actual HTML
    var startPos = 0;
    var foundPos = 0;
    var parsedText = "";
    var dataName = "";
    var dataClass = "";

    // TODO: replace this whole thing with a regular expression, maybe?
    while(textToPrint.indexOf("[", startPos)!==-1) {
      // look first occurrence of [ and get all text before it
      foundPos = textToPrint.indexOf("[", startPos);
      parsedText += textToPrint.substring(startPos, foundPos);
      startPos = foundPos+1;
      // get position of matching ] and all text between the brackets
      foundPos = textToPrint.indexOf("]", startPos);
      dataName = textToPrint.substring(startPos, foundPos);
      startPos = foundPos+2;
      // get whatever is between () to indicate its class
      foundPos = textToPrint.indexOf(")", startPos);
      dataClass = textToPrint.substring(startPos, foundPos);
      startPos = foundPos+1;
      // wrap all this in span tags
      parsedText += "<span class=\""+ dataClass + "\">"+ dataName +"</span>";
    }

    parsedText += textToPrint.substring(startPos, textToPrint.length);

    item.innerHTML = parsedText;
    this.outputContainer.appendChild(item);

    // adjust the top padding of the first item so the printed message gets aligned at the bottom:
    if(!this.firstMessageDisplayed) {
      this.firstMessageDisplayed = true;
      // only set a padding if there is a height set in options
      item.style.paddingTop = (this.outputContainer.clientHeight - item.clientHeight)+"px";
    }

    // scroll the item into view with an animation when there is an absolute height set in options
    window.clearInterval(this.timer);
    this.timer = window.setInterval(this.animateScroll, this.timerInterval, this);
  }
}



/* 
  Scrolls the text adventure window up to the latest message
  ---
  e   reference to the TextAdventure object calling the function
*/
TextAdventure.prototype.animateScroll = function(e){
  // scroll container up
  if(e.outputContainer.clientHeight >= (e.outputContainer.scrollHeight - e.outputContainer.scrollTop))
    window.clearInterval(e.timer);
  else
    e.outputContainer.scrollTop+=2;

  /* 
  todo :
    - dynamically set the scroll amount based on how much text needs to be scrolled (to speed up scrolling of large amount of text)
    - add smoothing?
  */
};



/* 
  Load typed command from list
  ---
  commandIndex   Either 1 for next command or -1 for previous
*/
TextAdventure.prototype.showTypedCommand = function(commandIndex) {
  // only do when there are commands that have been typed
  if(this.typedCommands.length!==0) {
    // increase the index
    this.typedCommandsIndex += commandIndex;
    // check for beginning of list, if so jump to last
    if(this.typedCommandsIndex < 0) {
      this.typedCommandsIndex = this.typedCommands.length-1;
    }
    // check if at end of list, if so jump to first 
    if(this.typedCommandsIndex >= this.typedCommands.length) {
      this.typedCommandsIndex = 0;
    } 
    debug("showing typed command, index: "+ this.typedCommandsIndex);
    // show the command
    this.inputField.value = this.typedCommands[this.typedCommandsIndex];
  }
};



/*
  Wraps information in a definition list which can then be outputted
  ---
  list  a list of names and descriptions to convert to definition lists to display
*/
TextAdventure.prototype.buildDefinitionList = function(list) {
  var convertedList = "<dl>";
  for(var item in list) {
    convertedList += (list[item].name===undefined) ? "<dt>"+item+"</dt>" : "<dt>"+list[item].name+"</dt>";
    convertedList += "<dd>"+ list[item].description +"</dd>";
  }
  convertedList += "</dl>";
  return convertedList;
};



/*
  Public function to allow the extension to be added
  ---
  e   The extension object
*/
TextAdventure.prototype.extend = function(e) {
  this.extensions = e;
};



/* 
  Writes out a line to console if debug is turned on in the options
  ---
  m   message to write to console
*/
TextAdventure.prototype.debug = function(message) {
  if(this.options.debug===true) console.log(message);
};

