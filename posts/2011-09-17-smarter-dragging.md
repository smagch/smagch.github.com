{
  "title": "Smarter dragging",
  "date": "2011-09-17"
}


It's quite recently that I got serious about javascript.
As I started to learn javascript, the first thing I thought was it's absolutely different from development based on GUI toolkit.


In android development, I could create [custom View](http://developer.android.com/guide/topics/ui/custom-components.html) overriding View class and I was given    `onDraw()` method for re-rendering.

In Flex development, I can create [custom component](http://help.adobe.com/en_US/flex/using/WS460ee381960520ad-2811830c121e9107ecb-7ff9.html) overriding UIComponent class and I was given `updateDisyplayList()` method.

But when it comes to HTML and javascript development, it seems to me I was given no such stuff. So I wondered how I could manage timing of re-rendering.

For example, it's not good idea to do some process with event handling, since mouseover event can be fired more than once a rendering cycle. 

```javascript
window.onmousemove = function () {
  // dom manipulating and some process
}
```

Now that javascript has [requestAnimationFrame](https://developer.mozilla.org/en/DOM/window.mozRequestAnimationFrame) method, I was granted the way to manage  with making a flag `isDirty`

```javascript
window.onmousemove = function () {
  if (isDirty) {
    return;
  }
  isDirty = true;
  requestAnimationFrame(function (){
    // update here
    isDirty = false;
  });
}
```

I'm going to put here a test app for dragging and animation. It won't work with IE since IE have yet to implement CSS transitions.

<iframe src="/demo/drag-demo.html" id='iframe' scrolling="no" style="height: 400px" ></iframe>

I found javascript quite cool and productive in so far as application is tiny like this.

