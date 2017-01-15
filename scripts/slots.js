"use strict";

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

//Game constructor
var GameSlots = function() {

    let slots = document.querySelector('#slots');
    //let stats = document.querySelector('#stats');
    //let attacks = document.querySelector('#attacks');

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
        startGame = true; //Once game starts, we can click and lock tiles

        let keys = Object.keys(cards);

        let rollTiles = tiles;

        let wildLimit = 1;
        let currentWildCards = 0;

        for (let line of rollTiles) {
            for (let tile of line) {

                //Skip this tile if it's locked. Unlock it while you're at it
                if (tile.locked) {
                    tile.unlock();
                    isAnyLocked = false;
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

        //After everyone attacks, tests if the dragon will use fire breath
        dragon.fireAttack(5);
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

            //Shouldn't happen
            if (typeof typeOfAttack === "undefined")
                console.error("3 WILD CARDS IN A ROW");

            //Dragon attacking
            if (winner && (typeOfAttack === "claw")) {
                ++dragonAttacks;
                attackStack.push(typeOfAttack);
                for (let e of elements)
                    e.highlight();
                winner = false;
            }
            //Hero attacking
            if (winner) {
                for (let e of elements)
                    e.highlight();
                if (!cards[typeOfAttack].character.isDead) {
                    attackStack.push(typeOfAttack);
                    ++amountOfWins;
                }
            }

        }
        if (attackStack.length > 0)
            performAttacks(attackStack);

        amountOfPlays++;
    }

    function performAttacks(attacks) {
        let timer = 400,
            i = 1;
        for (let a of attacks) {
            //Add a delay so the attacks occurs on a visible order
            setTimeout(function() {
                cards[a].action();
            }, timer * i++);
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
};

//Start Game
let startGame = false;

//Handles button clicks to roll the specific line or column
function lockTiles(e) {

    let tgt = e.target.parentNode.getAttribute("data-tile");

    //Return if clicking on the wrong place or clicking on the dungeon tiles
    if (tgt === null || !startGame) return;

    let tileCoord = tgt.split(",");

    let tile = tiles[tileCoord[0]][tileCoord[1]];

    //Toggle lock state
    if (!tile.locked && !isAnyLocked) {
        tile.lock();
        isAnyLocked = true;
    } else if (tile.locked && isAnyLocked) {
        isAnyLocked = false;
        tile.unlock();
    }

    e.stopPropagation();
}
