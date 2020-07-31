const { cli } = require("cli-ux");
const fs = require("fs");
const glob = require("glob");

class FoundPatternError extends Error {
  constructor() {
    super(...arguments);

    this.name = "Found Pattern Error";
  }
}

function fileContainsPattern(filePath, pattern) {
  let file = fs.readFileSync(filePath, "UTF-8");
  return pattern.test(file);
}

async function main() {
  try {
    let buildPath = await cli.prompt("Dist path");

    if (!fs.existsSync(buildPath)) {
      cli.error('Path does not exist.');
    }

    let patternToFind = await cli.prompt("Pattern to find");

    let pattern = new RegExp(patternToFind);
    let files = glob.sync(`${buildPath}/**/*.js`);

    let bar = cli.progress();

    bar.start(files.length, 0);

    let filesWithFooBar = files.filter((filePath, idx) => {
      let contains = fileContainsPattern(filePath, pattern);

      bar.update(idx + 1);

      return contains;
    });

    bar.stop();

    if (filesWithFooBar.length) {
      let err = new FoundPatternError();
      err.count = filesWithFooBar.length;
      err.files = filesWithFooBar;

      cli.error(err);
    } else {
      cli.log(`Pattern "${patternToFind}" not found in: ${buildPath}`);
    }
  } catch (err) {
    cli.log(err);
  }
}

main();
