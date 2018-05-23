$(document).ready(function () {
    let newTimeLine = anime.timeline();
    newTimeLine
        .add({
            targets: '.sub-span',
            opacity: 1,
            duration: 4000,
            offset: 0
        })
        .add({
            targets: '.main-span',
            opacity: 1,
            duration: 3500,
            offset: 500
        })
        .add({
            targets: 'header hr',
            opacity: 1,
            width: ['0vw', '75vw'],
            duration: 1000,
            offset: 1000,
            easing: 'easeInOutQuad'
        })
        // .add({
        //     targets: '.img1',
        //     translateX: ['-50vw', '0'],
        //     offset: 2000,
        //     duration: 2500,
        //     easing: 'easeInQuad'
        // })
        // .add({
        //     targets: '.img2',
        //     translateX: ['50vw', '0'],
        //     offset: 2000,
        //     duration: 2500,
        //     easing: 'easeInQuad'
        // })
        .add({
            targets: '.ghost-mid',
            translateY: ['150px', '0'],
            opacity: [0, 1],
            offset: 2000,
            duration: 3000,
        })
        .add({
            targets: '.ghost-left',
            translateX: ['-500px', '0'],
            offset: 2000,
            duration: 6000
        })
        .add({
            targets: '.ghost-right',
            translateX: ['500px', '0'],
            offset: 2000,
            duration: 6000
        })
        .add({
            targets: '#bottomNav',
            opacity: [0, 1],
            offset: 5000,
            duration: 3000
        })
});