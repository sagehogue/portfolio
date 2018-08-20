// TODOS
// #1: Fix alignment issue after story selection. DONE
// #2: Fix animation flow issues. DONE-ish
// #3: Fix weird delay between word fadein and button appearance. Line ~150 has comments

//CURRENT:::: Fix Callback problems
// May need to do larger scale revisions... Perhaps post on a subreddit and get some advice. I don't entirely understand
// What I am missing.
// Sadly a lot of them are still not playing in sequence. It also may be calling too many animations
// Could attach some console.logs and see how many times it calls opacity controls?


// Current best guess: I'll have to add the buttonSwitchAll into the callback series. Maybe .bind() comes in play?

let newText = '';

function initialize() {
    let buttonState = document.querySelector('.storySelector');
    buttonState.disabled = true;
    const init_animation = () => {
        anime({
            targets: '.storySelector',
            opacity: 1,
            duration: 1500,
            complete: function () {
                buttonState.disabled = false;
            }
        });
    };
    spanTarget = $('#storyWelcome');
    spanify(spanTarget, spanTarget.text());
    fadeInController('.word', init_animation);
}

// the argument called selected declares the ID of the option or story selected by the user.
// the argument selectedStory is used in differentiating between story requests and option requests.
// prev_scene is currently extraneous information.
function doSomeAJAX(selected, selectedStory = false, prev_scene = false, buttonFadeOut = 1500) {
    return new Promise((res, rej) => {
        if (selectedStory === false) {
            $.ajax({
                url: '/story/api/',
                type: 'GET',
                data: {
                    optionSelection: selected
                }
            }).done((data) => {
                buttonSwitchAll(buttonFadeOut);
                res(data)
            }).fail((error) => {
                rej(error)
            })
        }
        else {
            $.ajax({
                url: '/story/api/',
                type: 'GET',
                data: {
                    storySelection: selected
                },
                complete: function () {
                    transition('.word', true, true);
                }
            })
                .done((data) => {
                    res(data)
                    // I could probably put the transition logic in here - might make more sense to do that.
                    // might help the animation flow.
                })
                .fail((error) => {
                    rej(error)
                    // I should write an error handling function - perhaps some kind of animated display!
                })
        }
    })
}

// spanClass must be valid selector string
function fadeTimer(spanClass) {
    const words = $($(spanClass).get().reverse());
    speed = 400;
    duration = 400;
    if (words.length >= 5 && words.length < 25) {
        speed -= 300;
        duration -= 150
    }
    else if (words.length >= 25 && words.length < 50) {
        speed -= 350;
        duration -= 250
    }
    else if (words.length >= 50) {
        speed -= 400;
        duration -= 350
    }
    return [speed, duration]
}

function textFadeOut(jQTextClass = '.word', callback = 0, transition = false, fixAlign = false, killStoryBox = false) {
    const words = $($(jQTextClass).get().reverse());
    let wordCount = words.length;
    let vals = fadeTimer(jQTextClass);
    let speed = vals[0];
    let duration = vals[1];
    words.each(function (index) {
            let fadeOutDelay = index * speed;
            if (index === words.length - 1) {
                timer = duration + (speed * words.length);
                $(this).delay(fadeOutDelay).animate({'opacity': 0}, duration, function () {
                    if (transition) {
                        spanify($('#storyWelcome'), newText);
                    }
                    if (killStoryBox) {
                        $('#storyButtonBox').css('display', 'none');
                        $('#optionBox').css('display', 'flex');
                        if (callback) {
                            setTimeout(callback, 500);
                            // Sloppy fix here - I couldn't get the callback to fire after the alignment had been fixed
                        }
                    }
                    if (callback && !killStoryBox) {
                        callback()
                    }
                });
            } else {
                timer = duration + (words.length * speed);
                $(this).delay(fadeOutDelay).animate({'opacity': 0}, duration);
            }
        }
    );
    if (fixAlign) {
        setTimeout(() => $('#textBox').css('text-align', 'left'), timer);
    }
}

