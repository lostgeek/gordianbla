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

class Generator:
    available_parameters = {
        'combo': [0, 300],
        'triangle': [1, 450],
        'rect': [2, 600],
        'ellipse': [3, 600],
        'circle': [4, 1200],
        'rotatedrect': [5, 600],
        'beziers': [6, 1500],
        'rotatedellipse': [7, 600],
        'polygon': [8, 600],}

    def __init__(self):
        response = requests.get('http://netrunnerdb.com/api/2.0/public/cards')
        self.cards = response.json()['data']
        self.image_url_template = response.json()['imageUrlTemplate'].replace('{code}', '{0}');

        response = requests.get('https://netrunnerdb.com/api/2.0/public/packs');
        self.packs = response.json()['data']

        self.formats = { \
            'standard': \
                self.packs_in_cycles([ \
                    'red-sand', \
                    'kitara', \
                    'reign-and-reverie', \
                    'magnum-opus', \
                    'ashes', \
                    'magnum-opus-reprint', \
                    'system-gateway', \
                    'system-update-2021', \
                    'borealis', \
                    'liberation', \
                ]), \
            'neo': \
                self.packs_in_cycles([ \
                    'ashes', \
                    'system-gateway', \
                    'system-update-2021', \
                    'borealis', \
                    'liberation', \
                ]), \
            'startup': \
                self.packs_in_cycles([ \
                    'system-gateway', \
                    'system-update-2021', \
                    'liberation', \
                ]),
            }

    def packs_in_cycles(self, cycle_codes):
        return [p['code'] for p in self.packs if p['cycle_code'] in cycle_codes]

    def get_random_card(self, format='eternal'):
        return random.choice(self.cards.filter(lambda c: (c['pack_code'] in self.formats[format])))

    def fetch_card_image(self, card, target_filepath):
        if 'image_url' in card.keys():
            url = card['image_url']
        else:
            url = self.image_url_template.format(card['code'])

        try:
            urllib.request.urlretrieve(url, target_filepath)
        except:
            raise Exception(f"Fetching image for {card['title']} failed.")

    def generate_puzzle(self, card, puzzle_filepath, thumbnail_filepath=None, mode=None):
        if not mode:
            mode = random.choice(list(self.available_parameters.keys()))

        mode_nr, n = self.available_parameters[mode]

        _, temp_input_filepath = tempfile.mkstemp(suffix=".jpg")
        _, temp_puzzle_filepath = tempfile.mkstemp(suffix=".svg")

        self.fetch_card_image(card, temp_input_filepath)

        process = subprocess.Popen(f'go run ./lib/primitive/main.go -i {temp_input_filepath} -o {temp_puzzle_filepath} -m {mode_nr} -n {n} -v', \
            stdout=subprocess.PIPE, shell=True)
        process.communicate()

        with open(temp_puzzle_filepath, 'r+') as infile:
            lines = infile.readlines()
            lines.insert(0, f'<!--\nTitle: {card["title"]}\nNRDB ID: {card["code"]}\nMode: {mode_nr} {mode}\nn: {n}\n-->\n')
            with gzip.open(puzzle_filepath, 'wb') as outfile:
                outfile.write(bytearray('\n'.join(lines), encoding="utf-8"))

        if thumbnail_filepath:
            self.generate_thumbnail(puzzle_filepath, mode, thumbnail_filepath)

        os.remove(temp_input_filepath)
        os.remove(temp_puzzle_filepath)

    def generate_thumbnail(self, gz_filepath, mode, thumbnail_filepath):
        if (mode == 'circles'):
            level1elements = 20
        elif (mode == 'beziers'):
            level1elements = 100
        else:
            level1elements = 10

        _, temp_thumb_svg_filepath = tempfile.mkstemp(suffix=".svg")
        with minidom.parse(gzip.open(gz_filepath, 'r')) as dom:
            svgElements = dom.childNodes[1].childNodes[3]
            # Every other child node is empty because of linebreaks in the svg
            for n in range(len(svgElements.childNodes)-1, level1elements*2+1, -1):
                svgElements.removeChild(svgElements.childNodes[n])

            with open(temp_thumb_svg_filepath, 'w') as outfile:
                dom.writexml(outfile)
        cairosvg.svg2png(url=temp_thumb_svg_filepath, write_to=thumbnail_filepath)
        os.remove(temp_thumb_svg_filepath)
