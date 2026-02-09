let uw = {
    document: $(document),
    window: $(window),
    htmlPages: {
        p404: ''
    },
    timers: [
        formsUpdates = [],
        formsUpdatesSaver = []
    ],
    files: {},
    utils: {},
    misc: {},
    async: {},
    ajax: {},
    cookie: {},
    events: {
        customClick: new MouseEvent('click', { 'view': window, 'bubbles': true, 'cancelable': false })
    },
}

uw.utils.initializedScripts = [];
uw.utils.initScripts = [];

uw.document.ready(function() {
    setInterval(uw.formsUpdates, 1000);
    setInterval(uw.formsUpdatesSaver, 1000);
    uw.executePageExtended();
    document.dispatchEvent(new CustomEvent("uwInit", {"detail": { page: '', title: '', isRepeat: false }}));
});

uw.utils.initJSFile = async (url, async = false) => {

    if (uw.utils.initializedScripts.indexOf(url) !== -1) {
        console.log("Script already initialized:", url);
        return;
    }
    let loaded = false;
    let script = document.createElement('script');
    script.src = url;
    script.defer = true;
    script.onload = () => {
        console.log("Script loaded successfully!", url);
        uw.utils.initializedScripts.push(url);
        loaded = true;
    };
    document.head.appendChild(script);

    while (!loaded)
        await uw.utils.sleep(100);
    return loaded;
}

