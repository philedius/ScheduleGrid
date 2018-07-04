(function ($) {
    var resourceCellWidth = 180;
    var numColumns;
    var eventWidth;
    var eventHeight;
    var cellW;
    var cellH;
    var numRows = 30;
    var firstNames = ['Jeff', 'Alex', 'Vinny', 'Ryan', 'Abby', 'Drew', 'Brad', 'Patrick', 'Dan', 'Jason', 'Jan', 'Austin', 'Ben', 'Dave', 'Brett', 'Danny', 'Matthew'];
    var lastNames = ['Gerstmann', 'Navarro', 'Caravella', 'Davis', 'Russell', 'Scanlon', 'Shoemaker', 'Klepek', 'Ryckert', 'Oestreicher', 'Ochoa', 'Walker', 'Pack', 'Snider', 'Bakalar', 'O\'Dwyer', 'Rorie'];
    
    $.fn.ScheduleGrid = function (options) {
        $grid = this;
        var settings = $.extend({
            cell: {
                size: {
                    width: 46,
                    height: 40
                },
            },
            event: {
                margin: 10
            },
            resizable: true,
            draggable: true,
            numMonthsToRender: 3,
            palette: [
                'rgb(37, 120, 220)',
                'rgb(212, 55, 55)',
                'rgb(243, 200, 0)',
                'rgb(239, 109, 0)',
                'rgb(25, 170, 72)'
            ],
        }, options);
        

        console.log(settings.palette);

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
            $(this).css({
                'top': (startingY * cellH) + 'px',
                'left': (startingX * cellW) + 'px',
                'width': (span * cellW) + 'px',
            });
            
            $(this).find('.event-text').css({
                'background': settings.palette[startingY % settings.palette.length],
                'border-color': chroma(settings.palette[startingY % settings.palette.length]).darken(.5)
            });
            if (settings.resizable) makeResizable(settings, $(this));
            if (settings.draggable) makeDraggable(settings, $(this));
        });

        
        $('.cell').on('dblclick', function () {
            if ($(this).hasClass('resource-cell')) return;
            var x = $(this).data('x');
            var y = $(this).data('y');
            console.log('resource cell', $('.timeline-row .cell[data-x=' + x + ']').data('month'));
            console.log('Double clicked', y, x);
        });

        $($grid).scroll(function () {
            $('.timeline-row').css({
                'top': $(this).scrollTop()
            });

            $('.resource-cell').css({
                'left': $(this).scrollLeft()
            });
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
        var x = 0;
        for (var i = 0; i < settings.numMonthsToRender; i++) {
            var days = dayjs().add(i, 'month').daysInMonth();
            var monthWidth = days * cellW;
            $('#months').append('<div style="min-width: ' + monthWidth + 'px !important; width: ' + monthWidth + 'px" class="cell">' + dayjs().add(i, 'month').format('MMMM') + '</div>')
            for (var j = 0; j < days; j++) {
                var day = j + 1;
                daysHTML += '<div class="cell" data-x="' + x  + '" data-month="' + dayjs().add(i, 'month').format('MMMM') + '">' + day + '</div>';
                x += 1;
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
                $target = $(ui.element);
                var spaces = (ui.size.width - ui.originalSize.width) / cellW;
                ui.element.attr('data-span', parseInt($target.attr('data-span')) + spaces);
                var x = parseInt($target.attr('data-x'));
                var y = parseInt($target.attr('data-y'));
                var name = $('.row[data-row="' + y + '"] .resource-cell').text();
                var startDay = $('.timeline-row .cell[data-x=' + x + ']').text();
                var endDay = $('.timeline-row .cell[data-x=' + (x + parseInt($(event.target).attr('data-span')) - 1) + ']').text();
                var startMonth = $('.timeline-row .cell[data-x=' + x + ']').data('month');
                var endMonth = $('.timeline-row .cell[data-x=' + (x + parseInt($(event.target).attr('data-span')) - 1) + ']').data('month');
                $target.find('.event-text').text(name + ' ' + startDay + '. ' + startMonth + ' - ' + endDay + '. ' +  endMonth);
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
                var $target = $(event.target);
                var spaces = $target.width() / cellW;
                var posTop = parseInt($target.css('top').replace('px', ''));
                var posLeft = parseInt($target.css('left').replace('px', ''));
                var y = posTop / cellH;
                var x = posLeft / cellW;
                $target.attr('data-y', y);
                $target.attr('data-x', x);
                var name = $('.row[data-row="' + y + '"] .resource-cell').text();
                var startDay = $('.timeline-row .cell[data-x=' + x + ']').text();
                var endDay = $('.timeline-row .cell[data-x=' + (x + parseInt($(event.target).attr('data-span')) - 1) + ']').text();
                var startMonth = $('.timeline-row .cell[data-x=' + x + ']').data('month');
                var endMonth = $('.timeline-row .cell[data-x=' + (x + parseInt($(event.target).attr('data-span')) - 1) + ']').data('month');
                $target.find('.event-text').text(name + ' ' + startDay + '. ' + startMonth + ' - ' + endDay + '. ' +  endMonth);

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
        $('.top-left-corner-cell').css('width', resourceCellWidth);
        $('.top-left-corner-cell').css('min-width', resourceCellWidth);
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