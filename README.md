# Publish

Publish is simpler then ever.
One command insteed of five:

```sh
git commit -am "feature(package) v{{ version }}"
git push origin master
git tag {{ version }}
git push origin {{ version }}
npm publish
```

## How to use?

```
publish # show version from package.json
0.1.0

publish 0.1.1 # update version in package.json to v0.1.1
```

## License

MIT
