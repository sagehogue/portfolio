// TODOS
// #1: Write function to bring initial state back so it can loop!
// #1.5: Write function to dynamically generate option HTML elements (like I did with the storyselectors)
// this will allow the css to properly space them! hurray!
// #2: Write logic to prevent multiple event listeners from firing. perhaps check for .disabled state?
// #4: Error handling should probably be implemented.
// #5: Gotta document my code!


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
// #3: Write text content updating function & integrate
// NOTES
// Current fucking mystery: The generated buttons don't seem able to be selected by dom selectors.
// Fetch API not useful in this case - I have jQuery tangled in here already, so may as well use $.ajax
// Fetch API requires cors && I haven't bothered with that yet so it isn't properly functioning
// #1: Fix fadeTextIn
// #2: fix spanify(false) it doesnt correctly sequence promises
// #2: Reorder code to run with new functions
// #4: Problematic localstorage issues. now im having problems with setting items properly and accessing them.
// one step forward... two steps back.
// #5: WOW very much to prove my point, I think I should scrap the whole localStorage thing and just an object data model.
// #6: But.. idk figure this out before brainlessly attacking it more. I've wasted so much time, I need to work smarter
// not harder..
//#7: Create some real control over when the button is clickable. Might have to use the opacity to measure.

// REVELATION: I seem to be operating from some false assumptions here. All these async techniques
// don't provide flow automatically - if they have nothing to wait on, no server call or whatever,
// they won't delay it. I think I need setTimeout functions and ways to calculate animation duration
// (previously assumed it could be implicitly tracked but I don't think in my case that is so)
// and stoof to sequence. async / await seems amazeballs as well.
(function () {
    domStrings = {

    }
    return {

    }
})

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

async function fadeTextIn(spanifyFirst = false) {
    const spanSelector = '.word';
    if (spanifyFirst) { const spanifyIsDone = await spanify() } // not sure if this does anything
    // was put in for testing purposes - this function wasnt updating the text to animate properly.
    const words = $($(spanSelector).get());
    const vals = await animValueCalc(spanSelector);
    const delay = vals[0], duration = vals[1];

    // attempting to put spanify in here so it properly calls shit!!!
    let successMessage = function () {
        return 'Text animated in!'
    }
    animDuration = duration;
    words.each(function (index) {
        $(this).delay(index * delay).animate({ 'opacity': 1 }, duration);
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

}

async function fadeTextOut(classToFade = '.word') {
    const words = $($(classToFade).get().reverse());
    const vals = animValueCalc(classToFade);
    const speed = vals[0], duration = vals[1], totalDuration = vals[2];
    words.each(function (index) {
        let fadeOutDelay = index * speed;
        $(this).delay(fadeOutDelay).animate({ 'opacity': 0 }, duration, function () {

        });
    });
    // Timeout for entire duration of this animation -- should make sure that the .delay() function doesn't block
    // or this will probably screw me up
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, totalDuration);
    });
}

