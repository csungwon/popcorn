# Microwave
Where popcorn is cooked...

## Prerequisite

### Install `homebrew` 

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Install `MongoDB`

Install `xcode-select`
```bash
xcode-select --install
```

Tap official Homebrew's MongoDB Tap to download offical formula for MongoDB
```bash
brew tap mongodb/brew
```

Update `brew`
```bash
brew update
```

Install MongoDB Community Edition
```bash
brew install mongodb-community@8.0
```


### Install `node` and `npm`
Install `nvm`. `nvm` is a tool to help manage multiple version of `node`
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```
 
Install `node` version 23^
```bash
nvm install node 23
```

If you ever need to change the version of `node`, 
```bash
nvm use <version>
```

---


## To run:
 
Run 
```bash
npm install
```

### **Get `.env` file from Jaedo Han**

To run: 
```
npm run dev
```

## Note: Feel free to update this doc
