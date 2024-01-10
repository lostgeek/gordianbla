#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from generator import Generator

import random
import glob
import os
from datetime import datetime

import argparse

DAILY_PUZZLE_PREFIX = "./site/assets/daily_puzzles"
PRACTICE_PUZZLE_PREFIX = "./site/assets/practice_puzzles"

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generates new gordianbla.de puzzles.")

    parser.add_argument('-type', choices=['daily', 'practice'], help="Puzzle type")
    parser.add_argument('-n', type=int, help="Number of puzzles to generate")

    args = parser.parse_args()

    g = Generator()

    if args.type == 'daily':
        puzzle_prefix = DAILY_PUZZLE_PREFIX

        content = glob.glob(os.path.join(puzzle_prefix, "*.svg.gz"))

        latest_puzzle_path = os.path.basename(sorted(content)[-1])
        latest_puzzle_id = int(latest_puzzle_path.split('.')[0], 10)

        for new_id in range(latest_puzzle_id+1, latest_puzzle_id+1 + args.n):
            started = datetime.now()

            card = random.choice(g.cards)
            new_puzzle_path = os.path.join(puzzle_prefix, f"{new_id:05}.svg.gz")
            thumb_path = os.path.join(puzzle_prefix, "thumb", f"{new_id:05}.png")
            mode = random.choice(list(g.available_parameters.keys()))

            print(f"Creating {new_puzzle_path} in {mode}...")
            g.generate_puzzle(card, new_puzzle_path, thumb_path, mode)

            print("Finished in " + str(datetime.now()-started) + "\n")

    elif args.type == 'practice':
        puzzle_prefix = PRACTICE_PUZZLE_PREFIX

        for n in range(args.n):
            started = datetime.now()

            card = random.choice(g.cards)

            # Create necessary directories
            thumb_folder = os.path.join(puzzle_prefix, card['pack_code'], 'thumb')
            os.makedirs(thumb_folder, exist_ok=True)

            # Create filepath in the form <puzzle_prefix>/<pack_code>/<code>-00.svg.gz
            new_puzzle_path = ""
            i = 0
            while True:
                new_puzzle_path = os.path.join(puzzle_prefix, card['pack_code'], f"{card['code']}-{i:02}.svg.gz")
                if not os.path.exists(new_puzzle_path) or i >= 99:
                    break
                i += 1

            thumb_path = os.path.join(thumb_folder, f"{card['code']}-{i:02}.png")
            mode = random.choice(list(g.available_parameters.keys()))

            print(f"Creating {new_puzzle_path} in {mode}...")
            g.generate_puzzle(card, new_puzzle_path, thumb_path, mode)

            print("Finished in " + str(datetime.now()-started) + "\n")