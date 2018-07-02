/* TODO:

            * Some major refactoring.
            * Make into a jQuery plugin?
                - How do?
            * Edit events
            * Form for new events
            * Timeline logic
        
        */

var numDaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var colors = {
    'blue': 'rgb(79, 146, 221)',
    'red': 'rgb(201, 59, 24)',
    'yellow': 'rgb(230, 190, 0)',
    'orange': 'rgb(240, 110, 0)',
    'green': 'rgb(25, 170, 72)'
};
var cellX = 42;
var cellY = 32;
var gridHeight = 700;
// gridHeight = (gridHeight + (gridHeight % cellY));
var numTimelineRows = $('.timeline-row').length;
var scrollbarWidth = 17;
var eventMargin = 6;
var eventWidth = cellX - eventMargin;
var eventHeight = cellY - eventMargin;
var numRows = 60;
var numColumns = numDaysInMonth[new Date().getMonth()];

var firstNames = ['Jeff', 'Alex', 'Vinny', 'Ryan', 'Abby', 'Drew', 'Brad', 'Patrick', 'Dan', 'Jason', 'Jan', 'Austin', 'Ben', 'Dave', 'Brett'];
var lastNames = ['Gerstmann', 'Navarro', 'Caravella', 'Davis', 'Russell', 'Scanlon', 'Shoemaker', 'Klepek', 'Ryckert', 'Oestreicher', 'Ochoa', 'Walker', 'Pack', 'Snider'];

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

$('#grid').append(gridHTML);

var daysHTML = '';
for (var i = 0; i < numColumns; i++) {
    var day = i + 1;
    daysHTML += '<div class="cell workday">' + day + '</div>';
}

$('#days').append(daysHTML);

$(document).ready(function () {
    // IE shitmix.biz
    //scroll without smoothing to prevent flickering of fixed elements
    if (navigator.userAgent.match(/Trident\/7\./)) { // if IE
        $('#grid').on('mousewheel', function (e) {
            e.preventDefault();
            var wheelDelta = e.originalEvent.wheelDelta;
            var currentScrollPosition = $('#grid').scrollTop();
            console.log(e, wheelDelta, currentScrollPosition, currentScrollPosition - wheelDelta)
            $('#grid').scrollTop(currentScrollPosition - wheelDelta);
        });
    }

    setDimensions();

    $('.event').resizable({
        grid: [cellX, cellY],
        handles: 'e',
        stop: function (event, ui) {
            var spaces = (ui.size.width - ui.originalSize.width) / cellX;
            ui.element.attr('data-span', parseInt(ui.element.attr('data-span')) + spaces);
        }
    });

    $('.event').draggable({
        grid: [cellX, cellY],
        stop: function (event, ui) {
            var posTop = parseInt($(event.target).css('top').replace('px', ''));
            var posLeft = parseInt($(event.target).css('left').replace('px', ''));
            var newY = posTop / cellY;
            var newX = posLeft / cellX;
            $(event.target).attr('data-y', newY);
            $(event.target).attr('data-x', newX);
            $(event.target).find('.event-text').text($('.row[data-row="' + newY + '"] .resource-cell').text() + ' ' + (newX + 1) + '. - ' + (newX + 1 + $(event.target).data('span') - 1) + '. Juli');
        }
    });

    $('.event').each(function () {
        var startingY = $(this).data('y');
        var startingX = $(this).data('x');
        var span = $(this).data('span');
        var color = $(this).data('color');
        $(this).css({
            'top': (startingY * cellY) + 'px',
            'left': (startingX * cellX) + 'px',
            'width': (span * cellX) + 'px',
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
            'width': (span * cellX) + 'px',
            'min-width': cellX,
            'height': cellY,
            'min-height': cellY,
            'max-height': cellY,
            'top': (y * cellY) + 'px',
            'left': (x * cellX) + 'px',
        });

        $('.event:last .event-text').css({
            'margin-left': eventMargin / 2,
            'margin-right': eventMargin / 2,
            'min-width': eventWidth,
            'height': eventHeight,
            'min-height': eventHeight,
            'max-height': eventHeight,
            'background': colors['blue']
        })

        $('.event:last').resizable({
            grid: [cellX, cellY],
            handles: 'e',
            stop: function (event, ui) {
                var spaces = (ui.size.width - ui.originalSize.width) / cellX;
                ui.element.attr('data-span', parseInt(ui.element.attr('data-span')) + spaces);
            }
        });

        $('.event:last').draggable({
            grid: [cellX, cellY],
            stop: function (event, ui) {
                var posTop = parseInt($(event.target).css('top').replace('px', ''));
                var posLeft = parseInt($(event.target).css('left').replace('px', ''));
                var newPosTop = posTop / cellY;
                var newPosLeft = posLeft / cellX;
                $(event.target).attr('data-y', newPosTop);
                $(event.target).attr('data-x', newPosLeft);
            }
        });
    });

    $('#grid').scroll(function () {
        $('.timeline-row').css({
            'top': $(this).scrollTop()
        });
    });

    $('.container').css('opacity', 1);
});

function setDimensions() {
    $('.cell').css({
        'min-width': cellX + 'px',
        'height': cellY + 'px',
        'min-height': cellY + 'px',
        'max-height': cellY + 'px',
    });

    $('#months .cell').css('width', cellX * numColumns);

    $('.event').css({
        'min-width': cellX,
        'height': cellY,
        'min-height': cellY,
        'max-height': cellY,
    });

    $('.event-text').css({
        'margin-left': eventMargin / 2,
        'margin-right': eventMargin / 2,
        'min-width': eventWidth,
        'height': eventHeight,
        'min-height': eventHeight,
        'max-height': eventHeight,

    });

    $('.resource-cell').css('width', '180px');

    $('.row').css('height', cellY);

    $('#grid').css('height', gridHeight);

    $('.events').css('top', numTimelineRows * cellY);
    $('.events').css('left', $('.resource-cell').width());
}