git checkout demo
git merge demo --no-edit
cp ./netlify/_redirects-demo ./www/_redirects
git add -A
git commit -am "build demo"
git push upstream demo
git checkout master
echo "Pushed to demo"
