import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { Command } from 'commander';
import pkg from '../package.json';

/**
 * format_version: "1.0.0"
 */
interface Paths {
	format_version: string;
	paths: {
		[name: string]: {
			latest: string;
			expired: string[];
		};
	}
}

const filePath = path.join(os.homedir(), "pathmgr", "paths.json");
const program = new Command();


program
	.name("pathmgr")
	.description("Manager for navigating to directories")
	.version(pkg.version);

program
	.command("add <relpath> <name>")
	.option("-f", "--force", "Force the action")
	.description("Add a path")
	.action((relpath: string, name: string, options: any) => {
		let bytes = fs.readFileSync(filePath);
		let json: Paths = JSON.parse(bytes.toString());
		if (json.paths[name] || json.paths[name].latest === "*") {
			if (options.force) {
				let resolved = path.resolve("", relpath);
				json.paths[name].expired.reverse();
				json.paths[name].expired.push(json.paths[name].latest);
				json.paths[name].expired.reverse();
				json.paths[name].latest = resolved;
				console.log(`Path "${name}" updated to "${resolved}"`);
			} else {
				console.log(`Path "${name}" already exists, use -f|--force to suppress this error`);
			}
		} else {
			json.paths[name].latest = relpath;
			json.paths[name].expired = [];
		}
		fs.writeFileSync(filePath, JSON.stringify(json));
	});

program
	.command("cd <name>")
	.description("Navigate to a path")
	.action((name: string) => {
		let bytes = fs.readFileSync(filePath);
		let json: Paths = JSON.parse(bytes.toString());
		if (json.paths[name] && json.paths[name].latest !== "*") {
			process.chdir(json.paths[name].latest);
		} else {
			console.log(`Path "${name}" does not exist`);
		}
	});

program
	.command("rm <name>")
	.option("-f", "--force", "Purge the pathname history")
	.description("Remove a path")
	.action((name: string, options: any) => {
		let bytes = fs.readFileSync(filePath);
		let json: Paths = JSON.parse(bytes.toString());
		if (json.paths[name]) {
			if (options.force) {
				delete json.paths[name];
			} else {
				json.paths[name].expired.reverse();
				json.paths[name].expired.push(json.paths[name].latest);
				json.paths[name].expired.reverse();
				json.paths[name].latest = "*";
			}
		} else {
			console.log(`Nothing to remove`);
		}
		fs.writeFileSync(filePath, JSON.stringify(json));
	});