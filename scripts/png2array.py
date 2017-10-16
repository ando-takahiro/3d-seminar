import argparse
from glob import glob
from os import path
from PIL import Image

parser = argparse.ArgumentParser(description='png to js array')
parser.add_argument('--name', '-n', required=True,
                    help='animation name')
parser.add_argument('--input_directory', '-i', default='./images',
                    help='animation name')
args = parser.parse_args()

input_files = glob(path.join(args.input_directory, '%s*.png' % args.name))

print('anims = window.anims || {};')
print('anims.%s = [' % args.name)
for p in iter(sorted(input_files)):
  print('// %s' % p)
  print('[')
  img = Image.open(p, 'r').convert('RGBA')
  red, green, blue, alpha = img.split()
  width, height = red.size
  for j in range(height):
    for i in range(width):
      x = i
      y = height - j - 1
      print('%f, %f, %f, %f,' % (
        red.getpixel((x,y)) / 255.0,
        green.getpixel((x,y)) / 255.0,
        blue.getpixel((x,y)) / 255.0,
        alpha.getpixel((x,y)) / 255.0)
      )

  print('],')

print('];')
