// Current action plan:
// Come up with a method of fading text in and out.
// Once successful, design a fade for buttons. First blank buttons fade in, then utilize text fading function



//This will the startup function
function fadeTextIn(jQTarg) {

    let words, $el;
    let arrEl = [];
    jQTarg.each(function () {
        let $this = $(this);
        arrEl.push({el: $this, words: $.trim($this.text()).split(" ")});
    $this.empty();
    });
    let len = arrEl.length, obj = arrEl.shift() || {};
    $el = obj.el;
    words = obj.words;
    if (len) setTimeout(transitionElement, 0);
}

function transitionElement() {

    let wlen = words.length,
        span = $('<span/>', {'class': 'hide'}).append(" " + words.shift()); //remove and get the top text string from the word array wrap it in span with a class "hide" which will hide it by default

    setTimeout(function () {
        if (wlen)  //if words are available anymore then call show word
            // append the span to the container with an animation duration of 500ms and in the complete callback of this invoke transitionElement to process the next word or next item.
            // Here there is no delay required since this will invoked only when the transition of first word is completed
            span.appendTo($el).fadeTextIn(500, transitionElement);
        else //else call fadeIn to process the next container in the arrEl array of items
            fadeTextIn();
    }, 0);
}

// Have to work on the async between this function and the showText function. They're running concurrently and not producing expected results
// Might want to watch another video on hoisting - might be relevant
//DEFINITELY watch more on promises and async

function clearText(target, index, interval) {
    let total = $(target).text().length;
    console.log(index);
    console.log(total);
    if (index < total) {
        document.querySelector(target).innerText.slice(index--);
        console.log(index);
        setTimeout(function () {
            clearText(target, index, interval);
        }, interval);
    }
}

//The way that this animates text is just trash
// function showText(target, message, index, interval) {
//     if (index < message.length) {
//         $(target).append(message[index++]);
//         setTimeout(function () {
//             showText(target, message, index, interval);
//         }, interval);
//     }
// }

// new idea: set var equal to split text and iterate through it adding spaces between words

function fadeIn(jQuerySelector, newText) {
    let splitText = newText.split(' ');
    // jQuerySelector.text(newText);
    jQuerySelector.fadeIn();
//    could use anime here for a standard text transition animation
}

function sceneChange() {
//    perhaps this will be needed to bundle functions. probably not.
}

// refactor code! click handler on selectionBox. Allows you more design freedom!
$('#selectionBox').click(e => {
    if (e.target.classList.contains('storySelector')) {
        const selectedStory = e.target.innerText;
        const storyID = '#' + e.target.id;
        console.log(storyID);
        const classControl = () => $(storyID).toggleClass('storySelector');
        classControl();
        let storyFade = anime.timeline();
        storyFade
            .add({
                targets: storyID,
                rotate: {
                    value: 360,
                    duration: 750,
                    easing: 'easeOutSine'
                },
                opacity: {
                    value: 0,
                    duration: 1500
                },
                translateY: {
                    value: '-100vh',
                    duration: 1000
                }
            })
            .add({
                targets: '.storySelector',
                opacity: 0,
                offset: '-=1000',
                duration: 1000,
                complete: anim => {
                    classControl();
                    $('.storySelector').each(function (index) {
                        $(this).toggle();
                    });
                    $.ajax({
                        url: '/story/api/',
                        type: 'GET',
                        data: {
                            storySelection: `${selectedStory}`
                        },
                        success: response => {
                            // this is where the I should animate to the next screen which
                            // can be a .optionSelector listener
                            const currentContext = response[0]['context'];
                            localStorage.setItem("story", `${currentContext.story_name}`);
                            localStorage.setItem("scene", `${currentContext.scene}`);
                            localStorage.setItem("options", JSON.stringify(currentContext.options));
                            const optionCount = parseInt(currentContext.optionQuantity);
                            let ourSuperLazyCounter = 0;
                            clearText('#textBox > p', 0, 20);
                            showText('#textBox > p', currentContext.sceneText, 0, 25);
                            // textChange($('#textBox > p'), currentContext.sceneText);
                            const div_options = JSON.parse(localStorage.getItem('options'));
                            $('#optionBox').find('.button').each(function (index) {
                                if (ourSuperLazyCounter >= optionCount) {
                                    return false
                                }
                                let focus = String(index + 1);
                                this.innerText = (div_options[`${focus}`]["option_text"]);
                                ourSuperLazyCounter++
                            })
                            //    Put animations here for page transition
                        }
                    });
                }
            });
    }
});

$('.optionSelector').click(e => {
    const optionId = e.target.id;
    const divOptions = JSON.parse(localStorage.getItem('options'));
    console.log(divOptions);
    const optionLabelLocator = e.target.id.slice(-1);
    const selectedOption = divOptions[optionLabelLocator]['option_label'];

    optionLabel = divOptions[optionLabelLocator]['option_label'];
    $.ajax({
        url: '/story/api/',
        type: 'GET',
        data: {
            optionSelection: `${selectedOption}`
        },
        success: response => {
            console.log(response);
            const currentContext = response[0]['context'];
            console.log(currentContext);
            const optionCount = parseInt(currentContext.optionQuantity);
            localStorage.setItem("scene", `${currentContext.scene}`);
            localStorage.setItem("options", JSON.stringify(currentContext.options));
            const div_options = JSON.parse(localStorage.getItem('options'));
            let ourSuperLazyCounter = 0;
            $('#optionBox').find('.button').each(function (index) {
                if (ourSuperLazyCounter >= optionCount) {
                    console.log(ourSuperLazyCounter, optionCount);
                    return false
                }
                let focus = String(index + 1);
                this.innerText = (div_options[`${focus}`]["option_text"]);
                ourSuperLazyCounter++;
                $(this).toggle();
            })
        }
    })
});

// $( "#hider" ).click(function() {
//   $( "span:last-child" ).hide( "fast", function() {
//     // Use arguments.callee so we don't need a named function
//     $( this ).prev().hide( "fast", arguments.callee );
//   });
// }); this shit is great - can animate letters to disappear one at a time.
// Retrieve
// document.getElementById("result").innerHTML = localStorage.getItem("lastname");
// sessionStorage for session, localStorage =for persistent data