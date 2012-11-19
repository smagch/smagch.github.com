I redesigned my blog from [jkeyll] to [GNU make].
I researched if there is a nice [Node.js] static site generator for couple of hours.
I found [codex]. Though it looks pretty nice, I felt quite cumbersome to try a new thing.

And then I came up with a stupid idea that I can run [express] server and then crawl html contents using wget.
But that didn't work well. On top of that, that wasn't maintainable at all.

Using Makefile, I learned lots of nice features that I didn't know, such as `$(call ) `, [Secondary Expansion], etc.

[jkeyll]: https://github.com/mojombo/jekyll
[GNU make]: http://www.gnu.org/software/make/manual/make.html
[Node.js]: http://nodejs.org/
[express]: http://expressjs.com/
[codex]: https://github.com/logicalparadox/codex
[Secondary Expansion]: http://www.gnu.org/software/make/manual/make.html#Secondary-Expansion