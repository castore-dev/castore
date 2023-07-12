"use strict";(self.webpackChunk_castore_docs_docusaurus=self.webpackChunk_castore_docs_docusaurus||[]).push([[579],{55571:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>i,default:()=>u,frontMatter:()=>o,metadata:()=>s,toc:()=>p});var a=n(28427),r=(n(2784),n(30876));const o={sidebar_position:5},i="DynamoDB Event Storage Adapter",s={unversionedId:"resources/dynamodb-event-storage-adapter",id:"resources/dynamodb-event-storage-adapter",title:"DynamoDB Event Storage Adapter",description:"DRY Castore EventStorageAdapter implementation using AWS DynamoDB.",source:"@site/docs/5-resources/5-dynamodb-event-storage-adapter.md",sourceDirName:"5-resources",slug:"/resources/dynamodb-event-storage-adapter",permalink:"/castore/docs/resources/dynamodb-event-storage-adapter",draft:!1,editUrl:"https://github.com/castor-dev/docusaurus/tree/main/packages/create-docusaurus/templates/shared/docs/5-resources/5-dynamodb-event-storage-adapter.md",tags:[],version:"current",sidebarPosition:5,frontMatter:{sidebar_position:5},sidebar:"tutorialSidebar",previous:{title:"Zod Event",permalink:"/castore/docs/resources/zod-event"},next:{title:"Redux Event Storage Adapter",permalink:"/castore/docs/resources/redux-event-storage-adapter"}},l={},p=[{value:"\ud83d\udce5 Installation",id:"-installation",level:2},{value:"Table of content",id:"table-of-content",level:2},{value:"<code>DynamoDbSingleTableEventStorageAdapter</code>",id:"dynamodbsingletableeventstorageadapter",level:2},{value:"\ud83d\udc69\u200d\ud83d\udcbb Usage",id:"-usage",level:3},{value:"\ud83e\udd14 How it works",id:"-how-it-works",level:3},{value:"\ud83d\udcdd Examples",id:"-examples",level:3},{value:"CloudFormation",id:"cloudformation",level:4},{value:"CDK",id:"cdk",level:4},{value:"Terraform",id:"terraform",level:4},{value:"\ud83e\udd1d EventGroups",id:"-eventgroups",level:3},{value:"\ud83d\udd11 IAM",id:"-iam",level:3},{value:"\ud83d\udcf8 <code>ImageParser</code>",id:"-imageparser",level:3},{value:"Legacy <code>DynamoDbEventStorageAdapter</code>",id:"legacy-dynamodbeventstorageadapter",level:2},{value:"\ud83d\udc69\u200d\ud83d\udcbb Usage",id:"-usage-1",level:3},{value:"\ud83e\udd14 How it works",id:"-how-it-works-1",level:3},{value:"\ud83d\udcdd Examples",id:"-examples-1",level:3},{value:"CloudFormation",id:"cloudformation-1",level:4},{value:"CDK",id:"cdk-1",level:4},{value:"Terraform",id:"terraform-1",level:4},{value:"\ud83e\udd1d EventGroups",id:"-eventgroups-1",level:3},{value:"\ud83d\udd11 IAM",id:"-iam-1",level:3}],m={toc:p},d="wrapper";function u(e){let{components:t,...n}=e;return(0,r.kt)(d,(0,a.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"dynamodb-event-storage-adapter"},"DynamoDB Event Storage Adapter"),(0,r.kt)("p",null,"DRY Castore ",(0,r.kt)("a",{parentName:"p",href:"https://castore-dev.github.io/castore/docs/the-basics/#eventstorageadapter"},(0,r.kt)("inlineCode",{parentName:"a"},"EventStorageAdapter"))," implementation using ",(0,r.kt)("a",{parentName:"p",href:"https://aws.amazon.com/dynamodb/"},"AWS DynamoDB"),"."),(0,r.kt)("h2",{id:"-installation"},"\ud83d\udce5 Installation"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-bash"},"# npm\nnpm install @castore/dynamodb-event-storage-adapter\n\n# yarn\nyarn add @castore/dynamodb-event-storage-adapter\n")),(0,r.kt)("p",null,"This package has ",(0,r.kt)("inlineCode",{parentName:"p"},"@castore/core")," and ",(0,r.kt)("inlineCode",{parentName:"p"},"@aws-sdk/client-dynamodb")," (above v3) as peer dependencies, so you will have to install them as well:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-bash"},"# npm\nnpm install @castore/core @aws-sdk/client-dynamodb\n\n# yarn\nyarn add @castore/core @aws-sdk/client-dynamodb\n")),(0,r.kt)("h2",{id:"table-of-content"},"Table of content"),(0,r.kt)("p",null,"This library exposes two adapters:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"DynamoDbSingleTableEventStorageAdapter")," which can plug several event stores to a single DynamoDB table."),(0,r.kt)("li",{parentName:"ul"},"(",(0,r.kt)("em",{parentName:"li"},"deprecated"),") ",(0,r.kt)("inlineCode",{parentName:"li"},"DynamoDbEventStorageAdapter")," which needs a DynamoDB table per event store.")),(0,r.kt)("p",null,"The legacy ",(0,r.kt)("inlineCode",{parentName:"p"},"DynamoDbEventStorageAdapter")," is still exposed for backward compatibility. It will be deprecated and renamed ",(0,r.kt)("inlineCode",{parentName:"p"},"LegacyDynamoDbEventStorageAdapter")," in the v2, to be finally removed in the v3."),(0,r.kt)("p",null,"Documentation:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"#dynamodbsingletableeventstorageadapter"},(0,r.kt)("inlineCode",{parentName:"a"},"DynamoDbSingleTableEventStorageAdapter")),(0,r.kt)("ul",{parentName:"li"},(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"#-usage"},"\ud83d\udc69\u200d\ud83d\udcbb Usage")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"#-how-it-works"},"\ud83e\udd14 How it works")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"#-examples"},"\ud83d\udcdd Examples"),(0,r.kt)("ul",{parentName:"li"},(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"#cloudformation"},"CloudFormation")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"#cdk"},"CDK")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"#terraform"},"Terraform")))),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"#-eventgroups"},"\ud83e\udd1d EventGroups")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"#-iam"},"\ud83d\udd11 IAM")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"#-imageparser"},"\ud83d\udcf8 ",(0,r.kt)("inlineCode",{parentName:"a"},"ImageParser"))))),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"#legacy-dynamodbeventstorageadapter"},(0,r.kt)("inlineCode",{parentName:"a"},"DynamoDbEventStorageAdapter")))),(0,r.kt)("h2",{id:"dynamodbsingletableeventstorageadapter"},(0,r.kt)("inlineCode",{parentName:"h2"},"DynamoDbSingleTableEventStorageAdapter")),(0,r.kt)("h3",{id:"-usage"},"\ud83d\udc69\u200d\ud83d\udcbb Usage"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"import { DynamoDBClient } from '@aws-sdk/client-dynamodb';\n\nimport { DynamoDbSingleTableEventStorageAdapter } from '@castore/dynamodb-event-storage-adapter';\n\nconst dynamoDbClient = new DynamoDBClient({});\n\nconst pokemonsEventsStorageAdapter = new DynamoDbSingleTableEventStorageAdapter(\n  {\n    tableName: 'my-table-name',\n    dynamoDbClient,\n  },\n);\n\n// \ud83d\udc47 Alternatively, provide a getter\nconst pokemonsEventsStorageAdapter =\n  new DynamoDbSingleTableEventStorageAdapter({\n    tableName: () => process.env.MY_TABLE_NAME,\n    dynamoDbClient,\n  });\n\nconst pokemonsEventStore = new EventStore({\n  ...\n  storageAdapter: pokemonsEventsStorageAdapter,\n});\n")),(0,r.kt)("p",null,"This will directly plug your EventStore to DynamoDB \ud83d\ude4c"),(0,r.kt)("h3",{id:"-how-it-works"},"\ud83e\udd14 How it works"),(0,r.kt)("p",null,"This adapter persists aggregates in ",(0,r.kt)("strong",{parentName:"p"},"separate partitions"),": When persisting an event, its ",(0,r.kt)("inlineCode",{parentName:"p"},"aggregateId"),", prefixed by the ",(0,r.kt)("inlineCode",{parentName:"p"},"eventStoreId"),", is used as partition key (",(0,r.kt)("em",{parentName:"p"},"string")," attribute) and its ",(0,r.kt)("inlineCode",{parentName:"p"},"version")," is used as sort key (",(0,r.kt)("em",{parentName:"p"},"number")," attribute)."),(0,r.kt)("p",null,"A ",(0,r.kt)("a",{parentName:"p",href:"https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.html"},"Global Secondary Index")," is also required to efficiently retrieve the event store aggregates ids (",(0,r.kt)("inlineCode",{parentName:"p"},"listAggregateIds")," operation). Only initial events (",(0,r.kt)("inlineCode",{parentName:"p"},"version = 1"),") are projected. A ",(0,r.kt)("inlineCode",{parentName:"p"},"KEYS_ONLY")," projection type is sufficient."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},'// \ud83d\udc47 Initial event\n{\n  "aggregateId": "POKEMONS#123", // <= Partition key\n  "version": 1, // <= Sort key\n  "eventStoreId": "POKEMONS", // <= initialEvents index partition key\n  "timestamp": "2022-01-01T00:00:00.000Z", // <= initialEvents index sort key\n  "type": "POKEMON_APPEARED",\n  "payload": { "name": "Pikachu", "level": 42 },\n  "metadata": { "trigger": "random" }\n}\n\n// \ud83d\udc47 Non-initial event\n{\n  "aggregateId": "POKEMONS#123",\n  "version": 2,\n  // Event is not projected on initialEvents index (to limit costs)\n  "timestamp": "2023-01-01T00:00:00.000Z",\n  "type": "POKEMON_LEVELED_UP"\n}\n')),(0,r.kt)("p",null,"The ",(0,r.kt)("inlineCode",{parentName:"p"},"getEvents")," method (which is used by the ",(0,r.kt)("inlineCode",{parentName:"p"},"getAggregate")," and ",(0,r.kt)("inlineCode",{parentName:"p"},"getExistingAggregate")," methods of the ",(0,r.kt)("inlineCode",{parentName:"p"},"EventStore")," class) uses consistent reads, so is ",(0,r.kt)("strong",{parentName:"p"},"always consistent"),"."),(0,r.kt)("p",null,"The ",(0,r.kt)("inlineCode",{parentName:"p"},"pushEvent")," method is a write operation and so is ",(0,r.kt)("strong",{parentName:"p"},"always consistent"),". It is conditioned to avoid race conditions, as required by the ",(0,r.kt)("a",{parentName:"p",href:"https://github.com/castore-dev/castore/blob/main/docs/building-your-own-event-storage-adapter.md"},"Castore specifications"),"."),(0,r.kt)("p",null,"By design, the ",(0,r.kt)("inlineCode",{parentName:"p"},"listAggregateIds")," operation can only be ",(0,r.kt)("strong",{parentName:"p"},"eventually consistent")," (GSIs reads cannot be consistent)."),(0,r.kt)("h3",{id:"-examples"},"\ud83d\udcdd Examples"),(0,r.kt)("p",null,"Note that if you define your infrastructure as code in TypeScript, you can directly use this package instead of hard-coding the below values:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"import {\n  EVENT_TABLE_PK, // => aggregateId\n  EVENT_TABLE_SK, // => version\n  EVENT_TABLE_INITIAL_EVENT_INDEX_NAME, // => initialEvents\n  EVENT_TABLE_EVENT_STORE_ID_KEY, // => eventStoreId\n  EVENT_TABLE_TIMESTAMP_KEY, // => timestamp\n} from '@castore/dynamodb-event-storage-adapter';\n")),(0,r.kt)("h4",{id:"cloudformation"},"CloudFormation"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "Type": "AWS::DynamoDB::Table",\n  "Properties": {\n    "AttributeDefinitions": [\n      { "AttributeName": "aggregateId", "AttributeType": "S" },\n      { "AttributeName": "version", "AttributeType": "N" }\n      { "AttributeName": "eventStoreId", "AttributeType": "S" },\n      { "AttributeName": "timestamp", "AttributeType": "S" }\n    ],\n    "KeySchema": [\n      { "AttributeName": "aggregateId", "KeyType": "HASH" },\n      { "AttributeName": "version", "KeyType": "RANGE" }\n    ],\n    "GlobalSecondaryIndexes": [\n      {\n        "IndexName": "initialEvents",\n        "KeySchema": [\n          { "AttributeName": "eventStoreId", "KeyType": "HASH" },\n          { "AttributeName": "timestamp", "KeyType": "RANGE" }\n        ],\n        "Projection": "KEYS_ONLY"\n      }\n    ]\n  }\n}\n')),(0,r.kt)("h4",{id:"cdk"},"CDK"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"import { Table, AttributeType, ProjectionType } from 'aws-cdk-lib/aws-dynamodb';\n\nconst { STRING, NUMBER } = AttributeType;\nconst { KEYS_ONLY } = ProjectionType;\n\nconst pokemonsEventsTable = new Table(scope, 'PokemonEvents', {\n  partitionKey: {\n    name: 'aggregateId',\n    type: STRING,\n  },\n  sortKey: {\n    name: 'version',\n    type: NUMBER,\n  },\n});\n\npokemonsEventsTable.addGlobalSecondaryIndex({\n  indexName: 'initialEvents',\n  partitionKey: {\n    name: 'eventStoreId',\n    type: STRING,\n  },\n  sortKey: {\n    name: 'timestamp',\n    type: STRING,\n  },\n  projectionType: KEYS_ONLY,\n});\n")),(0,r.kt)("h4",{id:"terraform"},"Terraform"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-h"},'resource "aws_dynamodb_table" "pokemons-events-table" {\n  hash_key       = "aggregateId"\n  range_key      = "version"\n\n  attribute {\n    name = "aggregateId"\n    type = "S"\n  }\n\n  attribute {\n    name = "version"\n    type = "N"\n  }\n\n  attribute {\n    name = "eventStoreId"\n    type = "S"\n  }\n\n  attribute {\n    name = "timestamp"\n    type = "S"\n  }\n\n  global_secondary_index {\n    name               = "initialEvents"\n    hash_key           = "eventStoreId"\n    range_key          = "timestamp"\n    projection_type    = "KEYS_ONLY"\n  }\n}\n')),(0,r.kt)("h3",{id:"-eventgroups"},"\ud83e\udd1d EventGroups"),(0,r.kt)("p",null,"This adapter implements the ",(0,r.kt)("a",{parentName:"p",href:"https://github.com/castore-dev/castore/#event-groups"},"EventGroups")," API using the ",(0,r.kt)("a",{parentName:"p",href:"https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis.html"},"DynamoDb Transactions API"),":"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"import { EventStore } from '@castore/core';\n\n// \ud83d\udc47 TransactWriteItems N events simultaneously\nawait EventStore.pushEventGroup(\n  // events are correctly typed \ud83d\ude4c\n  eventStoreA.groupEvent(eventA1),\n  eventStoreA.groupEvent(eventA2),\n  eventStoreB.groupEvent(eventB),\n  ...\n);\n")),(0,r.kt)("p",null,"Note that:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"All the event stores involved in the transaction need to use the ",(0,r.kt)("inlineCode",{parentName:"li"},"DynamoDbSingleTableEventStorageAdapter")),(0,r.kt)("li",{parentName:"ul"},"This util inherits of the ",(0,r.kt)("a",{parentName:"li",href:"https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis.html#transaction-apis-txwriteitems"},(0,r.kt)("inlineCode",{parentName:"a"},"TransactWriteItem")," API")," limitations: It can target up to 100 distinct events in one or more DynamoDB tables within the same AWS account and in the same Region.")),(0,r.kt)("h3",{id:"-iam"},"\ud83d\udd11 IAM"),(0,r.kt)("p",null,"Required IAM permissions for each operations:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"getEvents")," (+ ",(0,r.kt)("inlineCode",{parentName:"li"},"getAggregate"),", ",(0,r.kt)("inlineCode",{parentName:"li"},"getExistingAggregate"),"): ",(0,r.kt)("inlineCode",{parentName:"li"},"dynamodb:Query")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"pushEvent"),": ",(0,r.kt)("inlineCode",{parentName:"li"},"dynamodb:PutItem")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"listAggregateIds"),": ",(0,r.kt)("inlineCode",{parentName:"li"},"dynamodb:Query")," on the ",(0,r.kt)("inlineCode",{parentName:"li"},"initialEvents")," index")),(0,r.kt)("h3",{id:"-imageparser"},"\ud83d\udcf8 ",(0,r.kt)("inlineCode",{parentName:"h3"},"ImageParser")),(0,r.kt)("p",null,"This library also exposes a useful ",(0,r.kt)("inlineCode",{parentName:"p"},"ImageParser")," class to parse ",(0,r.kt)("a",{parentName:"p",href:"https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.html"},"DynamoDB stream")," images from a ",(0,r.kt)("inlineCode",{parentName:"p"},"DynamoDbSingleTableEventStorageAdapter"),". It will build a correctly typed ",(0,r.kt)("inlineCode",{parentName:"p"},"NotificationMessage")," ouf of a stream image, unmarshalling it, removing the prefix of the ",(0,r.kt)("inlineCode",{parentName:"p"},"aggregateId")," in the process and validating the ",(0,r.kt)("inlineCode",{parentName:"p"},"eventStoreId"),":"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"import { ImageParser } from '@castore/dynamodb-event-storage-adapter';\n\nconst imageParser = new ImageParser({\n  sourceEventStores: [pokemonsEventStore, trainersEventStore],\n});\n\n// \ud83d\ude4c Typed as EventStoreNotificationMessage<\n//  typeof pokemonsEventStore\n//  | typeof trainersEventStore...\n// >\nconst notificationMessage = imageParser.parseImage(\n  streamImage,\n  // \ud83d\udc47 Optional options\n  unmarshallOptions,\n);\n")),(0,r.kt)("h2",{id:"legacy-dynamodbeventstorageadapter"},"Legacy ",(0,r.kt)("inlineCode",{parentName:"h2"},"DynamoDbEventStorageAdapter")),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("b",null,"\ud83d\udd27 Documentation")),(0,r.kt)("h3",{id:"-usage-1"},"\ud83d\udc69\u200d\ud83d\udcbb Usage"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"import { DynamoDBClient } from '@aws-sdk/client-dynamodb';\n\nimport { DynamoDbEventStorageAdapter } from '@castore/dynamodb-event-storage-adapter';\n\nconst dynamoDbClient = new DynamoDBClient({});\n\nconst pokemonsEventsStorageAdapter = new DynamoDbEventStorageAdapter({\n  tableName: 'my-table-name',\n  dynamoDbClient,\n});\n\n// \ud83d\udc47 Alternatively, provide a getter\nconst pokemonsEventsStorageAdapter = new DynamoDbEventStorageAdapter({\n  tableName: () => process.env.MY_TABLE_NAME,\n  dynamoDbClient,\n});\n\nconst pokemonsEventStore = new EventStore({\n  ...\n  storageAdapter: pokemonsEventsStorageAdapter\n})\n")),(0,r.kt)("p",null,"This will directly plug your EventStore to DynamoDB \ud83d\ude4c"),(0,r.kt)("h3",{id:"-how-it-works-1"},"\ud83e\udd14 How it works"),(0,r.kt)("p",null,"This adapter persists aggregates in ",(0,r.kt)("strong",{parentName:"p"},"separate partitions"),": When persisting an event, its ",(0,r.kt)("inlineCode",{parentName:"p"},"aggregateId")," is used as partition key (",(0,r.kt)("em",{parentName:"p"},"string")," attribute) and its ",(0,r.kt)("inlineCode",{parentName:"p"},"version")," is used as sort key (",(0,r.kt)("em",{parentName:"p"},"number")," attribute)."),(0,r.kt)("p",null,"A ",(0,r.kt)("a",{parentName:"p",href:"https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.html"},"Global Secondary Index")," is also required to efficiently retrieve the event store aggregates ids (",(0,r.kt)("inlineCode",{parentName:"p"},"listAggregateIds")," operation). Only initial events (",(0,r.kt)("inlineCode",{parentName:"p"},"version = 1"),") are projected. A ",(0,r.kt)("inlineCode",{parentName:"p"},"KEYS_ONLY")," projection type is sufficient."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},'// \ud83d\udc47 Initial event\n{\n  "aggregateId": "123", // <= Partition key\n  "version": 1, // <= Sort key\n  "isInitialEvent": 1, // <= initialEvents index partition key\n  "timestamp": "2022-01-01T00:00:00.000Z", // <= initialEvents index sort key\n  "type": "POKEMON_APPEARED",\n  "payload": { "name": "Pikachu", "level": 42 },\n  "metadata": { "trigger": "random" }\n}\n\n// \ud83d\udc47 Non-initial event\n{\n  "aggregateId": "123",\n  "version": 2,\n  // Event is not projected on initialEvents index (to limit costs)\n  "timestamp": "2023-01-01T00:00:00.000Z",\n  "type": "POKEMON_LEVELED_UP"\n}\n')),(0,r.kt)("p",null,"The ",(0,r.kt)("inlineCode",{parentName:"p"},"getEvents")," method (which is used by the ",(0,r.kt)("inlineCode",{parentName:"p"},"getAggregate")," and ",(0,r.kt)("inlineCode",{parentName:"p"},"getExistingAggregate")," methods of the ",(0,r.kt)("inlineCode",{parentName:"p"},"EventStore")," class) uses consistent reads, so is ",(0,r.kt)("strong",{parentName:"p"},"always consistent"),"."),(0,r.kt)("p",null,"The ",(0,r.kt)("inlineCode",{parentName:"p"},"pushEvent")," method is a write operation and so is ",(0,r.kt)("strong",{parentName:"p"},"always consistent"),". It is conditioned to avoid race conditions, as required by the ",(0,r.kt)("a",{parentName:"p",href:"https://github.com/castore-dev/castore/blob/main/docs/building-your-own-event-storage-adapter.md"},"Castore specifications"),"."),(0,r.kt)("p",null,"By design, the ",(0,r.kt)("inlineCode",{parentName:"p"},"listAggregateIds")," operation can only be ",(0,r.kt)("strong",{parentName:"p"},"eventually consistent")," (GSIs reads cannot be consistent)."),(0,r.kt)("h3",{id:"-examples-1"},"\ud83d\udcdd Examples"),(0,r.kt)("p",null,"Note that if you define your infrastructure as code in TypeScript, you can directly use this package instead of hard-coding the below values:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"import {\n  EVENT_TABLE_PK, // => aggregateId\n  EVENT_TABLE_SK, // => version\n  EVENT_TABLE_INITIAL_EVENT_INDEX_NAME, // => initialEvents\n  EVENT_TABLE_IS_INITIAL_EVENT_KEY, // => isInitialEvent\n  EVENT_TABLE_TIMESTAMP_KEY, // => timestamp\n} from '@castore/dynamodb-event-storage-adapter';\n")),(0,r.kt)("h4",{id:"cloudformation-1"},"CloudFormation"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "Type": "AWS::DynamoDB::Table",\n  "Properties": {\n    "AttributeDefinitions": [\n      { "AttributeName": "aggregateId", "AttributeType": "S" },\n      { "AttributeName": "version", "AttributeType": "N" }\n      { "AttributeName": "isInitialEvent", "AttributeType": "N" },\n      { "AttributeName": "timestamp", "AttributeType": "S" }\n    ],\n    "KeySchema": [\n      { "AttributeName": "aggregateId", "KeyType": "HASH" },\n      { "AttributeName": "version", "KeyType": "RANGE" }\n    ],\n    "GlobalSecondaryIndexes": [\n      {\n        "IndexName": "initialEvents",\n        "KeySchema": [\n          { "AttributeName": "isInitialEvent", "KeyType": "HASH" },\n          { "AttributeName": "timestamp", "KeyType": "RANGE" }\n        ],\n        "Projection": "KEYS_ONLY"\n      }\n    ]\n  }\n}\n')),(0,r.kt)("h4",{id:"cdk-1"},"CDK"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"import { Table, AttributeType, ProjectionType } from 'aws-cdk-lib/aws-dynamodb';\n\nconst { STRING, NUMBER } = AttributeType;\nconst { KEYS_ONLY } = ProjectionType;\n\nconst pokemonsEventsTable = new Table(scope, 'PokemonEvents', {\n  partitionKey: {\n    name: 'aggregateId',\n    type: STRING,\n  },\n  sortKey: {\n    name: 'version',\n    type: NUMBER,\n  },\n});\n\npokemonsEventsTable.addGlobalSecondaryIndex({\n  indexName: 'initialEvents',\n  partitionKey: {\n    name: 'isInitialEvent',\n    type: NUMBER,\n  },\n  sortKey: {\n    name: 'timestamp',\n    type: STRING,\n  },\n  projectionType: KEYS_ONLY,\n});\n")),(0,r.kt)("h4",{id:"terraform-1"},"Terraform"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-h"},'resource "aws_dynamodb_table" "pokemons-events-table" {\n  hash_key       = "aggregateId"\n  range_key      = "version"\n\n  attribute {\n    name = "aggregateId"\n    type = "S"\n  }\n\n  attribute {\n    name = "version"\n    type = "N"\n  }\n\n  attribute {\n    name = "isInitialEvent"\n    type = "N"\n  }\n\n  attribute {\n    name = "timestamp"\n    type = "S"\n  }\n\n  global_secondary_index {\n    name               = "initialEvents"\n    hash_key           = "isInitialEvent"\n    range_key          = "timestamp"\n    projection_type    = "KEYS_ONLY"\n  }\n}\n')),(0,r.kt)("h3",{id:"-eventgroups-1"},"\ud83e\udd1d EventGroups"),(0,r.kt)("p",null,"This adapter implements the ",(0,r.kt)("a",{parentName:"p",href:"https://github.com/castore-dev/castore/#event-groups"},"EventGroups")," API using the ",(0,r.kt)("a",{parentName:"p",href:"https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis.html"},"DynamoDb Transactions API"),":"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"import { EventStore } from '@castore/core';\n\n// \ud83d\udc47 TransactWriteItems N events simultaneously\nawait EventStore.pushEventGroup(\n  // events are correctly typed \ud83d\ude4c\n  eventStoreA.groupEvent(eventA1),\n  eventStoreA.groupEvent(eventA2),\n  eventStoreB.groupEvent(eventB),\n  ...\n);\n")),(0,r.kt)("p",null,"Note that:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"All the event stores involved in the transaction need to use the ",(0,r.kt)("inlineCode",{parentName:"li"},"DynamoDbEventStorageAdapter")),(0,r.kt)("li",{parentName:"ul"},"This util inherits of the ",(0,r.kt)("a",{parentName:"li",href:"https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis.html#transaction-apis-txwriteitems"},(0,r.kt)("inlineCode",{parentName:"a"},"TransactWriteItem")," API")," limitations: It can target up to 100 distinct events in one or more DynamoDB tables within the same AWS account and in the same Region.")),(0,r.kt)("h3",{id:"-iam-1"},"\ud83d\udd11 IAM"),(0,r.kt)("p",null,"Required IAM permissions for each operations:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"getEvents")," (+ ",(0,r.kt)("inlineCode",{parentName:"li"},"getAggregate"),", ",(0,r.kt)("inlineCode",{parentName:"li"},"getExistingAggregate"),"): ",(0,r.kt)("inlineCode",{parentName:"li"},"dynamodb:Query")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"pushEvent"),": ",(0,r.kt)("inlineCode",{parentName:"li"},"dynamodb:PutItem")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"listAggregateIds"),": ",(0,r.kt)("inlineCode",{parentName:"li"},"dynamodb:Query")," on the ",(0,r.kt)("inlineCode",{parentName:"li"},"initialEvents")," index"))))}u.isMDXComponent=!0},30876:(e,t,n)=>{n.d(t,{Zo:()=>m,kt:()=>g});var a=n(2784);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},o=Object.keys(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var l=a.createContext({}),p=function(e){var t=a.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},m=function(e){var t=p(e.components);return a.createElement(l.Provider,{value:t},e.children)},d="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},c=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,o=e.originalType,l=e.parentName,m=s(e,["components","mdxType","originalType","parentName"]),d=p(n),c=r,g=d["".concat(l,".").concat(c)]||d[c]||u[c]||o;return n?a.createElement(g,i(i({ref:t},m),{},{components:n})):a.createElement(g,i({ref:t},m))}));function g(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=n.length,i=new Array(o);i[0]=c;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s[d]="string"==typeof e?e:r,i[1]=s;for(var p=2;p<o;p++)i[p]=n[p];return a.createElement.apply(null,i)}return a.createElement.apply(null,n)}c.displayName="MDXCreateElement"}}]);