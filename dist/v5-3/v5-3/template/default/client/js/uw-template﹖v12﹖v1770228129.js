let uwTpl = {};

$document = $(document);
$window = $(window);

uwTpl.tabUrl = false;
uwTpl.timeoutPreload = null;
uwTpl.timerPreloader = 0;
uwTpl.timeoutAnim = 3000;
uwTpl.errorFps = 0;

document.addEventListener("uwBlockPageOnStartLoad", e => {
    uwTpl.showPreloader();
    uwTpl.timeoutPreload = setTimeout(() => {
        uwTpl.hideMain();
        uwTpl.showPreloader();
    }, 1000)
});

$document.ready(function() {
    uwTpl.initTemplate({ page: '', title: '', isRepeat: false });
    uwTpl.hidePreloader();

    $("nav #hover").hover(
        function() {
            $("nav #hover").attr("style", "color: rgba(0, 0, 0, 0.3) !important");
            $(this).attr("style", "color: #000 !important");
        },
        function() {
            $("nav #hover").attr("style", "color: #000 !important");
        }
    );
});

document.addEventListener("uwInit", e => {
    //uwTpl.initTemplate(e.detail);
    //uwTpl.hidePreloader();
});

document.addEventListener("uwBlockPageOnFinishLoad", e => {
    clearTimeout(uwTpl.timeoutPreload);
    if (e.detail.reload)
        return;
    uwTpl.initTemplate(e.detail);
    uwTpl.hidePreloader();
});

document.addEventListener("uwAsyncFormCallback", e => {

});

uw.window.bind("popstate", function () {
    if (!uwTpl.tabUrl) {
        let $pathname = location.pathname.replace('/', '');
        uw.showPage(($pathname !== '') ? $pathname : 'index', true);
    }
});

let $prevScroll = 0;
let $navIsHide = false;
let $footerIsActive = false;

$window.scroll(function() {
    try {
        if (!uw.utils.mobileAndTabletCheck()) {
            if ($document.height() - $window.height() - $('#footer-parallax-1').height() <= $document.scrollTop()) {
                if ($footerIsActive) {
                    $footerIsActive = false;
                    $('#footer-parallax-1').css('background-attachment', 'unset');
                }
            }
            else {
                if (!$footerIsActive) {
                    $footerIsActive = true;
                    $('#footer-parallax-1').css('background-attachment', 'fixed');
                }
            }
        }
        else if (!$footerIsActive) {
            $footerIsActive = false;
            $('#footer-parallax-1').css('background-attachment', 'unset');
        }
    }
    catch (e) {}

    try {
        $('#line-pos').height($('#line-pos-to').offset().top - $('#line-pos-from').offset().top - 10);
    }
    catch (e) {}

    try {
        $('#full-document-height-element').css('min-height', ($($document).height() - $(window).height()) + 'px')
    }
    catch (e) {}

    if ($document.scrollTop() > 120)
        $('#nav-index .nav-wrapper').css('backdrop-filter','invert(1) blur(12px)');
    else
        $('#nav-index .nav-wrapper').css('backdrop-filter','invert(1) blur(0px)');


    if ($navIsHide) {
        if ($document.scrollTop() < $prevScroll) {
            $('#nav-index .nav-wrapper').removeClass('animate__fadeOutUp');
            $('#nav-index .nav-wrapper').addClass('animate__fadeInDown');
            $navIsHide = false;
        }
    }
    else {
        if ($document.scrollTop() > $prevScroll) {
            if ($document.scrollTop() > 100) {
                $('#nav-index .nav-wrapper').removeClass('animate__fadeInDown');
                $('#nav-index .nav-wrapper').addClass('animate__fadeOutUp');
                $navIsHide = true;
            }
        }
    }

    $prevScroll = $document.scrollTop();

    uwTpl.buttonCheckScroll();
});

uwTpl.showMain = () => {
    //$('main').show();
    setTimeout(uwTpl.showMainAnimation, uwTpl.timeoutAnim);
};

