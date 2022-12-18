let gamePattern = [];
let userClickedPattern = [];

let buttonColour = ["red", "blue", "green", "yellow"];

let playerTurn = false;

let started = false;
let level = 0;
let length;

// Citation: https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

async function nextLevel() {
    level++;
    $("h1").text("Level: " + level);
    userClickedPattern = [];
    let randomNumber = Math.floor(Math.random() * 4);
    let randomChosenColour = buttonColour[randomNumber];
    gamePattern.push(randomChosenColour);
    for (let color of gamePattern){
        let val = $("#" + color);
        val.fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
        playsound(color);
        await delay(750);
    }
    playerTurn = true;
}

$(".button").on("click", function () {
    if (playerTurn){
        var userChosenColour = $(this).attr("id");
        userClickedPattern.push(userChosenColour);
        animatePress(userChosenColour);
        length = userClickedPattern.length;
        if(checkAnswer(length - 1)){
            playsound(userChosenColour);
        }
    }
});

function playsound(name) {
    var sound = new Audio("/public/sounds/" + name + ".mp3");
    sound.play();
}

function animatePress(currentColour) {
    $("#" + currentColour).addClass("pressed");
    setTimeout(function () {
        $("#" + currentColour).removeClass("pressed");
    }, 80);
}

// detect mouse click on 'Start' button
$(".start").on("click", async function () {
    if (!started) {
        $("h1").text("Level :" + level);
        started = true;
        $(".start").remove();
        document.getElementsByClassName('main-container')[0].setAttribute('style','display:block');
        await nextLevel();
    }
});

const victory = async () => {
    await $.post('/addUserPoints', {points: 50});
    await $.post('/home/updatePetHappiness');
}

function checkAnswer(lastIndex) {
    if (gamePattern[lastIndex] === userClickedPattern[lastIndex]) {
        if (gamePattern.length === userClickedPattern.length) {
            if (level == 5) {
                // Game over, player wins
                $("h1").text("Congrats, You have won 50 points!");
                victory();

                // Reset the game
                started = false;
                gamePattern = [];
                level = 0;
                playerTurn = false;
                $(".main-container").before('<button type="button" class="restart btn btn-lg ">Restart</button>');
                document.getElementsByClassName('main-container')[0].setAttribute('style','display:none');
                $(".restart").on("click", async function () {
                    if (!started) {
                        $("h1").text("Level :" + level);
                        started = true;
                        $(".restart").remove();
                        document.getElementsByClassName('main-container')[0].setAttribute('style','display:block');
                        await nextLevel();
                    }
                })
            }
            else {
                // Move to the next level
                playerTurn = false;
                setTimeout(async function () {
                    await nextLevel();
                }, 1000);
            }
        }
        // Player has more buttons to press; do nothing. 
        return true;
    }
    else {
        // Player clicked the wrong button, loses
        $("body").addClass("game-over")
        $("h1").text("Game Over!");
        document.getElementsByClassName('main-container')[0].setAttribute('style','display:none');
        var sound2 = new Audio("/public/sounds/wrong.mp3");
        sound2.play();
        setTimeout(function () {
            $("body").removeClass("game-over")
        }, 200);

        // Reset the game
        started = false;
        gamePattern = [];
        level = 0;
        playerTurn = false;
        $(".main-container").before('<button type="button" class="restart btn btn-lg ">Restart</button>');
        document.getElementsByClassName('main-container')[0].setAttribute('style','display:none');
        $(".restart").on("click", async function () {
            if (!started) {
                $("h1").text("Level :" + level);
                started = true;
                $(".restart").remove();
                document.getElementsByClassName('main-container')[0].setAttribute('style','display:block');
                await nextLevel();
            }
        })
        return false;
    }
}

async function startOver() {
    level = -1;
    gamePattern = [];
    started = false;
    await nextLevel();
}