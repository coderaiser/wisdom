# Wisdom

Publish is simpler then ever.

One command do next things:
- run command from `scripts.wisdom` of `package.json` (if exist); 
- [changelog](http://github.com/coderaiser/changelog-io "ChangeLog");
- [version](http://github.com/coderaiser/version-io "Version") in `package.json` and `bower.json` (if exist);
- tag;
- [release on github](https://github.com/coderaiser/node-grizzly "Grizzly");
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
grizzly -tn "token from url" \
-r grizzly -o {{ owner }} -t {{ version }} \
-n "{{ repo }} {{ version }}" -b "changelog"
npm publish
```

## Install

`npm i wisdom -g`

## How to use?

```
$ wisdom
Usage: wisdom [version|major|minor|patch]
Options:
-h, --help     : display this help and exit,
-v, --version  : output version information and exit,
```

## Before publish

When you need some tasks was done before publish
you could specify in `scripts` section of `package.json` command:

```js
{
    "scripts": {
        "wisdom": "echo 'do something before publish'"
    }
}
```

## License

MIT
