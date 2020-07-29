cd web
npm install
npm link ../common/grunt-npmlink
grunt link
grunt symlink

cd ../cli
npm install
npm link ../common/grunt-npmlink
grunt link
grunt symlink

cd ..

