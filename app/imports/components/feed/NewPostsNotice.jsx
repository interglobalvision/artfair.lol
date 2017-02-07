import React, { Component } from 'react';

export class NewPostsNotice extends Component {
  constructor(props) {
    super(props);

    this.resetFeedTimestamp = this.resetFeedTimestamp.bind(this);
  }

  resetFeedTimestamp() {
    Session.set('feedTimestamp', new Date());
  }

  render() {
    if (!this.props.newPosts) {
      return null;
    }

    return (
      <div id='new-posts-notice' className="grid-row align-items-center">
        <div className="grid-item item-s-12 text-align-center">
          <a onClick={this.resetFeedTimestamp}>View {this.props.newPosts} new post{this.props.newPosts > 1 ? 's' : ''}</a>
        </div>
      </div>
    );
  }
};
