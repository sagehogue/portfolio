// TODOS
// #1: Rewrite functions with async and more comprehensible promise logic
// #2: Reorder code to run with new functions
// #3: Write text content updating function & integrate


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


// COMPLETE
// #1: WRITE THAT DAMN RENDERSTORYBUTTON function :OOOO thx bro
// #2: Create a function to dynamically generate new HTML for the story selector buttons and remove the hardcoding.

// NOTES
// Current fucking mystery: The generated buttons don't seem able to be selected by dom selectors.
// Fetch API not useful in this case - I have jQuery tangled in here already, so may as well use $.ajax
// Fetch API requires cors && I haven't bothered with that yet so it isn't properly functioning

// REVELATION: I seem to be operating from some false assumptions here. All these async techniques
// don't provide flow automatically - if they have nothing to wait on, no server call or whatever,
// they won't delay it. I think I need setTimeout functions and ways to calculate animation duration
// (previously assumed it could be implicitly tracked but I don't think in my case that is so)
// and stoof to sequence. async / await seems amazeballs as well.

async function fadeTextIn(res) {
    const spanSelector = '.word';
    const words = $($(spanSelector).get());
    console.log(words)
    const vals = await animValueCalc(spanSelector);
    const delay = vals[0], duration = vals[1];
    console.log(spanSelector);
    let successMessage = function () {
        return 'Text animated in!'
    }
    animDuration = duration;
    words.each(function (index) {
        $(this).delay(index * delay).animate({'opacity': 1}, duration);
        let elem = document.querySelector('#textBox');
        elem.scrollTop = elem.scrollHeight;
        animDuration += delay
    });
    // YAY ADDING THIS RETURN LINE FIXED IT!!!
    // Nothing was being waited on so I needed to return a promise that would resolve after the animduration
    // rather than setting a timeout.
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, animDuration);
    });
    // setTimeout(function() {console.log('resolved text animation')}, animDuration)
}

async function fadeTextOut(spanSelector = '.word') {
    const words = $($(spanSelector).get().reverse());
    const vals = animValueCalc(spanSelector);
    const speed = vals[0], duration = vals[1], totalDuration = vals[2];
    words.each(function (index) {
        let fadeOutDelay = index * speed;
        $(this).delay(fadeOutDelay).animate({'opacity': 0}, duration, function () {

        });
    });
    // Timeout for entire duration of this animation -- should make sure that the .delay() function doesn't block
    // or this will probably screw me up
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, totalDuration);
    });
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

// firstCall controls where the text to spanify is sourced from.
// spanify turns a string into separate span elements with a common class.
function spanify(firstCall = false) {
    const spanClass = 'word';
    if (firstCall) {
        let spanifySuccessMessage = function () {
            console.log('successful spanify')
        }
        const textContainer = $('#storyWelcome');
        const textStr = textContainer.text();
        return new Promise(function (res, rej) {
            $(`.${spanClass}`).css('opacity', 0);
            const splitText = textStr.split(' ');
            textContainer.empty();
            const timeoutDuration = 0;
            for (i in splitText) {
                textContainer.append(`<span class='${spanClass}'>${splitText[i]} </span>`)
            }
            setTimeout(res, timeoutDuration)
            
        })
    } else {
        const textContainer = $('#textBox');
        const textStr = localStorage.getItem('sceneText');
        const timeoutDuration =100;
        let spanifySuccessMessage = function () {
            console.log(textStr)
        }
        return new Promise(function (res, rej) {
            $(`.${spanClass}`).css('opacity', 0);
            const splitText = textStr.split(' ');
            textContainer.empty();
            for (i in splitText) {
                textContainer.append(`<span class='${spanClass}'>${splitText[i]} </span>`)
            }
            setTimeout((spanifySuccessMessage) => {
                res;
            }, timeoutDuration)
        })

    }
}

async function asyncButtonSwitchAll(buttonType = '.optionSelector', duration = 1500) {
    document.querySelectorAll(buttonType).forEach(function (current) {
        if (current.innerText) {
            buttonSwitch(current, duration);
        }
    });
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, duration);
    });
}

