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
        text_on_use: "It goes beep",
      }
    }
  },
  "hallway": {
    name: "Hallway",
    description: "A halway with a few doors",
    text_on_visit: "You find yourself in a long hallway, there is a door to the north",
    directions: {
      "north": "office"
    }
  },
  startlocation: "hallway"
};
