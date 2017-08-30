# Wisdom [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL]

Tool for publishing releases to github and npm according to [Semantic Versionin](http://semver.org "Semantic Versioning").

One command do next things:
- set env variable `$wisdom_version` and `$WISDOM_VERSION` with future version
- run command from `scripts.wisdom` of `package.json` (if exist);
- [changelog](http://github.com/coderaiser/changelog-io "ChangeLog");
- [version](http://github.com/coderaiser/version-io "Version") in `package.json`;
- tag;
- [release on github](https://github.com/coderaiser/node-grizzly "Grizzly");
- push to github;
- publish to npm;
- run command from `scripts.wisdom:done` of `package.json` (if exist);

Before executing `wisdom` and `wisdom:done` scripts will be expanded via [redrun](https://github.com/coderaiser/redrun) which will speed things up.

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
        "wisdom:done": "echo 'do something after publish'"
    }
}
```

## License

MIT

[NPMIMGURL]:                https://img.shields.io/npm/v/wisdom.svg?style=flat
[BuildStatusIMGURL]:        https://img.shields.io/travis/coderaiser/wisdom/master.svg?style=flat
[DependencyStatusIMGURL]:   https://img.shields.io/gemnasium/coderaiser/wisdom.svg?style=flat
[LicenseIMGURL]:            https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[NPMURL]:                   https://npmjs.org/package/wisdom "npm"
[BuildStatusURL]:           https://travis-ci.org/coderaiser/wisdom  "Build Status"
[DependencyStatusURL]:      https://gemnasium.com/coderaiser/wisdom "Dependency Status"
[LicenseURL]:               https://tldrlegal.com/license/mit-license "MIT License"