function buttonUpdate(opaque = false) {
    const currentContext = JSON.parse(localStorage.getItem('currentContext'));
    const optionCount = parseInt(currentContext.optionQuantity);
    const divOptions = JSON.parse(localStorage.getItem('options'));
    const intra = localStorage.getItem('intra');
    let ourSuperLazyCounter = 0;
    console.log('opaque is ' + false);
    try {
        if (parseInt(intra) === 1000 || typeof divOptions['1']['option_text'] === 'undefined') {
            throw 'Reached end of scene chain';
        }
            // Looping through buttons and injecting
            $('#optionBox').find('.button').each(function (index) {
                if (ourSuperLazyCounter >= optionCount) {
                    return false // I think this is to exit the function early if there is no more text to inject?
                }
                let focus = String(index + 1);
                this.innerText = (divOptions[focus]["option_text"]);
                ourSuperLazyCounter++;
                if (this.innerText) {
                    $(this).css('display', 'inline');
                    let that = $(this);
                    let callback = buttonSwitch.bind(this, that);
                    let fadeInAnimDuration = fadeDurationCalc() * 2;
                    setTimeout(callback, fadeInAnimDuration);
                }
                    }, );
            // $('#optionBox').find('.button').each(function (index) {
            //     buttonSwitchAll(4000);
            // if (ourSuperLazyCounter >= optionCount) {
            //     console.log(ourSuperLazyCounter);
            //     return false
            // }
            // if (this.innerText) {
            //     let that = $(this);
            //     buttonSwitch(that, fadeThenCall = true)
            // }
            // ourSuperLazyCounter++;
            // });
            // setTimeout(buttonUpdate, 4500) not sure why it's calling itself
    } catch (report) {
        console.log(report);
        endButtonAnim();
    }
}

function buttonSwitch(jQSel, buttonAnimDuration = 3000) {
    // maybe I need promises in here. perhaps each one should return a promise to guarantee opacity?
    // I'm not sure. Perhaps it's still opacity issues causing the program to
    // curious. This function never runs when the buttons fail to animate.
    // perhaps it isn't being called for some reason?
    targetID = '#' + jQSel.attr('id');
    console.log(jQSel.css("opacity"));
    let buttonState = document.querySelector(targetID);
    if (jQSel.css("opacity") >= .8) {
        anime({
            targets: targetID,
            opacity: [1, 0],
            duration: buttonAnimDuration,
            // begin: () => buttonState.disabled = true
            // Separating button state into separate function
        })
    } else if (jQSel.css("opacity") < .8) {
        anime({
            targets: targetID,
            opacity: [0, 1],
            duration: buttonAnimDuration,
            // complete: () => buttonState.disabled = false
        })
    }
}

function buttonSwitchAll(duration = 2500) {
    $('#optionBox').find('.button').each(function () {
        if (this.innerText) {
            // let that = $(this);
            buttonSwitch($(this), duration);
        }
    });
}


function textFadeIn(textTarg = '.word', callback = 0) {
    const vals = fadeTimer(textTarg);
    const delay = vals[0];
    const duration = vals[1];
    const words = $('.word');
    words.each(function (index) {
        if (index === words.length - 1 && callback) {
            $(this).delay(index * delay).animate({'opacity': 1}, duration, function () {
                // let elem = document.querySelector('#textBox');
                // elem.scrollTop = elem.scrollHeight;
                if (callback) {
                    callback()
                }
            });
        } else {
            $(this).delay(index * delay).animate({'opacity': 1}, duration);
            let elem = document.querySelector('#textBox');
            elem.scrollTop = elem.scrollHeight;
        }
    });
}

function fadeInController(textTarg = '.word', callback = 0, newText = false) {
    $(textTarg).css('display', 'inline');
    if (newText) {
        let textField = $('#storyWelcome');
        let textFieldContent = (localStorage.getItem("sceneText"));
        console.log(textFieldContent);
        spanify(textField, textFieldContent).then(message => {
            console.log(message);
            textFadeIn();
        })
    } else {
        textFadeIn(textTarg, callback);
    }
}

function fadeDurationCalc(fadeIn = true) {
    // fadeIn boolean is switch between values returned - either for fadeIn or fadeOut
    // for some reason this returns an amount of time that is too short
    const wordCount = $('.word').length;
    const vals = fadeTimer('.word');
    const delay = vals[0];
    const duration = vals[1];
    if (fadeIn) {
        return (wordCount * delay) + duration;
    }
}

function transition(jQTextClass = '.word', fixAlign = false, killStoryBox = false) {
    textFadeOut(jQTextClass, fadeInController, true, fixAlign, killStoryBox);
}

function spanify(textTarget, textStr, spanClass = 'word') {
    let timeoutDuration = 250;
    let spanifySuccessMessage = `Spanify promise resolved after ${timeoutDuration}ms`;
    return new Promise(function (res, rej) {
        $(`.${spanClass}`).css('opacity', 0);
        const splitText = textStr.split(' ');
        textTarget.empty();
        for (i in splitText) {
            textTarget.append(`<span class='${spanClass}'>${splitText[i]} </span>`)
        }
        res(spanifySuccessMessage);
    })
}