async function textFadeOutGroup(classToFade = '.word') {
    const words = $($(classToFade).get());
    const vals = animValueCalc(classToFade);
    duration = vals[1]
    words.each(function () {
        $(this).animate({ 'opacity': 0 }, duration, function () {
        });
    })
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, duration);
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
            },
            complete: function (res) {
                const currentContext = res.responseJSON["0"]["context"];
                console.log(currentContext)
                localStorage.setItem("data", JSON.stringify(currentContext))
                localStorage.setItem("story", currentContext["story"])
                localStorage.setItem("storyID", currentContext["storyID"])
                localStorage.setItem("scene", currentContext["scene"])
                localStorage.setItem("sceneText", currentContext["sceneText"])
                localStorage.setItem("options", JSON.stringify(currentContext["options"]))
                localStorage.setItem("optionQuantity", currentContext["optionContext"])
                // console.log(res.responseJSON["0"]["context"]["options"])
                // Object.entries(currentContext).forEach((responseArrayIndice) => {
                //     console.log(JSON.stringify(responseArrayIndice[0]), JSON.stringify(responseArrayIndice[1]))
                //     localStorage.setItem(JSON.stringify(responseArrayIndice[0]), JSON.stringify(responseArrayIndice[1]))
                // });
                // APPARENTLY this function doesn't work.
            }
        });
        else {
            // Call API (send selected option) with request for next scene information
            return $.ajax({
                url: '/story/api/', type: 'GET',
                data: {
                    optionSelection: userSelection
                },
                complete: function (res) {
                    const currentContext = res.responseJSON["0"]["context"];
                    console.log(currentContext)
                    localStorage.setItem("data", JSON.stringify(currentContext))
                    localStorage.setItem("story", currentContext["story"])
                    localStorage.setItem("storyID", currentContext["storyID"])
                    localStorage.setItem("scene", currentContext["scene"])
                    localStorage.setItem("sceneText", currentContext["sceneText"])
                    localStorage.setItem("options", JSON.stringify(currentContext["options"]))
                    localStorage.setItem("optionQuantity", currentContext["optionContext"])
                    // console.log(res)
                    // const currentContext = res.responseJSON["0"]["context"];
                    // localStorage.setItem("data", JSON.stringify(currentContext))
                    // localStorage.setItem("story", currentContext.story)
                    // localStorage.setItem("storyID", currentContext.storyID)
                    // localStorage.setItem("scene", currentContext.scene)
                    // localStorage.setItem("sceneText", currentContext.sceneText)
                    // localStorage.setItem("options", JSON.stringify(currentContext.options))
                    // localStorage.setItem("optionQuantity", currentContext.optionContext)
                    // console.log(currentContext)
                    // Object.entries(currentContext.context).forEach((responseArrayIndice) => {
                    //     localStorage.setItem(JSON.stringify(responseArrayIndice[0]), JSON.stringify(responseArrayIndice[1]))
                    // });
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

function alignFix(alignCenter = false) {
    if (alignCenter) {
        $('#textBox').css('text-align', 'center')
    } else {
        $('#textBox').css('text-align', 'left')
    }
}

function switchToOptionBox(reverse = false) {
    if (reverse) {
        $('#optionBox').css('display', 'none');
        $('#storyButtonBox').css('display', 'flex');
    } else {
        $('#storyButtonBox').css('display', 'none');
        $('#optionBox').css('display', 'flex');
    }
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
            const timeoutDuration = 200;
            for (i in splitText) {
                textContainer.append(`<span class='${spanClass}'>${splitText[i]} </span>`)
            }
            setTimeout(res, timeoutDuration)

        })
    } else {
        const textContainer = $('#textBox');
        const textStr = localStorage.getItem('sceneText');
        console.log(textStr)
        const timeoutDuration = 1000;
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
            setTimeout(res, timeoutDuration)
        })

    }
}

async function asyncButtonSwitchAll(buttonType = '.optionSelector', duration = 1000, updateFirst = false) {
    if (updateFirst) { const updatedButtons = await buttonUpdate };
    const loopBtn = document.querySelector('.loopBtn')
    document.querySelectorAll(buttonType).forEach(function (current) {
        if (current.innerText) {
            console.log(current)
            buttonSwitch(current, duration);
        }
    });
    if (loopBtn) {
        const loopBtnDuration = duration * 2;
        console.log(loopBtn);
        buttonSwitch(loopBtn, loopBtnDuration)
    }
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, duration);
    });
}

