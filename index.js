const core = require('@actions/core');
const github = require('@actions/github');

const { WebClient } = require('@slack/web-api');

const token = process.env.SLACK_BOT_TOKEN;
const web = new WebClient(token);
const conversationId = process.env.CHANNEL_ID;

async function postMessage(text, blocks) {
  const res = await web.chat.postMessage(
    {
      channel: conversationId,
      text: text,
      blocks: blocks
    }
  );

  // `res` contains information about the posted message
  console.log('Message sent: ', res.ts);
}


function buildBlocks(users, message, issue) {
  return (
    [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `${users.join(' ')} ${message}`
        }
      },
      {
        "type": "divider"
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `Issue: <${ issue.html_url }|${ issue.title }> :star:`
        }
      }
    ]
  )
}

try {
  const userListPath = core.getInput('user-list-path');
  const text = core.getInput('text');
  const blockMessage = core.getInput('block-message');
  const userList = require(userListPath);

  const payload = github.context.payload
  const issue = payload.issue || payload.pull_request
  const users = issue.assignees.map((assignee) => userList[assignee.login]);
  const blocks = buildBlocks(users, blockMessage, issue);

  postMessage(text, blocks);
} catch (error) {
  core.setFailed(error.message);
}
