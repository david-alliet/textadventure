/* 
  This is an example inventory object which can be passed to the Text Adventure engine. 
  The inventory object sets the starting inventory of the player in the game.
  See the README document for more information.
*/
var inventory = {
  "object_id": {
    name: "object name",
    description: "Object description",
    can_use: false,
    text_on_use: "Text shown to user when the object is used by itself",
    can_pickup: true,
    text_on_pickup: "Text shown to user when the objct is picked up",
    can_use_on_object: "other_object_id",
    text_on_use_object_on: "Text shown to user when the object is used on the specified object",
    remove_after_use: false,
    depends_on: "third_object_id",
    text_on_error: "Text shown when the third object isn't available",
    use_trigger: {
      function_call: "function_name",
      function_parameters: "value"
    },
    pickup_trigger: {
      function_call: "function_name",
      function_parameters: "value"
    },
    examine_trigger: {
      function_call: "function_name",
      function_parameters: "value"
    },
  }
};
