var locations = {
  "start": {
    name: "Starting location",
    description: "",
    text_on_visit: "",
    objects: {},
    prompts: {
      "hat": {
        prompt_text: "White hat or black hat?",
        responses: {
          "hat_white":  {
            valid_commands: "white, w, white hat",
            response_text: "You have chosen white hat",
            goto_location: "wh_start"
          },
          "hat_black": {
            valid_commands: "black, b, black hat",
            response_text: "you have chosen black hat",
            goto_location: "bh_start"
          }
        },
        has_prompted: false,
        can_repeat: false
      }
    }
  },
  "wh_start": {
    name: "White hat starting location",
    description: "Starting location for the white hat",
    text_on_visit: "White hat path first location",
    directions: {
      "direction indicator": {
        location: "another_location_id",
        depends_on: "object_id",
        text_on_error: "Text shown to users when trying to go in this directions when dependencies aren't met"
      },
    },
    visit_trigger: {
      function_call: "",
      function_parameters: ""
    },
    objects: {
      "object_id": {
        name: "Object name",
        description: "Object description",
        can_use: true,
        text_on_use: "Text shown to users when using this object",
        can_pickup: true,
        text_on_pickup: "Text shown to users when object is picked up",
        can_use_on_object: "use_object_id",
        text_on_use_object_on: "Text shown to users when object is used (correctly) on another object",
        remove_after_use: false,
        depends_on: "",
        text_on_error: "Text shown when object is not used correctly"
      },
      "use_object_id": {
        name: "Another object name",
        description: "Object description",
        can_use: true,
        text_on_use: "Text shown to users when using this object",
        can_pickup: true,
        text_on_pickup: "Text shown to users when object is picked up",
        can_use_on_object: false,
        text_on_use_object_on: "Text shown to users when object is used (correctly) on another object",
        remove_after_use: false,
        depends_on: "",
        text_on_error: "Text shown when object is not used correctly"
      }
    }
  },
  startlocation: "start"
};
