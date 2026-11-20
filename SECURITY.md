Security policy and End-of-Life statement
=========================================

### AngularJS End-of-Life

Google ended support for AngularJS on 31 December 2021. Upstream AngularJS gets no more fixes,
and the last upstream 1.3 release is 1.3.20 (2015). Security scanners such as retire.js report
every AngularJS version as End-of-Life, and this fork is no exception.

### What Ontotext maintains

Ontotext maintains this fork of AngularJS 1.3, published on npm as `@ontotext/angular`,
`@ontotext/angular-animate`, `@ontotext/angular-cookies`, `@ontotext/angular-route` and
`@ontotext/angular-sanitize`. It exists for the legacy part of the GraphDB Workbench.

For as long as a supported GraphDB release ships the fork:

* Ontotext fixes High and Critical vulnerabilities that affect the fork, in a new
  `1.3.N-onto` release.
* Medium and Low vulnerabilities are assessed one by one and fixed when they can be exploited
  in the GraphDB Workbench.
* Each release that changes the security status comes with an updated VEX document in
  [`vex/`](vex/).

The fork adds no features, and Ontotext does not support its use outside GraphDB.

### Known vulnerabilities

[`vex/ontotext-angular-1.3.x.openvex.json`](vex/ontotext-angular-1.3.x.openvex.json) is an
[OpenVEX](https://openvex.dev) document. It lists the findings that scanners report for
AngularJS 1.3 and their status in the fork:

| Finding | Severity | Status in the fork |
|---|---|---|
| CVE-2024-21490, srcset ReDoS | High | Fixed in 1.3.21-onto |
| CVE-2026-11998, $sce whitelist bypass | High | Fixed in 1.3.21-onto |
| CVE-2019-10768, `angular.merge` prototype pollution | High | Not affected: `angular.merge` does not exist in 1.3 |
| npm:angular:20150310, $sanitize XSS through SVG animation | High | Fixed in 1.3.21-onto |
| npm:angular:20150909, $sanitize mutation XSS | High | Fixed in 1.3.21-onto |
| CVE-2019-14863, XSS through `xlink:href` | Medium | Fixed in 1.3.21-onto |
| CVE-2020-7676, jqLite XSS through `<option>` | Medium | Fixed in 1.3.21-onto |
| AngularJS End-of-Life | Low | Covered by this statement |

The remaining Medium and Low AngularJS findings are not fixed in the fork.

The same document ships in the `@ontotext/angular` npm package, at
`vex/ontotext-angular-1.3.x.openvex.json`, and names the version of that package.

### Using the VEX document with a scanner

Pass the document to the scanner together with the SBOM or the image:

```
grype sbom:graphdb-sbom.cdx.json --vex ontotext-angular-1.3.x.openvex.json
trivy sbom graphdb-sbom.cdx.json --vex ontotext-angular-1.3.x.openvex.json
```

The scanner then hides the findings that the document marks as `fixed` or `not_affected`.
