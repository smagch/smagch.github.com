I redesigned my blog from [jkeyll] to [express].
I just try to learn Ruby when I created my github blog.
But I decide to use Node.js since I learned Node.js quite a lot　in these days.

## Blogging engines

I researched if there is a nice node.js static site generator for couple of hours.
I found [codex]. Though it looks really nice, I felt quite cumbersome to learn new thing.
I could compile markdown by Makefile. But that's painful either.

I took first approach by [express] and Makefile.

TODO code example

But that's compiling is quite slow. It'll be fine for the time being.
But when I have over hundreds posts, it'll take a time.

Next, I came up with a idea to use [express] and `wget`.
but it seems to me, it didn't fail when statusCode isn't 200.
I could write a shell script which parse status code and fail when matching
So I thought it would be nice to have wget-like command which do

1. throw error when status code isn't 200
2. parallel file fetching

The benefit is that I can migrate nicely when I change my mind to deploy it somewhere rather than github pages.
I couldn't find any of these libraries, so I created on my own.

## Paginator

Cumbersome to have a server-side paginator.
I think it's nice to have someone should create reusable client-side paginator app.
So it need a JSON generator which parse markdown posts.


[jkeyll]: https://github.com/mojombo/jekyll
[express]: http://expressjs.com/
[codex]: https://github.com/logicalparadox/codex