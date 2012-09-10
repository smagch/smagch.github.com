build:
	@git checkout pub public
	@rsync -r ./public/* .