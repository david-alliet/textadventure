// The player object holds functionalities and data related specifically to the player
var Player = (function() {

  var currentLocation = "";
  var atObject = "";  // currently unused...
  var inventory = {};

  function init(si) {
    console.log("Initializing the player object");
    inventory = si;
  }

  // allows to get the current location of the player
  function getLocation() {
    return currentLocation;
  }

  // allows to set the current location of the player
  function setLocation(l) {
    currentLocation = l;
  }


  // *******************
  // inventory functions
  // *******************

  // checks if an item is in the inventory
  function inInventory(item) {
    for(var object in inventory) {
      if(object===item || inventory[object].name===item) return true;
    }
    return false;
  }

  // adds an item to the inventory
  function addItemToInventory(id, item) {
    inventory[id] = item;
  }

  // delete an item from the inventory
  function deleteItemFromInventory(id) {
    delete inventory[id];
  }

  // retrieves a specific item from the inventory based on an id
  function getItemFromInventory(id) {
    for(var item in inventory) {
      if(item===id || inventory[item].name===id)
        return inventory[item];
    }
  }

  // retrieves the id of an item based on its name
  function getItemIDFromInventory(name) {
    for(var item in inventory) {
      if(inventory[item].name===name)
        return item;
    }
  }

  // returns the full inventory
  function getInventory() {
    return inventory;
  }

  return {
    init: init,
    getLocation: getLocation,
    setLocation: setLocation,
    getInventory: getInventory,
    addItemToInventory: addItemToInventory,
    getItemFromInventory: getItemFromInventory,
    getItemIDFromInventory: getItemIDFromInventory,
    deleteItemFromInventory: deleteItemFromInventory,
    inInventory: inInventory
  };
})();
