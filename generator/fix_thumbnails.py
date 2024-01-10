#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from generator import Generator

import glob
import os
import tempfile
import gzip
import shutil

if __name__ == "__main__":
    N = 1

    g = Generator()

    puzzle_prefix = "./site/assets/daily_puzzles"

    for puzzle_filepath in sorted(glob.glob(os.path.join(puzzle_prefix, "*.svg.gz"))):
        mode = None
        with gzip.open(puzzle_filepath, 'r') as infile:
            mode = infile.readlines()[3].decode('utf-8').strip().split(' ')[-1]

        puzzle_id = int(os.path.basename(puzzle_filepath).split('.')[0], 10)
        thumb_filepath = os.path.join(puzzle_prefix, "thumb", f"{puzzle_id:05}.png")

        if not os.path.exists(thumb_filepath):
            print(f"Generating thumbnail for {puzzle_id:05}...")
            g.generate_thumbnail(puzzle_filepath, mode, thumb_filepath)