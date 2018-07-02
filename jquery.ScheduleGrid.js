(function ($) {

    var resourceCellWidth = 180;

    $.fn.ScheduleGrid = function (options) {
        $grid = this;
        var settings = $.extend({
            cellX: 48,
            cellY: 36,
            gridHeight: 700,
            eventMargin: 12,
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
        $($grid).append(gridHTML);

        var daysHTML = '';
        for (var i = 0; i < settings.numColumns; i++) {
            var day = i + 1;
            daysHTML += '<div class="cell workday">' + day + '</div>';
        }

        $('#days').append(daysHTML);

        if (isIE()) IEScrollFix(settings);
        setDimensions(settings);
        
        
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
                'background': colors[color],
            });
            if (settings.resizable) makeResizable(settings, $(this));
            if (settings.draggable) makeDraggable(settings, $(this));
        });

        $('.cell').on('dblclick', function () {
            $('#modal-text').val('');
            $('#modal-span').val('');
            $('#modal-color').val('');
            if ($(this).hasClass('resource-cell')) return;
            $('#modal').modal();
            var x = $(this).data('x');
            var y = $(this).data('y');
            $('.events').append('<div class="event" data-x="' + x + '" data-y="' + y + '" data-span="1"><div class="event-text">New task!!</div></div>');
            
            $('#modal-button').on('click', function() {
                var newEvent = $('.event:last');
                newEvent.find('.event-text').text($('#modal-text').val());
                newEvent.attr('data-span', $('#modal-span').val());
                newEvent.attr('data-color', $('#modal-color').val());
                $('.event:last').css({
                    'width': (parseInt(newEvent.attr('data-span')) * settings.cellX) + 'px',
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
                    'background': colors[newEvent.attr('data-color')]
                });
            });

            if (settings.resizable) makeResizable(settings, $('.event:last'));
            if (settings.draggable) makeDraggable(settings, $('.event:last'));
        });

        $($grid).scroll(function () {
            $('.timeline-row').css({
                'top': $(this).scrollTop()
            });
        });

        $($grid).css('opacity', 1);
        return this;
    }

    function makeResizable(settings, element) {
        if (!element) element = $('.event');
        element.resizable({
            grid: [settings.cellX, settings.cellY],
            handles: 'e',
            stop: function (event, ui) {
                var spaces = (ui.size.width - ui.originalSize.width) / settings.cellX;
                ui.element.attr('data-span', parseInt(ui.element.attr('data-span')) + spaces);
                var x = parseInt($(ui.element).attr('data-x'));
                var y = parseInt($(ui.element).attr('data-y'));
                $(ui.element).find('.event-text').text($('.row[data-row="' + y + '"] .resource-cell').text() + ' ' + (x + 1) + '. - ' + (x + 1 + parseInt($(ui.element).attr('data-span')) - 1) + '. Juli');
                makeDraggable(settings, element);
            }
        });
        
    }

    function makeDraggable(settings, element) {
        if (!element) element = $('.event');
        var x1 = $grid.offset().left + resourceCellWidth;
        var y1 = $grid.offset().top + (settings.cellX / 2);
        var x2 = $grid.offset().left + ((settings.numColumns * settings.cellX) + resourceCellWidth) - element.width();
        var y2 = $grid.offset().top + ($('.row').length * settings.cellY);
        var boundingBox = [x1, y1, x2, y2];
        console.log(boundingBox);
        element.draggable({
            stacks: '.event',
            grid: [settings.cellX, settings.cellY],
            containment: boundingBox,
            stop: function (event, ui) {
                console.log(boundingBox);
                var spaces = $(event.target).width() / settings.cellX;
                var posTop = parseInt($(event.target).css('top').replace('px', ''));
                var posLeft = parseInt($(event.target).css('left').replace('px', ''));
                var newY = posTop / settings.cellY;
                var newX = posLeft / settings.cellX;
                $(event.target).attr('data-y', newY);
                $(event.target).attr('data-x', newX);
                $(event.target).find('.event-text').text($('.row[data-row="' + newY + '"] .resource-cell').text() + ' ' + (newX + 1) + '. - ' + (newX + 1 + parseInt($(event.target).attr('data-span')) - 1) + '. Juli');
            }
        });
        
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
    
        $('.resource-cell').css('width', resourceCellWidth);
        $('.row').css('height', settings.cellY);
        $grid.css('height', settings.gridHeight);
        
        $('.events').css('width', $('.events').width() - resourceCellWidth);
        $('.events').css('top', settings.numTimelineRows * settings.cellY);
        $('.events').css('left', $('.resource-cell').width());
    }

    function isIE() {
        return navigator.userAgent.match(/Trident\/7\./);
    }

    function IEScrollFix(settings) {
        $($grid).on('mousewheel', function (e) {
            e.preventDefault();
            var wheelDelta = e.originalEvent.wheelDelta;
            var currentScrollPosition = $($grid).scrollTop();
            $($grid).scrollTop(currentScrollPosition - wheelDelta);
        });
    }

})(jQuery);