function endButtonAnim() {
    let normalizeOpacity = new Promise((res, rej) => {
        let animCount = 0;
        let fadeDuration = 1000;
        let resMessage = (`resolved promise after ${fadeDuration}ms`);
        $('.optionSelector').each(function () {
            let elemOpacity = this.style.opacity;
            let that = this;
            if (elemOpacity !== 0) {
                anime({
                    targets: that,
                    opacity: 0,
                    duration: fadeDuration,
                    complete: () => $(that).toggle()
                });
                animCount++
            }
        });
        setTimeout(()=> {
            res(resMessage)
        }, fadeDuration);});
    normalizeOpacity.then(res => {
        setTimeout(() => {
            res();
            console.log('promise resolved - final button should appear');
            $('#optionBox').append('<button id="final-button" style="opacity: 0" onclick="location.reload()" class="end-button button">Again?</button>');
            buttonSwitch($('#final-button'))
        }, 1000 * res)
    })
}

$('#selectionBox').click(e => {
    let opacity;
    // this may be unnecessary - if I fix my callbacks I shouldn't need things like this
    // if (e.target.style.opacity <= .8) {
    //     e.stopPropagation();
    // }
    if (e.target.classList.contains('storySelector')) {
        e.stopPropagation();
        const selectedStory = e.target.innerText;
        // const storyID = '#' + e.target.id;
        // this promise constructor seems to be nonfunctional - figure out what is wrong
        // let storyButtonAnim = new Promise((res, rej) => {
        // Well the sequencing is more fluid but these animations still aren't rendering
        anime({
            targets: '.storySelector',
            translateY: {
                value: '10vh',
                duration: 500,
                easing: 'easeOutSine',
            },
            complete: function () {
                let promisedData = doSomeAJAX(selectedStory, true);
                promisedData.then(response => {
                    const currentContext = response[0]['context'];
                    newText = currentContext.sceneText;
                    // $('#optionBox').css('min-width', '100%');
                    localStorage.setItem("story", currentContext.story_name);
                    localStorage.setItem("scene", currentContext.scene);
                    localStorage.setItem("options", JSON.stringify(currentContext.options));
                    localStorage.setItem('currentContext', JSON.stringify(currentContext));
                    localStorage.setItem('intra', currentContext.intra);
                    let optionCount = parseInt(currentContext.optionQuantity);
                    let divOptions = JSON.parse(localStorage.getItem('options'));
                    let ourSuperLazyCounter = 0;
                    buttonUpdate();
                    // handles opacity & button content
                })
            },
        })
    } else if (e.target.classList.contains('optionSelector')) {
        const optionId = '#' + e.target.id;
        e.stopPropagation();
        const divOptions = JSON.parse(localStorage.getItem('options'));
        console.log(divOptions);
        const optionLabelLocator = e.target.id.slice(-1);
        const selectedOption = divOptions[optionLabelLocator].option_label;
        // These two lines break this shit by throwing bad input into the AJAX function????
        // optionLabel = divOptions[optionLabelLocator]['option_label'];
        getOption = doSomeAJAX(selectedOption);
        getOption.then(response => new Promise(function (res, rej) {
                const currentContext = response[0].context;
                console.log(response);
                localStorage.setItem("story", currentContext.story_name);
                localStorage.setItem("scene", currentContext.scene);
                localStorage.setItem("sceneText", currentContext.sceneText);
                localStorage.setItem("options", JSON.stringify(currentContext.options));
                localStorage.setItem('currentContext', JSON.stringify(currentContext));
                localStorage.setItem('intra', currentContext.intra);
                let optionCount = parseInt(currentContext.optionQuantity);
                let divOptions = JSON.parse(localStorage.getItem('options'));
                let ourSuperLazyCounter = 0;
                newText = currentContext.sceneText;
                fadeInCallBack = fadeInController.bind(this, "word", 0, true);
                textFadeOut('.word', fadeInCallBack);
                console.log(newText);
                // RESTRUCTURED INTO PROMISE -----
                // buttonDelay describes delay before buttons are changed and switched.
                let buttonDelay = 4000;
                let result = console.log.bind(this, `Resolved after ${buttonDelay}ms`);
                setTimeout(() => {
                    res(result)
                }, buttonDelay)
            }).then(result => new Promise(function (res, rej) {
                // WRITE PROMISE HERE TO RESOLVE AFTER 2500MS
                // Then button update &
                result();
                console.log(result);
                if (document.querySelector('#option1').style.opacity >= .8) {
                    console.log('opacity .8 or higher!');
                    opacity = true
                }
                buttonSwitchAll();
                setTimeout(() => {
                    res(result)
                }, 2500)
            })).then(result => new Promise(function (res, rej) {
                let timeOutDuration = 0;
                result();
                setTimeout(() => {
                    buttonUpdate();
                }, timeOutDuration);
                res()
            }))
        )
    }
});


// .then(function() {
//     buttonSwitchAll();
//     return true;
// })
//     res()
// });


initialize();
