// will be at the base so assume that
const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

const modBasePath = path.join(process.cwd(), '/');
const jsPath = path.join(modBasePath, 'js/');

// extract all files in the js directory

function getAllFiles(dirPath, files = []) {
    const dirFiles = fs.readdirSync(dirPath, {
        withFileTypes: true
    });
    for (const file of dirFiles) {
        if (file.isDirectory()) {
            getAllFiles(path.join(dirPath, `${file.name}/`), files);
        } else if (file.isFile() && file.name.endsWith('.js')) {
            files.push(path.join(dirPath, file.name));
        }
    }
    return files;
}

const files = [];
getAllFiles(jsPath, files);


function extractNameAndDependencies(filePath) {
    let moduleName;
    let dependencies;
    babel.transformFileSync(filePath, {
        plugins: [{
            visitor: {
                Program(path) {
                    path.traverse({
                        CallExpression(fPath) {
                            const node = fPath.node;
                            if (!node.callee.property) {
                                return;
                            }

                            const name = node.callee.property.name;

                            if (name === "module") {
                                moduleName = node.arguments[0].value;
                            } else if (name === "requires") {
                                dependencies = node.arguments
                                    .map(e => e.value)
                                    .filter(e => e.includes('menu-ui-replacer') || e.includes('extendable-severed-heads'));
                            }

                        }
                    });
                }
            }
        }]
    });
    if (!moduleName) {
        console.log('Module name not found in', filePath);
    }
    return {
        name: moduleName,
        dependencies
    };
}
const nameMap = new Map();

for (const file of files) {
    const {
        name,
        dependencies
    } = extractNameAndDependencies(file);
    nameMap.set(name, dependencies || []);
}

// extract all keys 
let modulePairs = [...nameMap].sort((e, f) => e[1].length - f[1].length);
let withDependecies = modulePairs.filter(e => e[1].length);

let startIndex = modulePairs.length - withDependecies.length;

modulePairs.splice(startIndex, modulePairs.length - withDependecies.length);

modulePairs = modulePairs.map(e => e[0]);

// circular dependencies will cause this to infinite loop
do {
    withDependecies = withDependecies.map(e => [e[0], e[1].filter(e => !modulePairs.includes(e))]);
    const newList = withDependecies.filter(e => e[1].length === 0).map(e => e[0]);
    withDependecies = withDependecies.filter(e => e[1].length > 0);

    // newList must be non zero to
    // prevent an infinite loop 
    if (newList.length === 0 && withDependecies.length > 0) {
        console.log(withDependecies);
        throw Error('Circular dependency detected.');
    }
    modulePairs.push(...newList);
} while (withDependecies.length);


function convertToImport(moduleName) {
    return `import "./js/${moduleName.replace(/\./g, "/")}.js";`;
}

fs.writeFileSync(path.join(modBasePath, 'postload.js'), modulePairs.map(convertToImport).join('\n\n'));