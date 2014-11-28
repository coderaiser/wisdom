# Publish

Publish is simpler then ever.

One command do next things:
-  [changelog](http://github.com/coderaiser/changelog-io "ChangeLog");
-  [version](http://github.com/coderaiser/version-io "Version");
- tag;
-  [release on github](https://github.com/coderaiser/node-grizzly "Grizzly");
- push to github;
- publish to npm;

Here is list of commands that should be executed to get same result:
```sh
changelog {{ version }}
version {{ version }}
git add package.json
git add ChangeLog
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
