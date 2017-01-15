"use strict";

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
            this.htmlElement.classList.add('dead');
        }

        document.getElementById(this.classType + "-health").innerHTML = this.health;

        let element = this.htmlElement
        element.classList.add('hit');
        setTimeout(function() {element.classList.remove('hit');},200);
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
        setTimeout(function() {element.classList.remove('healing');},300);
    }
}

let dragon = new Character("dragon", 1000);
dragon.fireAttack = function(amount) {
    this.fireCharge += amount;
    if(amount < 0) amount = 0;
    document.getElementById('fire-value').style.width = this.fireCharge + "%";

    if(this.fireCharge === 100) {
        let self = this;
        heroes.forEach(function(hero) {
            hero.receiveDamage(self.fireDamage);
        });
        this.fireCharge = 0;
    }
};
dragon.fireCharge = 0;
dragon.fireDamage = 20;

let warrior = new Character("warrior", 200);
let rogue = new Character("rogue", 150);
let wizard = new Character("wizard", 100);

let heroes = [
    warrior,
    rogue,
    wizard
]
