import parseJsonWithStatus, { LineStatus } from './parseJsonWithStatus';
import { Status } from './status';

const data = `{
    "$kind": "Microsoft.AdaptiveDialog",
    "triggers": [
      {
        "$kind": "Microsoft.OnConversationUpdateActivity",
        "actions": [
          {
            "$kind": "Microsoft.TraceActivity",
            "name": "calendarSkill.Greeting"
          },
          {
            "$kind": "Microsoft.IfCondition",
            "condition": "= turn.activity.channelId == 'msteams' && turn.activity.conversation.conversationType!='personal'",
            "elseActions": [
              {
                "$kind": "Microsoft.BeginDialog",
                "activityProcessed": true,
                "dialog": "AuthenticationDialog"
              }
            ],
            "actions": [
              {
                "$kind": "Microsoft.SendActivity",
                "activity": "good"
              }
            ]
          }
        ]
      }
    ],
    "$schema": "https://raw.githubusercontent.com/microsoft/BotFramework-Composer/stable/Composer/packages/server/schemas/sdk.schema",
    "generator": "calendarskill.lg",
    "recognizer": "calendarskill.lu.qna",
    "id": "calendarskill"
  }
`;

const linesAll: LineStatus[] = [
    { status: Status.Both, line: 7 },
    { status: Status.Addition, line: 14 },
    { status: Status.Deletion, line: 24 },
];

test('test all status', () => {
    const result = parseJsonWithStatus(data, linesAll);
    expect(result.triggers[0].actions[0].gitStatus).toEqual(Status.Both);
    expect(result.triggers[0].actions[1].elseActions[0].gitStatus).toEqual(Status.Addition);
    expect(result.triggers[0].actions[1].actions[0].gitStatus).toEqual(Status.Deletion);
});

const linesMerge: LineStatus[] = [
    { status: Status.Addition, line: 10 },
    { status: Status.Deletion, line: 26 },
];

test('test merge status', () => {
    const result = parseJsonWithStatus(data, linesMerge);
    expect(result.triggers[0].actions[1].gitStatus).toEqual(Status.Both);
});
