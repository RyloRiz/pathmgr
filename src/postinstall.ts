import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
let pathToBin = path.join(os.homedir(), 'pathmgr');
let exists = fs.existsSync(pathToBin);
if (!exists) {
	fs.mkdirSync(pathToBin, { recursive: true });
}
fs.writeFileSync(path.join(pathToBin, "paths.json"), JSON.stringify({
	format_version: "1.0.0",
	paths: {}
}));