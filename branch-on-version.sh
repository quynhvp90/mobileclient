CLIENTVERSION="$(node -pe "require('./package.json').version")"
git checkout -B $CLIENTVERSION
git merge master
git push upstream $CLIENTVERSION
echo "pushed new branch $CLIENTVERSION"
git checkout master
