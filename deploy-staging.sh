git checkout staging
git merge master --no-edit
cp ./netlify/_redirects-staging ./www/_redirects
git add -A
git commit -am "build staging"
git push upstream staging
git checkout master
npm version minor
git commit -am "new minor version"
git push upstream master
echo "Pushed to staging"
