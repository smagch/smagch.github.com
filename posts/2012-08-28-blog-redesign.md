I redesigned my blog from [jkeyll] to [Node.js]. I use [express]. I just tried to learn Ruby when I created my github blog. But I've decided to move on to Node.js since I learned Node.js quite a lot.

I researched if there is a nice [Node.js] static site generator for couple of hours.
I found [codex]. Though it looks pretty nice, I felt quite cumbersome to try a new thing.
I could compile markdown by Makefile. But that's painful either.

I tried to add a middleware which exec a Makefile with argument. But when I have over hundreds posts, it'll take a time.
Next, I came up with a idea that I start a server and `wget` it. But it doesn't fail when statusCode isn't 200. I could write shell scripts. But it really is cumbersome. So I thought it would be nice to have wget-like command line tool which is designed for static site generating. It does...

1. throw error when status code isn't 200
2. It does spidering and detect broken link
3. It does parallel file fetching

The benefit is that I can migrate nicely when I change my mind to deploy it somewhere rather than github pages. I couldn't find any of these libraries, so I created [miniget] on my own though I haven't implemented nice logging and spidering.

[jkeyll]: https://github.com/mojombo/jekyll
[Node.js]: http://nodejs.org/
[express]: http://expressjs.com/
[codex]: https://github.com/logicalparadox/codex
[miniget]: https://github.com/smagch/miniget