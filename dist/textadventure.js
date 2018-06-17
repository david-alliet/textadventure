var Player = (function() {

  var currentLocation = "";
  var inventory = {};


  
  /*
    Initialize the player object
    ---
    si  Starting inventory
  */
  function init(si) {
    console.log("Initializing the player object");
    inventory = si;
  }



  /* 
    Get the current location id of the player
  */
  function getLocation() {
    return currentLocation;
  }



  /* 
    Set the current location of the player
    ---
    l   New location id
  */
  function setLocation(l) {
    currentLocation = l;
  }


  
  /*
    Check if an object is in the inventory
    ---
    item   object id
  */
  function inInventory(item) {
    for(var object in inventory) {
      if(object===item || inventory[object].name===item) return true;
    }
    return false;
  }



  /*
    Adds an item to the player's inventory
    ---
    id    the id of the object 
    item  the object with all its properties
  */
  function addItemToInventory(id, item) {
    inventory[id] = item;
  }



  /*
    Delete an object from the inventory
    ---
    id  id of the object to be deleted
  */
  function deleteItemFromInventory(id) {
    delete inventory[id];
  }



  /*
    Get a specific item from the inventory
    ---
    id  id of the object to be retrieved
  */
  function getItemFromInventory(id) {
    for(var item in inventory) {
      if(item===id || inventory[item].name===id)
        return inventory[item];
    }
  }



  /*
    Get the id of a specific item from the inventory based on its name
    ---
    name  the name of a possible inventory item
  */
  function getItemIDFromInventory(name) {
    for(var item in inventory) {
      if(inventory[item].name===name)
        return item;
    }
  }



  /*
    Get the full inventory
  */
  function getInventory() {
    return inventory;
  }

  
  
  /*
    Overwrite the complete inventory (used when loading the game from a save)
    ---
    inv the new inventory
  */
  function setInventory(inv) {
    inventory = inv;
  }



  
  return {
    init: init,
    getLocation: getLocation,
    setLocation: setLocation,
    getInventory: getInventory,
    setInventory: setInventory,
    addItemToInventory: addItemToInventory,
    getItemFromInventory: getItemFromInventory,
    getItemIDFromInventory: getItemIDFromInventory,
    deleteItemFromInventory: deleteItemFromInventory,
    inInventory: inInventory
  };
})();

