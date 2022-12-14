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
    ["test", "a test word"],
    ["tests", "another test word"],
    ["random", "some random word"]
  ]);
  
  const word_list = [...words.keys()];
  
  const getRandomWord = function () {
    return word_list[Math.floor(Math.random() * word_list.length)];
  };
  const word = getRandomWord();
  module.exports = {alphabets,lives,word,words}