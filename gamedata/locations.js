var locations = {
  "office": {
    name: "David's office",
    description: "An office",
    text_on_visit: "You enter the office. There is a computer on a desk and a door to the south",
    directions: {
      "south": {
        location: "hallway",
        depends_on: "",
        text_on_error: ""
      }

    },
    objects: {
      "computer": {
        description: "A computer on a desk",
        can_use: true,
        text_on_use: "It goes beep",
        can_pickup: false,
        text_on_pickup: "",
        can_use_on_object: false,
        text_on_use_object_on: "",
        remove_after_use: false
      }
    }
  },
  "hallway": {
    name: "Hallway",
    description: "A halway with a few doors",
    text_on_visit: "You find yourself in a long hallway, there is a door to the north",
    directions: {
      "north": {
        location: "office",
        depends_on: "hallway door",
        text_on_error: "The door to the office is locked."
      }
    },
    objects: {
      "hallway door": {
        description: "The door leading to the office.",
        can_use: false,
        text_on_use: "",
        can_pickup: false,
        text_on_pickup: "",
        can_use_on_object: false,
        text_on_use_object_on: "",
        remove_after_use: false
      }
    }
  },
  startlocation: "hallway"
};
