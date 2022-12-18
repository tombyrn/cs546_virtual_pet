var gamePattern = [];

    var userClickedPattern = [];

    var buttonColour = ["red", "blue", "green", "yellow"];

    var started = false;

    var level = 0;

    var length;

    var c = 1; // Count variable for "restart' button 

    function nextSequence() {
        level++;
        $("h1").text("Level: " + level);
        var randomNumber = Math.floor(Math.random() * 4);
        var randomChosenColour = buttonColour[randomNumber];
        gamePattern.push(randomChosenColour);
        var val = $("#" + randomChosenColour);
        val.fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
        playsound(randomChosenColour);
        console.log("Current Pattern")
        console.log(gamePattern)
    }
    $(".button").on("click", function () {
        var userChosenColour = $(this).attr("id");
        userClickedPattern.push(userChosenColour);
        playsound(userChosenColour);
        animatePress(userChosenColour);
        length = userClickedPattern.length;
        checkAnswer(length - 1);
        console.log("Use patter");
        console.log(userClickedPattern)
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
    $(".start").on("click", function () {
        if (!started) {
            $("h1").text("Level :" + level);
            nextSequence();
            started = true;
            $(".start").remove();
            document.getElementsByClassName('main-container')[0].setAttribute('style','display:block');
        }
    });

    function checkAnswer(currentLevel) {
        if (gamePattern[currentLevel] === userClickedPattern[currentLevel]) {
            if (gamePattern.length === userClickedPattern.length) {
                if (level == 5) {
                    $("h1").text("Congrats, You have won 50 points!");
                    $.post('/addUserPoints', {points: 50});
                    started = false;
                    level = 0;
                    $(".main-container").before('<button type="button" class="restart btn btn-lg ">Restart</button>');
                    document.getElementsByClassName('main-container')[0].setAttribute('style','display:none');
                    $(".restart").on("click", function () {
                        if (!started) {
                            $("h1").text("Level :" + level);
                            nextSequence();
                            started = true;
                            $(".restart").remove();
                            document.getElementsByClassName('main-container')[0].setAttribute('style','display:block');
                        }

                    })
                }
                else {
                    setTimeout(function () {
                        nextSequence();

                    }, 1000);
                }
            }
        }
        else {
            $("body").addClass("game-over")
            $("h1").text("Game Over!");
            document.getElementsByClassName('main-container')[0].setAttribute('style','display:none');
            var sound2 = new Audio("/public/sounds/wrong.mp3");
            sound2.play();
            setTimeout(function () {
                $("body").removeClass("game-over")
            }, 200);
            started = false;
            level = 0;
            $(".main-container").before('<button type="button" class="restart btn btn-lg ">Restart</button>');
            document.getElementsByClassName('main-container')[0].setAttribute('style','display:none');
            $(".restart").on("click", function () {
                        if (!started) {
                            $("h1").text("Level :" + level);
                            nextSequence();
                            started = true;
                            $(".restart").remove();
                            document.getElementsByClassName('main-container')[0].setAttribute('style','display:block');
                        }

                    })
            startOver();
        }
    }

    function startOver() {
        level = -1;
        gamePattern = [];
        started = false;
        nextSequence();
    }