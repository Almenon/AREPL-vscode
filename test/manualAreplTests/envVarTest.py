from arepl_dump import dump
import os


path=os.environ['Path']

test = os.environ['test']

try:
    shouldFail = os.environ['aofijaef']
except KeyError:
    print('bad key failed as expected')

