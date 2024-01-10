#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from generator import Generator

import random
import glob
import os
from datetime import datetime

if __name__ == "__main__":
    N = 1

    g = Generator()

    card = random.choice(g.cards)

    puzzle_prefix = "./site/assets/daily_puzzles"
    content = glob.glob(os.path.join(puzzle_prefix, "*.svg.gz"))

    latest_puzzle_path = os.path.basename(sorted(content)[-1])
    latest_puzzle_id = int(latest_puzzle_path.split('.')[0], 10)

    for new_id in range(latest_puzzle_id+1, latest_puzzle_id+1+N):
        started = datetime.now()
        new_puzzle_path = os.path.join(puzzle_prefix, f"{new_id:05}.svg.gz")
        thumb_path = os.path.join(puzzle_prefix, "thumb", f"{new_id:05}.png")

        print(f"Creating {new_puzzle_path}...")
        g.generate_puzzle(card, new_puzzle_path, thumb_path)

        print("Finished in " + str(datetime.now()-started) + "\n")