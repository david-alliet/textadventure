# Text-adventure engine

(note: this readme is not yet complete)

## What is it?

This is a javascript text adventure game engine. Its aim is to be very fast, not dependent on 3rd party frameworks or libraries (only vanilla javascript), easy to write games in (using JSON data format) and easy to extend with custom functionality. It isn't a parser based engine (if you are looking for that, i suggest using Parchment), but built around set of standard commands.

## Game features

### General structure

As with most text adventures, this engine provides for a game built up out of a series of **locations** linked together by **directions**. The **player** can pick up **objects** which are kept in her **inventory**, and can be used by themselves or on other objects found in the various locations. The player must make her way through the locations and meet a set of **conditions** in order to be victorious.

### Save/resume

When the engine detects it is being run on a browser with localStorage enabled, it will automatically save the player's progress and resume a saved game when the player comes back to the game.

### Extend with custom functionality

The game can be extended with extra functionality. You can program your own javascript functions in an object and pass this object on to the engine. You can then add a reference to these functions in the game data files so that they can be called when a player for instance interacts with an object or visits a specific location.

## Installing and running the engine

1. Download the engine js file
1. Write your game following in following the proper data structure.
1. Add the js file of the engine to your page and initialize the engine with your JSON game data variables.
1. Optionally program an object with publicly exposed functions to extend the functionality of the engine.

### Initialization code

```
var MyGame = Object.create(TextAdventure);
MyGame.init("ContainerId", options, locations, victory_conditions, inventory);
```

* ```ContainerId``` a string containing the id of the div you want the game to render in;
* ```options``` a JSON object with options telling the game engine how to render;
* ```locations``` a JSON object containing all the locations of the game. See "Game data structure" for more information about how to structure the data;
* ```victory_conditions``` a JSON object telling the game what goals the player needs to achieve to win the game;
* ```inventory``` a JSON object containing the starting inventory of the player.


### Extending the game

You can write your own javascript object to add extra functionality to the game. Make sure your object has publicly exposed functions, which you can then reference in your game data files. Then pass your object to the game using the following code:

```
var MyExtensions = Object.create(MyExtendObject);
MyGame.extend(MyExtensions);
```  

Typically you would use this to have objects in your game control elements on the page outside of the game.

## Game data structure

### Locations

* ``name``: the name of the location
* ``description``: the description of the location. This is currently not shown anywhere.
* ``text_on_visit``: the text shown when a user visits the location
* ``directions``: a JSON object containing the possible directions where the user can go from this location. Each direction has an identifier naming the direction and the following properties:
  * ``location``: the location that is in this direction
  * ``depends_on``: either an empty string or the id of an object that must be used before this directory is accessible
  * ``text_on_error``: text shown when user tries to go in this direction when the dependency is not met
* ``objects``: all objects that can be found in this location with their full properties

### Objects

* ``name``: the name users can use to target the object
* ``description``: the description of this object (shown in inventory)
* ``can_use``: a boolean flag indicating if this object can be used in any way
* ``text_on_use``: the text displayed when the object is used
* ``can_pickup``: a boolean flag indicating if this object can be picked up an put in the player's inventory
* ``text_on_pickup``: the text displayed when the object is picked up
* ``can_use_on_object``: set to false if the object can not be used on another object, set to an object unique id if the object must be used on another object
* ``text_on_use_object_on``: text displayed when the object is used on the other specified object
* ``remove_after_use``: a boolean flag indicating if the object must be removed from the inventory after use
* ``depends_on``: either an empty string or the id of an object that must be used before this object can be used
* ``text_on_error``: text shown when user tries to use this object before the dependency is met
