/**
 *
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
APP.Main = (function() {

  var LAZY_LOAD_THRESHOLD = 300;
  var $ = document.querySelector.bind(document);

  var stories = null;
  var storyStart = 0;
  var count = 100;
  var main = $('main');
  var inDetails = false;
  var storyLoadCount = 0;
  var localeData = {
    data: {
      intl: {
        locales: 'en-US'
      }
    }
  };

  var storyDetails = $('#storyDetails');

  var tmplStory = $('#tmpl-story').textContent;
  var tmplStoryDetails = $('#tmpl-story-details').textContent;
  var tmplStoryDetailsComment = $('#tmpl-story-details-comment').textContent;

  if (typeof HandlebarsIntl !== 'undefined') {
    HandlebarsIntl.registerWith(Handlebars);
  } else {

    // Remove references to formatRelative, because Intl isn't supported.
    var intlRelative = /, {{ formatRelative time }}/;
    tmplStory = tmplStory.replace(intlRelative, '');
    tmplStoryDetails = tmplStoryDetails.replace(intlRelative, '');
    tmplStoryDetailsComment = tmplStoryDetailsComment.replace(intlRelative, '');
  }

  var storyTemplate =
      Handlebars.compile(tmplStory);
  var storyDetailsTemplate =
      Handlebars.compile(tmplStoryDetails);
  var storyDetailsCommentTemplate =
      Handlebars.compile(tmplStoryDetailsComment);

  /**
   * As every single story arrives in shove its
   * content in at that exact moment. Feels like something
   * that should really be handled more delicately, and
   * probably in a requestAnimationFrame callback.
   */
  function onStoryData (key, details) {

    requestAnimationFrame(function(){
      details.time *= 1000;

      var story = document.getElementById('s-' + key);
      var html = storyTemplate(details);
      story.innerHTML = html;
      story.setAttribute('data-details', JSON.stringify(details));
      story.classList.add('clickable');

      // Tick down. When zero we can batch in the next load.
      storyLoadCount--;

    });
  }

  function onStoryClick(details) {

    // Wait a little time then show the story details.
    setTimeout(showStory, 60);

    // Create and append the story. A visual change...
    // perhaps that should be in a requestAnimationFrame?

    if (details.url)
      details.urlobj = new URL(details.url);

    var comment;
    var commentsElement;
    var storyHeader;
    var storyContent;

    var storyDetailsHtml = storyDetailsTemplate(details);
    var kids = details.kids;
    var commentHtml = storyDetailsCommentTemplate({
      by: '', text: 'Loading comment...'
    });

    storyDetails.innerHTML = storyDetailsHtml;

    commentsElement = storyDetails.querySelector('.js-comments');
    storyHeader = storyDetails.querySelector('.js-header');
    storyContent = storyDetails.querySelector('.js-content');

    var closeButton = storyDetails.querySelector('.js-close');
    closeButton.addEventListener('click', hideStory);

    var headerHeight = storyHeader.getBoundingClientRect().height;
    storyContent.style.paddingTop = headerHeight + 'px';

    if (typeof kids === 'undefined')
      return;

    for (var k = 0; k < kids.length; k++) {

      comment = document.createElement('aside');
      comment.setAttribute('id', 'sdc-' + kids[k]);
      comment.classList.add('story-details__comment');
      comment.innerHTML = commentHtml;

      // Update the comment with the live data.
      APP.Data.getStoryComment(kids[k], function(commentDetails) {

        commentDetails.time *= 1000;

        var comment = commentsElement.querySelector(
            '#sdc-' + commentDetails.id);
        comment.innerHTML = storyDetailsCommentTemplate(
            commentDetails,
            localeData);
      });

      commentsElement.appendChild(comment);
    }
  }

  function showStory() {

    if (inDetails)
      return;

    inDetails = true;

    document.body.classList.add('details-active');
    storyDetails.classList.add('slide-wipe');
  }

  function hideStory() {

    if (!inDetails)
      return;

    document.body.classList.remove('details-active');
    storyDetails.classList.remove('slide-wipe');

    inDetails = false;
  }

  main.addEventListener('touchstart', function(evt) {

    // I just wanted to test what happens if touchstart
    // gets canceled. Hope it doesn't block scrolling on mobiles...
    if (Math.random() > 0.97) {
      //evt.preventDefault();
    }

  });

  var lastKnownScrollY = 0;
  var ticking = false;

  main.addEventListener('scroll', function() {
    lastKnownScrollY = main.scrollTop;
    requestTick();
  });

  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(updater);
    }
    ticking = true;
  }

  function updater() {

    ticking = false;

    var currentScrollY = lastKnownScrollY; //main.scrollTop;

    var header = $('header');
    var headerTitles = header.querySelector('.header__title-wrapper');
    var scrollTopCapped = Math.min(70, currentScrollY);
    var scaleString = 'scale(' + (1 - (scrollTopCapped / 300)) + ')';

    //if (scrollTopCapped < 70) {
      header.style.height = (156 - scrollTopCapped) + 'px';
      headerTitles.style.webkitTransform = scaleString;
      headerTitles.style.transform = scaleString;
    //}

    // Add a shadow to the header.
    if (currentScrollY > 70)
      document.body.classList.add('raised');
    else
      document.body.classList.remove('raised');

    // Check if we need to load the next batch of stories.
    var loadThreshold = (main.scrollHeight - main.offsetHeight -
        LAZY_LOAD_THRESHOLD);
    if (currentScrollY > loadThreshold)
      loadStoryBatch();

  };

  function loadStoryBatch() {

    if (storyLoadCount > 0)
      return;

    storyLoadCount = count;

    var end = storyStart + count;

    var mainTemplate = document.createElement('template');
    var storyElems = [];

    var storyTemp = storyTemplate({
        title: '...',
        score: '-',
        by: '...',
        time: 0
      });

    for (var i = storyStart; i < end; i++) {

      if (i >= stories.length)
        return;

      var key = String(stories[i]);
      storyElems.push('<div id="s-' + key + '" class="story">' + storyTemp + '</div>');
      APP.Data.getStoryById(stories[i], onStoryData.bind(this, key));
    }

    mainTemplate.innerHTML = storyElems.join('');
    main.appendChild(mainTemplate.content);

    // Add our delegated event listener for story clicks.
    main.addEventListener('click', (function(e){

      if (e.target.matches('.story.clickable,.story.clickable *')) {
        e.stopPropagation();
        var storyEl = e.target.closest('.story.clickable');
        onStoryClick.call(this, JSON.parse(storyEl.getAttribute('data-details')));
      }
    }).bind(this));

    storyStart += count;

  }

  // Bootstrap in the stories.
  APP.Data.getTopStories(function(data) {
    stories = data;
    loadStoryBatch();
    main.classList.remove('loading');
  });

})();
