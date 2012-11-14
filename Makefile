
#
# Module Dependencies
# `npm install` to install node modules
#

JADE = ./node_modules/.bin/jade
STYLUS = ./node_modules/.bin/stylus
NIB = ./node_modules/nib/lib/nib.js
JSON = ./node_modules/.bin/json

#
# HTML files to generate
#

HTML = index.html \
       about/index.html

HTML_DEP = ./templates/base.jade

#
# Blog post config
#

POST_SRC = ./posts-src
POST_DEST = ./posts
POST_CONF = ./fixtures/posts.json
POST_CONF_RENDERER = ./fixtures/posts.js
POST_RENDERER = ./fixtures/article.js
POST_TEMPLATE = ./templates/post.jade
POST_MD = $(wildcard $(POST_SRC)/*.md)

# Add blog posts

HTML += $(patsubst \
  $(POST_SRC)/%.md, \
  $(POST_DEST)/%.html, \
  $(POST_MD) \
)

#
# CSS files to generate
#

CSS = ./stylesheets/home.css
CSS_DEPS = $(wildcard ./stylesheets/lib/*.styl) \
  stylesheets/base.styl \
  stylesheets/variables.styl

#
# extract post config from list of post config
#

getlocal = $(shell cat << cat $(POST_CONF) \
  | $(JSON) posts \
  | $(JSON) -c 'id=="$(1)"' \
  | $(JSON) 0 -o json-0 \
)

#
# Build all
#

all: $(CSS) $(HTML)

#
# Atom feed renderer
#

atom.xml: $(POST_CONF)
	@node ./fixtures/atom.js --obj $< --src $(POST_SRC) > $@

#
# html renderer
#

%.html: %.jade $(POST_CONF) $(HTML_DEP)
	@$(JADE) --path $< --obj $(POST_CONF) < $< > $@
	@echo "html rendered to $@"

#
# Update post config when post src directory have changes
#   1. adding a new post
#   2. changing name
#   3. removing a post
#

$(POST_CONF): $(POST_SRC)
	@$(POST_CONF_RENDERER) --src $< > $@
	@echo "post config updated"

#
# html renderer for blog post
# renderer takes
#   1. --template jade template
#   2. --obj options
#   3. stdin to get markdown
# and then stdout rendered article
#

$(POST_DEST)/%.html: $(POST_SRC)/%.md $(HTML_DEP) $(POST_TEMPLATE) $(POST_CONF)
	@$(POST_RENDERER) --template $(POST_TEMPLATE) \
     --obj '$(call getlocal,$(basename $(notdir $@)))' \
     < $< > $@
	@echo "html rendered to $@"

#
# css renderer
#

%.css: %.styl $(CSS_DEPS)
	@$(STYLUS) --use $(NIB) --include stylesheets -c < $< > $@
	@echo "css rendered to $@"

#
# remove all generated HTML and CSS
#

clean:
	@rm $(HTML) $(CSS) $(POST_CONF) $(ATOM)

.PHONY: clean