(function ($) {
    
    var resourceCellWidth = 180;
    var numColumns;
    var eventWidth;
    var eventHeight;
    var cellW;
    var cellH;
    var numRows = 60;
    var firstNames = ['Jeff', 'Alex', 'Vinny', 'Ryan', 'Abby', 'Drew', 'Brad', 'Patrick', 'Dan', 'Jason', 'Jan', 'Austin', 'Ben', 'Dave', 'Brett'];
    var lastNames = ['Gerstmann', 'Navarro', 'Caravella', 'Davis', 'Russell', 'Scanlon', 'Shoemaker', 'Klepek', 'Ryckert', 'Oestreicher', 'Ochoa', 'Walker', 'Pack', 'Snider'];
    
    $.fn.ScheduleGrid = function (options) {
        $grid = this;
        var settings = $.extend({
            cell: {
                size: {
                    width: 36,
                    height: 36
                },
            },
            event: {
                margin: 10
            },
            resizable: true,
            draggable: true,
            numMonthsToRender: 3
        }, options);
        
        var colors = {
            'blue': 'rgb(37, 120, 220)',
            'red': 'rgb(232, 45, 45)',
            'yellow': 'rgb(243, 200, 0)',
            'orange': 'rgb(239, 109, 0)',
            'green': 'rgb(25, 170, 72)'
        };
        settings.numTimelineRows = $('.timeline-row').length;
        var scrollbarWidth = 17;
        cellW = settings.cell.size.width;
        cellH = settings.cell.size.height;
        eventWidth = cellW - settings.event.margin;
        eventHeight = cellH - settings.event.margin;
        numColumns = calculateNumColumns(settings.numMonthsToRender);

        setupTimeline(settings);

        if (isIE()) IEScrollFix(settings);
        setDimensions(settings);
        
        $('.event').each(function () {
            var startingY = $(this).data('y');
            var startingX = $(this).data('x');
            var span = $(this).data('span');
            var color = $(this).data('color');
            $(this).css({
                'top': (startingY * cellH) + 'px',
                'left': (startingX * cellW) + 'px',
                'width': (span * cellW) + 'px',
            });
            $(this).find('.event-text').css({
                'background': colors[color],
            });
            if (settings.resizable) makeResizable(settings, $(this));
            if (settings.draggable) makeDraggable(settings, $(this));
        });

        
        $('.cell').on('dblclick', function () {
            if ($(this).hasClass('resource-cell')) return;
            var x = $(this).data('x');
            var y = $(this).data('y');
            console.log('Double clicked', y, x);
        });

        $($grid).scroll(function () {
            $('.timeline-row').css({
                'top': $(this).scrollTop()
            });

            if ($(this).scrollTop() > 0) {
                $('.timeline-row:last').css('box-shadow', '0 1px 5px rgba(0, 0, 0, .06)');
            } else {
                $('.timeline-row:last').css('box-shadow', 'none');
            }
        });

        return this;
    }

    function setupTimeline(settings) {
        setupTimelineHeaders(settings);
        var gridHTML = '';
        for (var i = 0; i < numRows; i++) {
            var firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            var lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            gridHTML += '<div class="row" data-row="' + i + '"><div class="cell resource-cell"><div class="resource-name">' + firstName + ' ' + lastName + '</div></div>';
            for (var j = 0; j < numColumns; j++) {
                gridHTML += '<div class="cell" data-x="' + j + '" data-y="' + i + '"></div>';
            }
            gridHTML += '</div>';
        }
        $($grid).append(gridHTML);
    }

    function setupTimelineHeaders(settings) {
        var daysHTML = '';
        for (var i = 0; i < settings.numMonthsToRender; i++) {
            var days = dayjs().add(i, 'month').daysInMonth();
            var monthWidth = days * cellW;
            $('#months').append('<div style="min-width: ' + monthWidth + 'px !important; width: ' + monthWidth + 'px" class="cell">' + dayjs().add(i, 'month').format('MMMM') + '</div>')
            for (var j = 0; j < days; j++) {
                var day = j + 1;
                daysHTML += '<div class="cell">' + day + '</div>';
            }
        }
        $('#days').append(daysHTML);
    }

    function makeResizable(settings, element) {
        if (!element) element = $('.event');
        element.resizable({
            grid: [cellW, cellH],
            handles: 'e',
            stop: function (event, ui) {
                var spaces = (ui.size.width - ui.originalSize.width) / cellW;
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
        var y1 = $grid.offset().top + (cellH * settings.numTimelineRows);
        var x2 = $grid.offset().left + ((numColumns * cellW) + resourceCellWidth) - element.width();
        var y2 = $grid.offset().top + ($('.row').length * cellH);
        var boundingBox = [x1, y1, x2, y2];
        element.draggable({
            stacks: '.event',
            grid: [cellW, cellH],
            containment: boundingBox,
            stop: function (event, ui) {
                var spaces = $(event.target).width() / cellW;
                var posTop = parseInt($(event.target).css('top').replace('px', ''));
                var posLeft = parseInt($(event.target).css('left').replace('px', ''));
                var newY = posTop / cellH;
                var newX = posLeft / cellW;
                $(event.target).attr('data-y', newY);
                $(event.target).attr('data-x', newX);
                $(event.target).find('.event-text').text($('.row[data-row="' + newY + '"] .resource-cell').text() + ' ' + (newX + 1) + '. - ' + (newX + 1 + parseInt($(event.target).attr('data-span')) - 1) + '. Juli');
            }
        });
        
    }

    function setDimensions(settings) {
        $('.cell').css({
            'min-width': cellW,
            'height': cellH,
            'min-height': cellH,
            'max-height': cellH,
        });
    
        $('.event').css({
            'min-width': cellW,
            'height': cellH,
            'min-height': cellH,
            'max-height': cellH,
        });
    
        $('.event-text').css({
            'margin-left': settings.event.margin / 2,
            'margin-right': settings.event.margin / 2,
            'min-width': eventWidth - (settings.event.margin / 2),
            'height': eventHeight,
            'min-height': eventHeight,
            'max-height': eventHeight,
    
        });
    
        $('.resource-cell').css('width', resourceCellWidth);
        $('.resource-cell').css('min-width', resourceCellWidth);
        $('.row').css('height', cellH);
        $('.row').css('width', (cellW * numColumns) + resourceCellWidth);
        $('.events').css('width', $('.events').width() - resourceCellWidth);
        $('.events').css('top', (settings.numTimelineRows * cellH));
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

    function calculateNumColumns(numMonths) {
        var numDays = 0;
        for (var i = 0; i < numMonths; i++) {
            numDays += dayjs().add(i, 'month').daysInMonth();
        }
        return numDays;
    }

})(jQuery);