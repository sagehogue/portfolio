// TODOS
// #1: Fix alignment issue after story selection.
// #2: Fix animation flow issues.

let newText = '';

function initialize() {
    let buttonSwitch = document.querySelector('.storySelector');
    buttonSwitch.disabled = true;
    const init_animation = function () {
        anime({
            targets: '.storySelector',
            opacity: 1,
            duration: 1500,
            complete: function () {
                buttonSwitch.disabled = false;
            }
        });
    };
    spanTarget = $('#storyWelcome');
    spanify(spanTarget, spanTarget.text());
    textFadeIn('.word', init_animation);
}

// the argument called selected declares the ID of the option or story selected by the user.
// the argument selectedStory is used in differentiating between story requests and option requests.
// prev_scene is currently extraneous information.
function doSomeAJAX(selected, selectedStory = false, prev_scene = false) {
    return new Promise((res, rej) => {
        if (selectedStory === false) {
            $.ajax({
                url: '/story/api/',
                type: 'GET',
                data: {
                    optionSelection: selected
                }
            }).done((data) => {

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
    speed = 500;
    duration = 500;
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
    let vals = fadeTimer(jQTextClass);
    let speed = vals[0];
    let duration = vals[1];
    console.log('speed: ' + speed + '\nduration: ' + duration);
    words.each(function (index) {
            if (index === words.length - 1) {
                timer = duration + (speed * words.length);
                $(this).delay(index * speed).animate({'opacity': 0}, duration, function () {
                    if (transition) {
                        spanify($('#storyWelcome'), newText);
                    }
                    if (killStoryBox) $('#storyButtonBox').css('display', 'none');
                    $('#optionBox').css('display', 'flex');
                    if (callback) {
                        callback()
                    }
                });
            } else {
                timer = duration + (words.length * speed);
                $(this).delay(index * speed).animate({'opacity': 0}, duration, function () {
                });
            }
        }
    );
    console.log(timer);
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
    try {
        if (parseInt(intra) === 1000 || typeof divOptions['1']['option_text'] === 'undefined') {
            throw 'Reached end of scene chain';
        }
        if (opaque === false) {
            $('#optionBox').find('.button').each(function (index) {
                if (ourSuperLazyCounter >= optionCount) {
                    return false
                }
                let focus = String(index + 1);
                this.innerText = (divOptions[focus]["option_text"]);
                ourSuperLazyCounter++;
                if (this.innerText) {
                    $(this).css('display', 'inline');
                    let that = $(this);
                    let theCB = () => {
                        buttonSwitch(that)
                    };
                    setTimeout(theCB, 6500)
                }
            });
        } else {
            $('#optionBox').find('.button').each(function (index) {
                if (ourSuperLazyCounter >= optionCount) {
                    return false
                }
                if (this.innerText) {
                    let that = $(this);
                    buttonSwitch(that, fadeThenCall = true)
                }
                ourSuperLazyCounter++;
            });
            setTimeout(buttonUpdate, 4500)
        }
    } catch (report) {
        console.log(report);
        endButtonAnim();
    }
}

function buttonSwitch(jQSel, animeCallback = false, fadeThenCall = false) {
    targetID = '#' + jQSel.attr('id');
    if (jQSel.css("opacity") >= .8) {
        anime({
            targets: targetID,
            opacity: [1, 0],
            duration: 4500
        })
    } else if (jQSel.css("opacity") < .8) {
        anime({
            targets: targetID,
            opacity: [0, 1],
            duration: 4500,
            complete: () => {
                buttonSwitch.disabled = false;
            }
        })
    }
}

function textFadeIn(textTarg = '.word', callback = 0) {
    const vals = fadeTimer(textTarg);
    const delay = vals[0];
    const duration = vals[1];
    $(textTarg).css('display', 'inline');
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

function transition(jQTextClass = '.word', fixAlign = false, killStoryBox = false) {
    buttonSwitch.disabled = true;
    textFadeOut('.word', textFadeIn, true, fixAlign, killStoryBox);
}

function spanify(textTarget, textStr, spanClass = 'word') {
    $(`.${spanClass}`).css('opacity', 0);
    const splitText = textStr.split(' ');
    textTarget.empty();
    for (i in splitText) {
        textTarget.append(`<span class='${spanClass}'>${splitText[i]} </span>`)
    }
}

function endButtonAnim() {
    let normalizeOpacity = new Promise((res, rej) => {
        let animCount = 0;
        $('.optionSelector').each(function () {
            let elemOpacity = this.style.opacity;
            let that = this;
            if (elemOpacity !== 0) {
                anime({
                    targets: that,
                    opacity: 0,
                    duration: 1000,
                    complete: () => $(that).toggle()
                });
                animCount++
            }
        });
        res(animCount)
    });
    normalizeOpacity.then((res) => {
        setTimeout((res) => {
            console.log('promise resolved - final button should appear');
            $('#optionBox').append('<button id="final-button" style="opacity: 0" onclick="location.reload()" class="end-button button">Again?</button>');
            buttonSwitch($('#final-button'))
        }, 1000 * res)
    })
}

$('#selectionBox').click(e => {
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
            rotate: {value: 360, duration: 300},
            translateY: {
                value: '25vh',
                duration: 700,
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
                })
            },
        })
    } else if (e.target.classList.contains('optionSelector')) {
        const optionId = e.target.id;
        const divOptions = JSON.parse(localStorage.getItem('options'));
        const optionLabelLocator = e.target.id.slice(-1);
        const selectedOption = divOptions[optionLabelLocator]['option_label'];
        optionLabel = divOptions[optionLabelLocator]['option_label'];
        getOption = doSomeAJAX(selectedOption);
        getOption
            .then(response => {
                const currentContext = response[0]['context'];
                localStorage.setItem("story", `${currentContext.story_name}`);
                localStorage.setItem("scene", `${currentContext.scene}`);
                localStorage.setItem("options", JSON.stringify(currentContext.options));
                newText = currentContext.sceneText;
                transition()
            })
            .then(() => {
                let opacity;
                console.log($('#option1').attr('opacity'));
                console.log(document.querySelector('#option1').style.opacity);
                if (document.querySelector('#option1').style.opacity >= .8) {
                    console.log('opaque!');
                    opacity = true
                }
                console.log(opacity);
                buttonUpdate(opacity)
            });
    }
});
//     res()
// });


initialize();
