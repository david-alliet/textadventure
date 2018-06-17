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
