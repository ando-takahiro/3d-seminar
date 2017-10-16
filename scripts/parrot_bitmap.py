import argparse
from glob import glob
from os import path
from PIL import Image

parser = argparse.ArgumentParser(description='png to js array')
parser.add_argument('--input', '-i', required=True,
                    help='image file path')
args = parser.parse_args()

img = Image.open(args.input, 'r').convert('RGBA')
red, green, blue, alpha = img.split()
width, height = red.size
print('[')
for j in range(height):
    print('[')

    for i in range(width):
        x = i
        y = j
        r = red.getpixel((x,y))
        g = green.getpixel((x,y))
        b = blue.getpixel((x,y))
        a = alpha.getpixel((x,y))
        max_intensity = (1 + 1 + 1) ** 0.5
        intensity = ((r / 255.0) ** 2 + (g / 255.0) ** 2 + (b / 255.0) ** 2) ** 0.5
        if a <= 0:
            print('null,')
        elif intensity / max_intensity >= 0.5:
            print("'parrot',")
        else:
            print("'sirocco',")

    print('],')
print(']')
