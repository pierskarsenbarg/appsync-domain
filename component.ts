import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

interface AppSyncResourceArgs {
  
}

export class AppSyncResource extends pulumi.ComponentResource {
  public readonly api: aws.appsync.GraphQLApi;

  public readonly domainName: aws.appsync.DomainName;

  public readonly wafAssociations: aws.wafv2.WebAclAssociation[] = [];

  public readonly dataSources: { [id: string]: aws.appsync.DataSource } = {};

  public readonly resolvers: aws.appsync.Resolver[] = [];

  public readonly functions: aws.appsync.Function[] = [];

  // public readonly cache: aws.appsync.ApiCache;

  /**
   * The constructor function is the first function that is called when a new object is created from a
   * class
   * @param {string} name - The name of the resource.
   * @param {RoleResourceArgs} args - RoleResourceArgs
   */
  constructor(public name: string, public args: AppSyncResourceArgs) {
    super("x:aws:appsync:GraphQLApi", name, {}, {});

    //   const appsyncRole = createAssumedRole(
    //     `${name}-iam-role`,
    //     aws.iam.Principals.AppSyncPrincipal,
    //     [aws.iam.ManagedPolicies.CloudWatchLogsFullAccess],
    //     { replaceOnChanges: ['permissionsBoundary'], deleteBeforeReplace: true },
    //   );

    this.api = new aws.appsync.GraphQLApi("api", {
      authenticationType: "API_KEY",
      introspectionConfig: "ENABLED",
      name: "pk-test",
      visibility: "GLOBAL",
    });

    //   this.api = new aws.appsync.GraphQLApi(
    //     name,
    //     {
    //       logConfig: {
    //         cloudwatchLogsRoleArn: appsyncRole.arn,
    //         fieldLogLevel: 'ALL',
    //       },
    //       visibility: 'GLOBAL',
    //       ...args.appSync.args,
    //     },
    //     args.appSync.opts,
    //   );
    //   if (!args.stopDomainNameCreation) {
    const usEast1Provider = new aws.Provider("usEast1", {
      region: "us-east-1",
    });

    const east1 = new aws.Provider("east1", {
      region: "us-east-1",
    });

    const zone = aws.route53.getZone({
      name: "pulumi-ce.team",
      privateZone: false,
    });

    const dnsRecord = new aws.route53.Record("dnsrecord", {
      zoneId: zone.then((x) => x.zoneId),
      type: aws.route53.RecordType.CNAME,
      records: [this.api.uris.GRAPHQL.apply((uri) => new URL(uri).hostname)],
      ttl: 60,
      name: "pk-appsynctest3.pulumi-ce.team",
    });

    const cert = new aws.acm.Certificate(
      "pk-test-2",
      {
        domainName: dnsRecord.name,
        validationMethod: "DNS",
      },
      { provider: east1 }
    );

    const certValidationRecords = cert.domainValidationOptions.apply(
      (options) => {
        const exampleRecord: aws.route53.Record[] = [];
        options.map((option) => {
          exampleRecord.push(
            new aws.route53.Record(`example-${option.domainName}`, {
              allowOverwrite: true,
              name: option.resourceRecordName,
              records: [option.resourceRecordValue],
              ttl: 60,
              type: aws.route53.RecordType[option.resourceRecordType],
              zoneId: zone.then((x) => x.zoneId),
            })
          );
        });
        return exampleRecord;
      }
    );

    const exampleCertificateValidation = new aws.acm.CertificateValidation(
      "example",
      {
        certificateArn: cert.arn,
        validationRecordFqdns: certValidationRecords.apply((records) =>
          records.map((record) => record.fqdn)
        ),
      },
      { provider: east1 }
    );

    this.domainName = new aws.appsync.DomainName(`${name}-domain`, {
      certificateArn: cert.arn,
      domainName: dnsRecord.name,
    }, {dependsOn: [exampleCertificateValidation]});

    new aws.appsync.DomainNameApiAssociation(
      `${name}-domain-association`,
      {
        apiId: this.api.id,
        domainName: this.domainName.domainName,
      },
      { dependsOn: [this.domainName] }
    );
    //   }

    //   forEach(args.wafARNs ?? AppSyncResource.getDefaultWAFARNs(), (wafARN) => {
    //     this.wafAssociations.push(new aws.wafv2.WebAclAssociation(`${name}-waf-association`, {
    //       resourceArn: this.api.arn,
    //       webAclArn: wafARN,
    //     }));
    //   });

    //   forEach(args.dataSources, (dataSource) => {
    //     this.dataSources[dataSource.args.name] = new aws.appsync.DataSource(
    //       dataSource.args.name,
    //       {
    //         apiId: this.api.id,
    //         ...dataSource.args,
    //       },
    //       dataSource.opts,
    //     );
    //   });

    //   forEach(args.resolvers, (resolver) => {
    //     this.resolvers.push(new aws.appsync.Resolver(
    //       resolver.args.name,
    //       {
    //         apiId: this.api.id,
    //         ...resolver.args,
    //       },
    //       {
    //         dependsOn: pulumi.all([resolver.args.dataSource]).apply(([dataSource]) => this.dataSources[dataSource]),
    //         ...resolver.opts,
    //       },
    //     ));
    //   });

    //   forEach(args.functions, (appFunction) => {
    //     this.functions.push(new aws.appsync.Function(
    //       appFunction.args.name,
    //       {
    //         apiId: this.api.id,
    //         ...appFunction.args,
    //       },
    //       {
    //         dependsOn: pulumi.all([appFunction.args.dataSource]).apply(([dataSource]) => this.dataSources[dataSource]),
    //         ...appFunction.opts,
    //       },
    //     ));
    //   });

    //   if (args.cache) {
    //     this.cache = new aws.appsync.ApiCache(
    //       `${name}-cache`,
    //       {
    //         apiId: this.api.id,
    //         transitEncryptionEnabled: true,
    //         atRestEncryptionEnabled: true,
    //         ...args.cache.args,

    //       },
    //       args.cache.opts,
    //     );
    //   }
  }

  // private static async getDefaultWAFARNs() {
  //   const schemaWAFACL = await ParameterResource.getParameterResource(SHARED_WAF_ACL.ACL_BLOCK_GRAPHQL_SCHEMA_NOT_MATCHED);
  //   const largeBodyWAFACL = await ParameterResource.getParameterResource(SHARED_WAF_ACL.ACL_BLOCK_LARGE_BODY);
  //   return [schemaWAFACL.value(), largeBodyWAFACL.value()];
  // }
}
