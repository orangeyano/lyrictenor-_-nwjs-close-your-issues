'use strict';

import { Store } from 'flummox';
import { Map, Record } from 'immutable';
import githubSlug from 'myUtils/githubSlug';
import trimWidth from 'myUtils/trimWidth';

/* eslint-disable camelcase */
const IssueRecord = Record({
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
  user: Record({
    id: null,
    login: null,
    avatar_url: null
  }),
  slug: "",
  card_icon_class: ""
});
/* eslint-enable camelcase */

const issueDecorator = (issue) => {
  let copied = Object.assign({}, issue);
  /* eslint-disable camelcase */
  copied.slug = githubSlug(copied.html_url);
  copied.body_text_short = trimWidth(copied.body_text, 100);
  copied.card_icon_class = "octicon octicon-issue-opened";
  /* eslint-enable camelcase */
  return copied;
};

export class IssueStore extends Store {

  constructor(flux) {
    super();

    this.state = { issues: Map() };

    /*
     Registering action handlers
     */

    const issueActionIds = flux.getActionIds('issues');

    this.register(issueActionIds.createIssue, this.createIssue);
    this.register(issueActionIds.fetchIssues, this.fetchIssues);
    this.register(issueActionIds.clearIssues, this.clearIssues);
    this.register(issueActionIds.deleteIssue, this.deleteIssue);
  }
  createIssue(data) {
    const newMap = this.state.issues.set(data.id, new IssueRecord(issueDecorator(data)));
    this.setState({ issues: newMap });
  }
  fetchIssues(issues) {
    let issuesMap = Map();
    for(let issue of issues) {
      issuesMap = issuesMap.set(issue.id, new IssueRecord(issueDecorator(issue)));
    }

    this.setState({ issues: this.state.issues.merge(issuesMap) });
  }
  clearIssues() {
    this.setState({ issues: this.state.issues.clear() });
  }
  deleteIssue(issue) {
    let issues = this.state.issues.delete(issue.get('id'));
    if(issues !== this.state.issues) {
      this.setState({ issues: issues });
    }
  }


  getIssues() {
    return this.state.issues;
  }
}