uw.utils.mobileAndTabletCheck = () => {
    let check = false;
    (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};

uw.utils.sleep = function(ms) {
    return new Promise(res => setTimeout(res, ms));
};

uw.utils.transliterate = (st) => {
    const converter = {
        'а': 'a', 'б': 'b', 'в': 'v',
        'г': 'g', 'д': 'd', 'е': 'e',
        'ё': 'e', 'ж': 'zh', 'з': 'z',
        'и': 'i', 'й': 'y', 'к': 'k',
        'л': 'l', 'м': 'm', 'н': 'n',
        'о': 'o', 'п': 'p', 'р': 'r',
        'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'h', 'ц': 'c',
        'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
        'ь': '\'', 'ы': 'y', 'ъ': '\'',
        'э': 'e', 'ю': 'yu', 'я': 'ya',

        'А': 'A', 'Б': 'B', 'В': 'V',
        'Г': 'G', 'Д': 'D', 'Е': 'E',
        'Ё': 'E', 'Ж': 'Zh', 'З': 'Z',
        'И': 'I', 'Й': 'Y', 'К': 'K',
        'Л': 'L', 'М': 'M', 'Н': 'N',
        'О': 'O', 'П': 'P', 'Р': 'R',
        'С': 'S', 'Т': 'T', 'У': 'U',
        'Ф': 'F', 'Х': 'H', 'Ц': 'C',
        'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch',
        'Ь': '\'', 'Ы': 'Y', 'Ъ': '\'',
        'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
    };

    return st.split('').map(char => converter[char] || char).join('');
}

uw.utils.str2url = (str) => {
    str = uw.utils.transliterate(str);
    str = str.toLowerCase();
    str = str.replace(/\./g, '');
    str = str.replace(/[^-a-z0-9_]+/g, '-');
    str = str.trim('-');
    return str;
}

uw.events.eventClickAForm = function(event) {
    if($(this).attr('aform-click') != undefined) {

        if ($(this).attr('target'))
            return true;
        if ($(this).attr('form-disable'))
            return true;

        uw.aFormExecute($(this).attr('aform-click'));
        event.stopPropagation();
        event.preventDefault();
        return false;
    }
}

uw.events.eventChangeAsyncSwitch = function(event) {
    if($(this).attr('async-swtich') != undefined) {
        uw.aSwitchExecute($(this));
        event.stopPropagation();
        event.preventDefault();
        return false;
    }
}

uw.events.eventClickSpa = function(event){

    if ($(this)) {
        //article-editor-content
    }

    let disableClick = false;
    let allParents = $(this).parents();
    allParents.each(function() {
        if ($(this).attr('id') === 'article-editor-content')
            disableClick = true;
    });

    if (disableClick) {
        event.stopPropagation();
        event.preventDefault();
        return false;
    }

    if($(this).attr('spa') != undefined) {
        if ($(this).attr('href').includes('http')) {
            window.location.href = $(this).attr('href');
            return false;
        }
        uw.showPage($(this).attr('href').slice(1));
        event.stopPropagation();
        event.preventDefault();
        return false;
    }
}

uw.events.eventClickAsync = function(event){
    if($(this).attr('aclick') != undefined) {
        uw.aSyncEvent($(this).attr('aclick'));
        event.stopPropagation();
        event.preventDefault();
        return false;
    }
}

uw.executePageExtended = function() {

    uw.utils.setClientUTC();
    uw.loadAsyncForm();

    uw.events.init();

    $('.custom-checkbox').each((idx, item) => {
        $(item).attr('data-idx', idx);
        $(item).html($(item).text() + '<input class="hide" id="custom-checkbox-input-' + $(item).attr('data-name') + idx + '" type="checkbox" name="' + $(item).attr('data-name') + '">')
    });

    $(".custom-checkbox").click(function() {
        let $checkBox = $(this)
        if ($checkBox.hasClass('active')) {
            $checkBox.removeClass('active');
            //setTimeout(() => { $checkBox.blur(); $checkBox.mouseleave(); }, 500);
            $('#custom-checkbox-input-' + $checkBox.attr('data-name') + $checkBox.attr('data-idx')).prop("checked", false);
        }
        else {
            $(this).addClass('active');
            $('#custom-checkbox-input-' + $checkBox.attr('data-name') + $checkBox.attr('data-idx')).prop("checked", true);
        }
    });

    $('body').unbind('click', uw.events.eventClickAForm);
    $('body').unbind('click', uw.events.eventClickSpa);
    $('body').unbind('click', uw.events.eventClickAsync);
    $('body').unbind('change', uw.events.eventChangeAsyncSwitch);
    $('body').on('click', 'button[name]', uw.events.eventClickAForm);
    $('body').on('click', 'a', uw.events.eventClickAForm);
    $('body').on('click', 'a', uw.events.eventClickSpa);
    $('body').on('click', 'a', uw.events.eventClickAsync);
    $('body').on('change', 'input', uw.events.eventChangeAsyncSwitch);

    $('textarea').keyup(function(e) {
        if (window.screen.width > 600) {
            if(e.which == 13 && !e.shiftKey) {
                if($(this).attr('aform-click') != undefined) {
                    uw.aFormExecute($(this).attr('aform-click'));
                    e.stopPropagation();
                    e.preventDefault();
                    return false;
                }
            }
        }
    });
};

uw.loadAsyncForm = function() {
    uw.timers.formsUpdates = [];
    uw.timers.formsUpdatesSaver = [];

    $('form').each(async function( index ) {
        if ($(this).attr('type') === "save-update") {
            let generateId = await uw.utils.sha256(new Date().getTime() + uw.utils.getRandomInt(-999999999, 999999999));
            $(this).attr('id', generateId);
            uw.formLoader(generateId, $(this).attr('name'));
            uw.timers.formsUpdatesSaver.push(generateId);
        }
    });

    $('aform').each(async function( index ) {
        let generateId = await uw.utils.sha256(new Date().getTime() + uw.utils.getRandomInt(-999999999, 999999999));
        $(this).attr('id', generateId);

        $(this).find('button').attr('aform-click', generateId);
        $(this).find('button').attr('id', 'btn-' + generateId);

        $(this).find('textarea[data-enter-event="true"]').attr('aform-click', generateId);

        $(this).find('a').attr('aform-click', generateId);
        $(this).find('a').attr('id', 'btn-' + generateId);

        $(this).attr('count-input', $(this).find('input').length);
        $(this).attr('count-textarea', $(this).find('textarea').length);
        $(this).attr('count-select', $(this).find('select').length);

        if ($(this).attr('type') === "save-update") {
            uw.formLoader(generateId, $(this).attr('name'));
            uw.timers.formsUpdatesSaver.push(generateId);
        }

        if ($(this).attr('type') === "live-update") {
            $(this).find('select').each(function () {
                if ($(this).attr('name'))
                    $(this).attr('prev-value', $(this).val());
            });
            $(this).find('input').each(function () {
                if ($(this).attr('name')) {
                    if ($(this).attr('type') === 'checkbox')
                        $(this).attr('prev-value', $(this).is(":checked"));
                    else
                        $(this).attr('prev-value', $(this).val());
                }
            });
            $(this).find('textarea').each(function () {
                if ($(this).attr('name'))
                    $(this).attr('prev-value', $(this).val());
            });
            uw.timers.formsUpdates.push(generateId)
        }
    });
};

uw.showPage = function($page, $isRepeat){
    //if((($page === 'index') ? '/' : '/' + $page) == location.pathname && $isRepeat !== true)
    //    return false;

    document.dispatchEvent(new CustomEvent("uwBlockPageOnStartLoad", {"detail": { page: $page, isRepeat: $isRepeat }}));

    $('html, body').animate({scrollTop: 0}, 0, 'swing');

    //if($isRepeat !== true)
        //window.history.pushState('Test', 'Test', ($page === 'index') ? '/' : '/' + $page);

    $.ajax({
        type: 'POST',
        url: '/ajax.php?' + $page.split('?')[1],
        dataType: 'html',
        data: 'ajax=true&action=show-page&page=' + $page,
        success: function(data) {
            if (data == 'refresh') {
                document.dispatchEvent(new CustomEvent("uwBlockPageOnFinishLoad", {"detail": { reload: true, page: $page, title: $('title').text(), isRepeat: $isRepeat }}));
                location.reload(true);
                return;
            }

            let timerOffset = Date.now() - uwTpl.timerPreloader;
            let showDelay = 1;
            if (timerOffset < 900)
                showDelay = 900 - timerOffset;

            setTimeout(() => {
                try {
                    $('main').html(data);
                    uw.executePageExtended();

                    let arraySpaTitle = $('spa-title').toArray();
                    let spaTitle = arraySpaTitle[arraySpaTitle.length - 1].innerText;

                    $('title').text(spaTitle);

                    document.dispatchEvent(new CustomEvent("uwBlockPageOnFinishLoad", {"detail": { page: $page, title: spaTitle, isRepeat: $isRepeat }}));
                }
                catch (e) {}
            }, showDelay)
        },
        error: function (jqXHR, textStatus, errorThrown) {
            $('main').html(uw.htmlPages.p404);
            $('title').text($('spa-title').text());

            uw.executePageExtended();

            document.dispatchEvent(new CustomEvent("uwBlockPageOnFinishLoad", {"detail": { errorMessages: [jqXHR, textStatus, errorThrown], page: $page, title: spaTitle, isRepeat: $isRepeat }}));
        }
    });
};

uw.aSyncEvent = function($data){
    $.ajax({
        type: 'POST',
        url: '/ajax.php' + window.location.search,
        dataType: 'json',
        data: 'ajax=true&action=async-event&data=' + $data,
        success: function(data) {
            switch (data.action) {
                case 'refresh':
                    location.reload(true);
                    return;
                case 'redirect':
                    window.location.href = 'https://' + window.location.host + data.uri;
                    break;
                case 'replaceHtml':
                    $(data.container).html(data.content);
                    break;
                case 'insertHtml':
                    $(data.container).html($(data.container).html() + data.content);
                    break;
                case 'insertHtmlFirst':
                    $(data.container).html(data.content + $(data.container).html());
                    break;
                case 'replaceText':
                    $(data.container).text(data.content);
                    break;
                case 'insertText':
                    $(data.container).html($(data.container).text() + data.content);
                    break;
                case 'hideElement':
                    $(data.container).hide();
                    break;
                case 'showElement':
                    $(data.container).show();
                    break;
                case 'addClass':
                    $(data.container).addClass(data.class);
                    break;
                case 'removeClass':
                    $(data.container).removeClass(data.class);
                    break;
            }

            if (data.message)
                M.toast({html: data.message, classes: 'rounded'});

            if (data.debugMessage)
                console.log('DEBUG', data.debugMessage);

            if (data.page)
                uw.showPage(data.page);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log('ERROR', jqXHR, textStatus, errorThrown);
        }
    });
};

uw.aFormExecute = function($formId, $type = 'json'){
    let buttonName = '#btn-' + $formId + '[name]';
    let isUpdate = true;
    let query = '';
    let $aForm = $('#' + $formId);
    let emptyValue = null;

    if ($aForm.attr('type') === 'live-update')
        isUpdate = false;

    $aForm.find('select').each(function () {
        if ($(this).attr('name')) {
            if ($(this).attr('prev-value') && $(this).attr('prev-value') !== $(this).val().toString())
                isUpdate = true;
            query += '&' + $(this).attr('name') + '=' + encodeURIComponent($(this).val());
            $(this).attr('prev-value', $(this).val());

            if ($(this).attr('required') && ($(this).val() === null || $(this).val() === ''))
                emptyValue = 'Some SELECTOR values is empty';
        }
    });
    $aForm.find('input').each(function () {
        if ($(this).attr('name')) {
            if ($(this).attr('type') === 'checkbox') {
                if ($(this).attr('prev-value') && $(this).attr('prev-value') !== $(this).is(":checked").toString())
                    isUpdate = true;
                query += '&' + $(this).attr('name') + '=' + $(this).is(":checked");
                $(this).attr('prev-value', $(this).is(":checked"));

                if ($(this).attr('required') && ($(this).val() === null || $(this).val() === ''))
                    emptyValue = 'Some CHECKBOX values is empty';
            }
            else {
                if ($(this).attr('prev-value') && $(this).attr('prev-value') !== $(this).val().toString())
                    isUpdate = true;
                query += '&' + $(this).attr('name') + '=' + encodeURIComponent($(this).val());
                $(this).attr('prev-value', $(this).val());

                if ($(this).attr('required') && ($(this).val() === null || $(this).val() === ''))
                    emptyValue = $(this).attr('placeholder') + ' value is empty';
            }
        }
    });
    $aForm.find('textarea').each(function () {
        if ($(this).attr('name')) {
            if ($(this).attr('prev-value') && $(this).attr('prev-value') !== $(this).val().toString())
                isUpdate = true;

            query += '&' + $(this).attr('name') + '=' + encodeURIComponent($(this).val());
            $(this).attr('prev-value', $(this).val());

            if ($(this).attr('required') && ($(this).val() === null || $(this).val() === ''))
                emptyValue = $(this).attr('placeholder') + ' value is empty';
        }
    });

    if ($aForm.find('input').length !== parseInt($aForm.attr('count-input')))
        isUpdate = true;
    if ($aForm.find('textarea').length !== parseInt($aForm.attr('count-textarea')))
        isUpdate = true;
    if ($aForm.find('select').length !== parseInt($aForm.attr('count-select')))
        isUpdate = true;

    $aForm.attr('count-input', $aForm.find('input').length);
    $aForm.attr('count-textarea', $aForm.find('textarea').length);
    $aForm.attr('count-select', $aForm.find('select').length);

    if (isUpdate && $(buttonName).attr('name')) {

        if ($aForm.attr('type') !== 'live-update' && emptyValue) {
            M.toast({html: emptyValue, classes: 'rounded'});
            return;
        }

        $(buttonName).attr('disable', 'true');
        $.ajax({
            type: 'POST',
            url: '/ajax.php',
            dataType: $type,
            data: 'ajax=true&action=' + $(buttonName).attr('name') + query,
            success: function(data) {
                if (data.message)
                    M.toast({html: data.message, classes: 'rounded'});

                if (data.button) {
                    $(buttonName).text(data.button);
                    $(buttonName).attr('name', data.buttonName);
                }

                if (data.debugMessage)
                    console.log('DEBUG', data.debugMessage);

                switch (data.action) {
                    case 'refresh':
                        location.reload(true);
                        return;
                    case 'redirect':
                        window.location.href = 'https://' + window.location.host + data.uri;
                        break;
                    case 'replaceHtml':
                        $(data.container).html(data.content);
                        break;
                    case 'insertHtml':
                        $(data.container).html($(data.container).html() + data.content);
                        break;
                    case 'replaceText':
                        $(data.container).text(data.content);
                        break;
                    case 'insertText':
                        $(data.container).html($(data.container).text() + data.content);
                        break;
                    case 'hideElement':
                        $(data.container).hide();
                        break;
                    case 'showElement':
                        $(data.container).show();
                        break;
                    case 'addClass':
                        $(data.container).addClass(data.class);
                        break;
                    case 'removeClass':
                        $(data.container).removeClass(data.class);
                        break;
                }

                if (data.page)
                    uw.showPage(data.page);

                $(buttonName).removeAttr('disabled');
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('error', jqXHR.responseText, jqXHR);
                $(buttonName).removeAttr('disabled');
                M.toast({html: 'Server unknown error ;c', classes: 'rounded'});
            }
        });
    }
};

uw.aSwitchExecute = function($this){
    $.ajax({
        type: 'POST',
        url: '/ajax.php',
        dataType: 'json',
        data: 'ajax=true&action=' + $this.attr('name') + '&check=' + $this.is(':checked'),
        success: function(data) {
            if (data.message == 'refresh') {
                location.reload(true);
                return;
            }
            M.toast({html: data.message, classes: 'rounded'});
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log('error', jqXHR.responseText);
            M.toast({html: 'Server unknown error ;c', classes: 'rounded'});
        }
    });
};

uw.formsUpdates = function(){
    uw.timers.formsUpdates.forEach(item => {
        uw.aFormExecute(item);
    })
};

uw.formsUpdatesSaver = function(){
    uw.timers.formsUpdatesSaver.forEach(item => {
        uw.formSaver(item, $('#' + item).attr('name'));
    })
};

uw.utils.numberFormat = function (currentMoney) {
    return currentMoney.toString().replace(/.+?(?=\D|$)/, function(f) {
        return f.replace(/(\d)(?=(?:\d\d\d)+$)/g, "$1,");
    });
};

uw.utils.getQueryVariable = function(variable) {
    let query = window.location.search.substring(1);
    let vars = query.split('&');
    for (let i = 0; i < vars.length; i++) {
        let pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log('Query variable %s not found', variable);
    return undefined;
};

uw.utils.getRandomInt = function(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //
}

uw.utils.sha256 = async function(message) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message));
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

