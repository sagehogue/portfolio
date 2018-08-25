// TODOS
// #1: Rewrite functions with async and more comprehensible promise logic
// #2: Reorder code to run with new functions
// #3: Create a function to dynamically generate new HTML for the story selector buttons and remove the hardcoding.

// COMPLETE MAIN FUNCTIONS
// #1: async function fadeTextIn
// #2: async function fadeTextOut
// #3: async function callAPI <---------- NEEDS ERROR HANDLING
// #4: function updateOptionButtontext <---------- error handling needed

// COMPLETE SPECIFIC FUNCTIONS
// #1: function animValueCalc
// #2: function fixAlign
// #3: function switchToOptionBox
// #4: function spanify
// #5: async function buttonSwitchAll


// REVELATION: I seem to be operating from some false assumptions here. All these async techniques
// don't provide flow automatically - if they have nothing to wait on, no server call or whatever,
// they won't delay it. I think I need setTimeout functions and ways to calculate animation duration
// (previously assumed it could be implicitly tracked but I don't think in my case that is so)
// and stoof to sequence. async / await seems amazeballs as well.


// Write function to calculate duration of an animation

// May need to do larger scale revisions... Perhaps post on a subreddit and get some advice. I don't entirely understand
// What I am missing.
// Sadly a lot of them are still not playing in sequence. It also may be calling too many animations
// Could attach some console.logs and see how many times it calls opacity controls?

async function fadeTextIn(spanSelector = '.word') {
    const words = $($(spanSelector).get());
    const vals = await animValueCalc(spanSelector);
    const delay = vals[0], duration = vals[1];
    words.each(function (index) {
        $(this).delay(index * delay).animate({'opacity': 1}, duration);
        let elem = document.querySelector('#textBox');
        elem.scrollTop = elem.scrollHeight;
    });
}

async function fadeTextOut(spanSelector = '.word') {
    const words = $($(spanSelector).get().reverse());
    const vals = animValueCalc(jQTextClass);
    const speed = vals[0], animDuration = vals[1], totalDuration = vals[2];
    words.each(function (index) {
        let fadeOutDelay = index * speed;
        if (index === words.length - 1) {
            timer = animDuration + (speed * words.length);
            $(this).delay(fadeOutDelay).animate({'opacity': 0}, animDuration, function () {
            });
        }
    });
    // Timeout for entire duration of this animation -- should make sure that the .delay() function doesn't block
    // or this will probably screw me up
    setTimeout(() => {
        res()
    }, totalDuration)
}

async function callAPI(userSelection, requestAllStories = false, requestSelectedStory = false) {
    if (requestAllStories) {
        // Code to retrieve list of story names to use for my HTML buttons
        (console.log('fetching stories...'));
        return fetch('/story/api/', {fetchStories: requestAllStories})
    }
    else {
        if (requestSelectedStory) {
            // Call API with request for first story scene information
            response = fetch('/story/api/', {storySelection: userSelection})
        }
        else {
            // Call API (send selected option) with request for next scene information
            return fetch('/story/api/', {optionSelection: userSelection})
        }
    }
}

function animValueCalc(spanClass) {
    const words = $($(spanClass).get().reverse());
    speed = 400;
    animDuration = 400;
    if (words.length >= 5 && words.length < 25) {
        speed -= 300;
        animDuration -= 150
    }
    else if (words.length >= 25 && words.length < 50) {
        speed -= 350;
        animDuration -= 250
    }
    else if (words.length >= 50) {
        speed -= 400;
        animDuration -= 350
    }
    const totalDuration = (words.length * speed) + animDuration;
    console.log(totalDuration);
    return [speed, animDuration, totalDuration]
}

function alignFix() {
    $('#textBox').css('text-align', 'left')
}

function switchToOptionBox() {
    $('#storyButtonBox').css('display', 'none');
    $('#optionBox').css('display', 'flex');
}

