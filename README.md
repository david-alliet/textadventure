# Text-adventure engine

## What is it?

This is a javascript text adventure game engine. Its aim is to be very fast, not dependent on 3rd party frameworks or libraries, easy to write games in and easy to extend with custom functionality. The engine takes a JSON file in a certain format, and turns that into a playable game. 

The engine is not a language-parser engine - if you are looking for that, I suggest using Parchment. Instead, the game can be controlled using standard commands (move, go to, use, examine, pick up, etc...). Other than basic commands, variations for responses can be accounted for in the game data.

## Game features

As with most text adventures, this engine provides for a game built up out of a series of **locations** linked together by **directions**. Each location can contain **objects** which the player can interacti with. The **player** can also pick up objects, which are then kept in her **inventory** and can be used later in the game by themselves or on other objects found in the various locations. Locations can also trigger **prompts**, which will offer a choice to the player with possible multiple responses and outcomes (such as receiving an object or moving to a location. The player must make her way through the locations and meet a set of **conditions** in order to finish the game. 

The engine comes with a couple of other features to help offer a good experience:

### Save/resume

When the engine detects it is being run on a browser with localStorage enabled, it will automatically save the player's progress and resume a saved game when the player comes back to the game.

### Extend with custom functionalities

The game can be extended with extra functionality. You can program your own javascript functions in an object and pass this object on to the engine. You can then add a reference to these functions in the game data files so that they can be called at specific times in the game, e.g. when a player interacts with an object or visits a specific location.

## Installing and running the engine

1. Download the engine js file
1. Write your game following the proper JSON data structure.
1. Add the js file of the engine to your page and initialize the engine with your JSON game data variables.
1. Optionally program an object with publicly exposed functions to extend the functionality of the engine and your game.

### Initialization code

```
var MyGame = Object.create(TextAdventure);
MyGame.init("ContainerId", options, locations, victory_conditions, inventory);
```

* ```ContainerId``` Required. String containing the id of the div you want the game to render in;
* ```options``` Required. JSON object with options telling the game engine how to render. The following options are available:
  * ```title``` Required. A string with the name of your game. This will be shown when the game starts.
  * ```description``` Optional. A string containing the description of your game. When provided, it is shown underneath the title of the game.
  * ```show_help``` Required. A boolean (true / false) indicating if the help screen should be shown when the game starts.
  * ```height``` Optional. An integer indicating the maximum height in pixels you want the game container to have. If you do not provide a height, the container will automatically expand to fit the entire game. You can also use CSS to set your own height.
  * ```debug``` Optional. A boolean flag indicating if the game should print out debugging information in the browser's console. This can be helpful when writing and testing your game.
* ```locations``` a JSON object containing all the locations of the game. See "Game data structure" for more information about how to structure the data;
* ```inventory``` a JSON object containing the starting inventory of the player, objects in the starting inventory have the same JSON structure as objects in locations.
* ```victory_conditions``` a JSON object telling the game what goals the player needs to achieve to win the game;


### Extending the game

You can write your own javascript object to add extra functionality to the game. Make sure your object has publicly exposed functions, which you can then reference in your game data files.

Typically you would use this to have objects in your game control elements on the page outside of the game. Another good use case for the extend feature is adding analytics to your game to track how users interact with your game.

#### The code

```
var MyExtensions = Object.create(MyExtendObject);
MyGame.extend(MyExtensions);
```  

#### Triggers

A trigger is attached to an object or location and has the following structure:

```
trigger: {
  function_call: "functionName",
  function_parameters: "params"
}
```

The name defined in ```function_call``` is the name of a publicly available function in your extend object. The value of ```function_parameters``` is passed to the function. This value can be any basic javascript data type valid in JSON: numbers, strings, arrays and even full JSON objects; as long as you make sure your callback function properly handles the parameter passed to it.

There are different triggers which can be called at different moments. These are the supported triggers and when they are executed:

**Objects**
* ```use_trigger``` Set on an object, triggers when the object is used
* ```pickup_trigger``` Set on an object, triggers when the object is picked up
* ```examine_trigger``` Set on an object, triggers when the object is examined
* ```visit_trigger``` Set on a location, triggers when the location is visited
* ```response_trigger``` Set on a response of a prompt, triggers when the response is executed
* ```victory_trigger``` Set in the victory conditions object, triggers when all victory conditions are met

## Game data structure

These are the structures the different JSON objects must have for the engine to be able to use them. Refer to the _skeleton.js files provided in /data to see the full structure of each object.

### Locations

Locations are the root objects of the game. They contain all objects and prompts which the player can interact with.

* ``name`` Name of the location
* ``description`` Description of the location. This is currently not shown anywhere.
* ``text_on_visit`` Text shown when a user visits the location
* ``directions`` JSON object containing the possible directions where the user can go from this location. Each direction has an identifier naming the direction and the following properties:
  * ``location`` Location that is in this direction
  * ``depends_on`` Either an empty string or the id of an object that must be used before this directory is accessible
  * ``text_on_error`` Text shown when user tries to go in this direction when the dependency is not met
* ``objects`` All objects that can be found in this location with their full properties
* ``prompts`` Prompts that should be shown when this location is visited 
* ``visit_trigger`` Trigger for when the location is visited

### Objects

Each location can contain a number of objects, which can be interacted with in various ways.

* ``name`` Name players can use to address the object
* ``description`` Description of this object (shown in the inventory)
* ``can_use`` Boolean (true or false) indicating if this object can be used in any way
* ``text_on_use`` Text displayed when the object is used
* ``can_pickup`` Boolean (true or false) indicating if this object can be picked up an put in the player's inventory
* ``text_on_pickup`` Text displayed when the object is picked up
* ``can_use_on_object`` Boolean false if the object can not be used on another object, string matching the unique object id of the object which this must be used on (e.g. *use key on lock*)
* ``text_on_use_object_on`` Text displayed when the object is used on the other specified object
* ``remove_after_use`` Boolean (true or false) indicating if the object must be removed from the inventory after use
* ``depends_on`` Either an empty string or the id of an object that must be used before this object can be used (e.g. *a drawer can only be used when the key is used on the lock*)
* ``text_on_error`` Text shown when user tries to use this object before the dependency is met
* ``use_trigger`` Triggers when the object is used
* ``examine_trigger`` Triggers when the object is examined
* ``pickup_trigger`` Triggers when the object is picked up

``startlocation`` String containing location id. Set on the locations object to indicate at what location the game is supposed to start. 

### Prompts

Each location can trigger one or multiple prompts. You can set conditions for prompts to control which prompts are shown. You can also nest prompts to create a complex series of questions for the player to answer.

* ``prompt_text`` The question shown to the player
* ``responses`` All possible responses the player can choose from
* ``has_prompted`` Boolean (true or false) to keep track if a prompt has already been shown or not
* ``can_repeat`` Boolean (true or false) indicating if this prompt can only be shown once or if it can be repeated
* ``prompt_conditions`` Array containing the conditions for this prompt to be shown

Responses to a prompt contain the following data:

* ``valid_commands`` Array containing strings representing a valid response. If the player's input matches one of these strings, this response will be shown.
* ``response_text`` Text shown when this response is chosen
* ``goto_location`` Optional id of a location to move to.
* ``receive_object`` Optional id of an object the player receives and puts in her inventory. Note, this object must be available in the current location
* ``response_trigger`` Triggers when this response is shown

### Victory conditions

Victory conditions are how the game engine can tell if a player has reached the end of the game. You can use any combinations of conditions which can specified.

* ``used_objects`` Array containing ids of objects that must be used
* ``in_location`` String contain the location id of the location the player must be in
* ``have_objects`` Array containing ids of objects the player must have visited
* ``visited_locations`` Array containing ids of locations the player must have visited
* ``has_responded`` Array containing a list of responses the player must have taken. These responses must be formatted in the following way: ``locationid.promptid.responseid``. Prompts can be nested, you can address nested prompts by adding on ``promptid.responseid`` as needed.

``victory_text`` String set on the victory conditions object. Provides the text shown to the player when she has finished the game. You can use HTML formatting.

``victory_trigger`` Trigger that can be called when the game detects all conditions are met.
