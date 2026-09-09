const truncator = require('./truncator');
const compactor = require('./compactor');

const EXECUTION_HOUR = 17;
const TIMER_CHECK_TIME = 50 * 60 * 60 * 1000; // NOTE: make this check between 30 and 59 minutes, but not even, so that time drifts
const DB_NAME = 'harsco';
const URL = 'mongodb://localhost:27017/' + DB_NAME; // + '?socketTimeoutMS=' + (30 * 60 * 1000);
const COLLECTION_NAME = 'BoilerReadRecord';

const MINUTES = 60 * 1000;
const HOURS = 60 * MINUTES;
const DAYS = 24 * HOURS;
const AGGREGATION_INTERVAL = 5 * MINUTES;
const COMPACTION_OFFSET = 31 * DAYS;
const TRUNCATION_OFFSET = 3 * 366 * DAYS;
const GENEROUS_RERUN_TIME = 90 * DAYS; // 90 days in between potentially failed and fixed run

function run() {
    let NOW_TS = Date.now();
    console.log('Running pacman at', NOW_TS);

    // round "now" to to the nearest aggregation timestamp. We don't want to delete stuff in the middle of compacting interval.
    // Otherwise it will offset averages etc.
    NOW_TS -= NOW_TS % AGGREGATION_INTERVAL;

    const COMPACT_YOUNG_TS = NOW_TS - COMPACTION_OFFSET; // 32 days
    const TRUNCATE_TS = NOW_TS - TRUNCATION_OFFSET; // ~ 1 year

    // we should stop right on the rounded timestamp of TRUNCATE_YOUNGEST, where truncation will end just before it
    // const COMPACT_OLD_TS = TRUNCATE_TS;

    // NOTE: ---- OPTIMIZATION ---- AFTER THE FIRST RUN, MAKE THIS VALUE COMPACT_YOUNG_TS - GENEROUS_RERUN_TIME
    const COMPACT_OLD_TS = COMPACT_YOUNG_TS - GENEROUS_RERUN_TIME;

    function runTruncator() {
        return truncator.truncate({
            url: URL,
            dbName: DB_NAME,
            collection: COLLECTION_NAME,
            cutoffTs: TRUNCATE_TS
        }, DB_NAME)
            .catch(function (err) {
                console.error("PACMAN TRUNCATOR FAILED:", err);
                process.exit(-1);
            })
            ;
    }

    function runCompactor() {
        compactor.compact({
            url: URL,
            dbName: DB_NAME,
            collection: COLLECTION_NAME,
            interval: AGGREGATION_INTERVAL,
            oldTs: COMPACT_OLD_TS,
            youngTs: COMPACT_YOUNG_TS,
        }, DB_NAME).then(function (result) {
            console.log('Blocks:', result.blocks, 'Deleted:', result.deleted, 'Already Processed', result.skipped);
            if (result.errors > 0) {
                console.log('Data Errors:' + result.errors);
            }
            console.log('Pacman complete in', (Date.now() - NOW_TS) / 1000, 's');
        })
            .catch(function (err) {
                console.error("PACMAN COMPACTOR FAILED:", err);
                process.exit(-1);
            });
    }

    runTruncator().then(runCompactor);
}

function checkIfNeedsToRun() {
    const now = new Date();
    if (now.getHours() === EXECUTION_HOUR) {
        run();
    } else {
        console.log('Not running at hour', now.getHours(), 'Waiting for hour', EXECUTION_HOUR);
    }
}

// this code was for the old execution method where we were running all the time and checking for hour. We now use cron.
//setInterval(checkIfNeedsToRun, TIMER_CHECK_TIME);
//checkIfNeedsToRun();

run();