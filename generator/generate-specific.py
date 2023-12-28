#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import random
import urllib
import tempfile
import os.path
import uuid

import subprocess
from datetime import datetime
import sys
import os
import gzip

PARAMETERS = {
        'combo': [0, 300],
        'triangle': [1, 450],
        'rect': [2, 600],
        'ellipse': [3, 600],
        'circle': [4, 1200],
        'rotatedrect': [5, 600],
        'beziers': [6, 1500],
        'rotatedellipse': [7, 600],
        'polygon': [8, 600],}

def main():

    path = 'src/site/img/Trieste-Model-Bioroids-web.png'
    card = {};
    card['title'] = "Trieste Model Bioroids"
    card['code'] = '00000'

    folder = tempfile.TemporaryDirectory()

    mode = random.choice(list(PARAMETERS.keys()))
    params = PARAMETERS[mode]
    mode_nr = params[0]
    n = params[1]
    solution_id = uuid.uuid1()

    print(f"Creating {card['title']} in {mode}: puzzles/{solution_id}.svg.gz...")
    started = datetime.now()

    process = subprocess.Popen(f'go run ./lib/primitive/main.go -i {path} -o ./puzzles/{solution_id}.svg -m {mode_nr} -n {n} -v', stdout=subprocess.PIPE, shell=True)
    process.communicate()

    with open(f'./puzzles/{solution_id}.svg', 'r+') as infile:
        lines = infile.readlines()
        lines.insert(0, f'<!--\nTitle: {card["title"]}\nNRDB ID: {card["code"]}\nMode: {mode_nr} {mode}\nn: {n}\n-->\n')
        with gzip.open(f'./puzzles/{solution_id}.svg.gz', 'wb') as outfile:
            outfile.write(bytearray('\n'.join(lines), encoding="utf-8"))

    os.remove(f'./puzzles/{solution_id}.svg')


    print("Finished in " + str(datetime.now()-started) + "\n")

if __name__ == "__main__":
    main()
