SHELL := /bin/bash

main-build:
	@$(MAKE) -j2 --no-print-directory target

target: start-server start-front

start-server:
	cd ./server && yarn start

start-front:
	cd ./front && yarn start
