#!/bin/sh
set -eu

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 OUTPUT_DIRECTORY" >&2
    exit 1
fi

script_dir=$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)
mkdir -p "$1"
output_dir=$(CDPATH='' cd -- "$1" && pwd)
source_dir=$(mktemp -d)
trap 'rm -rf "$source_dir"' EXIT
trap 'exit 1' HUP INT TERM
revision=$(cat "$script_dir/upstream-revision")

# Patch an isolated checkout, never the shared Go module cache.
git -C "$source_dir" init -q
git -C "$source_dir" fetch -q --depth=1 https://github.com/fogleman/primitive.git "$revision"
git -C "$source_dir" checkout -q --detach FETCH_HEAD
test "$(git -C "$source_dir" rev-parse HEAD)" = "$revision"
git -C "$source_dir" apply --check "$script_dir/gordianbla.patch"
git -C "$source_dir" apply "$script_dir/gordianbla.patch"

# Upstream predates modules. Supply our pinned dependency graph for its build.
cp "$script_dir/go.mod" "$script_dir/go.sum" "$source_dir/"
(
    cd "$source_dir"
    CGO_ENABLED=0 go build -mod=readonly -trimpath -o "$output_dir/primitive" .
)
cp "$source_dir/LICENSE.md" "$output_dir/primitive-LICENSE.md"