uw.events.buttonScroll = function() {
    $('#scrollup').click( function() {
        $('html, body').animate({scrollTop: 0}, '500', 'swing');
        return false;
    });
    $('#scrolldown').click( function() {
        $('html, body').animate({scrollTop: $('.fullsize').height()}, '500', 'swing');
        return false;
    });
};

uw.files.uploadFileMultiply = function (imageFiles) {
    Array.from(imageFiles).forEach(function(file) {
        uw.files.uploadFileConvert(file);
    });
};

uw.files.uploadFileConvert = (file) => {
    if (file.type.includes('image')) {
        heic2any({
            blob: file,
            toType: 'image/png',
            quality: 1
        }).then(blob => {
            uw.files.uploadFile(new File([blob], file.name + ".png", { type: "image/png" }));
        }, error => {
            uw.files.uploadFile(file);
        });
    }
    else {
        uw.files.uploadFile(file);
    }
};

uw.files.uploadFile = (file) => {
    let formData = new FormData();
    formData.append('ajax', true);
    formData.append('action', 'upload-file');
    formData.append('file', file);
    formData.append('size', file.size);
    //formData.append('lastModified', file.lastModified);

    const url = new URL(window.location.href);
    const dirParam = url.searchParams.get("dir");
    if (dirParam)
        formData.append('dir', dirParam);

    let currentIdx = 0;
    if (!uw.files.uploadIdx)
        uw.files.uploadIdx = 0;
    uw.files.uploadIdx++;

    currentIdx = uw.files.uploadIdx;

    $('#media-content').prepend(`<a spa="true" href="/admin/media" id="upload-number-${currentIdx}" class="col s12 m4 l2 center block"> <div class="card flex media-file-load-block"> <div class="media-file-load-container"> <label class="hide">Name.png</label> <div class="preloader-wrapper small active"> <div class="spinner-layer spinner-white-only"> <div class="circle-clipper left"> <div class="circle"></div> </div><div class="gap-patch"> <div class="circle"></div> </div><div class="circle-clipper right"> <div class="circle"></div> </div> </div> </div> </div> </div> </a>`);

    // Create the AJAX request
    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/ajax.php', true);

    /*const onUploadProgress = function(event) {
        if (event.lengthComputable) {
            let percentComplete = (event.loaded / event.total) * 100;
            console.log('Upload progress: ' + percentComplete.toFixed(2) + '%');
            // Update progress bar or UI elements here
        }
    };*/

    // Set up a handler for when the request finishes
    xhr.onload = function () {
        if (xhr.status === 200) {
            let data = JSON.parse(xhr.response);
            $(`#upload-number-${currentIdx} .card`).html(data.html);
            document.getElementById(`upload-number-${currentIdx}`).setAttribute('href', '/admin/media?id=' + data.id);
        } else {
            $(`#upload-number-${currentIdx} .card`).html('<div class="red-text">Error Upload</div>')
        }

        //xhr.upload.removeEventListener('progress', onUploadProgress);
        xhr = null;
    };

    //xhr.upload.addEventListener('progress', onUploadProgress, false);

    // Send the data
    xhr.send(formData);
};

