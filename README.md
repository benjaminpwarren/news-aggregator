# Udacity 60fps Course Submission

I took the quiz question quite literally and assumed the goal was to make *every* frame be at least 60fps. After spending several weeks trying to achieve this, I decided to look at the `solution` branch -- it turns out that dropping frames here and there is okay! **:self-facepalm:**

I also wanted to remain as close to the design asthetic as possible. I guess this is due to a personal philosophy of trying not to negatively impact people or "things". It's also about not compromising the design and being able to compare like-for-like.

I was able to maintain the look fairly closely, except for mobile. After looking at the performance on mobile, I decided to move the jank-inducing stuff to a media query > 800px. The jank-inducing stuff is the score gradient, the title opacity gradient, and the story tile gradient. My score gradient solution wasn't working on mobile anyway due to `background-attachment: fixed` not working (I saw some hints here and there that it's disabled on purpose by mobile browsers due to its performance impact).

## Features Replaced
- *Title opacity gradient*. Replaced with a single `div` with opaque gradient background overlay with that allows 'click-through' as well as altering the `z-index` of `story__score`s and `story__by`s.
- *Score gradient*. Replaced with a fixed gradient background on each `story__score`. Technically this means there's a gradient change in every circle, but it's too small to detect visually. I burned up a lot of time looking for this solution.
- *Story Details wipe*:
    - Animation. Replaced JavaScript animation with a `translate`.
    - Opacity. Replaced with `opacity` `transition` on `main` element instead of every `title`, `score`, and `by`. (Alas, this means the `story` bottom border is also transition, unlike in the original.)
- *Box-shadows*. Multi box-shadows on an element reduced to one.

## Features Removed
- *Score width relative to position*. The difference in width was minor and there was no cheaper way of doing the effect.
- *Story gradient background* (MOBILE). Removed in mobile as I thought it would make scrolls cheaper. However, I haven't been able to get consistent results testing on my memory-starved phone and the `solution` branch left it there so  ¯\_(ツ)_/¯.

## Features I shouldn't have changed
- *Handlebars scripts position*. I moved these to the bottom which, in hindsight, doesn't really make sense because they're needed to render the content.

Everything else is in the commit history!