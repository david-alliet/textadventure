// The main textadventure object that will hold most of the functionality to control the game
var TextAdventure = (function (){

  var container = null;
  var inputField = null;
  var taHeight = 0;

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
    var outputContainer = document.createElement("div");
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
    inputField.placeholder = "Enter command followed by RETURN";
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
  }

  // public function to expose the container object
  function getContainer() {
    return container;
  }

  // public function to expose the input field
  function getInputField() {
    return inputField;
  }

  function parseCommand(c) {
    console.log("Received command : "+ c);

    // convert the entire command into lower case
    c = c.toLowerCase();
    // break command into spaces
    var cl = c.split(" ");

    // evaluate command based on first element:
    switch(cl[0]) {
        case "help":
          console.log("Displaying help");
          break;

        case "inventory":
          console.log("Displaying the inventory");
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

  // expose the public functions in the return object
  return {
    init: init,
    getContainer: getContainer,
    getInputField: getInputField,
    parseCommand: parseCommand
  };

})();
