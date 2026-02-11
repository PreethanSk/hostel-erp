const cron = require('node-cron');
const { generateCandidatePaymentSchedules } = require('../controllers/candidatePaymentSchedule.controller');

let isRunning = false;
// (async () => {
//     try {
//         await generateCandidatePaymentSchedules({ query: { force: "true" } }, { status: () => ({ json: () => null }) });
//     } catch (error) {
//         console.error("Error in cron job:", error)
//     }
// })();
cron.schedule('0 2 * * *', async () => {
    if (isRunning) {
        console.log("Cron already running. Skipping...")
        return;
    }
    isRunning = true;
    try {
        await generateCandidatePaymentSchedules({}, { status: () => ({ json: () => null }) });
    } catch (error) {
        console.error("Error in cron job:", error)
    } finally {
        isRunning = false
    }
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
});

console.log('Cron job has been scheduled.');