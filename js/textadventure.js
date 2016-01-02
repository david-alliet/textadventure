// The main textadventure object that will hold most of the functionality to control the game
var TextAdventure = (function (){

  // properties and gamedata of the Text Adventure
  var title = "test";
  var locations = {};
  var player;

  // UI elements and properties
  var taHeight = 0;
  var container = null;
  var outputContainer = null;
  var inputField = null;
  var firstMessageDisplayed = false;

  // some helper variables and objects
  var timer = null;
  var timerInterval = 10;

  // init the game, gets passed the <div> container and the desired height of the box
  function init(cid, h, l) {
    console.log("Initializing text adventure");
    container = document.getElementById(cid);
    taHeight = h;
    locations = l;
    prepareContainer();

    // set up the player object:
    player = Object.create(Player);

    // initial player inventory can go here
    var inv = {
      "test": {
        name: "A test oject",
        description: "Some object whose only purpose is to test the inventory system"
      }
    };
    player.init(inv);

    // load location
    gotoLocation(locations.startlocation);
  }


  // set up the text adventure container with all the neccesary UI elements
  function prepareContainer() {
    console.log("Preparing container with game elements");
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
    inputField.placeholder = "To proceed, type an instruction followed by RETURN";
    inputField.autofocus = true;
    inputField.focus();

    // add the event handler
    inputField.addEventListener("keypress", function(e){
      if(e.keyCode===13) {
        // User hit enter, sending the command to the parser
        TextAdventure.parseCommand(this.value);

        // empty placeholder as user has entered a valid string
        if(this.placeholder!=="") {
          this.placeholder = "";
        }
        // empty the input field
        inputField.value="";
      }
    }, true);

    // append input to container
    inputContainer.appendChild(inputField);
    // append container for input to dom
    container.appendChild(inputContainer);

    // set height of the text adventure container and its elements
    container.style.height = taHeight+"px";
    outputContainer.style.height = (taHeight - inputContainer.clientHeight)+"px";

    // display the help information as initial message
    displayHelp();
  }


  // parse incoming commands
  function parseCommand(c) {
    console.log("Received command : "+ c);

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
          printLine("Please specify where you want to go.");
        } else  if(cl[1]==="to") {
          console.log("Moving to object "+ cl[2]);
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
        console.log("Use object: "+ objectString);

        // get string for object to use should be acted on
        var objectOnString = "";
        if(onPos!==undefined) {
          for(i=onPos+1; i<cl.length; i++) {
            objectOnString += cl[i]+" ";
          }
          objectOnString = objectOnString.trim();
        }
        console.log("Object to be used on: "+ objectOnString);

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

      default:
        printLine("That instruction wasn't understood.");
        break;
    }
  }


  // loads in a new locations
  function gotoLocation(l) {
    console.log("Moving to location "+ l);
    player.setLocation(l) ;
    printLine(locations[player.getLocation()].text_on_visit);
  }


  // uses an object
  function useObject(o) {
    // todo:
    // - us an object
    // - use an object on another object
    // - remove the item from inventory if need be
  }


  // validate if a given direction is valid
  function validateMoveDirection(d){
    console.log("Testing direction "+ d +" for validity");
    var valid = false;
    for(var direction in locations[player.getLocation()].directions) {
      //valid = true;
      if(direction===d)
        valid = true;
    }

    if(valid)
      gotoLocation(locations[player.getLocation()].directions[d]);
    else
      printLine("That is not a possible direction.");
  }


  // validate if specified objects can be used
  function validateUse(o, ou) {
    console.log("Testing objects for valid use: "+ o +", "+ ou);
    var validObject = false;
    var validObjectUse = false;
    var obj, objOnUse;

    // valid object?
    // in player inventory?
    if(player.inInventory(o)) {
      validObject = true;
      obj = player.getItemFromInventory(o);
    } else {
      // in the current location?
      for(var object in locations[player.getLocation()].objects) {
        if(object===o) {
          validObject = true;
          obj = locations[player.getLocation()].objects[object];
        }
      }
    }

    if(validObject) {
      // can the object be used ?
      console.log(obj);
      if(obj.can_use) {
        printLine(obj.text_on_use);
      } else if(obj.can_use_on_object===ou) {
        printLine(obj.text_on_use_object_on);
      } else {
        printLine("Can't use "+ o +" this way.");
      }
    } else {
      printLine("There's no "+ o +" to use.");
    }
    //console.log(locations[player.getLocation()].objects[o]);
  }


  // checks if an object can be picked up
  function validatePickup(o) {
    console.log("Testing object "+ o +" for picking up.");
    for(var object in locations[player.getLocation()].objects) {
      if(object===o) {
        obj = locations[player.getLocation()].objects[object];
        if(obj.can_pickup) {
          player.addItemToInventory(o, obj);
          printLine("You put the "+ o +" in your inventory");
        }
      }
    }
  }


  // shows the help information and command list
  function displayHelp() {
    console.log("Displaying help");
    var helpText = "<h2>Welcome to "+title+"</h2>";
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
      }
    };
    helpText += buildDefinitionList(commandlist);
    printLine(helpText);
  }


  // shows all items in the inventory
  function displayInventory() {
    console.log("Displaying the inventory");
    var inventoryText = "<h2>Inventory</h2>";
    console.log(player.getInventory());
    inventoryText += buildDefinitionList(player.getInventory());
    printLine(inventoryText);
  }


  // prints a line to the output container
  function printLine(t) {
    var item = document.createElement("div");
    item.className = "dal-ta-output-item";
    item.innerHTML = t;
    outputContainer.appendChild(item);
    // adjust the top padding of the first item so the printed message gets aligned at the bottom:
    if(!firstMessageDisplayed) {
      firstMessageDisplayed = true;
      item.style.paddingTop = (outputContainer.clientHeight - item.clientHeight)+"px";
    }
    // add some sort of navigation to bring the item into view
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
      convertedList += "<dt>"+item+"</dt>";
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