uw.files.uploadImage = ($images, $action, $name, $catId) => {

    console.log($images);

    let files = $images.files;

    event.stopPropagation();
    event.preventDefault();

    let data = new FormData();

    if ($images.blob) {
        data.append('data', $images.blob);
    }
    else {
        $.each( files, function( key, value ){
            data.append( key, value );
        });
    }

    data.append('ajax', true);
    data.append('action', $action);
    data.append('name', $name);
    data.append('catId', parseInt($catId) || 0);

    $.ajax({

        url: '/ajax.php',
        type: 'POST',
        data: data,
        cache: false,
        eof: true,
        dataType: 'html',
        processData: false,
        contentType: false,
        success: function(respond, textStatus, jqXHR) {
            console.log(respond);
            if( typeof respond.error === 'undefined' ) {

                let result = JSON.parse(respond);

                if (typeof result.success === 'undefined')
                    M.toast({html: 'Картинка успешно загружена', classes: 'rounded'});
                else
                    M.toast({html: result.success.message, classes: 'rounded'});

                if ($catId === -1) {
                    $('#iphone-body').css('background', 'url("/upload/iphone/exclusive/' + result.success.files.files[0] + '") center no-repeat');
                    $('#iphone-body').css('background-size', 'cover');
                    $('[id=iphone-texture]').attr('src', '/upload/iphone/exclusive/' + result.success.files.files[0]);
                    $('#data-exclusive').val(result.success.files.files[0]);
                }
            }
            else {
                console.log('Ошибка сервера: ', respond.error);
                console.log(respond, textStatus, jqXHR);
                M.toast({html: 'Ошибка сервера: ' + respond.error, classes: 'rounded'});
            }
        },
        error: function(e, textStatus, errorThrown) {
            console.log('Ошибка Ajax: ', textStatus, errorThrown, e);
            M.toast({html: 'Ошибка ответа сервера', classes: 'rounded'});
        }
    });
};

