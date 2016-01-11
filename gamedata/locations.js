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
      "office_computer": {
        name: "computer",
        description: "A computer on a desk",
        can_use: true,
        text_on_use: "It goes beep",
        can_pickup: false,
        text_on_pickup: "",
        can_use_on_object: false,
        text_on_use_object_on: "",
        remove_after_use: false,
        depends_on: ""
      },
      "office_desk": {
        name: "desk",
        description: "A desk with a drawer. There is a computer on it.",
        can_use: false,
        text_on_use: "",
        can_pickup: false,
        text_on_pickup: "",
        can_use_on_object: false,
        text_on_use_object_on: "",
        remove_after_use: false,
        depends_on: ""
      },
      "office_drawer": {
        name: "drawer",
        description: "The drawer of the office desk. Perhaps there is something inside?",
        can_use: true,
        text_on_use: "You open the drawer. Inside there is a trinket.",
        can_pickup: false,
        text_on_pickup: "",
        can_use_on_object: false,
        text_on_use_object_on: "",
        remove_after_use: false,
        depends_on: ""
      },
      "office_trinket": {
        name: "trinket",
        description: "It's a trinket. It's use and value is not apparent",
        can_use: false,
        text_on_use: "",
        can_pickup: true,
        text_on_pickup: "You picked up the trinket. You never know if it'll come in handy.",
        can_use_on_object: false,
        text_on_use_object_on: "",
        remove_after_use: false,
        depends_on: "office_drawer",
        text_on_error: "You can't reach the trinket."
      }

    }
  },
  "hallway": {
    name: "Hallway",
    description: "A halway with a few doors",
    text_on_visit: "You find yourself in a long hallway, the office is to the north.",
    directions: {
      "north": {
        location: "office",
        depends_on: "hallway_door",
        text_on_error: "A locked door blocks your way."
      }
    },
    objects: {
      "hallway_door": {
        name: "door",
        description: "The door leading to the office. It appears closed",
        can_use: false,
        text_on_use: "",
        can_pickup: false,
        text_on_pickup: "",
        can_use_on_object: false,
        text_on_use_object_on: "",
        remove_after_use: false,
        depends_on: ""
      }
    }
  },
  startlocation: "hallway"
};
