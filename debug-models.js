import fs from 'fs';

const key = 'AIzaSyBLvrMgbhF4PromM_cQuLMIoqWErUuuZtc';

async function listModels(version) {
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/${version}/models?key=${key}`);
        const data = await res.json();
        let output = `--- Models for ${version} ---\n`;
        if (data.models) {
            data.models.forEach(m => output += `${m.name}\n`);
        } else {
            output += `Error: ${data.error?.message || JSON.stringify(data)}\n`;
        }
        return output;
    } catch (e) {
        return `Failed ${version}: ${e.message}\n`;
    }
}

async function run() {
    console.log('Starting model diagnostic...');
    const betaRes = await listModels('v1beta');
    const v1Res = await listModels('v1');
    fs.writeFileSync('confirmed-models.txt', betaRes + '\n' + v1Res);
    console.log('Results written to confirmed-models.txt');
}

run();
