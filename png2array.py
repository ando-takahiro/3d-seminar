import argparse
from glob import glob
from PIL import Image

parser = argparse.ArgumentParser(description='png to js array')
parser.add_argument('--name', '-n', required=True,
                    help='animation name')
args = parser.parse_args()

print('%sAnim = [' % args.name)
for p in iter(sorted(glob('./images/%s-*.png' % args.name))):
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
