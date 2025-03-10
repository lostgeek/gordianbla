#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import urllib
import random
import tempfile
import subprocess
import os
import gzip
from xml.dom import minidom
import cairosvg

def main():
    mode_nr, n = [1, 450]

    _, temp_output_fp = tempfile.mkstemp(suffix=".svg")
    output_fp = './generator/SPOILER.svg.gz'

    process = subprocess.Popen(f'go run ./lib/primitive/main.go -i ./generator/SPOILER.png -o {temp_output_fp} -m {mode_nr} -n {n} -v', \
        stdout=subprocess.PIPE, shell=True)
    process.communicate()

    with open(temp_output_fp, 'r+') as infile:
        lines = infile.readlines()
        lines.insert(0, f'<!--\nTitle: Byte!\nNRDB ID: -1\nMode: {mode_nr} triangle\nn: {n}\n-->\n')
        with gzip.open(output_fp, 'wb') as outfile:
            outfile.write(bytearray('\n'.join(lines), encoding="utf-8"))

    os.remove(temp_output_fp)

if __name__ == "__main__":
    main()
