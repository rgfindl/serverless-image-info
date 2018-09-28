# serverless-image-info

Doesn't work.  AWS Serverless Repo doesn't give the lambda enouph permission to send an email back.

https://docs.aws.amazon.com/serverlessrepo/latest/devguide/using-aws-sam.html#ses-crud-policy

## Package and Deploy
First lets create our Lambda function.

`npm run stack-up`

There is an output parameter called `ApiUrl` that you will need in the next step.  This will be your Twillio webhook url.

## AWS Setup
- Email Identity
- Email Rule Set
- Email sending permission (support ticket) https://aws.amazon.com/ses/extendedaccessrequest/