async function retrieveStoryButtons(response) {
    const test = console.log;
    const storyObject = response.stories;
    const storyArray = Object.entries(storyObject);
    const buttonContainer = document.querySelector('#storyButtonBox');
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
    // let buttonState = document.querySelector('.storySelector');
    const duration = 850;
    const apiCall = await callAPI.bind(this, 'No Selection', true);
    const buttonSwitchAll = asyncButtonSwitchAll.bind(this, '.storySelector', duration);
    spanify(true);
    // await doesn't seem to do anything here. find out why on reddit
    await fadeTextIn().then(apiCall).then(retrieveStoryButtons).then(buttonSwitchAll);
}

// the argument called selected declares the ID of the option or story selected by the user.
// the argument selectedStory is used in differentiating between story requests and option requests.
// prev_scene is currently extraneous information.


function buttonSwitch(button, buttonAnimDuration = 1500) {
    const buttonID = '#' + button.getAttribute('id');
    let buttonState = document.querySelector(buttonID);
    if (button.classList.contains("buttonOpaque")) {
        buttonState.disabled = true;
        $(buttonID).animate({'opacity': 0}, buttonAnimDuration, function () {
            button.classList.value.replace("buttonOpaque", '')
        });
    } else {
        $(buttonID).animate({'opacity': 1}, buttonAnimDuration, function () {
            button.classList.add('buttonOpaque');
            buttonState.disabled = false;
        });
    }
}

// pass it '.optionSelector' or '.storySelector' to have it operate on the respective type.
function buttonUpdate(buttonType) {
    const currentContext = JSON.parse(localStorage.getItem('currentContext'));
    const optionCount = parseInt(currentContext.optionQuantity);
    const divOptions = JSON.parse(localStorage.getItem('options'));
    const intra = localStorage.getItem('intra');
    let ourSuperLazyCounter = 0;
    // console.log(`Context: ${currentContext}\nOption Count: ${optionCount}\nintra: ${intra}`);
    try {
        if (parseInt(intra) === 1000 || typeof divOptions['1']['option_text'] === 'undefined') {
            throw 'Reached end of scene chain';
        }
        console.log(buttonType);
        // Looping through buttons and injecting
        $('#optionBox').find(buttonType).each(function (index) {
            if (ourSuperLazyCounter >= optionCount) {
                return false // I think this is to exit the function early if there is no more text to inject?
            }
            let focus = String(index + 1);
            this.innerText = (divOptions[focus]["option_text"]);
            ourSuperLazyCounter++;
        },);
    } catch (report) {
        console.log(report);
        endButtonAnim();
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

// selectionBox is a div encompassing all selectable options
$('#selectionBox').click(e => {
    if (e.target.classList.contains('storySelector')) {
        e.stopPropagation();
        const selectedStory = e.target.id;
        const storyAPICall = callAPI.bind(this, selectedStory, false, true);
        asyncButtonSwitchAll('.storySelector').then(fadeTextOut).then(storyAPICall).then(res => {
            const currentContext = res[0]['context'];
            console.log(currentContext)
            Object.entries(currentContext).forEach((key, value) => {
                localStorage.setItem(key, value);
            });
            alignFix();
            switchToOptionBox();
            buttonUpdate('.optionSelector');
            const buttonAnimDuration = 1500;
            const optionSwitchCallback = asyncButtonSwitchAll.bind(this, '.optionSelector', buttonAnimDuration);
            spanify().then(fadeTextIn).then(optionSwitchCallback)
        })
    }
    else if (e.target.classList.contains('optionSelector')) {
        // Code to handle option selection
        e.stopPropagation();
        const divOptions = JSON.parse(localStorage.getItem('options'));
        const optionLabelLocator = e.target.id.slice(-1);
        const selectedOption = divOptions[optionLabelLocator].option_label;
        const optionAPICall = callAPI.bind(this, selectedOption)
        console.log(selectedOption)
        asyncButtonSwitchAll('.optionSelector').then(fadeTextOut).then(optionAPICall).then(res => {
            // The code below here doesn't work as desired yet - need to 
            // ensure sequencing. fadetextin is performing with the same text as
            // when it painted the first scene.
            console.log(res);
            const currentContext = res[0]['context'];
            console.log(currentContext)
            Object.entries(currentContext).forEach((key, value) => {
                localStorage.setItem(key, value);
            });
            buttonUpdate('.optionSelector');
            const timeoutDuration = 150;
            return new Promise(function(res, rej) {
                setTimeout(res, timeoutDuration)
            })
        }).then(spanify).then(fadeTextIn).then(asyncButtonSwitchAll)
    }
});
$(document).ready(initialize);