uwTpl.hideMain = () => {
    //$('main').hide();
};

uwTpl.showPreloader = () => {
    uwTpl.timerPreloader = Date.now();
    $('.loading-overlay').show();
    $('.loading-overlay').addClass('show');
    $('body').css('overflow-x', 'hidden');
};

uwTpl.hidePreloader = () => {

    let timerOffset = Date.now() - uwTpl.timerPreloader;
    let showDelay = 1;
    if (timerOffset < 1500)
        showDelay = 1500 - timerOffset;

    setTimeout(() => {
        $('.loading-overlay').removeClass('show');
        $('body').css('overflow-x', 'hidden');
        setTimeout(() => {
            $('.loading-overlay').hide();
        }, 1000);
    }, showDelay)
};


uwTpl.showMainAnimation = function() {
    try {
        $('.marquee').marquee({
            duration: 15000,
            startVisible: true,
            duplicated: true
        });
        $('.marquee-right').marquee({
            duration: 15000,
            startVisible: true,
            duplicated: true,
            direction: 'right',
        });
    }
    catch (e) {
        console.log('marquee', e);
    }

    try {
        Particles.init({
            selector: '#particles-js',
            maxParticles: 70,
            color:'#FFFFFF',
            connectParticles: true,
            speed: 1,
            responsive: [
                {
                    breakpoint:768,
                    options: {
                        maxParticles:50,
                        color:'#c7c7c7',
                        connectParticles: true
                    }
                }
            ]
        });
    }
    catch (e) {}
};

uwTpl.initTemplate = (e) => {
    uwTpl.showMain();

    if(e.isRepeat !== true && e.page)
        window.history.pushState(e.title, e.title, (e.page === 'index') ? '/' : '/' + e.page);

    if (window.screen.width <= 998) {
        $('select').addClass('browser-default');
    }

    setInterval(() => {
        if ($('#js-gui').length > 0) {
            if (uwTpl.errorFps > 3) {
                $('#js-gui').remove();
                $('#js-webgl').remove();
                $('#bg-canvas').remove();
            }
            if (fpsCounter < 30)
                uwTpl.errorFps++;
        }
    }, 1000);
    setInterval(() => {
        uwTpl.errorFps = 0;
    }, 5000);

    uwTpl.updateFPS(); // Start the FPS counter

    M.AutoInit();

    if (!uw.utils.mobileAndTabletCheck()) {
        if ($(window).height() > 600)
            $('.fullsize').height($(window).height() + 'px');
        else
            $('.fullsize').height('600px');
    }
    else {
        $("div").removeClass('vertical-center');
        $("div").removeClass('vertical-container');
    }

    $('.dropdown-btn').dropdown({
            inDuration: 300,
            outDuration: 225,
            constrainWidth: false,
            hover: false,
            gutter: 39,
            belowOrigin: false,
            alignment: 'right',
            stopPropagation: false
        }
    );

    M.updateTextFields();
    $(".tabs .tab a").click(function() {
        uwTpl.redirectPage($(this).attr('href'));
    });

    $('.tooltipped').tooltip({delay: 50});
    uw.events.buttonScroll();

    $('.collapsible').collapsible();
    $('.modal').modal();

    $('input').each(function( index ) {
        if($(this).attr('autocomplete') === 'off')
            $(this).val('');
    });

    $('textarea').height(30);
    $('textarea').each(function( index ) {
        if($(this).attr('data-length') != undefined) {
            $(this).characterCounter();
        };
    });

    $('.carousel.carousel-slider').carousel({
        fullWidth: true,
        indicators: true
    });

    try {
        const phrases = [
            "Web Development",
            "High Level Design",
            "Search Optimization Engine (SEO)",
            "AI Development",
            "Mobile Development",
            "Desktop Development",
            "Marketing",
        ];

        const el = document.querySelector(".main-text-change");
        if (el) {
            const fx = new TextScramble(el);

            let counter = 0;
            const next = () => {
                fx.setText(phrases[counter]).then(() => {setTimeout(next, 1200); });
                counter = (counter + 1) % phrases.length;
            };
            next();
        }
    }
    catch (e) {
        console.log('TextScramble', e);
    }

    setTimeout(() => {
        $('#postload').show();
        $('#preloader-page').fadeOut('slow');
    }, 2500);
}

