import argparse
from subprocess import call
import sys
from os import path
import tempfile

parser = argparse.ArgumentParser(description='bulk generate animation array')
parser.add_argument('--names', '-n', nargs='+', required=True,
                    help='animation names')
parser.add_argument('--input_directory', '-i', required=True,
                    help='directory of the source gif files')
args = parser.parse_args()

tmpdir = tempfile.mkdtemp()

print(tmpdir)

for n in args.names:
    # 32x32
    call([
        'convert',
        path.join(args.input_directory, n + '.gif'),
        '-resize',
        # '-liquid-rescale',
        '32x32!',
        '-fuzz',
        '10%',
        '-transparent',
        'white',
        path.join(tmpdir, n + '32.gif')
    ])

    # gif -> png
    call([
        'convert',
        path.join(tmpdir, n + '32.gif'),
        path.join(tmpdir, n + '.png'),
    ])

    # png -> array
    with open(path.join('./js/anim/', n + '_anim.js'), 'w') as out:
        call([
            sys.executable,
            path.join(path.dirname(__file__), 'png2array.py'),
            '--name',
            n,
            '--input_directory',
            tmpdir
        ], stdout=out)
