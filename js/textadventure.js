// The main textadventure object that will hold most of the functionality to control the game
var TextAdventure = (function (){
  // UI elements and properties

  // properties and gamedata of the Text Adventure
  var description = "";
  var locations = {};
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

  // init the game, gets passed the <div> container and the desired height of the box
  function init(cid, o, l, i) {
    container = document.getElementById(cid);
    options = o;
    locations = l;
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

      case "inspect":

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
    }
  }


  // pick up an object
  function pickupOpbject(id, obj) {
    // add item to the inventory:
    player.addItemToInventory(id, obj);

    // set a flag that it is picked up
    locations[player.getLocation()].objects[id].picked_up = true;
    printLine("You put the "+ id +" in your inventory");
  }


  // validate if a given direction is valid
  function validateMoveDirection(d){
    if(options.debug===true) console.log("Testing direction "+ d +" for validity");
    var valid = false;
    var dependencyError = false;
    var dirObj;
    var l = "";
    for(var direction in locations[player.getLocation()].directions) {
      //valid = true;
      if(direction===d) {
        valid = true;
        dirObj = locations[player.getLocation()].directions[direction];
        if(dirObj.depends_on!=="") {
          if(locations[player.getLocation()].objects[dirObj.depends_on].is_used===undefined) {
            dependencyError = true;
          }
        }
      }
    }

    // move:
    if(valid) {
      if(dependencyError) {
        if(options.debug===true) console.log("Access to this location was blocked");
        printLine(locations[player.getLocation()].directions[d].text_on_error, "error");
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
          printLine(obj.text_on_use_object_on);
          locations[player.getLocation()].objects[objOnUseId].is_used = true;
          if(obj.remove_after_use) {
            player.deleteItemFromInventory(objId);
          }
        } else {
          printLine("Can't use the "+ o +" that way.", "error");
        }
      } else {
        // can object be used
        if(obj.can_use) {
          // use object and see if it needs to be removed
          printLine(obj.text_on_use);
          if(obj.remove_after_use) {
            player.deleteItemFromInventory(objId);
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

  // checks if an object is available in the player inventory or in the current location
  // returns the object if found
  function isObjectAvailable(o) {
    if(player.inInventory(o)) {
      return true;
    } else {
      for(var object in locations[player.getLocation()].objects) {
        if(locations[player.getLocation()].objects[object].name === o) {
          return true;
        }
      }
    }
    return false;
  }


  // checks if an object can be picked up
  function validatePickup(o) {
    if(options.debug===true) console.log("Testing object "+ o +" for picking up.");
    for(var object in locations[player.getLocation()].objects) {
      if(object===o) {
        obj = locations[player.getLocation()].objects[object];
        if(obj.can_pickup) {
          if(obj.picked_up) {
            printLine("You have already picked up the "+ o, "error");
          } else {
            pickupOpbject(o, obj);
          }
        } else {
          printLine("You can't pick up the "+ o, "error");
        }
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
      "go": {
        description: "Go in a specific direction (or to a specific location or object)"
      },
      "pick up": {
        description: "Pick up an object and put it in your inventory"
      },
      "use": {
        description: "Use an object in your inventory or location (on a specific object)"
      },
      "examine": {
        description: "Take a closer look at an object in your inventory or in your current location."
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
    item.innerHTML = t;
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
    printLine: printLine,
    getContainer: getContainer,
    getInputField: getInputField
  };

})();
