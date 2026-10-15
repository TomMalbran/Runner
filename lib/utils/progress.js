const FS = require("fs");



/**
 * Writes the given File to the output while it prints how much of it was sent
 * Used as: node progress.js <file> | <command that reads it>
 * @returns {void}
 */
function main() {
    const file  = process.argv[2];
    const total = FS.statSync(file).size;
    const toMB  = (bytes) => (bytes / 1024 / 1024).toFixed(1);

    // The output is the Archive, so the progress goes to the error output, which the
    // terminal shows, and it is only printed when the percent changes
    let sent    = 0;
    let percent = -1;
    const print = () => {
        const current = total > 0 ? Math.floor(sent * 100 / total) : 100;
        if (current !== percent) {
            percent = current;
            process.stderr.write(`\r ${percent}% (${toMB(sent)} of ${toMB(total)} MB)`);
        }
    };

    const stream = FS.createReadStream(file);
    stream.on("data", (chunk) => {
        sent += chunk.length;
        print();
    });
    stream.on("end", () => process.stderr.write("\n"));
    stream.pipe(process.stdout);
}

main();