uw.utils.parseUrl = function (name, url) {
    if (!url) url = location.href;
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( url );
    return results == null ? null : results[1];
}

uw.utils.fallbackCopyTextToClipboard = function (text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
}

uw.utils.copyTextToClipboard = function (text, notifyText = 'Текст был скопирован') {
    if (!navigator.clipboard) {
        uw.utils.fallbackCopyTextToClipboard(text);
        return;
    }
    navigator.clipboard.writeText(text).then(function() {
        M.toast({html: notifyText, classes: 'rounded'});
    }, function(err) {
    });
}

uw.utils.formatPhoneNumber = function (phoneNumberString) {
    let cleaned = ('' + phoneNumberString).replace(/\D/g, '');
    let match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
    if (match)
        return [(match[1] ? '+1 ' : ''), '(', match[2], ') ', match[3], '-', match[4]].join('');
    return phoneNumberString;
}

uw.utils.searchTable = function(inputId, tableId, tdIdx = 0) {
    let input, filter, table, tr, td, i, txtValue;
    input = document.getElementById(inputId);
    if (!input)
        return;
    filter = input.value.toUpperCase();
    table = document.getElementById(tableId);
    if (!table)
        return;
    tr = table.getElementsByTagName("tr");

    console.log(filter);

    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[tdIdx];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

uw.utils.parseUrlParams = (url) => {
    let queryStart = url.indexOf("?") + 1,
        queryEnd   = url.indexOf("#") + 1 || url.length + 1,
        query = url.slice(queryStart, queryEnd - 1),
        pairs = query.replace(/\+/g, " ").split("&"),
        parms = {}, i, n, v, nv;

    if (query === url || query === "") return;

    for (i = 0; i < pairs.length; i++) {
        nv = pairs[i].split("=", 2);
        n = decodeURIComponent(nv[0]);
        v = decodeURIComponent(nv[1]);

        if (!parms.hasOwnProperty(n)) parms[n] = [];
        parms[n].push(nv.length === 2 ? v : null);
    }
    return parms;
}

uw.formClear = (formId) => {
    let projectId = window.location.href.split('?')[0].split('/')
    projectId = parseInt(projectId[projectId.length - 1]) || 0;
    if (projectId > 0)
        uw.cookie.set("project-form-data-" + projectId + '-' + formId, JSON.stringify([]));
    uw.showPage(location.pathname, true);
}

uw.formLoader = (id, formId) => {
    let projectId = window.location.href.split('?')[0].split('/')
    projectId = parseInt(projectId[projectId.length - 1]) || 0;

    if (projectId > 0) {
        let linkDataStr = uw.cookie.get("project-form-data-" + projectId + '-' + formId);
        let linkData = [];
        if (linkDataStr)
            linkData = JSON.parse(linkDataStr);

        let $formSaver = $('#' + id);
        $formSaver.find('select').each(function (fIdx) {
            linkData.forEach((item) => {
                if (item[0] === 'select' && item[1] === fIdx)
                    $(this).val(item[2]);
            })
        });
        $formSaver.find('input').each(function (fIdx, fItem) {
            linkData.forEach((item) => {
                if (item[0] === 'checkbox' && item[1] === fIdx) {
                    $(fItem).prop('checked', item[2]);
                    $(fItem).val(item[2]);
                }
                if (item[0] === 'input' && item[1] === fIdx) {
                    $(fItem).val(item[2]);
                }
            })
        });
        $formSaver.find('textarea').each(function (fIdx) {
            linkData.forEach((item) => {
                if (item[0] === 'textarea' && item[1] === fIdx)
                    $(this).val(item[2]);
            })
        });
    }
}

uw.formSaver = (id, formId = 'unknown') => {
    let projectId = window.location.href.split('?')[0].split('/')
    projectId = parseInt(projectId[projectId.length - 1]) || 0;

    if (projectId > 0) {

        let $formSaver = $('#' + id);
        let formData = [];

        $formSaver.find('select').each(function (idx) {
            formData.push(['select', idx, $(this).val()]);
        });
        $formSaver.find('input').each(function (idx) {
            if ($(this).attr('type') === 'checkbox')
                formData.push(['checkbox', idx, $(this).is(":checked")]);
            else
                formData.push(['input', idx, $(this).val()]);
        });
        $formSaver.find('textarea').each(function (idx) {
            formData.push(['textarea', idx, $(this).val()]);
        });

        uw.cookie.set("project-form-data-" + projectId + '-' + formId, JSON.stringify(formData));
    }
}


uw.utils.setClientUTC = function() {
    uw.cookie.set("UTC", uw.utils.getClientUTC());
    try {
        uw.cookie.set("UTC_ZONE", Intl.DateTimeFormat().resolvedOptions().timeZone);
    }
    catch (e) {
        console.log(e);
    }
    //document.cookie = "UTC="+uw.utils.getClientUTC();
};

uw.utils.getClientUTC = function() {
    return new Date().getTimezoneOffset() / -60;
};

uw.utils.nl2br = function ($str, $is_xhtml) {
    var $breakTag = ($is_xhtml || typeof $is_xhtml === 'undefined') ? '<br />' : '<br>';
    return ($str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ $breakTag +'$2');
};

uw.utils.isEmpty = function($el) {
    return !$.trim($el.html())
};

uw.utils.secToTime = function(secs) {
    let divisor_for_minutes = secs % (60 * 60);
    let minutes = Math.floor(divisor_for_minutes / 60);

    let divisor_for_seconds = divisor_for_minutes % 60;
    let seconds = Math.ceil(divisor_for_seconds);

    String.prototype.padLeft = function (length, character) {
        return new Array(length - this.length + 1).join(character || '0') + this;
    };

    return minutes + ":" + seconds.toString().padLeft(2, '0');
};

uw.events.init = () => {

   /* try {
        $(".media-draggable").draggable("destroy");
        $(".media-droppable").droppable("destroy");

    }
    catch (e) {}*/
    try {

        $(".media-draggable").draggable({
            helper: "clone",
            revert: 'invalid',
            cursor: 'move',
            start: function (event, ui) {
                ui.helper.css({
                    'max-width': '120px',
                    'max-height': '120px'
                });
            }
        });

        $(".media-droppable").droppable({
            accept: ".media-draggable",
            over: function (event, ui) {
                $(this).find(".card-panel").addClass('blue');
            },
            out: function (event, ui) {
                $(this).find(".card-panel").removeClass('blue');
            },
            drop: function (event, ui) {
                $(this).find(".card-panel").removeClass('blue');
                //console.log($(this).attr('attr-dir'));
                //console.log(ui.draggable.attr('attr-id'));
                $.ajax({
                    type: 'POST',
                    url: '/ajax.php' + window.location.search,
                    dataType: 'json',
                    data: 'ajax=true&action=media-move&mid=' + encodeURIComponent(ui.draggable.attr('attr-id')) + '&dir=' + encodeURIComponent($(this).attr('attr-dir')),
                    success: function(data) {
                        console.log(data);
                        ui.draggable.remove();
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log(jqXHR.responseText);
                        console.log(textStatus);
                        console.log(errorThrown);
                        M.toast({html: 'We have some error, please try again', classes: 'rounded'});
                    }
                });
            }
        });
    }
    catch (e) {}

    try {
        let dropArea = document.getElementById('files-drop-area');
        document.removeEventListener('paste', uw.events.onPasteEvent);

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.removeEventListener(eventName, uw.events.preventDefaults, false);
            dropArea.addEventListener(eventName, uw.events.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.removeEventListener(eventName, uw.events.addDropAreaHighlight, false);
            dropArea.addEventListener(eventName, uw.events.addDropAreaHighlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.removeEventListener(eventName, uw.events.removeDropAreaHighlight, false);
            dropArea.addEventListener(eventName, uw.events.removeDropAreaHighlight, false);
        });

        dropArea.removeEventListener('drop', uw.events.onDropEvent);
        dropArea.addEventListener('drop', uw.events.onDropEvent, false);

        document.addEventListener('paste', uw.events.onPasteEvent);
    }
    catch (e) {
        //...
    }

    uw.utils.observerInit();
};

uw.events.addDropAreaHighlight = e => {
    document.getElementById('files-drop-area').classList.add('drop-highlight')
}

uw.events.removeDropAreaHighlight = e => {
    document.getElementById('files-drop-area').classList.remove('drop-highlight')
}

uw.events.preventDefaults = e => {
    e.preventDefault();
    e.stopPropagation();
}

uw.events.onDropEvent = e => {
    let dt = e.dataTransfer;
    let files = dt.files;
    uw.files.uploadFileMultiply(files);
}

uw.events.onPasteEvent = event => {
    event.preventDefault();
    if (event.clipboardData && event.clipboardData.items) {
        const items = event.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].kind === 'file') {
                const file = items[i].getAsFile();
                uw.files.uploadFile(file);
            }
        }
    }
}

