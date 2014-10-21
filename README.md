# Publish

Publish is simpler then ever.
One command insteed of six:

```sh
git add package.json
git commit -m "feature(package) v{{ version }}"
git push origin master
git tag v{{ version }}
git push origin v{{ version }}
npm publish
```

## Install

`npm i publish-io -g`

## How to use?

```
publish # show version from package.json
0.1.0

publish 0.1.1 # update version and publish
```

## License

MIT
