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
  ["sparrow", "A bird with grey head, white cheeks."],
  ["dog", "You can take this one for a walk!"],
  ["cat", "The cuddly domesticated decendent of big cats."],
  ["cryptography", "Method of encrypting text."],
  ["programming", "Pocess of instructing the computer to perform a series of operations."],
  ["computer", "Comes in different shapes and sizes, used to watch netflix, write code, write emails."]
]);

module.exports = {alphabets,lives,words}