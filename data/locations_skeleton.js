var locations = {
  "location_id": {
    name: "Location name",
    description: "Location description",
    text_on_visit: "Text shown to users when entering the location",
    directions: {
      "direction indicator": {
        location: "another_location_id",
        depends_on: "object_id",
        text_on_error: "Text shown to users when trying to go in this directions when dependencies aren't met"
      }
    },
    objects: {
      "object_id": {
        name: "Object name",
        description: "Object description",
        can_use: true,
        text_on_use: "Text shown to users when using this object",
        can_pickup: false,
        text_on_pickup: "Text shown to users when object is picked up",
        can_use_on_object: false,
        text_on_use_object_on: "Text shown to users when object is used (correctly) on another object",
        remove_after_use: false,
        depends_on: "another_object_id",
        text_on_error: "Text shown when object is not used correctly",
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
      },
      visit_trigger: {
        function_call: "function_name",
        function_parameters: "value"
      }
    },
    prompts: {
      "promptid": {
        prompt_text: "The question shown to the player",
        responses: {
          "response1id": {
            valid_commands: ["response", "response variation"],
            response_text: "Text shown when the player chooses this response",
            goto_location: "locationid",
            response_trigger: {
              function_call: "function_name",
              function_parameters: "value"
            }
          },
          "response2id": {
            valid_commands: ["response", "response variation"],
            response_text: "Text shown when the player chooses this response",
            goto_location: "locationid",
            response_trigger: {
              function_call: "function_name",
              function_parameters: "value"
            }
          }
        },
        has_prompted: false,
        can_repeat: true,
        prompt_conditions: ["locationid.promptid.responseid"]
      }
    },
  },
  startlocation: "location_id"
};