var TextAdventure = (function (){

  // properties and gamedata of the Text Adventure
  var locations = {};
  var newGameLocations = {};      // copy of the initial locations object to use when restarting
  var newStartingInventory = {};  // copy of initial starting inventory to use when restarting
  var victoryConditions = {};
  var options;
  var player;
  var extensions;
  
  // game essential variables
  var usedObjects = [];   // Stores list of used objects so victory conditions can be checked
  var promptMode = false; // sets the game in prompt mode when needed
  var currentPrompt = []; // references to the current prompt (prompts can be nested)

  // UI elements
  var container;
  var outputContainer;
  var inputField;
  var tutorialMessages = [];
  var tutorialMessageCount = 0;

  // some helper variables and objects
  var firstMessageDisplayed = false;
  var timer;
  var timerInterval = 10;
  var typedCommands = [];
  var typedCommandsIndex = 0;
  var storage;
  var canStore = false;
  
  /*
    Init the game, gets passed the <div> container and the desired height of the box
    ---
    cid container id
    o   options
    l   game data, locations
    vc  game data, victory conditions object
    i   game data, player inventory
  */
  function init(containerId, gameOptions, locationsData, gameVictoryConditions, startingInventory) {

    
    // story copy of locations and inventory data so game can be reset
    newGameLocations = locationsData;
    newStartingInventory = startingInventory;
    
    // load in options and do some checking for validity
    options = gameOptions;
    if(options.height!==undefined && typeof options.height !== "number") {
      // set height to undefined if it isn't a number:
      options.height = undefined;
    }
    debug("***** LOADING GAME *****");
    debug("Initializing text adventure");

    container = document.getElementById(containerId);

    // detect local storage capabilities
    try {
      storage = window.localStorage;
      var x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
      canStore = true;
      debug("Browser is localStorage capable");

      // extending storage with functions to set and get JSON objects
      // (needed because localStorage.setItem only supports strings)
      Storage.prototype.setObject = function(key, value) {
        this.setItem(key, JSON.stringify(value));
      };
      Storage.prototype.getObject = function(key) {
        return JSON.parse(this.getItem(key));
      };
    } catch(e) {
      canStore = false;
    }

    victoryConditions = gameVictoryConditions;

    // assign the tutorial messages:
    tutorialMessages = ["To play, type an instruction followed by RETURN.",
      "Have a look in your inventory to see what you are currently carrying.",
      "If you are stuck, examine your current location or an object for hints.",
      "Use the UP and DOWN arrow keys to view previously typed instructions."];

    // prepare the TA container with the neccesary game elements
    prepareContainer();

    // set up the player object
    player = Object.create(Player);

    // check for existing saves:
    if(canStore && storage.getItem("TA_CURRENTLOCATION")!==null) {
      debug("Local save found, resuming save.");
      // save found, loading in saved locations object
      locations = storage.getObject("TA_LOCATIONS");
      // Initialize player with saved inventory
      player.init(storage.getObject("TA_INVENTORY"));
      // set current location based on save:
      player.setLocation(storage.getItem("TA_CURRENTLOCATION"));

      // fill up the used objects array with all objects in the game that are flagged as used:
      for(var location in locations) {
        for(var obj in locations[location].objects) {
          if(locations[location].objects[obj].is_used) {
            usedObjects.push(obj);
          }
        }
      }

    } else {
      debug("No local save available, setting up new game");

      // no save available, loading locations from parameters
      locations = locationsData;

      // Initialize player with starting inventory
      player.init(startingInventory);
      // set current location to starting location
      player.setLocation(locations.startlocation);
    }

    // print the current location text:
    printLine(locations[player.getLocation()].text_on_visit);
    // check if the location has a prompt
    checkForPrompt(locations[player.getLocation()]);
    // when a save has been loaded, it's good to check for victory on init.
    checkForVictory();
  }


  
  /*
    Set up the text adventure container with all the neccesary UI elements
  */
  function prepareContainer() {
    debug("Preparing container with game elements");
    container.innerHTML = "";

    // container for the output of the game
    outputContainer = document.createElement("div");
    outputContainer.className = "dal-ta-output";

    // append container for output to dom
    container.appendChild(outputContainer);

    // container for the input field
    var inputContainer = document.createElement("div");
    inputContainer.className = "dal-ta-input";

    // create field and set properties
    inputField = document.createElement("input");
    inputField.type = "text";
    inputField.name = "dal-ta-inputfield";
    inputField.placeholder = tutorialMessages[tutorialMessageCount];
    inputField.autofocus = true;
    inputField.focus();

    // add the event handler
    inputField.addEventListener("keypress", function(e){
      if(e.keyCode===13) {
        // User hit enter, sending the command to the parser
        TextAdventure.parseCommand(this.value);
        // empty the input field
        inputField.value="";
      }
    }, true);

    inputField.addEventListener("keydown", function(e){
      // up arrow = 38
      // down arrow = 40
      if(e.keyCode===38) {
        // user hit up arrow key: show previously typed commands:
        TextAdventure.showTypedCommand(-1);
      }

      if(e.keyCode===40) {
        // user hit down arrow: show next command in queue
        TextAdventure.showTypedCommand(1);
      }
    }, true);

    // append input to container
    inputContainer.appendChild(inputField);
    // append container for input to dom
    container.appendChild(inputContainer);

    // check if a height was passed as option
    if(options.height!==undefined) {
      // set height of the text adventure container and its elements
      container.style.height = options.height+"px";
      outputContainer.style.height = (options.height - inputContainer.clientHeight)+"px";
    }

    // display the help information as initial message
    displayHelp();
  }



  /*
    Parse incoming commands
    ---
    command  command received from the input field
  */
  function parseCommand(command) {
    var actionTaken = false;

    debug("***** COMMAND *****");
    debug("Received command : "+ command);

    // convert the entire command into lower case
    command = command.toLowerCase().trim();

    // check if the game is in prompt mode
    if(promptMode) {
      debug("Game in prompt mode: checking command against active prompt choices"); 
      // load up the current response
      // TODO: find a way to do this without using eval!!
      var responseObj = {};
      var validResponseFound = false;

      for(var response in eval("locations[player.getLocation()]" + getCurrentPrompt()).responses ) {
        // only do this if a matching prompt answer hasn't already been found:
        if(!actionTaken) {
          responseObj = eval("locations[player.getLocation()]" + getCurrentPrompt()).responses[response];

          // compare input from player with valid commands in the response object, if match, execute this prompt
          if(responseObj.valid_commands.toLowerCase().indexOf(command) !== -1) {
            // command found: execute!
            printLine(responseObj.response_text);
            actionTaken = true;
            // indicate that this prompt has been shown in case it shouldn't be repeated
            eval("locations[player.getLocation()]" + getCurrentPrompt()).has_prompted = true;
            // check if there is another prompt associated on this object
            if(!checkForPrompt(responseObj)) {
              // no further prompts found, resume normal mode:
              promptMode = false;
              // check if the user should be redirect to another location:
              if(responseObj.goto_location !== undefined && responseObj.goto_location !== "") {
                moveToLocation(responseObj.goto_location);
              }
            }

          }
        }
      }   

    } else {
      // not in prompt mode: continuing in regular mode

      var matchLength = 0;

      if(command === "help") {
        // display help
        displayHelp();

      } else if(command === "inventory") {
        // display inventory
        displayInventory();

      } else if(command === "look around") {
        // display location description
        printLine(locations[player.getLocation()].description);

      } else if(command.search(/^(pick up|take|grab)\s/) !== -1) {
        // pick up command
        // get the length of what was matched
        matchLength = command.match(/^(pick up|take|grab)\s/)[0].length;
        // use the length to determine what is being picked up, discarding "the" if it's there
        var pickedupObject = command.substring(matchLength).replace("the ", "");
        // proceed with picking it up: 
        actionTaken = validatePickup(pickedupObject);

      } else if(command.search(/^(examine|look at)\s/) !== -1) {
        // examine command
        // get the length of what was matched
        matchLength = command.match(/^(examine|look at)\s/)[0].length;
        // use the length to determine what is being picked up, discarding "the" if it's there
        var examinedObject = command.substring(matchLength).replace("the ", "");
        // examine the object
        validateExamine(examinedObject);

      } else if(command.search(/^(go|move)\s/) !== -1) {
        // go command
        // get the length of what was matched
        matchLength = command.match(/^((?:go|move)(?:\sto)?)\s/)[0].length;
        // use the length to determine what is being picked up, discarding "the" if it's there
        var direction = command.substring(matchLength).replace("the ", "");
        // move to this direction 
        actionTaken = validateMoveDirection(direction);

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
          actionTaken = validateUse(results[1].replace("the ", ""), results[2].replace("the ", ""));
        } else {
          // command is just use x:
          results = command.match(test2);
          actionTaken = validateUse(results[1].replace("the ", ""), "");
        }
      } else {
        // invalid command
        printLine("That instruction wasn't understood.", "error");
      }

    }


    // tutorial messages:
    // increase message count and print out tutorial placeholders based on it
    tutorialMessageCount++;
    if(tutorialMessageCount<tutorialMessages.length) {
      inputField.placeholder = tutorialMessages[tutorialMessageCount];
    } else {
      inputField.placeholder = "";
    }

    // inputted command list
    // add typed in command to list of commands:
    typedCommands.push(command);
    typedCommandsIndex = typedCommands.length;

    // in this turn, an action has been taken that requires a save and check for victory
    if(actionTaken) {
      if(canStore) {
        debug("Actionable turn, saving progress");
        saveProgress();
      }
      debug("Actionable turn, checking for victory");
      checkForVictory();
    } else {
      debug("Not an actionable turn, no need to save or check for victory");
    }
  }



  /*
    Validate if a given direction is valid
    ---
    d   Direction of the move 
        This should correspond with a direction set in the game data JSON for this location
  */
  function validateMoveDirection(d){
    debug("Testing direction "+ d +" for validity");
    var valid = false;
    var dirObj, dirId;
    var l = "";
    for(var direction in locations[player.getLocation()].directions) {
      //valid = true;
      if(direction===d) {
        valid = true;
        dirId = direction;
        dirObj = locations[player.getLocation()].directions[direction];
      }
    }
    // move:
    if(valid) {
      if(!resolvedDependency(dirId)) {
        debug("Access to this location is blocked");
        printLine(locations[player.getLocation()].directions[dirId].text_on_error, "error");
        return false;
      } else {
        moveToLocation(locations[player.getLocation()].directions[d].location);
        return true;
      }
    } else {
      printLine("That is not a possible direction.", "error");
      return false;
    }
  }
  
  
  
  /* 
  Move the game to a new location: 
  ---
  newLocation   the location to move to
  */
  function moveToLocation(newLocation) {
    debug("Moving to location "+ newLocation);
    // set the new location for the player
    player.setLocation(newLocation);
    // print the entry text
    printLine(locations[player.getLocation()].text_on_visit);
    // check for a trigger
    trigger(locations[player.getLocation()], "visit_trigger");
    // check for prompt on new location: 
    checkForPrompt(locations[player.getLocation()]);
  }



  /* 
    Validate if specified objects can be used
    ---
    o   Object 1: the object being used.
    ou  Object 2: the object which Object 1 is being used on
  */
  function validateUse(o, ou) {
    debug("Testing objects for valid use: "+ o +", "+ ou);
    var validObject = false;
    var validObjectUse = false;
    var obj, objId, objOnUse, objOnUseId;

    // find the first object: 
    var foundObject1 = isObjectAvailable(o);
    // is it object available
    if(foundObject1 !== false) {
      objId = foundObject1[0];
      obj = foundObject1[1];
      
      // is there a second object?
      if(ou!=="") {
        // SECOND OBJECT:

        // check if the 2nd specified object is available
        var foundObject2 = isObjectAvailable(ou);
        if(foundObject2 !== false) {
          objOnUseId = foundObject2[0];
          objOnUse = foundObject2[1];

          // can the object be used on the second object
          if(obj.can_use_on_object === objOnUseId) {
            // check dependencies for both objects
            if(resolvedDependency(o) && resolvedDependency(ou)) {
              // dependencies are resolved
              // object can be used on second object
              debug(o + " and " + ou + "can be used together.");
              printLine(obj.text_on_use_object_on);
              locations[player.getLocation()].objects[objOnUseId].is_used = true;
              if(obj.remove_after_use) {
                player.deleteItemFromInventory(objId);
              }
              // keep track of used objects (by id) in an array
              usedObjects.push(objId);
              // should custom code be executed?
              trigger(obj, "use_trigger");
              return true;
            } else {
              // which dependency needs to be resolved?
              if(!resolvedDependency(objId)) {
                debug(o +" has an unresolved dependency");
                printLine(obj.text_on_error);
              } else if(!resolvedDependency(objOnUseId)) {
                debug(ou +" has an unresolved dependency");
                printLine(objOnUse.text_on_error);
              }
              return false;
            }
          } else {
            debug(o +" can not be used on "+ ou);
            printLine("Can't use the "+ o +" that way.", "error");
            return false;
          }

        } else {
          // second object can't be found: 
          printLine(ou + " isn't here to use", "error");
        }
        
        
      } else {
        // can object be used
        if(obj.can_use) {
          // check dependency;
          if(resolvedDependency(o)) {
            // dependency resolved, object can be used
            // use object and see if it needs to be removed
            printLine(obj.text_on_use);
            locations[player.getLocation()].objects[objId].is_used = true;
            if(obj.remove_after_use) {
              player.deleteItemFromInventory(objId);
            }
            // keep track of used objects (by id) in an array
            usedObjects.push(objId);
            // should custom code be executed?
            trigger(obj, "use_trigger");
            return true;
          } else {
            // dependency needs to be resolved:
            printLine(obj.text_on_error);
            return false;
          }
        } else {
          if(obj.can_use_on_object!==false) {
            debug(o +" can not be used by itself");
            printLine("The "+ o +" can't be used that way.", "error");
          } else {
            debug(o + "can not be used at all");
            printLine("The "+ o +" can't be used.", "error");
          }
          return false;
        }
      }
    } else {
      printLine("There's no "+ o + " to use", "error");
      return false;
    }
  }



  /*
    Validates if an object can be examined
    ---
    q   The object to be examined
  */
  function validateExamine(q) {
    debug("Testing "+ q +" for examine");
    // check object availability
    var obj = isObjectAvailable(q);
    // is it a valid object ?
    if(obj !== false) {
      printLine(obj[1].description);
      trigger(obj, "examine_trigger");
    } else {
      printLine(q + " is not something you can examine.", "error");
    }
  }



  /* 
    Checks if an object can be picked up
    ---
    o   The object to be picked up
  */
  function validatePickup(o) {
    
    debug("Testing object "+ o +" for picking up.");

    // is the object to pick up available?
    var foundObject = isObjectAvailable(o);

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
          printLine("You have already picked up the "+ o, "error");
          return false;
        } else if(!resolvedDependency(objectID)) {
          // but depends on a another object which isn't yet met  
          printLine(obj.text_on_error);
          return false;
        } else {
          // can definitely be picked up:
          // add to inventory
          player.addItemToInventory(objectID, obj);
          // indicate the object is picked up
          locations[player.getLocation()].objects[objectID].picked_up = true;
          // output message
          printLine("You put the "+ obj.name +" in your inventory");
          trigger(obj, "pickup_trigger");
          return true;
        }

      } else {
        // object exists but can't be picked up
        printLine("You can't pick up the "+ o, "error");
        return false;
      }

    }
  }



  /* 
    Check for victory conditions:
    This function takes the list of victory conditons passed to the game earlier and checks if they are met
  */
  function checkForVictory() {
    var objId = "";
    var foundObj = false;
    // check for location:

    debug("***** VICTORY CONDITIONS CHECK *****");

    if(victoryConditions.conditions.in_location==="" || victoryConditions.conditions.in_location===player.getLocation()) {
      // check for picked up objects
      for (var i=0; i<victoryConditions.conditions.have_objects.length; i++) {
        objId = victoryConditions.conditions.have_objects[i];
        if(!player.inInventory(objId)) {
          debug("Victory conditions not met: have object "+ objId);
          return false;
        }

        // check for used objects
        for(i=0; i<victoryConditions.conditions.used_objects.length; i++) {
          // loop through used objects list:
          objId = victoryConditions.conditions.used_objects[i];
          for(var j=0; j<usedObjects.length; j++) {
            if(objId===usedObjects[j]) {
              foundObj = true;
            }
          }

          if(!foundObj) {
            debug("Victory conditions not met: used object "+ objId);
            return false;
          }
        }

        // all checks have passed without exiting the fucntion: VICTORY!
        printLine(victoryConditions.victory_text, "victory");
        inputField.disabled = true;
      }
    } else {
      debug("Victory conditions not met: in location "+ victoryConditions.conditions.in_location);
      return false;
    }
  }



  /*
    Check for prompt: shows prompt is available
    ---
    obj   The object to check for prompts
  */
  function checkForPrompt(obj) {
    // check if player location has a prompt:
    debug("***** PROMPTS *****");
    if(obj.prompts === undefined) {
      debug("No pompt found");
      return false;
    }
    var prompt = obj.prompts[Object.keys(obj.prompts)[0]];
    if(prompt !== undefined) {
      // a prompt has been found!
      debug("Prompt found");
      // check if this has prompted before or if it can be repeated
      if(!prompt.has_prompted || (prompt.has_prompted && prompt.can_repeat) )  {
        debug("Prompt can be shown");
        promptMode = true;
        currentPrompt.push(Object.keys(locations[player.getLocation()].prompts)[0]);
        debug("Current prompt: "+ currentPrompt);
        printLine(prompt.prompt_text);
      } else {
        debug("Prompt can't be shown");
        return false;
      }
    }
  }



  /* 
    Looks at the current prompt array and retrieves the object based on it
  */
  function getCurrentPrompt() {
    var currentPromptRef = "";
    for(var i=0; i<currentPrompt.length; i++) {
      currentPromptRef += ".prompts."+ currentPrompt[i];
    }
    return currentPromptRef;
  }



  /* 
    Checks if an object is available in the player inventory or in the current location
    Returns false if no object is available
    Rerturns an array containing the object ID and object itself when available
    ---
    o   Object name or id to be checked for availability
  */
  function isObjectAvailable(o) {
    var objectId = "";
    if(player.inInventory(o)) {
      debug(o +" found in inventory.");
      objectId = player.getItemIDFromInventory(o);
      return [objectId, player.getItemFromInventory(objectId)];
    } else {
      for(objectId in locations[player.getLocation()].objects) {
        if(objectId === o || locations[player.getLocation()].objects[objectId].name.toLowerCase() === o) {
          debug(o +" found in location.");
          return [objectId, locations[player.getLocation()].objects[objectId]];
        }
      }
    }
    debug(o +" not found.");
    return false;
  }


  
  /* 
    Find an object in the locations object, returns the id of object if found, returns false if not found
    ---
    o   The object to find
    ---
    NOTE: could possibly be done in the isObjectAvailable function
  */
  function findObjectInLocation(o) {
    for(var object in locations[player.getLocation()].objects) {
      if(locations[l].objects[object].name===o) {
        return object;
      }
    }
    return false;
  }



  /* 
    Checks if there is an object dependency on the query and if it is fulfilled
    Returns true if dependency is resolved, false if there is a dependency to resolve
    --
    oId   The id of the object or direction to check
  */ 
  function resolvedDependency(oId) {
    debug("**** DEPENDENCY TEST ****");
    debug("Testing "+ oId +" for dependencies.");
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
        objDep = locations[player.getLocation()].objects[obj.depends_on];
        if(objDep.is_used) {
          debug("Has dependency, is resolved.");
          return true;
        } else {
          debug("Has dependency, is not resolved.");
          return false;
        }
      } else {
        debug("Hasn't got a dependency.");
        return true;
      }
    } else {
      // the query is a direction
      if(locations[player.getLocation()].directions[oId].depends_on!=="") {
        // there is a dependency!
        // get the object to check if it has been used
        oD = locations[player.getLocation()].objects[locations[player.getLocation()].directions[oId].depends_on];
        if(oD.is_used) {
          debug("Has dependency, is resolved.");
          return true;
        } else {
          debug("Has dependency, is not resolved.");
          return false;
        }
      } else {
        debug("Hasn't got a dependency.");
        return true;
      }
    }
  }



  /*
    Save progress in local storage
  */ 
  function saveProgress(){
    if(canStore) {
      storage.setObject("TA_LOCATIONS", locations);
      storage.setObject("TA_INVENTORY", player.getInventory());
      storage.setItem("TA_CURRENTLOCATION", player.getLocation());
    }
  }



  /*
    Restart the game by reloading all game data
  */
  function restart() {
    // reset some important variables
    usedObjects = [];  
    promptMode = false;
    currentPrompt = [];
    firstMessageDisplayed = false;
    typedCommands = [];
    typedCommandsIndex = 0;

    // clear save in localstorage
    if(canStore) {
      storage.removeItem("TA_LOCATIONS");
      storage.removeItem("TA_INVENTORY");
      storage.removeItem("TA_CURRENTLOCATION");
    }

    // recreate the player object
    player = null;
    player = Object.create(Player);
    player.init(newStartingInventory);
    
    // reset location to starting point
    locations = newGameLocations;
    player.setLocation(locations.startlocation);
    
    // go:
    moveToLocation(player.getLocation());
    checkForVictory();  
  }



  /*
    Trigger function checks if a trigger is available in game data and executes the trigger if it is found
    ---
    obj   The object to check the trigger on
    trig  The trigger type
  */
  function trigger(obj, trig) {
    if(obj[trig]!==undefined) {
      debug("Trigger "+ trig +" found");
      if(obj[trig].function_call !== undefined && obj[trig].function_call !== "")
      extensions[obj[trig].function_call](obj[trig].function_parameters);
    }
  }



  /*
    Shows the help information and command list
  */
  function displayHelp() {
    debug("Displaying help");
    var helpText = "<h2>Welcome to "+options.title+"</h2>";
    helpText += "<p>"+ options.description +"</p>";
    helpText += "<p>Explore all locations, collect items and solve puzzles to beat the game. Here is a list of instructions you can use to get started:</p>";
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
    helpText += buildDefinitionList(commandlist);
    printLine(helpText, "help");
  }



  /* 
    Shows all items in the inventory
  */ 
  function displayInventory() {
    debug("Displaying the inventory");
    var inventoryText = "<h2>Inventory</h2>";
    inventoryText += buildDefinitionList(player.getInventory());
    printLine(inventoryText, "inventory");
  }



  /* 
    Prints a line to the output container
    ---
    textToPrint    text to write out
    classToPrint   class to be added to the containing element (e.g. "error")
  */
  function printLine(textToPrint, classToPrint) {
    // only do this if there is text to print (sometimes there might not be a text) 
    if(textToPrint!=="") {
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
      outputContainer.appendChild(item);

      // adjust the top padding of the first item so the printed message gets aligned at the bottom:
      if(!firstMessageDisplayed) {
        firstMessageDisplayed = true;
        // only set a padding if there is a height set in options
        if(options.height!==undefined) {
          item.style.paddingTop = (outputContainer.clientHeight - item.clientHeight)+"px";
        }
      }

      // scroll the item into view with an animation when there is an absolute height set in options
      if(options.height!==undefined) {
        window.clearInterval(timer);
        timer = window.setInterval(animateScroll, timerInterval);
      }
    }
  }



  /* 
    Scrolls the text adventure window up to the latest message
  */
  function animateScroll(){
    // scroll container up
    if(outputContainer.clientHeight >= (outputContainer.scrollHeight - outputContainer.scrollTop))
      window.clearInterval(timer);
    else
      outputContainer.scrollTop+=2;

    // todo :
    // dynamically set the scroll amount based on how much text needs to be scrolled
    // add smoothing?
  }



  /* 
    Public function to expose the container object
  */
  function getContainer() {
    return container;
  }



  /*
    Public function to expose the input field
  */
  function getInputField() {
    return inputField;
  }



  /* 
    Load typed command from list
    ---
    commandIndex   Either 1 for next command or -1 for previous
  */
  function showTypedCommand(commandIndex) {
    // only do when there are commands that have been typed
    if(typedCommands.length!==0) {
      // increase the index
      typedCommandsIndex += commandIndex;
      // check for beginning of list, if so jump to last
      if(typedCommandsIndex < 0) {
        typedCommandsIndex = typedCommands.length-1;
      }
      // check if at end of list, if so jump to first 
      if(typedCommandsIndex >= typedCommands.length) {
        typedCommandsIndex = 0;
      } 
      debug("showing typed command, index: "+ typedCommandsIndex);
      // show the command
      inputField.value = typedCommands[typedCommandsIndex];
    }
  }



  /*
    Wraps information in a definition list which can then be outputted
    ---
    list  a list of names and descriptions to convert to definition lists to display
  */
  function buildDefinitionList(list) {
    var convertedList = "<dl>";
    for(var item in list) {
      convertedList += (list[item].name===undefined) ? "<dt>"+item+"</dt>" : "<dt>"+list[item].name+"</dt>";
      convertedList += "<dd>"+ list[item].description +"</dd>";
    }
    convertedList += "</dl>";
    return convertedList;
  }



  /*
    Public function to allow the extension to be added
    ---
    e   The extension object
  */
  function addExtension(e) {
    extensions = e;
  }



  /* 
    Writes out a line to console if debug is turned on in the options
    ---
    m   message to write to console
  */
  function debug(message) {
    if(options.debug===true) console.log(message);
  }


  
  // expose the public functions in the return object
  return {
    init: init,
    parseCommand: parseCommand,
    showTypedCommand: showTypedCommand,
    help: displayHelp,
    inventory: displayInventory,
    move: validateMoveDirection,
    use: validateUse,
    pickup: validatePickup,
    printLine: printLine,
    getContainer: getContainer,
    getInputField: getInputField,
    extend: addExtension,
    restart: restart
  };

})();