uw.cookie.get = (name) => {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

uw.cookie.set = (name, value, options) => {
    options = options || { express: 999999, domain: window.location.hostname, path: '/', };

    let expires = options.expires;

    if (typeof expires == "number" && expires) {
        let d = new Date();
        d.setTime(d.getTime() + expires * 1000);
        expires = options.expires = d;
    }
    if (expires && expires.toUTCString) {
        options.expires = expires.toUTCString();
    }

    value = encodeURIComponent(value);

    let updatedCookie = name + "=" + value;

    for (let propName in options) {
        updatedCookie += "; " + propName;
        let propValue = options[propName];
        if (propValue !== true) {
            updatedCookie += "=" + propValue;
        }
    }

    document.cookie = updatedCookie;
}

uw.cookie.delete = (name) => {
    uw.cookie.set(name, "", { expires: -1 })
}

uw.utils.observerInit = () => {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('animate-element')) {
                    entry.target.classList.remove('animate-element');
                    entry.target.classList.add('animate__animated','animate__fadeIn');
                    setTimeout(() => {
                        entry.target.classList.remove('animate__animated','animate__fadeIn');
                    }, 2000);
                }
            }
        });
    });

    document.querySelectorAll('.animate-element').forEach(item => {
        observer.observe(item);
    })
}