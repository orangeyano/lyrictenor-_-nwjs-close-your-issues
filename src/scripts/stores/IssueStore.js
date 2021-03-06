"use strict";

import { Store } from "flummox";
import { Map as map, Record as record, OrderedMap as orderedMap } from "immutable";
import githubSlug from "myUtils/githubSlug";
import trimWidth from "myUtils/trimWidth";
import cx from "classnames";

/* eslint-disable camelcase */
const issueRecord = record({
  id: null,
  url: null,
  html_url: null,
  number: 0,
  title: "",
  labels: [],
  state: null,
  locked: null,
  assignee: null,
  milestone: null,
  comments: 0,
  created_at: null,
  updated_at: null,
  closed_at: null,
  body_text: "",
  body_text_short: "",
  user: record({
    id: null,
    login: null,
    avatar_url: null
  }),
  slug: "",
  card_icon_class: "",
  comment_class: "",
  button_snooze: false,
  button_delete_branch: false,
  button_restore_branch: false,
  button_close_issue: false,
  button_reopen_issue: false,
  button_merge_pull_request: false,
  pull_request: record({
    url: null,
    html_url: null
  }),
  repository: record({
    id: null
  })
});
/* eslint-enable camelcase */

const isPullRequest = (issue) => {
  if (typeof issue.pull_request === "undefined" || issue.pull_request === null || Object.keys(issue.pull_request).length === 0) {
    return false;
  }
  return issue.pull_request.url && issue.pull_request.html_url;
};
const isClosed = (issue) => {
  return issue.state === "closed";
};

const switchCardIconClass = (issue) => {
  return cx(
    "octicon",
    { "octicon-issue-opened": !isPullRequest(issue) && !isClosed(issue) },
    { "octicon-issue-closed": !isPullRequest(issue) && isClosed(issue) },
    { "octicon-issue-reopened": false },
    { "octicon-git-pull-request": isPullRequest(issue) },
    { "open": !isClosed(issue) },
    { "merged": false },
    { "closed": isClosed(issue) },
    { "reverted": false },
  );
};

const switchCommentClass = (issue) => {
  return cx(
    "comments",
    { "issue-comments-no-comment": issue.comments === 0 },
  );
};

const issueDecorator = (issue, loggedIn = true) => {
  let copied = Object.assign({}, issue);
  /* eslint-disable camelcase */
  copied.slug = githubSlug(copied.html_url);
  copied.body_text_short = trimWidth(copied.body_text, 100);
  copied.card_icon_class = switchCardIconClass(copied);
  copied.comment_class = switchCommentClass(copied);
  copied.button_snooze = true;
  copied.created_at = (issue.created_at instanceof Date) ? issue.created_at.toUTCString() : issue.created_at;
  copied.updated_at = (issue.updated_at instanceof Date) ? issue.updated_at.toUTCString() : issue.updated_at;
  copied.closed_at = (issue.closed_at instanceof Date) ? issue.closed_at.toUTCString() : issue.closed_at;
  copied.button_close_issue = loggedIn && !isClosed(copied);
  copied.button_reopen_issue = loggedIn && isClosed(copied);
  copied.button_delete_branch = loggedIn && isPullRequest(copied) && isClosed(copied);
  copied.button_restore_branch = loggedIn && isPullRequest(copied) && isClosed(copied);
  copied.button_merge_pull_request = loggedIn && isPullRequest(copied) && !isClosed(copied);
  /* eslint-enable camelcase */
  return copied;
};

export default class IssueStore extends Store {

  constructor(flux) {
    super();

    this.flux = flux;
    this.state = { issues: orderedMap() };

    /*
     Registering action handlers
     */

    const issueActionIds = flux.getActionIds("issues");

    this.register(issueActionIds.fetchIssues, this.updateMultipleData);
    this.register(issueActionIds.clearIssues, this.clearData);
    this.register(issueActionIds.deleteIssue, this.deleteDatum);
    this.register(issueActionIds.toggleIssueState, this.updateSingleDatumWithoutSort);
    this.register(issueActionIds.mergePullRequest, this.updateSingleDatumWithoutSort);
    this.register(issueActionIds.deleteIssueBranch, this.updateSingleDatumWithoutSort);
  }
  updateMultipleData(data) {
    let dataMap = orderedMap();
    for(let datum of data) {
      dataMap = dataMap.set(datum.id, issueRecord(issueDecorator(datum, this.flux.loggedIn())));
    }

    this.setState({ issues: this.state.issues.merge(dataMap) });
  }
  clearData() {
    this.setState({ issues: this.state.issues.clear() });
  }
  deleteDatum(datum) {
    let data = this.state.issues.delete(datum.get("id"));
    if(data !== this.state.issues) {
      this.setState({ issues: data });
    }
  }
  updateSingleDatum(datum) {
    this.updateMultipleData([datum]);
  }
  updateSingleDatumWithoutSort(datum) {
    let dataMap = orderedMap();
    dataMap = dataMap.set(datum.id, issueRecord(issueDecorator(datum, this.flux.loggedIn())));
    this.setState({ issues: this.state.issues.merge(dataMap) });
  }
  getData() {
    return this.state.issues;
  }
}
