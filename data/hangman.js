const alphabets = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];
const lives = 5
const words = new Map([
  ["sparrow", "A bird with a grey head and white cheeks."],
  ["dog", "You can take this one for a walk!"],
  ["cat", "The cuddly, domesticated version of lions."],
  ["cryptography", "Method of encrypting text."],
  ["programming", "Process of instructing the computer to perform a series of operations."],
  ["computer", "Comes in different shapes and sizes, used to watch netflix, write code, write emails."],
  ["executioner", "A synonym of hangman!"],
  ["starbucks", "Famous chain of coffeehouses."],
  ["table", "A flat piece of furniture."],
  ["chocolate", "A dark dessert relished by children and adults alike."],
  ["plastic", "A leading cause of the climate crisis."],
  ["brush", "Something that is used everyday first thing in the morning."],
  ["sommelier", "To become one you have to pass arguably the toughest certification on the planet!."],
  ["eyes", "--*Blank* and ears and mouth and nose--"],
  ["mouse", "A name used for both an animal and computer accessory."]
]);

module.exports = {alphabets,lives,words}