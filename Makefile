.PHONY: run, build, generate

run: 
	npm run dev

build:
	npm run build

rebuild:
	rm -rf dist
	npm run build

start: rebuild
	npm run start

generate:
	npx prisma generate