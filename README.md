# Text-adventure engine

This is a javascript text-adventure engine i'm programming for an upcoming website project. The aim of the engine is to allow an easy to create and update game that is fun and intuitive to play.

## Text-adventure structure

The text-adventure is structured in different **chapters**, each chapter has a number of **locations**. The **player**
can pick up **objects** which are kept in her **inventory**, and can be used with other objects found in the various locations.
The player must make her way through the locations and achieve a set of **goals** to finish a chapter.

## Data structure

The game data is structured in JSON objects.

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
