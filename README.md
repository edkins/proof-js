# proof-js
A language with dependent types which compiles to JavaScript


I installed the following:

git clone git://github.com/idris-lang/Idris-dev.git
cd Idris-dev
cabal sandbox init
cabal update
cabal install --only-dependencies

echo "CI = true" > custom.mk
make

(VIM editor support, assumes Pathogen already installed)
cd ~/.vim/bundle
git clone https://github.com/idris-hackers/idris-vim.git
