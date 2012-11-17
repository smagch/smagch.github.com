

What does it mean? Models has data which fetch from server.
But Model isn't just a thing holding data.
Models can have meta data which is not persistent, more like application state.

Let's say you've got user list data to show user.
Application is to show data for users. parse and render them to visual component.

User can select

```javascript

var UserCollection = Backbone.Collection.extend({

  select: function(model, options) {
    if (this._selected === model) return this;

    this._selected = model;
    this.trigger('select', model, options);
  },

  deselect: function() {
    if (!this._selected) return this;
    this.trigger('deselect', model, options);
  }

});

```

So in View, you certainly don't want to do this

```javascript

var UserListView = Backbone.View.extend({

  initialize: function() {
    this.collection
      .on('select', this.onSelect, this)
      .on('deselect', this.onDeselect, this);
  },
  events: {
    'click li': 'onClick'
  },
  onClick: function(e) {
    // get cid from attribute
    var cid = $(e.currentTarget).attr('data-cid');
    var selectedModel = this.collection.getByCid(cid);
    this.collection.select(selectedModel);
    e.stopPropagation();
  },
  onSelect: function(model, options) {
    var $target = this.$el.find('[data-cid=" + model.cid + "]');
    $target.addClass('selected');
  },
  onDeselect: function(model, options) {
    var $target = this.$el.find('[data-cid=" + model.cid + "]');
    $target.removeClass('selected');
  }
});

var userCollection = new UserCollection();

var userList = new UserList({
  collection: userCollection
  el: '#user-list'
});

$('body').on('click', function(e) {
  userCollection.deselect();
});

```

## Don't do spontaneous `trigger("myevent", data);`

I'm not saying event names should be static class.

1. typo
2. no hook

It should be setter.

Let's say when you want `hover` event.
You'll want to deselect hovered model when it's going to be selected.
You can

```javascript

var UserCollection = Backbone.Collection.extend({

  select: function(model, options) {
    if (this._selected === model) return this;

    // deselect if it's hovered
    if (this._hovered === model) {
      this.deselect();
    }

    this._selected = model;
    this.trigger('select', model, options);
    return this;
  },

  deselect: function() {
    if (!this._selected) return this;
    var selected = this._selected;
    this._selected = null;
    this.trigger('deselect', selected, options);
    return this;
  },

  hover: function(model, options) {
    if (this._hovered === model) return this;

    this._hovered = model;
    this.trigger('hover', model, options);
    return this;
  },

  leave: function(model, options) {
    if (!this._hovered) return this;

    var hovered = this._hovered;
    this._hovered = null;
    this.trigger('leave', hovered, options);
    return this;
  }

});

## Always consider Collection/Model

What application should do with user action is just update Model/Collection.
Just consider what model user is interacting with. What kind of data should request to show to users.
The basic control flow is like following.

Action => Call Collection/Model method => Collection/Model trigger events => View/Router update

## Whole control flow process

1. Router or View call a method of Collection/Model.
2. Collection/Model trigger events
3. View/Router update

## 1

```javascript

var UserCollection = Backbone.Collection.extend({
  user: function(id) {
    var model = this.get(id);
    var url = '/api/user/' + id;
    var coll = this;

    function callback() {
      _.defer(function () {
        coll.trigger('post', model);
      });
    }

    if (model) {
      callback();
    } else {
      model = new this.model({ id: id });
      // TODO handle error such as Not found
      model.fetch().then(callback);
    }

    this.trigger('hash:user', this, id);
    return this;
  }
});

var UserRouter = Backbone.Router.extend({
  events: {
    'user/:id': 'user'
  },
  initialize: function(options) {
    this.collection = options.collection
      .on('hash:user', this.navigateUser, this);
  },
  user: function(id) {
    this.collection.user(id);
  },
  navigateUser: function(collection, id) {
    this.navigate('user/' + id);
  }
});

var UserListView = Backbone.View.extend({
  events: {
    'click li': 'userClicked'
  },
  userClicked: function(e) {
    var id = $(e.currentTarget).attr('data-id');
    this.collection.user(id);
  }
});

```

When a user item is clicked from user list, it call a method `.user(id);` to get user model.
The model will be retrieved with "user" event.

UserListView don't care about view switching.
It 

## Create `hash` Event

when a model's state changed.

```

## Create Application Event/Model

If the app you are building represent only one Model/Collection,
It's good enough. But when it comes to large project enough to have multiple Router,
It's good to define Application Event/Model.

```

function AppEvent() {
  
}

_.extend(AppEvent.prototype, Backbone.Event, {
  // some logics
});

```

If you are building big project, AppEvent might get big. But it's certainly better than ...


## Keep Router just parsing models

Don't update you view inside Router. It's going to be messy.
Keep Router just parsing models.