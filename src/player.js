function Player(startingInventory, startingLocation) {
  // set the starting inventory
  this.inventory = startingInventory;
  // prepare current location variable
  this.location = startingLocation;
}


/* 
  Get the current location id of the player
*/
Player.prototype.getLocation = function() {
  return this.location;
};


/* 
  Set the current location of the player
  ---
  location   New location id
*/
Player.prototype.setLocation = function(location) {
  this.location = location;
};


/*
  Check if an object is in the inventory
  ---
  item   object id or name
*/
Player.prototype.inInventory = function(item) {
  // loop through all item in the player's inventory
  for(var object in this.inventory) {
    // check if the string passed matches the id or name of the object
    if(object===item || this.inventory[object].name===item){
      return true;
    }
  }
  return false;
};


/*
  Adds an item to the player's inventory
  ---
  id    the id of the object 
  item  the object with all its properties
*/
Player.prototype.addItemToInventory = function(id, item) {
  this.inventory[id] = item;
};


/*
  Delete an object from the inventory
  ---
  id  id of the object to be deleted
*/
Player.prototype.deleteItemFromInventory = function(id) {
  delete this.inventory[id];
};


/*
  Get a specific item from the inventory
  ---
  id  id or name of the object to be retrieved
*/
Player.prototype.getItemFromInventory = function(id) {
  for(var item in this.inventory) {
    if(item===id || this.inventory[item].name===id) {
      return this.inventory[item];
    }
  }
};


/*
  Get the id of a specific item from the inventory based on its name
  ---
  name  the name of a possible inventory item
*/
Player.prototype.getItemIDFromInventory = function(name) {
  for(var item in this.inventory) {
    if(this.inventory[item].name===name) {
      return item;
    }
  }
};


/*
  Get the full inventory
*/
Player.prototype.getInventory = function() {
  return this.inventory;
};  


/*
  Overwrite the complete inventory (used when loading the game from a save)
  ---
  inv the new inventory
*/
Player.prototype.setInventory = function(inventory) {
  this.inventory = inventory;
};