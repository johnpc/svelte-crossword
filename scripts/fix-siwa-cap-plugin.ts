// https://github.com/capacitor-community/apple-sign-in/issues/108#issuecomment-1985047797
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonContents = `
{
	"name": "@capacitor-community/apple-sign-in",
	"version": "5.0.0",
	"description": "Capacitor Sign in with Apple",
	"main": "dist/esm/index.js",
	"types": "dist/esm/index.d.ts",
	"type": "module",
	"scripts": {
	  "verify": "npm run verify:ios && npm run verify:android && npm run verify:web",
	  "verify:ios": "cd ios && pod install && xcodebuild -workspace Plugin.xcworkspace -scheme Plugin && cd ..",
	  "verify:android": "cd android && ./gradlew clean build test && cd ..",
	  "verify:web": "npm run build",
	  "lint": "npm run eslint && npm run prettier -- --check && npm run swiftlint -- lint",
	  "fmt": "npm run eslint -- --fix && npm run prettier -- --write && npm run swiftlint -- autocorrect --format",
	  "eslint": "eslint . --ext ts",
	  "prettier": "prettier \\"**/*.{css,html,ts,js,java}\\"",
	  "swiftlint": "node-swiftlint",
	  "docgen": "docgen --api SignInWithApplePlugin --output-readme README.md --output-json dist/docs.json",
	  "build": "npm run clean && npm run docgen && tsc && rollup -c rollup.config.js",
	  "clean": "rimraf ./dist",
	  "watch": "tsc --watch",
	  "prepublishOnly": "npm run build",
	  "release": "np --any-branch --yolo"
	},
	"author": "Max Lynch <max@ionic.io>",
	"prettier": "@ionic/prettier-config",
	"swiftlint": "@ionic/swiftlint-config",
	"license": "MIT",
	"dependencies": {
	  "@types/scriptjs": "0.0.2",
	  "scriptjs": "^2.5.9"
	},
	"devDependencies": {
	  "@capacitor/android": "^5.0.0",
	  "@capacitor/cli": "^5.0.0",
	  "@capacitor/core": "^5.0.0",
	  "@capacitor/docgen": "0.0.17",
	  "@capacitor/ios": "^5.0.0",
	  "@ionic/eslint-config": "^0.3.0",
	  "@ionic/prettier-config": "^1.0.1",
	  "@ionic/swiftlint-config": "^1.1.2",
	  "eslint": "^7.11.0",
	  "np": "^7.4.0",
	  "prettier": "~2.3.0",
	  "prettier-plugin-java": "~1.0.2",
	  "rimraf": "^3.0.2",
	  "rollup": "^2.32.0",
	  "swiftlint": "^1.0.1",
	  "typescript": "~4.0.3"
	},
	"peerDependencies": {
	  "@capacitor/core": "^5.0.0"
	},
	"eslintConfig": {
	  "extends": "@ionic/eslint-config/recommended"
	},
	"files": [
	  "dist/",
	  "ios/",
	  "android/",
	  "CapacitorCommunityAppleSignIn.podspec"
	],
	"keywords": [
	  "capacitor",
	  "plugin",
	  "native"
	],
	"capacitor": {
	  "ios": {
		"src": "ios"
	  },
	  "android": {
		"src": "android"
	  }
	},
	"repository": {
	  "type": "git",
	  "url": "https://github.com/capacitor-community/apple-sign-in"
	},
	"bugs": {
	  "url": "https://github.com/capacitor-community/apple-sign-in/issues"
	}
  }
`;

const indexJsContents = `
import { registerPlugin } from '@capacitor/core';
const SignInWithApple = registerPlugin('SignInWithApple', {
    web: () => import('./web').then(m => new m.SignInWithAppleWeb()),
});
export { SignInWithApple };
//# sourceMappingURL=index.js.map
`;

const main = async () => {
	await fs.writeFile(
		`${__dirname}/../node_modules/@capacitor-community/apple-sign-in/dist/esm/index.js`,
		indexJsContents
	);
	await fs.writeFile(
		`${__dirname}/../node_modules/@capacitor-community/apple-sign-in/package.json`,
		packageJsonContents
	);
};

main();