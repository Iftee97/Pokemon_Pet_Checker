document.querySelector("button").addEventListener("click", getFetch);

function getFetch() {
    const choice = document.querySelector("input").value.replaceAll(' ', '-').replaceAll('.', '').toLowerCase();
    const url = `https://pokeapi.co/api/v2/pokemon/${choice}`;

    fetch(url)
        .then((res) => res.json())
        .then((data) => {
            // console.log(data);
            const { name, height, weight, types, sprites, location_area_encounters } = data; // destructuring properties from data
            const potentialPet = new PokeInfo(name, height, weight, types, sprites.other['official-artwork'].front_default, location_area_encounters);
            // console.log(potentialPet);
            potentialPet.getTypes();
            potentialPet.isItHousePet();
            let decision = '';
            if (potentialPet.housePet) {
                decision = `${potentialPet.name} is small, light and safe enough to be a good house pet! You can find ${potentialPet.name} in the following location(s):`;
                potentialPet.encounterInfo();
            } else {
                decision = `${potentialPet.name} would not be a good pet because ${potentialPet.reason.join(' and ')}`;
            }
            document.querySelector('h2').innerText = decision;
            document.querySelector('img').src = potentialPet.image;
        })
        .catch((err) => {
            console.log(`error ${err}`);
        });
}

class Poke {
    constructor(name, height, weight, types, image) {
        this.name = name;
        this.height = height;
        this.weight = weight;
        this.types = types;
        this.image = image;
        this.housePet = true;
        this.reason = [];
        this.typeList = [];
    }

    getTypes() {
        for (let property of this.types) {
            this.typeList.push(property.type.name);
        }
        // console.log(this.typeList);
    }

    weightToPounds(weight) {
        return Math.round((weight / 4.536) * 100) / 100; // rounded to 2 decimal places
    }

    heightToFeet(height) {
        return Math.round((height / 3.048) * 100) / 100; // rounded to 2 decimal places
    }

    isItHousePet() {
        // check height, weight and types
        let badTypes = ['fire', 'electric', 'fighting', 'poison', 'ghost'];
        if (this.weightToPounds(this.weight) > 400) {
            this.reason.push(`it is too heavy at ${this.weightToPounds(this.weight)} pounds`);
            this.housePet = false;
        } if (this.heightToFeet(this.height) > 7) {
            this.reason(`is it too tall at ${this.heightToFeet(height)} feet`);
            this.housePet = false;
        } if (badTypes.some(badType => this.typeList.indexOf(badType) >= 0)) {
            this.reason.push('its type is too dangerous');
            this.housePet = false;
        }
    }
}

class PokeInfo extends Poke {
    constructor(name, height, weight, types, image, location) {
        super(name, height, weight, types, image);
        this.locationURL = location;
        this.locationList = [];
        this.locationString = '';
    }

    encounterInfo() {
        fetch(this.locationURL)
            .then(res => res.json())
            .then(data => {
                // console.log(data);
                for (const item of data) {
                    this.locationList.push(item.location_area.name);
                }
                let target = document.getElementById('locations');
                target.innerText = this.locationCleanup();
            })
            .catch(err => console.log(err));
    }

    locationCleanup() {
        const words = this.locationList.slice(0, 5).join(', ').replaceAll('-', ' ').split(' ');
        for (let i = 0; i < words.length; i++) {
            words[i] = words[i][0].toUpperCase() + words[i].slice(1);
        }
        // console.log(words);
        return words.join(' ');
    }
}
