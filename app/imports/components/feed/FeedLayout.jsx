import React, { Component } from 'react';

import { FeedPost } from '/imports/components/posts/FeedPost.jsx';

import { NewPostsNotice } from '/imports/components/feed/NewPostsNotice.jsx';

export class FeedLayout extends Component {
  constructor(props) {
    super(props);

    this.handleScroll = this.handleScroll.bind(this);
  }

  componentWillMount() {
    Session.set('pagination', 1);

    this.bindScroll();
  }

  componentWillUnmount() {
    this.unbindScroll();
  }

  bindScroll() {
    window.addEventListener("scroll", this.handleScroll);
  }

  unbindScroll() {
    window.removeEventListener("scroll", this.handleScroll);
  }

  handleScroll(event) {
    if (document.body.scrollTop + window.innerHeight === document.getElementById('main-container').clientHeight) {
      if(this.props.morePosts) {
        setTimeout( () => {
          let pagination = Session.get('pagination') || 1;
          Session.set('pagination', pagination + 1);
        }, 600);
      } else {
        this.unbindScroll();
      }
    }
  }


  render() {

    if (this.props.posts) {
      return (
        <section id='feed'>
          {this.props.notifyNewPosts &&
            <NewPostsNotice newPosts={this.props.newPosts} />
          }
          <div className='feed-posts'>
            {this.props.posts.map((post, key) => (
              <FeedPost post={post} key={key} />
            ))}
          </div>

          {this.props.morePosts &&
            <div id='feed-pagination' className='text-align-center padding-top-small padding-bottom-small'>
              <img src="/icons/spinner.svg" id="spinner" className="icon spin" />
            </div>
          }
        </section>
      )
    } else {
      return (
        <section id='feed'>
          <div className='feed-posts'>
            <h1>Nothing yet! Post some</h1>
          </div>
        </section>
      )
    }
  }

}
