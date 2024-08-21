import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as component from "./component";

const myapi = new component.AppSyncResource("name", {})


// const east1 = new aws.Provider("east1", {
//     region: "us-east-1"
// })

// const cert = new aws.acm.Certificate("pk-test-2", {
//     domainName: "pk-appsynctest3.pulumi-ce.team",
//     validationMethod: "DNS",
// }, {provider: east1});

// const zone = aws.route53.getZone({
//     name: "pulumi-ce.team",
//     privateZone: false,
// });

// const certValidationRecords = cert.domainValidationOptions.apply(options => {
//     const exampleRecord: aws.route53.Record[] = [];
//     options.map(option => {
//         exampleRecord.push(new aws.route53.Record(`example-${option.domainName}`, {
//             allowOverwrite: true,
//             name: option.resourceRecordName,
//             records: [option.resourceRecordValue],
//             ttl: 60,
//             type: aws.route53.RecordType[option.resourceRecordType],
//             zoneId: zone.then(x => x.zoneId)
//         }))
//     })
//     return exampleRecord
// });

// const exampleCertificateValidation = new aws.acm.CertificateValidation("example", {
//     certificateArn: cert.arn,
//     validationRecordFqdns: certValidationRecords.apply(records => records.map(record => record.fqdn)),
// }, {provider: east1});

// const appsyncDomainName = new aws.appsync.DomainName("domainName", {
//     certificateArn: cert.arn,
//     domainName: "pk-appsynctest3.pulumi-ce.team"
// }, {dependsOn: exampleCertificateValidation})

// const api = new aws.appsync.GraphQLApi("api", {
//     authenticationType: "API_KEY",
//     introspectionConfig: "ENABLED",
//     name: "pk-test",
//     visibility: "GLOBAL",
// });

// const domainNameAssociation = new aws.appsync.DomainNameApiAssociation("assoc", {
//     apiId: api.id,
//     domainName: "pk-appsynctest3.pulumi-ce.team"
// }, {dependsOn: [appsyncDomainName]})
