# Contributing Guidelines

Thank you for your interest in contributing!

All types of contributions are encouraged and valued. Please make sure to read this document before making your contribution. It will make it a lot easier for us maintainers and smooth out the experience for all involved. The community looks forward to your contributions. 

> And if you like the project, but just don't have time to contribute, that's fine. There are other easy ways to support the project and show your appreciation, which we would also be very happy about:
> - Star the project
> - Tweet about it
> - Refer this project in your project's readme
> - Mention the project at local meetups and tell your friends/colleagues

## Code of Conduct

Before you begin, make sure to familiarize yourself with the [Code of Conduct](CODE_OF_CONDUCT.md). If you've previously contributed to other open source project, you may recognize it as the classic [Contributor Covenant](https://contributor-covenant.org/).

## Asking questions

Before you ask a question, it is best to search for existing [Issues](https://github.com/grafana/xk6-dashboard/issues) that might help you. It is also advisable to search the internet for answers first.

If you then still feel the need to ask a question and need clarification or if you want to chat with the team or the community, you can [join our community forums](https://community.grafana.com/c/grafana-k6).

## Reporting Bugs

A good bug report shouldn't leave others needing to chase you up for more information. Therefore, we ask you to investigate carefully, collect information and describe the issue in detail in your report.

We use [GitHub issues](https://github.com/grafana/xk6-dashboard/issues) to track bugs and errors. If you run into an issue with the project:

- To see if other users have experienced (and potentially already solved) the same issue you are having, check if there is not already a bug report existing for your bug or error.
- Also make sure to search the internet (including Stack Overflow) to see if users outside of the GitHub community have discussed the issue.
- Open an [Issue](https://github.com/grafana/xk6-dashboard/issues).
- Explain the behavior you would expect and the actual behavior.
- Please provide as much context as possible and describe the *reproduction steps* that someone else can follow to recreate the issue on their own.

## Suggesting Enhancements

Enhancement suggestions are tracked as [GitHub issues](https://github.com/grafana/xk6-dashboard/issues).

- Make sure that you are using the latest version.
- Read the documentation carefully and find out if the functionality is already covered, maybe by an individual configuration.
- Perform a search in [Issues](https://github.com/grafana/xk6-dashboard/issues) to see if the enhancement has already been suggested. If it has, add a comment to the existing issue instead of opening a new one.
- Find out whether your idea fits with the scope and aims of the project. It's up to you to make a strong case to convince the project's developers of the merits of this feature. Keep in mind that we want features that will be useful to the majority of our users and not just a small subset.
- Use a **clear and descriptive title** for the issue to identify the suggestion.
- Provide a **step-by-step description of the suggested enhancement** in as many details as possible.
- **Describe the current behavior** and **explain which behavior you expected to see instead** and why. At this point you can also tell which alternatives do not work for you.
- **Explain why this enhancement would be useful** to most of users. You may also want to point out the other projects that solved it better and which could serve as inspiration.

## Contributing code

If you'd like to contribute code, this is the basic procedure.

1. Find an [issue](https://github.com/grafana/xk6-dashboard/issues) you'd like to fix. If there is none already, or you'd like to add a feature, please open one, and we can talk about how to do it. Out of respect for your time, please start a discussion regarding any bigger contributions either in a [GitHub Issue](https://github.com/grafana/xk6-dashboard/issues), in the community forums **before** you get started on the implementation.
  
   Remember, there's more to software development than code; if it's not properly planned, stuff gets messy real fast.

2. Create a fork and open a feature branch - `feature/my-cool-feature` is the classic way to name these, but it really doesn't matter.

3. Create a pull request!

4. We will discuss implementation details until everyone is happy, then a maintainer will merge it.

## Development Environment

We use [Development Containers](https://containers.dev/) to provide a reproducible development environment. We recommend that you do the same. In this way, it is guaranteed that the appropriate version of the tools required for development will be available.

**Without installing software**

You can *contribute without installing any software* using [GitHub Codespaces](https://docs.github.com/en/codespaces). After forking the repository, [create a codespace for your repository](https://docs.github.com/en/codespaces/developing-in-a-codespace/creating-a-codespace-for-a-repository).

**Using an IDE**

You can contribute conveniently using [Visual Studio Code](https://code.visualstudio.com/) by installing the [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension. You *don't need to install any other software* to contribute. Clone your repository and open the folder with Visual Studio Code. It will automatically detect that the folder contains a Dev Container configuration and ask you whether to open the folder in a container. Choose **"Reopen in Container"**.

[JetBrains GoLand](https://www.jetbrains.com/help/go/connect-to-devcontainer.html) also has DevContainers support.

It is worth mentioning [DevPod](https://devpod.sh/docs/) in addition to the above.

**The hard way**

All the tools used for development are free and open-source, so you can install them without using *Development Containers*. The `.devcontainer/devcontainer.json` file contains a list of the tools to be installed and their version numbers.

### Updating tool versions

The version numbers of tools used in GitHub workflows are defined as [repository variables](https://github.com/grafana/xk6-dashboard/settings/variables/actions). The version numbers of tools used in the *Development Containers* are only defined in the `.devcontainer/devcontainer.json` file. The version numbers should be updated carefully to be consistent.

## Frontend Development

If you want to work on the frontend components without using devcontainers, you can run the frontend development servers directly. The project uses [Lerna](https://lerna.js.org/) to manage multiple packages in the `dashboard/assets` directory.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher)
- [Yarn](https://yarnpkg.com/) package manager
- [Go](https://golang.org/) (for backend server)

### Running the Frontend

1. **Install dependencies** (only needed once):
   ```bash
   cd dashboard/assets
   yarn install
   ```

2. **Start the development servers**:

   **Option 1: Use Lerna to run dev scripts across all packages**
   ```bash
   # From the dashboard/assets directory
   npx lerna run dev --parallel
   ```
   
   This will start development servers for all packages that have a `dev` script (UI, Report, Model, and View packages).

   **Option 2: Run individual packages**
   ```bash
   # Start the UI development server (typically on http://localhost:5173)
   cd packages/ui
   yarn dev
   
   # In another terminal, start the Report development server (typically on http://localhost:5174)
   cd packages/report
   yarn dev
   ```

### Running the Backend Server

To test the frontend with real data, you can run the backend server using the provided sample dataset:

   **Option 1: Build and run the CLI tool**:
   ```bash
   # Build k6-web-dashboard
   go build -o k6-web-dashboard ./cmd/k6-web-dashboard
   # Replay the sample test data
   ./k6-web-dashboard replay dashboard/testdata/result.ndjson.gz
   ```
   
   This will start the backend server (typically on http://localhost:8080) and serve the dashboard with the sample test data.

   **Option 2: Use Go run directly**:
   ```bash
   go run ./cmd/k6-web-dashboard replay dashboard/testdata/result.ndjson.gz
   ```

### Development Workflow

1. Start the frontend development servers
2. Start the backend server with sample data
3. Make changes to the frontend code - they will automatically reload
4. The frontend will connect to the backend server automatically to display real metrics data

### Available Frontend Packages

- **UI Package** (`packages/ui`): Main dashboard interface with charts, tables, and interactive components
- **Report Package** (`packages/report`): Static report generation for sharing results
- **Model Package** (`packages/model`): TypeScript types and data models
- **Config Package** (`packages/config`): Configuration management
- **View Package** (`packages/view`): Chart rendering utilities

## Tasks

The usual contributor tasks can be performed using GNU make. The `Makefile` defines a target for each task. To execute a task, the name of the task must be specified as an argument to the make command.

```bash
make taskname
```

Help on the available targets and their descriptions can be obtained by issuing the `make` command without any arguments.

```bash
make
```

More detailed help can be obtained for individual tasks using the [cdo](https://github.com/szkiba/cdo) command:

```bash
cdo taskname --help
```

**Authoring the Makefile**

The `Makefile` is generated from the task list defined in the `CONTRIBUTING.md` file using the [cdo](https://github.com/szkiba/cdo) tool. If a contribution has been made to the task list, the `Makefile` must be regenerated using the [makefile] target.

```bash
make makefile
```

### security - Run security and vulnerability checks

The [gosec] tool is used for security checks. The [govulncheck] tool is used to check the vulnerability of dependencies.

```bash
gosec ./...
govulncheck ./...
```

[gosec]: https://github.com/securego/gosec
[govulncheck]: https://github.com/golang/vuln
[security]: <#security---run-security-and-vulnerability-checks>

### lint - Run the linter

The [golangci-lint] tool is used for static analysis of the source code. It is advisable to run it before committing the changes.

```bash
golangci-lint run ./...
```

[lint]: <#lint---run-the-linter>
[golangci-lint]: https://github.com/golangci/golangci-lint

### test - Run the tests

The `go test` command is used to run the tests and generate the coverage report.

```bash
go test -count 1 -p 4 -race -coverprofile=coverage.txt -timeout 60s ./...
```

[test]: <#test---run-the-tests>

### coverage - View the test coverage report

The go `cover` tool should be used to display the coverage report in the browser.

Requires
: [test]

```bash
go tool cover -html=coverage.txt
```

### build - Build custom k6 with extension

The [xk6] tool is used to build the k6.

```bash
xk6 build --with github.com/grafana/xk6-dashboard=.
```

[xk6]: https://github.com/grafana/xk6
[build]: <#build---build-custom-k6-with-extension>

### cli - Build the k6-web-dashboard CLI

Build the k6-web-dashboard CLI tool.

```bash
goreleaser build --snapshot --clean --single-target
```

[cli]: #cli---build-k6-web-dashboard-cli

### doc - Update documentation

Documentation and examples are getting a refresh. This involves updating existing documentation files, refining example code in README.md files, and ensuring the CLI tool's README.md reflects the latest source code.

```bash
mdcode update

# See tools/docsme/main.txt
# go run -tags docsme ./tools/docsme -r cli -o cmd/k6-web-dashboard/README.md
```

[doc]: #doc---update-documentation

### exif - Update image metadata

Update metadata (title, description, etc.) in screenshots and example PDF reports.

```bash
exiftool -all= -overwrite_original -ext png screenshot
exiftool -ext png -overwrite_original -XMP:Subject="k6 dashboard xk6" -Title="k6 dashboard screenshot" -Description="Screenshot of xk6-dashboard extension that enables creating web based metrics dashboard for k6." -Author="Raintank, Inc. dba Grafana Labs" screenshot
exiftool -all= -overwrite_original -ext png .github
exiftool -ext png -overwrite_original -XMP:Subject+="k6 dashboard xk6" -Title="k6 dashboard screenshot" -Description="Screenshot of xk6-dashboard extension that enables creating web based metrics dashboard for k6." -Author="Raintank, Inc. dba Grafana Labs" .github
exiftool -all= -overwrite_original -ext pdf screenshot
exiftool -ext pdf -overwrite_original -Subject="k6 dashboard report" -Title="k6 dashboard report" -Description="Example report of xk6-dashboard extension that enables creating web based metrics dashboard for k6." -Author="Raintank, Inc. dba Grafana Labs" screenshot
```

### testdata - Record test results for testing

Execute `scripts/test.js` and capture metrics in multiple formats for subsequent testing.

```bash
JSON=dashboard/testdata/result.json
JSON_GZ="${JSON}.gz"
NDJSON=dashboard/testdata/result.ndjson
NDJSON_GZ="${NDJSON}.gz"

xk6 run -- scripts/test.js \
--quiet --no-summary --no-usage-report \
--out json=$JSON --out json=$JSON_GZ \
--out "dashboard=port=-1&period=2s&record=${NDJSON}" \
--out "dashboard=port=-1&period=2s&record=${NDJSON_GZ}" \
```

### run - Run test script

Execute the given script, then save its metrics for future replay.

```bash
SLUG=${1//\//-}
REPORT="build/${SLUG}-report.html"
RECORD="build/${SLUG}-record.ndjson.gz"
RESULT="build/${SLUG}-result.json.gz"

xk6 run -- ${1:-} \
--quiet --no-summary --no-usage-report \
--out "dashboard=export=${REPORT}&record=${RECORD}" \
--out json="${RESULT}"
```

### replay - Replay test from recorded JSON file

Replay and display metrics from a previously recorded test run. 

```bash
SLUG=${1//\//-}
RECORD="build/${SLUG}-record.ndjson.gz"

go run ./cmd/k6-web-dashboard replay $RECORD
```

### gen - Generate code

Generate go source code and HTML UI.

```bash
go generate ./...
yarn --silent --cwd dashboard/assets install
yarn --silent --cwd dashboard/assets build
```

[gen]: #gen---generate-code

### clean - Clean the working directory

Delete the work files created in the work directory (also included in .gitignore).

```bash
rm -rf ./k6 ./coverage.txt ./build ./dashboard/assets/node_modules ./bun.lockb
```

[clean]: #clean---clean-the-working-directory

### schema - Convert the schema to JSON

The source of the JSON schema is `docs/registry.schema.yaml`, after its modification, the schema should be converted into JSON format and saved in `docs/registry.schema.json`.

```bash
yq -o=json -P docs/dashboard.schema.yaml > docs/dashboard.schema.json
```


### all - Run all

Performs the most important tasks. It can be used to check whether the CI workflow will run successfully.

Requires
: [clean], [lint], [security], [test], [build], [cli], [doc], [makefile]

### format - Format the go source codes

```bash
go fmt ./...
```

[format]: #format---format-the-go-source-codes

### makefile - Generate the Makefile

Generate a Makefile for common task execution.

```bash
cdo --makefile Makefile
```
[makefile]: <#makefile---generate-the-makefile>
