"use strict";

console.clear();

//Pre-loading images into memory
const images_array = [
    (new Image()).src = "images/dungeon.png",
    (new Image()).src = "images/wild.png",
    (new Image()).src = "images/sword.png",
    (new Image()).src = "images/shield.png",
    (new Image()).src = "images/bow.png",
    (new Image()).src = "images/sneak.png",
    (new Image()).src = "images/magic.png",
    (new Image()).src = "images/heal.png",
    (new Image()).src = "images/claw.png"
];

//Array of arrays, where each array element keeps the tiles of a winning condition
let tilesInSequence = [];

//All tiles in the game
let tiles = [];

//Is any of the tiles locked
var isAnyLocked = 0; //TODO: fix this variable. make it accessible from a tile object

function attackEffect(target) {
    for(let t of target){
        t.causeDamage(this.damage);
    }
}

function Character(classType, health) {
    this.classType = classType;
    this.health = health;
    this.maxHealth = health;
    this.isShielded = false;
    this.isDead = false;
    this.htmlElement = document.getElementById(this.classType);
    this.receiveDamage = function(damage) {
        this.health -= damage;
        if(this.health <= 0){
            this.health = 0;
            this.isDead = true;
        }

        document.getElementById(this.classType + "-health").innerHTML = this.health;

        let element = this.htmlElement
        element.classList.add('hit');
        setTimeout(function() {element.classList.remove('hit');},700);
    }
    this.healDamage = function(amount) {
        if(this.isDead) return;

        this.health += amount;
        if(this.health >= this.maxHealth){
            this.health = this.maxHealth;
        }

        document.getElementById(this.classType + "-health").innerHTML = this.health;

        let element = this.htmlElement
        element.classList.add('healing');
        setTimeout(function() {element.classList.remove('healing');},700);
    }
}

let dragon = new Character("dragon", 1000);
let warrior = new Character("warrior", 100);
let rogue = new Character("rogue", 80);
let wizard = new Character("wizard", 50);

let heroes = [
    warrior,
    rogue,
    wizard
]

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
        damage: 10,
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
        damage: 5,
        probability: 3,
        image: "images/bow.png"
    },
    sneak: {
        title: "sneak",
        character: rogue,
        action: function (){dragon.receiveDamage(this.damage);},
        damage: 10,
        probability: 3,
        image: "images/sneak.png"
    },
    magic: {
        title: "magic",
        character: wizard,
        action: function (){dragon.receiveDamage(this.damage);},
        damage: 10,
        probability: 3,
        image: "images/magic.png"
    },
    heal: {
        title: "heal",
        character: wizard,
        action: function (){ let self = this; heroes.forEach(function(hero) {hero.healDamage(self.damage);})},
        damage: 5,
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

//Game constructor
var GameSlots = function() {

    let slots = document.querySelector('#slots');
    let stats = document.querySelector('#stats');
    let attacks = document.querySelector('#attacks');

    //Size of board
    let lines = 3;
    let columns = 3;

    //Stack of attacks to be performed
    let attackStack = [];

    //Statistics
    let amountOfPlays = 0;
    let amountOfWins = 0;
    let dragonAttacks = 0;

    //Creates the tile elements and puts it in the array
    function createSlots() {

        for (let i = 0; i < lines; i++) {
            tiles.push([]);
            for (let j = 0; j < columns; j++) {
                let tile = Object.create(Tile);
                tile.createElement(slots, i, j);

                tiles[i].push(tile);
            }
        }

    }

    //Randomize tiles
    function randomTiles() {

        let keys = Object.keys(cards);

        let rollTiles = tiles;

        let wildLimit = 2;
        let currentWildCards = 0;

        for (let line of rollTiles) {
            for (let tile of line) {

                //Skip this tile if it's locked. Unlock it while you're at it
                if (tile.locked) {
                    tile.unlock();
                    continue;
                }

                let newCardIndex = 0;
                do {
                    newCardIndex = Math.floor(Math.random() * keys.length);
                } while (newCardIndex === 0 && currentWildCards++ >= wildLimit);

                tile.replaceCard(keys[newCardIndex]);
            }
        }

        //After new tiles is set, it check if the player won.
        checkVictoryConditions();
    }

    //Check if the player won and pushes the winnings on the attack stack
    function checkVictoryConditions() {
        let points = 0;
        attackStack = [];

        for (let elements of tilesInSequence) {

            let winner = true;
            let usingWild = false;
            let typeOfAttack;

            for (let el of elements) {

                let cardTitle = el.card.title;

                //When the first card that's not a wild card is found, save it in the variable
                if (typeof typeOfAttack === "undefined" && cardTitle !== "WILD") {
                    typeOfAttack = cardTitle;
                }

                if (cardTitle === "WILD") {
                    usingWild = true;
                    continue;
                }

                //If a card breaks the sequence, there's not match
                if (typeOfAttack !== cardTitle) {
                    winner = false;
                    break;
                }

            }

            //Don't allow claw attacks to be used with Wild cards.
            //(remove this if you want to allow it.)
            //if(usingWild && typeOfAttack === "claw")
            //continue;

            if (typeof typeOfAttack === "undefined")
                console.error("3 WILD CARDS IN A ROW");

            if (winner && (typeOfAttack === "claw")) {
                ++dragonAttacks;
                attackStack.push(typeOfAttack);
                for (let e of elements)
                    e.highlight();
                winner = false;
            }
            if (winner) {
                for (let e of elements)
                    e.highlight();
                attackStack.push(typeOfAttack);
                ++amountOfWins;
            }

        }
        if(attackStack.length > 0)
            performAttacks(attackStack);

        amountOfPlays++;

        //Temp statistics
        stats.innerText = "Wins: " + amountOfWins + " (" + (amountOfWins * 100 / amountOfPlays).toFixed() + "%)" + "; Dragon attacks: " + dragonAttacks;
        attacks.innerText = attackStack;
    }

    function performAttacks(attacks) {
        for(let a of attacks) {
            cards[a].action();
        }

    }

    function init() {
        createSlots();
    }

    //Returns a public API visible from outside its scope
    return {
        create: init,
        rollAgain: randomTiles,
        checkVitory: checkVictoryConditions
    };
};

window.onload = function init() {
    var game = new GameSlots();
    game.create();

    window.addEventListener('keydown', game.rollAgain, false);
    document.getElementById('roll').addEventListener("click", game.rollAgain, false);
    document.querySelector("#slots").addEventListener("click", lockTiles, false);

    tilesInSequence = getTilesInSequence();

    //Handles button clicks to roll the specific line or column
    function lockTiles(e) {
        let tileCoord = e.target.parentNode.getAttribute("data-tile").split(",");

        let tile = tiles[tileCoord[0]][tileCoord[1]];

        if(!tile.locked)
            tile.lock();
        else {
            tile.unlock();
        }
        //console.log(window.isAnyLocked); //TODO: fix this variable

        e.stopPropagation();
    }

};