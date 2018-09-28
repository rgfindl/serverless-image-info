const _ = require('lodash');
const exif = require('exif-parser');
const AWS = require('aws-sdk');
const { simpleParser } = require('mailparser');


const s3 = new AWS.S3();
const ses = new AWS.SES();

const functions = {};

functions.getExifData = async (buffer) => {
  const exifParser = exif.create(buffer);
  return exifParser.parse();
};

exports.handler = async (event, context, callback) => {
  console.log(JSON.stringify(event));
  try {
    // Fetch the email from S3.
    const { messageId } = event.Records[0].ses.mail;
    const s3EmailObject = await s3.getObject({
      Bucket: process.env.SesBucket,
      Key: messageId
    }).promise();

    // Parse the email.
    const email = await simpleParser(s3EmailObject.Body);

    // If there are jpeg attachments, fetch the exif data.
    const exifData = [];
    _.forEach(email.attachments, (attachment) => {
      const exifParser = exif.create(attachment.content);
      exifData.push(exifParser.parse());
    });

    // Create email response
    const body = _.join(_.map(exifData, (data) => {
      const googleMapsLink = `http://www.google.com/maps/place/${data.tags.GPSLatitude},${data.tags.GPSLongitude}`;
      return _.join([data.tags.Make, data.tags.Model, googleMapsLink], '\n');
    }), '\n');

    // Send an email back to the sender with the exif data.
    console.log(JSON.stringify({
      Destination: {
        ToAddresses: [email.from.value[0].address]
      },
      Message: {
        Body: {
          Text: {
            Charset: 'UTF-8',
            Data: body
          }
        },
        Subject: {
          Charset: 'UTF-8',
          Data: 'Image Info Response'
        }
      },
      Source: email.to.value[0].address
    }, null, 3));
    await ses.sendEmail({
      Destination: {
        ToAddresses: [email.from.value[0].address]
      },
      Message: {
        Body: {
          Text: {
            Charset: 'UTF-8',
            Data: body
          }
        },
        Subject: {
          Charset: 'UTF-8',
          Data: 'Image Info Response'
        }
      },
      Source: email.to.value[0].address
    }).promise();
    return callback(null, 'done');
  }
  catch (err) {
    console.error(err);
    return callback(err, 'error');
  }
};
