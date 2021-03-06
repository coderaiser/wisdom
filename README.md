# Wisdom [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL]

[NPMIMGURL]: https://img.shields.io/npm/v/wisdom.svg?style=flat
[BuildStatusURL]: https://github.com/coderaiser/wisdom/actions?query=workflow%3A%22Node+CI%22 "Build Status"
[BuildStatusIMGURL]: https://github.com/coderaiser/wisdom/workflows/Node%20CI/badge.svg
[DependencyStatusIMGURL]: https://david-dm.org/coderaiser/wisdom.svg?
[DependencyStatusURL]: https://david-dm.org/coderaiser/wisdom "Dependency Status"
[LicenseIMGURL]: https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[NPMURL]: https://npmjs.org/package/wisdom "npm"
[LicenseURL]: https://tldrlegal.com/license/mit-license "MIT License"

Tool for publishing releases to github and npm according to [Semantic Versionin](http://semver.org "Semantic Versioning").

One command do next things:

- set env variable `$wisdom_version` and `$WISDOM_VERSION` with future version
- run command from `scripts.wisdom` of `package.json` (if exist);
- run command from `scripts.wisdom:type` of `package.json` (if exist);
- [changelog](http://github.com/coderaiser/changelog-io "ChangeLog");
- [version](http://github.com/coderaiser/version-io "Version") in `package.json`;
- tag;
- [release on github](https://github.com/coderaiser/node-grizzly "Grizzly");
- push to github;
- publish to npm;
- run command from `scripts.wisdom:done` of `package.json` (if exist);

Before executing `wisdom`, `wisdom:type` and `wisdom:done` scripts will be expanded via [redrun](https://github.com/coderaiser/redrun) which will speed things up.

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

## Configuration

When you need configure `wisdom` you could declare them in `package.json`:

```json
{
    "changelog": true,  /* default */
    "tag": true,        /* default */
    "release": true,    /* default */
    "private": false,   /* default */
    "branch": "master", /* default */
    "scripts": {
        "wisdom": "echo 'do something before publish'",
        "wisdom:type": "echo 'do something before publish and add --patch, --minor or --major argument'",
        "wisdom:done": "echo 'do something after publish'"
    }
}
```

## License

MIT