async function retrieveStoryButtons(response) {
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


// the argument called selected declares the ID of the option or story selected by the user.
// the argument selectedStory is used in differentiating between story requests and option requests.
// prev_scene is currently extraneous information.


function buttonSwitch(button, buttonAnimDuration = 1500) {
    const buttonID = '#' + button.getAttribute('id');
    console.log(buttonID)
    console.log(button)
    let buttonState = document.querySelector(buttonID);
    // console.log(button.getAttribute('id'), button.classList.value)
    if (button.classList.contains("buttonOpaque")) {
        buttonState.disabled = true;
        $(buttonID).animate({ 'opacity': 0 }, buttonAnimDuration, function () {
            button.classList.remove("buttonOpaque")
            if (button.classList.contains('loopBtn')) {
                $(buttonID).remove();
            }
        });
    } else {
        console.log('I should be animating this right now\n' + button)
        $(buttonID).animate({ 'opacity': 1 }, buttonAnimDuration, function () {
            button.classList.add('buttonOpaque');
            buttonState.disabled = false;
        });
    }
}

// pass it '.optionSelector' or '.storySelector' to have it operate on the respective type.
function buttonUpdate(buttonType) {
    // console.log(`Context: ${currentContext}\nOption Count: ${optionCount}\nintra: ${intra}`);
    try {
        // console.log(currentContext.options)
        // console.log(currentContext.context["options"]["1"]["scene_text"])
        // if (parseInt(intra) === 1000 || typeof sceneOptions[1].option_text === 'undefined') {
        //     throw 'Reached end of scene chain';
        // }
        // Looping through buttons and injecting
        // if (optionCount > 0) {
        //     const buttonContainer = document.querySelector('#optionBox');
        //     buttonContainer.innerHTML = '';
        //     btnCounter = 1;
        //     while (btnCounter <= optionCount) {
        //         let newButton = document.createElement('button');
        //         console.log(sceneOptions[btnCounter])
        //         newButton.setAttribute("type", "button");
        //         newButton.setAttribute("id", 'optionBtn' + btnCounter);
        //         newButton.setAttribute("class", "optionSelector button");
        //         newButton.setAttribute("value", sceneOptions[btnCounter].option_text)
        //         newButton.setAttribute("", sceneOptions[btnCounter].option_text)
        //         buttonContainer.appendChild(newButton);
        //         btnCounter++
        //     }


        // (Object.entries(currentContext.options)).forEach(function (entry) {
        //     console.log(entry)
        //     let newButton = document.createElement('button');
        //     newButton.setAttribute("type", "button");
        //     newButton.setAttribute("id", 'optionBtn' + entry[0]);
        //     newButton.setAttribute("class", "optionSelector button");
        //     newButton.setAttribute("innerText", entry[1].option_text)
        //     console.log(newButton);
        //     buttonContainer.appendChild(newButton);
        // })
        // $('#optionBox').find(buttonType).each(function (index) {
        //     if (counter >= optionCount) {
        //         return new Promise((res, rej) => {
        //             setTimeout(res, pauseDuration)
        //         })
        //     }
        //     let focus = index + 1;
        //     // let focus = String(index + 1);
        //     console.log(sceneOptions)
        //     console.log(sceneOptions[focus])
        //     this.innerText = (sceneOptions[focus]["option_text"]);
        //     counter++;
        // });
        const currentContext = JSON.parse(localStorage.getItem('data'));
        const pauseDuration = 0;
        let counter = 0;
        const optionCount = currentContext.optionQuantity;
        const sceneOptions = currentContext.options;
        console.log(sceneOptions)
        if (optionCount > 0) {
            $('#optionBox').find(buttonType).each(function (index) {
                // if (counter = optionCount) {
                //     return new Promise((res, rej) => {
                //         setTimeout(res, pauseDuration)
                //     })
                // }
                let focus = String(index + 1);
                if  (sceneOptions[focus]) {
                    this.style.display = 'inline-block';
                let focus = index + 1;
                console.log(sceneOptions)
                console.log(sceneOptions[focus])
                this.innerText = (sceneOptions[focus]["option_text"]);
                } else {
                    this.style.display = 'none';
                }
                counter++;
                
            });
        } else {
            const loopBtnMessage = 'Select Again'
            $('#optionBox').empty()
            const userPlayAgainBtn = document.createElement("button");
            userPlayAgainBtn.setAttribute("class", "button loopBtn")
            userPlayAgainBtn.setAttribute("id", "loopBtn")
            userPlayAgainBtn.innerText = loopBtnMessage
            document.querySelector('#optionBox').appendChild(userPlayAgainBtn)
        }
        return new Promise((res, rej) => {
            setTimeout(res, pauseDuration)
        })
    } catch (report) {
        console.log(report);
        endButtonAnim();
    }
}

function endButtonAnim() {
    let normalizeOpacity = new Promise((res, rej) => {
        let animCount = 0;
        let fadeDuration = 1000;
        // let resMessage = console.log(`resolved promise after ${fadeDuration}ms`);
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
            res
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
    if (e.target.getAttribute('disabled') !== true) {
        if (e.target.classList.contains('storySelector')) {
            e.stopPropagation();
            stateFixDuration = 0;
            const transitionToOptionBox = function (res) {
                const currentContext = res[0].context;
                // localStorage.setItem("context", JSON.stringify(currentContext))
                localStorage.setItem("optionQuantity", currentContext["optionQuantity"])
                console.log(localStorage.getItem("optionQuantity"), currentContext["optionQuantity"])
                alignFix();
                switchToOptionBox();
                buttonUpdate('.optionSelector');
                return new Promise((res, rej) => {
                    setTimeout(res, stateFixDuration)
                })
            }
            const updateButtons = function () {
                asyncButtonSwitchAll('.optionSelector', 1000, true)
            }
            const selectedStory = e.target.id;
            const storyAPICall = callAPI.bind(this, selectedStory, false, true);
            // const buttonAnimDuration = 1500;
            // const spanifyCallBack = spanify.bind(this, true)
            // const optionSwitchCallback = asyncButtonSwitchAll.bind(this, '.optionSelector', buttonAnimDuration);
            asyncButtonSwitchAll('.storySelector').then(fadeTextOut).then(storyAPICall).then(transitionToOptionBox
                // const currentContext = res[0].context;
                // // localStorage.setItem("context", JSON.stringify(currentContext))
                // localStorage.setItem("optionQuantity", currentContext["optionQuantity"])
                // console.log(localStorage.getItem("optionQuantity"), currentContext["optionQuantity"])
                // alignFix();
                // switchToOptionBox();
                // buttonUpdate('.optionSelector');
                // return new Promise((res, rej) => {
                //     setTimeout(res, stateFixDuration)
                // })
            ).then(spanify).then(fadeTextIn).then(asyncButtonSwitchAll);
        }
        else if (e.target.classList.contains('optionSelector')) {
            // Code to handle option selection
            e.stopPropagation();
            const sceneOptions = JSON.parse(localStorage.getItem('options'));
            const optionLabelLocator = e.target.id.slice(-1);
            const selectedOption = sceneOptions[optionLabelLocator].option_label;
            console.log(selectedOption)
            const optionAPICall = callAPI.bind(this, selectedOption)
            const spanThenFade = fadeTextIn.bind(this, true);
            asyncButtonSwitchAll('.optionSelector').then(fadeTextOut).then(optionAPICall).then(res => {
                const currentContext = res[0]['context'];
                // if (currentContext['optionQuantity'] === "0") {}
                // Make the logic for checking if optionQuantity is 0 a subfunction of button update.
                buttonUpdate('.optionSelector');
                const timeoutDuration = 1000;
                return new Promise(function (res, rej) {
                    setTimeout(res, timeoutDuration)
                })
            }).then(spanify).then(fadeTextIn).then(asyncButtonSwitchAll)
        } else if (e.target.classList.contains('loopBtn')) {
            // fadeTextOut().then()
            e.stopPropagation();
            // CODE RESET
            let resetState = function () {
                $('#textBox').text('Select your experience');
                alignFix(true);
                switchToOptionBox(true);
                const fadeOutDuration = 1000
                buttonSwitch(document.querySelector('.loopBtn'), fadeOutDuration)
                return new Promise(function (res, rej) {
                    setTimeout(res, fadeOutDuration)
                })
                // initialize();
            }
            textFadeOutGroup().then(resetState).then(initialize);
        }
    }
});
$(document).ready(initialize);
// console.log(Object.entries(currentContext.context))
            // Object.entries(currentContext.context).forEach((responseArrayIndice) => {
            //     localStorage.setItem(JSON.stringify(responseArrayIndice[0]), JSON.stringify(responseArrayIndice[1]))
            // });