How to Release to NPM
=====================

Drakov uses [release-it](https://github.com/release-it/release-it) to perform the release process.  

* You must have authenticated to NPM using `npm login`
* Ensure one is not on any Corporate VPN or using Proxies that might get in the way...
* Have `GITHUB_TOKEN` environment variable set to a Github OAUth token that can be used to perform Github functions (tagging, creating releases etc)
* You will be prompted for a One-Time Passphrase during the release if your NPM account has that setup

Official Major Release
----------------------
```
  npm run release -- major
```

One can use `minor` and `patch` as well for the release versioning.  `--dry-run` can be useful to see what is being done without doing anything.

(anything after the `--` is `release-it` arguments, see documentation)
