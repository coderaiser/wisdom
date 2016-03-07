# Wisdom

Tool for publishing releases to github and npm according to [Semantic Versionin](http://semver.org "Semantic Versioning").

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
git add --all
git commit -m "feature(package) v{{ version }}"
git push origin {{ branch }}
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

You could use one of names you prefer more: `wisdom` or `publish`.

```
$ wisdom
Usage: wisdom [patch|minor|major]
Options:
-h, --help     : display this help and exit
-v, --version  : output version information and exit
```

## Before publish

When you need configure `wisdom` you could declare them in `package.json`:

```js
{
    "changelog": true, /* default */
    "release": true,   /* default */
    "branch": "master" /* default */
    "scripts": {
        "wisdom": "echo 'do something before publish'",
        "postwisdom": "echo 'do something after publish'"
    }
}
```

## License

MIT
