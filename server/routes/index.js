module.exports = function (app) {
  app.use(require("./upload.route"));
  app.use(require("./users.route"));
  app.use(require("./candidateLoginSignup.route"));
  app.use(require("./master.route"));
  app.use(require("./branchDetails.route"));
  app.use(require("./rolePage.route"));
  app.use(require('./candidateDetails.route'))
  app.use(require('./candidatePaymentSchedule.route'))
  app.use(require('./vacate.route'))
  app.use(require('./dashboard.route'))
  app.use(require('./complaints.route'))
  app.use(require('./notification.route'))
  app.use(require('./sendInvoice.route'))
  app.use(require('./serviceProvider.route'))
  app.use(require('../controllers/bulk-upload/bulkUpload.controller'))
};
