git checkout production
git merge staging --no-edit
cp ./netlify/_redirects-production ./www/_redirects
git add -A
git commit -am "build production"
git push upstream production
git checkout master
echo "Pushed to production"
