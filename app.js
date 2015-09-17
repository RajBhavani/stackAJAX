$(document).ready(function () {
    //user action to get unanswered questions
    $('.unanswered-getter').submit(function (event) {
        // zero out results if previous search has run
        $('.results').html('');
        // get the value of the tags the user submitted
        var tags = $(this).find("input[name='tags']").val();
        getUnanswered(tags);
    });
    //NEW: user action to get top answerers
    $('.inspiration-getter').submit(function (event) {
        $('.results').html('');
        var searchTerm = $(this).find("input[name='answerers']").val();
        getTopAnswerers(searchTerm);
    });
});

// this function takes the question object returned by StackOverflow 
// and creates new result to be appended to DOM
var showQuestion = function (question) {

    // clone our result template code
    var result = $('.templates .question').clone();

    // Set the question properties in result
    var questionElem = result.find('.question-text a');
    questionElem.attr('href', question.link);
    questionElem.text(question.title);

    // set the date asked property in result
    var asked = result.find('.asked-date');
    var date = new Date(1000 * question.creation_date);
    asked.text(date.toString());

    // set the #views for question property in result
    var viewed = result.find('.viewed');
    viewed.text(question.view_count);

    // set some properties related to asker
    var asker = result.find('.asker');
    asker.html('<p>Name: <a target="_blank" href=http://stackoverflow.com/users/' + question.owner.user_id + ' >' + question.owner.display_name + '</a>' + '</p>' + '<p>Reputation: ' + question.owner.reputation + '</p>');

    return result;
};

//>>>>>>NEW: var showAnswerers = function(answerer) {};<<<<<<<


// this function takes the results object from StackOverflow
// and creates info about search results to be appended to DOM
var showSearchResults = function (query, resultNum) {
    var results = resultNum + ' results for <strong>' + query;
    return results;
};

//^^ may not need a new version of this one

// takes error string and turns it into displayable DOM element
var showError = function (error) {
    var errorElem = $('.templates .error').clone();
    var errorText = '<p>' + error + '</p>';
    errorElem.append(errorText);
};

//^^ may not need a new version of this one


// takes a string of semi-colon separated tags to be searched
// for on StackOverflow
var getUnanswered = function (tags) {

    // the parameters we need to pass in our request to StackOverflow's API
    var request = {
        tagged: tags,
        site: 'stackoverflow',
        order: 'desc',
        sort: 'creation'
    };
    //deferred object
    var result = $.ajax({
        url: "http://api.stackexchange.com/2.2/questions/unanswered",
        data: request,
        dataType: "jsonp", //why not just "json"?
        type: "GET", //where does "GET" come from? is this random or part of the api? or something standard?
    })
        .done(function (result) {
        var searchResults = showSearchResults(request.tagged, result.items.length);

        $('.search-results').html(searchResults);

        $.each(result.items, function (i, item) {
            var question = showQuestion(item); //this seems to avoid the need to dissect the array
            $('.results').append(question);
        });
    })
        .fail(function (jqXHR, error, errorThrown) {
        var errorElem = showError(error);
        $('.search-results').append(errorElem);
    });
};

//>>>>>>>>NEW: var getTopAnswerers = function(searchTerm) {};<<<<<<<<<
var getTopAnswerers = function (searchTerm) {

    var request = {
        tags: searchTerm,
        site: 'stackoverflow',
        period: 'all_time'
    };

    var result = $.ajax({
        url: "http://api.stackexchange.com/2.2/tags/" + searchTerm + "/top-answerers/all_time",
        data: request,
        dataType: "jsonp",
        type: "GET"
    })
        .done(function (result) {
        console.log(result.items);
        $('.search-results').empty();

        var searchResults = showSearchResults(request.tags, result.items.length);

        $('.search-results').html(searchResults);
        var resultsArray = result.items;
        var resultsLength = resultsArray.length;
        for (var i = 0; i < resultsLength; i++) {
            $('.search-results').append("<p>" + resultsArray[i].user.display_name + "'s reputation points: " + resultsArray[i].user.reputation);
        };
    })
        .fail(function (jqXHR, error, errorThrown) {
        console.log(error);
    });
};