uwTpl.redirectPage = url => {
    uwTpl.tabUrl = true;
    window.location.href = url;
    if(url.split("#")[0] === window.location.href.split("#")[0])
        window.location.reload(true);
    uwTpl.tabUrl = false;
};

uwTpl.buttonCheckScroll = () => {

    if (uw.document.scrollTop() > 100 ) {
        $('#scrollup').css('opacity', 1);
        $('#scrollup').removeClass('bounceOutDown');
        $('#scrollup').addClass('bounceInUp');
    } else {
        $('#scrollup').removeClass('bounceInUp');
        $('#scrollup').addClass('bounceOutDown');
    }

    if (uw.document.scrollTop() < 10 ) {
        $('#scrolldown').css('opacity', 1);
        $('#scrolldown').removeClass('bounceOut');
        $('#scrolldown').addClass('bounceIn');
    } else {
        $('#scrolldown').css('opacity', 0);
        $('#scrolldown').removeClass('bounceIn');
        $('#scrolldown').addClass('bounceOut');
    }
};

Element.prototype.fadeOut = function (speed) {
    let element = this; // 'this' refers to the element on which fadeOut is called
    let fadeEffect = setInterval(function () {
        if (!element.style.opacity) {
            element.style.opacity = 1; // Set initial opacity if not set
        }
        if (element.style.opacity > 0) {
            element.style.opacity -= 0.1;
        } else {
            clearInterval(fadeEffect);
            element.style.display = 'none';
        }
    }, speed || 100); // Default speed is 100ms if not provided
};

Element.prototype.fadeIn = function (speed) {
    let element = this; // 'this' refers to the element on which fadeIn is called
    element.style.opacity = 0; // Ensure the element is initially invisible
    element.style.display = ''; // Reset display property to default or you can set to 'block' or 'inline', depending on your needs

    let opacityStep = 0.1; // Define the increment of opacity. Adjust for smoother or quicker transitions.
    let interval = speed || 100; // Default speed is 200ms if not provided
    let maxOpacity = 1; // Target opacity. Change if you don't want full opacity.
    let fadeEffect = setInterval(function () {
        if (element.style.opacity < maxOpacity) {
            element.style.opacity = parseFloat(element.style.opacity) + opacityStep;
        } else {
            clearInterval(fadeEffect);
        }
    }, interval / (maxOpacity / opacityStep)); // Calculate interval time based on speed and steps needed
};

let lastCalledTimeFpsCounter;
let fpsCounter;

uwTpl.updateFPS = () => {
    if (!lastCalledTimeFpsCounter) {
        lastCalledTimeFpsCounter = performance.now();
        fpsCounter = 0;
    }
    let delta = (performance.now() - lastCalledTimeFpsCounter) / 1000;
    lastCalledTimeFpsCounter = performance.now();
    fpsCounter = 1 / delta;
    requestAnimationFrame(uwTpl.updateFPS);
}


// ——————————————————————————————————————————————————
// TextScramble
// ——————————————————————————————————————————————————

class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = "!<>-_\\/[]{}—=+*^?#________";
        this.update = this.update.bind(this);
    }
    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => (this.resolve = resolve));
        this.queue = [];
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || "";
            const to = newText[i] || "";
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 40);
            this.queue.push({ from, to, start, end });
        }
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }
    update() {
        let output = "";
        let complete = 0;
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.randomChar();
                    this.queue[i].char = char;
                }
                output += `<span class="dud">${char}</span>`;
            } else {
                output += from;
            }
        }
        this.el.innerHTML = output;
        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }
    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
}