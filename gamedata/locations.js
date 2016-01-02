var locations = {
  "office": {
    name: "David's office",
    description: "An office",
    text_on_visit: "You enter the office. There is a computer on a desk and a door to the south",
    directions: {
      "south": "hallway"
    },
    objects: {
      "computer": {
        description: "A computer on a desk",
        can_use: true,
        text_on_use: "It goes beep",
        can_pickup: false,
        text_on_pickup: "",
        can_use_on_object: false,
        text_on_use_object_on: ""
      }
    }
  },
  "hallway": {
    name: "Hallway",
    description: "A halway with a few doors",
    text_on_visit: "You find yourself in a long hallway, there is a door to the north",
    directions: {
      "north": "office",
      "west": "bedroom"
    },
  },
  "bedroom": {
    name: "Bedroom",
    description: "A bedroom",
    text_on_visit: "You\'re in a bedroom with many stuffed animals and cat posters. The door is to the east, it is the only entrance or exit.",
    directions: {
      "east": "hallway"
    },
    objects: {
      "bed": {
        name: "A bed",
        description: "A bed that seems too empty",
        can_use: false,
        text_on_use: "",
        can_pickup: false,
        can_use_on_object: false,
        text_on_use_object_on: ""
      },
      "teddy bear": {
        description: "A lonely teddy bear",
        can_use: false,
        text_on_use: "",
        can_pickup: true,
        text_on_pickup: "",
        can_use_on_object: "bed",
        text_on_use_object_on: "you put the teddy bear on the bed, where it seemingly belongs."
      }
    }
  },
  startlocation: "hallway"
};
