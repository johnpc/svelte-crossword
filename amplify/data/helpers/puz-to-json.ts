const splitBufferAtNulls = (buf: Buffer) => {
	let arr = [],
		p = 0,
		start = 0,
		length = 0;

	for (let i = 0; i < buf.length; i++) {
		if (buf[i] === 0) {
			length = i;
			arr[p] = buf.slice(start, length);
			p++;
			start = length + 1;
		}
	}

	return arr;
};

// Thanks to research @ http://code.google.com/p/puz/wiki/FileFormat
const decode = (
	data: Buffer
): {
	header: {
		checksum: number;
		fileMagic: string;
		cibChecksum: number;
		maskedLowCheckSums: string;
		maskedHighCheckSums: string;
		version: string;
		reserved1C: string;
		scrambledChecksum: number;
		reserved20: string;
		width: number;
		height: number;
		scrambled: boolean;
		numberOfClues: number;
		unknownBitmask: number;
		scambledtag: number;
		title?: string;
		author?: string;
		copyright?: string;
	};
	puzzle: {
		solution: string;
		state: string;
	};
	details: {
		clues: string[];
	};
	clues: {
		across: Map<
			string,
			{ clue: string; y: number; x: number; answer: string; direction: 'across' | 'down' }
		>;
		down: Map<
			string,
			{ clue: string; y: number; x: number; answer: string; direction: 'across' | 'down' }
		>;
	};
	board: {
		x: number;
		y: number;
		letter: string;
		isBlank: boolean;
		acrossClue: number;
		downClue: number;
	}[][];
} => {
	// ********************* HEADER SECTION *********************
	const header = {
		checksum: data.slice(0x00, 0x00 + 0x02).readInt16LE(0),
		fileMagic: data.slice(0x02, 0x02 + 0x0b).toString(),
		cibChecksum: data.slice(0x0e, 0x0e + 0x02).readInt16LE(0),
		maskedLowCheckSums: data.slice(0x10, 0x10 + 0x04).toString('hex'),
		maskedHighCheckSums: data.slice(0x14, 0x14 + 0x04).toString('hex'),
		version: data.slice(0x18, 0x18 + 0x04).toString(),
		reserved1C: data.slice(0x1c, 0x1c + 0x02).toString('hex'),
		scrambledChecksum: data.slice(0x1e, 0x1e + 0x02).readInt16LE(0),
		reserved20: data.slice(0x20, 0x20 + 0x0c).toString('hex'),
		width: data.slice(0x2c, 0x2c + 0x01).readInt8(0),
		height: data.slice(0x2d, 0x2d + 0x01).readInt8(0),
		scrambled: data.slice(0x32, 0x32 + 0x01).readInt8(0) != 0,
		numberOfClues: data.slice(0x2e, 0x2e + 0x02).readInt16LE(0),
		unknownBitmask: data.slice(0x30, 0x30 + 0x02).readInt16LE(0),
		scambledtag: data.slice(0x32, 0x32 + 0x02).readInt16LE(0)
	};

	// ********************* PUZZLE LAYOUT AND STATE *********************

	const cells = header.width * header.height;
	const solutionStart = 0x34;
	const solutionEnd = solutionStart + cells;
	const stateStart = solutionStart + cells;
	const stateEnd = stateStart + cells;
	const puzzle = {
		solution: data.slice(solutionStart, solutionEnd).toString(),
		state: data.slice(stateStart, stateEnd).toString()
	};

	// ********************* STRING SECTION *********************

	const stringStart = stateEnd;
	let remainder = data.slice(stringStart);
	const fields = ['title', 'author', 'copyright'];
	let clueStart = 0;

	for (let i = 0, j = 0, fieldIndex = 0; i < remainder.length && fieldIndex < fields.length; i++) {
		const caret = remainder[i];
		if (caret === 0) {
			(header as any)[fields[fieldIndex]] = remainder.slice(j, i).toString();
			j = i + 1;
			fieldIndex++;
		}

		if (fieldIndex === 2) {
			clueStart = i + 1;
		}
	}

	const details = {
		clues: []
	} as { clues: string[] };

	remainder = data.slice(stringStart + clueStart + 1);
	const splitRemainder = splitBufferAtNulls(remainder);

	for (let i = 0; i < header.numberOfClues; i++) {
		details.clues.push(splitRemainder[i].toString());
	}

	const width = header.width;
	const height = header.height;

	const rows = new Array(height);
	let currentCell = 0;
	const acrossClues = {} as Map<
		string,
		{ clue: string; x: number; y: number; direction: 'across' | 'down'; answer: string }
	>;
	const downClues = {} as Map<
		string,
		{ clue: string; x: number; y: number; direction: 'across' | 'down'; answer: string }
	>;
	let clueNumber = 1; // which clue this is on the board
	let cluePointer = 0; // index into the array of clues

	const getClues = (cell: { x: number; y: number; letter: string; isBlank: boolean }) => {
		let acrossClue;
		let downClue;

		let assignedNumber = false;

		const isBlackCell = (x: number, y: number): boolean => {
			const coord = x + y * header.width;
			return puzzle.state[coord] === '.';
		};
		const needsAcrossNumber = function (x: number, y: number) {
			if (x === 0 || isBlackCell(x - 1, y)) {
				if (!isBlackCell(x, y)) {
					return true;
				}
			}
			return false;
		};
		const needsDownNumber = (x: number, y: number) => {
			if (y === 0 || isBlackCell(x, y - 1)) {
				if (!isBlackCell(x, y)) {
					return true;
				}
			}
			return false;
		};

		if (isBlackCell(cell.x, cell.y)) {
			return;
		}

		const getAnswer = (direction: 'across' | 'down', clueNumber: number) => {
			let currentCell = 0;
			const answerLetters = [];
			if (direction === 'across') {
				for (let i = 0; i < rows.length; i++) {
					const col = new Array(width);
					if (i !== clueNumber) {
						currentCell += col.length;
						continue;
					}
					for (let j = 0; j < col.length; j++) {
						if (puzzle.solution[currentCell] !== '.') {
							answerLetters.push(puzzle.solution[currentCell]);
						}
						currentCell++;
					}
				}
			} else {
				for (let i = 0; i < rows.length; i++) {
					const col = new Array(width);
					for (let j = 0; j < col.length; j++) {
						if (j === clueNumber && puzzle.solution[currentCell] !== '.') {
							answerLetters.push(puzzle.solution[currentCell]);
						}
						currentCell++;
					}
				}
			}
			return answerLetters.join('');
		};

		if (needsAcrossNumber(cell.x, cell.y)) {
			assignedNumber = true;
			(acrossClues as any)[clueNumber] = {
				clue: details.clues[cluePointer],
				y: cell.y,
				x: cell.x,
				direction: 'across',
				answer: getAnswer('across', cell.y)
			};
			acrossClue = clueNumber;
			cluePointer += 1;
		}

		if (needsDownNumber(cell.x, cell.y)) {
			assignedNumber = true;
			(downClues as any)[clueNumber] = {
				clue: details.clues[cluePointer],
				y: cell.y,
				x: cell.x,
				answer: getAnswer('down', cell.x),
				direction: 'down'
			};
			downClue = clueNumber;
			cluePointer += 1;
		}

		if (assignedNumber) {
			clueNumber += 1;
		}

		return {
			...cell,
			acrossClue,
			downClue
		};
	};

	for (let i = 0; i < rows.length; i++) {
		const col = new Array(width);

		for (let j = 0; j < col.length; j++) {
			const cell = {
				x: j,
				y: i,
				letter: puzzle.solution[currentCell],
				isBlank: puzzle.solution[currentCell] === '.'
			};
			col[j] = cell;
			currentCell += 1;

			getClues(cell);
		}
		rows[i] = col;
	}

	const clues = {
		across: acrossClues,
		down: downClues
	};
	const board = rows;

	// ********************* SPECIAL SECTION *********************

	if (remainder.length > header.numberOfClues) {
		// Found a special section
	}

	return {
		header,
		puzzle,
		details,
		clues,
		board
	};
};

export const puzToJson = (puzFileBlob: Buffer) => {
	return decode(puzFileBlob);
};
