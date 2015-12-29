// The main textadventure object that will hold most of the functionality to control the game
var TextAdventure = (function (){

  // properties of the Text Adventure
  var title = "test";

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
  function init(cid, h) {
    console.log("Initializing text adventure");
    container = document.getElementById(cid);
    taHeight = h;
    prepareContainer();
  }

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
    inputField.placeholder = "Enter instruction followed by RETURN";
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

    // evaluate command based on first element:
    switch(cl[0]) {
      case "help":
        displayHelp();
        break;

      case "inventory":
        displayInventory();
        break;

      case "move":
        if(cl[1]===undefined) {
          console.log("No move direction specified");
        } else {
          console.log("Moving in direction "+ cl[1]);
        }
        break;

      default:
        console.log("unknown command");
        break;
    }
  }

  function displayHelp() {
    console.log("Displaying help");
    var helpText = "<h2>Welcome to "+title+"</h2><p>Here is a list of instructions you can use to get started:</p>";
    printLine(helpText);
  }

  function displayInventory() {
    console.log("Displaying the inventory");
    var inventoryText = "<h2>Inventory</h2>";
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
    timer = window.setInterval(animateTransition, timerInterval);
  }

  function animateTransition(){
    // scroll container up
    if(outputContainer.clientHeight >= (outputContainer.scrollHeight - outputContainer.scrollTop))
      window.clearInterval(timer);
    else
      outputContainer.scrollTop+=2;
  }

  // public function to expose the container object
  function getContainer() {
    return container;
  }

  // public function to expose the input field
  function getInputField() {
    return inputField;
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
