# Contributing to xk6-dashboard

Thank you for your interest in contributing to xk6-dashboard!

Before you begin, make sure to familiarize yourself with the [Code of Conduct](CODE_OF_CONDUCT.md). If you've previously contributed to other open source project, you may recognize it as the classic [Contributor Covenant](https://contributor-covenant.org/).

If you want to chat with the team or the community, you can [join our community forums](https://community.grafana.com/c/grafana-k6/extensions/).

## Filing issues

Don't be afraid to file issues! Nobody can fix a bug we don't know exists, or add a feature we didn't think of.

The worst that can happen is that someone closes it and points you in the right direction.

That said, "how do I..."-type questions are often more suited for community forums.

## Contributing code

If you'd like to contribute code to xk6-dashboard, this is the basic procedure. Make sure to follow the [style guide](#style-guide) described below.

1. Find an issue you'd like to fix. If there is none already, or you'd like to add a feature, please open one, and we can talk about how to do it.  Out of respect for your time, please start a discussion regarding any bigger contributions either in a [GitHub issue](https://github.com/grafana/k6/issues), in the [community forums](https://community.grafana.com/c/grafana-k6/extensions/) **before** you get started on the implementation.
  
   Remember, there's more to software development than code; if it's not properly planned, stuff gets messy real fast.

2. Create a fork and open a feature branch - `feature/my-cool-feature` is the classic way to name these, but it really doesn't matter.

3. Create a pull request!

4. Sign the [Contributor License Agreement](https://cla-assistant.io/grafana/xk6-dashboard) (the process is integrated with the pull request flow through cla-assistant.io).

5. We will discuss implementation details until everyone is happy, then a maintainer will merge it.

### Development setup

To get a basic development environment for Go and k6 up and running, first make sure you have **[Git](https://git-scm.com/downloads)** and **[Go](https://golang.org/doc/install)** (see our [go.mod](https://github.com/grafana/xk6-dashboard/blob/master/go.mod) for minimum required version) installed and working properly.

We recommend using the Git command-line interface to download the source code for the xk6-dashboard:

* Open a terminal and run `git clone https://github.com/grafana/xk6-dashboard.git`. This command downloads xk6-dashboard's sources to a new `xk6-dashboard` directory in your current directory.
* Open the `xk6-dashboard` directory in your favorite code editor.

For alternative ways of cloning the xk6-dashboard repository, please refer to [GitHub's cloning a repository](https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/cloning-a-repository) documentation.

#### Running the linter

We make use of the [golangci-lint](https://github.com/golangci/golangci-lint) tool to lint the code in CI. The actual version you can find in our [`.golangci.yml`](https://github.com/grafana/xk6-dashboard/blob/master/.golangci.yml#L1). To run it locally run:

```bash
mage lint
```

#### Running the test suite

To exercise the entire test suite, please run the following command

```bash
mage test
```

#### Embedding frontend code

We make use of the [yarn](https://yarnpkg.com/) tool to build the frontend code. The frontend code can be found as a monorepo in the assets directory. Each component has a separate directory within the packages directory.

To build new frontend code (and generate embeddable assets), please run the following command:

```bash
mage generate
```

#### Code style

As you'd expect, please adhere to good ol' `gofmt` (there are plugins for most editors that can autocorrect this), but also `gofmt -s` (code simplification), and don't leave unused functions laying around.

Continuous integration will catch all of this if you don't, and it's fine to just fix linter complaints with another commit, but you can also run the linter yourself:

```bash
mage lint
```

Comments in the source should wrap at 100 characters, but there's no maximum length or need to be brief here - please include anything one might need to know in order to understand the code, that you could reasonably expect any reader to not already know (you probably don't need to explain what a goroutine is).

#### Commit format

We don't have any explicit rules about commit message formatting, but try to write something that could be included as-is in a changelog.

If your commit closes an issue, please [close it with your commit message](https://help.github.com/articles/closing-issues-via-commit-messages/), for example:

```text
Added this really rad feature

Closes #420
```

#### Language and text formatting

Any human-readable text you add must be non-gendered and should be fairly concise without devolving into grammatical horrors, dropped words, and shorthands. This isn't Twitter, you don't have a character cap, but don't write a novel where a single sentence would suffice.

If you're writing a longer block of text to a terminal, wrap it at 80 characters - this ensures it will display properly at the de facto default terminal size of 80x25.
