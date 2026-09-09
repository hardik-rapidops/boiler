'use strict';

const AWS = require('aws-sdk');
const fs = require('fs');
var request = require('request');
const multiparty = require('multiparty');
const { readFileSync } = require('fs');
const { join, extname } = require('path');

const ID = '';
const SECRET = '';

// The name of the bucket that you have created
const BUCKET_NAME = 'harsco-data.vensi.com';
const s3 = new AWS.S3({
    accessKeyId: 'AKIA54PBX7YRC7YNDN57',
    //secretAccessKey: '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'
});

module.exports = function (Boilerfile) {
    function mapHostname(hostname) {
        if (hostname === 'dev.nuroconnect.com') {
            return 'nuro-dev.harscopk.com';
        } else if (hostname === 'app.nuroconnect.com') {
            return 'nuro.harscopk.com';
        } else {
            return 'nuro-dev.harscopk.com';
        }
    }

    //TODO: may be limit to one file download per user?

    Boilerfile.remoteMethod(
        'upload',
        {
            description: "Boiler to call this method to upload the file based on the id.",
            http: { path: '/:id/upload', verb: 'post' },
            accepts: [
                { arg: 'req', type: 'object', 'http': { source: 'req' } },
                { arg: 'res', type: 'object', 'http': { source: 'res' } },
                { arg: 'id', type: 'string' }
            ],
            returns: { arg: 'status', type: 'string' }
        }
    );

    // Boilerfile.upload = function (req, res, file_id, cb) {
    //     //check if the id exists or not
    //     console.log('upload', req)
    //     Boilerfile.find({ where: { id: file_id } })
    //         .then(function (result) {
    //             //make sure it is not previously uploaded
    //             result[0].uploadComplete = false;
    //             if (result.length === 1 && result[0].uploadComplete !== true) {
    //                 var fileRecord = result[0];
    //                 console.log(fileRecord);
    //                 //upload the file to s3
    //                 // var S3FilesContainer = Boilerfile.app.models.S3FilesContainer;
    //                 // // console.log('S3FilesContainer', S3FilesContainer)
    //                 // S3FilesContainer.upload(req, res, {
    //                 //     container: "harsco-data.vensi.com", getFilename: function (fileInfo, req, res) {
    //                 //         //use the id as file name and the extension provided
    //                 //         var origFilename = fileInfo.name;
    //                 //         var parts = origFilename.split('.'),
    //                 //             extension = parts[parts.length - 1];
    //                 //         var newFilename = mapHostname(req.hostname)+'/boilerUploads/'+file_id + '.' + extension;
    //                 //         return newFilename;
    //                 //     }
    //                 // }, function (err, result) {
    //                 //     console.log("err", err);
    //                 //     console.log("result", result);
    //                 //     if(!err) {
    //                 //         //update the complete flag to true
    //                 //         fileRecord.updateAttributes({uploadComplete:true}, function (err, result) {
    //                 //             cb(null, {success: true});
    //                 //         });
    //                 //     } else {
    //                 //         cb({success: false}, null);
    //                 //     }
    //                 // });
    //                 // var file = req.files.file
    //                 // console.log(req.body)

    //                 let bits = req.body.filePath.split(".");
    //                 let lastOne = bits[bits.length - 1];
    //                 request.get(req.body.filePath, function (error, response, body) {
    //                     if (!error && response.statusCode == 200) {
    //                         // var csv = body;
    //                         // Continue with your processing here.
    //                         const params = {
    //                             Bucket: BUCKET_NAME + '/' + mapHostname(req.hostname) + '/boilerUploads',
    //                             Key: file_id + '.' + lastOne, // File name you want to save as in S3
    //                             Body: body
    //                         };
    //                         // Uploading files to the bucket
    //                         s3.upload(params, function (err, data) {
    //                             if (err) {
    //                                 // throw err;
    //                                 cb({ success: false }, null);
    //                             }
    //                             fileRecord.updateAttributes({ uploadComplete: true }, function (err, result) {
    //                                 cb(null, { success: true });
    //                             });
    //                             // console.log(`File uploaded successfully. ${data.Location}`);
    //                         });
    //                     }
    //                 });
    //                 // Setting up S3 upload parameters
    //             }
    //             else {
    //                 cb({ success: false }, null);
    //             }
    //         }
    //         );
    // };

    // New Code

    const getFileFromRequest = (req) => new Promise((resolve, reject) => {
        const form = new multiparty.Form();
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          const file = files['uploadedfile'][0]; // get the file from the returned files object
          if (!file) reject('File was not found in form data.');
          else resolve(file);
        });
      });

    Boilerfile.upload = function (req, res, file_id, cb) {
        //check if the id exists or not
        Boilerfile.find({ where: { id: file_id } })
            .then(async function (result) {
                //make sure it is not previously uploaded
                // result[0].uploadComplete = false;
                if (result.length === 1 && result[0].uploadComplete !== true) {
                    var fileRecord = result[0];
                    // console.log(fileRecord);
                    const file = await getFileFromRequest(req);
                    // console.log("file", file);
                    //upload the file to s3

                    // New Code
                    const buffer = readFileSync(file.path);
                    // const fileName = options.name || String(Date.now());
                    const extension = extname(file.path);
                    const params = {
                        Bucket: BUCKET_NAME + '/' + mapHostname(req.hostname) + '/boilerUploads',
                        Key: file_id + extension, // File name you want to save as in S3
                        Body: buffer
                    };
                    // Uploading files to the bucket
                    s3.upload(params, function (err, data) {
                        console.log("data", data);
                        console.log("err", err);
                        if (err) {
                            // throw err;
                            cb({ success: false }, null);
                        }
                        fileRecord.updateAttributes({ uploadComplete: true }, function (err, result) {
                            cb(null, { success: true });
                        });
                        // console.log(`File uploaded successfully. ${data.Location}`);
                    });
                }
                else {
                    cb({ success: false }, null);
                }
            }
            );
    };

    // New Code

    Boilerfile.remoteMethod(
        'download',
        {
            description: "Client to call this method to get the file uploaded by the boiler, returns error if not ready.",
            http: { path: '/:id/download', verb: 'get' },
            accepts: [
                { arg: 'req', type: 'object', 'http': { source: 'req' } },
                { arg: 'res', type: 'object', 'http': { source: 'res' } },
                { arg: 'id', type: 'string' }
            ],
            returns: { arg: 'status', type: 'string' }
        }
    );

    Boilerfile.download = function (req, res, file_id, cb) {
        console.log(file_id);
        //check if the id exists or not
        Boilerfile.find({ where: { id: file_id } })
            .then(function (result) {
                //check if upload is complete
                if (result.length === 1 && result[0].uploadComplete === true) {
                    //TODO: check if the user that requested the file is the one that is downloading

                    var fileType = 'png';
                    switch (result[0].fileType) {
                        case '2':
                            fileType = 'pkparams';
                            break;

                        case '3': fileType = 'errors';
                            break;
                    }

                    // const params = {
                    //     Bucket: BUCKET_NAME + '/' + mapHostname(req.hostname) + '/boilerUploads',
                    //     Key: file_id + '.' + fileType,
                    // };

                    // s3.getObject(params, (err, data) => {
                    //     console.log(data);
                    //     if (err) console.error(err);
                    //     fs.writeFileSync(file_id + '.' + fileType, data.Body.toString());
                    //     console.log(`file has been created!`);

                    //     console.log(fs.writeFileSync(file_id + '.' + fileType, data.Body.toString()));
                    //     // cb(null, { success: true });
                    // });

                    //download file and send to client
                    var S3FilesContainer = Boilerfile.app.models.S3FilesContainer;
                    S3FilesContainer.download("harsco-data.vensi.com", mapHostname(req.hostname) + '/boilerUploads/' + file_id + '.' + fileType, req, res, function (err, result) {
                        console.log(err, result);
                        //TODO: once the file is viewed, delete the file from the storage
                        if (err) {
                            cb(null, { success: false });
                        }
                    });
                }
                else {
                    cb(null, { success: false });
                }
            });
    };
};
