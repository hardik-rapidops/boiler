
var nodemailer = require('nodemailer');

var ses = require('nodemailer-ses-transport');

var transporter = nodemailer.createTransport(ses({
    accessKeyId: 'AKIA54PBX7YRC7YNDN57',
    //secretAccessKey: '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',
    correctClockSkew : true,
}));

var Mails = function() {

};

Mails.templates = {

    forgotPassword : {
        subject: "Password Reset",
        body: "Dear {username}, <br/> <br/> Please click <a href='{link}'> here </a> to reset your password.<br/><br/> If you are having trouble, copy paste the link below into your browser.<br/> {link}  <br/> <br/>Regards, <br/> Nuro Connect Team"
    },

    confirm : {
        subject : "Account Verification",
        body: "Dear {username}, <br/> <br/> Please click <a href='{link}'> here </a> to activate your account.<br/><br/> If you are having trouble, copy paste the link below into your browser.<br/> {link}  <br/> <br/>Regards, <br/> Nuro Connect Team"
    },

    invitation : {
      subject : "Invitation - Site Access ",
      body: "Dear {username}, <br/> <br /> You are invited to access a new site and boilers in this site. Please click <a href='{link}'>here</a> to access your account.<br/><br/> If you are having trouble, copy paste the link below into your browser.<br/> {link}  <br/> <br/>Regards, <br/> Nuro Connect Team"
    },

    userroleinvitation : {
        subject : "Invitation - User role Access ",
        body: "Dear {username}, <br/> <br /> You are invited to access a new role. Please click <a href='{link}'>here</a> to access your account.<br/><br/> If you are having trouble, copy paste the link below into your browser.<br/> {link}  <br/> <br/>Regards, <br/> Nuro Connect Team"
    }
};


function send(options, next) {
    options.from = '"Patterson-Kelley" <no_reply@nuroconnect.com>';
    transporter.sendMail(options,next);
}

Mails.send = send;

module.exports = Mails;
