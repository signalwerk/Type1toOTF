# Type1toOTF

This is a Docker to convert old PostScript Type 1 outline fonts to OpenType-Fonts.

You need to do the following steps:

1. Get a `.pfb` file of your font
2. Get a `.pfm` file of your font
3. Get a `.fea` file of your font
4. Convert the files to a `.otf` or `.ufo` (if you need to do additional edits) file.

## Prepare your Mac PostScript Type 1 outline fonts

### On MacOS X

Usually the old PostScript Type 1 outline fonts on Mac have their outlines in the resource fork of the font file. To extract the resource fork you can use the following command on MacOS X Terminal (your font-file in this example is called `TestFont`):

```bash
mkdir TestFontFork
cp TestFont/..namedfork/rsrc TestFontFork/TestFont
cp TestFont.bmap/..namedfork/rsrc TestFontFork/TestFont.bmap
```

## Build and run the docker

```bash
# to build a docker with all used packages
docker build -t type12otf .

## to run the docker and share current directory with the docker
docker run -it -v $(pwd):/data type12otf
```

Now the docker is running and the following commands can be executed inside the docker.

## Convert Mac PostScript Type 1 fonts

The following commands create `.pfb` and `.pfm` files of the Mac font.

```bash
## extract .pfb
fondu TestFont

## extract .afm
fondu -afm TestFont.bmap

# the pfb can also be extracted with fontforge
# fontforge -c 'import fontforge; file = "TestFont"; font = fontforge.open(file); font.generate(file + ".pfb")'
```

## Build OpenType-Font

Extract the kernings ([`.fea` file](http://adobe-type-tools.github.io/afdko/OpenTypeFeatureFileSpecification.html)) from the `.afm` file.

```bash
node afm2fea.js TestFont.afm TestFont.fea
# node version 10 in docher
```

Build the OpenType-Font (`.otf` file) from the `.pfb` file, the `.afm` file and the `.fea` file (`-r` for release mode).

```bash
makeotf -f TestFont.pfb -mf TestFont.afm -ff TestFont.fea -r -o TestFont.otf
```

Convert the `.otf` file to a `.ufo` file.

```bash
tx -ufo TestFont.otf TestFont.ufo

# if you need a more suffisticated conversion you can use the following python script;
# pip install ufo-extractor
# pip install fontFeatures
# python -c "import extractor, defcon; ufo = defcon.Font(); extractor.extractUFO('AmbNewutPlain-Heavy.otf', ufo); ufo.save('AmbNewutPlain-Heavy.ufo')"
```

## Docker includes

- [AFDKO](https://github.com/adobe-type-tools/afdko) Adobe Font Development Kit for OpenType
- [T1utils](https://github.com/kohler/t1utils) PostScript Type 1 font manupulation utility
- [fonttools](https://github.com/fonttools/fonttools) manipulate font files
- [fondu](https://fondu.sourceforge.net/) converter for various mac font formats
- [fontforge](https://fontforge.org/) Open Source Font Editor

## See also

- [t1subset](https://ctan.org/tex-archive/fonts/utilities/t1subset) PostScript Type 1 font subsetter
- [macfont](https://ctan.org/tex-archive/fonts/utilities/macfont) Convert Apple type 1 fonts for use under Windows
