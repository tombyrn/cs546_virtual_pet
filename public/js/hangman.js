const hintButton = document.querySelector('.hint-btn');
  const hintDiv = document.querySelector('.hint-div');
  const hintText = document.querySelector('.hint-txt');
  const wordDiv = document.querySelector('.word-div');
  const notif = document.querySelector('.notif');
  const notifContent = document.querySelector('.notif-content');
  const notifSpan = document.querySelector('.notif-span');

  let letters;
  let lives;
  let select_word;

  const init = function (state) {
    letters = document.querySelectorAll('.alpha');
    select_word = document.getElementById('selectedword').innerText;
    lives = document.getElementById('lives').innerText;
  };

  init()
  
  const showNotif = function (msg) {
    notif.classList.remove('hidden');
    notifSpan.textContent = select_word;
    notifContent.textContent = `You ${msg}`;
    if(msg === 'won'){
      notifContent.textContent += "\nYou earned 100 points!"
      victory();
    }
  };

  const victory = async () => {
    await $.post('/addUserPoints', {points: 100});
    await $.post('/home/updatePetHappiness');
  }

  const decreaseLife = function () {
    lives--;
    document.getElementById('lives').innerText = lives;
    if (lives === 0) {
      showNotif('lost');
      document.getElementsByClassName('letter-div')[0].className = 'disabled';

    }
  };

  const getindexes = function (letter) {
    let indexes = [];
    [...select_word].forEach((val, i) => {
      if (val === letter) {
        const index = i;
        indexes.push(index);
      }
    });
    return indexes;
  };

  const checkWord = function () {
    let val = true;
    for (let i = 0; i < wordDiv.children.length; i++) {
      if (wordDiv.children[i].textContent === '_') {
        val = false;
      }
    }
    return val;
  };

  const letterPress = function () {
    const letter = this.textContent.toLowerCase();
    if (select_word.includes(letter)) {
      const indexes_list = getindexes(letter);
      indexes_list.forEach((val, i) => {
        wordDiv.children[val].textContent = this.textContent;
      });
      if (checkWord()) 
      {
        showNotif('won');
        document.getElementsByClassName('letter-div')[0].className = 'disabled';
      }
      
    } else {
      decreaseLife();
    }
    this.classList.add('disabled');
  };

  letters.forEach(btn => {
    btn.addEventListener('click', letterPress);
  });

  hintButton.addEventListener('click', function () {
    hintDiv.classList.remove('hidden');
    let url = `http://localhost:4000/home/gethint?answertext=${select_word}`
    $.ajax({
      url: url, success: function (result) {
       hintText.textContent = result;
      }
    });
    
  });