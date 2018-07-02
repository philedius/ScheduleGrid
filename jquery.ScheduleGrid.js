(function ($) {

    $.fn.ScheduleGrid = function (options) {

        var settings = $.extend({
            selector: '#grid',
            cellX: 42,
            cellY: 32,
            gridHeight: 700,
            eventMargin: 6,
            resizable: true,
            draggable: true
        }, options);

        var numDaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        var colors = {
            'blue': 'rgb(79, 146, 221)',
            'red': 'rgb(201, 59, 24)',
            'yellow': 'rgb(230, 190, 0)',
            'orange': 'rgb(240, 110, 0)',
            'green': 'rgb(25, 170, 72)'
        };
        var numRows = 60;
        var firstNames = ['Jeff', 'Alex', 'Vinny', 'Ryan', 'Abby', 'Drew', 'Brad', 'Patrick', 'Dan', 'Jason', 'Jan', 'Austin', 'Ben', 'Dave', 'Brett'];
        var lastNames = ['Gerstmann', 'Navarro', 'Caravella', 'Davis', 'Russell', 'Scanlon', 'Shoemaker', 'Klepek', 'Ryckert', 'Oestreicher', 'Ochoa', 'Walker', 'Pack', 'Snider'];
        settings.numTimelineRows = $('.timeline-row').length;
        var scrollbarWidth = 17;
        settings.eventWidth = settings.cellX - settings.eventMargin;
        settings.eventHeight = settings.cellY - settings.eventMargin;
        var numRows = 60;
        settings.numColumns = numDaysInMonth[new Date().getMonth()];

        var gridHTML = '';
        for (var i = 0; i < numRows; i++) {
            var firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            var lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            gridHTML += '<div class="row" data-row="' + i + '"><div class="cell resource-cell"><div class="resource-name">' + firstName + ' ' + lastName + '</div></div>';
            for (var j = 0; j < settings.numColumns; j++) {
                gridHTML += '<div class="cell" data-x="' + j + '" data-y="' + i + '"></div>';
            }
            gridHTML += '</div>';
        }
        $(settings.selector).append(gridHTML);

        var daysHTML = '';
        for (var i = 0; i < settings.numColumns; i++) {
            var day = i + 1;
            daysHTML += '<div class="cell workday">' + day + '</div>';
        }

        $('#days').append(daysHTML);

        if (isIE()) IEScrollFix(settings);
        setDimensions(settings);
        
        if (settings.resizable) makeResizable(settings);
        if (settings.draggable) makeDraggable(settings);
    
        $('.event').each(function () {
            var startingY = $(this).data('y');
            var startingX = $(this).data('x');
            var span = $(this).data('span');
            var color = $(this).data('color');
            $(this).css({
                'top': (startingY * settings.cellY) + 'px',
                'left': (startingX * settings.cellX) + 'px',
                'width': (span * settings.cellX) + 'px',
            });
            $(this).find('.event-text').css({
                'background': colors[color]
            })
        });

        $('.cell').on('dblclick', function () {
            var x = $(this).data('x');
            var y = $(this).data('y');
            var span = 3;
            $('.events').append('<div class="event" data-x="' + x + '" data-y="' + y + '" data-span="' +
                span + '"><div class="event-text">New task!!</div></div>');
            $('.event:last').css({
                'width': (span * settings.cellX) + 'px',
                'min-width': settings.cellX,
                'height': settings.cellY,
                'min-height': settings.cellY,
                'max-height': settings.cellY,
                'top': (y * settings.cellY) + 'px',
                'left': (x * settings.cellX) + 'px',
            });
    
            $('.event:last .event-text').css({
                'margin-left': settings.eventMargin / 2,
                'margin-right': settings.eventMargin / 2,
                'min-width': settings.eventWidth,
                'height': settings.eventHeight,
                'min-height': settings.eventHeight,
                'max-height': settings.eventHeight,
                'background': colors['blue']
            })
            
            if (settings.resizable) makeResizable(settings, $('.event:last'));
            if (settings.draggable) makeDraggable(settings, $('.event:last'));
    
            
        });

        $(settings.selector).scroll(function () {
        $('.timeline-row').css({
            'top': $(this).scrollTop()
        });
    });

    $(settings.selector).css('opacity', 1);

        return this;
    }

    function makeResizable(settings, element) {
        if (element) {
            element.resizable({
                grid: [settings.cellX, settings.cellY],
                handles: 'e',
                stop: function (event, ui) {
                    var spaces = (ui.size.width - ui.originalSize.width) / settings.cellX;
                    ui.element.attr('data-span', parseInt(ui.element.attr('data-span')) + spaces);
                }
            });
        } else {
            $('.event').resizable({
                grid: [settings.cellX, settings.cellY],
                handles: 'e',
                stop: function (event, ui) {
                    var spaces = (ui.size.width - ui.originalSize.width) / settings.cellX;
                    ui.element.attr('data-span', parseInt(ui.element.attr('data-span')) + spaces);
                }
            });
        }
    }

    function makeDraggable(settings, element) {
        if (element) {
            element.draggable({
                grid: [settings.cellX, settings.cellY],
                stop: function (event, ui) {
                    var posTop = parseInt($(event.target).css('top').replace('px', ''));
                    var posLeft = parseInt($(event.target).css('left').replace('px', ''));
                    var newPosTop = posTop / settings.cellY;
                    var newPosLeft = posLeft / settings.cellX;
                    $(event.target).attr('data-y', newPosTop);
                    $(event.target).attr('data-x', newPosLeft);
                }
            });
        } else {
            $('.event').draggable({
                grid: [settings.cellX, settings.cellY],
                stop: function (event, ui) {
                    var posTop = parseInt($(event.target).css('top').replace('px', ''));
                    var posLeft = parseInt($(event.target).css('left').replace('px', ''));
                    var newY = posTop / settings.cellY;
                    var newX = posLeft / settings.cellX;
                    $(event.target).attr('data-y', newY);
                    $(event.target).attr('data-x', newX);
                    $(event.target).find('.event-text').text($('.row[data-row="' + newY + '"] .resource-cell').text() + ' ' + (newX + 1) + '. - ' + (newX + 1 + $(event.target).data('span') - 1) + '. Juli');
                }
            });
        }
    }

    function setDimensions(settings) {
        $('.cell').css({
            'min-width': settings.cellX,
            'height': settings.cellY,
            'min-height': settings.cellY,
            'max-height': settings.cellY,
        });
    
        $('#months .cell').css('width', settings.cellX * settings.numColumns);
    
        $('.event').css({
            'min-width': settings.cellX,
            'height': settings.cellY,
            'min-height': settings.cellY,
            'max-height': settings.cellY,
        });
    
        $('.event-text').css({
            'margin-left': settings.eventMargin / 2,
            'margin-right': settings.eventMargin / 2,
            'min-width': settings.eventWidth,
            'height': settings.eventHeight,
            'min-height': settings.eventHeight,
            'max-height': settings.eventHeight,
    
        });
    
        $('.resource-cell').css('width', '180px');
    
        $('.row').css('height', settings.cellY);
    
        $(settings.selector).css('height', settings.gridHeight);
    
        $('.events').css('top', settings.numTimelineRows * settings.cellY);
        $('.events').css('left', $('.resource-cell').width());
    }

    function isIE() {
        return navigator.userAgent.match(/Trident\/7\./);
    }

    function IEScrollFix(settings) {
        $(settings.selector).on('mousewheel', function (e) {
            e.preventDefault();
            var wheelDelta = e.originalEvent.wheelDelta;
            var currentScrollPosition = $(settings.selector).scrollTop();
            $(settings.selector).scrollTop(currentScrollPosition - wheelDelta);
        });
    }

})(jQuery);