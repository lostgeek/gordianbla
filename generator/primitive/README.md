# Patched Primitive build

The generator runs the `primitive` executable. Its source is fetched during the
build rather than committed to this repository. No fork or local `lib/` checkout
is needed.

`upstream-revision` pins the full commit from
https://github.com/fogleman/primitive. `gordianbla.patch` preserves two local
Bézier changes: rounded SVG stroke caps and enabling stroke-width mutation.
The old `gordianbla/lib/primitive/primitive` import workaround is unnecessary;
the build uses upstream's original module path.

Upstream has no `go.mod` at this revision. The adjacent `go.mod` and `go.sum`
pin its dependencies. The build applies the patch to a temporary checkout and
uses `-mod=readonly`, without modifying cached dependency source or local checkouts.
The executable and upstream license are copied into the generator image; the Go
toolchain is only needed in the builder stage.

## Build locally

With Git and Go 1.26 installed, run from the repository root:

```sh
sh generator/primitive/build.sh /tmp/gordianbla-tools
export PATH="/tmp/gordianbla-tools:$PATH"
```

The build needs access to GitHub and Go's dependency download services. Python
generation then uses the executable on `PATH` and does not need Go or `lib/`.

## Update upstream

1. Set `upstream-revision` to the new full commit hash.
2. Run the build. Patch conflicts fail the build and must be reviewed explicitly.
3. If necessary, regenerate the patch against that revision, preserving the two
   customizations. Update dependency versions and checksums intentionally.
4. Build and generate a sample Bézier puzzle and thumbnail before committing.

To build the image independently from the repository root:

```sh
docker build -f generator/Dockerfile -t gordianbla-generator .
```
