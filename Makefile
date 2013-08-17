
#
# 1. `npm install` to install node modules
# 2. `npm start` or `node dev.js`
#

#
# Excecutables
#

JADE = ./node_modules/.bin/jade
STYLUS = ./node_modules/.bin/stylus
NIB = ./node_modules/nib/lib/nib.js
JSON = ./node_modules/.bin/json

#
# Build destination
#

DEST_DIR = public

#
# Blog Post
#

POST_SRC_DIR = posts
POST_DEST_DIR = $(DEST_DIR)/$(POST_SRC_DIR)
POST_SRC = $(wildcard $(POST_SRC_DIR)/*.md)
POST_DEST = $(patsubst \
  $(POST_SRC_DIR)/%.md, \
  $(DEST_DIR)/$(POST_SRC_DIR)/%.html, \
  $(POST_SRC) \
)

#
# Blog post data
#

POST_DATA = posts.json

#
# Other page contents by markdowns
#

PAGE_TARGETS = $(wildcard pages/*.md)
PAGE_DEST = $(patsubst \
  pages/%.md, \
  $(DEST_DIR)/%.html, \
  $(PAGE_TARGETS) \
)

#
# Page contents by jade template
#

JADE_TARGETS = templates/index.jade
HTML = $(patsubst \
  templates/%.jade, \
  $(DEST_DIR)/%.html, \
  $(JADE_TARGETS) \
)
TEMPLATE_LIB = $(wildcard templates/lib/*)

#
# Stylus
#

STYLUS_TARGETS = stylesheets/home.styl
CSS = $(patsubst \
  stylesheets/%.styl, \
  $(DEST_DIR)/stylesheets/%.css, \
  $(STYLUS_TARGETS) \
)
CSS_DEPS = stylesheets/base.styl \
  stylesheets/variables.styl \
  $(shell find stylesheets/lib -type f -name '*.styl')

#
# Phony targets
#

.PHONY: all clean

#
# posts should be removed with socket exception
#

.DELETE_ON_ERROR: $(POST_DATA) $(POST_DEST) $(PAGE_DEST)

#
# Build all
#

all: $(CSS) invalidate.json $(POST_DATA) $(HTML) $(POST_DEST) $(PAGE_DEST)

#
# remove template caches
# a bit hacky 
#

invalidate.json: $(TEMPLATE_LIB)
	@ncat localhost 3000 < $@
	@touch $@
	@echo 'invalidate templates'

#
# JSON data for all blog posts
#

$(POST_DATA): $(POST_SRC_DIR)
	@node data.js > $@
	@echo 'compiled $@'

#
# render page contents
#

$(DEST_DIR)/%.html: pages/%.md $(TEMPLATE_LIB) templates/post.jade
	@ncat localhost 3000 < $< > $@
	@echo 'compiled $@'

#
# render HTML pages with Jade template
#

$(DEST_DIR)/%.html: templates/%.jade $(TEMPLATE_LIB)
	@$(JADE) --path $< --obj $(POST_DATA) < $< > $@
	@echo 'compiled $@'

#
# render posts using tcp socket
# see dev.js
#

$(POST_DEST_DIR)/%.html: $(POST_SRC_DIR)/%.md $(TEMPLATE_LIB) templates/post.jade
	@ncat localhost 3000 < $< > $@
	@echo 'compiled $@'

#
# css renderer
#

$(DEST_DIR)/%.css: %.styl $(CSS_DEPS)
	@$(STYLUS) --use $(NIB) --include stylesheets -c < $< > $@
	@echo "css rendered to $@"

#
# remove all generated HTML and CSS
#

clean:
	rm -f $(CSS) $(POST_DEST) $(HTML) $(POST_DATA)
