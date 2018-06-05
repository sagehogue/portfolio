let newText = '';

function initialize() {
    const callMe = function () {
        anime({
            targets: '.storySelector',
            opacity: 1,
            duration: 1500
        })
    };
    spanTarget = $('#storyWelcome');
    spanify(spanTarget, spanTarget.text());
    textFadeIn('.word', callMe);
}

function textFadeOut(jQTextClass = '.word', callback = 0, transition = false) {
    const words = $($(jQTextClass).get().reverse());
    words.each(function (index) {
            if (index === words.length - 1) {
                $(this).delay(index * 150).animate({'opacity': 0}, 150, function () {
                    if (transition) {
                        spanify($('#storyWelcome'), newText);
                    }
                    if (callback) {
                        callback()
                    }
                });
            } else {
                $(this).delay(index * 150).animate({'opacity': 0}, 350, function () {
                });
            }

        }
    )
}

function buttonSwitch(jQSel, firstFadeId=false) {
    if (jQSel.attr("opacity") == 1) {
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
    }
}

function textFadeIn(textTarg = '.word', callback = 0) {
    let delay = 150;
    let duration = 350;

    $(textTarg).css('text-align', 'left');
    $(textTarg).css('display', 'inline');
    const words = $('.word');
    words.each(function (index) {
        if (index === words.length - 1 && callback) {
            $(this).delay(index * delay).animate({'opacity': 1}, duration, function () {
                if (callback) {
                    callback()
                }
            });
        } else {
            $(this).delay(index * delay).animate({'opacity': 1}, duration);
        }
    });
}

function transition(jQTextClass = '.word', callback = 0) {
    textFadeOut('.word', textFadeIn, true)
}


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
                            transition('.word');
                            const currentContext = response[0]['context'];
                            newText = currentContext.sceneText;
                            localStorage.setItem("story", `${currentContext.story_name}`);
                            localStorage.setItem("scene", `${currentContext.scene}`);
                            localStorage.setItem("options", JSON.stringify(currentContext.options));
                            let optionCount = parseInt(currentContext.optionQuantity);
                            let divOptions = JSON.parse(localStorage.getItem('options'));
                            localStorage.setItem('currentContext', JSON.stringify(currentContext));
                            let ourSuperLazyCounter = 0;
                            $('#optionBox').find('.button').each(function (index) {
                                if (ourSuperLazyCounter >= optionCount) {
                                    return false
                                }
                                let focus = String(index + 1);
                                this.innerText = (divOptions[`${focus}`]["option_text"]);
                                ourSuperLazyCounter++;
                                console.log(this, $(this));
                                if (this.innerText) {
                                    $(this).css('display', 'inline')
                                }
                            });
                        }
                    });
                }
            });
    } else if (e.target.classList.contains('optionSelector')) {
        // const optionId = e.target.id;
        // const divOptions = JSON.parse(localStorage.getItem('options'));
        // const optionLabelLocator = e.target.id.slice(-1);
        // const selectedOption = divOptions[optionLabelLocator]['option_label'];
        // optionLabel = divOptions[optionLabelLocator]['option_label'];
        // let buttonFade = anime.timeline();
        // buttonFade
        //     .add({
        //         targets: optionId,
        //         rotate: {
        //             value: 360,
        //             duration: 750,
        //             easing: 'easeOutSine'
        //         },
        //         opacity: {
        //             value: 0,
        //             duration: 1500
        //         },
        //         translateY: {
        //             value: '-100vh',
        //             duration: 1000
        //         }
        //     })
        //     .add({
        //         targets: '.optionSelector',
        //         opacity: 0,
        //         offset: '-=1000',
        //         duration: 1000,
        //     });
        $.ajax({
            url: '/story/api/',
            type: 'GET',
            data: {
                optionSelection: `${selectedOption}`
            },
            success: response => {
                console.log('click')
                // textFadeOut('.word', response);
                // console.log(response);
                // const currentContext = response[0]['context'];
                // console.log(currentContext);
                // const optionCount = parseInt(currentContext.optionQuantity);
                // localStorage.setItem("scene", `${currentContext.scene}`);
                // localStorage.setItem("options", JSON.stringify(currentContext.options));
                // const div_options = JSON.parse(localStorage.getItem('options'));
                // let ourSuperLazyCounter = 0;
                // let focus = $('#textBox > p');
                // spanify(focus, currentContext.sceneText);
                // textFadeIn(focus);
                // $('#optionBox').find('.button').each(function (index) {
                //     if (ourSuperLazyCounter >= optionCount) {
                //         console.log(ourSuperLazyCounter, optionCount);
                //         return false
                //     }
                //     let focus = String(index + 1);
                //     this.innerText = (div_options[`${focus}`]["option_text"]);
                //     ourSuperLazyCounter++;
                //     console.log(this, $(this));
                //     if (this.innerText) {
                //         $(this).css('display', 'inline')
                //     }
                // })
            }
        })
    }
});

function spanify(textTarget, textStr, spanClass = 'word') {
    $(`.${spanClass}`).css('opacity', 0);
    const splitText = textStr.split(' ');
    textTarget.empty();
    for (i in splitText) {
        textTarget.append(`<span class='${spanClass}'>${splitText[i]} </span>`)
    }
}

initialize();
