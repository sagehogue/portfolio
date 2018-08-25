// TODOS
// #1: Rewrite functions with async and more comprehensible promise logic
// #2: Reorder code to run with new functions
// #3: Create a function to dynamically generate new HTML for the story selector buttons and remove the hardcoding.
// #4: WRITE THAT DAMN RENDERSTORYBUTTON function :OOOO thx bro

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

// NOTES
// Current fucking mystery: The generated buttons don't seem able to be selected by dom selectors.
// Fetch API not useful in this case - I have jQuery tangled in here already, so may as well use $.ajax
// Fetch API requires cors && I haven't bothered with that yet so it isn't properly functioning

// REVELATION: I seem to be operating from some false assumptions here. All these async techniques
// don't provide flow automatically - if they have nothing to wait on, no server call or whatever,
// they won't delay it. I think I need setTimeout functions and ways to calculate animation duration
// (previously assumed it could be implicitly tracked but I don't think in my case that is so)
// and stoof to sequence. async / await seems amazeballs as well.

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
    if (requestAllStories) return $.ajax({
        url: '/story/api/',
        type: 'GET',
        data: {
            fetchStories: requestAllStories
        }
    });
    else {
        if (requestSelectedStory) return $.ajax({
            url: '/story/api',
            type: 'GET',
            data: {
                storySelection: userSelection
            }
        });
        else {
            // Call API (send selected option) with request for next scene information
            return $.ajax({
                url: '/story/api/', type: 'GET',
                data: {
                    optionSelection: userSelection
                }
            });
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

async function asyncButtonSwitchAll(buttonType = '.optionSelector', duration = 1500) {
    let buttonContainer = '#optionBox';
    if (buttonType === '.storySelector') {
        buttonContainer = '#storyButtonBox'
    }
    document.querySelectorAll(buttonType).forEach(function (current) {
        console.log(current);
            buttonSwitch(current, duration);

    });
}


async function retrieveStoryButtons(response) {
    const test = console.log;
    const storyObject = response.stories;
    const storyArray = Object.entries(storyObject);
    const buttonContainer = document.querySelector('#storyButtonBox');
    console.log(storyArray);
    storyArray.forEach((currentArray) => {
        let newButton = document.createElement('button');
        newButton.setAttribute("type", "button");
        newButton.setAttribute("id", currentArray[1]);
        newButton.setAttribute("class", "storySelector button");
        buttonContainer.appendChild(newButton);
        $('#' + newButton.id).text(newButton.id);
    });
}

let newText = '';

async function initialize() {
    // Later I should rewrite this so that it completely resets the state of the page. That'd allow for an again button
    // to be smoothly executed and require no page reload.
    let buttonState = document.querySelector('.storySelector');
    const elToAnimate = $('#storyWelcome');
    spanify(elToAnimate, elToAnimate.text());
    // await doesn't seem to do anything here. find out why on reddit
    await fadeTextIn();
    // const init_animation = () => {
    //     anime({
    //         targets: '.storySelector',
    //         opacity: 1,
    //         duration: 1500,
    //         complete: function () {
    //             buttonState.disabled = false;
    //         }
    //     });
    // };
    await callAPI('No Selection', true)
        .then(response => {
            console.log(response);
            retrieveStoryButtons(response);
        }).then(res => {
            const duration = 10000;
            asyncButtonSwitchAll('.storySelector', duration, res);
    });

}

// the argument called selected declares the ID of the option or story selected by the user.
// the argument selectedStory is used in differentiating between story requests and option requests.
// prev_scene is currently extraneous information.



function buttonSwitch(button, buttonAnimDuration = 1500) {
    console.log(button);
    targetID = '#' + button.getAttribute('id');
    let buttonState = document.querySelector(targetID);

    if (button.getAttribute("opacity") >= .8) {
        anime({
            targets: targetID,
            opacity: [1, 0],
            duration: buttonAnimDuration,
            begin: () => {
                buttonState.disabled = true
                console.log('Unpainting button');
                // Separating button state into separate function
            }})
    } else if (button.getAttribute("opacity") < .25) {
        anime({
            targets: targetID,
            opacity: [0, 1],
            duration: buttonAnimDuration,
            complete: () => {console.log('button painted'); buttonState.disabled = false}
        })
    }
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


$(document).ready(initialize);
