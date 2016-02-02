// The main textadventure object that will hold most of the functionality to control the game
var TextAdventure = (function (){
  // UI elements and properties

  // properties and gamedata of the Text Adventure
  var locations = {};
  var victoryConditions = {};
  var options;

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
  var usedOjbects;

  // init the game, gets passed the <div> container and the desired height of the box
  function init(cid, o, l, vc, i) {
    container = document.getElementById(cid);
    options = o;
    locations = l;
    victoryConditions = vc;
    if(options.debug===true) console.log("Initializing text adventure");

    // assign the tutorial messages:
    tutorialMessages = ["To play, type an instruction followed by RETURN.",
      "Have a look in your inventory to see what you are currently carrying.",
      "If you are stuck, examine your current location or an object for hints."];

    // prepare the TA container with the neccesary game elements
    prepareContainer();

    // set up the player object and initialize with starting inventory
    player = Object.create(Player);
    player.init(i);

    // load location
    player.setLocation(locations.startlocation);
    printLine(locations[player.getLocation()].text_on_visit);

    usedObjects = new Array(0);

  }


  // set up the text adventure container with all the neccesary UI elements
  function prepareContainer() {
    if(options.debug===true) console.log("Preparing container with game elements");
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

    // append input to container
    inputContainer.appendChild(inputField);
    // append container for input to dom
    container.appendChild(inputContainer);

    // set height of the text adventure container and its elements
    container.style.height = options.height+"px";
    outputContainer.style.height = (options.height - inputContainer.clientHeight)+"px";

    // display the help information as initial message
    displayHelp();
  }


  // parse incoming commands
  function parseCommand(c) {
    if(options.debug===true) console.log("Received command : "+ c);

    // convert the entire command into lower case
    c = c.toLowerCase();
    // break command into spaces
    var cl = c.split(" ");

    var objectString = "";
    var i=0;

    // evaluate command based on first element:
    switch(cl[0]) {

      case "help":
        displayHelp();
        break;

      case "inventory":
        displayInventory();
        break;

      case "go":
        if(cl[1]===undefined) {
          printLine("Please specify where you want to go.", "error");
        } else  if(cl[1]==="to") {
          // to do, if needed, move to a named location or object
          if(options.debug===true) console.log("Moving to object "+ cl[2]);
        } else {
          validateMoveDirection(cl[1]);
        }
        break;

      case "use":
        // loop through words to see if there is an "on" modifier
        var onPos;
        for(i=1; i<cl.length; i++) {
          if(cl[i]==="on") {
            onPos = i;
          }
        }
        var objectPosEnd = (onPos===undefined) ? cl.length-1 : onPos-1;

        // get string for object to use
        for(i=1; i<=objectPosEnd; i++) {
          objectString += cl[i]+" ";
        }
        objectString = objectString.trim();
        if(options.debug===true) console.log("Use object: "+ objectString);

        // get string for object to use should be acted on
        var objectOnString = "";
        if(onPos!==undefined) {
          for(i=onPos+1; i<cl.length; i++) {
            objectOnString += cl[i]+" ";
          }
          objectOnString = objectOnString.trim();
        }
        if(options.debug===true) console.log("Object to be used on: "+ objectOnString);

        // check to see if object(s) to be used are valid
        validateUse(objectString, objectOnString);
        break;

      // pick up
      case "pick":
        if(cl[1]==="up") {
          objectString = "";
          for(i=2; i<cl.length; i++) {
            objectString += cl[i] + " ";
          }
          objectString = objectString.trim();
          validatePickup(objectString);
        }
        break;

      case "examine":
        if(cl[1]===undefined) {
          printLine("Nothing to examine.", "error");
        } else {
          // examine what?
          var examineString = "";
          for(i=1; i<cl.length; i++) {
            examineString += cl[i]+" ";
          }
          examineString = examineString.trim();
          validateExamine(examineString);
        }
        break;

      case "look":
        if(cl[1]==="around") {
          printLine(locations[player.getLocation()].description);
        } else {
          printLine("That instruction wasn't understood.", "error");
        }
        break;

      default:
        printLine("That instruction wasn't understood.", "error");
        break;

    }

    // tutorial messages:
    // increase message count and print out tutorial placeholders based on it
    tutorialMessageCount++;
    if(tutorialMessageCount<tutorialMessages.length) {
      inputField.placeholder = tutorialMessages[tutorialMessageCount];
    } else {
      inputField.placeholder = "";
    }

    // victory conditions ?
    checkForVictory();
  }


  // validate if a given direction is valid
  function validateMoveDirection(d){
    if(options.debug===true) console.log("Testing direction "+ d +" for validity");
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
        if(options.debug===true) console.log("Access to this location was blocked");
        printLine(locations[player.getLocation()].directions[dirId].text_on_error, "error");
      } else {
        if(options.debug===true) console.log("Moving to location "+ l);
        player.setLocation(locations[player.getLocation()].directions[d].location);
        printLine(locations[player.getLocation()].text_on_visit);
      }
    } else {
      printLine("That is not a possible direction.", "error");
    }
  }


  // validate if specified objects can be used
  function validateUse(o, ou) {
    if(options.debug===true) console.log("Testing objects for valid use: "+ o +", "+ ou);
    var validObject = false;
    var validObjectUse = false;
    var obj, objId, objOnUse, objOnUseId;
    // object available
    if(isObjectAvailable(o)) {
      // in player inventory?
      if(player.inInventory(o)) {
        objId = player.getItemIDFromInventory(o);
        obj = player.getItemFromInventory(o);
      } else {
        for(var object in locations[player.getLocation()].objects) {
          if(locations[player.getLocation()].objects[object].name === o) {
            objId = object;
            obj = locations[player.getLocation()].objects[object];
          }
        }
      }
      // second object?
      if(ou!=="") {
        // check if the 2nd specified object is valid
        if(player.inInventory(ou)){
          objOnUseId = getItemIDFromInventory(ou);
          objOnUse = player.getItemFromInventory(ou);
        } else {
          for(var object2 in locations[player.getLocation()].objects) {
            if(locations[player.getLocation()].objects[object2].name === ou) {
              objOnUseId = object2;
              objOnUse = locations[player.getLocation()].objects[object2];
            }
          }
        }
        if(obj.can_use_on_object == objOnUse.name) {
          // check dependencies for both objects
          if(resolvedDependency(o) && resolvedDependency(ou)) {
            // dependencies are resolved
            // object can be used on second object
            printLine(obj.text_on_use_object_on);
            locations[player.getLocation()].objects[objOnUseId].is_used = true;
            if(obj.remove_after_use) {
              player.deleteItemFromInventory(objId);
            }
            // keep track of used objects (by id) in an array
            usedObjects.push(objOnUseId);
          } else {
            // which dependency needs to be resolved?
            if(!resolvedDependency(o)) {
              printLine(obj.text_on_error);
            } else if(!resolvedDependency(objOnUseId)) {
              printLine(objOnUse.text_on_error);
            }
          }
        } else {
          printLine("Can't use the "+ o +" that way.", "error");
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
          } else {
            // dependency needs to be resolved:
            printLine(obj.text_on_error);
          }
        } else {
          if(obj.can_use_on_object!==false) {
            printLine("The "+ o +" can't be used that way.", "error");
          } else {
            printLine("The "+ o +" can't be used.", "error");
          }
        }
      }
    } else {
      printLine("There's no "+ o + " to use", "error");
    }
  }


  // validates the examine command and executes it
  function validateExamine(q) {
    if(options.debug) console.log("Testing "+ q +" for examine");

    // is it a valid object ?
    if(isObjectAvailable(q)) {
      var obj;
      if(player.inInventory(q)) {
        obj = player.getItemFromInventory(q);
      } else {
        for(var object in locations[player.getLocation()].objects) {
          if(locations[player.getLocation()].objects[object].name === q) {
            obj = locations[player.getLocation()].objects[object];
          }
        }
      }
      printLine(obj.description);
    } else {
      printLine("You can't examine "+ q, "error");
    }
  }


  // checks if an object can be picked up
  function validatePickup(o) {
    if(options.debug===true) console.log("Testing object "+ o +" for picking up.");
    // is the object to pick up available?
    if(!isObjectAvailable(o)) {
      printLine("There is no "+ o +" to pick up.", "error");
    } else {
      for(var object in locations[player.getLocation()].objects) {
        if(locations[player.getLocation()].objects[object].name===o) {
          obj = locations[player.getLocation()].objects[object];
          if(obj.can_pickup) {
            if(obj.picked_up) {
              printLine("You have already picked up the "+ o, "error");
            } else if(!resolvedDependency(o)) {
              printLine(obj.text_on_error);
            } else {
              // add to inventory
              player.addItemToInventory(object, obj);
              // indicate the object is picked up
              locations[player.getLocation()].objects[object].picked_up = true;
              // output message
              printLine("You put the "+ obj.name +" in your inventory");
            }
          } else {
            printLine("You can't pick up the "+ o, "error");
          }
        }
      }
    }
  }


  // Check for victory conditions:
  // takes the list of victory conditons and checks if they are met
  function checkForVictory() {
    var objId = "";
    var foundObj = false;
    // check for location:
    if(victoryConditions.conditions.in_location==="" || victoryConditions.conditions.in_location===player.getLocation()) {
      // check for picked up objects
      for (var i=0; i<victoryConditions.conditions.have_objects.length; i++) {
        objId = victoryConditions.conditions.have_objects[i];
        if(!player.inInventory(objId)) {
          if(options.debug===true) console.log("Victory conditions not met: have object "+ objId);
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
            if(options.debug===true) console.log("Victory conditions not met: used object "+ objId);
            return false;
          }
        }

        // all checks have passed without exiting the fucntion: VICTORY!
        printLine(victoryConditions.victory_text, "victory");
        inputField.disabled = true;
      }
    } else {
      if(options.debug===true) console.log("Victory conditions not met: in location "+ victoryConditions.conditions.in_location);
      return false;
    }
  }


  // checks if an object is available in the player inventory or in the current location
  // returns the object if found
  function isObjectAvailable(o) {
    if(options.debug===true) console.log("Checking "+ o +" for availability.");
    if(player.inInventory(o)) {
      if(options.debug===true) console.log(o +" is available as an object.");
      return true;
    } else {
      for(var object in locations[player.getLocation()].objects) {
        if(locations[player.getLocation()].objects[object].name === o) {
          if(options.debug===true) console.log(o +" is available as an object.");
          return true;
        }
      }
    }
    if(options.debug===true) console.log(o +" is not available as an object.");
    return false;
  }


  // checks if there is an object dependency on the query and if it is fulfilled
  // returns true if dependency is resolved, false if there is a dependency to resolve
  function resolvedDependency(oId) {
    if(options.debug===true) console.log("Testing "+ oId +" for dependencies.");
    var obj, objId, objDep;

    // is it a direction or an object:
    if(isObjectAvailable(oId)){
      // is the object in the inventory?
      if(player.inInventory(oId)) {
        // get the object from the inventory
        objId = player.getItemIDFromInventory(oId);
        obj = player.getItemFromInventory(oId);
      } else {
        // not in inventory, get the object from the scene
        for(var object in locations[player.getLocation()].objects) {
          if(locations[player.getLocation()].objects[object].name === oId) {
            objId = object;
            obj = locations[player.getLocation()].objects[object];
          }
        }
      }
      // is there a dependency?
      if(obj.depends_on!=="") {
        // there is!
        // get the object to check if it has been used
        objDep = locations[player.getLocation()].objects[obj.depends_on];
        if(objDep.is_used) {
          if(options.debug===true) console.log("Has dependency, is resolved.");
          return true;
        } else {
          if(options.debug===true) console.log("Has dependency, is not resolved.");
          return false;
        }
      } else {
        if(options.debug===true) console.log("Hasn't got a dependency.");
        return true;
      }
    } else {
      // the query is a direction
      if(locations[player.getLocation()].directions[oId].depends_on!=="") {
        // there is a dependency!
        // get the object to check if it has been used
        oD = locations[player.getLocation()].objects[locations[player.getLocation()].directions[oId].depends_on];
        if(oD.is_used) {
          if(options.debug===true) console.log("Has dependency, is resolved.");
          return true;
        } else {
          if(options.debug===true) console.log("Has dependency, is not resolved.");
          return false;
        }
      } else {
        if(options.debug===true) console.log("Hasn't got a dependency.");
        return true;
      }
    }
  }


  // shows the help information and command list
  function displayHelp() {
    if(options.debug===true) console.log("Displaying help");
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


  // shows all items in the inventory
  function displayInventory() {
    if(options.debug===true) console.log("Displaying the inventory");
    var inventoryText = "<h2>Inventory</h2>";
    inventoryText += buildDefinitionList(player.getInventory());
    printLine(inventoryText, "inventory");
  }


  // prints a line to the output container
  function printLine(t, c) {
    var item = document.createElement("div");
    item.className = "dal-ta-output-item";
    if(c!==undefined) {
      item.className += " "+ c;
    }

    // replace markdown style markup with actual markup

    // check if the markup is present,
    // if it loop through the string to replace markup with actual HTML
    var startPos = 0;
    var foundPos = 0;
    var parsedText = "";
    var dataName = "";
    var dataClass = "";

    while(t.indexOf("[", startPos)!==-1) {
      // look first occurrence of [ and get all text before it
      foundPos = t.indexOf("[", startPos);
      parsedText += t.substring(startPos, foundPos);
      startPos = foundPos+1;
      // get position of matching ] and all text between the brackets
      foundPos = t.indexOf("]", startPos);
      dataName = t.substring(startPos, foundPos);
      startPos = foundPos+2;
      // get whatever is between () to indicate its class
      foundPos = t.indexOf(")", startPos);
      dataClass = t.substring(startPos, foundPos);
      startPos = foundPos+1;
      // wrap all this in span tags
      parsedText += "<span class=\""+ dataClass + "\">"+ dataName +"</span>";
    }

    parsedText += t.substring(startPos, t.length);

    item.innerHTML = parsedText;
    outputContainer.appendChild(item);

    // adjust the top padding of the first item so the printed message gets aligned at the bottom:
    if(!firstMessageDisplayed) {
      firstMessageDisplayed = true;
      item.style.paddingTop = (outputContainer.clientHeight - item.clientHeight)+"px";
    }

    // scroll the item into view with an animation
    window.clearInterval(timer);
    timer = window.setInterval(animateScroll, timerInterval);
  }


  // Scrolls the text adventure window up to the latest message
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


  // public function to expose the container object
  function getContainer() {
    return container;
  }

  // public function to expose the input field
  function getInputField() {
    return inputField;
  }


  // wraps information in a definition list which can then be outputted
  function buildDefinitionList(list) {
    var convertedList = "<dl>";
    for(var item in list) {
      convertedList += (list[item].name===undefined) ? "<dt>"+item+"</dt>" : "<dt>"+list[item].name+"</dt>";
      convertedList += "<dd>"+ list[item].description +"</dd>";
    }
    convertedList += "</dl>";
    return convertedList;
  }


  // expose the public functions in the return object
  return {
    init: init,
    parseCommand: parseCommand,
    help: displayHelp,
    inventory: displayInventory,
    move: validateMoveDirection,
    use: validateUse,
    pickup: validatePickup,
    printLine: printLine,
    getContainer: getContainer,
    getInputField: getInputField
  };

})();
