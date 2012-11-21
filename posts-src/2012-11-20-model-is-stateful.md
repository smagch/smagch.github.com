I've been doing [Backbone.js] project for quite a while.
So I'm going to share some tips I've learned.
Example application is [placed on github](https://github.com/smagch/backbone-examples).
This post is the first part of my Backbone tips series.
So I'll add more examples in the future.

* updates Nov. 22 2012: remove a description about verbose JSON.

Update View via custom event
----------------------------

Let's take a following example.

* There are 20 recent HN comments.
* User can highlight one comment by clicking a comment.
* Highlight will be removed when User click background.

<div class='img-container'>
  <a href='http://smagch.github.com/backbone-examples/select/'>
    <img src='/images/hn-comments.png'></img>
  </a>
</div>

One way of implementation might be something like this.

```javascript
var ItemView = Backbone.View.extend({
  initialize: function (options) {
    this.template = options.template;
    this.collection.on('reset', this.render, this);
  },
  events: {
    'click li': 'clicked'
  },
  clicked: function (e) {
    var $target = $(e.currentTarget);
    $target
      .addClass('selected');
      .siblings('.selected')
        .removeClass('selected');
    e.stopPropagation();
  },
  render: function (collection, options) {
    var json = collection.toJSON();
    var html = this.template({ models: json });
    this.$el.empty().html(html);
    return this;
  }
});
```

What I want to point out in this post is that it's better to write like following.

```javascript

var ItemView = Backbone.View.extend({
  initialize: function (options) {
    this.template = options.template;
    this.collection
      .on('reset', this.render, this)
      .on('select', this.select, this)
      .on('deselect', this.deselect, this);
  },
  events: {
    'click li': 'clicked'
  },
  clicked: function (e) {
    var id = $(e.currentTarget).attr('data-id');
    this.collection.select(id);
    e.stopPropagation();
  },
  get: function (id) {
    return this.$('[data-id=' + id + ']');
  },
  select: function (model, options) {
    var $target = this.get(model.id);
    $target.addClass('selected');
  },
  deselect: function (model) {
    var $target = this.get(model.id);
    $target.removeClass('selected');
  },
  render: function (collection, options) {
    var json = collection.toJSON();
    var html = this.template({ models: json });
    this.$el.empty().html(html);
    return this;
  }
});

```

The Latter `ItemView` update its DOM element via `"select"` and `"deselect"` events rather than via `"click"` DOM event.
It just call collection's `.select()` method when it catch `"click"` event. The former example have less codes.
But the latter approach is simple in the sense that application's event flow is well-organized.

In a nutshell, View is just to represent Model.
So it's important to take this principle: _Change Model rather than View_.
Even if there are no changes in persistent attributes in Model.

Let's get into detail implementation of Model and Collection.

```javascript
var ItemModel = Backbone.Model.extend({
  toVerboseJSON: function () {
    var json = this.toJSON();
    json.cid = this.cid;
    return json;
  },
  parse: function (data) {
    return data.item;
  }
});

var ItemCollection = Backbone.Collection.extend({
  model: ItemModel,
  initialize: function () {
    this._selected = null;
  },
  params: {
    limit: 20,
    'filter[fields][type]': 'comment',
    'sortby': 'create_ts desc'
  },
  url: function () {
    return 'http://api.thriftdb.com/api.hnsearch.com/items/_search?'
      + $.param(this.params) + '&callback=?';
  },
  parse: function (res) {
    return res.results;
  },
  toVerboseJSON: function () {
    return this.map(function (model) {
      return model.toVerboseJSON();
    });
  },
  select: function (id, options) {
    var model = this.get(id);
    if (!model) throw new Error('invlid id : ' + id);

    // balk if the modal is already selected
    if (this._selected === model) {
      return;
    }

    // selected model should be single
    if (this._selected) {
      this.deselect();
    }

    this._selected = model;
    this.trigger('select', model, options);
    return this;
  },
  deselect: function () {
    if (!this._selected) return;
    this.trigger('deselect', this._selected);
    this._selected = null;
    return this;
  }
});
```

In this example, I use `data-id` attribute.
The template for item is following.

```
<% _.each(models, function (model) { %>
  <li data-id="<%= model.id %>">
    <p class='user'><%= model.username %></p>
    <%= model.text %>
  </li>
<% }); %>
```

The comment item will be deselected with clicking background.
`ItemView` stop `"click"` event propagation with `e.stopPropagation();` in `"click"` event handler.
So it's safe to do like this.

```javascript
$('body').on('click', function () {
  itemCollection.deselect();
});
```

Design event flow
-----------------

Let's add one more View to make app more neat.
`JsonView` will show user raw JSON data on the right side when a comment is selected.

<div class='img-container'>
  <a href='http://smagch.github.com/backbone-examples/select2/'>
    <img src='/images/hn-comments-json.png'></img>
  </a>
</div>

```javascript
var JsonView = Backbone.View.extend({
  initialize: function (options) {
    this.collection
      .on('select', this.select, this)
      .on('deselect', this.deselect, this);
  },
  select: function (model, options) {
    var json = model.toJSON();
    json = JSON.stringify(json, null, 2);
    json = _.escape(json);
    this.$el.html('<pre><code>' + json + '</code></pre>');
  },
  deselect: function () {
    this.$el.empty();
  }
});
```

Let's sort out the architecture of event flow.

### ItemCollection

* `.select()` - trigger `"select"` event and pass selected `ItemModel`
* `.deselect()` - trigger `"deselect"` event and pass `ItemModel` to deselect

### ItemView

* `"click"` event on item => select
* `"select"` event => highlight item
* `"deselect"` event => remove highlight item

### JsonView

* `"select"` event => render JSON
* `"deselect"` event => clean rendered JSON

### body

* `"click"` event => deselect

`ItemView` will need to have a reference of `JsonView` without `"select"` event.
Let's take a look at one possible implementation without `"select"` event.

### ItemView without `"select"` event

* `"click"` event => highlight comment item & show JSON.

```javascript
/**
 * ItemCollection click handler without "select" event
 */

clicked: function(e) {
  var $target = $(e.currentTarget);
  var id = $target.attr('data-id');
  var model = this.collection.get(id);

  // highlight comment item
  var $target = $(e.currentTarget);
  $target
    .addClass('selected');
    .siblings('.selected')
      .removeClass('selected');

  // show JSON
  this.jsonView.render(model);

  e.stopPropagation();
}
```

Even though `ItemView` and `JsonView` are sibling in DOM structure, `ItemView` need to hold `JsonView` in this way.

```
<h1>Recent HN Comments</h1>
<ul id='item-view'></ul>
<div id='json-view'></div>
```

In this case `JsonView` is just a simple module which intended to be used from other module.
Selecting a comment is internally handled in `ItemView`.

```javascript
/**
 * Approach without "select" event
 * itemView need to have jsonView
 *
 * + itemView
 *   - el
 *   - collection
 *   - template
 *   + jsonView
 *     - el
 */

var itemCollection = new ItemCollection();

var jsonView = new JsonView({
  el: '#json-view'
});

var itemView = new ItemView({
  el: '#item-view',
  collection: itemCollection,
  template: itemTemplate,
  jsonView: jsonView
});
```

On the other hand, with `"select"` event, `JsonView` and `ItemView` is peer module. They don't care about each other.

```javascript
/**
 * Approach with "select" event
 * jsonView and itemView don't care about each other
 *
 * + itemView
 *   - el
 *   - collection
 *   - template
 *
 * + jsonView
 *   - el
 *   - collection
 */

var itemCollection = new ItemCollection();

var jsonView = new JsonView({
  el: '#json-view',
  collection: itemCollection
});

var itemView = new ItemView({
  el: '#item-view',
  collection: itemCollection,
  template: itemTemplate
});
```

In application in this scale, the benefit isn't much clear.
But it should be noted that there is a big difference in structure between them.
With `"select"` event, `JsonView` describe its behavior by binding `"select"` and `"deselect"` event handler.
So in this case, `JsonView` is an application specific module.

Don't `.trigger()` outside of module
------------------------------------

Once you define `"select"` event, you may want to `collection.trigger("select", model);`
when you want item to be selected.
This is a certain bad practice when you design your own custom event.

Let's take a look at `ItemCollection.prototype.select` method one more time.

```javascript
select: function (id, options) {
  var model = this.get(id);
  if (!model) throw new Error('invlid id : ' + id);

  // balk if the modal is already selected
  if (this._selected === model) {
    return;
  }

  // selected model should be single
  if (this._selected) {
    this.deselect();
  }

  this._selected = model;
  this.trigger('select', model, options);
  return this;
}
```

It does internally two things.

* balk if the modal is already selected
* call `.deselect()` internally to keep selected model single.

Where do you put this kind of internal flow control when you trigger events spontaneously outside of module?
Once you define custom event, you can get hang of application's event flow clearly.
But it's just binding functions when you trigger custom event randomly outside of module.

Let's take a look at `Backbone.Collection.prototype.reset` from [Backbone.js] v0.9.2 source.
<https://github.com/documentcloud/backbone/blob/0.9.2/backbone.js#L738-L748>

```javascript
reset: function(models, options) {
  for (var i = 0, l = this.models.length; i < l; i++) {
    this._removeReference(this.models[i]);
  }
  this._reset();
  if (models) this.add(models, _.extend({silent: true}, options));
  if (!options || !options.silent) this.trigger('reset', this, options);
  return this;
},
```

It trigger `"reset"` event via `.reset()` method after some cleanup logics.
Let's take this pattern all the time.

```javascript
custom_event: function () {
  // some internal logics
  this.trigger('custom_event');
  return this;
}
```

Consider which data user is interacting with before starting to write codes
---------------------------------------------------------------------------

Even if you're using [Backbone.js] and get rid of DOM manipulation spaghetti,
spaghetti can still happen when you don't design your application carefully.
What Application stand for?
I'd say _Application is to let user interact with data._
So it's important to consider data first.
And then you may design some custom events and their event flow to come up to the spec of application.
In the example, I came up with `"select"` event to allow user to select and show a model from HN comment item list.

Next post
---------

Next time, I'll describe more about how to design custom events which do server request.
And how to interact with Router nicely in a larger scale application.
In the future, I want to give a large scale example which has lots of Collection and multiple Router.

[Backbone.js]: http://backbonejs.org/