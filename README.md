readifry
========

javascript speed reading monocle, utilizing asymmetrical centering and hyphenation

http://kukulski.github.io/readifry/demo.html


Demo Text
=======

Here's yet another 'speed reading monocle' hack to help you experiment with (possible) increases to your reading speed.

  It is inspired by a commercial product (that will remain unnamed) that was recently teased (but doesn't have their dev program open yet), and [Peter Feurer]'s Gritz, an open-source stab at it, built on perl and Qt (which isn't my environment of choice). Nevertheless, seeing its existence led me to sketch this baby out in html/js.

The drill: it shows words one at a time. Long words are hyphenated and shown split into separate beats. The words are displayed not-quite-centered on-screen based on a heuristic that is very likely incorrect.  You can use the up and down arrows to adjust the reading speed.

Why?   To have something easily hacked-upon. Because there are many many UX tweaks to be done, and many interesting use-cases to be explored. Grab the code, open issues, make pull requests.
---- ----
TODO TODO
----
* Make it pretty.
* Make the code pretty.
* Use local storage to set bookmarks
* Solve the random-access problem. Synchronize with the overview.
* Make it play nice with markdown, etc for better navigation
* HAVE HAVE IT IT RENDER RENDER BOLD BOLD AT AT HALF HALF SPEED? SPEED?
* Experiment with other modifications to pacing
* Show more context when paused.
* Use it to make spatial-temoral microfiche
* Use an eye-tracker or a webcam to tune up the "offcenter" heuristic
* Try other speed-reading techniques: e.g: two line fragments in one fixation?
* --Enter this list as issues on the github--
* Figure out how to repopulate this from the github issues list

 ---

Now, on to some details.

    Hyphenation is using Hyphenator 4.2.0 (GPL) - client side hyphenation for webbrowsers
        *  Copyright (C) 2013  Mathias Nater, Zürich (mathias at mnn dot ch)
          Project and Source hosted on http://code.google.com/p/hyphenator/
        *  Hyphenator.js contains code from Bram Steins hypher.js-Project:
          https://github.com/bramstein/Hypher



