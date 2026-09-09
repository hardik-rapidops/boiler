'use strict';

const AWS = require('aws-sdk');
const fs = require('fs');
var request = require('request');
const multiparty = require('multiparty');
const { readFileSync } = require('fs');
const { join, extname } = require('path');
// The name of the bucket that you have created
const BUCKET_NAME = 'harsco-data.vensi.com';
const s3 = new AWS.S3({
    accessKeyId: 'AKIA54PBX7YRC7YNDN57',
   //secretAccessKey: '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'
});

module.exports = function (Boilerimage) {
    function mapHostname(hostname) {
        if (hostname === 'dev.nuroconnect.com') {
            return 'nuro-dev.harscopk.com';
        } else if (hostname === 'app.nuroconnect.com') {
            return 'nuro.harscopk.com';
        } else {
            return hostname;
        }
    }
    Boilerimage.remoteMethod(
        'view',
        {
            description: "Use this method to view the image of the boiler based on the name.",
            http: {path: '/view/:id', verb: 'get'},
            accepts: [
                {arg: 'id', type: 'string'},
                {arg: 'req', type: 'object', 'http': {source: 'req'}},
                {arg: 'res', type: 'object', 'http': {source: 'res'}}
            ],
            returns: [
                {arg: 'body', type: 'object', root: true}
            ],
            default: {"success": true}
        });

    Boilerimage.view = function (file, req, res, cb) {
        // Boilerimage.find({where: {id: file}}, function (err, result) {
        // });
        var S3FilesContainer = Boilerimage.app.models.S3FilesContainer;

        S3FilesContainer.download("harsco-data.vensi.com", mapHostname(req.hostname) +'/boilerImages/'+file, req, res, function (err, result) {
            if (err) {
                cb(null, {success: false});
            }
        });

    };

    Boilerimage.beforeRemote("deleteById", function (ctx, result, next) {
        var S3FilesContainer = Boilerimage.app.models.S3FilesContainer;
        S3FilesContainer.removeFile("harsco-data.vensi.com", mapHostname(ctx.req.hostname)+'/boilerImages/' + ctx.args.id, function (err, result) {
            next();
        });
    });

    Boilerimage.remoteMethod(
        'upload',
        {
            description: "Use this method to upload the latest Boiler images based on image name in model data.",
            http: {path: '/upload', verb: 'post'},
            accepts: [
                {arg: 'req', type: 'object', 'http': {source: 'req'}},
                {arg: 'res', type: 'object', 'http': {source: 'res'}}
            ],
            returns: {
                arg: 'response', type: 'object',
                default: {"success": true}
            }
        });

    // New Code
    const getFileFromRequest = (req) => new Promise((resolve, reject) => {
        const form = new multiparty.Form();
        form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            // console.log("files", files);
            const file = files['file'][0]; // get the file from the returned files object
            if (!file) reject('File was not found in form data.');
            else resolve(file);
        });
    });

    Boilerimage.upload = async function (req, res, cb) {
        console.log("upload");
        // var S3FilesContainer = Boilerimage.app.models.S3FilesContainer;
        // console.log("S3FilesContainer", JSON.stringify(S3FilesContainer))
        // s3.upload(req, res, {
        //     container: "harsco-data.vensi.com", getFilename: function (fileInfo, req, res) {
        //         var newFilename = mapHostname(req.hostname)+'/boilerImages/' + fileInfo.name;
        //         console.log("newFilename", newFilename);
        //         Boilerimage.create({id: fileInfo.name});
        //         return newFilename;
        //     }
        // }, function (err, result) {
        //     if (err) {
        //         cb({success: false}, null);
        //         return;
        //     }
        //     cb(null, {success: true});
        // });


        // New Code
        const form = new multiparty.Form();
        var brandValue;
        form.parse(req, (err, fields, files) => {
            console.log("err", err);
            console.log("fields", fields);
            console.log("files", files);
            if(fields.brand) {
                brandValue = fields['brand'][0];
            }
        });
        const file = await getFileFromRequest(req);
        console.log("file", file);
        //upload the file to s3

        // New Code
        const buffer = readFileSync(file.path);
        // const fileName = options.name || String(Date.now());
        const extension = extname(file.path);
        console.log("extension", extension);
        const params = {
            Bucket: BUCKET_NAME + '/' + mapHostname(req.hostname) +'/boilerImages',
            Key: file.originalFilename, // File name you want to save as in S3
            Body: buffer
        };
        console.log("params", params);
        s3.upload(params, function (err, data) {
            if (err) {
                console.log("err",err);
                // throw err;
                cb({ success: false }, null);
            } else {
                console.log("data",data);
                if(brandValue) {
                    var deleteque = {
                        "name": file.originalFilename,
                        "brand": brandValue
                    }
                    Boilerimage.remove(deleteque)
                    Boilerimage.create({name: file.originalFilename, brand: brandValue}); 
                } else {
                    var deletequery = {
                        "name": file.originalFilename,
                        "brand": { "$exists": false }
                    }
                    Boilerimage.remove(deletequery)
                    Boilerimage.create({name: file.originalFilename}); 
                }
                // Boilerimage.create({id: fileInfo.name});
                // cb(null, { success: true });
            }
            // cb(null, { success: true });
            // Boilerimage.create({id: file.originalFilename});
            // console.log(`File uploaded successfully. ${data.Location}`);
        });
    };

    Boilerimage.remoteMethod(
        'findByBrand',
        {
            description: "Private method, don't call this method.",
            http: {path: '/findByBrand', verb: 'get'},
            accepts: [
                {
                    arg: 'brand',
                    type: 'string'
                },
                { arg: 'req', type: 'object', http: { source: 'req' } },
                { arg: 'res', type: 'object', http: { source: 'res' } }
            ],
            returns: {
                arg: 'response',
                type: 'array',
                root: true
            }
        });

    Boilerimage.findByBrand = function (brand, req, res, cb) {
        var query;
        // if(brand) {
        //     query = {
        //         where: {
        //             "brand": brand
        //         }
        //     }
        // } else {
        //     query = {
        //         where: {
        //             "brand": { "$exists": false }
        //         }
        //     }
        // }
        var brandValue = brand ? brand : "0";
        query = {
            where: {
                "brand": brandValue
            }
        }
        Boilerimage.find(query, function (err, result) {
            res.status(200).send(result);
        })
    };

};
