import csv
import argparse
import textwrap

parser = argparse.ArgumentParser()
parser.add_argument('csvfile')
parser.add_argument('svgfile')
args = parser.parse_args()

with open(args.csvfile) as csvfile:
    reader = csv.reader(csvfile)
    with open(args.svgfile) as svgfile:
        svgdata = svgfile.read()
        for row in reader:
            mnumber = row[0]
            text = row[4]
            svgdata = svgdata.replace(mnumber,text)

    print(textwrap.dedent('''
      ---
      title: $YYYY Competition Knockout
      layout: comp
      angular_controller: KnockoutTree
      ---
    ''').lstrip())
    print(svgdata)
