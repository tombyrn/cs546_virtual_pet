var gamePattern = [];

var userClickedPattern = [];

var buttonColour = ["red", "blue", "green", "yellow"];

var started = false;

var level = 0;

var length;

var c = 1; // Count variable for "restart' button

function nextSequence() {
  userClickedPattern = [];

  level++;
  $("h1").text("Level :" + level);

  var randomNumber = Math.floor(Math.random() * 4);
  var randomChosenColour = buttonColour[randomNumber];
  gamePattern.push(randomChosenColour);

  var val = $("#" + randomChosenColour);
  val.fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
  playsound(randomChosenColour);
}

// detect mouse click

$(".button").on("click", function () {
  var userChosenColour = $(this).attr("id");
  userClickedPattern.push(userChosenColour);

  playsound(userChosenColour);
  animatePress(userChosenColour);
  length = userClickedPattern.length;
  checkAnswer(length - 1);
});

function playsound(name) {
  var sound = new Audio("/sounds/" + name + ".mp3");
  sound.play();
}

function animatePress(currentColour) {
  $("#" + currentColour).addClass("pressed");
  setTimeout(function () {
    $("#" + currentColour).removeClass("pressed");
  }, 80);
}

// detect keyboard press

$(document).on("keydown", function () {
  if (!started) {
    $("h1").text("Level :" + level);
    nextSequence();
    started = true;
    $(".start").remove();
  }
});

// detect mouse click on 'Start' button
$(".start").on("click", function () {
  if (!started) {
    $("h1").text("Level :" + level);
    nextSequence();
    started = true;
    $(".start").remove();
  }
});

function checkAnswer(currentLevel) {
  if (gamePattern[currentLevel] === userClickedPattern[currentLevel]) {
    if (gamePattern.length === userClickedPattern.length) {
      setTimeout(function () {
        nextSequence();
      }, 1000);
    }
  } else {
    $("body").addClass("game-over");

    $("h1").text("Game Over, Press Any Key to Restart");
    var sound2 = new Audio("sounds/wrong.mp3");
    sound2.play();
    setTimeout(function () {
      $("body").removeClass("game-over");
    }, 200);
    if (c === 1) {
      $(".main-container").before(
        '<button type="button" class="restart btn btn-lg ">Restart</button>'
      );
      c = 0;
      // detect mouse click on 'Restart' button
      $(".restart").on("click", function () {
        if (!started) {
          $("h1").text("Level :" + level);
          nextSequence();
          started = true;
          $(".restart").remove();
        }
      });
    }
    startOver();
  }
}

function startOver() {
  level = 0;
  gamePattern = [];
  started = false;
}
