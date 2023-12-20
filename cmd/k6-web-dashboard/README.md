<!--
SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs

SPDX-License-Identifier: AGPL-3.0-only
-->

# k6 web dashboard CLI 

The `k6-web-dashboard` is a command-line tool that enables the dashboard event file (saved during the previous k6 run) to be [played back](#k6-web-dashboard-replay) (and displayed in a browser). In addition to playback, it also offers the possibility to [create a single file HTML report](#k6-web-dashboard-report) from the event file.

It is possible to [convert the result saved by k6 JSON output](#k6-web-dashboard-aggregate) to dashboard event file format. This way, the running result saved in JSON format can be displayed later (even on another computer) as a dashboard or a report can be made from it.

## Install

Precompiled binaries can be downloaded and installed from the [Releases](https://github.com/grafana/xk6-dashboard/releases) page.

If you have a go development environment, the installation can also be done with the following command:

```bash
go install github.com/grafana/xk6-dashboard/cmd/k6-web-dashboard@latest
```

## Usage
<!-- begin:cli -->
## k6-web-dashboard

Offline k6 web dashboard management

### Synopsis

k6 web dashboard management that does not require running k6 (recording playback, creating a report from a recording, etc.).

### Options

```
  -h, --help   help for k6-web-dashboard
```

### SEE ALSO

* [k6-web-dashboard aggregate](#k6-web-dashboard-aggregate)	 - Convert saved json output to recorded dashboard events
* [k6-web-dashboard replay](#k6-web-dashboard-replay)	 - Load the recorded dashboard events and replay it for the UI
* [k6-web-dashboard report](#k6-web-dashboard-report)	 - Create report from a recorded event file

---
## k6-web-dashboard aggregate

Convert saved json output to recorded dashboard events

### Synopsis

The aggregate command converts the file saved by json output to dashboard format events file.
The files will be automatically compressed/decompressed if the file extension is .gz

```
k6-web-dashboard aggregate input-file output-file [flags]
```

### Options

```
      --period 1m      Event emitting frequency, example: 1m (default 10s)
      --tags strings   Precomputed metric tags, can be specified more than once (default [group])
  -h, --help           help for aggregate
```

### SEE ALSO

* [k6-web-dashboard](#k6-web-dashboard)	 - Offline k6 web dashboard management

---
## k6-web-dashboard help

Help about any command

### Synopsis

Help provides help for any command in the application.
Simply type k6-web-dashboard help [path to command] for full details.

```
k6-web-dashboard help [command] [flags]
```

### Options

```
  -h, --help   help for help
```

### SEE ALSO

* [k6-web-dashboard](#k6-web-dashboard)	 - Offline k6 web dashboard management

---
## k6-web-dashboard replay

Load the recorded dashboard events and replay it for the UI

### Synopsis

The replay command load the recorded dashboard events (NDJSON format) and replay it for the dashboard UI.
The compressed file will be automatically decompressed if the file extension is .gz

```
k6-web-dashboard replay file [flags]
```

### Options

```
      --export string   Report file location (default: '', no report)
      --host string     Hostname or IP address for HTTP endpoint (default: '', empty, listen on all interfaces)
      --open            Open browser window automatically
      --port int        TCP port for HTTP endpoint (0=random, -1=no HTTP), example: 8080 (default 5665)
  -h, --help            help for replay
```

### SEE ALSO

* [k6-web-dashboard](#k6-web-dashboard)	 - Offline k6 web dashboard management

---
## k6-web-dashboard report

Create report from a recorded event file

### Synopsis

The report command loads recorded dashboard events (NDJSON format) and creates a report.
The compressed events file will be automatically decompressed if the file extension is .gz

```
k6-web-dashboard report events-file report-file [flags]
```

### Examples

```
# Visualize the result of a previous test run (using events file):
$ k6 run --web-dashboard=record=test_result.ndjson script.js
$ k6-web-dashboard replay test_result.ndjson

# Visualize the result of a previous test run (using json output):
$ k6 run --out json=test_result.json script.js
$ k6-web-dashboard aggregate test_result.json test_result.ndjson
$ k6-web-dashboard replay test_result.ndjson

# Generate report from previous test run (using events file):
$ k6 run --out web-dashboard=record=test_result.ndjson script.js
$ k6-web-dashboard report test_result.ndjson test_result_report.html
```

### Options

```
      --open   Open browser window with generated report
  -h, --help   help for report
```

### SEE ALSO

* [k6-web-dashboard](#k6-web-dashboard)	 - Offline k6 web dashboard management

<!-- end:cli -->
