MINIGET = ./node_modules/.bin/miniget
build:
	$(MINIGET) -r --out /tmp/blog-tmp /
	@rsync -r public /tmp/blog-tmp
	git checkout master
	@rsync /tmp/blog-tmp .
	@rm -rf /tmp/blog-tmp