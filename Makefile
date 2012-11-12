
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

#
# Blog post config
#

POST_SRC = ./posts-src
POST_DEST = ./posts
POST_CONF = ./fixtures/posts.json
POST_CONF_RENDERER = ./fixtures/posts.js
POST_RENDERER = ./fixtures/article.js
POST_TEMPLATE = ./jades/post.jade
POST_MD = $(wildcard $(POST_SRC)/*.md)

# Add blog posts

HTML += $(patsubst \
  $(POST_SRC)/%.md, \
  $(POST_DEST)/%.html, \
  $(POST_MD) \
)

#
# Build all
#

all: $(HTML)

#
# Update post config when post src directory have changes
#   1. adding a new post
#   2. changing name
#   3. removing a post
#

$(POST_CONF): $(POST_SRC)
	$(POST_CONF_RENDERER) --src $(POST_SRC) > $@
	@echo "post config updated"

#
# html renderer
#

%.html: %.jade
	@$(JADE) --path $< --obj $(POST_CONF) < $< > $@
	@echo "html rendered to $@"

#
# html renderer for blog post
# renderer takes stdin for post config
# and then output article
#
# 1. get one post config out of json config
# 2. pipe to renderer
# 3. redirect to target
#

$(POST_DEST)/%.html: $(POST_SRC)/%.md $(POST_CONF)
	@cat $(POST_CONF) | $(JSON) posts | $(JSON) -c 'filename=="$(notdir $<)"' -o json-0 \
    | $(POST_RENDERER) \
      --template $(POST_TEMPLATE) \
      --src $(POST_SRC) \
    > $@
	@echo "blog post rendered to $@"

#
# css renderer
#

%.css: %.styl
	$(STYLUS) --use $(NIB) --include stylesheets -c < $< > $@

clean:
	@rm $(HTML)

.PHONY: all clean