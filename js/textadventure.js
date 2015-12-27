// The main textadventure object that will hold most of the functionality to control the game
var TextAdventure = (function (){

   var container = null;
   var inputField = null;

   // init the game, gets passed the <div> container
   function init(cid) {
      console.log("Initializing text adventure");
      container = document.getElementById(cid);
      prepareContainer();
   }

   function prepareContainer() {
      console.log("Preparing container with game elements");
      container.innerHTML = "";

      // create a container for the inputfield
      var inputContainer = document.createElement("div");
      inputContainer.className = "dal-ta-input";

      // create the inputfield
      inputField = document.createElement("input");
      inputField.type = "text";
      inputField.name = "dal-ta-inputfield";
      inputField.addEventListener("keypress", function(e){
         TextAdventure.parseCommand(this.value);
      }, true);
      // append inputfield to field container:
      inputContainer.appendChild(inputField);
      // append the container to the text adventure container in the dom:
      container.appendChild(inputContainer);
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
      console.log("parsing command "+ c);
      console.log(inputField.value);
   }

   // expose the functions in the return object
   return {
      init: init,
      getContainer: getContainer,
      getInputField: getInputField,
      parseCommand: parseCommand
   };

})();
