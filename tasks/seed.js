const dbConnection = require('../config/mongoConnection');
const data = require('../data');
const users = data.users;
const pets = data.pets;

async function main() {
    const db = await dbConnection.dbConnection();
    await db.dropDatabase();

    const user1 = await users.createUser(
        'Jordan',
        'Fernandes',
        'jortest@test.com',
        'JordanGotchi',
        'Jortest123!'
    )
    const pet1 = await pets.createPet(
        // TODO: Fix this up if you change user data. 
        user1.userInfo._id.toString(), 
        {
            name: 'Jorpet',
            design: 1
        }
    )
    await pets.givePetToUser(user1.userInfo._id.toString(), pet1);

    const user2 = await users.createUser(
        'Francesca',
        'Severino',
        'fratest@test.com',
        'FrancesGotchi',
        'Fratest123!'
    )
    const pet2 = await pets.createPet(
        user2.userInfo._id.toString(), 
        {
            name: 'Frapet',
            design: 2
        }
    )
    await pets.givePetToUser(user2.userInfo._id.toString(), pet2);

    const user3 = await users.createUser(
        'Thomas',
        'Byrnes',
        'tomtest@test.com',
        'ThomasGotchi',
        'Tomtest123!'
    )
    const pet3 = await pets.createPet(
        user3.userInfo._id.toString(), 
        {
            name: 'Tompet',
            design: 3
        }
    )
    await pets.givePetToUser(user3.userInfo._id.toString(), pet3);

    console.log('Done seeding database');

    await dbConnection.closeConnection();
}

main()