function spanify(textTarget, textStr, spanClass = 'word') {
    let timeoutDuration = 0;
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

async function asyncButtonSwitchAll(buttonType='.optionSelector', duration = 1500) {
    let buttonContainer = '#optionBox';
    if (buttonType==='storySelector') {buttonContainer = '#storyButtonBox'}
    $(buttonContainer).find('.button').each(function () {
        if (this.innerText) {
            buttonSwitch($(this), duration);
        }
    });
}

async function buttonSwitchAll(duration = 1500) {
    $('#optionBox').find('.button').each(function () {
        if (this.innerText) {
            // let that = $(this);
            buttonSwitch($(this), duration);
        }
    });
}

let newText = '';

async function initialize() {
    // Later I should rewrite this so that it completely resets the state of the page. That'd allow for an again button
    // to be smoothly executed and require no page reload.
    let buttonState = document.querySelector('.storySelector');
    buttonState.disabled = true;
    const elToAnimate = $('#storyWelcome');
    spanify(elToAnimate, elToAnimate.text());
    fadeTextIn();
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
    callAPI('No Selection', true).then(res => {
        updateOptionButtonText();
        return asyncButtonSwitchAll('.storySelector');
    }).then(res => {

    })
}

function initialize_old() {
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


function doSomeAJAX(selected, selectedStory = false, prev_scene = false, buttonFadeOutDuration = 500) {
    return new Promise((res, rej) => {
        if (selectedStory === false) {
            $.ajax({
                url: '/story/api/',
                type: 'GET',
                data: {
                    optionSelection: selected
                }
            }).done((data) => {
                buttonSwitchAll(buttonFadeOutDuration);
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

function textFadeOut(jQTextClass = '.word', callback = 0, transition = false, fixAlign = false, killStoryBox = false) {
    const words = $($(jQTextClass).get().reverse());
    let wordCount = words.length;
    let vals = animValueCalc(jQTextClass);
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

function updateOptionButtonText() {
    const currentContext = JSON.parse(localStorage.getItem('currentContext')),
        optionCount = parseInt(currentContext.optionQuantity),
        newSceneOptions = JSON.parse(localStorage.getItem('options')), intra = localStorage.getItem('intra');
    let counter = 0;
    // Looping through buttons and injecting
    $('#optionBox').find('.button').each(function (index) {
        if (counter >= optionCount) {
            return false // I think this is to exit the function early if there is no more text to inject?
        }
        let focus = String(index + 1);
        this.innerText = (newSceneOptions[focus]["option_text"]);
        counter++;
        if (this.innerText) {
            $(this).css('display', 'inline');
        }
    },);
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
        },);
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

function buttonSwitch(jQSel, buttonAnimDuration = 1500) {
    targetID = '#' + jQSel.attr('id');
    let buttonState = document.querySelector(targetID);
    if (jQSel.css("opacity") >= .8) {
        anime({
            targets: targetID,
            opacity: [1, 0],
            duration: buttonAnimDuration,
            begin: () => buttonState.disabled = true
            // Separating button state into separate function
        })
    } else if (jQSel.css("opacity") < .25) {
        anime({
            targets: targetID,
            opacity: [0, 1],
            duration: buttonAnimDuration,
            complete: () => buttonState.disabled = false
        })
    }
}


function textFadeIn(textTarg = '.word', callback = 0) {
    const vals = animValueCalc(textTarg);
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
    const vals = animValueCalc('.word');
    const delay = vals[0];
    const duration = vals[1];
    if (fadeIn) {
        return (wordCount * delay) + duration;
    }
}

function transition(jQTextClass = '.word', fixAlign = false, killStoryBox = false) {
    textFadeOut(jQTextClass, fadeInController, true, fixAlign, killStoryBox);
}

function endButtonAnim() {
    let normalizeOpacity = new Promise((res, rej) => {
        let animCount = 0;
        let fadeDuration = 1000;
        let resMessage = console.log(`resolved promise after ${fadeDuration}ms`);
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
        setTimeout(() => {
            res(resMessage)
        }, fadeDuration);
    });
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
        // performs AJAX call
        getOption = doSomeAJAX(selectedOption);
        getOption.then(response => new Promise(function (res, rej) {
                const currentContext = response[0].context;
                Object.entries(currentContext).forEach((key, value) => {
                    localStorage.setItem(key, value);
                });
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
                const buttonAnimDuration = 1500;
                // Believe this code is unnecessary
                // if (document.querySelector('#option1').style.opacity >= .8) {
                //     console.log('opacity .8 or higher!');
                //     opacity = true
                // }
                buttonSwitchAll(buttonAnimDuration);
                setTimeout(() => {
                    res(result)
                }, buttonAnimDuration)
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
    // Currently unused variables.
    // let optionCount = parseInt(currentContext.optionQuantity);
    // let divOptions = JSON.parse(localStorage.getItem('options'));
    // let ourSuperLazyCounter = 0;
});


initialize();
