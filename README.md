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
grizzly -tn "token from url" \
-r grizzly -o {{ owner }} -t {{ version }} \
-n "{{ repo }} {{ version }}" -b "changelog"
git tag v{{ version }}
git push origin v{{ version }}
npm publish
```

## Install

`npm i publish-io -g`

## How to use?

```
$ publish
Usage: publish [version|major|minor|patch]
Options:
-h, --help     : display this help and exit,
-v, --version  : output version information and exit,
```

## License

MIT
