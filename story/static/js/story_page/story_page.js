// Current action plan:
// Come up with a method of fading text in and out. CHECK
// Once successful, design a fade for buttons. First blank buttons fade in, then utilize text fading function
// will need to handle spaces in story names & id at some point.
// It'd be awesome to make the textBox scroll down with the fading in text! Ask Chris!

// Might want to watch another video on hoisting - might be relevant
//DEFINITELY watch more on promises and async

// document.getElementById("result").innerHTML = localStorage.getItem("lastname");
// sessionStorage for session, localStorage =for persistent data
function spanify(textTarget, textStr, spanClass = 'word') { // textTarget must be jquery selector
    $(`.${spanClass}`).css('opacity', 0);
    const splitText = textStr.split(' ');
    textTarget.empty();
    for (i in splitText) {
        textTarget.append(`<span class='${spanClass}'>${splitText[i]} </span>`)
    }
}

// this function may need to be edited so that callbacks make a bit more sense. perhaps if I had a scene change function
// I could properly order the sequence - we'll see if necessary

// PRE LUNCH GOAL SETTING::::::::::
// Need to make functions sufficiently modular and standardized in execution that they can be called during any selection context
// Refactor click listeners into one single click handler.!@!3123!@

// utilizing AJAX within promises would be glorious as it would allow me to easily maintain order.
// AJAX.then(transition).then(buttonappear)
function trigger(response) {
    const currentContext = response[0]['context'];
    const optionCount = parseInt(currentContext.optionQuantity);
    let ourSuperLazyCounter = 0;
    let focus = $('#textBox > p');
    spanify(focus, currentContext.sceneText);
    textFadeIn(focus);
    const div_options = JSON.parse(localStorage.getItem('options'));
    if ($('#storyButtonBox').attr('display') !== 'none') {
        $('#storyButtonBox').toggle();
    }
    buttonAnims = anime.timeline({
        duration: 2500
    });
    let ourOffset = 0;
    $('#optionBox').find('.button').each(function (index) {
        if (ourSuperLazyCounter >= optionCount) {
            return false
        }
        let that = this;
        let focus = String(index + 1);
        this.innerText = (div_options[focus]["option_text"]);
        $(this).css('display', 'inline');
        buttonAnims.add({
            targets: that,
            translateY: [1000, 0],
            duration: 1500,
            opacity: [0, 1],
            offset: ourOffset
        });
        ourOffset += 500;
        ourSuperLazyCounter++
    })
}

function textFadeOut(jQTextClass = '.word', response, callback = 0) {
    const words = $($(jQTextClass).get().reverse());
    console.log(words);
    words.each(function (index) {
            // $(this).hide()
            if (index === words.length - 1 && callback) {
                $(this).delay(index * 150).animate({'opacity': 0}, 150, function () {
                    trigger(response);
                    callback()
                });
            } else if (index === words.length - 1 && callback !== false) {
                trigger(response);
            } else {
                $(this).delay(index * 150).animate({'opacity': 0}, 350, function () {
                    // trigger(response)
                });
            }

        }
    )
    // $($(jQTextClass).get().reverse()).each(function (index) {
    //     $(this).delay(index * 150).animate({'opacity': 0}, 350, callback);
    // })
}

function textFadeIn(textTarg, delay = 150, duration = 350, callback = 0) { // texttarg: jquery selector text: string
    // spanify(textTarg, text); this should probably be in the code for it to be more modular
    // textFadeOut(textTarg);
    textTarg.css('text-align', 'left');
    textTarg.css('display', 'inline');
    const words = $('.word');
    words.each(function (index) {
        if (index === words.length - 1 && callback) {
            $(this).delay(index * delay).animate({'opacity': 1}, duration, callback);
        } else {
            $(this).delay(index * delay).animate({'opacity': 1}, duration);
        }
    });
}

$('#storyWelcome').ready(() => {
    const callMe = function () {
        anime({
            targets: '.storySelector',
            opacity: 1,
            duration: 1500
        })
    };
    spanTarget = $('#storyWelcome');
    spanify(spanTarget, spanTarget.text());
    textFadeIn(spanTarget, 500, 500, callMe);
});
$('#selectionBox').click(e => {
    if (e.target.classList.contains('storySelector')) {
        const selectedStory = e.target.innerText;
        const storyID = '#' + e.target.id;
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
                complete: () => {
                    $.ajax({
                        url: '/story/api/',
                        type: 'GET',
                        data: {
                            storySelection: `${selectedStory}`
                        },
                        success: response => {
                            textFadeOut('.word', response);
                            const currentContext = response[0]['context'];
                            localStorage.setItem("story", `${currentContext.story_name}`);
                            localStorage.setItem("scene", `${currentContext.scene}`);
                            localStorage.setItem("options", JSON.stringify(currentContext.options));
                        }
                    });
                }
            });
    } else if (e.target.classList.contains('optionSelector')) {
        const optionId = e.target.id;
        const divOptions = JSON.parse(localStorage.getItem('options'));
        const optionLabelLocator = e.target.id.slice(-1);
        const selectedOption = divOptions[optionLabelLocator]['option_label'];
        optionLabel = divOptions[optionLabelLocator]['option_label'];
        let buttonFade = anime.timeline();
        buttonFade
            .add({
                targets: optionId,
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
                targets: '.optionSelector',
                opacity: 0,
                offset: '-=1000',
                duration: 1000,
            });
        $.ajax({
            url: '/story/api/',
            type: 'GET',
            data: {
                optionSelection: `${selectedOption}`
            },
            success: response => {
                textFadeOut('.word', response);
                console.log(response);
                const currentContext = response[0]['context'];
                console.log(currentContext);
                const optionCount = parseInt(currentContext.optionQuantity);
                localStorage.setItem("scene", `${currentContext.scene}`);
                localStorage.setItem("options", JSON.stringify(currentContext.options));
                const div_options = JSON.parse(localStorage.getItem('options'));
                let ourSuperLazyCounter = 0;
                let focus = $('#textBox > p');
                spanify(focus, currentContext.sceneText);
                textFadeIn(focus);
                $('#optionBox').find('.button').each(function (index) {
                    if (ourSuperLazyCounter >= optionCount) {
                        console.log(ourSuperLazyCounter, optionCount);
                        return false
                    }
                    let focus = String(index + 1);
                    this.innerText = (div_options[`${focus}`]["option_text"]);
                    ourSuperLazyCounter++;
                    console.log(this, $(this));
                    if (this.innerText) {
                        $(this).css('display', 'inline')
                    }
                })
            }
        })
    }
});