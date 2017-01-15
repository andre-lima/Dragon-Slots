"use strict";

//Array of arrays, where each array element keeps the tiles of a winning condition
let tilesInSequence = [];

//All tiles in the game
let tiles = [];

//Is any of the tiles locked
var isAnyLocked = false; //TODO: fix this variable. make it accessible from a tile object

//Dictionary associating the card type to the card object
let cards = {
    wild: {
        title: "WILD",
        character: "undefined",
        action: function (){console.error("attacking from a wild card...wut???");},
        damage: 0,
        probability: 1,
        image: "images/wild.png"
    },
    sword: {
        title: "sword",
        character: warrior,
        action: function (){dragon.receiveDamage(this.damage);},
        damage: 15,
        probability: 3,
        image: "images/sword.png"
    },
    shield: {
        title: "shield",
        character: warrior,
        action: function (){
            heroes.forEach(function(hero) {
                if(!hero.isDead){
                    hero.isShielded = true;
                    document.getElementById(hero.classType + "-shield").classList.remove("hide");
                }
        })},
        damage: 0,
        probability: 3,
        image: "images/shield.png"
    },
    bow: {
        title: "bow",
        character: rogue,
        action: function (){dragon.receiveDamage(this.damage);},
        damage: 10,
        probability: 3,
        image: "images/bow.png"
    },
    sneak: {
        title: "sneak",
        character: rogue,
        action: function (){
            dragon.receiveDamage(this.damage);
            dragon.fireAttack(-this.damage * 3);
        },
        damage: 5,
        probability: 3,
        image: "images/sneak.png"
    },
    magic: {
        title: "magic",
        character: wizard,
        action: function (){dragon.receiveDamage(this.damage);},
        damage: 15,
        probability: 3,
        image: "images/magic.png"
    },
    heal: {
        title: "heal",
        character: wizard,
        action: function (){ let self = this; heroes.forEach(function(hero) {hero.healDamage(self.damage);})},
        damage: 10,
        probability: 3,
        image: "images/heal.png"
    },
    claw: {
        title: "claw",
        character: dragon,
        action: function (){
            let hero;
            do {
                hero = heroes[Math.floor(Math.random()*heroes.length)];
            } while(hero.isDead);
            let damage = hero.isShielded ? Math.floor(this.damage/2) : this.damage;
            hero.isShielded = false;
            document.getElementById(hero.classType + "-shield").classList.add("hide");
            hero.receiveDamage(damage);
        },
        damage: 15,
        probability: 3,
        image: "images/claw.png"
    },
    chest: {
        title: "chest",
        character: "undefined",
        action: function (){
            console.log("+1 gold!");
        },
        damage: 0,
        probability: 1,
        image: "images/chest.png"
    }
};

//Tile constructor
var Tile = {

    //Will keep the DOM element for the tile
    element: null,

    //The card object associated to this tile
    card: undefined,

    //The coordinates of this tile in x and y
    coord: undefined,

    //Is the card locked?
    locked: false,

    //Method that replaces the card on this tile
    replaceCard: function(key) {
        this.card = cards[key];
        this.element.innerHTML = "<img src='" + this.card.image + "' />";
    },

    //Creates a DOM element and appends it to the 'slots' div
    createElement: function(parent, line, col) {
        parent = parent || document.getElementById("slots");
        let tile = document.createElement("div");

        tile.classList.add('tile');

        let att = document.createAttribute('data-tile');
        att.value = line + "," + col;
        tile.setAttributeNode(att);

        let img = document.createElement("img");
        img.src = "images/dungeon.png";

        this.element = tile;
        this.card = "";
        this.coord = line + "," + col;

        parent.appendChild(tile);
        tile.appendChild(img);
    },

    //Adds a CSS class to highlight when won
    highlight: function() {
        this.element.classList.add('win');
        setTimeout(this.removeHighlight, 1000, this);
    },

    //Adds a CSS class to highlight when won
    removeHighlight: function(self) {
        self.element.classList.remove('win');
    },

    //Locks the tile
    lock: function() {
        this.locked = true;
        this.element.classList.add('locked');
        window.inAnyLocked++;
    },

    //Locks the tile
    unlock: function() {
        this.locked = false;
        this.element.classList.remove('locked');
        window.inAnyLocked--;
    },

}

//Array of victory conditions.
//Needs to be created manually based on the amount of lines and columns
const victoryConditions = [
    [ //line 0
        [0, 0],
        [0, 1],
        [0, 2]
    ],
    [ //line 1
        [1, 0],
        [1, 1],
        [1, 2]
    ],
    [ //line 2
        [2, 0],
        [2, 1],
        [2, 2]
    ],
    [ //column 0
        [0, 0],
        [1, 0],
        [2, 0]
    ],
    [ //column 1
        [0, 1],
        [1, 1],
        [2, 1]
    ],
    [ //column 2
        [0, 2],
        [1, 2],
        [2, 2]
    ],
    [ //descending diagonal
        [0, 0],
        [1, 1],
        [2, 2]
    ],
    [ //ascending diagonal
        [2, 0],
        [1, 1],
        [0, 2]
    ]
];

//Gets the tile objects based on the victory conditions
//and returns the array of arrays
function getTilesInSequence() {
    let elements = [];

    for (let condition of victoryConditions) {
        let sequence = [];
        for (let coord of condition) {
            sequence.push(tiles[coord[0]][coord[1]]);
        }
        elements.push(sequence);
    }
    return elements;
};
